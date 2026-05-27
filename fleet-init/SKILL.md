---
name: fleet-init
description: Bootstrap a Fleet autonomous-build system on a new project. Use this skill whenever the user wants to set up Fleet on a repo for the first time, asks "how do I add Fleet to this project", wants parallel autonomous agents picking work off a queue, or wants to replicate the barrel-tracking pilot's build pipeline elsewhere. Walks through gathering project parameters, rendering the `.fleet/` directory from real templates, installing LaunchAgents (macOS), running a smoke test, and queueing the first slice. Designed to be invoked once per project. Templates live in `templates/`; substitution contract is in `PARAMETERS.md`.
---

# Fleet Init

This skill bootstraps a Fleet autonomous-build system on a new project. Fleet is a parallel-agent build pipeline: many narrow autonomous builders pick slices off a queue, work in isolated branches, and open draft PRs for human review. A separate validator agent (different model from the builder, for adversarial independence) reviews each PR against the slice's acceptance criteria before it reaches the inbox.

Fleet was piloted on `barrel-tracking` (Crowded Barrel Whiskey Co.) starting 2026-05-07. This skill captures the patterns that worked so other projects can replicate the setup, with the bugs found during the pilot already fixed in the templates.

## When to use this skill

Trigger on user phrases like:
- "set up Fleet on this project"
- "I want autonomous agents working through a backlog"
- "add Fleet to my repo"
- "replicate the barrel-tracking build pipeline"
- "parallel build agents", "build queue", "spec-driven autonomous agents"
- Any variant of "how do I add Fleet here"

Do NOT trigger when:
- The user already has Fleet running and is debugging it (open `.fleet/ARCHITECTURE.md` in the target repo and look at the troubleshooting table in `MAC_MINI_SETUP.md` instead)
- The user wants to write or triage a single slice (no setup needed — they should already have Fleet running)
- The user is asking conceptually about multi-agent systems with no intent to install (just explain)

## What this skill produces

A fully populated `.fleet/` directory in the target repo containing:

- `README.md`, `ARCHITECTURE.md`, `MAC_MINI_SETUP.md` — operator docs
- `CONFIG.yaml` — per-project config with the user's values substituted in
- `BUILD_QUEUE.md` — empty queue ready for the first slice
- `SLICE_TEMPLATE.md` — canonical slice spec skeleton
- `prompts/builder.md`, `prompts/validator.md` — agent system prompts
- `bin/cron-tick.sh`, `dispatcher.sh`, `validator.sh`, `fleet-control.sh`, `lib.sh`, `status.sh` — orchestration scripts (all executable)
- `launchd/dispatcher.plist`, `launchd/validator.plist` — LaunchAgent plists ready to drop into `~/Library/LaunchAgents/`
- `slices/`, `logs/` — empty directories
- `.gitignore` — excludes `logs/*.log`, `KILL_SWITCH`, and the dispatcher/validator runtime files that don't belong in version control

## Prerequisites — verify before starting

Fleet requires a specific tooling stack on the host. The bootstrap will fail silently if any of these aren't in place, so check up front.

**On the host machine (typically a Mac mini or always-on macOS host):**

1. **macOS 14+** (LaunchAgent permission model assumes modern macOS).
2. **Homebrew** installed and on PATH.
3. **Required CLIs** — all of:
   - `node` (whatever version the target project requires)
   - The target project's package manager (`pnpm`, `npm`, `yarn`, `cargo`, etc.)
   - `gh` (GitHub CLI) — required for opening PRs and querying merged state
   - `jq` — JSON parsing in scripts
   - `yq` (mikefarah/yq) — YAML parsing in `lib.sh`
   - `gtimeout` — GNU coreutils' `timeout`, used by `dispatcher.sh` to enforce the wall-clock cap on builder runs. macOS BSD userland does not ship this. Install via `brew install coreutils`. The dispatcher exits with a clear error message at startup if `gtimeout` is missing — it does not silently drop the cap.
   - `claude` (Claude Code CLI 2.1+) — the builder agent
   - `codex` (OpenAI Codex CLI) — the validator agent
4. **Authentication** — all of:
   - `gh auth status` shows authenticated for the target repo's GitHub host
   - `claude auth login` complete OR `ANTHROPIC_API_KEY` exported (Claude Max subscription works)
   - `codex auth login` complete OR `OPENAI_API_KEY` exported (ChatGPT subscription works for ChatGPT-OAuth Codex)
5. **Repo accessible** — the target repo is cloned locally AND `gh repo view <owner>/<name>` succeeds.

