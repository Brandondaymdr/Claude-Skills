---
name: security-baseline
description: Apply and operate the layered security baseline (gitleaks commit hook, PR security checks, deep audit, app hardening, alerting) on any repo or Mac. Use whenever the user says "security baseline", "/security-baseline", "secure this repo", "add the security layers", "set up security checks", "scan for leaked secrets", "install the gitleaks hook", "run a security audit before launch", "harden this app", or onboards a new repo, a new Mac, or the SAI Claude account into the security plan.
---

# Security Baseline

Six layers, applied the same way to every repo in Days LLC, Crowded Barrel and SAI:

| Layer | Stops | Lives in |
|---|---|---|
| 0 Accounts | Account takeover | Each service (`references/accounts.md`) |
| 1 Commit | Secrets entering git | Global gitleaks hook on each Mac (`scripts/install-global-hook.sh`) |
| 2 Pull request | Vulnerable code/deps reaching main | `templates/security.yml` + `scripts/repo-settings.sh` |
| 3 Deep audit | Logic/auth bugs scanners miss | Cloudflare `security-audit` skill (`references/deep-audit.md`) |
| 4 App hardening | Stack-specific holes | `references/checklists/*.md` |
| 5 Alerting | Failures nobody sees | PR monitor + watchdog (`references/alerting.md`) |

The kit contains no secrets. This repo is public — keep it that way. Each repo's
`CLAUDE_API_KEY` lives in that repo's GitHub secrets, billed to the business that
owns the repo.

## Pick the mode first

**MACHINE** — a Mac without the hook ("install the hook", new Mac). Run
`scripts/install-global-hook.sh`, then its built-in self-test. Done.

**SCAN** — find secrets already in history ("scan for leaks", Phase 1). Run
`scripts/scan-history.sh [root ...]` (default root `~/Projects`). Reports land in
`~/security/gitleaks/`, never inside a repo. For each real finding: rotate the key
at its source first, record what was rotated, then decide on history rewrite
(optional once the key is dead). Never paste secret values into chat, commits or
memory — the scripts redact; keep it that way.

**APPLY** — onboard one repo (the default when the user names a repo).

1. Read the tier from `.claude/tier` (ADR-0001 rubric). Missing → ask; tie-breakers
   are in `DEFAULTS-ADR-0001.md` appendix.
2. Detect the stack: `supabase/` or `@supabase/` → supabase; `src-tauri/` → tauri;
   `next` in package.json → nextjs; Shopify/n8n code → n8n-shopify; student or
   immigration records (SAI) → student-data; else generic.
   A repo can match several — `apply-to-repo.sh` concatenates them.
3. Run `scripts/apply-to-repo.sh <local-clone-path> <stack>[,<stack>]`. It works in a
   temporary worktree off the default branch (never touches the working tree), adds
   the workflow, gitleaks config and instructions file, wires gitleaks into
   `.husky/pre-commit` if Husky is present, and opens a PR.
4. Tell the user to add the `CLAUDE_API_KEY` secret to the repo (Settings →
   Secrets → Actions) with the owning business's key. Without it the ai-review
   job fails by design.
5. Once the PR's checks pass and it merges, run
   `scripts/repo-settings.sh <owner/repo>` (Dependabot alerts + security updates);
   Tier 1 adds `--tier1` to require the three checks on main via a ruleset.
6. Hand over the matching checklist(s) from `references/checklists/` as the layer 4
   work. Report: PR link, tier, stacks, checklist items still open.

**AUDIT** — deep audit before a launch or quarterly. Follow
`references/deep-audit.md` (uses Cloudflare's `security-audit` skill; 2–3 runs).

**SAI** — bring the SAI Claude account onto the baseline: `references/sai-account.md`.

## Rules for this skill

- Pin every third-party action to a full commit SHA. When bumping, re-resolve the
  SHA from the tag (`git ls-remote --tags <repo> 'refs/tags/<tag>^{}'`) and update the
  comment beside it.
- Dependabot PRs skip ai-review (lockfile-only diffs); a skipped job satisfies a
  required check.
- False positives: tune the repo's `.github/security-instructions.txt` or
  `.gitleaks.toml` allowlist in that repo — not the templates — unless the noise is
  stack-wide.
- The global coding rules Claude follows live in `../rules/security.md`.
