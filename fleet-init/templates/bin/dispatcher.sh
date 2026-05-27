#!/bin/bash
# Fleet dispatcher — picks the next ready slice, spawns a builder, opens a draft PR.
# Invoked by cron / LaunchAgent on the always-on host.
#
# Usage: cd {{WORKDIR}} && .fleet/bin/dispatcher.sh

set -euo pipefail

# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

cd "$REPO_ROOT"

log "=== dispatcher run started ==="

check_kill_switch

# Concurrency check
max_concurrent="$(config_get 'limits.max_concurrent_slices')"
in_flight="$(count_claimed_slices)"
if [ "$in_flight" -ge "$max_concurrent" ]; then
  log "$in_flight slices in flight (max $max_concurrent) — skipping"
  exit 0
fi

# Pull latest {{BASE_BRANCH}}
git_clean_workdir

# Find next ready slice
next_line="$(next_ready_slice | head -1)"
if [ -z "$next_line" ]; then
  log "no ready slices in queue"
  exit 0
fi

slice_id="$(echo "$next_line" | cut -f1 | tr -d ' ')"
depends_on="$(echo "$next_line" | cut -f2 | tr -d ' ')"

# TODO: dependency resolution — for now, slices are mostly independent
log "claiming slice $slice_id"

# Verify spec file exists
spec_file="$(ls "$FLEET_DIR/slices/$slice_id"*.md 2>/dev/null | head -1)"
if [ -z "$spec_file" ]; then
  log "no spec file found for $slice_id — skipping"
  graveyard_slice "$slice_id" "missing spec file" "expected $FLEET_DIR/slices/$slice_id*.md"
  exit 1
fi

# Mark claimed
set_slice_status "$slice_id" "claimed"
git add "$QUEUE_FILE"
git commit -m "chore(fleet): claim $slice_id" --quiet || true
# Push the claim commit so origin/{{BASE_BRANCH}} has it BEFORE the slice branch
# is created. Without this, the slice branch inherits the claim commit (because
# it forks from local {{BASE_BRANCH}}), and the PR diff vs origin/{{BASE_BRANCH}}
# includes the BUILD_QUEUE.md `ready → claimed` change — which the validator's
# diff-scope check correctly FLAGs as a Rule 9 violation (`.fleet/*` in PR diff).
# The push must happen here, not at the end of the dispatcher run, or the
# builder will open the PR before origin/{{BASE_BRANCH}} catches up.
git push origin {{BASE_BRANCH}} --quiet || log "warning: could not push claim commit to {{BASE_BRANCH}}"

# Create branch
branch="{{BRANCH_PREFIX}}$slice_id"
git checkout -b "$branch" --quiet

# Build the user message: slice spec + key context pointers
user_msg="$(mktemp)"
{
  echo "You are implementing slice $slice_id. Read your system prompt, then implement strictly per the spec below. Run {{CHECK_CMD}} before opening the PR."
  echo ""
  echo "=== SLICE SPEC ==="
  cat "$spec_file"
  echo ""
  echo "=== END SLICE SPEC ==="
} >"$user_msg"

# Spawn builder via claude CLI (Claude Code 2.1+)
builder_cli="$(config_get 'models.builder.cli')"
builder_model="$(config_get 'models.builder.model')"
max_usd="$(config_get 'limits.max_usd_per_slice')"
timeout_min="$(config_get 'limits.max_runtime_minutes_per_slice')"

# Wall-clock cap is the second guardrail alongside --max-budget-usd. A runaway
# builder hits the budget cap eventually (~$5 ≈ 45-60 min of token churn), but
# without a wall-clock kill the dispatcher can sit blocked on a wedged slice for
# hours. `gtimeout` (GNU coreutils' `timeout`, BSD `timeout` doesn't ship on
# macOS) is required — fail loud if it's missing rather than silently dropping
# the cap.
if ! command -v gtimeout >/dev/null 2>&1; then
  log "ERROR: gtimeout not found. Install GNU coreutils: brew install coreutils"
  exit 2
fi
if ! [[ "$timeout_min" =~ ^[1-9][0-9]*$ ]]; then
  log "ERROR: limits.max_runtime_minutes_per_slice must be a positive integer (got: '$timeout_min')"
  exit 2
fi

log "spawning $builder_cli for $slice_id (model=$builder_model max_usd=\$$max_usd timeout=${timeout_min}m)"

builder_out="$(mktemp)"
builder_err="$(mktemp)"

# Build the claude args. Skip --model if blank.
claude_args=(
  --print
  --permission-mode bypassPermissions
  --append-system-prompt "$(cat "$FLEET_DIR/prompts/builder.md")"
  --max-budget-usd "$max_usd"
  --add-dir "$REPO_ROOT"
)
if [ -n "$builder_model" ] && [ "$builder_model" != "null" ]; then
  claude_args+=(--model "$builder_model")
fi

if gtimeout "${timeout_min}m" "$builder_cli" \
     "${claude_args[@]}" \
     "$(cat "$user_msg")" \
     >"$builder_out" 2>"$builder_err"; then
  log "builder finished cleanly"
else
  exit_code=$?
  # gtimeout exits 124 when it kills the process due to wall-clock timeout
  if [ "$exit_code" = "124" ]; then
    log "builder killed by wall-clock timeout (${timeout_min}m)"
    graveyard_slice "$slice_id" "wall-clock timeout ${timeout_min}m" "$(tail -50 "$builder_err")"
  else
    log "builder exited $exit_code"
    graveyard_slice "$slice_id" "builder exit $exit_code" "$(tail -50 "$builder_err")"
  fi
  git checkout {{BASE_BRANCH}} --quiet
  git branch -D "$branch" --quiet 2>/dev/null || true
  exit "$exit_code"
fi

# Verify the builder opened a PR (it does this itself per the prompt)
pr_url="$(gh pr list --head "$branch" --json url --jq '.[0].url' 2>/dev/null || echo "")"
if [ -z "$pr_url" ]; then
  log "no PR opened by builder — graveyarding"
  graveyard_slice "$slice_id" "builder did not open PR" "$(tail -50 "$builder_out")"
  git checkout {{BASE_BRANCH}} --quiet 2>/dev/null || true
  git branch -D "$branch" --quiet 2>/dev/null || true
  exit 1
fi

log "PR opened: $pr_url"
set_slice_status "$slice_id" "in_review" "$pr_url"
git checkout {{BASE_BRANCH}} --quiet
git add "$QUEUE_FILE"
git commit -m "chore(fleet): $slice_id in_review at $pr_url" --quiet || true
git push origin {{BASE_BRANCH}} --quiet || log "warning: could not push queue update to {{BASE_BRANCH}}"

log_metric "dispatched $slice_id → $pr_url"
log "=== dispatcher run finished ==="
