# Global rules (synced via this repo)

`discipline.md` is the discipline layer Claude Code loads alongside every skill.
Claude Code reads it from `~/.claude/rules/`, which is NOT a git repo — so the
canonical copy lives here and each machine installs it as a symlink:

```bash
mkdir -p ~/.claude/rules
ln -sf ~/Projects/claude-skills/rules/discipline.md ~/.claude/rules/discipline.md
```

After that, `git pull` in this repo updates the live rule on that machine, same
as the skills symlink. Edit it via the normal worktree → PR flow, never in
`~/.claude/rules/` directly (that would only change one machine — or nothing,
once the symlink is in place).

Installed on: Mac mini (2026-07-29), MacBook (2026-07-29 — run the ln above if
this line is stale).
