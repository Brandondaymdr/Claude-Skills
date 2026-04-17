# Project Kickoff Checklist

Quick-reference checklist for project initialization. Use this as a final pass to make sure nothing was missed.

---

## Repository Foundation

- [ ] Git initialized (`git init`)
- [ ] `.gitignore` created with stack-appropriate entries
- [ ] `.env.example` created with all required variables (no actual values)
- [ ] `.env` / `.env.local` added to `.gitignore`
- [ ] Initial commit created

## CLAUDE.md

- [ ] Project overview (1-2 lines)
- [ ] Architecture summary (with diagram if non-trivial)
- [ ] Tech stack listed with versions
- [ ] All development commands documented
- [ ] Code conventions that differ from defaults
- [ ] Workflow rules (branching, commits, PRs)
- [ ] Project-specific gotchas documented
- [ ] References to skills, rules, and docs
- [ ] Under 200 lines total
- [ ] Deletion test passed (every line is necessary)

## .claude/ Configuration

- [ ] `settings.json` with appropriate allow/deny lists
- [ ] `settings.local.json` gitignored
- [ ] `CLAUDE.local.md` gitignored

### Commands (at minimum)
- [ ] `dev.md` — start development environment
- [ ] `test.md` — run tests with optional filter
- [ ] `review.md` — code review checklist

### Rules (if applicable)
- [ ] Path-scoped rules for distinct code areas
- [ ] API conventions (if project has API routes)
- [ ] Testing conventions
- [ ] Component conventions (if frontend)

### Skills (if applicable)
- [ ] Domain-specific skills identified and created
- [ ] Existing user skills audited for relevance

### Agents (if applicable)
- [ ] Code reviewer agent
- [ ] Research agent (for large codebases)

## Verification Setup

- [ ] Linter configured and running (ESLint, Ruff, etc.)
- [ ] Formatter configured (Prettier, Black, etc.)
- [ ] Type checking enabled (TypeScript strict, mypy, etc.)
- [ ] Test framework set up with at least one passing test
- [ ] Build command works successfully
- [ ] Hooks configured for automated verification (PostToolExecution lint/typecheck)

## Documentation

- [ ] README.md with:
  - [ ] Project name and description
  - [ ] Quick start instructions
  - [ ] Architecture overview
  - [ ] Contributing guidelines (if team/open source)
- [ ] `docs/` directory for extended documentation (if needed)

## Project Structure

- [ ] Source code in `src/` (or framework convention)
- [ ] Tests in `tests/` (or colocated with source)
- [ ] Scripts in `scripts/` (if any utility scripts)
- [ ] Assets in `public/` or `assets/`
- [ ] No orphan files in project root (everything has a home)

## Deployment & CI (if applicable)

- [ ] Deployment config created (vercel.json, Dockerfile, etc.)
- [ ] CI/CD pipeline basics (GitHub Actions, etc.)
- [ ] Preview/staging environment configured

## Skill Audit

- [ ] User's installed skills scanned
- [ ] Relevant skills identified for this project
- [ ] Skill gaps identified with recommendations
- [ ] Stack-specific plugins/community skills checked

## Handoff

- [ ] Summary presented to user
- [ ] Next steps identified
- [ ] First features/tasks outlined
- [ ] Session management tips shared (/clear, Plan Mode, etc.)
