# Host Setup Runbook — {{PROJECT_NAME}}

This runbook stands Fleet up on a fresh macOS host (Mac mini or any always-on Mac). Follow it in order. Each step has a verification command — don't skip them.

> **You only need to do this once per project.** After initial setup, the LaunchAgents run unattended.

## 0. Prerequisites

- macOS 14+ with admin access
- Apple Silicon or Intel — both fine
- Host stays awake / wakes for network access (System Settings → Battery → "Prevent automatic sleeping when display is off")
- Working internet
- A GitHub account with push access to `{{GITHUB_OWNER}}/{{GITHUB_REPO}}`

## 1. Install required CLIs

All of these are needed. Open Terminal on the host.

```bash
# Homebrew (if not present)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Required CLIs for Fleet
brew install node@22 {{PACKAGE_MANAGER}} gh jq yq

# pin Node 22 in PATH (or whatever your project requires)
echo 'export PATH="/opt/homebrew/opt/node@22/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Claude Code CLI (the builder)
curl -fsSL https://claude.com/install.sh | sh
# Verify:
claude --version

# OpenAI Codex CLI (the validator)
# Install per current OpenAI docs (URL changes; check https://platform.openai.com/docs)
brew install openai/tap/codex   # or curl install per OpenAI's instructions
# Verify:
codex --version
```

**Verify all CLIs:**

```bash
node --version    # should print v22.x.x (or whatever your project requires)
{{PACKAGE_MANAGER}} --version
gh --version
jq --version
yq --version
claude --version
codex --version
```

If any of these fail, fix before continuing. LaunchAgents will silently fail otherwise.

## 2. Authenticate

```bash
# GitHub
gh auth login
# Pick: GitHub.com → SSH → upload key → log in via browser
# Verify:
gh auth status

# Claude (Anthropic)
claude auth login
# OR set ANTHROPIC_API_KEY in ~/.zshrc:
echo 'export ANTHROPIC_API_KEY="sk-ant-..."' >> ~/.zshrc

# Codex (OpenAI)
codex auth login
# OR set OPENAI_API_KEY in ~/.zshrc:
echo 'export OPENAI_API_KEY="sk-..."' >> ~/.zshrc

source ~/.zshrc
```

**Verify auth:**

```bash
gh repo view {{GITHUB_OWNER}}/{{GITHUB_REPO}}    # should show repo info
echo "test" | claude exec "say back what you got"    # should respond
echo "test" | codex exec "say back what you got"     # should respond
```

## 3. Clone the repo

```bash
mkdir -p "$(dirname {{WORKDIR}})"
cd "$(dirname {{WORKDIR}})"
git clone https://github.com/{{GITHUB_OWNER}}/{{GITHUB_REPO}}.git "$(basename {{WORKDIR}})"
cd {{WORKDIR}}

# Install deps (one time)
{{INSTALL_CMD}}

# Verify the project builds and tests pass
{{CHECK_CMD}}
```

If `{{CHECK_CMD}}` fails on this host but passes on your laptop, fix the env mismatch (usually missing `.env.local` or similar). Pull from your secret store (Vercel, doppler, 1Password, etc.) before continuing.

## 4. Verify Fleet structure

```bash
cd {{WORKDIR}}
ls -la .fleet/
# Should show: README.md CONFIG.yaml BUILD_QUEUE.md SLICE_TEMPLATE.md
#              ARCHITECTURE.md MAC_MINI_SETUP.md
#              prompts/ bin/ logs/ slices/

# Make sure scripts are executable
chmod +x .fleet/bin/*.sh

# Confirm config loads
yq '.project.name' .fleet/CONFIG.yaml
# Expected output: {{PROJECT_NAME}}
```

## 5. Install LaunchAgent plists

```bash
# Copy the rendered plists into the user's LaunchAgents directory
cp .fleet/launchd/dispatcher.plist ~/Library/LaunchAgents/com.{{ORG_TAG}}.fleet.{{SLICE_PREFIX}}.dispatcher.plist
cp .fleet/launchd/validator.plist ~/Library/LaunchAgents/com.{{ORG_TAG}}.fleet.{{SLICE_PREFIX}}.validator.plist

# Verify plist syntax
plutil -lint ~/Library/LaunchAgents/com.{{ORG_TAG}}.fleet.{{SLICE_PREFIX}}.dispatcher.plist
plutil -lint ~/Library/LaunchAgents/com.{{ORG_TAG}}.fleet.{{SLICE_PREFIX}}.validator.plist
# Both should print "OK"
```

