# Claude-Skills

Brandon's personal Claude Code skills repo. Each top-level directory is one skill (`SKILL.md` + optional `references/`, `templates/`, `agents/`).

## ⚠️ This repo IS the live install

`~/.claude/skills` is a **symlink to this repo's working tree**. Any edit here takes effect in every Claude Code session immediately — including uncommitted changes. Two consequences:

1. **Never leave work uncommitted.** A dirty working tree means live skills that exist nowhere else (this bit us: the Fleet session-skill hooks sat uncommitted for 7 weeks).
2. **Pull at session start.** This repo is edited from multiple machines (MacBook + Mac Mini). A stale clone means stale live skills — this MacBook ran 2 months behind until 2026-07-16.
3. **Never `git switch`/`checkout`/`commit` in this checkout directly.** Concurrent Claude sessions share this working tree — on 2026-07-17 two sessions raced, one's commit landed on the other's branch and swept in its uncommitted files. Do all work in an isolated worktree (`git worktree add <scratchpad>/... origin/main`), commit/push/PR from there, and merge remotely (`gh pr merge --repo ...`). The only git write allowed in this checkout is a fast-forward `git pull` on a clean `main`.

## Workflow rules

Follow `WORKFLOW-GOLDEN-PATH.md`. Non-negotiables for this repo:

- Branch first (`feat/`, `fix/`, `chore/`, `docs/` prefixes) — never commit to `main`
- Conventional Commits (`feat(skills):`, `chore(skill):`, `docs(...)`)
- Every change lands via PR; 10-minute cool-down before merge (squash-merge is the house style)
- No CI in this repo — the cool-down re-read is the review

## Skill families

**Session lifecycle** (pair with each other):
- `session-restart` — context recovery + health check + briefing on return to a project
- `session-checkpoint` — quick mid-session WIP save
- `session-closeout` — structured end-of-session SOP (docs, commits, knowledge capture)

**Project operations:**
- `project-kickoff` — scaffold new projects with production-grade defaults
- `folder-forensic-audit` — diagnostic audit (Phases 1–5) + prescriptive Conformance Mode (Phase 6)
- `fleet-init` — bootstrap a Fleet autonomous-build pipeline (`templates/` are the canonical Fleet scripts; `PARAMETERS.md` defines the `{{PLACEHOLDER}}` substitution contract)

**Domain skills** (client/product work): `beehiiv*` (WhiskeyTribe newsletter), `cheersworthy-*` (Shopify spirits store), `circle-so-*` (Carla Gentile Yoga community), `obsidian-*` (vault management), `shopify-*`, `toast-*` (POS), plus `adobe-premiere`, `frontend-design`, `instagram`, `internal-comms`, `n8n`, `photoshop-thumbnails`, `slack-comms-builder`, `video`, `whiskeysomm-brand`, `youtube-channel`.

## Root documents

- `DEFAULTS-ADR-0001.md` — foundational tooling/workflow defaults (pnpm, Vitest, Husky, commitlint, gitleaks, Dependabot, cool-down). Becomes ADR 0001 of the future `project-template` repo.
- `WORKFLOW-GOLDEN-PATH.md` — the one-page feature workflow; copied to `docs/WORKFLOW.md` in scaffolded projects.
- `SESSION-SUMMARY*.md` — closeout artifacts from major sessions.

## Cross-repo relationships

- `folder-forensic-audit` Conformance Mode enforces `DEFAULTS-ADR-0001.md`; it was validated against the shorestack repo.
- `fleet-init/templates/` and live Fleet pilots (barrel-tracking) drift in **both directions**: backport pilot fixes to templates via session-closeout Phase 4.7; forward-port template fixes to pilots manually.
- The five "session/project" skills implement `DEVELOPER-TRANSITION-PLAN.md` (lives outside this repo).

## Editing conventions

- `SKILL.md` frontmatter `description:` drives skill triggering — write trigger phrases into it.
- SKILL.md is the source of truth; `references/` are quick-reference aids and may lag.
- When a skill documents a lesson, genericize project-specific literals (slice IDs, PR numbers, dates) unless the skill is project-specific by design.
- Skills that reference each other should use relative links (`../session-restart/SKILL.md`).
