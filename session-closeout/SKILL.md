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

### Phase 2: Commit Outstanding Work + Audit Session Commits

All work should be committed before closing. Uncommitted changes are the #1 cause of "what was I doing?" when restarting.

**Step 2.1: Commit what's left**

**If work is complete:**
```bash
git add -A
git commit -m "feat(scope): [descriptive message]

[Brief context about what was done and why]"
```

**If work is partially done:**
```bash
# Commit what's stable
git add [specific-files]
git commit -m "wip(scope): [what's in progress]

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

**Step 2.2: Conventional Commits audit (all session commits)**

Before pushing, audit every commit made this session for Conventional Commits compliance. A single non-conforming commit will fail commitlint in CI and block the merge.

```bash
# Get all commits made since the branch diverged from main
SESSION_COMMITS=$(git log --pretty=format:"%h %s" main..HEAD)
echo "$SESSION_COMMITS"

# Validate each subject against the Conventional Commits regex
NON_CONFORMING=$(echo "$SESSION_COMMITS" | awk '{$1=""; sub(/^ /,""); print}' | \
  grep -vE '^(feat|fix|docs|style|refactor|perf|test|chore|wip|build|ci|revert)(\([a-z0-9-]+\))?!?: .{1,}$' || true)

if [ -n "$NON_CONFORMING" ]; then
  echo "FOUND NON-CONFORMING COMMITS:"
  echo "$NON_CONFORMING"
else
  echo "ALL COMMITS CONFORM"
fi
```

If any commit doesn't conform, offer the user an interactive rebase to rewrite the messages:

```bash
COMMIT_COUNT=$(git rev-list --count main..HEAD)
git rebase -i HEAD~$COMMIT_COUNT
# In the editor, change 'pick' to 'reword' on each non-conforming commit
```

Walk the user through the rewrite — don't just `git rebase -i` and walk away. Suggest a conforming message for each non-conforming one based on the commit's diff. If the user prefers to squash, that's fine — but the final commit(s) must conform.

**Never push non-conforming commits.** CI will reject them, and rewriting history after push is painful.

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

### Phase 4.5: ADR & CHANGELOG Check

Before moving to config, scan the session for signs that an ADR or CHANGELOG entry should be written. This is the single highest-leverage habit in the developer transition plan — if closeout doesn't catch missing ADRs, they never get written.

**Detect architectural decisions made this session:**

```bash
# New dependencies added
git diff main..HEAD -- package.json | grep -E '^\+.*"[^"]+":\s*"[^"]+"' | grep -v devDependencies

# New top-level directories created
git diff --name-status main..HEAD | awk '$1=="A" {print $2}' | awk -F/ '{print $1}' | sort -u

