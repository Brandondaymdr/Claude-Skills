# 0001. Build the project-template repo that project-kickoff Step 0 already assumes exists

Status: Open
Date: 2026-09-02
Originator: Brandon (Developer Transition Plan Phase 2, 2026-04; re-surfaced by the 2026-09-02 portfolio survey)

## Problem
`project-kickoff` Step 0 checks for `Brandondaymdr/project-template` and clones from it. The repo has never been built, so every kickoff falls through to the from-scratch path — and in practice new repos skip scaffolding entirely: the two newest repos in the portfolio (`SAI/sai-portal`, `SAI/sai-visas`) have no README, no `.claude/`, no docs layer. The template has been "next session" since 2026-07-17.

## Proposed outcome
`gh repo create <name> --template Brandondaymdr/project-template` yields a repo that passes `folder-forensic-audit` at grade A with zero fixes, in whichever of the three variants (web-next-supabase, desktop-tauri, node-lib) was chosen — so a new project starts conformant instead of being retrofitted.

## Affected users and systems
Brandon only. `project-kickoff` (Step 0 becomes real), `folder-forensic-audit` Conformance Mode (its fix matrix is the template's content list), `DEFAULTS-ADR-0001.md` + `WORKFLOW-GOLDEN-PATH.md` (become the template's ADR 0001 and `docs/WORKFLOW.md`), and every future repo.

## Constraints
Everything in `DEFAULTS-ADR-0001.md` is already decided — the template implements, it doesn't re-decide. Three variants ship as subdirectories (kickoff Step 0 assumes this). Must include `intent/` (ADR 0002), commitlint `type-enum` with `wip`, the `permissions:` block in CI, and the `pr-age-check` job. Build on whichever machine; no signing or notary involved.

## Open questions
- One repo with three variant subdirs (as Step 0 assumes) or three template repos? Step 0's clone-then-prune flow is awkward; a `gh repo create --template` per variant may be cleaner.
- Which variant first — web-next-supabase is the most common stack, but desktop-tauri is where the ShoreStack apps live.
- Does the template get its own CI that audits itself (kickoff Step 0 says "run folder-forensic-audit on the template")?
