# Session Summary — 2026-07-17 (folder-forensic-audit: audit + live verification)

Parallel session to the same-day "skill audit wave" (see `SESSION-SUMMARY-2026-07-17.md`). This one audited **the auditor itself**, then verified the fixes against a real Tier 1 repo.

## Shipped (both merged)

- **PR #17 — `fix(skills): folder-forensic-audit — false-positive bash fixes + reference extraction`**
  - Three confirmed bugs that produced false High/Critical findings on healthy repos:
    CHANGELOG `[Unreleased]` awk range closed on its own header (always counted 0);
    direct-to-main detection flagged every squash-merged PR (tautological parent
    count after `--no-merges`); large-commit check string-compared hex hashes to 500.
  - `pnpm audit` legacy-endpoint retirement (HTTP 410) documented; gitleaks moved to
    v8.19+ `dir`/`git` subcommands; unrunnable jq coverage placeholder replaced;
    `grep -oP` → POSIX-safe; ADR-per-dep loop scoped to architectural deps.
  - SKILL.md 755 → 495 lines: report format/scoring → `references/report-template.md`;
    Phase 6 operating detail → `references/conformance-mode.md` (now the Phase 6
    source of truth). Husky v9+ plain-shell hook templates; `commitlint.config.mjs`
    canonical; **lint-staged added to fix prerequisites** (was unchecked — a conform
    run would have broken every commit); checklist + baseline refreshed.

- **PR #19 — `fix(skills): CC compliance check — first-parent no-merges + multi-scope regex`**
  - Found by the verification run: plain `git log` walks subtree-absorbed history and
    counts structural merge commits — shorestack read 62% (false High) vs a real 100%.
    Also widened the scope regex (multi-scope commas are legal commitlint) and softened
    the pnpm-audit note to "MAY fail with 410" (a pnpm 9 run succeeded locally).

## Verification run (shorestack, read-only)

Fixed checks confirmed on real data: direct-to-main → 0 candidates on a fully
squash-merged repo; large-commit check → real totals (the +35K/+43K Safe absorb),
no noise; `gitleaks git .` → 430 commits, clean; Changesets correctly recognized
as the CHANGELOG variant.

Shorestack scored **B (78/100)**. Real findings (reported only, nothing changed there):
no `/evals/` for the bot (High — the #135 incident is the case study), coverage
42.76% < 50% Tier 1 (High, already tracked in its FOLLOWUPS), branch protection
unenforced on `main` (High, likely a private-repo plan limit — worth an entry in its
`.claude/conformance-exceptions.md`), `.env.example` missing (Medium), 3 moderate
transitive CVEs (Low).

## Operational note

This session triggered (and then complied with) the shared-working-tree rule: early
branch/commit ran in `~/Projects/claude-skills` directly, inherited two sibling
commits, and was remediated via worktree + rebase. The rule is now codified in
CLAUDE.md by PR #20.

## Next session

1. Shorestack (own session): build the bot evals harness; ride-along fixes —
   `.env.example`, conformance-exceptions entry for branch protection.
2. Carried over from 2026-07-16: forward-port fleet-init `validator.sh` fixes to
   barrel-tracking's live `.fleet`; confirm the Mac Mini clone pulls cleanly.
3. Optional: exercise Conformance Mode (Phase 6) end-to-end on a small repo to
   live-verify the modernized templates (Husky v9+, `commitlint.config.mjs`).
