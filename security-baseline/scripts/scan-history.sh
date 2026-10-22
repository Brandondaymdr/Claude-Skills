#!/usr/bin/env bash
# Layer 1 follow-up: scan the FULL git history of every repo for secrets.
#
# Local clones (default root ~/Projects, searched 4 levels deep):
#   bash scan-history.sh [ROOT ...]
# Every repo an owner has on GitHub, including archived ones not cloned locally
# (mirror-clones into ~/security/mirrors, then scans):
#   bash scan-history.sh --github Brandondaymdr Crowded-Barrel Cheersworthy
#
# Reports (secrets redacted) go to ~/security/gitleaks/, never inside a repo,
# plus summary.md listing repos with findings and the rule that fired.
set -euo pipefail

OUT="$HOME/security/gitleaks"
MIRRORS="$HOME/security/mirrors"
mkdir -p "$OUT"

command -v gitleaks >/dev/null 2>&1 || { echo "gitleaks not installed (brew install gitleaks)" >&2; exit 1; }

repos=()   # entries: "<report-name>|<path>"

if [[ "${1:-}" == "--github" ]]; then
  shift
  [[ $# -gt 0 ]] || { echo "Usage: $0 --github OWNER [OWNER ...]" >&2; exit 1; }
  command -v gh >/dev/null 2>&1 || { echo "gh CLI not installed (brew install gh)" >&2; exit 1; }
  mkdir -p "$MIRRORS"
  for owner in "$@"; do
    while IFS= read -r full; do
      [[ -n "$full" ]] || continue
      dir="$MIRRORS/${full//\//__}.git"
      if [[ -d "$dir" ]]; then
        git -C "$dir" remote update --prune >/dev/null 2>&1 || echo "warn: could not update $full" >&2
      else
        echo "mirroring $full"
        gh repo clone "$full" "$dir" -- --mirror -q || { echo "warn: could not clone $full" >&2; continue; }
      fi
      repos+=("gh__${full//\//__}|$dir")
    done < <(gh repo list "$owner" --limit 500 --json nameWithOwner -q '.[].nameWithOwner')
  done
else
  roots=("$@")
  [[ ${#roots[@]} -gt 0 ]] || roots=("$HOME/Projects")
  for root in "${roots[@]}"; do
    [[ -d "$root" ]] || { echo "warn: $root not found" >&2; continue; }
    while IFS= read -r gitdir; do
      path="$(dirname "$gitdir")"
      rel="${path#"$HOME"/}"
      repos+=("${rel//\//__}|$path")
    done < <(find "$root" -maxdepth 4 -type d -name .git -not -path '*/node_modules/*' 2>/dev/null | sort)
  done
fi

[[ ${#repos[@]} -gt 0 ]] || { echo "No repos found." >&2; exit 1; }

summary="$OUT/summary.md"
{
  echo "# gitleaks history scan — $(date '+%Y-%m-%d %H:%M')"
  echo
  echo "| Repo | Findings | Rules |"
  echo "| --- | --- | --- |"
} >"$summary"

total=0
dirty=0
for entry in "${repos[@]}"; do
  name="${entry%%|*}"
  path="${entry#*|}"
  report="$OUT/$name.json"
  printf 'scanning %s ... ' "$name"
  if ! gitleaks git "$path" --log-opts="--all" --redact --no-banner --log-level error \
        --exit-code 0 --report-format json --report-path "$report" >/dev/null 2>&1; then
    echo "ERROR (see: gitleaks git \"$path\" --log-opts=--all)"
    echo "| $name | scan error | |" >>"$summary"
    continue
  fi
  n=$(grep -c '"RuleID"' "$report" || true)
  echo "$n"
  total=$((total + n))
  if [[ "$n" -gt 0 ]]; then
    dirty=$((dirty + 1))
    rules=$(grep -o '"RuleID": *"[^"]*"' "$report" | sed 's/.*: *"//; s/"$//' | sort | uniq -c \
            | awk '{printf "%s%s ×%s", sep, $2, $1; sep=", "}')
    echo "| $name | $n | $rules |" >>"$summary"
  fi
done

{
  echo
  echo "Scanned ${#repos[@]} repos: $total findings in $dirty repos."
  echo
  echo "Next: open each report, rotate every real key at its source, then add"
  echo "rotated or false-positive fingerprints to that repo's .gitleaksignore."
} >>"$summary"

echo
echo "Scanned ${#repos[@]} repos: $total findings in $dirty repos."
echo "Summary: $summary"
