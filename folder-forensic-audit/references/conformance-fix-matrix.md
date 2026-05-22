# Conformance Fix Matrix

Quick reference for `folder-forensic-audit` Phase 6 — what conformance writes, in what category, and where the canonical source lives.

## Tier gating

| Project tier | Conformance behavior |
|---|---|
| Tier 1 (production / money-touching) | Run full matrix |
| Tier 2 (internal tools) | Run full matrix |
| Tier 3 (experimental / archived) | No-op — exit with instructions to graduate first |

## Category A — Additive (auto-apply, one commit each)

These fixes **only create files that don't exist**. If the target exists, skip silently and note in the run report.

| Fix ID | Target file | Source of content |
|---|---|---|
| `husky-pre-commit` | `.husky/pre-commit` | Inline below |
| `husky-commit-msg` | `.husky/commit-msg` | Inline below |
| `commitlint-config` | `commitlint.config.js` | Inline below |
| `ci-workflow` | `.github/workflows/ci.yml` | `project-kickoff/SKILL.md` Step 6 Layer 4 |
| `dependabot` | `.github/dependabot.yml` | `DEFAULTS-ADR-0001.md` §10 |
| `pr-template` | `.github/pull_request_template.md` | `project-kickoff/SKILL.md` Step 6 Layer 5 |
| `env-example-stub` | `.env.example` | Inline below |
| `adr-template` | `docs/decisions/0000-template.md` | Inline below |
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
| `claude-md-rules` | `CLAUDE.md` | The 7 non-negotiable workflow rules section (from `project-kickoff/SKILL.md` Step 3 template) |
| `claude-md-verify` | `CLAUDE.md` | The verification commands section, if missing |
| `claude-md-skills-refs` | `CLAUDE.md` | The "Skills & References" footer, if missing |
| `husky-hook-append` | `.husky/<hook>` | Append missing entries to existing hook file with comment marker |
| `ci-pr-age-check` | `.github/workflows/ci.yml` | `pr-age-check` job, if missing |
| `ci-gitleaks` | `.github/workflows/ci.yml` | gitleaks scan step in the verify job, if missing |
| `package-scripts` | `package.json` | `lint`, `typecheck`, `test`, `build` scripts, if missing |
| `package-manager-field` | `package.json` | `"packageManager": "pnpm@<version>"` field per DEFAULTS-ADR-0001 §1 |
| `branch-protection` | GitHub API (no file commit) | Enable required PR + required status checks on `main` |
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

---

## Inline templates

### `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm exec lint-staged
pnpm exec gitleaks protect --staged --verbose --redact
```

### `.husky/commit-msg`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm exec commitlint --edit "$1"
```

### `commitlint.config.js`

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

```markdown
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
```

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
