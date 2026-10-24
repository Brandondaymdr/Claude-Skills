#!/usr/bin/env bash
# Layer 2 settings for one GitHub repo (needs gh with admin rights on it).
#
# Usage: bash repo-settings.sh <owner/repo> [--tier1]
#   always:   Dependabot alerts + Dependabot security updates on
#   --tier1:  create/update the "security-baseline" ruleset on the default
#             branch: PR required, checks secrets/deps/ai-review required,
#             no force-push, no deletion. Refuses until security.yml is on
#             the default branch, so it can't lock main behind checks that
#             never run.
set -euo pipefail

KIT="$(cd "$(dirname "$0")/.." && pwd)"
[[ $# -ge 1 ]] || { sed -n '2,10p' "$0"; exit 1; }
r="$1"; tier1=0
[[ "${2:-}" == "--tier1" ]] && tier1=1

archived="$(gh api "repos/$r" --jq .archived)"
if [[ "$archived" == "true" ]]; then
  echo "$r is archived; nothing to configure (history scan covers it)."
  exit 0
fi

gh api -X PUT "repos/$r/vulnerability-alerts" --silent && echo "Dependabot alerts: on"
gh api -X PUT "repos/$r/automated-security-fixes" --silent && echo "Dependabot security updates: on"

[[ "$tier1" -eq 1 ]] || exit 0

if ! gh api "repos/$r/contents/.github/workflows/security.yml" --silent 2>/dev/null; then
  echo "security.yml is not on $r's default branch yet. Merge the security-baseline PR first." >&2
  exit 1
fi

id="$(gh api "repos/$r/rulesets" --jq '.[] | select(.name=="security-baseline") | .id' 2>/dev/null || true)"
if [[ -n "$id" ]]; then
  gh api -X PUT "repos/$r/rulesets/$id" --input "$KIT/templates/ruleset-tier1.json" --silent
  echo "Ruleset security-baseline: updated"
else
  # gh's own error here is unreadable on a Free plan ("unsupported protocol
  # scheme"), so capture it and say what actually went wrong.
  if ! out="$(gh api -X POST "repos/$r/rulesets" --input "$KIT/templates/ruleset-tier1.json" --silent 2>&1)"; then
    if [[ "$(gh api "repos/$r" --jq .private 2>/dev/null)" == "true" ]]; then
      echo "Could not create the ruleset on $r: rulesets on PRIVATE repos need a paid plan" >&2
      echo "(GitHub Pro for a personal account, GitHub Team for an org). Upgrade, then re-run." >&2
    else
      echo "Could not create the ruleset on $r." >&2
    fi
    echo "gh said: $(printf '%s' "$out" | head -n 1)" >&2
    exit 1
  fi
  echo "Ruleset security-baseline: created"
fi
