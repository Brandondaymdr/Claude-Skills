# Conformance Mode — Operating Procedure

Full operating procedure for `folder-forensic-audit` Phase 6. SKILL.md carries the summary; this file is the source of truth for pre-flight checks, naming variants, category rules, prerequisites, the commit/PR workflow, and the exceptions mechanism. The per-fix inventory and inline templates live in `conformance-fix-matrix.md`.

## Pre-flight checks

Before writing anything:

1. **Tier check.** Read tier from `.claude/tier` (a single digit file containing `1`, `2`, or `3`).
   - **Tier 3:** Print `"Tier 3 project — conformance skipped by design. Tier 3 is minimal-by-design (see project-kickoff). If graduating to Tier 2, update STATUS.md, declare tier in .claude/tier, and re-run."` and exit.
   - **Tier missing:** Ask the user to declare. Persist to `.claude/tier`. Do not infer from CLAUDE.md content — the marker file is the only source of truth.
   - **Tier 1 or 2:** Proceed.

2. **Clean working tree.** Any uncommitted changes? Block until they're committed or stashed. Conformance does not run on a dirty tree — its commits must be unambiguous.

3. **Read exceptions.** If `.claude/conformance-exceptions.md` exists, parse it. Each listed exception ID is skipped during this run.

4. **Scan for naming variants.** Before deciding what's "missing," check for legitimate alternates of the canonical names (see "Naming variants" below). Variant detection updates the working "what's already present" set so Category A doesn't create duplicates.

5. **Branch handling.** Conformance commits land on a dedicated branch, never on `main`. Three cases:
   - **On `main` with clean tree:** create `chore/template-conformance-$(date +%Y%m%d)` and switch to it.
   - **On a feature branch with clean tree:** ask the user — proceed on current branch (stack the conformance commits on top of in-progress work), or stash + switch to a fresh conformance branch. Document the choice in the eventual PR description.
   - **On `main` and the conformance branch already exists from a previous attempt:** switch to it and continue; do not create a duplicate.

6. **Tool availability for remote-state fixes.** Some fixes touch remote state instead of files (`branch-protection` is the current example — see the fix matrix). Probe for the tooling each one needs before the run starts:

   ```bash
   # branch-protection needs an authenticated gh CLI (or equivalent API access)
   if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
     echo "gh available — remote-state fixes eligible"
   else
     echo "gh unavailable — remote-state fixes downgraded to Category C"
   fi
   ```

   If the tooling is absent, **auto-downgrade the affected fixes to Category C** — don't attempt them, don't error mid-run. The run report and PR description list each downgraded fix with the exact manual command the user can run themselves (for `branch-protection`, the full `gh api -X PUT repos/.../branches/main/protection ...` invocation from the fix matrix). A downgraded fix is not a skipped fix: it still appears in the report, just moved to the manual column with its command attached.

## Naming variants

Real projects use legitimate alternates of canonical names. The skill recognizes these as **already present** — it does not try to create a duplicate, and it does not propose a rename unless the user explicitly asks for one (rename is Category C).

| Canonical | Recognized variants |
|---|---|
| `docs/decisions/` | `docs/adr/`, `docs/architecture-decisions/`, `docs/adrs/` |
| `docs/decisions/DECISIONS.md` | `docs/<variant>/DECISIONS.md`, `docs/<variant>/README.md`, `docs/<variant>/INDEX.md` |
| `.github/pull_request_template.md` | `.github/PULL_REQUEST_TEMPLATE.md`, `.github/PULL_REQUEST_TEMPLATE/*.md` |
| `commitlint.config.mjs` | `commitlint.config.{js,ts,cjs}`, `.commitlintrc`, `.commitlintrc.{json,yaml,yml,js}` |
| `CHANGELOG.md` | `CHANGES.md`, `HISTORY.md` (flag in report as "non-canonical name" but do not rename); `.changeset/config.json` (Changesets auto-generates CHANGELOG at release time — do not scaffold a hand-maintained one) |

If a variant is detected, the conformance run report includes a line under "Naming variants observed" so the user sees the divergence. Renames are surfaced as Category C — never auto-applied.

**Sub-file targeting.** When a directory-level variant is detected (e.g. `docs/adr/`), subsequent fixes that target files inside the canonical directory (e.g. `docs/decisions/0000-template.md`) target the **variant directory** instead (e.g. `docs/adr/0000-template.md`). Otherwise variant recognition is meaningless — the canonical directory would be created next to the variant and the ADR template would land in the wrong place.

**ADR template format derivation.** Whenever the target decisions directory (canonical or variant) already contains one or more real ADRs, the `adr-template` fix does **not** use the canonical inline template. Instead it derives `0000-template.md` from the project's own ADRs:

1. Pick the most recently modified ADR file (excluding any existing `0000-template.md` and the index) as the format exemplar.
2. Copy its header structure exactly — heading style, metadata layout (`Date:` / `Status:` prose lines vs. a metadata table vs. YAML frontmatter), and section order.
3. Blank the values: replace the title with `[short noun phrase describing the decision]`, dates with `YYYY-MM-DD`, status with the project's own status vocabulary (use whatever word the exemplar uses for "accepted"), and section bodies with one-line placeholders.
4. Note in the run report which file served as the exemplar: `"adr-template derived from docs/adr/0007-*.md (metadata-table style)"`.

