# Session Summary — 2026-09-02 (MacBook)

## What this session was

A `/session-restart` on this repo that turned into an audit of the five session/project skills against Anthropic's newly published "AI-Native SDLC playbook" (claude.com, 2026-08-21) and its `intent.md` artifact, then — on Brandon's GO — a scoped implementation across three skills.

## Findings (research + portfolio survey)

- The playbook is real and official (Louis Claxton / Applied AI, plus a Claude Academy course whose lesson 2 is "Capture as intent.md"). It is **not** Boris Cherny's and is not tied to the Fable 5.1 release; the YouTube video that prompted the audit (Rob Shocks, 2026-09-01) opens by attributing it to Cherny as "creator of Claude Code", meaning Anthropic.
- `intent.md` = five sections (Problem / Proposed outcome / Affected users and systems / Constraints / Open questions), lives in `intent/`, feeds `spec.md` → `plan.md`; template "encoded as a skill"; not auto-read by Claude Code. The playbook has no ADRs.
- Portfolio (37 repos): one intent file anywhere; ADRs in 9 repos (223 files); `SPEC.md` in 4; four CLAUDE.md files over 500 lines (harper-timeclock 827); the two newest repos (sai-portal, sai-visas) have no README or `.claude/` because `project-template` was never built.
- The skills already covered the playbook's Build/Test/Deploy/Maintain controls; the Plan/Design front half had no persisted artifact.

## Shipped (all squash-merged, shared tree at `327e868`, live via symlink)

| PR | Skill | Verification cited |
|---|---|---|
| #36 | project-kickoff: `intent/` + template + `/intent` command + CLAUDE.md mistake-twice/compaction lines | Scratchpad scaffold from the skill text → README + template with 5 `##` sections + Status line |
| #37 | session-closeout: Phase 7 writes intent files for work outliving the next session; Phase 4.5 reconciles intent/plan statuses; Phase 3 mistake-twice scan | Throwaway shorestack-dashboard worktree ran Phase 7 on a real FOLLOWUPS item → `intent/0001-chat-tool-access.md` committed `docs(intent)` (worktree deleted, never pushed) |
| #38 | session-restart: Phase 1 "Read the Artifact Chain"; contract sourced tee-up → intents → goal → health; Phase 5 `docs/plans/` for review-class items only | Phase 1 commands extracted verbatim and run on that worktree surfaced the intent file + `docs/SPEC.md` |

Cool-down re-read caught one forward reference (to a checkpoint rule not yet written) — fixed before merge. No gates, hooks, or review rules changed. ADRs untouched.

## This closeout adds

- `DEFAULTS-ADR-0002.md` — the decision on record.
- `intent/` for this repo (README + template) and `intent/0001-project-template-repo.md` — the first real intent file, written by the new Phase 7.
- CLAUDE.md root-documents + skill-families lines; playbook section in `OPUS5-FABLE5-PLAYBOOK.md`.
- `~/Downloads/skill-uploads-2026-09-02/` holds zips of the three edited skills for the claude.ai library (Brandon re-uploads).

## Discovered issues (recorded, not fixed)

- `a1ba41b` (2026-08-22, `mac-mini-cleanup: 8/22 run ...`) is a direct-to-main, non-Conventional commit from another session. Already on `main`; not rewritten.
- Remote cruft branches: `master`, `docs/discipline-session-contract` (merged as #34), `chore/sketch-print-styles`, `feat/sai-process-sketch-skill`. User's call to delete.
- `folder-forensic-audit/references/best-practices-baseline.md` is dated July 2026 — predates the playbook.
- The `rules/discipline.md` header and `OPUS5-FABLE5-PLAYBOOK.md` say "Opus 5 / Fable 5"; no Fable 5.1 migration source found, so no tuning change was made.

## Tee-up — next session (each with its done-criterion)

1. **session-checkpoint: same-commit plan rule** — done when Step 1 states that an implementation departing from `docs/plans/<slug>.md` updates the plan in the same commit, and a dry-run checkpoint on a scratch branch commits code + plan together.
2. **folder-forensic-audit: artifact-chain + CLAUDE.md-content checks** — done when Phase 2 checks `intent/` / `SPEC.md` / `docs/plans/` presence and staleness, flags CLAUDE.md procedures that belong in skills and always/never rules that belong in hooks, checks auto-memory `MEMORY.md` > 200 lines, and the baseline's date moves off July 2026.
3. **Brandon: re-upload the three zips** to the claude.ai Skills library — done when Desktop/Cowork shows the 2026-09-02 SKILL.md text for kickoff, closeout, restart.

Outliving the next session: `intent/0001-project-template-repo.md`.