# New service integrations (look for new env vars, new config files)
git diff main..HEAD -- .env.example
ls -la "$(git rev-parse --show-toplevel)"/*.config.* 2>/dev/null
```

If any of these found something substantive, prompt the user:

> "This session appears to have made architectural decisions:
> - Added dependency: `<package>`
> - New directory: `<dir>`
> - New integration: `<service>`
>
> Should we write an ADR before closing out? Y/n"

If yes:
1. Scaffold `docs/decisions/NNNN-kebab-slug.md` using the template (next number in sequence, zero-padded to 4 digits).
2. Help the user fill in Context / Decision / Consequences.
3. Add the ADR to `docs/decisions/DECISIONS.md` index with its title, status, and date.
4. Commit as `docs(decisions): add ADR NNNN <slug>`.

If the user declines, record the missed decision in the closeout commit body under `## Decisions not documented:` so it's visible on restart.

**Detect user-facing changes:**

```bash
# Changes in user-facing code paths
git diff --name-only main..HEAD | grep -E '^(src/(app|pages|components|api)/|README\.md)' | head -20
```

If any, prompt:

> "This session appears to have user-facing changes. Should we update `CHANGELOG.md` `## [Unreleased]`?
> Suggested entries based on your commits:
> - `<commit subject → CHANGELOG line>`
> - `<commit subject → CHANGELOG line>`"

CHANGELOG format (Keep a Changelog):

```markdown
## [Unreleased]

### Added
- New feature description

### Changed
- Behavior change description

### Fixed
- Bug fix description

### Removed
- Removed feature description
```

Categorize commits by Conventional Commits type:
- `feat:` → Added
- `fix:` → Fixed
- `refactor:`/`perf:` → Changed (if user-observable)
- Breaking changes (`!` or `BREAKING CHANGE:` footer) → flag prominently

If the user declines, again record this as a skipped item in the closeout commit so restart surfaces it.

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

Create a final commit that captures the closeout updates (`chore(scope):` prefix mandatory — even the closeout commit conforms):

```bash
git add -A
git commit -m "chore(closeout): session closeout — update docs and project state

Summary of this session:
- [What was accomplished]
- [What's in progress]
- [What's blocked or needs attention]

Next session should:
- [Priority 1]
- [Priority 2]
- [Priority 3]"
```

**Then gather the operational metrics before presenting the summary:**

```bash
# Eval drift (AI projects only)
if [ -d "evals/history" ]; then
  LATEST=$(ls -t evals/history/*.json | head -1)
  PREVIOUS=$(ls -t evals/history/*.json | head -2 | tail -1)
  LATEST_SCORE=$(jq -r '.score' "$LATEST" 2>/dev/null || echo "?")
  PREVIOUS_SCORE=$(jq -r '.score' "$PREVIOUS" 2>/dev/null || echo "?")
  LATEST_PASSED=$(jq -r '.passed' "$LATEST" 2>/dev/null || echo "?")
  LATEST_TOTAL=$(jq -r '.total' "$LATEST" 2>/dev/null || echo "?")
fi

# CI status of last run on current branch
CI_STATUS=$(gh run list --branch "$(git branch --show-current)" --limit 1 --json status,conclusion -q '.[0].conclusion' 2>/dev/null)

# Open (Proposed) ADRs
OPEN_ADRS=$(grep -l '^Status: Proposed' docs/decisions/*.md 2>/dev/null | wc -l | tr -d ' ')

# CHANGELOG Unreleased entries
if [ -f "CHANGELOG.md" ]; then
  UNRELEASED_LINES=$(awk '/^## \[Unreleased\]/,/^## \[/' CHANGELOG.md | grep -cE '^- ')
fi
```

**Present the summary to the user:**

**Session Closeout Summary**

1. **Completed this session:** [list of completed work]
2. **In progress:** [any WIP with status]
3. **Updated documentation:** [which docs were updated]
4. **Discovered issues:** [bugs found, gotchas, tech debt]
5. **Recommended next steps:** [prioritized list for next session]
6. **Operational metrics:**
   - **Eval pass rate:** `$LATEST_PASSED/$LATEST_TOTAL` (delta vs previous: `$LATEST_SCORE - $PREVIOUS_SCORE`) — flag prominently if regression.
   - **CI status:** `$CI_STATUS` on branch `<branch>`. If red or pending, tell the user: "Don't merge until green."
   - **Open ADRs:** `$OPEN_ADRS` in Proposed status — list them.
   - **CHANGELOG Unreleased entries:** `$UNRELEASED_LINES` — if 0 and this session touched user-facing code, flag as missed.
   - **Conventional Commits compliance:** [result from Phase 2.2 audit]
7. **Project health:** [quick assessment — is the folder clean, are docs current, are tests passing?]

**If the user is about to merge a PR from this branch:** remind them of the 10-minute cool-down (per `DEFAULTS-ADR-0001`). The CI `pr-age-check` job will block merge for PRs under 10 minutes old, but the habit is to close Claude, get water, come back, and re-read the diff. Don't merge in the same minute you push.

**If the user has uncommitted work they chose not to commit or stash:** do not let closeout finish silently. Either they confirm "discard" or they commit/stash. The closeout skill does not end a session with a dirty working tree.

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
