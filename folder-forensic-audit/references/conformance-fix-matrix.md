# Conformance Fix Matrix

Quick reference for `folder-forensic-audit` Phase 6 — what conformance writes, in what category, and where the canonical source lives.

## Tier gating

| Project tier | Conformance behavior |
|---|---|
| Tier 1 (production / money-touching) | Run full matrix |
| Tier 2 (internal tools) | Run full matrix |
| Tier 3 (experimental / archived) | No-op — exit with instructions to graduate first |

## Variant recognition (pre-check before Category A)

Before applying any Category A fix, scan for legitimate naming alternates. Variants count as "already present" — do not create a duplicate.

| Canonical | Recognized as already-present if any of these exist |
|---|---|
| `docs/decisions/` | `docs/adr/`, `docs/architecture-decisions/`, `docs/adrs/` |
| `docs/decisions/DECISIONS.md` | `docs/<variant>/DECISIONS.md`, `docs/<variant>/README.md`, `docs/<variant>/INDEX.md` |
| `.github/pull_request_template.md` | `.github/PULL_REQUEST_TEMPLATE.md`, `.github/PULL_REQUEST_TEMPLATE/*.md` |
| `commitlint.config.mjs` | `commitlint.config.{js,ts,cjs}`, `.commitlintrc`, `.commitlintrc.{json,yaml,yml,js}` |
| `CHANGELOG.md` | `CHANGES.md`, `HISTORY.md` (flag as non-canonical, do not rename); `.changeset/config.json` (Changesets — auto-generates CHANGELOG, do not scaffold) |

Detected variants are listed in the run report under "Naming variants observed." Renames are surfaced as Category C — never auto-applied.

**Sub-file targeting.** When a directory-level variant is detected (e.g. `docs/adr/`), file-level fixes scoped to the canonical directory (e.g. `docs/decisions/0000-template.md`) target the **variant directory** instead (e.g. `docs/adr/0000-template.md`).

## Fix prerequisites (pre-check before Category A/B)

Some fixes have prerequisites that conformance does not install. If a prereq is missing, the fix is skipped and the install command goes into the PR description's "Manual follow-up" section.

| Fix ID | Prerequisite check | Install command surfaced if missing |
|---|---|---|
| `commitlint-config` | `@commitlint/cli` in `package.json` devDependencies | `pnpm add -D @commitlint/cli @commitlint/config-conventional` |
| `husky-commit-msg` | `@commitlint/cli` in devDependencies AND a commitlint config (canonical or variant) | Same as above; hook would fail without commitlint |
| `husky-pre-commit` (lint-staged line) | `lint-staged` in devDependencies | `pnpm add -D lint-staged` — without it the hook fails on every commit |
| `husky-pre-commit` gitleaks append | `gitleaks` binary available locally | `brew install gitleaks` (or platform equivalent) |

Prerequisite checks happen **after** variant recognition but **before** the fix lands.

## Category A — Additive (auto-apply, one commit each)

These fixes **only create files that don't exist** (including variants per the table above). If the target or a recognized variant exists, skip silently and note in the run report.

| Fix ID | Target file | Source of content |
|---|---|---|
| `husky-pre-commit` | `.husky/pre-commit` | Inline below |
| `husky-commit-msg` | `.husky/commit-msg` | Inline below |
| `commitlint-config` | `commitlint.config.mjs` | Inline below |
| `ci-workflow` | `.github/workflows/ci.yml` | `project-kickoff/SKILL.md` Step 6 Layer 4 |
| `dependabot` | `.github/dependabot.yml` | `DEFAULTS-ADR-0001.md` §10 |
| `pr-template` | `.github/pull_request_template.md` | `project-kickoff/SKILL.md` Step 6 Layer 5 |
| `env-example-stub` | `.env.example` | Inline below |
| `adr-template` | `docs/decisions/0000-template.md` | Inline below when the decisions dir is empty/new; derived from the project's most recent existing ADR otherwise (see "ADR template format derivation" in SKILL.md) |
| `decisions-index` | `docs/decisions/DECISIONS.md` | Inline below |
| `changelog` | `CHANGELOG.md` | Inline below |
| `contributing` | `CONTRIBUTING.md` | Inline below |
| `workflow-doc` | `docs/WORKFLOW.md` | `WORKFLOW-GOLDEN-PATH.md` in this repo (copy verbatim) |
| `tier-marker` | `.claude/tier` | User-declared during pre-flight, one digit (`1`, `2`, or `3`) |
| `exceptions-stub` | `.claude/conformance-exceptions.md` | Inline below |

## Category B — Modifications (apply with confirmation, one commit each)

These fixes **modify existing files**. Show a diff preview and require user confirmation before applying.

