# Folder Forensic Audit Checklist

Quick-reference for running a project audit. Commands and severity tables: `SKILL.md`. Report structure and scoring: `report-template.md`.

---

## Folder Structure

- [ ] Source code in proper directory (src/, app/, etc.)
- [ ] Tests in dedicated directory or colocated with convention
- [ ] No source files loose in project root
- [ ] No temp files (.tmp, .bak, .log) in tracked directories
- [ ] Consistent file naming convention
- [ ] Reasonable nesting depth (under 5-6 levels)
- [ ] Standard directories present (docs/, scripts/ if applicable)
- [ ] No orphaned files (unreferenced by anything)

## CLAUDE.md

- [ ] Exists
- [ ] Under 200 lines
- [ ] Project overview present
- [ ] Architecture description current
- [ ] Tech stack documented
- [ ] All commands listed and working
- [ ] Code conventions documented (only non-obvious ones)
- [ ] Workflow documented
- [ ] Gotchas section present
- [ ] References to skills/rules/docs
- [ ] No redundant instructions
- [ ] @imports point to existing files
- [ ] Deletion test passed

## README.md

- [ ] Exists
- [ ] Setup instructions accurate
- [ ] Architecture described
- [ ] Up to date with current features

## Supporting Docs

- [ ] docs/ reflects current reality (no docs for removed features)
- [ ] docs/decisions/ (or recognized variant) exists on Tier 1 / 30+ day projects
- [ ] DECISIONS.md index present and current
- [ ] Major architectural dependencies have ADRs (frameworks, DBs, auth — not utility libs)
- [ ] ADRs reference current dependencies (not stale vs. code reality)
- [ ] CHANGELOG.md exists with an [Unreleased] section
- [ ] CHANGELOG updated within ~60 days on actively-developed projects
- [ ] CONTRIBUTING.md documents commit format and PR workflow
- [ ] docs/WORKFLOW.md (golden path) present on Tier 1/2

## .claude/ Configuration

- [ ] Directory exists
- [ ] settings.json with appropriate permissions
- [ ] Custom commands for common workflows
- [ ] Path-scoped rules for distinct code areas
- [ ] Project-specific skills for domain knowledge
- [ ] Subagent definitions for delegation
- [ ] Hooks for automated verification
- [ ] .claude/tier declared (1, 2, or 3)
- [ ] conformance-exceptions.md entries each cite an ADR (if file exists)

## Code Health

- [ ] Tests exist and pass
- [ ] Coverage >50% and test/source ratio >0.3 on Tier 1
- [ ] Linter configured and clean
- [ ] Type checking enabled and passing
- [ ] Build succeeds
- [ ] Dependencies up to date
- [ ] No known security vulnerabilities (audit via pnpm ≥11 — legacy endpoints return 410)
- [ ] gitleaks installed and in CI; no matches
- [ ] /evals/ with datasets + committed history (AI-featured projects)
- [ ] No secrets in codebase
- [ ] .env.example maintained
- [ ] Lock file committed

## Git Hygiene & Workflow

- [ ] .gitignore comprehensive
- [ ] Working tree clean
- [ ] No stale branches
- [ ] Descriptive commit messages
- [ ] Conventional Commits compliance ≥90% (last 50)
- [ ] Branch protection on main (PR + status checks required)
- [ ] CI green on main (last 10 commits)
- [ ] No verified direct-to-main commits in last 30 days
- [ ] No secrets in git history
- [ ] No large binaries in history
- [ ] Remote is connected and up to date
- [ ] No orphaned stashes

## Reporting

- [ ] Findings ranked by severity with specific fix recommendations
- [ ] Scorecard computed per report-template.md, tier-adjusted grading applied
- [ ] Conformance Mode (Phase 6) offered only on explicit opt-in — audit never writes
