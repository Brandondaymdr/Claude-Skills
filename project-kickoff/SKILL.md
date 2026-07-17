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
9. **Will this project have AI/agent features?** (prompts, LLM calls, agent workflows) — determines whether `/evals/` is scaffolded.
10. **Will this project have architectural decisions to record?** (library choices, major pattern decisions, trade-offs worth documenting) — determines whether `/docs/decisions/` is scaffolded. Default: YES for Tier 1, OPTIONAL for Tier 2, SKIP for Tier 3.
11. **Tier assignment?** — Tier 1 (production / money-touching), Tier 2 (internal tools), or Tier 3 (experiment). Drives which subset of the template is scaffolded. See `DEFAULTS-ADR-0001.md` in the Claude-Skills repo for the full tier rubric.

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
├── .github/
│   ├── workflows/
│   │   ├── ci.yml            # Lint + typecheck + test + gitleaks + build
│   │   └── evals.yml         # Eval suite (AI projects only)
│   ├── dependabot.yml        # Weekly dependency update PRs
│   └── pull_request_template.md
├── .husky/                   # Pre-commit + commit-msg hooks
├── CLAUDE.md                 # Primary project instructions
├── CLAUDE.local.md           # Personal overrides (gitignored)
├── README.md                 # Human-readable project overview
├── CONTRIBUTING.md           # Commit format, PR workflow, review checklist
├── CHANGELOG.md              # Keep a Changelog format, ## [Unreleased] section
├── src/                      # Application source code
├── tests/                    # Test files
├── docs/
│   ├── ARCHITECTURE.md       # How the pieces fit
│   ├── WORKFLOW.md           # Golden-path "what a feature looks like end-to-end"
│   └── decisions/            # ADRs (conditional — see below)
│       ├── DECISIONS.md      # Index of all ADRs
│       ├── 0000-template.md  # ADR template
│       └── README.md         # How and when to write an ADR
├── evals/                    # AI/agent evals (conditional — see below)
│   ├── datasets/
│   ├── rubrics/
│   ├── runners/
│   ├── history/              # Committed eval run results
│   ├── threshold.json        # CI pass/fail threshold
│   └── README.md
├── scripts/                  # Build/deploy/utility scripts
└── .env.example              # Environment variable template
```

**Conditional directories:**
- `/evals/` — scaffold ONLY if the project has AI/agent features (from Phase 1 question 9). Skip entirely otherwise.
- `/docs/decisions/` — scaffold for Tier 1 always, Tier 2 if the user opts in at Phase 1 question 10, Tier 3 never. Always include `DECISIONS.md` as the index file when scaffolded.
- `.github/workflows/evals.yml` — scaffold only if `/evals/` is scaffolded.
- `.husky/`, `.github/dependabot.yml`, `.github/pull_request_template.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `docs/ARCHITECTURE.md`, `docs/WORKFLOW.md` — always scaffold for Tier 1 and Tier 2. Tier 3 skips all of these and gets only a `STATUS.md` (see Tier 3 minimum below).

Adapt the application code structure to the stack. A Next.js project uses `app/` or `pages/`. A Python project uses a package directory. A monorepo adds `packages/` or `apps/`. The structure should feel native to the ecosystem, not forced into a generic template.

**Tier 3 minimum:** a single `STATUS.md` in the project root that says `"experimental — not maintained"` or `"archived YYYY-MM-DD — [reason]"`. No CLAUDE.md, no tests, no CI, no docs. That's the whole point of Tier 3.

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

## Non-Negotiable Workflow Rules

1. **Never commit directly to `main`.** Branch → PR → merge, even solo.
2. **Conventional Commits format for every commit.** No exceptions. WIP and checkpoint commits use `wip(scope):` or `chore(scope):` prefixes.
3. **Every architectural decision gets an ADR** in `docs/decisions/NNNN-slug.md` before merge. Update `docs/decisions/DECISIONS.md` index in the same PR.
4. **Every bug fix gets a regression test** before the fix ships.
5. **Every agent/prompt change commits the eval run log** to `/evals/history/`.
6. **`CHANGELOG.md` `## [Unreleased]` section is updated** for every user-facing change.
7. **Self-merge requires a 10-minute cool-down** after PR opened. Re-read the diff fresh before merging. CI enforces this via the `pr-age-check` job.

## Verification Commands Claude Must Use

Claude must run these before declaring any task done:

- `pnpm lint` — linting
- `pnpm typecheck` — type checking (`tsc --noEmit`)
- `pnpm test` — full test suite
- `pnpm build` — build must succeed
- `pnpm test:evals` — eval suite (AI projects only)

