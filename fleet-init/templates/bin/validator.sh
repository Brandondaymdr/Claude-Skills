#!/bin/bash
# Fleet validator — runs codex against open Fleet draft PRs that haven't been validated.
# Invoked by cron / LaunchAgent on the always-on host.
#
# Usage: cd {{WORKDIR}} && .fleet/bin/validator.sh

set -euo pipefail

# shellcheck source=lib.sh
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

cd "$REPO_ROOT"

log "=== validator run started ==="

check_kill_switch

# Find draft PRs from Fleet that don't yet have a validator comment
# (Comment marker: "## Fleet Validator Report" — see prompts/validator.md template)
prs_json="$(gh pr list \
  --search '[{{SLICE_PREFIX}}] in:title is:open is:draft' \
  --json number,title,headRefName,url,body \
  --jq '.[]')"

if [ -z "$prs_json" ]; then
  log "no open Fleet draft PRs"
  exit 0
fi

validator_cli="$(config_get 'models.validator.cli')"
validator_model="$(config_get 'models.validator.model')"

while read -r pr; do
  [ -z "$pr" ] && continue
  pr_number="$(echo "$pr" | jq -r '.number')"
  pr_title="$(echo "$pr" | jq -r '.title')"
  pr_branch="$(echo "$pr" | jq -r '.headRefName')"
  pr_url="$(echo "$pr" | jq -r '.url')"

  # Extract slice ID from title: "[{{SLICE_PREFIX}}] {{SLICE_PREFIX}}-NNNN: ..."
  slice_id="$(echo "$pr_title" | grep -oE '{{SLICE_PREFIX}}-[0-9]+' | head -1)"
  if [ -z "$slice_id" ]; then
    log "PR #$pr_number has no parseable slice ID — skipping"
    continue
  fi

  # Skip if already validated (check for our comment marker)
  existing_comments="$(gh pr view "$pr_number" --json comments --jq '.comments[].body' 2>/dev/null || echo "")"
  if echo "$existing_comments" | grep -q "## Fleet Validator Report"; then
    log "PR #$pr_number already validated — skipping"
    continue
  fi

  log "validating PR #$pr_number ($slice_id)"

  spec_file="$(ls "$FLEET_DIR/slices/$slice_id"*.md 2>/dev/null | head -1)"
  if [ -z "$spec_file" ]; then
    log "no spec file for $slice_id — skipping"
    continue
  fi

  # Get diff and CI status
  diff_text="$(gh pr diff "$pr_number" 2>/dev/null || echo "")"
  ci_status="$(gh pr checks "$pr_number" --json state --jq '.[].state' 2>/dev/null | sort -u | paste -sd ',' -)"

  # Build the user message for the validator
  user_msg="$(mktemp)"
  {
    echo "Validate PR #$pr_number ($pr_url) for slice $slice_id."
    echo ""
    echo "=== SLICE SPEC ==="
    cat "$spec_file"
    echo ""
    echo "=== END SLICE SPEC ==="
    echo ""
    echo "=== CI STATUS ==="
    echo "$ci_status"
    echo ""
    echo "=== PR DIFF ==="
    echo "$diff_text"
    echo "=== END DIFF ==="
    echo ""
    echo "Output: a comment in the format from your system prompt. After composing it, run:"
    echo "  gh pr comment $pr_number --body \"<your comment>\""
    echo "Then exit."
  } >"$user_msg"

  # Spawn validator via codex CLI (codex 0.128+)
  # Codex has no --system flag — combine system prompt + task into stdin.
  validator_out="$(mktemp)"
  validator_err="$(mktemp)"
  combined_prompt="$(mktemp)"
  {
    cat "$FLEET_DIR/prompts/validator.md"
    echo ""
    echo "=== VALIDATION TASK ==="
    echo ""
    cat "$user_msg"
  } >"$combined_prompt"

  # Build codex args. Skip --model if blank (uses CLI default).
  codex_args=(
    exec
    --sandbox workspace-write
    --dangerously-bypass-approvals-and-sandbox
    --cd "$REPO_ROOT"
    --color never
  )
  if [ -n "$validator_model" ] && [ "$validator_model" != "null" ] && [ "$validator_model" != '""' ]; then
    codex_args+=(--model "$validator_model")
  fi

  if "$validator_cli" "${codex_args[@]}" <"$combined_prompt" \
       >"$validator_out" 2>"$validator_err"; then
    log "validator finished for $slice_id"
    # Normalize HEAD before any state mutation. Codex is invoked with
    # workspace-write + bypass-approvals and can run arbitrary git commands;
    # in practice it sometimes checks out the PR's branch (e.g. via
    # `gh pr checkout`) to inspect files locally and forgets to switch back
    # before exit. Without this guard, set_slice_status writes
    # BUILD_QUEUE.md against the slice branch's index, the verdict commit
    # lands on the slice branch instead of {{BASE_BRANCH}}, and the row
    # stays stale on origin/{{BASE_BRANCH}} forever. Diagnosed in the
    # source-project pilot via reflog after a flagged PR silently kept
    # "in_review" on origin/{{BASE_BRANCH}}.
    current_branch="$(git rev-parse --abbrev-ref HEAD)"
    if [ "$current_branch" != "{{BASE_BRANCH}}" ]; then
      log "validator HEAD was on $current_branch — resetting and restoring to {{BASE_BRANCH}}"
      git reset --hard HEAD --quiet 2>/dev/null || true
      git checkout {{BASE_BRANCH}} --quiet
      git pull --ff-only origin {{BASE_BRANCH}} --quiet 2>/dev/null || true
    fi
  else
    exit_code=$?
    log "validator exited $exit_code for $slice_id"
    log_metric "validator-error $slice_id exit=$exit_code"
    continue
  fi

  # Determine verdict from the comment we just posted
  latest_comment="$(gh pr view "$pr_number" --json comments --jq '.comments[-1].body' 2>/dev/null || echo "")"
  verdict=""
  if echo "$latest_comment" | grep -q '\*\*Verdict\*\*: PASS'; then
    set_slice_status "$slice_id" "validated" "$pr_url"
    # Flip from draft to ready-for-review.
    # `gh pr ready` has no --quiet flag (it accepts only --undo); piping stdout
    # to /dev/null suppresses the success message instead. Capture stderr to a
    # tmpfile and surface it in the log on failure — the original
    # `--quiet 2>/dev/null` swallowed an "unknown flag: --quiet" exit 1
    # silently, surfacing only as a vague "could not mark PR ready" with no
    # clue why. Diagnosed during a second-project deployment (HDYW pilot day).
    gh_ready_err="$(mktemp)"
    if ! gh pr ready "$pr_number" >/dev/null 2>"$gh_ready_err"; then
      log "could not mark PR ready: $(cat "$gh_ready_err")"
    fi
    rm -f "$gh_ready_err"
    log_metric "validated $slice_id PASS"
    verdict="validated"
  elif echo "$latest_comment" | grep -q '\*\*Verdict\*\*: FLAGGED'; then
    set_slice_status "$slice_id" "flagged" "$pr_url"
    log_metric "validated $slice_id FLAGGED"
    verdict="flagged"
  else
    log "could not parse validator verdict for $slice_id"
    log_metric "validated $slice_id UNPARSEABLE"
  fi

  # Persist queue update so subsequent dispatcher/validator runs see the new state
  # immediately, instead of relying on cron-tick.sh's periodic-sync mop-up.
  if [ -n "$verdict" ] && ! git diff --quiet "$QUEUE_FILE" 2>/dev/null; then
    git add "$QUEUE_FILE"
    git commit -m "chore(fleet): $slice_id $verdict at $pr_url" --quiet || true
    # Retry on push failure: another actor (dispatcher, second validator run,
    # operator) may have advanced origin/{{BASE_BRANCH}} between our local
    # commit and our push. Fetch + rebase the tiny BUILD_QUEUE change onto the
    # moved-forward {{BASE_BRANCH}} and retry once. If still failing,
    # log_metric LOUDLY so the operator notices — silent failure here was the
    # root cause of BUILD_QUEUE drift in the pilot.
    if ! git push origin {{BASE_BRANCH}} --quiet 2>/dev/null; then
      log "push failed for $slice_id $verdict — attempting fetch + rebase + retry"
      if git pull --rebase --autostash origin {{BASE_BRANCH}} --quiet \
           && git push origin {{BASE_BRANCH}} --quiet 2>/dev/null; then
        log "push succeeded after rebase for $slice_id $verdict"
      else
        log_metric "validator-push-failed $slice_id $verdict — BUILD_QUEUE stale on origin"
        log "ERROR: could not push queue update for $slice_id $verdict — operator must reconcile"
      fi
    fi
  fi
done <<<"$(echo "$prs_json" | jq -c '.')"

log "=== validator run finished ==="