If any of these fail, stop and tell the user what to install/authenticate. Do not proceed to template rendering until everything passes. The rendered `MAC_MINI_SETUP.md` walks the user through commands for steps 1–5 — point them at it if they need a runbook.

## The bootstrap procedure

### Phase 1: Discovery — collect parameters

Use AskUserQuestion (Cowork) or direct questions to collect every value listed in `PARAMETERS.md`. Don't assume defaults — ask explicitly so the user understands what they're committing to.

Required parameters (the full contract is in `PARAMETERS.md`):

- `{{PROJECT_NAME}}`, `{{GITHUB_OWNER}}`, `{{GITHUB_REPO}}`, `{{WORKDIR}}`
- `{{BASE_BRANCH}}`, `{{BRANCH_PREFIX}}`, `{{SLICE_PREFIX}}`
- `{{ORG_TAG}}` — the reverse-domain tag for LaunchAgent plist labels
- `{{OPERATOR_NAME}}`, `{{TIMEZONE_LABEL}}`
- `{{PACKAGE_MANAGER}}` and the eight `*_CMD` placeholders (install, test, lint, typecheck, check, build, format, format-check)
- `{{HOME}}` — auto-derived from `echo $HOME` on the target host; do NOT ask the user

Open `PARAMETERS.md` and read the full table — it documents purpose, two example values, and notes for each placeholder. Treat that file as the source of truth.

After collection, sanity-check:
- `{{WORKDIR}}` exists or can be created (verify with `test -d "$WORKDIR" || mkdir -p "$WORKDIR"`).
- `{{GITHUB_OWNER}}/{{GITHUB_REPO}}` exists and is reachable (`gh repo view ...`).
- `{{SLICE_PREFIX}}` doesn't collide with the user's other Fleet projects (a 2–4 char unique token; check `ls ~/Library/LaunchAgents/com.*.fleet.*.plist` for existing prefixes).

### Phase 2: Render templates

Walk every file under `templates/` and substitute placeholders. A bash loop with `sed` is the canonical approach:

```bash
TEMPLATES_DIR="<path-to-this-skill>/templates"
TARGET_DIR="$WORKDIR/.fleet"

mkdir -p "$TARGET_DIR"/{bin,prompts,launchd,slices,logs}

# Walk every template file
find "$TEMPLATES_DIR" -type f | while IFS= read -r src; do
  rel="${src#$TEMPLATES_DIR/}"
  dst="$TARGET_DIR/$rel"
  mkdir -p "$(dirname "$dst")"
  sed \
    -e "s|{{PROJECT_NAME}}|$PROJECT_NAME|g" \
    -e "s|{{GITHUB_OWNER}}|$GITHUB_OWNER|g" \
    -e "s|{{GITHUB_REPO}}|$GITHUB_REPO|g" \
    -e "s|{{WORKDIR}}|$WORKDIR|g" \
    -e "s|{{BASE_BRANCH}}|$BASE_BRANCH|g" \
    -e "s|{{BRANCH_PREFIX}}|$BRANCH_PREFIX|g" \
    -e "s|{{SLICE_PREFIX}}|$SLICE_PREFIX|g" \
    -e "s|{{ORG_TAG}}|$ORG_TAG|g" \
    -e "s|{{OPERATOR_NAME}}|$OPERATOR_NAME|g" \
    -e "s|{{TIMEZONE_LABEL}}|$TIMEZONE_LABEL|g" \
    -e "s|{{PACKAGE_MANAGER}}|$PACKAGE_MANAGER|g" \
    -e "s|{{INSTALL_CMD}}|$INSTALL_CMD|g" \
    -e "s|{{TEST_CMD}}|$TEST_CMD|g" \
    -e "s|{{LINT_CMD}}|$LINT_CMD|g" \
    -e "s|{{TYPECHECK_CMD}}|$TYPECHECK_CMD|g" \
    -e "s|{{CHECK_CMD}}|$CHECK_CMD|g" \
    -e "s|{{BUILD_CMD}}|$BUILD_CMD|g" \
    -e "s|{{FORMAT_CMD}}|$FORMAT_CMD|g" \
    -e "s|{{FORMAT_CHECK_CMD}}|$FORMAT_CHECK_CMD|g" \
    -e "s|{{HOME}}|$HOME|g" \
    "$src" > "$dst"
done

# Make scripts executable
chmod +x "$TARGET_DIR"/bin/*.sh
```

**Validate the render:**