The plists themselves were already rendered by the `fleet-init` skill into `.fleet/launchd/` with the right `{{WORKDIR}}` / `{{HOME}}` / org-tag values. They're checked into the repo at that path so the host install is just `cp + load`.

## 6. Manual smoke test (CRITICAL — do not skip)

Before turning the LaunchAgents loose, run **one** dispatcher invocation by hand. Pick the smallest slice and watch it end-to-end.

```bash
cd {{WORKDIR}}

# Make sure no kill switch is active
rm -f .fleet/KILL_SWITCH

# Run dispatcher in the foreground, watch output live
.fleet/bin/dispatcher.sh
```

What should happen:

1. Pulls latest `{{BASE_BRANCH}}`
2. Picks the first `ready` slice from BUILD_QUEUE.md
3. Marks it `claimed` in `BUILD_QUEUE.md` and pushes that change to origin/{{BASE_BRANCH}}
4. Creates branch `{{BRANCH_PREFIX}}<slice-id>`
5. Spawns `claude` with the builder prompt + slice spec
6. Builder writes code, runs `{{CHECK_CMD}}`, commits, pushes, opens draft PR
7. Dispatcher updates queue to `in_review` and exits

Then run validator manually:

```bash
.fleet/bin/validator.sh
```

What should happen:

1. Finds the open draft PR
2. Spawns `codex` with the validator prompt + slice spec + PR diff
3. Codex posts a comment on the PR with verdict
4. Updates queue to `validated` (PASS) or `flagged` (FAIL)
5. If PASS: marks PR ready-for-review

