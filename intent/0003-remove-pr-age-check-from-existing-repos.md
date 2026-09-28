# 0003. Remove the 10-minute PR cool-down from repos scaffolded before it was dropped

Status: Open
Date: 2026-09-28
Originator: Brandon ("I don't close the PRs, Claude does, so it's just taking time")

## Problem
PR #42 removed the cool-down from the skills and marked `DEFAULTS-ADR-0001 §8` superseded, but that only changes what new projects get. Repos scaffolded or conformed earlier still carry their own `pr-age-check` CI job, and where branch protection lists it as a required check, every merge still waits 10 minutes. Each repo's own `CLAUDE.md` (usually rule 7) still tells sessions to wait, and a session follows the local file over the skill.

## Proposed outcome
In every affected repo, a PR merges as soon as CI is green: no `pr-age-check` job, no required `pr-age-check` status check, and `CLAUDE.md` / `docs/WORKFLOW.md` / PR template say "merge once CI is green, re-read the diff".

## Affected users and systems
Local clones found carrying the job on 2026-09-28 (`.github/workflows/ci.yml`):
- `crowded-barrel/wt-project-management`
- `DaysLLC/flavorcloud`
- `DaysLLC/shorestack-dashboard`
- `DaysLLC/shorestack-reel`
- `DaysLLC/shorestack-time`
- `DaysLLC/shorestack`
- `SAI/sai-portal-intake` (SAI account — run from a `claude-sai` session)

Brandon keeps a saved per-repo prompt; the order that matters: drop `pr-age-check` from branch protection's required checks (via `gh api`, shown before running) BEFORE merging the PR that deletes the job, or that PR can never satisfy the required check.

## Constraints
- One small PR per repo, `chore(ci): drop pr-age-check cool-down`, done opportunistically when a session is already in that repo — not a dedicated sweep.
- Branch-protected repos (dashboard, books, time, shorestack): edit the required-checks list, don't disable protection.

## Open questions
- Repos with no local clone on this MacBook were not scanned (the Mac mini may hold others).
