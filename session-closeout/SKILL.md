---
name: session-closeout
description: >
  Properly close out a Claude Code or Cowork session using a structured SOP that updates project
  documentation, commits work cleanly, captures session knowledge, and leaves the project folder
  in optimal state for the next session. Use this skill whenever the user says "close out",
  "wrap up", "wind down", "end session", "done for now", "that's it for today", "closeout",
  "session end", "save progress", "park this", or any variation of finishing a work session.
  Also trigger when the user issues a /closeout command. Even if the user just says "I'm done" or
  "let's stop here" — use this skill. Works in both Claude Code and Cowork. Designed to pair with
  the session-restart skill for clean handoffs between sessions.
---

# Session Closeout

This skill runs a structured Standard Operating Procedure (SOP) to wind down a Claude Code or Cowork session. The goal is to leave the project in a state where any future session — whether it's you coming back tomorrow or a teammate picking up the work — can start immediately with full context and zero confusion.

A proper closeout is the difference between "where was I?" and "let's keep going."

## Why Closeout Matters

Sessions accumulate context that exists only in the conversation: decisions made, approaches tried and abandoned, gotchas discovered, patterns established. When a session ends, all of that evaporates unless it's captured. The closeout process distills session knowledge into persistent project artifacts.

It also prevents the slow rot that happens to project folders over time — stale TODOs, outdated docs, uncommitted work, orphaned files. Every closeout is a mini-cleanup that keeps the project healthy.

## The Closeout SOP

Run these phases in order. The whole process should take 2-5 minutes depending on session complexity.

### Phase 1: Work Assessment

Take stock of what happened this session before touching anything.

```bash
# What changed?
git status
git diff --stat

# What's the current branch and its state?
git log --oneline -5

# Any uncommitted work?
git stash list
```

Produce a mental inventory:
- What features/fixes were completed?
- What's partially done?
- What was attempted but abandoned (and why)?
- Any blockers or decisions that need to be made next session?
- Any bugs discovered but not fixed?

### Phase 2: Commit Outstanding Work

All work should be committed before closing. Uncommitted changes are the #1 cause of "what was I doing?" when restarting.

**If work is complete:**
```bash
git add -A
git commit -m "feat/fix/chore: [descriptive message]

[Brief context about what was done and why]"
```

**If work is partially done:**
```bash
# Commit what's stable
git add [specific-files]
git commit -m "wip: [what's in progress]

Status: [what works, what doesn't yet]
Next steps: [what needs to happen to complete this]
Blockers: [any blockers, or 'none']"
```

**If there are experimental changes you're not sure about:**
```bash
# Stash with a descriptive message
git stash push -m "experiment: [description] - [date]"
```

Never leave uncommitted changes. Period. Either commit, stash, or intentionally discard them.

### Phase 3: Update CLAUDE.md

Review the current CLAUDE.md and update it with anything learned this session. This is the most important phase — it's how you transmit session knowledge to future sessions.

**Add new gotchas** discovered during the session:
```markdown
## Gotchas
- [NEW] The Supabase RLS policy on `orders` requires the user to own the order — admin queries need the service role client
```

**Update commands** if any new scripts were added or changed.

**Update architecture** if the project structure changed meaningfully.

**Remove stale information** that's no longer accurate.

**Keep it under 200 lines.** If you're adding content and approaching the limit, move detail into skills or rules instead.

Run the deletion test: for every line in CLAUDE.md, ask "would Claude make a mistake without this?" Remove anything that fails.

### Phase 4: Update Project Documentation

Beyond CLAUDE.md, update any project docs that are now stale:

**README.md** — If setup steps changed, update them. If new features were added, document them.

**docs/** — If there are architecture docs, API docs, or schema docs that are now outdated, update them. Don't let docs drift from reality.

**.env.example** — If new environment variables were added, make sure they're listed here (without actual values).

**TODO.md or project board** — If the project uses a TODO file or task tracker, update task status. Mark completed items, add new items discovered during the session.

### Phase 5: Update .claude/ Configuration

Check if any Claude configuration needs updating based on this session:

**rules/** — If you discovered a convention that should be enforced, add or update a rule.

**commands/** — If you built a new workflow that should be a slash command, create one.

**skills/** — If you accumulated domain knowledge that should be available in future sessions, create or update a skill.

**settings.json** — If you found yourself repeatedly approving the same permission, add it to the allow list.

**hooks** — If something should happen automatically that didn't (like linting, formatting), add a hook.

### Phase 6: Clean Up

Remove artifacts of the session that don't belong in the project permanently:

```bash
# Remove temp files
find . -name "*.tmp" -o -name "*.bak" -o -name "*~" | head -20

# Check for large files that shouldn't be committed
find . -size +1M -not -path "./.git/*" -not -path "./node_modules/*" | head -10

# Check for debug code left behind
grep -rn "console.log\|debugger\|TODO.*REMOVE\|HACK\|FIXME" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" | head -20
```

Don't be overly aggressive — some TODOs and console.logs are intentional. But flag anything that looks like session debris.

### Phase 7: Session Summary & Handoff

Create a final commit that captures the closeout updates:

```bash
git add -A
git commit -m "chore: session closeout — update docs and project state

Summary of this session:
- [What was accomplished]
- [What's in progress]
- [What's blocked or needs attention]

Next session should:
- [Priority 1]
- [Priority 2]
- [Priority 3]"
```

Then present a summary to the user:

**Session Closeout Summary**

1. **Completed this session:** [list of completed work]
2. **In progress:** [any WIP with status]
3. **Updated documentation:** [which docs were updated]
4. **Discovered issues:** [bugs found, gotchas, tech debt]
5. **Recommended next steps:** [prioritized list for next session]
6. **Project health:** [quick assessment — is the folder clean, are docs current, are tests passing?]

## Cowork Mode Adaptations

When running in Cowork instead of Claude Code:

- Git operations may need to be delegated via `start_code_task` if the repo isn't directly mounted
- Focus on documentation updates and file organization
- Skip hook/command/rule updates unless the user plans to open in Claude Code
- Use auto-memory to capture session knowledge that should persist

## Pairing with Session Restart

This skill is designed to create a clean handoff for the `session-restart` skill. The restart skill looks for:

- Clean git state (committed or stashed, not uncommitted)
- Up-to-date CLAUDE.md reflecting current project state
- WIP commits with clear status/next-steps messages
- A recent closeout commit with session summary

When closeout is done well, restart takes seconds instead of minutes.

## Quick Closeout (Abbreviated)

If the user is in a hurry, run a minimal closeout:

1. `git add -A && git commit -m "wip: [brief status]"` — commit everything
2. Add one line to CLAUDE.md under Gotchas if anything critical was discovered
3. Tell the user what the next session should start with

Even a 30-second closeout is better than no closeout. The goal is to never leave a session with uncommitted work and no breadcrumbs.

## Reference Files

- `references/closeout-checklist.md` — Quick-reference checklist for session closeout
- `references/commit-conventions.md` — Commit message templates for closeout commits
