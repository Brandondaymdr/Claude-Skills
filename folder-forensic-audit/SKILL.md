---
name: folder-forensic-audit
description: >
  Deep forensic audit of project folder structure, documentation, Claude configuration, and
  overall project health against current best practices. Use this skill whenever the user wants
  to audit, review, clean up, optimize, or assess a project folder. Trigger on "audit",
  "folder audit", "project audit", "clean up my project", "optimize my repo", "check my folder
  structure", "is my project set up right", "forensic", "project health check", "folder health",
  "review my project setup", "are my docs up to date", or any variation of evaluating project
  organization and quality. Also trigger when a long-running project feels disorganized, when
  the user suspects docs are stale, or when Claude Code sessions are underperforming and the
  user wonders if project configuration is the issue. Works in both Claude Code and Cowork.
  Supports multi-agent orchestration in Claude Code for comprehensive parallel audits.
---

# Folder Forensic Audit

This skill performs a thorough audit of an existing project folder, evaluating its structure, documentation, Claude configuration, and overall health against current best practices. It produces an actionable report with findings, severity ratings, and specific fix recommendations.

Think of it as a code review, but for the project itself — the folder structure, the docs, the configuration, the developer experience.

## When to Run an Audit

- **Long-running projects** that have grown organically and may have accumulated debt
- **Before a major phase** (new feature, refactor, team expansion) to ensure the foundation is solid
- **When Claude sessions feel slow or confused** — poor project setup is often the root cause
- **After onboarding a new tool or framework** to check integration quality
- **Periodically** (monthly or quarterly) as maintenance hygiene

## Audit Architecture

The audit can run as a single agent (simpler, lower token cost) or as an agent team (thorough, parallel investigation). The choice depends on project size and how deep the user wants to go.

### Single-Agent Mode (Default)

Run all audit phases sequentially in one session. Good for small-to-medium projects or quick health checks.

### Multi-Agent Mode (Claude Code)

For large or complex projects, spawn an agent team where each agent audits a specific domain in parallel:

```
Team Lead: Orchestrates audit, synthesizes findings, produces final report

Agents:
├── structure-auditor    — Folder structure, file organization, naming
├── docs-auditor         — CLAUDE.md, README, docs/, all documentation
├── config-auditor       — .claude/ configuration, hooks, commands, rules, skills
├── code-health-auditor  — Tests, linting, types, build, dependencies
└── git-auditor          — Git history, branches, stashes, commit quality
```

See `agents/` directory for subagent definitions. To spawn the team:

"Create an agent team to audit this project. Spawn 5 auditors: structure, docs, config, code-health, and git. Each should investigate their domain and report findings with severity ratings. Synthesize into a single report when done."

## The Audit Phases

Whether running single-agent or multi-agent, these are the domains to investigate.

### Phase 1: Folder Structure Audit

Evaluate the project's file organization against best practices for its stack.

**What to check:**

```bash
# Get the full file tree (excluding common noise)
find . -not -path "./.git/*" -not -path "./node_modules/*" -not -path "./.next/*" -not -path "./venv/*" -not -path "./__pycache__/*" -not -path "./dist/*" -not -path "./build/*" | head -200

# Count files by extension
find . -type f -not -path "./.git/*" -not -path "./node_modules/*" | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -20

# Check for files in wrong places
ls *.ts *.js *.py 2>/dev/null  # Source files in root?
ls *.tmp *.bak *.log 2>/dev/null  # Temp files in root?

# Check directory depth (too deep = navigation nightmare)
find . -type d -not -path "./.git/*" -not -path "./node_modules/*" | awk -F/ '{print NF-1}' | sort -rn | head -5
```

**Evaluation criteria:**

| Finding | Severity | Example |
|---|---|---|
| Source files in project root | High | `index.ts` sitting next to `package.json` instead of in `src/` |
| No clear source/test separation | High | Tests mixed into source directories with no convention |
| Orphaned files | Medium | Files not imported/referenced by anything |
| Inconsistent naming | Medium | Mix of camelCase and kebab-case filenames |
| Overly deep nesting | Low | 6+ levels deep for source files |
| Missing standard directories | Low | No `docs/`, `scripts/`, or similar expected dirs |
| Temp files in tracked directories | High | `.tmp`, `.bak`, `.log` files committed |

### Phase 2: Documentation Audit