If any of these fail, the task is not done.

## Project-Specific Gotchas

[Things that would trip Claude up without being told]

## Skills & References

- See `.claude/skills/` for domain-specific knowledge
- See `docs/ARCHITECTURE.md` for how the pieces fit
- See `docs/WORKFLOW.md` for the golden-path feature workflow
- See `docs/decisions/DECISIONS.md` for all ADRs
```

#### Step 4: Configure .claude/ Directory

Read `references/claude-config-guide.md` for detailed setup. Create:

**tier** — A single file at `.claude/tier` containing one digit (`1`, `2`, or `3`) matching the tier chosen in the Phase 1 interview. This is the persistent marker that downstream skills (`folder-forensic-audit`, Phase 6 conformance) read to gate behavior. Without it, tier has to be re-asked every audit — and tier rules silently degrade.

```bash
echo "1" > .claude/tier   # or 2, or 3 — matches Phase 1 question 11
```

For Tier 3 projects, this file lives alongside `STATUS.md` in the project root structure (Tier 3 skips the rest of `.claude/`, but the tier marker still goes in if `.claude/` is created).

**settings.json** — Permissions appropriate to the stack. Note: `allow`/`deny` MUST nest under a `"permissions"` key — top-level lists are silently ignored:
```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
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

The most impactful thing you can do for Claude-assisted development. A proper verification stack has five layers — earlier layers catch problems faster and cheaper than later ones.

**Layer 1 — Claude hooks (instant, per-edit):**

In `.claude/settings.json`, add hooks that lint after file edits:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "pnpm lint --fix 2>&1 | tail -5"
          }
        ]
      }
    ]
  }
}
```

(Event names are `PreToolUse` / `PostToolUse` / `UserPromptSubmit` / `SessionStart` / `SessionEnd` / `PreCompact`, and each matcher entry needs the nested `hooks` array — a bare `command` key on the matcher object is ignored.)

**Layer 2 — Pre-commit hooks (seconds, before commit):**

Install Husky + lint-staged + commitlint per `DEFAULTS-ADR-0001.md`:

```bash
pnpm add -D husky lint-staged @commitlint/cli @commitlint/config-conventional
pnpm exec husky init
```

Create `.husky/pre-commit`:
```bash
pnpm exec lint-staged
pnpm exec gitleaks protect --staged --verbose --redact
```

Create `.husky/commit-msg`:
```bash
pnpm exec commitlint --edit "$1"
```

Add to `package.json`:
```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

Create `commitlint.config.js` — note the `type-enum` extension: stock config-conventional rejects the `wip` type, which the session-checkpoint and session-closeout skills rely on for WIP commits:
```js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test', 'wip'],
    ],
  },
};
```

**Layer 3 — Local test/build scripts (minutes, on demand):**

- **Linting** — ESLint + Prettier appropriate to the stack
- **Type checking** — TypeScript strict mode (`tsc --noEmit`)
- **Testing framework** — Vitest with at least one example test per the defaults ADR
- **Build** — Catches build-time errors not caught by typecheck

All wired into `package.json` scripts: `lint`, `typecheck`, `test`, `build`.

**Layer 4 — CI (minutes, on every PR):**

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read
  pull-requests: read

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test --coverage
      - run: pnpm build
      - name: Scan for secrets
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  pr-age-check:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - name: Enforce 10-minute cool-down on self-merge
        run: |
          OPENED_AT=$(gh pr view ${{ github.event.pull_request.number }} --json createdAt -q .createdAt --repo "$GITHUB_REPOSITORY")
          OPENED_EPOCH=$(date -d "$OPENED_AT" +%s)
          NOW_EPOCH=$(date +%s)
          AGE=$((NOW_EPOCH - OPENED_EPOCH))
          if [ $AGE -lt 600 ]; then
            echo "PR is only $AGE seconds old. Minimum 600 seconds (10 min) required before self-merge."
            exit 1
          fi
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

The top-level `permissions:` block is **required** — the default `GITHUB_TOKEN` is read-only on contents but does NOT grant `pull_requests:read`. Without this block, both `gitleaks-action` (queries `/pulls/{n}/commits`) and `pr-age-check` (uses `gh pr view`) will fail with 403. The `--repo "$GITHUB_REPOSITORY"` on the `gh pr view` line is similarly required so the gh CLI knows which repo it's querying without relying on a working directory it may not have.

Skip the `pr-age-check` job for `dependabot[bot]` and `docs:` PRs via commit-message match if desired.

If the project has AI features, also create `.github/workflows/evals.yml` that runs on PRs touching `/evals/**`, `/src/agents/**`, or prompt files. Posts score as a PR comment. Fails if the score drops below `evals/threshold.json`.

