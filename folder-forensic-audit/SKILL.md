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

See `agents/` directory for subagent definitions. Note these files are prompt definitions local to this skill — they are **not** auto-registered agent types (only `.claude/agents/` is). Spawn each auditor as a general-purpose agent, passing the definition file's body as its prompt, and synthesize the five reports into one. In sessions where the Workflow tool is available, the auditors can instead run as a single parallel workflow — but only with the user's explicit opt-in to multi-agent orchestration.

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

# Does it reference files that exist? (-o with a POSIX class — BSD grep has no -P)
grep -o '@[^[:space:]]*' CLAUDE.md 2>/dev/null | while read f; do
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

# Major (non-dev) dependencies should have a corresponding ADR. Apply judgment to
# the output: frameworks, databases, auth, and infra choices need ADRs — utility
# libraries (zod, clsx, date-fns) do not. Report the architectural hits only.
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

# How many entries are in Unreleased? (flag scan — a /start/,/end/ range would
# close on the header line itself, since it matches both patterns, and always count 0)
awk '/^## \[Unreleased\]/{f=1; next} /^## \[/{f=0} f' CHANGELOG.md | grep -cE '^- '
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

# Extract coverage % from the Istanbul text summary ("All files" row, statements column)
COVERAGE_PCT=$(pnpm test -- --coverage 2>/dev/null | grep -E '^All files' | awk -F'|' '{gsub(/ /,"",$2); print $2}')
echo "Coverage (statements %): ${COVERAGE_PCT:-UNKNOWN}"

# Check linting
pnpm lint 2>&1 | tail -20

# Check types
pnpm typecheck 2>&1 | tail -20 || pnpm exec tsc --noEmit 2>&1 | tail -20

# Check build
pnpm build 2>&1 | tail -20

# Check dependencies
pnpm outdated 2>/dev/null | head -20

# Check for security vulnerabilities.
# NOTE: npm retired the legacy audit endpoints (2026-07). `pnpm audit` on pnpm ≤10
# returns HTTP 410 — that's plumbing, not a CVE. Run the audit through pnpm ≥11
# (e.g. `pnpm dlx pnpm@11 audit --prod`) or an OSV-based scanner instead.
pnpm audit 2>&1 | tail -10

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
# `gitleaks dir` is the v8.19+ form; `detect --no-git` is its deprecated alias
gitleaks dir . --verbose 2>&1 | tail -10 || echo "gitleaks not installed — recommend adding"
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
| `pnpm audit` returns HTTP 410 | Low | Legacy npm audit endpoint retired (2026-07) — tooling gap, not a vulnerability; audit via pnpm ≥11 |

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

# Check for large commits (>500 lines added across all files, last 50 commits)
git log -50 --format='%h' | while read h; do
  ADDED=$(git show --numstat --format= "$h" | awk '{s+=$1} END {print s+0}')
  [ "$ADDED" -gt 500 ] && echo "$h: +$ADDED lines"
done | head -10

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

# Direct-to-main candidates, last 30 days (should be 0 under the workflow).
# --no-merges drops merge commits; squash-merged PRs carry GitHub's "(#N)" subject
# suffix. What's left is a CANDIDATE — rebase-merge workflows produce PR commits
# without the suffix, so verify each hit before flagging:
#   gh api "repos/{owner}/{repo}/commits/<sha>/pulls"   (empty array = truly direct)
git log --first-parent main --no-merges --since="30 days ago" --format='%h %s' \
  | grep -vE '\(#[0-9]+\)$' || echo "(none)"

# gitleaks scan of full history (catches secrets committed previously)
# `gitleaks git` is the v8.19+ form; bare `detect` is its deprecated alias
gitleaks git . --verbose --redact 2>&1 | tail -15 || echo "gitleaks not installed — install for history scan"
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
| Verified direct-to-main commits in last 30 days | High (Tier 1) / Medium (Tier 2) | Workflow discipline broken — verify candidates via `gh api .../pulls` before flagging |

## Producing the Audit Report

After all phases, produce a structured report.

The canonical report structure and scoring guide live in `references/report-template.md` — executive summary, severity summary, findings grouped by severity (issue / impact / fix), prioritized recommendations, and a 9-dimension weighted health scorecard (100 points; non-AI projects renormalize to 85). Numeric scores are the source of truth; letter grades (A ≥90, B 75–89, C 60–74, D 40–59, F <40) are for quick scanning.