Evaluate all project documentation for completeness, accuracy, and freshness.

**CLAUDE.md audit:**

```bash
# Does it exist?
[ -f "CLAUDE.md" ] && echo "EXISTS" || echo "MISSING"

# How long is it?
wc -l CLAUDE.md 2>/dev/null

# Does it reference files that exist?
grep -oP '@\S+' CLAUDE.md 2>/dev/null | while read f; do
  [ ! -f "${f#@}" ] && echo "BROKEN REFERENCE: $f"
done

# Does it reference commands that work?
# (Extract commands from CLAUDE.md and test them)
```

**CLAUDE.md evaluation criteria:**

| Finding | Severity | Description |
|---|---|---|
| CLAUDE.md missing | Critical | No project instructions at all |
| Over 200 lines | High | Context bloat, instructions get ignored |
| Commands that don't work | High | Claude will fail on verification |
| Stale architecture description | High | Claude works from wrong mental model |
| No verification commands | High | Claude can't check its own work |
| Missing gotchas section | Medium | Known foot-guns undocumented |
| Broken @imports | Medium | Referenced files don't exist |
| Redundant instructions | Low | Things Claude already knows |
| No progressive disclosure | Low | Everything inlined instead of using skills/rules |

**README.md audit:**
- Does it exist?
- Are setup instructions accurate? (Do the commands actually work?)
- Does it describe the current architecture?
- Is it up to date with the latest changes?

**docs/ audit:**
- Do the files reflect current reality?
- Are there stale docs that describe removed features?
- Are there undocumented features that should have docs?

**ADR (Architecture Decision Record) audit:**

```bash
# Does docs/decisions/ exist?
[ -d "docs/decisions" ] && echo "EXISTS" || echo "MISSING"

# How many ADRs?
ls docs/decisions/*.md 2>/dev/null | grep -vE 'template|DECISIONS|README' | wc -l

# How old is the project?
PROJECT_AGE_DAYS=$(( ($(date +%s) - $(git log --reverse --format=%ct | head -1)) / 86400 ))

# Is there a DECISIONS.md index?
[ -f "docs/decisions/DECISIONS.md" ] && echo "INDEX EXISTS" || echo "INDEX MISSING"

# Every major (non-dev) dependency should have a corresponding ADR
if [ -f "package.json" ]; then
  jq -r '.dependencies | keys[]' package.json 2>/dev/null | while read dep; do
    grep -riq "$dep" docs/decisions/ 2>/dev/null || echo "MISSING ADR FOR DEP: $dep"
  done
fi
```

| Finding | Severity | Description |
|---|---|---|
| `docs/decisions/` missing on Tier 1 project | High | Architectural decisions never documented |
| `docs/decisions/` missing on project >30 days old | Medium | Should have had at least one decision by now |
| `DECISIONS.md` index missing | Medium | ADR discoverability problem |
| Major dependency without corresponding ADR | Medium | Decision not justified on record |
| ADRs exist but none reference current dependencies | High | ADRs are stale vs. code reality |

**CHANGELOG audit:**

```bash
# Does CHANGELOG.md exist?
[ -f "CHANGELOG.md" ] && echo "EXISTS" || echo "MISSING"

# When was it last touched?
LAST_CHANGELOG_COMMIT=$(git log -1 --format=%ct CHANGELOG.md 2>/dev/null)
DAYS_SINCE=$(( ($(date +%s) - LAST_CHANGELOG_COMMIT) / 86400 ))
echo "CHANGELOG last updated $DAYS_SINCE days ago"

# Does it have an [Unreleased] section?
grep -q '^## \[Unreleased\]' CHANGELOG.md && echo "UNRELEASED SECTION PRESENT" || echo "NO UNRELEASED SECTION"

# How many entries are in Unreleased?
awk '/^## \[Unreleased\]/,/^## \[/' CHANGELOG.md | grep -cE '^- '
```

| Finding | Severity | Description |
|---|---|---|
| `CHANGELOG.md` missing on Tier 1/2 project | Medium | No user-facing change record |
| CHANGELOG last updated >60 days ago for actively-developed project | Medium | Drift between code and docs |
| No `[Unreleased]` section | Low | Release process will be awkward |
| Unreleased section is empty but recent user-facing commits exist | High | Closeout habit broken — CHANGELOG not being maintained |

