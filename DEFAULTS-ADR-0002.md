# ADR 0002: Intent and plan artifacts (the AI-Native SDLC artifact chain, solo scale)

Date: 2026-09-02
Status: Accepted
Scope: the session/project skills (`project-kickoff`, `session-closeout`, `session-restart`; `session-checkpoint` and `folder-forensic-audit` to follow) and every project they touch

## Context

Anthropic published "The AI-Native SDLC playbook" (claude.com blog, 2026-08-21, Louis Claxton / Applied AI; matching Claude Academy course). Its central mechanic: every lifecycle stage ends by writing one artifact to version control and the next stage begins by reading it — `intent.md` (Problem / Proposed outcome / Affected users and systems / Constraints / Open questions) → `spec.md` → `plan.md` → diff. The playbook is written for enterprises; `intent.md` exists so a non-engineer originator can hand work to a product owner. It has no ADRs and no PRDs. Claude Code does not auto-read any of these files.

A 2026-09-02 survey of 37 repos in `~/Projects` found: one `intent*.md` anywhere; ADRs in 9 repos (223 files); `SPEC.md` in 4; plan docs under six different ad-hoc names; the session contract (`rules/discipline.md`, PR #35) persisted only in closeout commit bodies. The back half of the loop (verification by pasted output, adversarial review, hooks, evals, mistake-twice → CLAUDE.md) was already covered by the skills. The front half had no persisted artifact.

Boris Cherny's own guidance (June 2026) is that newer models "don't actually need a planning step" — in tension with the playbook's plan-mode-by-default. Both are right for their audience; a solo developer running 1–3 item sessions is closer to Cherny.

## Decision

1. **`intent/NNNN-slug.md` for work that outlives one session.** Five sections exactly as the playbook example; numbered like ADRs; `Status:` line (`Open` → `In progress` → `Done` / `Dropped`). Scaffolded by `project-kickoff` for Tier 1/2 (README + template only), written by `session-closeout` Phase 7 for tee-up items bigger than the next session, or by the `/intent` command on demand. Ordinary 1–3 item session contracts do **not** get intent files — they live in the closeout tee-up as before.
2. **`docs/plans/<slug>.md` only for review-class items** — the same set that already earns adversarial review under the Iron Laws (engine changes, money paths, wide or mechanical diffs). Written by `session-restart` Phase 5 and committed *before the first edit*, so a reviewer checks the diff against a plan that predates it. A plan that diverges from its implementation is updated in the same commit as the departing code. Ordinary items keep the brief in conversation; a plan file for a one-hour fix is ceremony.
3. **`spec.md` stays optional and per-repo.** ADRs remain the house's design-decision artifact and are unchanged.
4. **Not adopted:** automated intent→spec generation, mandatory specs, the maintain-stage auto-diagnosis agents, and any Fable 5.1-specific tuning (no migration source exists to cite).

Applied in PRs #36 (kickoff), #37 (closeout), #38 (restart), all merged 2026-09-02.

## Consequences

**Easier:** the next restart sources its contract from disk instead of a commit message; initiatives that span sessions stop being re-derived; reviewers of engine/money changes get a pre-committed plan to check against; new repos start with the folder.

**Harder:** one more folder to keep honest — intent statuses have to be flipped at closeout (Phase 4.5 does it). Two conventions (`intent/` numbering, `docs/plans/` slugs) that the audit skill must learn to check.

**Gave up:** the playbook's automation and its originator/product-owner split. Revisit if a client project ever has a non-engineer originator — the folder and template are already the right shape for that.

## Revisit triggers

- Anthropic ships first-party support (a slash command, hook, or auto-read) for `intent.md` / `plan.md` — align naming and location.
- Two consecutive closeouts write zero intent files on active Tier 1 repos — the threshold is wrong, or the habit isn't forming.
- A plan file is written for an ordinary item three times — the review-class gate is leaking.