**Layer 5 — Dependabot (weekly, automated PRs):**

Create `.github/dependabot.yml` per the defaults ADR. Groups dev-dependencies together. Major-version bumps come through as individual PRs so each can get its own ADR.

**Pull request template** — create `.github/pull_request_template.md`:
```markdown
## What changed

## Why

## Checklist
- [ ] Conventional commit format used
- [ ] Tests added/updated (or N/A with reason)
- [ ] ADR written if architectural decision made
- [ ] CHANGELOG Unreleased section updated if user-facing
- [ ] Eval log committed if agent/prompt changed
- [ ] CI green (including 10-min cool-down for self-merge)
```

**Verify before declaring kickoff complete:** Before moving on, confirm:
1. `pnpm install` → `pnpm lint` → `pnpm typecheck` → `pnpm test` → `pnpm build` all succeed locally.
2. The initial commit triggers CI on GitHub and CI passes green.
3. If `/evals/` was scaffolded, `pnpm test:evals` runs and produces a score.
4. Husky hooks fire (make a test commit with a bad message — commitlint should reject it).

If any layer fails, fix it before Phase 3. A broken verification layer at kickoff becomes permanent tech debt.

#### Step 7: Environment and Deployment Config

- Create `.env.example` with all required environment variables (no actual values)
- Set up deployment config if applicable (vercel.json, Dockerfile, etc.)
- Configure CI/CD basics if the project uses GitHub Actions or similar

#### Step 8: Clone from Template (Preferred Path)

**Before running any of steps 1–7 from scratch,** check whether the user's template repo exists. If it does, clone from it — it already has every layer configured correctly.

```bash
# Check if the template repo exists
gh repo view Brandondaymdr/project-template 2>/dev/null && echo "TEMPLATE EXISTS"
```

If the template exists, confirm with the user:

> "I found `Brandondaymdr/project-template`. Which variant fits this project?
> 1. `web-next-supabase` — Next.js 15 + Supabase + Vercel
> 2. `desktop-tauri` — Tauri v2 + React + Drizzle + SQLite/Turso
> 3. `node-lib` — TypeScript library/utility
>
> Or clone from scratch if none fit?"

On confirmation, run:

```bash
gh repo create <new-project-name> \
  --template Brandondaymdr/project-template \
  --private \
  --clone

cd <new-project-name>

# Remove the variants you don't need (the template ships all three as subdirs)
# Keep only the one you selected, move its contents up a level.
# Commit the cleanup as the first commit on main:
git add -A
git commit -m "chore: initialize from $VARIANT template variant"
```

**If the template doesn't exist yet** (or the user explicitly wants to bootstrap from scratch): fall back to Steps 1–7 above, then offer to promote the result into `project-template` when done. Every from-scratch kickoff is a prompt to build the template.

**If the template is out of date** compared to current best practices (detected by running `/folder-forensic-audit` on the template itself): fix the template first, then kickoff. Template debt compounds across every future project.

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
```

To check installed plugins, run the in-session command `/plugin list` (there is no `claude /plugins` CLI subcommand).

Present findings: "You have X skills installed. For this project, Y and Z look relevant. You might also want to create skills for [domain A] and [domain B]."

### Phase 4: Initial Commit and Branch Protection

Create a clean initial commit with all scaffolding, then enable branch protection so the workflow rules self-enforce from day one.

```bash
# First commit on main establishes the baseline
git add -A
git commit -m "chore: initial project scaffolding

- Project structure with src/, tests/, docs/
- CLAUDE.md with non-negotiable workflow rules and verification commands
- .claude/ configuration (settings, commands, rules, agents)
- README.md, CONTRIBUTING.md, CHANGELOG.md
- docs/ARCHITECTURE.md, docs/WORKFLOW.md, docs/decisions/ with ADR 0001
- Linting, typechecking, Vitest, Husky, commitlint, lint-staged
- CI workflow with gitleaks and 10-minute PR cool-down
- Dependabot config
- Environment template (.env.example)"

# Push main
git push -u origin main

# Enable branch protection via gh CLI
gh api -X PUT repos/:owner/:repo/branches/main/protection \
  -f required_status_checks[strict]=true \
  -f required_status_checks[contexts][]=verify \
  -f required_status_checks[contexts][]=pr-age-check \
  -f enforce_admins=true \
  -f required_pull_request_reviews[required_approving_review_count]=0 \
  -f restrictions=null
```

After this commit, all future work happens on branches with PRs. If the user tries to commit to main, git and GitHub will both refuse.

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