**CONTRIBUTING audit:**

```bash
# Does CONTRIBUTING.md exist?
[ -f "CONTRIBUTING.md" ] && echo "EXISTS" || echo "MISSING"

# Does it document commit format?
grep -iq 'conventional commits' CONTRIBUTING.md && echo "COMMIT FORMAT DOCUMENTED" || echo "COMMIT FORMAT NOT DOCUMENTED"

# Does it document PR workflow?
grep -iq 'pull request\|pr workflow\|branch' CONTRIBUTING.md && echo "PR WORKFLOW DOCUMENTED" || echo "PR WORKFLOW NOT DOCUMENTED"
```

| Finding | Severity | Description |
|---|---|---|
| `CONTRIBUTING.md` missing | Medium | Solo workflow not documented for future you |
| Commit format not documented | Medium | Developers won't know the conventional-commits requirement |
| PR/branching workflow not documented | Medium | "Why can't I push to main?" surprise |

**docs/WORKFLOW.md (golden path) audit:**

```bash
[ -f "docs/WORKFLOW.md" ] && echo "EXISTS" || echo "MISSING"
```

| Finding | Severity | Description |
|---|---|---|
| `docs/WORKFLOW.md` missing on Tier 1/2 project | Low | Golden-path doc not in place; minor — README often duplicates |

### Phase 3: Claude Configuration Audit

Evaluate the `.claude/` directory for completeness and effectiveness.

```bash
# What's configured?
find .claude/ -type f 2>/dev/null | sort

# Check settings.json
cat .claude/settings.json 2>/dev/null

# List commands
ls .claude/commands/ 2>/dev/null

# List rules
ls .claude/rules/ 2>/dev/null

# List skills
ls .claude/skills/ 2>/dev/null

# List agents
ls .claude/agents/ 2>/dev/null
```

**Evaluation criteria:**

| Finding | Severity | Description |
|---|---|---|
| No .claude/ directory | High | No Claude-specific configuration at all |
| No settings.json | Medium | Using default permissions (too many prompts) |
| No commands | Medium | Missed opportunity for workflow automation |
| No rules for distinct code areas | Medium | API, tests, components all treated the same |
| No hooks for verification | Medium | No automated linting/type-checking |
| Overly permissive settings | Low | `allow: ["Bash(*)"]` is dangerous |
| Overly restrictive settings | Low | Blocking commands Claude needs regularly |
| No project-specific skills | Low | Domain knowledge not captured |
| No subagent definitions | Low | No delegation available for complex tasks |

### Phase 4: Code Health Audit

Evaluate the project's development infrastructure.

```bash
# Check test infrastructure
[ -d "tests" ] || [ -d "__tests__" ] || [ -d "test" ] && echo "Test directory exists"
TEST_FILE_COUNT=$(find . -name "*.test.*" -o -name "*.spec.*" 2>/dev/null | grep -v node_modules | wc -l)
echo "Test files: $TEST_FILE_COUNT"

# Source-to-test ratio (Tier 1 should be >0.3)
SOURCE_FILE_COUNT=$(find src -name "*.ts" -o -name "*.tsx" -o -name "*.js" 2>/dev/null | grep -vE 'test|spec' | wc -l)
[ "$SOURCE_FILE_COUNT" -gt 0 ] && echo "Test/Source ratio: $(echo "scale=2; $TEST_FILE_COUNT / $SOURCE_FILE_COUNT" | bc)"

# Run tests with coverage
pnpm test -- --coverage 2>&1 | tail -30 || npm run test -- --coverage 2>&1 | tail -30

# Extract coverage percentage (Vitest/Istanbul format)
COVERAGE_PCT=$(pnpm test -- --coverage --reporter=json 2>/dev/null | jq -r '.coverageMap | ... ' 2>/dev/null || echo "UNKNOWN")
echo "Coverage: $COVERAGE_PCT"

# Check linting
pnpm lint 2>&1 | tail -20

# Check types
pnpm typecheck 2>&1 | tail -20 || pnpm exec tsc --noEmit 2>&1 | tail -20

# Check build
pnpm build 2>&1 | tail -20

# Check dependencies
pnpm outdated 2>/dev/null | head -20

# Check for security vulnerabilities
pnpm audit 2>/dev/null | tail -10

# Check for large files that shouldn't be committed
find . -size +5M -not -path "./.git/*" -not -path "./node_modules/*" | head -10

# Check .env hygiene
[ -f ".env.example" ] && echo ".env.example exists" || echo "MISSING .env.example"
grep -rn "sk-\|password=\|secret=" . --include="*.ts" --include="*.js" --include="*.py" --include="*.env" -l 2>/dev/null | grep -v node_modules | grep -v ".env.example"

# Evals presence (for AI-featured projects)
IS_AI_PROJECT="false"  # Determined from CLAUDE.md, package.json (openai/anthropic deps), or explicit metadata
grep -qiE '"(@anthropic-ai/sdk|openai|langchain|ai)"' package.json 2>/dev/null && IS_AI_PROJECT="true"

if [ "$IS_AI_PROJECT" = "true" ]; then
  [ -d "evals" ] && echo "EVALS DIR EXISTS" || echo "MISSING EVALS DIR (AI project)"
  DATASET_COUNT=$(find evals/datasets -name "*.jsonl" -o -name "*.json" 2>/dev/null | wc -l)
  echo "Eval datasets: $DATASET_COUNT"
  HISTORY_COUNT=$(ls evals/history/*.json 2>/dev/null | wc -l)
  echo "Eval history entries: $HISTORY_COUNT"
fi

# gitleaks scan (in addition to grep-based secret check)
gitleaks detect --no-git --verbose 2>&1 | tail -10 || echo "gitleaks not installed — recommend adding"
```

