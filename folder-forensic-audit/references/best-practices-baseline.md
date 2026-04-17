# Best Practices Baseline

This reference defines the standards the audit measures against. Update this file as Claude Code evolves and new best practices emerge.

**Last updated:** April 2026
**Source:** code.claude.com/docs/en/best-practices, community patterns

---

## Project Structure Standards

### Minimum Viable Project
Every project should have:
- `.gitignore` appropriate to the stack
- `CLAUDE.md` with project instructions
- `README.md` with human documentation
- `.env.example` if environment variables are used
- Source code in a dedicated directory (not loose in root)
- Some form of verification (tests, linting, or type checking)

### Well-Configured Project
Above minimum, plus:
- `.claude/settings.json` with permissions
- `.claude/commands/` with workflow commands (dev, test, review)
- `.claude/rules/` with path-scoped rules for distinct code areas
- Hooks for post-edit verification (linting/type-checking)
- Test suite with reasonable coverage
- Build pipeline that works

### Optimally Configured Project
Above well-configured, plus:
- `.claude/skills/` with domain knowledge
- `.claude/agents/` with specialized subagent definitions
- Comprehensive CLAUDE.md under 200 lines using progressive disclosure
- Multiple CLAUDE.md files for monorepos
- Pre-commit hooks (Husky or equivalent)
- CI/CD pipeline
- Automated dependency updates
- Security scanning

---

## CLAUDE.md Standards

### Must Have
- Project overview (1-2 lines)
- Tech stack with versions
- All development commands
- At least one verification command

### Should Have
- Architecture summary
- Code conventions (non-obvious ones only)
- Workflow rules
- Gotchas section
- References to deeper docs/skills

### Guidelines
- Under 200 lines (hard ceiling)
- Under 100 lines (ideal for focused projects)
- Every line passes the deletion test
- Uses progressive disclosure (@imports, skill references)
- Emphasis (IMPORTANT, ALWAYS) reserved for genuine foot-guns
- Explains "why" over dictating "what"

---

## .claude/ Configuration Standards

### settings.json
- Allow commands Claude uses repeatedly
- Deny destructive operations
- Match permissions to the project's actual toolchain

### commands/
- At minimum: dev, test (with filter support)
- Useful additions: review, deploy, debug
- Commands should be self-documenting
- Use $ARGUMENTS for parameterized commands

### rules/
- Path-scoped using YAML frontmatter
- One rule file per concern (API, tests, components)
- Load only when working in relevant directories

### skills/
- One skill per knowledge domain
- SKILL.md under 500 lines; use references/ for depth
- Descriptive names and trigger descriptions
- Disable model invocation for side-effect skills

### agents/
- Reviewer agent with restricted tools (Read, Grep, Glob)
- Research agent for codebase exploration
- Appropriate model selection (haiku for fast tasks, sonnet/opus for complex)

### hooks
- PostToolExecution lint/format after Edit/Write
- Keep hooks fast (under 5 seconds)
- Concise output (pipe through `tail` or `head`)

---

## Code Health Standards

### Testing
- Test framework installed and configured
- At least one passing test
- Test command documented in CLAUDE.md
- Tests cover critical paths (auth, data mutations, API endpoints)

### Linting
- Linter installed and configured
- Clean lint output (no errors)
- Lint command in CLAUDE.md
- Autofix available

### Type Safety
- TypeScript strict mode (or equivalent)
- No type errors in clean build
- Type command documented

### Dependencies
- Lock file committed
- No known high/critical CVEs
- Major versions not more than 1 behind

### Security
- No secrets in source code
- No secrets in git history
- .env files gitignored
- .env.example maintained

---

## Git Standards

### .gitignore
- Covers: dependencies, env files, build output, OS files, editor files
- Stack-specific entries (node_modules, __pycache__, .next, dist, etc.)

### Commits
- Conventional commit format preferred
- Descriptive messages (not "fix", "update", "stuff")
- WIP commits include status and next steps

### Branches
- No more than 10 active branches
- Merged branches cleaned up
- Descriptive branch names (feature/*, fix/*, chore/*)

### Stashes
- Descriptive stash messages
- No stashes older than 2 weeks without good reason
- Clean up applied stashes

---

## Keeping This Baseline Current

This file should be updated when:
- Claude Code releases new features (new hook types, new configuration options)
- Community best practices shift
- The official docs at code.claude.com/docs/en/best-practices change
- New plugin categories or skill patterns emerge

Before running an audit, check if this baseline is current by searching for the latest Claude Code documentation.
