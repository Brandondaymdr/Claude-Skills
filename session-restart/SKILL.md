---
name: session-restart
description: >
  Restart a Claude Code or Cowork session on an existing project with full context recovery,
  project health check, and clear next-step identification. Use this skill whenever the user
  returns to a project after being away — whether it's been hours, days, or weeks. Trigger on
  "restart", "pick up where I left off", "continue the project", "resume work", "get back into",
  "what was I doing", "where did I leave off", "catch me up", "session start", "re-engage",
  or any variation of coming back to an existing project. Also trigger when a user opens a
  project and seems unsure of the current state. Works in both Claude Code and Cowork. Designed
  to pair with the session-closeout skill — if closeout was done properly, restart is seamless.
---

# Session Restart

This skill gets you back into a project fast. It reads the project's state, recovers context from the last session, checks project health, and presents a clear briefing so you can start working immediately instead of spending 15 minutes figuring out where things stand.

## Why Restart Matters

Every new session starts with a blank context window. CLAUDE.md provides the foundation, but it can't capture everything — especially the momentum of a work session: what was in progress, what was tried and abandoned, what was discovered but not yet addressed.

A good restart bridges the gap between sessions. It turns "I think I was working on auth?" into "Here's exactly where you left off, here's what's pending, and here's what I recommend tackling first."

## The Restart Procedure

### Phase 1: Project Reconnaissance

Gather the full picture before saying anything. Read everything, then synthesize.

#### Read Project Documentation

```bash
# Read the primary project instructions
cat CLAUDE.md

# Read any local overrides
cat CLAUDE.local.md 2>/dev/null

# Check for project-specific skills
ls .claude/skills/ 2>/dev/null

# Check for rules
ls .claude/rules/ 2>/dev/null

# Read README for project overview
cat README.md
```

#### Read Git State

```bash
# Current branch and recent history
git branch --show-current
git log --oneline -15

# Any uncommitted work?
git status

# Any stashed work?
git stash list

# What changed in the last session? (look for closeout commits)
git log --oneline --since="3 days ago"

# Check for WIP commits
git log --oneline --all --grep="wip" | head -5

# Any remote changes to pull?
git fetch --dry-run 2>&1
```

#### Check for Closeout Artifacts

If the `session-closeout` skill was used, look for its traces:

```bash
# Look for the most recent closeout commit
git log --oneline --all --grep="closeout" | head -3

# Read the closeout commit's full message for session summary
git log -1 --grep="closeout" --format="%B" 2>/dev/null
```

If a closeout commit exists, it contains: what was completed, what's in progress, what docs were updated, next session priorities, and discovered issues. This is gold — use it as the primary briefing source.

#### Check Project Health

```bash
# Are dependencies installed?
[ -f "package.json" ] && [ ! -d "node_modules" ] && echo "WARN: node_modules missing — run npm install"
[ -f "requirements.txt" ] && [ ! -d "venv" ] && [ ! -d ".venv" ] && echo "WARN: virtual env missing"

# Do tests pass?
# (Run the test command from CLAUDE.md — adapt to the project's stack)

# Does the build succeed?
# (Run the build command from CLAUDE.md)

# Any lint errors?
# (Run the lint command from CLAUDE.md)
```

#### Check for External Changes

Things that may have changed while you were away:

```bash
# Remote commits from teammates
git log HEAD..origin/main --oneline 2>/dev/null

# PRs that landed
git log --oneline --merges --since="1 week ago" | head -5

# Check if .env matches .env.example
if [ -f ".env.example" ] && [ -f ".env" ]; then
  diff <(grep -oP '^[A-Z_]+' .env.example | sort) <(grep -oP '^[A-Z_]+' .env | sort) || echo "WARN: .env is missing variables from .env.example"
fi
```

### Phase 2: Context Recovery

Synthesize everything gathered into a clear picture. Don't dump raw data — interpret it.

**What to recover:**
- The project's current purpose and architecture (from CLAUDE.md + README)
- What was worked on last (from git log + closeout commit)
- Current work state: clean, WIP, stashed, or messy
- Any pending items: TODOs, open issues, failing tests
- External changes since last session

### Phase 3: Health Report

Present a quick health assessment:

| Area | Status | Notes |
|---|---|---|
| Git state | Clean / WIP / Dirty | Details if not clean |
| Dependencies | Installed / Missing | Which ones |
| Tests | Passing / Failing / Not run | Failure details |
| Build | Succeeds / Fails | Error details |
| Lint | Clean / Errors | Error count |
| Docs | Current / Stale | Which docs need attention |
| .env | Complete / Missing vars | Which vars |

Flag anything that needs immediate attention before development continues.

### Phase 4: Session Briefing

Present a concise briefing to the user:

---

**Project:** [name] — [one-line description]

**Last session:** [date] — [summary from closeout commit or git log]

**Current state:**
- Branch: `[branch-name]`
- Status: [clean / WIP on feature X / stashed experiment Y]
- [Any issues found in health check]

**Pending work:**
- [WIP item 1 — status and what's left]
- [WIP item 2 — status and what's left]

**Recommended priorities for this session:**
1. [Priority 1 — why this first]
2. [Priority 2]
3. [Priority 3]

**Heads up:**
- [Any gotchas, blockers, or external changes to be aware of]

---

### Phase 5: Ready to Work

After the briefing, ask the user what they want to focus on. Offer the recommended priorities but don't assume — they might have new priorities.

If there's WIP to resume:
- Offer to show the diff of the WIP commit
- Remind them of the status and next steps from the commit message
- Suggest picking up exactly where they left off

If the project is clean (no WIP):
- Present the recommended priorities from the closeout
- Ask if they want to start a new feature, fix a bug, or work on something else

## Handling Messy State

Not every project was closed out properly. Here's how to handle common situations:

### Uncommitted Changes (No Closeout)

```bash
git status
git diff --stat
```

Present what's changed and ask the user:
- "I see uncommitted changes to X, Y, Z. Want to commit these as WIP, stash them, or discard them?"

### No Recent Activity

If the project hasn't been touched in a while:
- Check the last commit date
- Suggest running dependency updates (`npm update`, `pip install --upgrade`)
- Check if any breaking changes occurred in the stack
- Run the full test suite to establish a baseline

### Multiple Stashes

```bash
git stash list
```

If there are multiple stashes, present them and ask which (if any) to apply:
- "You have 3 stashes. The most recent is '[description]' from [date]. Want to apply it?"

### Diverged Branch

If the local branch has diverged from remote:
- Show the divergence: `git log --oneline HEAD..origin/main` and `git log --oneline origin/main..HEAD`
- Suggest: rebase onto main, merge main in, or continue working and deal with it later

## Cowork Mode Adaptations

When running in Cowork:

- Git operations may need `start_code_task` delegation
- Focus on reading project state and presenting the briefing
- Check auto-memory for session notes from previous conversations
- Look for files in the mounted workspace rather than assuming git access

## Pairing with Session Closeout

This skill is the complement of `session-closeout`. When closeout is run properly:

- Git state will be clean (all work committed or stashed)
- CLAUDE.md will be current
- A closeout commit will contain a full session summary with next steps
- WIP commits will have clear status/next-steps in their messages

When closeout wasn't run, this skill degrades gracefully — it reads git state, infers what was happening, and presents the best briefing it can. But the quality of the restart is directly proportional to the quality of the previous closeout.

## Reference Files

- `references/restart-checklist.md` — Quick-reference checklist for session restart