**Evaluation criteria:**

| Finding | Severity | Description |
|---|---|---|
| No tests | Critical | No way to verify correctness |
| Tests failing | High | Broken verification loop |
| No linter configured | High | No code quality enforcement |
| Lint errors | Medium | Accumulated code quality debt |
| Type errors | Medium | Type safety compromised |
| Build fails | Critical | Can't ship |
| Outdated dependencies (major) | Medium | Potential breaking changes and security risks |
| Security vulnerabilities | High | Known CVEs in dependencies |
| Secrets in code | Critical | Exposed credentials |
| Missing .env.example | Medium | Teammates can't set up environment |
| Large binary files committed | Medium | Repository bloat |
| Test coverage <50% on Tier 1 project | High | Money-touching code not sufficiently verified |
| Test/source file ratio <0.3 on Tier 1 project | Medium | Likely under-tested, not a hard cutoff |
| `/evals/` missing on AI-featured project | High | No way to catch agent regressions |
| `/evals/datasets/` empty on AI-featured project | High | Eval scaffolding exists but is unused |
| `/evals/history/` empty on AI-featured project | Medium | Evals have never been run and committed |
| gitleaks not installed / not in CI | High | Secret leak risk not mitigated |
| gitleaks finds matches | Critical | Potential credential exposure — investigate immediately |

### Phase 5: Git Health Audit

Evaluate git history and workflow hygiene.

```bash
# Branch inventory
git branch -a | head -20

# Stale branches (merged but not deleted)
git branch --merged main 2>/dev/null | grep -v main | grep -v "^\*"

# Stash inventory
git stash list

# Commit message quality (recent 20)
git log --oneline -20

# Check for large commits
git log --oneline --diff-filter=A --numstat | awk '{if ($1 > 500) print}' | head -10

# Check .gitignore coverage
git status --porcelain | head -20
[ -f ".gitignore" ] && echo ".gitignore exists" || echo "MISSING .gitignore"

# Conventional Commits compliance (last 50 commits)
CC_REGEX='^(feat|fix|docs|style|refactor|perf|test|chore|wip|build|ci|revert)(\([a-z0-9-]+\))?!?: .{1,}$'
TOTAL_50=$(git log --format=%s -50 | wc -l | tr -d ' ')
CONFORMING_50=$(git log --format=%s -50 | grep -cE "$CC_REGEX")
echo "Conventional Commits compliance (last 50): $CONFORMING_50 / $TOTAL_50"
CC_PCT=$(( (CONFORMING_50 * 100) / (TOTAL_50 > 0 ? TOTAL_50 : 1) ))
echo "Compliance percentage: ${CC_PCT}%"

# CI status of last 10 commits on main
gh run list --branch main --limit 10 --json conclusion,headSha,createdAt -q '.[] | "\(.createdAt) \(.conclusion) \(.headSha[:7])"' 2>/dev/null

# Branch protection status on main
gh api repos/:owner/:repo/branches/main/protection 2>/dev/null | jq -r '{
  requires_pr: .required_pull_request_reviews != null,
  requires_ci: .required_status_checks != null,
  enforces_admins: .enforce_admins.enabled,
  required_checks: (.required_status_checks.contexts // [])
}' || echo "NO BRANCH PROTECTION on main"

# Direct-to-main commits in last 30 days (should be 0 under the workflow)
DIRECT_COMMITS=$(git log --first-parent main --no-merges --since="30 days ago" --format=%H | while read sha; do
  # A commit is "direct" if it has no parent merge commit linking it to a PR
  PARENT_IS_MERGE=$(git log -1 --format=%P "$sha" | awk '{print NF}')
  [ "$PARENT_IS_MERGE" = "1" ] && echo "$sha"
done | wc -l | tr -d ' ')
echo "Direct-to-main commits (last 30d): $DIRECT_COMMITS"

# gitleaks scan of full history (catches secrets committed previously)
gitleaks detect --verbose --redact 2>&1 | tail -15 || echo "gitleaks not installed — install for history scan"
```

