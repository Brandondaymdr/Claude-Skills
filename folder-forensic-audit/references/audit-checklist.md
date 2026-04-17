# Folder Forensic Audit Checklist

Quick-reference for running a project audit.

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

## .claude/ Configuration

- [ ] Directory exists
- [ ] settings.json with appropriate permissions
- [ ] Custom commands for common workflows
- [ ] Path-scoped rules for distinct code areas
- [ ] Project-specific skills for domain knowledge
- [ ] Subagent definitions for delegation
- [ ] Hooks for automated verification

## Code Health

- [ ] Tests exist and pass
- [ ] Linter configured and clean
- [ ] Type checking enabled and passing
- [ ] Build succeeds
- [ ] Dependencies up to date
- [ ] No known security vulnerabilities
- [ ] No secrets in codebase
- [ ] .env.example maintained
- [ ] Lock file committed

## Git Hygiene

- [ ] .gitignore comprehensive
- [ ] Working tree clean
- [ ] No stale branches
- [ ] Descriptive commit messages
- [ ] No secrets in git history
- [ ] No large binaries in history
- [ ] Remote is connected and up to date
- [ ] No orphaned stashes