```bash
# No unsubstituted placeholders anywhere
if rg '\{\{[A-Z_]+\}\}' "$TARGET_DIR/"; then
  echo "ERROR: unsubstituted placeholders found — abort"
  exit 1
fi

# CONFIG.yaml is valid YAML
yq . "$TARGET_DIR/CONFIG.yaml" > /dev/null || { echo "ERROR: CONFIG.yaml invalid"; exit 1; }

# Bin scripts are executable
for f in "$TARGET_DIR"/bin/*.sh; do
  test -x "$f" || { echo "ERROR: $f not executable"; exit 1; }
done

# Plists parse cleanly
for f in "$TARGET_DIR"/launchd/*.plist; do
  plutil -lint "$f" > /dev/null || { echo "ERROR: $f failed plutil -lint"; exit 1; }
done

# No source-project leakage in prompts
for f in "$TARGET_DIR"/prompts/*.md; do
  if grep -qE '\bbarrel-tracking\b|\bCrowded-Barrel\b|\bdaysllc\b' "$f"; then
    echo "WARN: source-project token leaked into $f"
  fi
done
```

The first three failures are fatal. The last (token leakage check) is a soft warning — if the user's project happens to share a token with the source project, the template substitution may not catch it, and a manual review of the prompts is warranted.

### Phase 3: Install LaunchAgents

```bash
cp "$TARGET_DIR/launchd/dispatcher.plist" \
   ~/Library/LaunchAgents/com.$ORG_TAG.fleet.$SLICE_PREFIX.dispatcher.plist
cp "$TARGET_DIR/launchd/validator.plist" \
   ~/Library/LaunchAgents/com.$ORG_TAG.fleet.$SLICE_PREFIX.validator.plist

# Validate
plutil -lint ~/Library/LaunchAgents/com.$ORG_TAG.fleet.$SLICE_PREFIX.dispatcher.plist
plutil -lint ~/Library/LaunchAgents/com.$ORG_TAG.fleet.$SLICE_PREFIX.validator.plist

# Don't load yet — load only after the smoke test passes
```

### Phase 4: Smoke test (CRITICAL — do not skip)

Run dispatcher and validator manually before letting LaunchAgents loose. Skipping this is the most common reason new Fleet installs fail silently.

```bash
cd "$WORKDIR"
rm -f .fleet/KILL_SWITCH

# Dispatcher with empty queue should exit cleanly
.fleet/bin/dispatcher.sh
# Expected: "=== dispatcher run started ===" and "no ready slices in queue"

# Validator with no open Fleet PRs should exit cleanly
.fleet/bin/validator.sh
# Expected: "=== validator run started ===" and "no open Fleet draft PRs"
```

If either exits with an error, debug before continuing. The most common failures are:
- `yq` / `gh` / `claude` / `codex` not on PATH for the user running the script
- `CONFIG.yaml` syntactically invalid
- `gh auth status` not authenticated for `{{GITHUB_OWNER}}/{{GITHUB_REPO}}`

### Phase 5: Load LaunchAgents

```bash
launchctl load ~/Library/LaunchAgents/com.$ORG_TAG.fleet.$SLICE_PREFIX.dispatcher.plist
launchctl load ~/Library/LaunchAgents/com.$ORG_TAG.fleet.$SLICE_PREFIX.validator.plist

# Verify both are loaded
launchctl list | grep "$ORG_TAG.fleet.$SLICE_PREFIX"
# Expected: two lines, PID = "-" (waiting), exit status = "0"

# Or use the included helper:
.fleet/bin/fleet-control.sh status
```

### Phase 6: Write the first slice

Don't leave the user with an empty queue and a "now what?" feeling. Walk them through writing their first slice. Good candidates:

- Unit tests for an existing pure helper module (deterministic; failure modes are clear)
- A documentation extraction (move information from a `CLAUDE.md` gotcha into a runbook or ADR)
- Adding TypeScript types for an under-typed function

Steps:
1. `cp .fleet/SLICE_TEMPLATE.md .fleet/slices/{{SLICE_PREFIX}}-0001-<short-name>.md`
2. Help the user write **specific** acceptance criteria. Vague slices = vague code. The single most important rule.
3. Add the row to `BUILD_QUEUE.md` with status `ready`. Use `fleet-control.sh pause` first to avoid index-lock contention with the LaunchAgent.
4. Commit + push to `{{BASE_BRANCH}}`.
5. `fleet-control.sh resume`.
6. Within the dispatcher's next tick (or trigger it manually via `launchctl kickstart`), the slice will be claimed, built, PR'd, validated.

This is the moment Fleet becomes real for the user.

### Phase 7: Set up the Day-14 retro

If this is a pilot deployment, schedule a retrospective for 14 calendar days from setup. The pilot questions:

