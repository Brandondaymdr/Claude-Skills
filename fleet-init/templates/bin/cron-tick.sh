#!/bin/bash
# Cron wrapper: handles state hygiene + PATH so cron / LaunchAgent can find
# brew binaries (yq, gh, claude, codex). The LaunchAgent invokes this with the
# real dispatcher/validator script as its argument.
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
cd "{{WORKDIR}}" || exit 1

# Defer this tick if an interactive shell or another git client is mid-operation.
# 60s freshness threshold means truly stale locks (from a crashed process) still get
# noticed and proceed instead of silently deferring forever.
# Pairs with the --ff-only sync change below.
if [ -e .git/index.lock ]; then
  lock_age=$(($(date +%s) - $(stat -f %m .git/index.lock 2>/dev/null || echo 0)))
  if [ "$lock_age" -lt 60 ]; then
    exit 0
  fi
  echo "[cron-tick] .git/index.lock is stale (${lock_age}s old) — proceeding" >&2
fi

# Commit any pending BUILD_QUEUE.md changes from prior validator runs
if ! git diff --quiet .fleet/BUILD_QUEUE.md 2>/dev/null; then
  git add .fleet/BUILD_QUEUE.md
  git commit -m "chore(fleet): periodic queue sync" --quiet
  git push origin {{BASE_BRANCH}} --quiet || true
fi

# Sync with origin
# ff-only because Fleet only writes to {{BASE_BRANCH}} via post-merge sync — no
# rebases needed. Previously used --rebase, which failed with "Cannot rebase
# onto multiple branches" when FETCH_HEAD held multiple refs; the
# || git rebase --abort then silently swallowed the error and the clone stopped
# syncing without anyone noticing. (Pilot lesson, kept here as a guardrail.)
git fetch origin --quiet
git pull --ff-only origin {{BASE_BRANCH}} --quiet

# Run whatever was passed in (typically dispatcher.sh or validator.sh)
exec "$@"