The canonical inline template is used only when the directory is empty or being created by this run. A template that visibly mismatches the project's existing ADRs is worse than no template — the next author will copy a real ADR anyway and the template rots.

## The fix matrix

Fixes are graded by **safety**, not by audit-finding severity. Three categories. The full per-fix table with file paths and source-of-content pointers lives in `references/conformance-fix-matrix.md`.

### Category A — Auto-apply (additive, file creation only)

These fixes only create files that don't exist. If the target file already exists, skip silently and note in the run report.

Examples (see fix matrix for the full list):
- `.husky/pre-commit`, `.husky/commit-msg`, `commitlint.config.mjs`
- `.github/workflows/ci.yml`, `.github/dependabot.yml`, `.github/pull_request_template.md`
- `docs/decisions/0000-template.md`, `docs/decisions/DECISIONS.md`
- `CHANGELOG.md` (Keep a Changelog skeleton), `CONTRIBUTING.md`, `docs/WORKFLOW.md`
- `.env.example` stub, `.claude/tier` (from pre-flight)

Each Category A fix lands as its own commit:

```
chore(conformance): add <file> from template
```

### Category B — Apply with confirmation (modifies existing files or remote state)

These fixes modify state that already exists. **Require explicit user confirmation before applying each one.** For file edits, show a diff preview first. For remote-state changes (e.g. GitHub API), show the exact command and what it will change, then confirm.

Examples (see fix matrix for the full list):
- `CLAUDE.md` — backfill the 7 non-negotiable workflow rules section
- `CLAUDE.md` — add the verification commands section
- `.github/workflows/ci.yml` — add `pr-age-check` job and gitleaks step if missing
- `package.json` — add `lint`, `typecheck`, `test`, `build` scripts if missing
- `.gitignore` — add `.env`, `node_modules`, `.DS_Store`, build outputs if missing
- Branch protection on `main` via `gh api` (no file commit, but document in PR description)

Each Category B fix lands as its own commit:

```
chore(conformance): update <file> — <what changed>
```

**CLAUDE.md rules backfill is diff-aware.** Before inserting the 7-rules section, scan the existing `CLAUDE.md` for each rule already documented elsewhere — projects often cover some of them under headings like "Tooling", "Hard conventions", or "Git workflow". For each of the 7 rules, search for its signature concepts (e.g. rule "Conventional Commits" → `commitlint`, `conventional commit`; rule "never commit to main" → `branch protection`, `feature branch`, `direct to main`; rule "PR cool-down" → `cool-down`, `10 minute`). Then:

- **No rules found:** insert the canonical section verbatim (the common case).
- **Some rules found:** insert the section, but for each already-covered rule replace its body with a pointer line — `N. **<rule name>** — see "<existing section heading>" below.` — keeping full text only for rules the file doesn't cover. The section must still enumerate all 7 so the contract is visible in one place; the pointers avoid stating one rule two ways that can drift apart.
- **All 7 found:** skip the insertion entirely and note in the run report: `"claude-md-rules skipped — all 7 rules already documented (sections: <list>)"`.

Since this is Category B, the diff preview shows exactly which rules got pointers vs. full text — the user confirms the classification before it lands. When in doubt about whether an existing passage really covers a rule (e.g. it mentions commits but not enforcement), treat the rule as missing and insert the full text; a duplicate is cheaper than a silently weakened contract.

**CLAUDE.md size handling.** Backfilling the 7 non-negotiable rules section adds ~30 lines. If applying that fix pushes `CLAUDE.md` over the 200-line guideline (from `project-kickoff`), the rules section still goes in — it's non-negotiable — but the run report surfaces a Category C follow-up: `"CLAUDE.md is now <N> lines (over 200). Extract gotchas, architecture detail, or convention prose to docs/ or .claude/rules/. Do NOT drop the rules section."` Never silently skip the rules to stay under the limit; the rules are higher-priority than the line count. The diff-aware pointer style above is also the primary tool for keeping the addition small in already-large files.

### Category C — Never auto-apply (manual follow-up)

Surfaced in the report and the final PR description, but never executed:

