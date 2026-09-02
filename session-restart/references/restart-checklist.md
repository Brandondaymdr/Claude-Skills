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
- [ ] Look for closeout commit (`git log --all --grep="chore(closeout)"`)
- [ ] Read closeout commit message for session summary
- [ ] Read the artifact chain: open `intent/*.md` (Status Open / In progress), `SPEC.md` if kept, `docs/plans/*.md` not yet Done — flag stale ones in Heads up
- [ ] **Real fetch** (`git fetch origin` — never `--dry-run`), then check ahead/behind (`git rev-list --left-right --count @{u}...HEAD`)
- [ ] Behind + clean → `git pull --ff-only`; behind + dirty → flag in briefing, don't pull
- [ ] Fleet projects: sync the build queue (`node scripts/sync-fleet-queue.mjs` if present; else manual skim vs merged `[FLEET]` PRs)

## Health Check

Scale to time away; skip checks that don't apply — don't report N/A rows.

- [ ] Dependencies installed (node_modules, venv, etc.)
- [ ] Tests pass
- [ ] Build succeeds
- [ ] Lint clean
- [ ] CI state: default branch green? current branch / open PR green? failures in last 24h?
- [ ] Eval drift (AI projects): diff two most recent eval runs, flag score regressions
- [ ] .env variable names match .env.example
- [ ] No large temp files or debug artifacts

## Context Recovery

- [ ] Identify what was worked on last session
- [ ] Identify current work state (clean, WIP, stashed, dirty)
- [ ] Identify pending items (TODOs, open issues, failing tests)
- [ ] Identify external changes since last session
- [ ] Review any WIP commit messages for status and next steps

## Briefing

- [ ] Red CI, eval regressions, or remote drift go at the TOP — never buried in a table
- [ ] Present project name and one-line description
- [ ] Summarize last session's work
- [ ] Report current state (branch, status, health)
- [ ] List pending/in-progress work
- [ ] Present the session contract: at most 3 Build items, sourced from the last closeout's tee-up first, open intent files second, project goal third, health-check escalations fourth (user's ask overrides all)
- [ ] Each contract item has an *Artifact* (intent/plan path or "none"), a *How* (one-line approach) and a *Done looks like* (the command, smoke, or artifact that proves it — never "implemented")
- [ ] State the tee-up commitment: closeout will tee up 1–3 items for next session, each with a drafted done-criterion
- [ ] Flag any gotchas, blockers, or changes

## Ready

- [ ] Confirm the contract with the user (they may swap items; cap stays at 3)
- [ ] More than 3 items handed over → first 3 are the contract, rest is the queue
- [ ] Mid-session discoveries → backlog, never scope
- [ ] Review-class items (engine / money-path / wide diff) get `docs/plans/<slug>.md` committed BEFORE the first edit; ordinary items keep the brief in conversation
- [ ] Offer to show WIP diffs if applicable
- [ ] Begin work
