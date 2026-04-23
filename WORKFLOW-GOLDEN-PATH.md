# WORKFLOW.md — Golden Path

> This is the canonical template for `docs/WORKFLOW.md` in every project scaffolded from `Brandondaymdr/project-template`. It shows — end to end — what "work on a feature" looks like. Re-read it any time the process feels fuzzy.

---

## The one-page version

```
pull main → branch → code → commit (conventional) → push → PR → CI green
         → 10-min cool-down → self-review → merge → update CHANGELOG/ADR → closeout
```

That's the whole thing. Every feature. Every fix. Every tweak.

---

## Full walkthrough

### 1. Start from a clean `main`

```bash
git checkout main
git pull
```

If `main` doesn't update cleanly (conflicts, errors, red CI): fix that before doing anything else. Never branch from a broken `main`.

### 2. Branch with a typed prefix

Match the commit type you expect to use. Examples:

- `feat/gross-to-net-calculator` — new feature
- `fix/password-reset-redirect` — bug fix
- `chore/upgrade-vitest-to-2` — tooling
- `docs/adr-0005-sentry` — docs-only
- `refactor/extract-payroll-service` — restructuring
- `experiment/llm-graded-evals` — throwaway spike

```bash
git checkout -b feat/short-kebab-description
```

### 3. Do the work

Small, frequent commits. Each one with a valid Conventional Commits message. If Claude is helping, ask for `feat(scope): ...` or `fix(scope): ...` format explicitly when it proposes a commit.

If you hit a natural pause, use `/checkpoint` — a `wip(scope):` commit with a 3-line body (State, Context, Next).

### 4. Every bug fix gets a regression test before the fix ships

This is the non-negotiable. The commit order is:

```bash
# 1. Write the failing test first
git add tests/
git commit -m "test(payroll): add regression for off-by-one in overtime calc"

# 2. Ship the fix
git add src/
git commit -m "fix(payroll): off-by-one in overtime calc"
```

The test commit proves the bug existed. The fix commit proves it's fixed. The pair is the regression test suite growing organically.

### 5. Architectural decisions get an ADR before the PR merges

If you made a real decision — a library choice, a pattern, a trade-off worth documenting — write it up.

```bash
# Next ADR number (zero-padded)
NEXT=$(ls docs/decisions/ | grep -E '^[0-9]{4}-' | tail -1 | awk -F- '{printf "%04d", $1+1}')

# Scaffold from template
cp docs/decisions/0000-template.md "docs/decisions/${NEXT}-your-slug.md"

# Fill in Context, Decision, Consequences
# Then update the index
```

Update `docs/decisions/DECISIONS.md` with a new row. Commit as `docs(decisions): add ADR ${NEXT} your-slug`.

Don't save ADRs for "big" decisions. 10-minute trade-offs are ADR-worthy. The habit is more valuable than the gravity.

### 6. Update CHANGELOG if user-facing

If your change affects what a user (or consumer of this library) sees, add an entry under `## [Unreleased]` in `CHANGELOG.md`:

```markdown
## [Unreleased]

### Added
- Gross-to-net calculator supporting multi-state payroll (#42)

### Fixed
- Password reset redirect now preserves query params (#41)
```

Reference the PR number. `session-closeout` will remind you if you forget.

### 7. Run verification locally before pushing

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:evals   # if AI project
```

All green? Push.

```bash
git push -u origin HEAD
```

Any red? Fix before pushing. Pushing red CI burns Dependabot window and trains bad habits.

### 8. Open the PR with a real description

```bash
gh pr create --fill
# Or, better, with a proper body:
gh pr create --title "feat(payroll): gross-to-net calculator" --body "$(cat <<'EOF'
## What changed
[The actual change, 2-3 bullet points]

## Why
[The motivation, linked to an issue or ADR]

## Checklist
- [x] Conventional commit format used
- [x] Tests added (smoke + regression for known edge case)
- [x] ADR 0007 written for the multi-state decision
- [x] CHANGELOG Unreleased entry added
- [x] Evals re-run and committed (score: 0.98, delta: +0.02)
- [ ] CI green (in progress)

## How to verify
1. Clone, `pnpm install`, `pnpm test`
2. Spot check scenarios in `src/payroll/__tests__/multistate.test.ts`
EOF
)"
```

### 9. Wait 10 minutes. Then re-read the diff.

The 10-minute cool-down is mandatory (per `DEFAULTS-ADR-0001`). It's mechanically enforced — the `pr-age-check` CI job will refuse to let you merge a PR under 10 minutes old.

During the wait: walk, water, do something unrelated. **Not the same PR.** The point is fresh eyes.

When you come back, re-read the diff top to bottom on GitHub. Not the code — the diff. Look for:

- Dead code or debug statements you forgot to remove
- TODOs that should be resolved or tracked as issues
- Comments that say the opposite of what the code does
- Obvious naming issues you couldn't see at the time
- Anything you'd flag if a coworker opened this PR

About 1 in 5 PRs has something worth catching. It's embarrassingly high. That's the point.

### 10. Merge (squash, usually)

```bash
gh pr merge --squash --delete-branch
```

Squash keeps main's history clean — one commit per feature. The squashed commit message should use the PR title (Conventional Commits format), and the body should include the PR description. `gh` does this automatically if your PR is well-titled.

### 11. Run closeout

Back on main, run `/closeout` to:
- Sync main locally
- Confirm the ADR and CHANGELOG updated
- Check CI green on main post-merge
- Check eval history updated if AI project
- Commit any remaining local state

### Exceptions (narrow, well-defined)

- **Dependabot PRs (`chore(deps):` ...)** can merge without the 10-min cool-down if CI is green.
- **Docs-only PRs (`docs:` ...)** can merge without the cool-down.
- **Hotfixes on live-breaking production issues** can bypass the cool-down with an explicit note in the PR. Write a post-incident ADR afterward explaining what happened.

Everything else: no exceptions. The discipline is the feature.

---

## What this feels like

The first week: slow. You'll chafe against the 10-min cool-down and the ADR overhead.

The second week: faster. Your muscle memory catches up and most of the friction disappears.

The third month: you realize you haven't relitigated an architectural decision in weeks because the ADR told you why. You open an old project and understand it in 5 minutes instead of 45. The workflow has become invisible — it's just how you work now.

That's when you've become a developer.