Key grading rules:

- **Tier 2 projects** are graded more leniently on Eval Coverage, Testing Maturity, and Decision Documentation — lighter coverage is by design; a B there is fine.
- **Tier 3 projects** skip the scorecard entirely. Audit Tier 3 for a single check: does `STATUS.md` exist?

## Phase 6: Conformance Mode

Phases 1–5 are diagnostic — they read project state and produce a report. Phase 6 is the prescriptive counterpart: it applies fixes to bring the project into structural alignment with the canonical defaults in `DEFAULTS-ADR-0001.md` and `WORKFLOW-GOLDEN-PATH.md`.

Conformance is **opt-in**. The audit alone is safe to run anytime — it never writes. Conformance is invoked explicitly when the user is ready to retrofit.

### When to invoke

- **Retrofitting an older project** to current defaults (Phase 3 of the developer-transition plan)
- **After a major template update** — bring all downstream projects forward
- **First-time alignment** when adopting the project-template defaults on an existing repo

Trigger words: "conform", "align", "retrofit", "bring this project up to standard", "apply the defaults", "fix what the audit found", or an explicit `--conform` argument to the skill invocation.

**The full operating procedure lives in `references/conformance-mode.md` — read it before running conformance.** It is the source of truth for pre-flight checks, naming-variant recognition, ADR template derivation, the diff-aware CLAUDE.md backfill, fix prerequisites, the commit/PR workflow, and the exceptions mechanism (`.claude/conformance-exceptions.md`). The per-fix inventory with IDs, categories, and inline templates is `references/conformance-fix-matrix.md`.

### The shape of a run

1. **Pre-flight.** Tier gate via `.claude/tier` (Tier 3 = no-op by design; missing = ask the user and persist). Clean working tree required. Read exception waivers. Scan for naming variants so Category A doesn't create duplicates. Create or reuse a `chore/template-conformance-YYYYMMDD` branch — conformance never commits to `main`. Probe tooling for remote-state fixes (e.g. `gh` for branch protection); absent tooling auto-downgrades those fixes to Category C with the exact manual command attached.
2. **Category A — auto-apply.** Additive file creation only (hooks, CI workflow, doc skeletons, templates). Existing files and recognized variants are skipped silently and noted in the run report. One commit per fix: `chore(conformance): add <file> from template`.
3. **Category B — apply with confirmation.** Modifies existing files or remote state (CLAUDE.md backfills, CI job additions, package scripts, `.gitignore` entries, branch protection). Diff preview and explicit user confirmation per fix; one commit each: `chore(conformance): update <file> — <what changed>`.
4. **Category C — never auto-apply.** Restructures, renames, deletions, source-code changes, package-manager migration, dependency upgrades, prerequisite installs. Surfaced in the run report and PR description only.
5. **Finish.** Push the branch and open a PR using the template in `references/conformance-mode.md`. Never auto-merge — the 10-minute cool-down applies.

### Hard rules regardless of category

- **Fixes are graded by safety, not audit-finding severity.**
- **Doesn't run tests, lint, or build** — verification before merge is the human's call.
- **Doesn't regenerate lockfiles, touch source code, or install dependencies.** A fix whose prerequisite is missing (commitlint, lint-staged, gitleaks) is skipped and surfaced as Category C with the install command.
- **Doesn't bypass existing hooks** — conformance commits themselves conform.

### Known limitations and manual workarounds

None currently open. The three gaps recorded here after the shorestack test run (2026-05-23) were patched on 2026-07-16 into what is now `references/conformance-mode.md`: append-only CLAUDE.md backfill → "CLAUDE.md rules backfill is diff-aware" (Category B); ADR template format mismatch → "ADR template format derivation" (Naming variants); remote-state tool availability → pre-flight check 6.

When a new gap is discovered mid-run, record it here so it doesn't get lost between conformance runs. When patching, update the relevant section of `references/conformance-mode.md` and remove the entry from this list.

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
- `references/report-template.md` — Canonical report structure and scoring guide for Phases 1–5
- `references/conformance-mode.md` — Full Phase 6 operating procedure: pre-flight, variants, category rules, prerequisites, workflow, exceptions
- `references/conformance-fix-matrix.md` — Per-fix table for Phase 6: target file, category, source of content, inline templates
- `agents/` — Subagent definitions for multi-agent audit mode (prompt files, not auto-registered agent types)
