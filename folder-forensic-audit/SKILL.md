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
find . -name "*.test.*" -o -name "*.spec.*" | wc -l  # Count test files

# Run tests if possible
npm run test 2>&1 | tail -20  # or pytest, etc.

# Check linting
npm run lint 2>&1 | tail -20  # or ruff, etc.

# Check types
npx tsc --noEmit 2>&1 | tail -20  # or mypy, etc.

# Check build
npm run build 2>&1 | tail -20

# Check dependencies
npm outdated 2>/dev/null | head -20  # or pip list --outdated

# Check for security vulnerabilities
npm audit 2>/dev/null | tail -10

# Check for large files that shouldn't be committed
find . -size +5M -not -path "./.git/*" -not -path "./node_modules/*" | head -10

# Check .env hygiene
[ -f ".env.example" ] && echo ".env.example exists" || echo "MISSING .env.example"
grep -rn "sk-\|password=\|secret=" . --include="*.ts" --include="*.js" --include="*.py" --include="*.env" -l 2>/dev/null | grep -v node_modules | grep -v ".env.example"
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
| Domain | Score | Notes |
|---|---|---|
| Folder Structure | [A-F] | [One-line summary] |
| Documentation | [A-F] | [One-line summary] |
| Claude Config | [A-F] | [One-line summary] |
| Code Health | [A-F] | [One-line summary] |
| Git Hygiene | [A-F] | [One-line summary] |
| **Overall** | **[A-F]** | |
```

### Scoring Guide

- **A**: Exemplary — follows best practices, minimal improvements possible
- **B**: Good — solid foundation with minor improvements available
- **C**: Adequate — functional but missing key best practices
- **D**: Below standard — significant gaps that impact development quality
- **F**: Critical — fundamental issues that need immediate attention

## Auto-Fix Mode

After presenting the report, offer to fix issues automatically:

"I found [X] issues. Want me to fix them? I can handle [list fixable items] automatically. [List items requiring decisions] need your input."

Fixable automatically:
- Create missing .claude/ structure
- Add missing .gitignore entries
- Create .env.example from .env
- Delete temp files
- Create stub CLAUDE.md from README + package.json
- Add missing commands for common scripts
- Create path-scoped rules from CLAUDE.md content that should be extracted

Requires user input:
- Architecture changes to CLAUDE.md
- Restructuring source directories
- Resolving uncommitted changes
- Choosing between conflicting conventions
- Deleting stale branches

## Cowork Mode Adaptations

When running in Cowork:

- Git operations may need `start_code_task` delegation
- Can't run tests/build/lint directly — note them as "unable to verify" and recommend the user run them
- Focus on file structure, documentation, and Claude configuration audits
- Produce the report as a markdown file in the workspace for the user to review

## Reference Files

- `references/audit-checklist.md` — Quick-reference checklist for running audits
- `references/best-practices-baseline.md` — Current best practices to audit against
- `agents/` — Subagent definitions for multi-agent audit mode
