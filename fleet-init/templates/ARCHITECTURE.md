# Fleet — Architecture & Lessons Learned ({{PROJECT_NAME}})

Companion to `README.md`. README explains *what Fleet does and how to operate it*. This doc explains *why we built it this way* and what we learned setting it up. Read this when you want to understand the trade-offs, modify the system, or port it to a new project.

## Origin

Fleet is a hybrid of two patterns from frontier multi-agent work:

- **Boris Cherny's pattern** (Claude Code creator): many narrow agents running in parallel via cron, each with a tightly scoped job. Horizontal coverage across a portfolio.
- **Factory.ai Missions pattern**: orchestrator + worker + validator with explicit validation contracts written before any code is generated.

The hybrid combines Boris's concurrency model (parallel narrow agents) and Missions' validation pattern (adversarial validator with a fresh-context model). That's what Fleet is.

## Why two providers (Claude builder, Codex validator)

Validation is stronger when the validator wasn't trained on the same data as the builder. A Claude validator reviewing Claude code shares the builder's blind spots. A Codex validator brings independent judgment.

## Why Sonnet (not Opus) for builders

Sonnet writes clean tests, follows project conventions documented in CLAUDE.md, and respects file-scope constraints. Opus would be modest quality improvement at significant cost-multiplier increase. Sonnet is the right tool for slice-sized work.

If you ever queue larger slices (e.g., a multi-file feature build), consider Opus per-slice via CONFIG.yaml override.

## Why LaunchAgent (not cron)

macOS cron requires Full Disk Access permission for `/usr/sbin/cron`, which is increasingly restricted in newer macOS versions. LaunchAgents run as the user, inherit normal permissions, and don't need FDA. They're the macOS-native scheduler.

Trade-off: LaunchAgent plists are XML (harder to read than crontab) and require `launchctl load -w` to install. Net win is simpler permission model.

## Why METRICS.md and GRAVEYARD.md are gitignored

These files are operational logs (timestamps of dispatch events, failed-slice diagnoses). They're written by both feature-branch builds AND base-branch validator runs. When tracked in git, they collide on every PR merge.

Solution: gitignore them. They live on the host running Fleet, get appended to over time, and don't pollute git history. If you want a queue dashboard for humans, BUILD_QUEUE.md serves that role and only gets touched on dispatch/validate events.

## CLI gotchas

**Claude Code (versions ≥ 2.1):**
- `claude exec` doesn't exist as a subcommand — use `-p` / `--print` for headless
- `--max-tokens` doesn't exist — use `--max-budget-usd N`
- `--append-system-prompt "..."` is how you add to the default system prompt
- `--permission-mode bypassPermissions` for headless cron operation
- `--add-dir` for additional directories the model can edit

**Codex CLI (versions ≥ 0.128):**
- No `--system` flag — pipe combined system+user prompt via stdin instead
- `--ask-for-approval` is on the parent `codex` command, NOT on `codex exec`
- `--dangerously-bypass-approvals-and-sandbox` is the right flag for headless on `codex exec`
- `--skip-git-repo-check` needed outside a repo (we're always inside one, so don't need it)
- Default model is gpt-5.5; pass `--model` to override

**macOS-specific:**
- BSD doesn't ship GNU coreutils `timeout` — install `coreutils` and use `gtimeout`, or just remove the timeout wrapper (we did the latter; Claude's `--max-budget-usd` provides the cap)
- LaunchAgent plists need explicit `EnvironmentVariables.PATH` because launchd starts with minimal PATH
- LaunchAgent runs as the user when in `~/Library/LaunchAgents/` (vs system agents in `/Library/LaunchDaemons/`)

## Lessons baked into this template

These reflect issues discovered in the source-project pilot. Each one's resolution is now part of the template's default behavior:

1. **Builder commit scope.** The builder prompt instructs an explicit `git status` check before staging. If any `.fleet/*` path appears in the diff, it gets restored before commit. This prevents the "builder smoke-tested a script and swept BUILD_QUEUE.md into the PR" failure mode.

2. **Dispatcher pushes the claim commit before branching.** `dispatcher.sh` pushes the `chore(fleet): claim <slice>` commit to `origin/{{BASE_BRANCH}}` BEFORE creating the slice branch. Without this, the slice branch inherits the claim commit, and the PR diff vs origin includes `.fleet/BUILD_QUEUE.md` — which the validator's diff-scope check correctly FLAGs as a Rule 9 violation. With the push, the merge base advances first and the diff stays clean.

3. **Validator retries on push failure.** `validator.sh`'s queue-status push uses fetch+rebase+retry on failure, and `log_metric` LOUDLY if it still fails. The silent-swallow pattern caused BUILD_QUEUE drift in the source-project pilot when concurrent pushes collided.

4. **`.fleet/*` is operator-owned.** Slices may not modify any file under `.fleet/`. Enforced by builder prompt Rule 9 (graveyard on violation) and validator diff-scope check (FLAG on any `.fleet/*` path in PR diff). Operator changes use `fleet-control.sh pause → edit → commit → resume`.

5. **Factual claims need verification.** When a slice asks the builder to state a fact about the codebase (component uses pattern X, dependency Y is installed), the builder prompt instructs verifying against the code first. The pilot lost a re-validation cycle when an ADR claimed `cva` was the project's variant pattern, but `class-variance-authority` wasn't even a dependency.

6. **Delete means delete.** When a slice spec asks for a line to be removed, the builder prompt explicitly forbids strikethrough or "filed" annotations. Validator FLAGs strikethrough preservation.

## Cost reality vs theoretical

The "$300 pilot budget" in CONFIG.yaml assumes pure API pricing. With Claude Max ($200/mo flat) and ChatGPT-OAuth Codex (included in ChatGPT subscription), Fleet's incremental cost is $0. The budget number is theoretical worst-case if someone runs Fleet against pay-per-token Claude API.

## How to port to other projects

Use the `fleet-init` skill (the one you're reading templates from). It collects parameters and renders this entire template tree into a target project's `.fleet/` directory. See the skill's SKILL.md for the procedure.

For manual porting (without the skill):

1. `cp -R ~/.../fleet-init/templates ~/Projects/<other-project>/.fleet`
2. Walk every file and substitute placeholders per `PARAMETERS.md`
3. `chmod +x .fleet/bin/*.sh`
4. Install LaunchAgent plists with unique labels (`com.{{ORG_TAG}}.fleet.<NEW_SLICE_PREFIX>.{dispatcher,validator}`)
5. Manual smoke test with `.fleet/bin/cron-tick.sh .fleet/bin/dispatcher.sh` before letting LaunchAgents loose
