# Complete .claude/ Directory Configuration Guide

## Table of Contents
1. [Overview](#overview)
2. [settings.json](#settingsjson)
3. [commands/](#commands)
4. [rules/](#rules)
5. [skills/](#skills)
6. [agents/](#agents)
7. [Hooks](#hooks)

---

## Overview

The `.claude/` directory is the control center for how Claude behaves in your project. It holds permissions, custom commands, scoped rules, skills, and subagent definitions.

```
.claude/
├── settings.json           # Permissions, hooks, tool config
├── settings.local.json     # Personal overrides (gitignored)
├── commands/               # Custom slash commands
│   ├── dev.md
│   ├── test.md
│   └── deploy.md
├── rules/                  # Path-scoped instruction files
│   ├── api-rules.md
│   └── test-rules.md
├── skills/                 # Project-specific skills
│   └── domain-knowledge/
│       └── SKILL.md
└── agents/                 # Subagent definitions
    ├── reviewer.md
    └── researcher.md
```

---

## settings.json

Controls what Claude can and cannot do. Commit this to git so the whole team shares the same permissions.

### Basic Structure

```json
{
  "$schema": "https://claude.ai/schemas/claude-settings.json",
  "allow": [
    "Bash(npm run *)",
    "Bash(npx *)",
    "Bash(git add *)",
    "Bash(git commit *)",
    "Bash(git push *)",
    "Bash(git diff *)",
    "Bash(git log *)",
    "Bash(git status)",
    "Bash(git branch *)",
    "Bash(git checkout *)",
    "Bash(cat *)",
    "Bash(ls *)",
    "Bash(mkdir *)",
    "Read",
    "Write",
    "Edit",
    "Glob",
    "Grep"
  ],
  "deny": [
    "Bash(rm -rf /)",
    "Bash(rm -rf ~)",
    "Bash(: > .env)"
  ]
}
```

### Permission Patterns

Use wildcards to allow command families:
- `Bash(npm run *)` — all npm scripts
- `Bash(git *)` — all git commands
- `Bash(docker compose *)` — docker compose operations

### Personal Overrides (settings.local.json)

For personal preferences that shouldn't be shared with the team. Gitignored by default.

```json
{
  "allow": [
    "Bash(my-custom-tool *)"
  ]
}
```

---

## commands/

Each markdown file in `commands/` becomes a slash command. The filename (minus `.md`) is the command name, prefixed with `/project:`.

### Command Structure

```markdown
# commands/dev.md

Start the development environment.

Run these commands to set up and start the dev server:
`npm install`
`npm run dev`

Report the URL and confirm the server is running.
```

Invoke with: `/project:dev`

### Using Arguments

Commands can accept arguments via `$ARGUMENTS`:

```markdown
# commands/test.md

Run tests for the specified scope.

If $ARGUMENTS is provided, run tests matching that pattern:
`npm run test -- --filter "$ARGUMENTS"`

If no arguments, run the full test suite:
`npm run test`

Report results including pass/fail counts.
```

Invoke with: `/project:test auth` or `/project:test` (runs all)

### Useful Starter Commands

**dev.md** — Start development:
```markdown
Set up and start the development environment.

1. Check that dependencies are installed: `npm ls 2>&1 | head -5`
2. If dependencies are missing, run: `npm install`
3. Start the dev server: `npm run dev`
4. Confirm the server is running and report the URL.
```

**test.md** — Run tests:
```markdown
Run the test suite and report results.

If $ARGUMENTS is provided, run only matching tests:
`npm run test -- --filter "$ARGUMENTS"`

Otherwise run all tests:
`npm run test`

Summarize: total tests, passed, failed, and any error details for failures.
```

**review.md** — Code review:
```markdown
Review the current changes for quality and correctness.

1. Run `git diff` to see staged and unstaged changes
2. Check for:
   - Type safety issues
   - Missing error handling
   - Security concerns (exposed secrets, injection risks)
   - Performance issues
   - Missing tests for new functionality
3. Run `npm run lint` and `npm run test`
4. Summarize findings with specific file:line references
```

**deploy.md** — Deployment checklist:
```markdown
Pre-deployment checklist for $ARGUMENTS (default: production).

1. Verify all tests pass: `npm run test`
2. Verify build succeeds: `npm run build`
3. Verify no lint errors: `npm run lint`
4. Check for uncommitted changes: `git status`
5. Verify you're on the correct branch
6. Report status: ready to deploy or blockers found
```

---

## rules/

Rules split CLAUDE.md-style instructions into separate files. They can be unconditional (load every session) or path-scoped (load only when working in specific directories).

### Unconditional Rule

```markdown
# rules/commit-conventions.md

Use conventional commits:
- feat: new feature
- fix: bug fix
- docs: documentation
- chore: maintenance
- refactor: code restructuring
- test: adding/updating tests

Include scope when relevant: feat(auth): add Google OAuth
```

### Path-Scoped Rule

```yaml
# rules/api-rules.md
---
paths:
  - src/app/api/**
  - src/api/**
---
```
```markdown
# API Conventions

- All routes return `{ data, error }` — never throw from handlers
- Use zod for request validation
- Wrap handler logic in try/catch
- Log errors with request ID for tracing
- Rate limit public endpoints
- Validate authentication before processing
```

### Path-Scoped Rule for Tests

```yaml
# rules/test-rules.md
---
paths:
  - tests/**
  - **/*.test.*
  - **/*.spec.*
---
```
```markdown
# Testing Conventions

- Use vitest with `describe` / `it` blocks
- Name tests: `it('should [expected behavior] when [condition]')`
- Prefer integration tests over mocks for database operations
- Use factory functions for test data, not inline objects
- Clean up test data in afterEach hooks
- Test error cases, not just happy paths
```

---

## skills/

Project-specific skills for domain knowledge Claude needs repeatedly. Each skill is a directory with a `SKILL.md` file.

### When to Create a Project Skill

- Knowledge Claude needs repeatedly but not every session
- Domain-specific patterns (API design, database queries, component architecture)
- Complex workflows that happen periodically (deployments, migrations, releases)

### Skill Structure

```
skills/
└── supabase-patterns/
    ├── SKILL.md
    └── references/
        ├── rls-policies.md
        └── query-patterns.md
```

### SKILL.md Template

```markdown
---
name: supabase-patterns
description: Supabase query patterns, RLS policies, and database conventions for this project. Use when working with database queries, writing migrations, setting up RLS, or debugging data access issues.
---

# Supabase Patterns

## Client Usage
- Browser: `import { supabase } from '@/lib/supabase/client'`
- Server: `import { createServerClient } from '@/lib/supabase/server'`
- Admin (bypasses RLS): `import { supabaseAdmin } from '@/lib/supabase/admin'`

## Query Patterns
[Common query patterns for this project]

## RLS Policies
See `references/rls-policies.md` for the full RLS policy guide.

## Migrations
See `references/query-patterns.md` for migration conventions.
```

---

## agents/

Subagent definitions for specialized tasks. Each markdown file defines a subagent that Claude can delegate to.

### Subagent Template

```markdown
# agents/reviewer.md
---
name: reviewer
description: Reviews code for quality, security, and consistency with project conventions
tools: Read, Grep, Glob, Bash
model: sonnet
---

You are a senior engineer reviewing code changes. Check for:

1. **Correctness**: Logic errors, edge cases, type issues
2. **Security**: Injection risks, exposed secrets, auth bypasses
3. **Performance**: N+1 queries, unnecessary re-renders, missing indexes
4. **Consistency**: Follows project conventions in CLAUDE.md and .claude/rules/
5. **Test coverage**: New code has appropriate tests

Provide specific file:line references for each issue.
Rate each finding: critical, warning, or suggestion.
```

### Research Subagent

```markdown
# agents/researcher.md
---
name: researcher
description: Investigates the codebase to answer questions without modifying files
tools: Read, Grep, Glob, Bash(git log *), Bash(git blame *)
model: haiku
---

You are a codebase research assistant. Your job is to:

1. Find relevant code and explain how it works
2. Trace data flows and dependencies
3. Summarize git history for specific files or features
4. Identify patterns and conventions used in the codebase

Never modify files. Report findings clearly with file paths and line numbers.
```

---

## Hooks

Hooks are configured in `settings.json` and run deterministic scripts at specific lifecycle points. Unlike CLAUDE.md instructions, hooks execute 100% of the time.

### Hook Types

| Hook | When it fires | Common use |
|---|---|---|
| `PreToolExecution` | Before a tool runs | Block dangerous operations |
| `PostToolExecution` | After a tool runs | Lint after edits, format code |
| `SessionStart` | Session begins | Environment checks, setup |
| `SessionEnd` | Session ends | Cleanup, logging |
| `PromptSubmit` | Before prompt processes | Input validation |
| `Compact` | During context compaction | Preserve critical info |

### Example: Lint After Edits

```json
{
  "hooks": {
    "PostToolExecution": [
      {
        "matcher": "Edit|Write",
        "command": "npm run lint:fix -- --quiet 2>&1 | tail -5"
      }
    ]
  }
}
```

### Example: Block Sensitive File Writes

```json
{
  "hooks": {
    "PreToolExecution": [
      {
        "matcher": "Write|Edit",
        "command": "echo $TOOL_INPUT | grep -q '\\.env' && echo 'BLOCKED: Cannot modify .env files' && exit 1 || exit 0"
      }
    ]
  }
}
```

### Example: Type-Check After Changes

```json
{
  "hooks": {
    "PostToolExecution": [
      {
        "matcher": "Edit|Write",
        "command": "npx tsc --noEmit 2>&1 | tail -10"
      }
    ]
  }
}
```

### Hook Best Practices

- Keep hooks fast (< 5 seconds). Slow hooks frustrate the workflow.
- Use hooks for things that MUST happen every time. Use CLAUDE.md for guidelines.
- Output from hooks gets added to Claude's context, so keep output concise (use `tail` or `head`).
- Test hooks manually before adding them to settings.json.
