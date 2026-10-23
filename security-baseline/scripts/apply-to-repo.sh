#!/usr/bin/env bash
# Layer 2: add the security baseline to one repo and open a PR.
#
# Usage: bash apply-to-repo.sh <local-clone-path> <stack>[,<stack>...] [--force] [--no-pr]
#   stacks: generic supabase tauri nextjs n8n-shopify student-data
#   --force  overwrite an existing .github/workflows/security.yml
#   --no-pr  push the branch but don't open a PR
#
# Works in a temporary git worktree off origin's default branch, so the clone's
# working tree and current branch are never touched.
set -euo pipefail

KIT="$(cd "$(dirname "$0")/.." && pwd)"
TPL="$KIT/templates"
BRANCH="chore/security-baseline"

[[ $# -ge 1 ]] || { sed -n '2,10p' "$0"; exit 1; }
repo="$(cd "$1" && pwd)"
stacks="${2:-generic}"
force=""; open_pr=1
for a in "${@:3}"; do
  case "$a" in
    --force) force=1 ;;
    --no-pr) open_pr=0 ;;
    *) echo "unknown option: $a" >&2; exit 1 ;;
  esac
done

IFS=',' read -r -a stack_list <<<"$stacks"
for s in "${stack_list[@]}"; do
  [[ -f "$TPL/instructions/$s.txt" ]] || { echo "unknown stack: $s" >&2; exit 1; }
done

git -C "$repo" rev-parse --is-inside-work-tree >/dev/null
git -C "$repo" fetch -q origin

default="$(git -C "$repo" symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null || true)"
default="${default#origin/}"
if [[ -z "$default" ]]; then
  default="$(cd "$repo" && gh repo view --json defaultBranchRef -q .defaultBranchRef.name 2>/dev/null || echo main)"
fi

if git -C "$repo" ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
  echo "origin already has $BRANCH (an open PR?). Merge or delete it first." >&2
  exit 1
fi

wt="$(mktemp -d)/security-baseline"
cleanup() {
  git -C "$repo" worktree remove --force "$wt" >/dev/null 2>&1 || true
  git -C "$repo" branch -D "$BRANCH" >/dev/null 2>&1 || true
}
trap cleanup EXIT
git -C "$repo" worktree add -q -b "$BRANCH" "$wt" "origin/$default"
cd "$wt"

notes=()

# workflow
mkdir -p .github/workflows
if [[ -f .github/workflows/security.yml && -z "$force" ]]; then
  echo ".github/workflows/security.yml already exists; re-run with --force to replace it." >&2
  exit 1
fi
cp "$TPL/security.yml" .github/workflows/security.yml

# scan instructions for the AI review: generic + each stack
{
  cat "$TPL/instructions/generic.txt"
  for s in "${stack_list[@]}"; do
    [[ "$s" == "generic" ]] && continue
    echo
    cat "$TPL/instructions/$s.txt"
  done
} >.github/security-instructions.txt

# gitleaks config (keep an existing one)
if [[ -f .gitleaks.toml ]]; then
  notes+=("Kept the existing .gitleaks.toml.")
else
  cp "$TPL/gitleaks.toml" .gitleaks.toml
fi

# Husky repos bypass the global hook: wire gitleaks into their pre-commit
if [[ -f .husky/pre-commit ]]; then
  if grep -q gitleaks .husky/pre-commit; then
    if grep -q "gitleaks protect" .husky/pre-commit; then
      notes+=("\`.husky/pre-commit\` uses the deprecated \`gitleaks protect\`; it still works, but \`gitleaks git --pre-commit --staged\` is the current form.")
    fi
  else
    cat >>.husky/pre-commit <<'EOF'

# security-baseline: block commits that add secrets
if command -v gitleaks >/dev/null 2>&1; then
  gitleaks git --pre-commit --staged --redact --no-banner --log-level warn -v || exit 1
fi
EOF
    notes+=("Added gitleaks to \`.husky/pre-commit\` (Husky bypasses the global hook).")
  fi
fi

# existing gitleaks-action steps now duplicate the secrets job
if grep -lq "gitleaks/gitleaks-action" .github/workflows/*.y*ml 2>/dev/null; then
  dup="$(grep -l "gitleaks/gitleaks-action" .github/workflows/*.y*ml | grep -v security.yml | tr '\n' ' ')"
  [[ -n "$dup" ]] && notes+=("\`gitleaks/gitleaks-action\` in ${dup}now duplicates the \`secrets\` job; remove it in a follow-up.")
fi

git add -A .github .gitleaks.toml
[[ -f .husky/pre-commit ]] && git add .husky/pre-commit
# --no-verify: the worktree has no node_modules, so repo hooks (husky/commitlint)
# can't run here; the files are fixed templates, already secret-scanned.
git commit -q --no-verify -m "chore(security): add security-baseline checks

Adds secrets (gitleaks), deps (Trivy) and ai-review (Claude security
review) jobs, a gitleaks config and stack-specific review instructions
(${stacks})."
git push -q -u origin "$BRANCH"

has_secret="unknown"
if command -v gh >/dev/null 2>&1; then
  nwo="$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"
  if [[ -n "$nwo" ]] && secrets="$(gh secret list --repo "$nwo" 2>/dev/null)"; then
    if grep -q '^CLAUDE_API_KEY' <<<"$secrets"; then has_secret="yes"; else has_secret="no"; fi
  fi
fi

body="Adds the layer 2 security baseline from Claude-Skills \`security-baseline\`.

- \`secrets\`: gitleaks on the PR's commits; full history on main and weekly
- \`deps\`: Trivy, fails on fixable HIGH/CRITICAL vulnerabilities
- \`ai-review\`: Claude security review on PR diffs (skipped for Dependabot)
- Review instructions for: ${stacks}

Before merging: repo secret \`CLAUDE_API_KEY\` must exist (currently: ${has_secret}).
After merging (Tier 1): \`bash security-baseline/scripts/repo-settings.sh <owner/repo> --tier1\`"
if [[ ${#notes[@]} -gt 0 ]]; then
  body+=$'\n\nNotes:'
  for n in "${notes[@]}"; do body+=$'\n'"- $n"; done
fi

if [[ "$open_pr" -eq 1 ]]; then
  gh pr create --base "$default" --head "$BRANCH" \
    --title "chore(security): add security-baseline checks" --body "$body"
else
  echo "Pushed $BRANCH (no PR opened)."
  printf '%s\n' "$body"
fi

[[ "$has_secret" == "no" ]] && echo "Reminder: add the CLAUDE_API_KEY secret before merging, or ai-review will fail."
exit 0