1. Did Fleet ship at least 2× the slices you'd have shipped manually?
2. Was your post-merge rework rate under 20%?
3. Did total token spend stay under the pilot budget (`$300` in `CONFIG.yaml`)?
4. Did validators catch real issues, or rubber-stamp?
5. Could you describe Fleet to another founder in five minutes?

Three or more yeses → keep Fleet on this project. Two or fewer → tear down per `MAC_MINI_SETUP.md` § 9.

## Known issues (already fixed in the templates)

These are gotchas discovered during the source-project pilot. Each one's resolution is baked into the templates the skill renders. Read this section so you know what NOT to "fix" — the workarounds are intentional.

### Dispatcher pushes claim commit before branching

`dispatcher.sh` pushes the `chore(fleet): claim <slice>` commit to `origin/{{BASE_BRANCH}}` BEFORE creating the slice branch with `git checkout -b`. Earlier versions of the dispatcher didn't push, which caused the slice branch to inherit the claim commit. The PR diff vs `origin/{{BASE_BRANCH}}` then included `.fleet/BUILD_QUEUE.md`, which the validator's diff-scope check correctly FLAGed as a Rule 9 violation. Result: every single slice got flagged. Fix shipped 2026-05-14.

If the user reports "every slice gets flagged for touching `.fleet/BUILD_QUEUE.md`", verify their dispatcher.sh has the `git push origin {{BASE_BRANCH}}` line AFTER the claim commit but BEFORE `git checkout -b`.

### Validator retries on push failure (no silent swallow)

`validator.sh`'s queue-status push uses `fetch + rebase + retry` on failure, and calls `log_metric` LOUDLY if it still fails. The earlier silent-`||`-log-warning pattern caused BUILD_QUEUE drift in the source-project pilot when concurrent pushes collided — the validator's commits never landed and METRICS.md disagreed with BUILD_QUEUE for two slices.

### `.fleet/*` is operator-owned

Slices may not modify any file under `.fleet/`. The builder prompt (Rule 9 + 9a) graveyards any slice asking for a `.fleet/*` edit. The validator FLAGs any `.fleet/*` path in a PR diff. Operator changes use `fleet-control.sh pause → edit → commit → resume`. The source project's ADR-013 (formalized in the FLEET-0018 slice) documents this.

### Factual claims need verification

The builder prompt requires verifying any "the project uses X" claim against actual source code before stating it in a deliverable. The pilot lost a re-validation cycle when an ADR claimed `cva` was the variant pattern, but `class-variance-authority` wasn't even in `package.json`. The fix is in the builder prompt — read the actual code before writing factual claims.

### Delete means delete

Builder prompt Rule 10: when a slice asks for content to be removed, the builder must delete it entirely. Not strikethrough, not "filed" annotations, not HTML-commented-out. Validator FLAGs strikethrough preservation. Bake into slice ACs the verbatim phrase "delete the line entirely; do not strikethrough or annotate".

### Cron-tick defers on hot index lock

`cron-tick.sh` exits early when `.git/index.lock` is present and less than 60 seconds old, deferring to the interactive shell or other git client holding the lock. Stale locks (>60s) get proceeded-past with a warning. This eliminates `.git/index.lock` collisions during interactive operator commits.

### LaunchAgent vs cron

The templates ship LaunchAgent plists, not crontab entries. macOS cron requires Full Disk Access for `/usr/sbin/cron`, which is increasingly restricted; LaunchAgents run as the user with normal permissions. If the user insists on cron, they can ignore the plists and translate the schedules — the dispatcher.sh and validator.sh scripts are scheduler-agnostic.

### One clone only

Each project gets a single nested clone (e.g. `~/Projects/<org>/<repo>`). Earlier source-project versions used two clones — one for LaunchAgent automation, one for interactive work — which caused merge conflicts on BUILD_QUEUE.md every time both ran their sync scripts. Templates assume a single clone; `{{WORKDIR}}` is its absolute path.

### Cost: $0 with subscriptions

The `$300` budget in CONFIG.yaml is theoretical. With Claude Max ($200/mo flat) and ChatGPT-OAuth Codex (included in ChatGPT subscription), Fleet's incremental cost is $0. If the user is on subscriptions, the budget cap is a sanity check — they should leave it at $300 or lower (e.g. $50) to catch runaway loops, but real spend will be zero.

### Validator HEAD-normalize guard (load-bearing)

