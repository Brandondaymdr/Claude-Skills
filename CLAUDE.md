# Claude-Skills

Brandon's personal Claude Code skills repo. Each top-level directory is one skill (`SKILL.md` + optional `references/`, `templates/`, `agents/`) — except `rules/`, which holds global Claude Code rules (the discipline layer) that each machine symlinks into `~/.claude/rules/` (install one-liner in `rules/README.md`; `~/.claude/rules` is NOT a git repo, so edits go through this repo's PR flow, never in place).

## ⚠️ This repo IS the live install

`~/.claude/skills` is a **symlink to this repo's working tree**. Any edit here takes effect in every Claude Code session immediately — including uncommitted changes. Two consequences:

1. **Never leave work uncommitted.** A dirty working tree means live skills that exist nowhere else (this bit us: the Fleet session-skill hooks sat uncommitted for 7 weeks).
2. **Pull at session start.** This repo is edited from multiple machines (MacBook + Mac Mini). A stale clone means stale live skills — this MacBook ran 2 months behind until 2026-07-16.
3. **Never `git switch`/`checkout`/`commit` in this checkout directly.** Concurrent Claude sessions share this working tree — on 2026-07-17 two sessions raced, one's commit landed on the other's branch and swept in its uncommitted files. Do all work in an isolated worktree (`git worktree add <scratchpad>/... origin/main`), commit/push/PR from there, and merge remotely (`gh pr merge --repo ...`). The only git write allowed in this checkout is a fast-forward `git pull` on a clean `main`.
4. **This repo is NOT the only skills store.** Skills authored in Claude Desktop/Cowork sessions land in the claude.ai account Skills library, which Claude Code never reads — they're invisible to CLI sessions until ported here (bit us 2026-07-28: `mac-mini-cleanup`, `live-app-maintenance`, `xcode-cleanup` were "lost" for weeks). If a skill "exists but can't be found," check the Desktop app's local mirror under `~/Library/Application Support/Claude/local-agent-mode-sessions/skills-plugin/*/*/skills/` and port it. This repo is canonical; after editing a skill here, re-upload it to the claude.ai library or the Desktop copy drifts.

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

**Cross-project standards:**

- `days-design-system` — the HOUSE design layer for every project: the token contract, interaction honesty ("looks like a link → acts like a link"), measured contrast (`references/contrast.py`), the only-define-what-you-render rule, and how to verify a visual change given that CSS is invisible to typecheck/lint/tests/build. A project with its own design source (ShoreStack's `docs/DESIGN-SYSTEM.md`, `cheersworthy-*`, `whiskeysomm-brand`) overrides it on specifics; it still governs method. Pairs with `frontend-design`, which supplies creative direction for greenfield work.

**Domain skills** (client/product work): `beehiiv*` (WhiskeyTribe newsletter), `cheersworthy-*` (Shopify spirits store), `circle-so-*` (Carla Gentile Yoga community), `obsidian-*` (vault management), `sai-process-sketch` (SAI Student Portal stakeholder sketches), `shopify-*`, `toast-*` (POS), plus `adobe-premiere`, `frontend-design`, `instagram`, `internal-comms`, `n8n`, `photoshop-thumbnails`, `slack-comms-builder`, `video`, `whiskeysomm-brand`, `youtube-channel`.

## Root documents

- `OPUS5-FABLE5-PLAYBOOK.md` — how to run the session/project skills with the Claude 5-family models; written alongside the 2026-07-29 tuning pass (scope discipline, no ritual re-verification, delegation caps).
- `rules/discipline.md` — canonical copy of the global discipline layer (see the exception note at the top of this file).
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
