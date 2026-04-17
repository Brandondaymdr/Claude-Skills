---
name: project-kickoff
description: >
  Initialize new projects with production-grade folder structure, CLAUDE.md, .claude/ configuration,
  and all supporting documentation from day one. Use this skill whenever starting a new project,
  scaffolding a repo, setting up a codebase, initializing a workspace, or when the user says anything
  like "new project", "start a project", "set up a repo", "initialize", "scaffold", "kickoff",
  "bootstrap", or "create a new app/site/tool/service". Also trigger when the user mentions wanting
  better project organization, wants to restructure from scratch, or asks about project setup best
  practices. Even if the user just says "let's build something" — if there's no existing project
  context, use this skill. Works in both Claude Code and Cowork.
---

# Project Kickoff

This skill initializes new projects so they're optimized for AI-assisted development from the first commit. A well-structured project dramatically reduces context waste, prevents repeated corrections, and lets Claude (and you) move faster on every future session.

The goal is not just to create files — it's to build a project that *teaches Claude how to work with it* every time a session starts.

## Philosophy

A great project setup does three things:

1. **Eliminates ambiguity** — Claude should never have to guess your conventions, stack, or workflow. Every session starts with clarity.
2. **Uses progressive disclosure** — CLAUDE.md stays lean (<200 lines). Deeper knowledge lives in skills, rules, and references that load only when needed.
3. **Builds in verification** — Tests, linters, type checks, and hooks catch mistakes before they compound. Claude works best when it can verify its own output.

## Kickoff Workflow

### Phase 1: Project Interview

Before creating anything, understand the project. Ask about:

1. **What are we building?** (app, API, CLI tool, library, site, automation, etc.)
2. **Tech stack?** (language, framework, database, hosting — e.g., Next.js + Supabase + Vercel)
3. **Is this a monorepo or single project?**
4. **What's the primary development environment?** (Claude Code, Cowork, or both)
5. **Any existing code or repos to work from?**
6. **Who else works on this?** (solo, team, open source)
7. **What external services will it connect to?** (APIs, databases, auth providers, etc.)
8. **Is there a design system, brand guide, or existing conventions to follow?**

Don't over-interview — if the user gives a clear brief ("Next.js app with Supabase on Vercel"), infer reasonable defaults and confirm them rather than asking 20 questions.

### Phase 2: Scaffold the Project

Create the folder structure, docs, and configuration. The order matters — establish the foundation before writing any application code.

#### Step 1: Initialize the Repository

```bash
# Create project root (if it doesn't exist)
mkdir -p <project-name>
cd <project-name>
git init

# Create .gitignore appropriate to the stack
# (node_modules, .env, .DS_Store, etc.)
```

#### Step 2: Create the Folder Structure

Read `references/folder-templates.md` for stack-specific templates. The general pattern:

```
project-root/
├── .claude/                  # Claude Code configuration
│   ├── settings.json         # Permissions and tool access
│   ├── settings.local.json   # Personal overrides (gitignored)
│   ├── commands/             # Custom slash commands
│   ├── rules/                # Path-scoped instruction files
│   ├── skills/               # Project-specific skills
│   └── agents/               # Subagent definitions
├── CLAUDE.md                 # Primary project instructions
├── CLAUDE.local.md           # Personal overrides (gitignored)
├── README.md                 # Human-readable project overview
├── src/                      # Application source code
├── tests/                    # Test files
├── docs/                     # Extended documentation
├── scripts/                  # Build/deploy/utility scripts
└── .env.example              # Environment variable template
```

Adapt this to the stack. A Next.js project uses `app/` or `pages/`. A Python project uses a package directory. A monorepo adds `packages/` or `apps/`. The structure should feel native to the ecosystem, not forced into a generic template.

#### Step 3: Write CLAUDE.md

This is the most important file in the project. Read `references/claude-md-guide.md` for the full guide. Key principles:

- **Under 200 lines.** If you're approaching this, move content to skills or rules.
- **Include only what Claude can't figure out on its own.** Don't document obvious conventions.
- **Use progressive disclosure.** Point to skills and references rather than inlining everything.
- **Include verification commands.** Claude should always know how to check its own work.

Template structure:

```markdown
# Project Name

One-line description of what this project does.

## Architecture

Brief description of major components and how they connect. Include a
simple diagram if the architecture is non-trivial.

## Tech Stack

- Language/Framework: [e.g., TypeScript, Next.js 14]
- Database: [e.g., Supabase PostgreSQL]
- Hosting: [e.g., Vercel]
- Auth: [e.g., Supabase Auth]

## Getting Started

Commands to install, run, test, and build:
- `npm install` — install dependencies
- `npm run dev` — start dev server
- `npm run test` — run test suite
- `npm run build` — production build
- `npm run lint` — run linter

## Code Conventions

[Only include conventions that differ from ecosystem defaults]

## Workflow

- Always run `npm run lint` and `npm run test` after making changes
- Use conventional commits (feat:, fix:, docs:, etc.)
- Create feature branches off `main`

## Project-Specific Gotchas

[Things that would trip Claude up without being told]

## Skills & References

- See `.claude/skills/` for domain-specific knowledge
- See `docs/` for extended documentation
```

