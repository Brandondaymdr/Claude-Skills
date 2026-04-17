# Session Restart Checklist

Quick-reference for restarting a session on an existing project.

---

## Reconnaissance

- [ ] Read CLAUDE.md (and CLAUDE.local.md if present)
- [ ] Read README.md for project overview
- [ ] Check `.claude/skills/` and `.claude/rules/` for project-specific context
- [ ] Review git log (last 10-15 commits)
- [ ] Check current branch
- [ ] Check for uncommitted changes (`git status`)
- [ ] Check for stashed work (`git stash list`)
- [ ] Look for closeout commit (`git log --grep="closeout"`)
- [ ] Read closeout commit message for session summary
- [ ] Check for remote changes (`git fetch --dry-run`)

## Health Check

- [ ] Dependencies installed (node_modules, venv, etc.)
- [ ] Tests pass
- [ ] Build succeeds
- [ ] Lint clean
- [ ] .env has all variables from .env.example
- [ ] No large temp files or debug artifacts

## Context Recovery

- [ ] Identify what was worked on last session
- [ ] Identify current work state (clean, WIP, stashed, dirty)
- [ ] Identify pending items (TODOs, open issues, failing tests)
- [ ] Identify external changes since last session
- [ ] Review any WIP commit messages for status and next steps

## Briefing

- [ ] Present project name and one-line description
- [ ] Summarize last session's work
- [ ] Report current state (branch, status, health)
- [ ] List pending/in-progress work
- [ ] Recommend top 3 priorities for this session
- [ ] Flag any gotchas, blockers, or changes

## Ready

- [ ] Ask user what they want to focus on
- [ ] Offer to show WIP diffs if applicable
- [ ] Begin work