**Evaluation criteria:**

| Finding | Severity | Description |
|---|---|---|
| No .gitignore | Critical | Sensitive files at risk of being committed |
| Stale branches (10+) | Low | Clutter, but not harmful |
| Orphaned stashes | Low | Forgotten work |
| Poor commit messages | Medium | Can't understand project history |
| Uncommitted changes | Medium | Work at risk of being lost |
| Secrets in git history | Critical | Even if removed from HEAD, they're in history |
| Conventional Commits compliance <90% (last 50) | High | Commit discipline broken — commitlint likely not installed |
| Conventional Commits compliance <50% | Critical | No commit discipline at all — CHANGELOG, restart briefings, etc. all degraded |
| CI red on last commit to main | Critical | main is broken — no one should branch from it until fixed |
| CI red on more than 2 of last 10 main commits | High | CI is flaky or discipline is slipping |
| Branch protection not enabled on main | High | Nothing stopping direct-to-main commits |
| Branch protection does not require PR | High | Workflow rule "no direct commits to main" is unenforced |
| Branch protection does not require status checks | High | CI can be bypassed |
| Direct-to-main commits in last 30 days | High (Tier 1) / Medium (Tier 2) | Workflow discipline broken |

## Producing the Audit Report

After all phases, produce a structured report.

### Report Format

```markdown
# Project Audit Report: [Project Name]
Date: [date]
Auditor: Claude (session-forensic-audit)

## Executive Summary
[2-3 sentences: overall health assessment and top priority]

## Severity Summary
- Critical: [count]
- High: [count]
- Medium: [count]
- Low: [count]

## Findings

### Critical
1. **[Finding title]** — [Location/context]
   - Issue: [What's wrong]
   - Impact: [Why it matters]
   - Fix: [Specific steps to resolve]

### High
[Same format]

### Medium
[Same format]

### Low
[Same format]

## Recommendations
[Prioritized action plan — what to fix first, what can wait]

## Health Scorecard
| Domain | Weight | Score (0-max) | Notes |
|---|---|---|---|
| Folder Structure | 10 | [0-10] | [One-line summary] |
| Documentation | 15 | [0-15] | [One-line summary] |
| Claude Config | 10 | [0-10] | [One-line summary] |
| Code Health (general) | 15 | [0-15] | [One-line summary] |
| Testing Maturity | 20 | [0-20] | Coverage %, test/source ratio, regression test habit |
| Eval Coverage (AI projects) | 15 | [0-15] / N/A | Dataset size, history depth, threshold set |
| Commit Hygiene | 10 | [0-10] | Conventional Commits %, CI status, branch protection |
| Decision Documentation | 10 | [0-10] | ADR count, DECISIONS.md index, dependency ADRs |
| Git Hygiene (other) | 5 | [0-5] | Branch cleanup, stash hygiene, .gitignore |
| **Overall** | **100** | **[0-100]** | (Non-AI projects: renormalize to 85) |
```

### Scoring Guide

**Numeric scores are the source of truth.** Convert to a letter grade for quick scanning:

- **A (90-100):** Exemplary — follows best practices, minimal improvements possible
- **B (75-89):** Good — solid foundation with minor improvements available
- **C (60-74):** Adequate — functional but missing key best practices
- **D (40-59):** Below standard — significant gaps that impact development quality
- **F (<40):** Critical — fundamental issues that need immediate attention

**Per-dimension scoring hints:**

- **Testing Maturity (0-20):** 0 = no tests. 5 = smoke tests exist. 10 = unit tests for critical paths. 15 = coverage >50% and test/source ratio >0.3. 20 = coverage >75%, regression test habit observable (bug-fix commits always include test).
- **Eval Coverage (0-15):** 0 = no `/evals/`. 5 = scaffolded but empty. 10 = ≥20 dataset cases + threshold set. 15 = history of runs committed, evals wired into CI, regressions caught before merge.
- **Commit Hygiene (0-10):** 0 = <50% Conventional Commits compliance. 5 = ~75%. 8 = >90% + branch protection enabled. 10 = >95% + branch protection + CI required checks + direct-to-main count is 0.
- **Decision Documentation (0-10):** 0 = no `docs/decisions/`. 3 = directory exists but no ADRs. 6 = ≥3 ADRs + DECISIONS.md index. 10 = every major dependency and architectural choice has an ADR; ADRs referenced by recent commits.

**Tier 2 projects** should be graded more leniently on Eval Coverage, Testing Maturity, and Decision Documentation — they target lighter coverage by design. A B grade on a Tier 2 project for these dimensions is fine.

**Tier 3 projects** should not be audited with this scorecard at all — they're minimal by design. Audit Tier 3 only for a single check: does `STATUS.md` exist?

## Phase 6: Conformance Mode

Phases 1–5 are diagnostic — they read project state and produce a report. Phase 6 is the prescriptive counterpart: it applies fixes to bring the project into structural alignment with the canonical defaults in `DEFAULTS-ADR-0001.md` and `WORKFLOW-GOLDEN-PATH.md`.

Conformance is **opt-in**. The audit alone is safe to run anytime — it never writes. Conformance is invoked explicitly when the user is ready to retrofit.

### When to invoke

- **Retrofitting an older project** to current defaults (Phase 3 of the developer-transition plan)
- **After a major template update** — bring all downstream projects forward
- **First-time alignment** when adopting the project-template defaults on an existing repo

Trigger words: "conform", "align", "retrofit", "bring this project up to standard", "apply the defaults", "fix what the audit found", or an explicit `--conform` argument to the skill invocation.

### Pre-flight checks

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

### Naming variants

Real projects use legitimate alternates of canonical names. The skill recognizes these as **already present** — it does not try to create a duplicate, and it does not propose a rename unless the user explicitly asks for one (rename is Category C).

| Canonical | Recognized variants |
|---|---|
| `docs/decisions/` | `docs/adr/`, `docs/architecture-decisions/`, `docs/adrs/` |
| `docs/decisions/DECISIONS.md` | `docs/<variant>/DECISIONS.md`, `docs/<variant>/README.md`, `docs/<variant>/INDEX.md` |
| `.github/pull_request_template.md` | `.github/PULL_REQUEST_TEMPLATE.md`, `.github/PULL_REQUEST_TEMPLATE/*.md` |
| `commitlint.config.js` | `commitlint.config.{ts,mjs,cjs}`, `.commitlintrc`, `.commitlintrc.{json,yaml,yml,js}` |
| `CHANGELOG.md` | `CHANGES.md`, `HISTORY.md` (flag in report as "non-canonical name" but do not rename) |

If a variant is detected, the conformance run report includes a line under "Naming variants observed" so the user sees the divergence. Renames are surfaced as Category C — never auto-applied.

### The fix matrix

Fixes are graded by **safety**, not by audit-finding severity. Three categories. The full per-fix table with file paths and source-of-content pointers lives in `references/conformance-fix-matrix.md`.

#### Category A — Auto-apply (additive, file creation only)

These fixes only create files that don't exist. If the target file already exists, skip silently and note in the run report.

Examples (see fix matrix for the full list):
- `.husky/pre-commit`, `.husky/commit-msg`, `commitlint.config.js`
- `.github/workflows/ci.yml`, `.github/dependabot.yml`, `.github/pull_request_template.md`
- `docs/decisions/0000-template.md`, `docs/decisions/DECISIONS.md`
- `CHANGELOG.md` (Keep a Changelog skeleton), `CONTRIBUTING.md`, `docs/WORKFLOW.md`
- `.env.example` stub, `.claude/tier` (from pre-flight)