Open the PR on GitHub and read both: the diff (does the builder's output look right?) and the validator comment (did codex produce a useful adversarial review?).

**If smoke test fails:** check `.fleet/logs/METRICS.md` and the script output for clues. Common failure modes:

- `claude` / `codex` CLI flag mismatch → adjust `.fleet/bin/dispatcher.sh` and `validator.sh` for your installed version
- `gh` not authenticated → re-run `gh auth login`
- `yq` not parsing CONFIG.yaml → check yaml syntax with `yq . .fleet/CONFIG.yaml`
- Builder created branch but no commit → check Claude API key, check token budget

**Iterate on the smoke test until it works end-to-end** before loading LaunchAgents. LaunchAgent failures are silent and demoralizing.

## 7. Load the LaunchAgents

```bash
launchctl load ~/Library/LaunchAgents/com.{{ORG_TAG}}.fleet.{{SLICE_PREFIX}}.dispatcher.plist
launchctl load ~/Library/LaunchAgents/com.{{ORG_TAG}}.fleet.{{SLICE_PREFIX}}.validator.plist

# Verify both are loaded
launchctl list | grep {{ORG_TAG}}.fleet.{{SLICE_PREFIX}}
# Should print two lines with PID `-` (waiting for next interval) and exit status `0`

# Or use the helper:
.fleet/bin/fleet-control.sh status
```

## 8. Daily operations

**Morning (5–10 minutes):**

1. Open GitHub. Filter PRs by `[{{SLICE_PREFIX}}]` in title.
2. Read each validator comment. For green ones, skim diff and merge. For flagged ones, decide → fix-and-merge, close-without-merging, or refine slice spec.
3. Update `.fleet/logs/METRICS.md` scoreboard with the day's counts.
4. Add new slices if you have new ideas.

**Mid-day spot check:**

```bash
ssh <your-host>   # or sit in front of it
tail -50 {{WORKDIR}}/.fleet/logs/dispatcher.log
tail -50 {{WORKDIR}}/.fleet/logs/validator.log
```

Look for: any "abort", "graveyard", "exit non-zero" lines.

**Kill switch (if anything looks wrong):**

```bash
ssh <your-host>
cd {{WORKDIR}}
touch .fleet/KILL_SWITCH
```

Both scripts will halt on next run. Resume with `rm .fleet/KILL_SWITCH`.

**Before making manual `.fleet/*` edits:**

```bash
.fleet/bin/fleet-control.sh pause
# edit, commit, push
.fleet/bin/fleet-control.sh resume
```

## 9. Tear-down (if Fleet doesn't work out)

```bash
cd {{WORKDIR}}
touch .fleet/KILL_SWITCH                                                # stop new work immediately
.fleet/bin/fleet-control.sh pause                                       # unload LaunchAgents
rm ~/Library/LaunchAgents/com.{{ORG_TAG}}.fleet.{{SLICE_PREFIX}}.*.plist  # delete plists
git checkout {{BASE_BRANCH}} && git pull
git tag fleet-pilot-end-{{PROJECT_NAME}}
git push origin fleet-pilot-end-{{PROJECT_NAME}}
rm -rf .fleet/                                                          # remove the directory
git add . && git commit -m "chore(fleet): tear down — see fleet-pilot-end tag"
git push
```

Total tear-down time: under 5 minutes. No code changes outside `.fleet/` to revert.

## Troubleshooting

| Symptom                                        | Likely cause                                                             | Fix                                                                       |
|------------------------------------------------|--------------------------------------------------------------------------|---------------------------------------------------------------------------|
| LaunchAgent loaded but nothing happens         | Plist `WorkingDirectory` doesn't exist or is unreadable                  | Check `WorkingDirectory` value matches `{{WORKDIR}}`                       |
| `dispatcher.sh: command not found: yq`         | Homebrew bin not in plist's `EnvironmentVariables.PATH`                  | Plist already sets PATH to `/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin` |
| Builder runs but no PR opened                  | `gh` not authenticated for the running user                              | `gh auth login --hostname github.com` while logged in as the host's user   |
| Validator never posts a comment                | `codex` CLI flag mismatch                                                | Check `.fleet/bin/validator.sh` against `codex --help`                     |
| All slices end up in graveyard                 | Builder prompt too restrictive OR slice specs vague                      | Re-read graveyard entries; tighten slice acceptance criteria              |
| Token spend running ahead of budget            | `max_usd_per_slice` set too high                                         | Lower in `.fleet/CONFIG.yaml`, restart any in-flight                       |
| Dispatcher tries to push to a forbidden branch | `forbidden_branches` list incomplete                                     | Add the branch to `.fleet/CONFIG.yaml`                                     |
| `.git/index.lock` errors during operator work  | Operator forgot to `fleet-control.sh pause`                              | Run `pause`, retry operator work, then `resume`                            |
| FLAGGED PR stays `flagged` after fix push      | Validator's idempotency check skips PRs whose comments already contain `## Fleet Validator Report` | See "Re-validate a flagged PR after fixing" below                          |

### Re-validate a flagged PR after fixing

`validator.sh` is idempotent by design — it skips any PR whose comments already contain the marker `## Fleet Validator Report` so the cron-driven validator doesn't re-verdict the same PR every 30 minutes. The side effect: after you push a fix to a FLAGGED PR, the validator skips it forever and the row stays `flagged`.

**One-liner workaround:** edit the prior validator comment's H2 to break the substring match, then either wait for the next cron tick or run the validator manually.

```bash
# Find the validator comment ID
gh pr view <PR-number> --json comments \
  --jq '.comments[] | select(.body | startswith("## Fleet Validator Report")) | .id'

# Patch the comment body — replace the H2 with a SUPERSEDED marker
gh api -X PATCH \
  /repos/{{GITHUB_OWNER}}/{{GITHUB_REPO}}/issues/comments/<comment-id> \
  -f body="## [SUPERSEDED] Fleet Validator Report

_Superseded by re-validation after fix commit._

<original-comment-body>"

# Trigger a fresh validation
.fleet/bin/validator.sh
```

Preserve the original comment body verbatim below the new H2 so the audit trail of "this was flagged once, here's exactly why" stays intact. Verified in the source-project pilot — the HEAD-normalize guard in `validator.sh` triggers correctly on the second run, and the new verdict commit lands on `{{BASE_BRANCH}}` as intended.
