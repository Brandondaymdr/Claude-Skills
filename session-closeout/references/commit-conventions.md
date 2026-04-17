# Commit Message Templates for Session Closeout

## Completed Feature

```
feat(scope): implement [feature name]

[1-2 sentence description of what was built and why]

- [Key implementation detail 1]
- [Key implementation detail 2]
- [Testing status]
```

## Completed Bug Fix

```
fix(scope): resolve [bug description]

Root cause: [what was causing the bug]
Fix: [what was changed to fix it]

Tested by: [how you verified the fix]
```

## Work in Progress

```
wip(scope): [what's being worked on]

Status:
- [x] [completed sub-task]
- [x] [completed sub-task]
- [ ] [remaining sub-task]
- [ ] [remaining sub-task]

Current state: [what works, what doesn't]
Next steps: [what needs to happen to complete this]
Blockers: [any blockers, or 'none']
```

## Session Closeout

```
chore: session closeout — [brief summary]

Completed:
- [Feature/fix 1]
- [Feature/fix 2]

In progress:
- [WIP item with status]

Updated:
- CLAUDE.md: [what changed]
- docs/: [what changed]
- .claude/: [what changed]

Next session priorities:
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]

Discovered issues:
- [Bug/gotcha/tech debt found but not addressed]
```

## Stash Messages

```
experiment: [description] — [date] — [reason for stashing]
wip: [feature] — [date] — [why paused, what's needed to resume]
backup: [description] — [date] — [safe to delete after X]
```

## Merge/PR Close

```
chore: merge [branch] — [feature/fix summary]

PR: #[number]
Reviewed by: [reviewer or 'self']
Tests: [passing/failing — if failing, why]
```

## Conventions

- Use conventional commit prefixes: feat, fix, chore, docs, refactor, test, style, perf, ci
- Include scope in parentheses when it adds clarity: `feat(auth):`, `fix(api):`
- First line under 72 characters
- Body explains *why*, not just *what*
- WIP commits should make it clear how to resume the work
- Closeout commits should give a complete picture of session state