Each Category A fix lands as its own commit:

```
chore(conformance): add <file> from template
```

#### Category B — Apply with confirmation (modifies existing files or remote state)

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

**CLAUDE.md size handling.** Backfilling the 7 non-negotiable rules section adds ~30 lines. If applying that fix pushes `CLAUDE.md` over the 200-line guideline (from `project-kickoff`), the rules section still goes in — it's non-negotiable — but the run report surfaces a Category C follow-up: `"CLAUDE.md is now <N> lines (over 200). Extract gotchas, architecture detail, or convention prose to docs/ or .claude/rules/. Do NOT drop the rules section."` Never silently skip the rules to stay under the limit; the rules are higher-priority than the line count.

#### Category C — Never auto-apply (manual follow-up)

Surfaced in the report and the final PR description, but never executed:

- Restructure source directories
- Rename existing files (e.g. `docs/adr/` → `docs/decisions/`) — risk of breaking links + git history confusion
- Change package manager (lockfile regen + dependency audit required)
- Delete files or branches
- Modify source code
- Apply dependency upgrades (Dependabot's job)
- Resolve uncommitted changes (must be done before conformance starts)
- Trim oversized `CLAUDE.md` after a backfill push it over 200 lines (see Category B note above)

### Workflow

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

### PR description template

```markdown
## Conformance Run — YYYY-MM-DD

Brings the project into alignment with the canonical defaults in
`DEFAULTS-ADR-0001.md` and `WORKFLOW-GOLDEN-PATH.md`.

### Applied — Category A (additive)
- [x] `.husky/pre-commit`, `.husky/commit-msg`
- [x] `commitlint.config.js`
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

### Exceptions mechanism

Projects may intentionally diverge from defaults — a legacy npm project that can't migrate to pnpm, a CLI that doesn't need Husky, etc. Without a way to mark these, the audit will keep flagging them forever and the report becomes noise.

Track waivers in `.claude/conformance-exceptions.md`. Each exception must cite a project ADR justifying the divergence — divergence without a documented reason is debt, not a decision.

```markdown
# Conformance Exceptions

## Active exceptions

- **package-manager-field** — using npm instead of pnpm. See `docs/decisions/0007-keep-npm.md`.
- **husky-pre-commit**, **husky-commit-msg** — pre-commit hooks disabled for this CLI-only project. See `docs/decisions/0012-disable-husky.md`.
```

Format: each `<fix-id>` must match an ID from `references/conformance-fix-matrix.md`. To waive a group of related fixes (e.g. all Husky hooks), list each ID — there is no group-level waiver. Conformance reads this file during pre-flight and skips matching fixes. The PR description lists what was waived so the choice stays visible.

### What conformance doesn't do

- **Doesn't run tests, lint, or build.** That's the developer's job before merging the PR. Conformance lands the scaffolding; verification is the human's call.
- **Doesn't regenerate lockfiles.** If `package.json` scripts change, the user runs `pnpm install` and commits the lockfile separately.
- **Doesn't touch source code.** Pure scaffolding and config only.
- **Doesn't auto-merge.** Always produces a PR. The 10-minute cool-down applies (per `DEFAULTS-ADR-0001 §8`).
- **Doesn't bypass commitlint or pre-commit hooks** that already exist. If the project has commitlint installed, the conformance commits must conform — and they do (`chore(conformance):` is a valid Conventional Commits prefix).

## Cowork Mode Adaptations

When running in Cowork:

- Git operations may need `start_code_task` delegation
- Can't run tests/build/lint directly — note them as "unable to verify" and recommend the user run them
- Focus on file structure, documentation, and Claude configuration audits
- Produce the report as a markdown file in the workspace for the user to review
- Conformance Mode requires git write access — if Cowork can't delegate to a Claude Code session, surface the fix matrix as recommendations only, no commits

## Reference Files

- `references/audit-checklist.md` — Quick-reference checklist for running audits
- `references/best-practices-baseline.md` — Current best practices to audit against
- `references/conformance-fix-matrix.md` — Per-fix table for Phase 6: target file, category, source of content, inline templates
- `agents/` — Subagent definitions for multi-agent audit mode
