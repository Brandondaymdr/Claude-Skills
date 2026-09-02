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
- [ ] Mistake-twice scan run: second-occurrence corrections → CLAUDE.md gotcha (or hook/rule if it must hold 100%)
- [ ] Under 200 lines
- [ ] Deletion test passed (every line earns its place)

## Project Documentation

- [ ] README.md reflects current setup steps
- [ ] .env.example includes all required variables
- [ ] docs/ files updated if they drifted from reality
- [ ] TODO items updated (completed marked, new ones added)
- [ ] `intent/*.md` statuses flipped (Done / Dropped) for work that shipped or was abandoned
- [ ] `docs/plans/*.md` for this session's items match the merged diff (updated in the closeout commit if not)
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
- [ ] Branch pushed to remote; PR opened or updated (or "no remote" noted in summary)
- [ ] Completed work listed
- [ ] In-progress work documented with status
- [ ] Blockers and discovered issues noted
- [ ] Tee-up written: 1–3 next-session items, each with a drafted done-criterion (`[Item] — done when: [verifiable check]`) — restart presents these as the next session's contract
- [ ] Review before tee-up: each completed item's verification cited (not "implemented")
- [ ] Anything that outlives the next session written as `intent/NNNN-slug.md` (`Status: Open`), committed `docs(intent): ...`, and referenced from the tee-up
- [ ] Project health assessed (tests passing, docs current, folder clean)

## Quick Closeout (Minimum Viable)

If pressed for time, at least do these three things:

- [ ] Commit all work (even as WIP)
- [ ] Note any critical gotchas in CLAUDE.md
- [ ] State what the next session should start with
