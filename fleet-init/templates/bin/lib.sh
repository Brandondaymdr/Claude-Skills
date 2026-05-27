#!/bin/bash
# Fleet shared utilities — sourced by dispatcher.sh and validator.sh
# Usage: source "$(dirname "$0")/lib.sh"

set -euo pipefail

# Resolve repo root (lib.sh is at .fleet/bin/lib.sh)
FLEET_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "$FLEET_DIR/.." && pwd)"
QUEUE_FILE="$FLEET_DIR/BUILD_QUEUE.md"
KILL_SWITCH="$FLEET_DIR/KILL_SWITCH"
LOG_DIR="$FLEET_DIR/logs"
METRICS_FILE="$LOG_DIR/METRICS.md"
GRAVEYARD_FILE="$LOG_DIR/GRAVEYARD.md"

mkdir -p "$LOG_DIR"

# ---------- Kill switch ----------

check_kill_switch() {
  if [ -f "$KILL_SWITCH" ]; then
    log "KILL_SWITCH present — aborting"
    exit 0
  fi
}

# ---------- Logging ----------

log() {
  local timestamp
  timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo "[$timestamp] $*"
}

log_metric() {
  # Append a timestamped line to METRICS.md under today's heading
  local today
  today="$(date +"%Y-%m-%d")"
  if ! grep -q "^## $today" "$METRICS_FILE" 2>/dev/null; then
    echo -e "\n## $today\n" >>"$METRICS_FILE"
  fi
  echo "- $(date -u +%H:%M:%SZ): $*" >>"$METRICS_FILE"
}

# ---------- Config loading ----------

config_get() {
  # Read a top-level key from CONFIG.yaml. For nested keys use dot path.
  # Requires `yq` (mikefarah/yq).
  local key="$1"
  if command -v yq >/dev/null 2>&1; then
    yq ".$key" "$FLEET_DIR/CONFIG.yaml"
  else
    log "yq not installed — install with 'brew install yq'"
    exit 1
  fi
}

# ---------- Queue parsing ----------

# Returns the first slice ID with status `ready` whose dependencies are all `done`.
# Stdout: slice ID, or empty if none ready.
next_ready_slice() {
  awk -F'|' '
    /^\| {{SLICE_PREFIX}}-/ {
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", $2)
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", $4)
      gsub(/^[[:space:]]+|[[:space:]]+$/, "", $5)
      if ($4 == "ready") {
        # Print ID and depends-on; caller resolves
        print $2 "\t" $5
      }
    }
  ' "$QUEUE_FILE"
}

# Set the status of a slice in BUILD_QUEUE.md
# Args: $1 = slice ID, $2 = new status, $3 = optional PR URL
set_slice_status() {
  local slice_id="$1"
  local new_status="$2"
  local pr_url="${3:-}"
  local tmp
  tmp="$(mktemp)"
  awk -v id="$slice_id" -v status="$new_status" -v pr="$pr_url" '
    BEGIN { FS=OFS="|" }
    $0 ~ "^\\| " id " " {
      $4 = " " status " "
      if (pr != "") $6 = " " pr " "
    }
    { print }
  ' "$QUEUE_FILE" >"$tmp"
  mv "$tmp" "$QUEUE_FILE"
}

# ---------- Concurrency ----------

count_claimed_slices() {
  # grep -c always prints a number; the `|| true` swallows the non-zero exit
  # when there are no matches without printing a duplicate value.
  grep -c "^| {{SLICE_PREFIX}}-.*| claimed " "$QUEUE_FILE" 2>/dev/null || true
}

# ---------- Forbidden paths ----------

# Check if a list of paths includes any forbidden path. Returns 1 (true) if forbidden.
diff_touches_forbidden() {
  local diff_paths="$1"
  local forbidden
  forbidden="$(config_get 'forbidden_paths[]' 2>/dev/null || echo "")"
  while IFS= read -r path; do
    [ -z "$path" ] && continue
    if echo "$diff_paths" | grep -qE "^${path%/}(/|$)"; then
      return 0
    fi
  done <<<"$forbidden"
  return 1
}

# ---------- Graveyard ----------

graveyard_slice() {
  local slice_id="$1"
  local reason="$2"
  local details="${3:-}"
  {
    echo ""
    echo "## $slice_id — $(date -u +%Y-%m-%d)"
    echo ""
    echo "**Reason**: $reason"
    echo ""
    if [ -n "$details" ]; then
      echo "**Details**:"
      echo ""
      echo '```'
      echo "$details"
      echo '```'
    fi
  } >>"$GRAVEYARD_FILE"
  set_slice_status "$slice_id" "failed"
  log_metric "graveyard $slice_id — $reason"
}

# ---------- Git helpers ----------

git_clean_workdir() {
  cd "$REPO_ROOT"
  git fetch origin --quiet
  git checkout {{BASE_BRANCH}} --quiet
  git pull --ff-only origin {{BASE_BRANCH}} --quiet
}

# ---------- Token budget ----------

check_budget() {
  # Sum tokens-spent-this-cycle from METRICS.md, compare against hard_stop.
  # Implementation deferred — for pilot, monitor manually via provider dashboards.
  return 0
}
