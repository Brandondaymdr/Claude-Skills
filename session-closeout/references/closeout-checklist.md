# Session Closeout Checklist

Run through this at the end of every session. Check items as you go.

---

## Work State

- [ ] All completed work committed with descriptive messages
- [ ] In-progress work committed as WIP with status and next steps
- [ ] Experimental changes stashed with descriptive messages
- [ ] No uncommitted changes remaining (`git status` is clean)
- [ ] No orphaned stashes from previous sessions (review `git stash list`)
- [ ] Current branch state is clear (on correct branch, pushed if remote exists)

## CLAUDE.md Updates

- [ ] New gotchas documented
- [ ] Commands updated if new scripts added
- [ ] Architecture updated if structure changed
- [ ] Stale information removed
- [ ] Under 200 lines
- [ ] Deletion test passed (every line earns its place)

## Project Documentation

- [ ] README.md reflects current setup steps
- [ ] .env.example includes all required variables
- [ ] docs/ files updated if they drifted from reality
- [ ] TODO items updated (completed marked, new ones added)
- [ ] API docs current (if applicable)

## .claude/ Configuration

- [ ] New rules added for conventions discovered this session
- [ ] New commands created for repeated workflows
- [ ] Skills updated with domain knowledge gained
- [ ] settings.json permissions updated if needed
- [ ] Hooks added for automations that should have existed

## Cleanup

- [ ] No temp files (.tmp, .bak, ~) lingering
- [ ] No large files accidentally staged
- [ ] Debug code flagged (console.log, debugger, HACK, FIXME)
- [ ] No sensitive data in committed files (.env values, API keys)

## Handoff

- [ ] Closeout commit created with session summary
- [ ] Completed work listed
- [ ] In-progress work documented with status
- [ ] Blockers and discovered issues noted
- [ ] Next session priorities identified (top 3)
- [ ] Project health assessed (tests passing, docs current, folder clean)

## Quick Closeout (Minimum Viable)

If pressed for time, at least do these three things:

- [ ] Commit all work (even as WIP)
- [ ] Note any critical gotchas in CLAUDE.md
- [ ] State what the next session should start with
