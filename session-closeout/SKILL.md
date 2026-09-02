---
name: session-closeout
description: >
  Properly close out a Claude Code or Cowork session using a structured SOP that updates project
  documentation, commits work cleanly, captures session knowledge, and leaves the project folder
  in optimal state for the next session. Use this skill whenever the user says "close out",
  "wrap up", "wind down", "end session", "done for now", "that's it for today", "closeout",
  "session end", "park this", or any variation of finishing a work session. (A bare
  "save progress" mid-session belongs to session-checkpoint, not closeout.)
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

**Derive the session commit range.** Later phases (2.2, 4.5, 4.7) audit "the commits made this session." Don't hardcode `main..HEAD` — the default branch may have a different name, and if the session ran directly on the default branch that range is empty and every audit silently passes.

```bash
DEFAULT_BRANCH=$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | sed 's@^origin/@@')
DEFAULT_BRANCH=${DEFAULT_BRANCH:-main}

if [ "$(git branch --show-current)" = "$DEFAULT_BRANCH" ]; then
  # Session ran directly on the default branch. Flag it (branch-first repos
  # shouldn't be here) and fall back to everything since the last closeout
  # commit, or the last 10 commits if there's never been one.
  echo "WARN: working directly on $DEFAULT_BRANCH — using last closeout as range base"
  LAST_CLOSEOUT=$(git log --grep='chore(closeout)' --format=%H -1 2>/dev/null)
  RANGE="${LAST_CLOSEOUT:-HEAD~10}..HEAD"
else
  RANGE="$DEFAULT_BRANCH..HEAD"
fi
echo "Session range: $RANGE"
```

Shell state does not persist between tool calls — re-derive (or inline the resolved value of) `$RANGE` and `$DEFAULT_BRANCH` in any later phase's commands.

Produce a mental inventory:
- What features/fixes were completed?
- What's partially done?
- What was attempted but abandoned (and why)?
- Any blockers or decisions that need to be made next session?
- Any bugs discovered but not fixed?

**Closeout records; it doesn't expand.** Bugs, debt, and stale docs discovered during closeout become entries in the summary's *Discovered issues* / *Recommended next steps* — they do not become new work at wind-down time. The only writes closeout makes are the ones its phases explicitly call for (commits, doc updates, config updates).

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

**Step 2.1.5: Sync Fleet build queue (Fleet projects only)**

If the project uses Fleet (`.fleet/BUILD_QUEUE.md` exists), reconcile the queue against merged PRs **before** writing the closeout commit. The closeout commit body summarizes queue state ("N merged this session, M still in_review, queue empty"), and a stale queue corrupts that summary and confuses the next restart.

```bash
if [ -f ".fleet/BUILD_QUEUE.md" ] && [ -f "scripts/sync-fleet-queue.mjs" ]; then
  node scripts/sync-fleet-queue.mjs
fi
```

The script is idempotent — running it on a clean queue is a no-op (exits 0, no file changes). If it produces changes, stage them into the closeout commit (or a preceding `chore(fleet): sync queue` commit if you want the sync change to be auditable on its own — preferred when multiple slices flipped status). The script writes the BUILD_QUEUE.md atomically via tmpfile + rename, so a partial run won't corrupt the file.

If `.fleet/BUILD_QUEUE.md` exists but the script is missing, manually walk the queue and update any rows whose PR has merged since the last closeout (cross-check against `gh pr list --state merged --search "[FLEET] in:title" --limit 20`).

Reason this exists: Day-13 of the barrel-tracking pilot, an overnight dispatcher left 6 PRs in mixed `validated`/`flagged` states and the next session's closeout commit summarized them as "in flight" — but several had merged hours earlier. Running queue-sync at closeout (and again at restart, per [session-restart](../session-restart/SKILL.md)) catches this on both ends of the handoff.

**Step 2.2: Conventional Commits audit (all session commits)**

Before pushing, audit every commit made this session for Conventional Commits compliance. A single non-conforming commit will fail commitlint in CI and block the merge.

