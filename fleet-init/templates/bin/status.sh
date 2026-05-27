#!/bin/bash
cd "{{WORKDIR}}" || exit 1
echo "=== Open Fleet PRs ==="
gh pr list --search "[{{SLICE_PREFIX}}] in:title" --state open
echo ""
echo "=== Recently merged Fleet PRs (last 10) ==="
gh pr list --search "[{{SLICE_PREFIX}}] in:title" --state merged --limit 10
echo ""
echo "=== Last 30 dispatcher log lines ==="
tail -30 .fleet/logs/dispatcher.log 2>/dev/null
echo ""
echo "=== Last 30 validator log lines ==="
tail -30 .fleet/logs/validator.log 2>/dev/null
echo ""
echo "=== Queue status (slices not yet merged) ==="
grep "{{SLICE_PREFIX}}-" .fleet/BUILD_QUEUE.md | grep -v -- "---"
