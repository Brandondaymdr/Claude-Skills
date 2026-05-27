# Fleet — Autonomous Build System for {{PROJECT_NAME}}

**Fleet** is a parallel-agent build system layered on top of this repo. It runs narrow autonomous agents that pick work off a queue, build it on isolated branches, and open draft PRs for human review. A separate validator agent (using a different model from the builder) reviews each PR adversarially against the slice's acceptance criteria before it lands in your inbox.

This system is **non-destructive**: every Fleet artifact lives under `.fleet/`. To remove Fleet entirely, `rm -rf .fleet/` and delete any LaunchAgents/cron jobs pointing at it. No code changes happen outside feature branches you explicitly merge.

## How it works

Two scripts, run by LaunchAgent (or cron) on the always-on host:

- **`bin/dispatcher.sh`** — every N minutes (see `CONFIG.yaml`): checks the kill switch, picks the next ready slice from `BUILD_QUEUE.md`, marks it `claimed`, creates a `{{BRANCH_PREFIX}}<slice-id>` branch, spawns a builder agent (`claude` CLI) with the slice spec, commits the result, pushes, and opens a draft PR titled `[{{SLICE_PREFIX}}] <slice-id>: <title>`.
- **`bin/validator.sh`** — every M minutes: finds open draft PRs from Fleet that haven't been validated yet, spawns a validator agent (`codex exec` — different model on purpose) with the slice spec and the PR diff, posts the validator's report as a PR comment, and flips the slice status to `validated` or `flagged`.

You review validated PRs and merge. You triage flagged PRs and either correct, close, or move them to the graveyard.

## File structure

```
.fleet/
├── README.md              ← this file
├── CONFIG.yaml            ← per-project knobs (models, intervals, commands)
├── BUILD_QUEUE.md         ← index of all slices: ID, title, status, depends-on
├── SLICE_TEMPLATE.md      ← copy this when writing a new slice
├── ARCHITECTURE.md        ← design rationale and lessons learned
├── MAC_MINI_SETUP.md      ← one-time host setup runbook
├── slices/                ← one file per slice spec
│   └── {{SLICE_PREFIX}}-0001-*.md
├── prompts/
│   ├── builder.md         ← system prompt for builder agents
│   └── validator.md       ← system prompt for validator agents
├── bin/
│   ├── cron-tick.sh       ← LaunchAgent wrapper (PATH + state hygiene)
│   ├── dispatcher.sh      ← entry point: spawn builders
│   ├── validator.sh       ← entry point: run validators
│   ├── fleet-control.sh   ← operator pause/resume/status helper
│   ├── status.sh          ← human dashboard (PRs, logs, queue)
│   └── lib.sh             ← shared shell utilities
├── logs/                  ← gitignored; written by both branches
│   ├── METRICS.md         ← daily counts: shipped, rejected, cost
│   ├── GRAVEYARD.md       ← failed slices + diagnoses
│   ├── dispatcher.log     ← raw dispatcher stdout
│   └── validator.log      ← raw validator stdout
└── KILL_SWITCH            ← if this file exists, both scripts abort immediately
```

## Operating Fleet

### Daily routine (5–15 minutes)

1. Open the repo on GitHub. Filter PRs by `[{{SLICE_PREFIX}}]` in title.
2. For each PR with a green CI check + a clean validator comment: skim the diff, merge if good.
3. For each PR with a flagged validator comment: read the gaps, decide → fix-and-merge, close-without-merging (move to graveyard), or comment back to the slice spec to refine.
4. Update `BUILD_QUEUE.md`: add new slices for any work that surfaced overnight, mark merged slices `done`.
5. Update `logs/METRICS.md` with the day's counts.

### Adding a new slice

1. Copy `SLICE_TEMPLATE.md` to `slices/{{SLICE_PREFIX}}-NNNN-short-name.md`. Increment NNNN.
2. Write **specific** acceptance criteria. Vague slices = vague code. The single most important rule.
3. Add an entry to `BUILD_QUEUE.md` with status `ready`.
4. The dispatcher will pick it up on its next run.

### Kill switch

If anything looks wrong:

```bash
touch .fleet/KILL_SWITCH
```

Both dispatcher and validator check for this file as their first action. They exit cleanly without claiming new work or modifying state. Existing in-flight branches/PRs are unaffected — review and merge or close them manually.

To resume: `rm .fleet/KILL_SWITCH`. Next tick picks up where it left off.

### Pausing for interactive work

Before making manual commits to `.fleet/*` or doing any multi-step interactive git operation, pause the agents to avoid `.git/index.lock` contention:

```bash
.fleet/bin/fleet-control.sh pause
# ... do your work, commit, push ...
.fleet/bin/fleet-control.sh resume
```

`fleet-control.sh status` shows current load state + any present index lock.

### Stopping a single in-flight slice

If a builder is mid-run and you want to cancel:

1. SSH to the host (or sit in front of it).
2. `pkill -f "claude.*{{SLICE_PREFIX}}-NNNN"` (or whatever the slice ID is).
3. Manually edit `BUILD_QUEUE.md` to flip the slice status from `claimed` back to `ready` (or `failed`).
4. `git push origin --delete {{BRANCH_PREFIX}}{{SLICE_PREFIX}}-NNNN` to remove the branch if needed.

## Branch and PR conventions

- All Fleet branches: `{{BRANCH_PREFIX}}<SLICE-ID>` (e.g., `{{BRANCH_PREFIX}}{{SLICE_PREFIX}}-0001`)
- All Fleet PRs: title starts with `[{{SLICE_PREFIX}}] <SLICE-ID>:` and points at `{{BASE_BRANCH}}`
- All Fleet PRs are opened as **draft** — the validator flips them to ready-for-review only after the validation pass succeeds
- Builders never push to `{{BASE_BRANCH}}` directly. Branch protection on `{{BASE_BRANCH}}` enforces this
- Conventional commit format: per `CONTRIBUTING.md`. The builder prompt enforces this

## Decision gate (Day 14 of a pilot)

After two weeks of operation, evaluate against these five questions:

1. Did Fleet ship at least 2× the slices you'd have shipped manually?
2. Was your post-merge rework rate under 20%?
3. Did total token spend stay under the pilot budget (`$300` in `CONFIG.yaml`)?
4. Did validators catch real issues, or rubber-stamp?
5. Could you describe Fleet to another founder in five minutes?

Three or more yeses → Fleet works for this project. Keep it.

Two or fewer yeses → `touch .fleet/KILL_SWITCH`, unload LaunchAgents, `rm -rf .fleet/`. Cheap tuition.

## Safety properties

- **All work happens on `{{BRANCH_PREFIX}}<id>` branches.** Nothing auto-merges to `{{BASE_BRANCH}}`.
- **GitHub branch protection on `{{BASE_BRANCH}}`** is required. Configure: require PR review, require CI green.
- **Token budget caps** in `CONFIG.yaml` prevent runaway spend per slice.
- **The kill switch** halts everything in seconds.
- **The graveyard** captures every failed slice with diagnosis so failure modes accumulate as institutional knowledge.
- **`.fleet/*` is operator-owned.** Slices can't modify the orchestration substrate. Operator changes use the `fleet-control.sh pause → edit → commit → resume` workflow.

## What Fleet is NOT

- Not a replacement for human review. You still merge.
- Not a substitute for good slice specs. Garbage in, garbage out.
- Not magic. Expect a learning period of 1–2 weeks where you tune slice format, prompts, and validator strictness based on what actually fails.
