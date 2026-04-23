---
name: session-checkpoint
description: >
  Quick mid-session checkpoint that commits work-in-progress, captures key decisions and context,
  and drops breadcrumbs for context recovery — without the full ceremony of a session closeout.
  Use this skill whenever the user says "checkpoint", "save progress", "bookmark this", "snapshot",
  "save state", "quick save", "capture where we are", "breadcrumb", or any variation of wanting to
  preserve current session state without ending the session. Also trigger when context is getting
  long and compaction is likely, when switching between major tasks within a session, or when the
  user is about to try something risky and wants a known-good state to fall back to. Even if the
  user just says "let me save real quick" — use this skill. Works in both Claude Code and Cowork.
  Lighter than session-closeout, designed for use during active work.
---

# Session Checkpoint

A lightweight save-state for mid-session use. Think of it as a quicksave in a video game — you're not done playing, you just want a restore point.

The full `session-closeout` skill is a 7-phase SOP for ending a session. This is the 60-second version for use *during* a session. You're still working — you just want to make sure nothing is lost if context compacts, the session crashes, or you need to switch gears.

## When to Checkpoint

- **Before context compaction.** If you've been working a while and context is filling up, checkpoint first so key decisions survive compaction.
- **After completing a sub-task.** Finished the auth flow, now moving to the dashboard? Checkpoint the auth work before context shifts.
- **Before risky changes.** About to refactor a core module or try an experimental approach? Checkpoint the known-good state.
- **When switching contexts.** Moving from frontend to backend, or from feature work to bug fixing? Checkpoint so the prior context isn't lost.
- **Periodically on long sessions.** Every 30-60 minutes of active work is a reasonable cadence.

## The Checkpoint Process

Three steps. Should take under 60 seconds.

### Step 1: Commit Current State (Conventional Commits enforced)

```bash
# Check what's changed
git status
git diff --stat
```

The checkpoint commit **must** follow Conventional Commits format — every commit does, no exceptions, per the project's non-negotiable rules. Legacy `checkpoint: ...` messages are no longer valid. Use `wip(scope):` for work-in-progress or `chore(scope):` for tooling/maintenance checkpoints.

**Pre-commit verification:** before running `git commit`, check the user's intended message against the Conventional Commits regex:

```
^(feat|fix|docs|style|refactor|perf|test|chore|wip|build|ci|revert)(\([a-z0-9-]+\))?!?: .{1,}$
```

If the message doesn't match, auto-rewrite it. Apply these rules:

| User intent | Auto-rewrite to |
|---|---|
| `checkpoint: <thing>` | `wip(<best-guess-scope>): <thing>` |
| `checkpoint` (no message) | Block — require a description |
| `saving progress` / `wip` / `stuff` | Block — require a real description |
| Already conforming | Use as-is |

Scope is inferred from the changed files: if edits are in `src/auth/**`, scope is `auth`. If changes span multiple areas, use `multi` or omit the scope. Never guess wildly — when in doubt, ask the user for the scope in one line.

Commit everything, even if it's incomplete. The message body stays the same 3-4 line breadcrumb format:

```bash
git add -A
git commit -m "wip(<scope>): <what you're working on>

State: [what works / what's in progress]
Context: [key decisions made, approaches tried]
Next: [what you were about to do next]"
```

The commit message is the breadcrumb. Future you (or the restart skill) will read it to recover context. Make it count — 3-4 body lines that capture the *why* and *where*, not just the *what*. The `wip(scope):` prefix is what makes it discoverable and CI-compliant.

**Good checkpoint messages:**
```
wip(auth): user auth flow with Supabase

State: login/signup working, password reset WIP (email sends but redirect fails)
Context: using Supabase Auth, not custom — decided against custom because RLS integration is cleaner
Next: debug the password reset redirect, then add Google OAuth
```

```
wip(api): rate limiter middleware

State: rate limiter works for authenticated routes, untested on public routes
Context: using sliding window algorithm (not token bucket) because it's simpler and we don't need burst handling
Next: add tests for public routes, then integrate with the error handler
```

```
chore(deps): checkpoint before pnpm update

State: about to bump all devDependencies, want a clean rollback point
Context: Dependabot PR #42 just landed and I want to experiment locally before merging more
Next: pnpm update --latest and run full CI locally
```

**Bad checkpoint messages (auto-rewritten or blocked):**
```
checkpoint: work in progress    → blocked — no scope, no real description
checkpoint: stuff                → blocked
checkpoint: saving               → blocked
saving auth stuff                → rewritten to "wip(auth): saving auth stuff" + prompt for better body
```

**If commitlint is installed (recommended, per DEFAULTS-ADR-0001):** the `.husky/commit-msg` hook will reject non-conforming messages before they land. The checkpoint flow should never need to override that — if commitlint rejects the message, the checkpoint flow rewrites it and retries, it does not bypass the hook.

### Step 2: Annotate CLAUDE.md (If Needed)

Only if something important was discovered this sub-session that Claude needs to know going forward. Don't update CLAUDE.md on every checkpoint — only when there's a genuine gotcha or convention that should persist.

If you do update, add it to the Gotchas section:

```markdown
## Gotchas
- [NEW] Supabase password reset redirect URL must be whitelisted in the dashboard — the callback won't work without it
```

### Step 3: Context Note (Optional)

If context compaction is imminent or the session has been running long, add a compaction-safe note. This is a comment to yourself that will survive `/compact`:

Tell Claude: "When compacting, preserve the following context: [key decisions, current approach, what's working, what's not]."

Or add to CLAUDE.md temporarily:

```markdown
## Current Session Context
<!-- Remove after this task is complete -->
- Working on: [feature/fix]
- Approach: [what we're doing and why]
- Status: [what works, what doesn't]
- Key decisions: [anything non-obvious]
```

This section gets removed during the next closeout but keeps critical context alive through compaction.

## Quick Checkpoint (Minimum)

If even 60 seconds is too much, the absolute minimum checkpoint is:

```bash
git add -A && git commit -m "checkpoint: [one-line status]"
```

One command. That's it. Even this is infinitely better than uncommitted work floating in a dirty tree when context compacts or a session ends unexpectedly.

## Checkpoint vs. Closeout vs. Restart

| | Checkpoint | Closeout | Restart |
|---|---|---|---|
| **When** | Mid-session | End of session | Start of session |
| **Duration** | 30-60 seconds | 2-5 minutes | 1-3 minutes |
| **Commits** | WIP checkpoint commit | Final commits + closeout commit | No commits (read-only) |
| **CLAUDE.md** | Update only if gotcha found | Full review and update | Read and brief |
| **Docs** | Skip | Full update | Check freshness |
| **Config** | Skip | Review and update | Load and verify |
| **Cleanup** | Skip | Full cleanup | Health check |
| **Summary** | Commit message only | Full handoff summary | Full briefing |

## Cowork Mode

In Cowork, skip the git commit and instead:
- Save any work files
- Add a context note to CLAUDE.md or a scratch file
- Use auto-memory to capture key decisions if they should persist across conversations

## Integration with Other Skills

**Before closeout:** If you've been checkpointing regularly, closeout is faster — most of the work is already committed and documented.

**Before restart:** The restart skill looks for checkpoint commits when recovering context. Good checkpoint messages make restart briefings more accurate.

**Before risky operations:** Checkpoint + git branch gives you a full safety net. If the experiment fails, you can rewind to the checkpoint.