`validator.sh` runs `git rev-parse --abbrev-ref HEAD` after every codex invocation and, if HEAD isn't on `{{BASE_BRANCH}}`, resets and checks back out before mutating `BUILD_QUEUE.md`. This is not paranoia — codex runs with `--sandbox workspace-write --dangerously-bypass-approvals-and-sandbox` and in practice sometimes executes `gh pr checkout` or `git checkout <pr-branch>` to inspect files locally, then exits without restoring HEAD. Without the guard, the verdict commit lands on the slice branch instead of `{{BASE_BRANCH}}` and the row silently stays stale on `origin/{{BASE_BRANCH}}` forever. Diagnosed in the source-project pilot via reflog after a PR kept `in_review` on origin despite a posted PASS comment. The validator prompt also now explicitly forbids `gh pr checkout` (defense in depth on top of this guard).

### `max_runtime_minutes_per_slice` is wired via `gtimeout` — requires GNU coreutils

`limits.max_runtime_minutes_per_slice` (default `30`) is a hard wall-clock cap enforced by `gtimeout` in `dispatcher.sh`. Without it, the only enforced cap is `max_usd_per_slice` — the source-project pilot had a builder run for 4h47m before hitting the budget cap, blocking the dispatcher the entire time. Once `$5` of token churn ≈ 45-60 min, a 30-minute wall-clock cap kills runaways well before budget exhaustion AND keeps the dispatcher unblocked.

`gtimeout` ships in GNU coreutils, NOT in macOS's BSD userland — so `brew install coreutils` is a hard prerequisite. The dispatcher fails loud at startup if `gtimeout` is missing (exit 2 with an explicit "Install GNU coreutils" message) rather than silently dropping the cap. If you want a different cap, edit the knob in `CONFIG.yaml`; if you want to remove the cap entirely, remove the `gtimeout` wrapper in `dispatcher.sh` — but understand you're going back to the 4h47m failure mode.

The bootstrap procedure adds `gtimeout` to the prerequisites checklist (Phase 0 of `SKILL.md`'s "Prerequisites" section above). If the operator skips that install step, the dispatcher's first invocation will fail loud — not silently corrupt state — which is the correct failure mode.

### Cron-owns-flips, manual-owns-bundles

`scripts/sync-fleet-queue.mjs` (or the equivalent BUILD_QUEUE flipper) gets called both by the cron-tick wrapper (every 30 min) and by the operator at closeout. The rule learned in the pilot: **let cron own pure happy-path flips (`validated → merged` after a PR merges); use manual sync only when bundling other operator changes into a single closeout commit.** The two paths are idempotent — manual run on a row cron already touched is a no-op — but stacking manual runs needlessly fragments commit history.

### Validator idempotency vs. flagged-PR re-validation

`validator.sh` skips any PR whose comments already contain `## Fleet Validator Report` so the cron-driven validator doesn't re-verdict the same PR every 30 minutes. The side effect: a FLAGGED PR pushed-with-a-fix stays `flagged` forever unless the prior comment's H2 is rewritten to break the substring match. The MAC_MINI_SETUP.md runbook documents the `gh api -X PATCH` one-liner. The pilot chose runbook-only over adding a `--force-pr` flag to the script — rare enough that documenting the workaround is cheaper than the feature.

### "Walk away" is the product, not a side effect

Three consecutive autonomous merges in the source pilot (FLEET-0028 / 0029 / 0031) shipped with ≈3-5 minutes of operator time apiece — claim → build → draft PR → validate → human merge click. The dispatcher and validator wrappers, the HEAD-normalize guard, the cron-vs-manual sync lean, and the budget-cap-as-only-enforced-runtime-cap all converge on one outcome: the operator walks away after a closeout, comes back the next morning, clicks merge. If a project's Fleet pilot needs continuous operator attention past the first week, something is wrong with the slice sizing, the prompts, or the wrapper guards — not with the model. Treat sub-5-minute operator-time-per-slice as the success metric.

## Output to the user at the end

When all phases complete, summarize:

1. **What was generated** — count of files in `.fleet/`, plist file paths, smoke test result.
2. **Status check** — both LaunchAgents loaded with status 0, both log files showing clean tick.
3. **First slice queued** — `{{SLICE_PREFIX}}-0001` in queue with status `ready`, will be claimed on the next dispatcher tick.
4. **Operator runbook pointer** — direct the user to `.fleet/README.md` for the daily routine and `.fleet/MAC_MINI_SETUP.md` for the host setup runbook.
5. **Day 14 retro reminder** — recommend scheduling a retrospective for 14 calendar days from setup.

## Skill files

- `SKILL.md` — this file
- `PARAMETERS.md` — substitution contract; the full placeholder table with examples
- `templates/` — every file rendered into the target's `.fleet/` directory; mirrors the target structure exactly
- `references/` — optional supplementary docs (closeouts, retros, vision docs from the source project, included verbatim for context)
