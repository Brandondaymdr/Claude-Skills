#!/usr/bin/env bash
# Layer 1: install a global gitleaks pre-commit hook on this Mac.
#
# Sets git's global core.hooksPath to ~/.config/git/hooks. Because a global
# hooksPath makes git ignore each repo's own .git/hooks, every standard hook is
# installed as a pass-through that runs the repo-local hook if one exists — so
# Git LFS, commit-msg tools etc. keep working. Repos using Husky set their own
# local hooksPath and bypass this entirely; apply-to-repo.sh wires gitleaks into
# their .husky/pre-commit instead.
#
# Usage: bash install-global-hook.sh            # install + self-test
#        bash install-global-hook.sh --test     # self-test only
set -euo pipefail

HOOK_DIR="$HOME/.config/git/hooks"

say() { printf '%s\n' "$*"; }

self_test() {
  local tmp out g
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' RETURN
  g=(git -C "$tmp" -c user.name=test -c user.email=test@example.com)
  git -C "$tmp" init -q

  # 1. a clean commit must succeed, proving the repo and hooks work
  printf 'hello\n' >"$tmp/clean.txt"
  git -C "$tmp" add clean.txt
  if ! out="$("${g[@]}" commit -q -m clean 2>&1)"; then
    say "SELF-TEST FAILED: a clean commit was blocked:"
    say "$out"
    return 1
  fi

  # 2. a commit with a fake token must be blocked BY GITLEAKS.
  # The token is built at runtime so this script never contains one.
  local fake
  fake="ghp_$(LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom 2>/dev/null | head -c 36 || true)"
  printf 'token=%s\n' "$fake" >"$tmp/leak.txt"
  git -C "$tmp" add leak.txt
  if out="$("${g[@]}" commit -q -m leak 2>&1)"; then
    say "SELF-TEST FAILED: a commit containing a fake token was allowed."
    say "Check: git config --global core.hooksPath  (expect $HOOK_DIR)"
    return 1
  fi
  if ! grep -qi "leaks found" <<<"$out"; then
    say "SELF-TEST FAILED: the commit was blocked, but not by gitleaks:"
    say "$out"
    return 1
  fi
  say "Self-test passed: clean commit allowed; fake token blocked by gitleaks."
}

case "${1:-}" in
  --test) self_test; exit $? ;;
  "") ;;
  *) sed -n '2,13p' "$0"; exit 0 ;;
esac

# 1. gitleaks
if ! command -v gitleaks >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    say "Installing gitleaks with Homebrew..."
    brew install gitleaks
  else
    say "gitleaks not found and Homebrew is not installed. Install gitleaks first." >&2
    exit 1
  fi
fi
say "gitleaks $(gitleaks version)"

# 2. refuse to clobber a different global hooksPath
current="$(git config --global --get core.hooksPath || true)"
if [[ -n "$current" && "$current" != "$HOOK_DIR" && "$current" != "${HOOK_DIR/#$HOME/~}" ]]; then
  say "Global core.hooksPath is already set to: $current" >&2
  say "Not overwriting it. Merge manually or unset it, then re-run." >&2
  exit 1
fi

mkdir -p "$HOOK_DIR"
# hooks dropped from earlier versions of this script
rm -f "$HOOK_DIR/reference-transaction" "$HOOK_DIR/push-to-checkout"

# 3. pass-through for every client hook git knows about
PASS_THROUGH='#!/usr/bin/env bash
# Installed by security-baseline: run the repo-local hook of the same name, if any.
git_dir="$(git rev-parse --git-common-dir 2>/dev/null)" || exit 0
local_hook="$git_dir/hooks/$(basename "$0")"
if [ -x "$local_hook" ]; then exec "$local_hook" "$@"; fi
exit 0'

for h in applypatch-msg pre-applypatch post-applypatch prepare-commit-msg commit-msg \
         post-commit pre-rebase post-checkout post-merge pre-push pre-auto-gc \
         post-rewrite; do
  printf '%s\n' "$PASS_THROUGH" >"$HOOK_DIR/$h"
  chmod +x "$HOOK_DIR/$h"
done

# 4. pre-commit: gitleaks, then the repo-local pre-commit
cat >"$HOOK_DIR/pre-commit" <<'EOF'
#!/usr/bin/env bash
# Installed by security-baseline (layer 1): block commits that add secrets.
# Bypass for one known-safe commit: SKIP_GITLEAKS=1 git commit ...
if [ "${SKIP_GITLEAKS:-}" != "1" ]; then
  if command -v gitleaks >/dev/null 2>&1; then
    gitleaks git --pre-commit --staged --redact --no-banner --log-level warn -v || {
      echo "gitleaks: possible secret in staged changes. Commit blocked." >&2
      echo "Remove it, or mark a test value with a trailing  # gitleaks:allow" >&2
      exit 1
    }
  else
    echo "gitleaks not installed; secret scan skipped (run install-global-hook.sh)." >&2
  fi
fi
git_dir="$(git rev-parse --git-common-dir 2>/dev/null)" || exit 0
local_hook="$git_dir/hooks/pre-commit"
if [ -x "$local_hook" ]; then exec "$local_hook" "$@"; fi
exit 0
EOF
chmod +x "$HOOK_DIR/pre-commit"

git config --global core.hooksPath "$HOOK_DIR"
say "Global hooks installed in $HOOK_DIR"

self_test