- Restructure source directories
- Rename existing files (e.g. `docs/adr/` → `docs/decisions/`) — risk of breaking links + git history confusion
- Change package manager (lockfile regen + dependency audit required)
- Delete files or branches
- Modify source code
- Apply dependency upgrades (Dependabot's job)
- Resolve uncommitted changes (must be done before conformance starts)
- Trim oversized `CLAUDE.md` after a backfill push it over 200 lines (see Category B note above)
- Install missing fix prerequisites (see "Fix prerequisites" below)
- Remote-state fixes whose tooling is absent — auto-downgraded here by pre-flight check 6, listed with the exact manual command

### Fix prerequisites

Some fixes have prerequisites — usually a devDependency that must be installed for the fix to be functional. Conformance **does not install dependencies** (that would require modifying `package.json` + regenerating the lockfile, which is Category C territory).

When a fix's prerequisite is missing, the fix is **skipped** and the missing prerequisite is surfaced as a Category C follow-up with the exact install command. After the user installs the prereq and re-runs conformance, the dependent fixes apply cleanly on the next run.

| Fix | Prerequisite | If missing, the run report surfaces |
|---|---|---|
| `commitlint-config` | `@commitlint/cli` in `package.json` devDependencies | `"Install commitlint: pnpm add -D @commitlint/cli @commitlint/config-conventional, then re-run conformance"` |
| `husky-commit-msg` | `@commitlint/cli` in devDependencies AND a commitlint config present (canonical or variant) | Same install command + note that the hook would fail without commitlint |
| `husky-pre-commit` (lint-staged line) | `lint-staged` in devDependencies | `"Install lint-staged: pnpm add -D lint-staged, then re-run conformance"` — without it the hook fails on every commit |
| `ci-gitleaks` step | none — gitleaks runs from a GitHub Action, no local install needed | (no prereq check) |
| `husky-pre-commit` gitleaks step append | `gitleaks` binary available locally OR a hook that doesn't fail when the binary is missing | If unsure, surface as Category C with install hint: `brew install gitleaks` or equivalent |

The prerequisite check happens **after** variant recognition but **before** the fix lands. A missing prereq is not a fatal error — conformance continues, just skips the dependent fix and adds the install command to the PR description's "Manual follow-up" section.

## Workflow

```bash
# 1. Pre-flight checks pass, branch is created

# 2. For each Category A fix:
#    - Check if target file exists; if so, skip (record in report)
#    - Write file from canonical source
#    - git add <file>
#    - git commit -m "chore(conformance): add <file> from template"

# 3. For each Category B fix:
#    - Show diff preview
#    - Confirm with user
#    - Apply
#    - git add <file>
#    - git commit -m "chore(conformance): update <file> — <what changed>"

# 4. Push the branch
git push -u origin HEAD

# 5. Open a PR — do NOT auto-merge, respects the 10-min cool-down
gh pr create --title "chore(conformance): align with project-template defaults" \
  --body "$(cat <<'EOF'
[PR description — see template below]
EOF
)"
```

## PR description template

```markdown
## Conformance Run — YYYY-MM-DD

Brings the project into alignment with the canonical defaults in
`DEFAULTS-ADR-0001.md` and `WORKFLOW-GOLDEN-PATH.md`.

### Applied — Category A (additive)
- [x] `.husky/pre-commit`, `.husky/commit-msg`
- [x] `commitlint.config.mjs`
- [x] `.github/workflows/ci.yml`
- [ ] `.github/dependabot.yml` — skipped, already exists

### Applied — Category B (modifications)
- [x] `CLAUDE.md` — added 7 non-negotiable rules section
- [x] `.gitignore` — added `.env`, `.DS_Store`, build outputs

### Manual follow-up — Category C
- Source files in project root — consider moving to `src/`
- Package manager is npm; defaults call for pnpm — see `DEFAULTS-ADR-0001 §1`
- Test coverage 22% — needs targeted regression test backfill

### Exceptions waived
- (any active entries from `.claude/conformance-exceptions.md`)

### Verification before merge
- `pnpm install` (regenerates lockfile if `package.json` was modified)
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` all green
- CI passes
- 10-minute cool-down per `DEFAULTS-ADR-0001 §8`
```

## Exceptions mechanism

Projects may intentionally diverge from defaults — a legacy npm project that can't migrate to pnpm, a CLI that doesn't need Husky, etc. Without a way to mark these, the audit will keep flagging them forever and the report becomes noise.

Track waivers in `.claude/conformance-exceptions.md`. Each exception must cite a project ADR justifying the divergence — divergence without a documented reason is debt, not a decision.

```markdown
# Conformance Exceptions

## Active exceptions

- **package-manager-field** — using npm instead of pnpm. See `docs/decisions/0007-keep-npm.md`.
- **husky-pre-commit**, **husky-commit-msg** — pre-commit hooks disabled for this CLI-only project. See `docs/decisions/0012-disable-husky.md`.
```

Format: each `<fix-id>` must match an ID from `references/conformance-fix-matrix.md`. To waive a group of related fixes (e.g. all Husky hooks), list each ID — there is no group-level waiver. Conformance reads this file during pre-flight and skips matching fixes. The PR description lists what was waived so the choice stays visible.

## What conformance doesn't do

- **Doesn't run tests, lint, or build.** That's the developer's job before merging the PR. Conformance lands the scaffolding; verification is the human's call.
- **Doesn't regenerate lockfiles.** If `package.json` scripts change, the user runs `pnpm install` and commits the lockfile separately.
- **Doesn't touch source code.** Pure scaffolding and config only.
- **Doesn't auto-merge.** Always produces a PR. The 10-minute cool-down applies (per `DEFAULTS-ADR-0001 §8`).
- **Doesn't bypass commitlint or pre-commit hooks** that already exist. If the project has commitlint installed, the conformance commits must conform — and they do (`chore(conformance):` is a valid Conventional Commits prefix).
