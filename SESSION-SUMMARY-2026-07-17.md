# Session Summary — 2026-07-17 (Skill Audit Wave)

Two concurrent sessions audited the session/project skill families against current Claude Code documentation and repaired everything found. Eight PRs, all squash-merged to `main` (`e28a917`).

## What landed

| PR | Scope |
|---|---|
| #12 | session-checkpoint audit repairs |
| #13 | commitlint `type-enum` extended with `wip` (ADR + kickoff) — stock config-conventional rejects the `wip` commits the session skills rely on |
| #14 | session-restart audit — real fetch, macOS/gh bugs, genericized literals |
| #15 | session-closeout audit — canonical backport hop, rebase-free rewrites, push step |
| #16 | **project-kickoff Claude Code facts corrected against official docs**: settings.json `permissions` nesting (top-level `allow`/`deny` is silently ignored), real hook event names (`PreToolUse`/`PostToolUse`/`UserPromptSubmit`/`PreCompact`) + required nested `hooks: [{type: "command"}]` array, `/dev` not `/project:dev`, subagent `tools:` takes bare names only, `/plugin list`, schemastore `$schema` URL. Same hook-name fix applied to folder-forensic-audit so the auditor stops enforcing the wrong names. Tier rubric written as an appendix to `DEFAULTS-ADR-0001.md` (was referenced by project-kickoff Phase 1 Q11 but existed nowhere) |
| #17 | folder-forensic-audit — false-positive bash fixes + reference extraction |
| #18 | project-kickoff runtime fixes: branch-protection `gh api` now sends typed JSON via `--input` (the `-f` form 422s), `pr-age-check` first-run-fails-by-design documented, template-first path moved Step 8 → Step 0, version sweep (Next.js 16, pnpm/action-setup@v4, Node 22) |
| #19 | folder-forensic-audit CC-compliance false positive — first-parent no-merges + multi-scope regex |

Verified still correct during the #16 audit: `.claude/rules/` with `paths:` frontmatter, `@path` imports in CLAUDE.md, `CLAUDE.local.md` / `.claude/settings.local.json`.

## Incident: shared-working-tree race

The two sessions shared `~/Projects/claude-skills` as their working copy. One session's `git checkout -b` was silently undone by the other's branch switch; its commit landed on the other session's branch and swept in that session's uncommitted files. Recovered by rebuilding the commit in a scratch worktree and restoring the other session's branch tips and uncommitted state. Root cause identical to the HDYW Fleet checkout gremlin.

**New standing rule (now in CLAUDE.md §"live install" #3):** never `git switch`/`checkout`/`commit` in this checkout; isolated worktree off `origin/main` → PR → remote merge only.

## Open items

- `project-template` repo still doesn't exist — kickoff Step 0 falls through to from-scratch every time. Building it (3 variants per `DEFAULTS-ADR-0001.md`) is the biggest remaining kickoff improvement.
- Deletable cruft (user's call): `origin/master` remote branch, `~/.claude/skills.PRE-MIGRATION-BACKUP`.
- Carried from 2026-07-16: forward-port template `validator.sh` fixes to barrel-tracking's live `.fleet`; confirm Mac Mini clone pulls cleanly.
