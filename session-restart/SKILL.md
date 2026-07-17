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

# What changed in the last session? (widen --since to cover the actual gap since last session)
git log --oneline --since="3 days ago"

# Check for WIP commits (Conventional Commits format: wip(scope): ...)
git log --oneline --all --grep="^wip(" --grep="^wip:" | head -5
```

#### Sync With Remote

Do a REAL fetch, not `--dry-run`. A dry run never updates the `origin/*` remote-tracking refs, so every later `HEAD..origin/<branch>` comparison would silently compare against stale refs and report "no remote changes" on a clone that's months behind. Multi-machine clones make this the single most dangerous restart failure — one clone in this skill's own family ran 2 months stale because restarts only ever dry-ran the fetch.

```bash
git fetch origin

# How far ahead/behind is this clone? Prints "<behind>	<ahead>"
git rev-list --left-right --count @{u}...HEAD 2>/dev/null
```

- **Behind + clean working tree:** `git pull --ff-only` before doing anything else, then continue recon on the updated tree.
- **Behind + dirty tree (or diverged):** do NOT pull. Surface it at the top of the Phase 4 briefing and resolve with the user (see "Diverged Branch" below).
- **Ahead:** last session ended without pushing — flag it; unpushed commits exist on this machine only.

#### Check for Closeout Artifacts

If the `session-closeout` skill was used, look for its traces:

```bash
# Look for the most recent closeout commit (Conventional Commits format: chore(closeout): ...)
git log --oneline --all --grep="chore(closeout)" | head -3

# Read the closeout commit's full message for session summary
git log --all -1 --grep="chore(closeout)" --format="%B" 2>/dev/null

# Fallback only if nothing matched — bare "closeout" false-positives on any
# commit that merely mentions the word, so eyeball the results
git log --oneline --all --grep="closeout" | head -3
```

If a closeout commit exists, it contains: what was completed, what's in progress, what docs were updated, next session priorities, and discovered issues. This is gold — use it as the primary briefing source.

#### Sync Fleet Build Queue (Fleet projects only)

If the project uses Fleet (`.fleet/BUILD_QUEUE.md` exists), the queue may have drifted from reality if PRs merged between sessions — the dispatcher and validator update rows to `in_review` / `validated` / `flagged`, but the final `merged` flip is operator-owned and easily missed. Reconcile before the Phase 4 briefing so the "ready vs in-flight vs merged" counts you report are accurate.

```bash
if [ -f ".fleet/BUILD_QUEUE.md" ] && [ -f "scripts/sync-fleet-queue.mjs" ]; then
  node scripts/sync-fleet-queue.mjs
fi
```

The script reads merged PRs from GitHub (`gh pr list --state merged --search "[FLEET] in:title"`) and flips any `validated` / `flagged` / `in_review` slice rows whose corresponding PR is merged to status `merged`, filling in the PR URL. It's idempotent — a clean queue produces no output and no file changes. If it DID produce changes, the working tree is now dirty with a queue update — surface that in the Phase 4 briefing as a "queue drift detected — commit before starting new work" alert.

If `.fleet/BUILD_QUEUE.md` exists but the script is missing (early-stage Fleet projects without the sync helper yet), fall back to manually skimming the queue for stale row statuses (anything not `merged`/`failed`/`done` is potentially live; cross-check against `gh pr list --state merged --search "[FLEET] in:title" --limit 20`).

Reason this exists: Day-13 of the barrel-tracking pilot, an overnight dispatcher run left 6 PRs in mixed `validated`/`flagged` states, the restart that followed read the queue uncritically, and the operator only noticed the drift mid-session. Adding queue sync as a pre-briefing step makes the briefing honest.

#### Check Project Health

Scale this to time away: after a same-day return, skim; after a week or more, run the full test/build/lint baseline. Skip checks that don't apply to the project (no dependencies, no build, no CI) rather than reporting rows of N/A.

```bash
# Are dependencies installed?
[ -f "package.json" ] && [ ! -d "node_modules" ] && echo "WARN: node_modules missing — run pnpm install"
[ -f "requirements.txt" ] && [ ! -d "venv" ] && [ ! -d ".venv" ] && echo "WARN: virtual env missing"

# Do tests pass?
# (Run the test command from CLAUDE.md — adapt to the project's stack)

# Does the build succeed?
# (Run the build command from CLAUDE.md)

# Any lint errors?
# (Run the lint command from CLAUDE.md)
```

#### Check CI State

Never resume work unaware of broken CI. A red build on `main` means `main` itself is broken — you need to know before you branch from it. A red build on your working branch means your last session pushed something that failed — you need to know before writing more code on top.

```bash
# Detect the default branch — don't assume main
DEFAULT=$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | sed 's|^origin/||')
DEFAULT=${DEFAULT:-main}

# Recent runs on the default branch
gh run list --branch "$DEFAULT" --limit 5

# Status of current branch (if not the default)
CURRENT=$(git branch --show-current)
if [ "$CURRENT" != "$DEFAULT" ]; then
  gh run list --branch "$CURRENT" --limit 3

  # If there's an open PR, check its CI state
  gh pr checks "$CURRENT" 2>/dev/null
fi

# Any workflow failures in the last 24 hours on any branch?
# (gh --created takes GitHub date syntax like >=YYYY-MM-DD, not natural language)
YESTERDAY=$(date -v-1d +%F 2>/dev/null || date -d yesterday +%F)
gh run list --status failure --limit 5 --created ">=$YESTERDAY"
```

Surface any red builds prominently in the Phase 4 briefing. Don't bury CI failures in a health-check table — put them at the top of the session briefing with the failing workflow name, the commit that broke it, and a one-line recommendation (fix CI first, or acknowledge and work around).

If CI is pending (workflow running), note it and move on — but flag it so the user checks before merging.

#### Check Eval Drift (AI projects only)

If the project has agent/prompt features with an eval history (`evals/history/` below), diff the two most recent eval runs to catch silent regressions. "Did last session's prompt change quietly break the agent?" is a question that should be answered before writing new code, not discovered after shipping.

The JSON shape below (`score` / `passed` / `total` / `results`) is illustrative — adapt the paths and `jq` filters to the project's actual eval output format.

```bash
if [ -d "evals/history" ] && [ "$(ls evals/history/*.json 2>/dev/null | wc -l)" -ge 2 ]; then
  LATEST=$(ls -t evals/history/*.json | head -1)
  PREVIOUS=$(ls -t evals/history/*.json | head -2 | tail -1)

  echo "Latest eval run: $LATEST"
  jq '{score, passed, total, failures: (.results // []) | map(select(.passed == false) | .id)}' "$LATEST"

  echo "Previous eval run: $PREVIOUS"
  jq '{score, passed, total}' "$PREVIOUS"

  # Compute delta
  LATEST_SCORE=$(jq -r '.score' "$LATEST")
  PREVIOUS_SCORE=$(jq -r '.score' "$PREVIOUS")
  DELTA=$(echo "$LATEST_SCORE - $PREVIOUS_SCORE" | bc -l)
  echo "Score delta: $DELTA"

  # Flag regressions
  if (( $(echo "$DELTA < 0" | bc -l) )); then
    echo "WARNING: eval regression detected — score dropped by $DELTA"
  fi
fi
```

If a regression is detected, surface it at the top of the briefing alongside any CI failures. List the specific eval cases that now fail (they were passing before) so the user can prioritize. An eval regression on money-touching or safety-critical code (payroll math, auth, data deletion) is a Tier 1 blocker — flag it as such.

If no prior history exists (first run), note that and move on.

#### Check for External Changes

Things that may have changed while you were away:

```bash
# Remote commits from teammates (trustworthy only because Sync With Remote did a real fetch)
DEFAULT=$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | sed 's|^origin/||')
git log HEAD..origin/${DEFAULT:-main} --oneline 2>/dev/null

# PRs that landed
git log --oneline --merges --since="1 week ago" | head -5

# Check if .env variable names match .env.example (grep -E, not -P — BSD grep on macOS has no -P)
if [ -f ".env.example" ] && [ -f ".env" ]; then
  diff <(grep -E -o '^[A-Z_][A-Z0-9_]*' .env.example | sort) <(grep -E -o '^[A-Z_][A-Z0-9_]*' .env | sort) \
    || echo "WARN: .env and .env.example variable names differ (missing or extra vars — see diff above)"
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
- Check open Dependabot PRs and `pnpm outdated` (or the stack's equivalent) — but do NOT blanket-upgrade; projects often pin or ignore majors deliberately (check CLAUDE.md and dependabot.yml for ignores before proposing bumps)
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
- Show the divergence: `git log --oneline HEAD..origin/<default>` and `git log --oneline origin/<default>..HEAD`
- Suggest: rebase onto the default branch, merge it in, or continue working and deal with it later

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