```bash
# Get all commits in the session range (see Phase 1 for $RANGE derivation)
SESSION_COMMITS=$(git log --pretty=format:"%h %s" "$RANGE")
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

If any commit doesn't conform, rewrite the messages. **Do not reach for `git rebase -i`** — interactive git commands don't work inside Claude Code. Pick the lightest option that fits:

**Only the most recent commit is non-conforming:**

```bash
git commit --amend -m "fix(scope): conforming message"
```

**Multiple commits are non-conforming** (fine under a squash-merge house style — granular history won't survive the merge anyway): soft-reset to the branch point and recommit as one or a few conforming commits:

```bash
git reset --soft "$(git merge-base "$DEFAULT_BRANCH" HEAD)"
git commit -m "feat(scope): conforming message covering the session's work"
```

**The user wants to keep granular history with per-commit rewords:** the interactive rebase has to be theirs — suggest they type `! git rebase -i HEAD~N` in the prompt so it runs in their terminal, and propose a conforming message for each bad commit (based on its diff) *before* they start.

Either rewrite path changes history — if the branch was already pushed, follow with `git push --force-with-lease` (never plain `--force`).

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

Run the deletion test: for every line in CLAUDE.md, ask "would Claude make a mistake without this?" Remove anything that fails — including anything the codebase itself already says (a command that's in `package.json`, a convention the linter enforces).

**Run the mistake-twice scan.** Walk the session for anything that went wrong *twice* — the user corrected the same thing again, a gate failed for the same reason again, Claude re-made a mistake it had already fixed. Each one is a CLAUDE.md gotcha by rule ("when Claude makes a mistake twice, the correction goes into CLAUDE.md" — the playbook, the Claude Code docs, and the Claude Code team all state it identically). If the correction has to hold 100% of the time (formatting, a forbidden path, a command that must run), it is a hook or a `.claude/rules/` file, not a CLAUDE.md line — CLAUDE.md is advisory. One-off slips don't qualify; the second occurrence is the signal.

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
# New dependencies added. Heuristic: matches every added line in package.json,
# which includes version bumps and devDependencies — a unified diff doesn't say
# which section a line belongs to. Eyeball the hits; only genuinely new runtime
# dependencies signal an architectural decision.
git diff "$RANGE" -- package.json | grep -E '^\+\s*"[^"]+":\s*"[^"]+"'

# New top-level directories created
git diff --name-status "$RANGE" | awk '$1=="A" {print $2}' | awk -F/ '{print $1}' | sort -u

# New service integrations (look for new env vars, new config files)
git diff "$RANGE" -- .env.example
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
git diff --name-only "$RANGE" | grep -E '^(src/(app|pages|components|api)/|README\.md)' | head -20
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

**Reconcile intent and plan files (projects with `intent/` or `docs/plans/`):**

```bash
# Intent files whose work shipped this session — flip Status to Done
ls intent/*.md 2>/dev/null | grep -v 0000-template | xargs grep -l '^Status: \(Open\|In progress\)' 2>/dev/null

# Plans touched or referenced by this session's items
git diff --name-only "$RANGE" -- docs/plans/ 2>/dev/null
ls docs/plans/*.md 2>/dev/null
```

For each contract item that had a committed plan: the merged diff should match the plan. If implementation departed from it, update the plan **in the same commit as the closeout** (the playbook's rule is "update `plan.md` in the same commit" — a plan that disagrees with the code is worse than no plan) and mark it `Status: Done`. For each intent file whose outcome shipped, set `Status: Done`; if the work was abandoned, `Status: Dropped` with one line saying why. Don't write new plans here — plans are written by `session-restart` before the first edit, never retroactively.

### Phase 4.7: Fleet Template Backport Check (Fleet projects only)

If this session modified Fleet's operational scripts or config (`.fleet/bin/*`, `.fleet/CONFIG.yaml`, `.fleet/SLICE_TEMPLATE.md`, or anything else under `.fleet/` that exists as a template), the same change probably needs to propagate into `.claude/skills/fleet-init/templates/` so future projects bootstrap with the fix. Otherwise the lesson stays local to the pilot and every new Fleet project re-discovers the same bug.

Templates can live in **two places**, and both matter: a project-local copy (`.claude/skills/fleet-init/templates/`, installed by the bootstrap) and the **canonical skills repo** (`~/.claude/skills/fleet-init/templates/` — a symlink into the claude-skills repo's working tree). A backport that only updates the project-local copy leaves every *future* bootstrap stale. Check drift against both:

```bash
if [ -d ".fleet" ]; then
  # What did this session touch under .fleet that has a template counterpart?
  CHANGED_FLEET=$(git diff --name-only "$RANGE" -- .fleet/bin .fleet/CONFIG.yaml .fleet/SLICE_TEMPLATE.md 2>/dev/null)

  if [ -n "$CHANGED_FLEET" ]; then
    echo "Fleet operational files modified this session:"
    echo "$CHANGED_FLEET"
    for TEMPLATE_ROOT in ".claude/skills/fleet-init/templates" "$HOME/.claude/skills/fleet-init/templates"; do
      [ -d "$TEMPLATE_ROOT" ] || continue
      echo ""
      echo "Checking drift against $TEMPLATE_ROOT:"
      for f in $CHANGED_FLEET; do
        REL=${f#.fleet/}
        TEMPLATE_PATH="$TEMPLATE_ROOT/$REL"
        if [ -f "$TEMPLATE_PATH" ]; then
          if diff -q "$f" "$TEMPLATE_PATH" >/dev/null 2>&1; then
            echo "  OK: $f matches template"
          else
            echo "  DRIFT: $f vs $TEMPLATE_PATH"
          fi
        else
          echo "  (no template at $TEMPLATE_PATH — non-templated file, skip)"
        fi
      done
    done
  fi
fi
```

If any line above says `DRIFT:`, prompt the user:

> "This session changed Fleet config/scripts. The fleet-init templates would still bootstrap new projects with the OLD versions. Backport the changes now so future Fleet projects inherit the fix? Y/n"

If yes:
1. For each `DRIFT:` pair, copy the project's `.fleet/` file over the template counterpart in **every** location that has one (`cp .fleet/bin/foo.sh .claude/skills/fleet-init/templates/bin/foo.sh`, and likewise into `~/.claude/skills/fleet-init/templates/`).
2. Re-run the diff check above to confirm parity in both locations.
3. **Project-local copy:** commit in the project repo as a separate `chore(skill): backport <description> to fleet-init templates` commit (don't bundle with the closeout commit — backports are easier to review and revert when isolated).
4. **Canonical copy:** `~/.claude/skills` is a *different git repo* (claude-skills) with its own branch→PR workflow — the project commit in step 3 does not capture it. The `cp` takes effect live immediately (the install is a symlinked working tree) but is committed nowhere; stopping here strands the backport as uncommitted work in that repo. Finish the hop: in the claude-skills repo, branch (`chore/backport-<description>`), commit, push, open the PR. If you can't finish it now, record it under `## Template backports deferred:` — this exact stranding sat unnoticed for 7 weeks once.

If no, record the deferred backport in the closeout commit body under `## Template backports deferred:` so it surfaces on the next restart. Be specific: list the file paths and a one-line description of what the change does, so future-you doesn't have to re-derive the context.

Reason this exists: Day-14 retro Decision 4 of the barrel-tracking pilot identified that operational Fleet fixes (like the `gtimeout` wall-clock cap added on Day 15) need to propagate into the bootstrap template, but the manual mirror step was easy to forget. The hdyw bootstrap on Day 14 inherited stale templates because the backport hadn't been done. Automating drift detection at closeout closes the gap before the next bootstrap. The two-location check exists because a later audit found a "successful" single-hop backport had updated only the pilot's local copy — the canonical templates still differed on `dispatcher.sh` and `lib.sh`.

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

# Check for debug code left behind — git grep covers tracked files only, so it
# works regardless of layout (src/, app/, packages/). Adapt patterns to the stack
# (e.g. print( for Python, dbg! for Rust).
git grep -nE "console\.log|debugger|TODO.*REMOVE|HACK|FIXME" -- ':!*.lock' ':!*.md' 2>/dev/null | head -20
```

Don't be overly aggressive — some TODOs and console.logs are intentional. But flag anything that looks like session debris.

### Phase 7: Session Summary & Handoff

Create a final commit that captures the closeout updates (`chore(scope):` prefix mandatory — even the closeout commit conforms).

**The tee-up is the contract for the next session.** `session-restart` presents these items verbatim as the next session's Build list, so each one must carry a drafted done-criterion — the command, smoke test, or artifact that will prove it. An item teed up without a done-criterion gates nothing; "finish the feature" is a wish, "`pnpm test` green with the new fixture red-then-green" is a contract. Tee up 1–3 items, no more — and only after each of *this* session's completed items has its verification cited (the review-before-tee-up rule).

**Anything that outlives the next session becomes an intent file, not a commit-body bullet.** The tee-up holds what the *next* session will build. Work that is bigger than that — a feature that will take several sessions, a bug that needs investigation before it can be scoped, a process change, a discovered issue too large for FOLLOWUPS — is written as `intent/NNNN-<slug>.md` with `Status: Open`, using the project's `intent/0000-template.md` (five sections: Problem, Proposed outcome, Affected users and systems, Constraints, Open questions). Fill Problem and Proposed outcome from what the session actually learned; leave Open questions honest. Then reference the path from the tee-up or the discovered-issues list. This is what lets the next restart source contract items from disk instead of re-deriving them from a commit message.

```bash
# Next intent number (zero-padded), same scheme as ADRs
NEXT=$(ls intent/ 2>/dev/null | grep -E '^[0-9]{4}-' | grep -v '^0000-' | sort | tail -1 | awk -F- '{printf "%04d", $1+1}')
echo "${NEXT:-0001}"
```

Rules of thumb: a tee-up item that is itself the *first slice* of a multi-session initiative gets an intent file too, and the tee-up cites it. If the project is Tier 1/2 and has no `intent/` folder yet, create it (README + template from `../project-kickoff/SKILL.md`, "The intent folder") — additive, and it goes in the closeout commit. If the project is Tier 3, or the user declines, the item goes to FOLLOWUPS/backlog as before. Commit intent files as `docs(intent): add NNNN <slug>` ahead of the closeout commit so they're reviewable on their own.

```bash
git add -A
git commit -m "chore(closeout): session closeout — update docs and project state

Summary of this session:
- [What was accomplished — with the verification cited per item]
- [What's in progress]
- [What's blocked or needs attention]

Tee-up — next session should (1-3 items, each with its done-criterion):
- [Item 1] — done when: [the command, smoke, or artifact that proves it] (intent/NNNN-slug.md if it starts an initiative)
- [Item 2] — done when: [...]
- [Item 3] — done when: [...]

Intent files written (work that outlives the next session):
- intent/NNNN-slug.md — [one line]"
```

**Then push — a closeout that only exists locally defeats the handoff.** Another machine or teammate pulling the repo sees none of it, and the session summary is stranded on this machine (in a multi-machine setup this is exactly how work goes missing).

```bash
# Push the branch (sets upstream if new)
git push -u origin "$(git branch --show-current)"

# Surface the PR state: report the existing PR, or note that one is needed
gh pr view --json url,state,title -q '"\(.state) \(.title) — \(.url)"' 2>/dev/null \
  || echo "No PR for this branch yet — open one with: gh pr create"
```

If the repo has no remote, say so explicitly in the summary instead of skipping silently.

**Then gather the operational metrics before presenting the summary:**

```bash
# Eval drift (AI projects only; needs at least 2 runs — with 1, "previous"
# would equal "latest" and report a misleading zero delta)
if [ -d "evals/history" ] && [ "$(ls evals/history/*.json 2>/dev/null | wc -l)" -ge 2 ]; then
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

**Present the summary to the user.** Write it for a reader who watched none of the session: lead with what shipped, in plain sentences, and spell out identifiers — no session shorthand, arrow chains, or labels invented mid-conversation. This summary (and the closeout commit body) is the next session's first look at everything.

**Session Closeout Summary**

1. **Completed this session:** [list of completed work]
2. **In progress:** [any WIP with status]
3. **Updated documentation:** [which docs were updated]
4. **Discovered issues:** [bugs found, gotchas, tech debt]
5. **Tee-up for next session:** [1–3 items, each as `[Item] — done when: [verifiable criterion]`, mirroring the closeout commit — session-restart will present these as the next session's contract]
   - **Intent files written:** [paths, or "none"] — everything that outlives the next session lives here, not in the tee-up
6. **Operational metrics:**
   - **Eval pass rate:** `$LATEST_PASSED/$LATEST_TOTAL` (delta vs previous: `$LATEST_SCORE - $PREVIOUS_SCORE`) — flag prominently if regression.
   - **CI status:** `$CI_STATUS` on branch `<branch>`. If red or pending, tell the user: "Don't merge until green."
   - **Open ADRs:** `$OPEN_ADRS` in Proposed status — list them.
   - **CHANGELOG Unreleased entries:** `$UNRELEASED_LINES` — if 0 and this session touched user-facing code, flag as missed.
   - **Conventional Commits compliance:** [result from Phase 2.2 audit]
7. **Handoff state:** branch pushed? PR open/updated (link)? — or "no remote" if the repo has none
8. **Project health:** [quick assessment — is the folder clean, are docs current, are tests passing? Cite the session's most recent gate run; re-run only if commits landed after it]

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
- A recent closeout commit with session summary and a tee-up of 1–3 items, each with a drafted done-criterion — restart opens the next session with these as its contract
- `intent/*.md` files with `Status: Open` for anything larger than the next session — restart reads these from disk when the tee-up is thin or stale

When closeout is done well, restart takes seconds instead of minutes.

## Quick Closeout (Abbreviated)

If the user is in a hurry, run a minimal closeout:

1. `git add -A && git commit -m "wip: [brief status]"` — commit everything
2. Add one line to CLAUDE.md under Gotchas if anything critical was discovered
3. Tell the user what the next session should start with — even in a hurry, give the top item a done-criterion (one clause: what command or artifact proves it)

Even a 30-second closeout is better than no closeout. The goal is to never leave a session with uncommitted work and no breadcrumbs.

## Reference Files

- `references/closeout-checklist.md` — Quick-reference checklist for session closeout
- `references/commit-conventions.md` — Commit message templates for closeout commits