#### Step 4: Configure .claude/ Directory

Read `references/claude-config-guide.md` for detailed setup. Create:

**settings.json** — Permissions appropriate to the stack:
```json
{
  "allow": [
    "Bash(npm run *)",
    "Bash(npx *)",
    "Bash(git *)",
    "Read",
    "Write",
    "Edit"
  ],
  "deny": [
    "Bash(rm -rf *)",
    "Bash(: > .env)"
  ]
}
```

**commands/** — Create useful slash commands:
- `dev.md` — Start development environment
- `test.md` — Run test suite with options
- `deploy.md` — Deploy to production/staging
- `review.md` — Code review checklist

**rules/** — Path-scoped rules where appropriate:
- `api-rules.md` — API conventions (scoped to `src/api/**`)
- `test-rules.md` — Testing conventions (scoped to `tests/**`)
- `db-rules.md` — Database conventions (scoped to migrations/models)

**agents/** — Subagent definitions for specialized tasks:
- `reviewer.md` — Code review subagent
- `researcher.md` — Codebase research subagent

**skills/** — Project-specific skills:
- Create skills for domain knowledge the project needs repeatedly
- Keep each skill focused on one domain

#### Step 5: Write README.md

The README is for humans (and GitHub). Include:
- Project name and description
- Quick start instructions
- Architecture overview (can be more detailed than CLAUDE.md)
- Contributing guidelines
- License

#### Step 6: Set Up Verification

The most impactful thing you can do for Claude-assisted development. Set up:

1. **Linting** — ESLint, Prettier, Ruff, etc. appropriate to the stack
2. **Type checking** — TypeScript strict mode, mypy, etc.
3. **Testing framework** — Jest, Vitest, pytest, etc. with at least one example test
4. **Pre-commit hooks** — Lint and type-check before every commit (use Husky, pre-commit, or Claude hooks)
5. **Claude hooks** — In `.claude/settings.json`, add hooks that run linting after file edits:

```json
{
  "hooks": {
    "PostToolExecution": [
      {
        "matcher": "Edit|Write",
        "command": "npm run lint --fix 2>&1 | tail -5"
      }
    ]
  }
}
```

#### Step 7: Environment and Deployment Config

- Create `.env.example` with all required environment variables (no actual values)
- Set up deployment config if applicable (vercel.json, Dockerfile, etc.)
- Configure CI/CD basics if the project uses GitHub Actions or similar

### Phase 3: Skill Audit

After scaffolding, scan the user's installed skills to identify:

1. **Relevant existing skills** — Skills that could help with this project. Check `~/.claude/skills/` and any project-level skills.
2. **Skill gaps** — Knowledge domains the project needs that don't have a skill yet. Recommend creating them.
3. **Stack-specific skills** — If the user's stack has community skills or plugins available, suggest installing them.

To scan for skills:
```bash
# List all installed skills
ls -la ~/.claude/skills/ 2>/dev/null
ls -la .claude/skills/ 2>/dev/null

# Check for plugins
claude /plugins list 2>/dev/null || echo "No plugin system available"
```

Present findings: "You have X skills installed. For this project, Y and Z look relevant. You might also want to create skills for [domain A] and [domain B]."

### Phase 4: Initial Commit

Create a clean initial commit with all scaffolding:

```bash
git add -A
git commit -m "feat: initial project scaffolding

- Project structure with src/, tests/, docs/
- CLAUDE.md with project conventions and commands
- .claude/ configuration (settings, commands, rules, agents)
- README.md with setup instructions
- Linting, testing, and verification setup
- Environment template (.env.example)"
```

### Phase 5: Kickoff Summary

Present the user with a clear summary:

1. **What was created** — List of key files and their purpose
2. **How to start developing** — The exact commands to begin
3. **Recommended next steps** — First features to build, skills to create, integrations to set up
4. **Session tips** — Remind them to use `/clear` between tasks, use Plan Mode for complex features, and keep CLAUDE.md updated as the project evolves

## Working in Cowork Mode

When running in Cowork (not Claude Code), adapt the workflow:

- Skip git initialization unless the user has a repo mounted
- Focus on file structure and documentation
- Create files in the user's mounted workspace directory
- Skills and .claude/ configuration can still be set up — they'll work when the user opens the project in Claude Code
- Use `start_code_task` to delegate any git or CLI operations to a Claude Code session

## Staying Current

Claude Code evolves rapidly. This skill should evolve with it. Key areas to watch:

- **New Claude Code features** — Check `code.claude.com/docs` for new extension types, hooks, or configuration options
- **New plugin ecosystem** — Community plugins may provide project templates or scaffolding
- **Best practice updates** — The official best practices guide at `code.claude.com/docs/en/best-practices` is the authoritative source

When the user asks about new features or best practices, search the web for current Claude Code documentation before answering. Don't rely on cached knowledge for tooling details — verify against the latest docs.

## Reference Files

Read these for deeper guidance on specific topics:

- `references/claude-md-guide.md` — Comprehensive guide to writing effective CLAUDE.md files
- `references/folder-templates.md` — Stack-specific folder structure templates
- `references/claude-config-guide.md` — Complete .claude/ directory setup guide
- `references/kickoff-checklist.md` — Quick-reference checklist for project initialization