| Fix ID | Target | What it adds / changes |
|---|---|---|
| `claude-md-rules` | `CLAUDE.md` | The 7 non-negotiable workflow rules section (from `project-kickoff/SKILL.md` Step 3 template); diff-aware — rules already documented in the file become pointer lines, and the fix is skipped when all 7 are covered (see "CLAUDE.md rules backfill is diff-aware" in SKILL.md) |
| `claude-md-verify` | `CLAUDE.md` | The verification commands section, if missing |
| `claude-md-skills-refs` | `CLAUDE.md` | The "Skills & References" footer, if missing |
| `husky-hook-append` | `.husky/<hook>` | Append missing entries to existing hook file with comment marker |
| `ci-pr-age-check` | `.github/workflows/ci.yml` | `pr-age-check` job, if missing |
| `ci-gitleaks` | `.github/workflows/ci.yml` | gitleaks scan step in the verify job, if missing |
| `package-scripts` | `package.json` | `lint`, `typecheck`, `test`, `build` scripts, if missing |
| `package-manager-field` | `package.json` | `"packageManager": "pnpm@<version>"` field per DEFAULTS-ADR-0001 §1 |
| `branch-protection` | GitHub API (no file commit) | Enable required PR + required status checks on `main`. Requires an authenticated `gh` CLI — pre-flight check 6 probes for it and auto-downgrades this fix to Category C (with the manual `gh api` command) when absent |
| `gitignore-entries` | `.gitignore` | `.env`, `node_modules`, `.DS_Store`, `dist`, `build`, `.next`, `coverage` if missing |

## Category C — Never auto-apply (surface in PR description only)

- Restructure source directories (e.g., move root-level source files into `src/`)
- Rename existing files (breaks imports)
- Change package manager (lockfile regeneration + dependency audit required)
- Delete files of any kind
- Delete stale branches
- Modify source code
- Apply dependency upgrades (Dependabot's job)
- Resolve uncommitted changes (must be clean before conformance starts)
- Trim an oversized `CLAUDE.md` after a rules backfill pushes it over 200 lines
- Install missing fix prerequisites (commitlint, lint-staged, gitleaks — see prerequisites table)
- Remote-state fixes whose tooling is absent (auto-downgraded by pre-flight, listed with the exact manual command)

---

## Inline templates

### `.husky/pre-commit`

Husky v9+ hooks are plain shell scripts — the old `. "$(dirname -- "$0")/_/husky.sh"` bootstrap header is deprecated in v9 and removed in v10; do not include it.

```bash
pnpm exec lint-staged
pnpm exec gitleaks git --pre-commit --staged --verbose --redact
```

(`gitleaks git --pre-commit --staged` is the v8.19+ form; `gitleaks protect --staged` is its deprecated alias.)

### `.husky/commit-msg`

```bash
pnpm exec commitlint --edit "$1"
```

### `commitlint.config.mjs`

The `.mjs` extension loads as ESM regardless of the project's `"type"` field — a bare `.js` with `export default` breaks in CJS projects.

```js
export default { extends: ['@commitlint/config-conventional'] };
```

### `CHANGELOG.md` skeleton

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

### Removed
```

### `docs/decisions/DECISIONS.md` skeleton

```markdown
# Decision Index

| # | Title | Status | Date |
|---|---|---|---|

<!-- Add one row per ADR. Keep newest at the bottom. -->
```

### `docs/decisions/0000-template.md`

```markdown
# ADR NNNN: <Title>

Date: YYYY-MM-DD
Status: Proposed | Accepted | Superseded by ADR NNNN | Deprecated

## Context

What's the situation that forced this decision? What constraints apply?

## Decision

What did we decide? Be specific — name the library, the pattern, the
trade-off taken.

## Consequences

What gets easier? What gets harder? What did we give up?

## Revisit triggers

Under what conditions should we reopen this decision?
```

### `.env.example` stub

```
# Environment variables required by this project.
# Copy this file to `.env` and fill in real values.
# Never commit `.env` — it is gitignored.
```

### `CONTRIBUTING.md` skeleton

Outer fence uses four backticks so the inner triple-backtick code blocks render correctly:

````markdown
# Contributing

## Workflow

This project follows the golden-path workflow documented in
`docs/WORKFLOW.md`. The short version:

```
pull main → branch → code → commit (conventional) → push → PR → CI green
       → 10-min cool-down → self-review → merge → update CHANGELOG/ADR → closeout
```

## Commit format

Conventional Commits, no exceptions:

```
<type>(<scope>): <subject>

<body>
```

Valid types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`,
`chore`, `wip`, `build`, `ci`, `revert`. Commitlint enforces this on
every commit via the `.husky/commit-msg` hook.

## Branching

Branch prefix matches the commit type: `feat/...`, `fix/...`, `chore/...`,
`docs/...`, `refactor/...`, `experiment/...`.

## Pull requests

- Self-merge is allowed but requires a 10-minute cool-down after opening
  (CI enforces via `pr-age-check`).
- Re-read the diff top-to-bottom before merging — fresh eyes catch ~1 in 5.
- Exceptions: `chore(deps):` and `docs:` PRs can merge immediately if CI is green.

## Architectural decisions

Every architectural decision gets an ADR in `docs/decisions/NNNN-slug.md`
before the PR merges. Update `docs/decisions/DECISIONS.md` in the same PR.
````

### `.claude/conformance-exceptions.md` stub

```markdown
# Conformance Exceptions

This project intentionally diverges from project-template defaults in
the ways listed below. Each exception must cite a project ADR.

## Active exceptions

(none)

## Format

- **<fix-id>** — <one-line reason>. See `docs/decisions/NNNN-<slug>.md`.

Valid `<fix-id>` values come from the conformance fix matrix:
`folder-forensic-audit/references/conformance-fix-matrix.md`.
```
