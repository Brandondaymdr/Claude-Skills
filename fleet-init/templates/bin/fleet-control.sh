#!/bin/bash
# fleet-control.sh — operator helper to pause/resume Fleet LaunchAgents
#
# Usage:
#   .fleet/bin/fleet-control.sh pause    # unload agents (use before interactive git ops)
#   .fleet/bin/fleet-control.sh resume   # load agents (after interactive work is committed)
#   .fleet/bin/fleet-control.sh status   # show load state + last exit status
#
# Why this exists: LaunchAgents share the same clone as interactive shells, so
# cron-tick can race for the .git/index.lock with manual git operations.
# cron-tick.sh defers when the lock is fresh, but pause/resume is still the
# bulletproof workflow for multi-step interactive sessions like a closeout.

set -e

DISPATCHER_PLIST="$HOME/Library/LaunchAgents/com.{{ORG_TAG}}.fleet.{{SLICE_PREFIX}}.dispatcher.plist"
VALIDATOR_PLIST="$HOME/Library/LaunchAgents/com.{{ORG_TAG}}.fleet.{{SLICE_PREFIX}}.validator.plist"

cmd="${1:-status}"

case "$cmd" in
  pause)
    echo "Pausing Fleet LaunchAgents..."
    launchctl unload "$DISPATCHER_PLIST" 2>/dev/null || true
    launchctl unload "$VALIDATOR_PLIST" 2>/dev/null || true
    if launchctl list | grep -q "{{ORG_TAG}}.fleet.{{SLICE_PREFIX}}"; then
      echo "WARN: an agent is still listed after unload — check launchctl list" >&2
      exit 1
    fi
    echo "Paused. Resume with: $0 resume"
    ;;
  resume)
    echo "Resuming Fleet LaunchAgents..."
    launchctl load "$DISPATCHER_PLIST"
    launchctl load "$VALIDATOR_PLIST"
    sleep 1
    echo ""
    echo "Status:"
    launchctl list | grep "{{ORG_TAG}}.fleet.{{SLICE_PREFIX}}" || {
      echo "ERROR: no Fleet agents listed after load — something went wrong" >&2
      exit 1
    }
    ;;
  status)
    echo "Fleet LaunchAgent status:"
    if ! launchctl list | grep "{{ORG_TAG}}.fleet.{{SLICE_PREFIX}}"; then
      echo "(no Fleet agents currently loaded — Fleet is paused or never installed)"
    fi
    echo ""
    if [ -e .git/index.lock ]; then
      lock_age=$(($(date +%s) - $(stat -f %m .git/index.lock 2>/dev/null || echo 0)))
      echo "WARN: .git/index.lock present (${lock_age}s old)"
    else
      echo ".git/index.lock: not present"
    fi
    ;;
  *)
    echo "Usage: $0 {pause|resume|status}" >&2
    echo "" >&2
    echo "  pause  — unload Fleet LaunchAgents before interactive git ops" >&2
    echo "  resume — reload Fleet LaunchAgents after committing" >&2
    echo "  status — show load state and current .git/index.lock state" >&2
    exit 1
    ;;
esac
