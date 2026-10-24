# 0004. Layered security defense on every live and upcoming app

Status: Open
Date: 2026-10-23
Originator: Brandon

## Problem
Brandon's live apps (Days LLC, Crowded Barrel, SAI) had no consistent defense
against leaked secrets, vulnerable dependencies, or AI-introduced auth bugs.
Role separation in several apps was client-side only, and a May 2026 Harper
role leak ended a paid engagement.

## Proposed outcome
Every Tier 1 repo runs the `security-baseline` layers: global gitleaks hook on
each Mac, PR checks (`secrets`, `deps`, `ai-review`) required by a ruleset,
Dependabot alerts + security updates, a deep audit before launches, and
stack checklists. Plan doc (Claude Doc): "Security Defense Plan — Days LLC,
Crowded Barrel & SAI" — https://claude.ai/artifact/LDoBFzV7HL6689Bu2HQehD

## Affected users and systems

### Done (verified)
| Item | Evidence |
|---|---|
| Kit: `security-baseline/` skill + `rules/security.md` | Claude-Skills #44, #45 merged |
| Layer 1 hook on Mac mini + MacBook Air | `install-global-hook.sh` self-test passed on both |
| History scan (Mac mini, 32 repos) | 28 findings / 7 repos; real ones rotated: patreon-bottle-claims APP_PASSWORD, Stripe webhook secret (energetic-glow → Supabase `nhanqloippvqcitpowfy`), dynamic-harmony endpoint disabled |
| `CLAUDE_API_KEY` secrets | Days LLC CI key on shorestack-books, shorestack, harper-payroll, harper-timeclock, shorestack-safe; Crowded Barrel CI key on payroll-cb, alchemy-order-form, alchemy-timeclock, barrel-tracking |
| Claude-Skills | ruleset created (id 25720316) |
| shorestack-books | #164 merged; `repo-settings.sh --tier1` run |
| shorestack | #480 merged (tailored: ai-review on PRs, Trivy non-PR); custom ruleset requiring ai-review (id 25720888) |
| harper-payroll | #3 merged; `--tier1` run, ruleset active |
| harper-timeclock | #4 merged (next 16.4.2, Capacitor 8.5.3, 22 advisories; prod `sw.js` = v32 verified); #5 merged (security checks); `--tier1` run, ruleset active; #10 merged 2026-10-24 (vite/vitest/baseline-browser-mapping, 116 tests; 3 moderate `uuid` via Capacitor CLI accepted — build-time only); iOS **1.3 (4)** archived on the Air and uploaded to App Store Connect 2026-10-24 |
| shorestack-safe (frozen, still serves password-mu.vercel.app) | #27 merged: next 16.2.10 → 16.4.2 + audit fixes, prod audit 0; Vercel production deploy succeeded. Decision: NO security.yml / ruleset here — the code is covered in the shorestack monorepo |
| Stripe cleanup | 2026-10-24: disabled `dynamic-harmony` endpoint deleted; `creative-excellence` + `energetic-glow` remain |
| `repo-settings.sh` | Free-plan ruleset 403 now prints a plain "private repos need Pro/Team" message |
| Crowded-Barrel org | Upgraded to **GitHub Team** 2026-10-23 (Free can't hold rulesets on private repos — `repo-settings.sh` 403'd) |
| payroll-cb | #3 merged (next 14 → 16.4.3, React 19, middleware → proxy, eslint 9, vitest 5; prod audit 0); #4 merged (security checks); `--tier1` run, ruleset 25737461 active |
| alchemy-timeclock | #5 merged (next 16.4.3, Capacitor 8.5.3, vitest 4.1.12; lock regenerated with npm 12 after npm 10 arborist `edgesOut` crash); #6 merged (security checks); `--tier1` run, ruleset 25738638 active |
| barrel-tracking | #190 merged (next 16.4.3, vitest/vite bumps, pnpm overrides; audit 0); #191 merged (security checks, alongside existing CI + harness); `--tier1` run, ruleset 25739728 active |
| Crowded Barrel re-check (2026-10-24) | barrel-tracking clean; alchemy-timeclock #7 merged (zod high, dev); `uuid` alert dismissed (via `xcode` ← Capacitor CLI, build-time only); payroll-cb #5 closed + alert dismissed (see Remaining) |
| sai-platform | `pnpm audit` clean (no deps PR); SAI-billed `CLAUDE_API_KEY` set; `~/.claude-sai` + direnv `CLAUDE_CONFIG_DIR` on the Air; Actions allowlist extended (`aquasecurity/trivy-action`, `aquasecurity/setup-trivy`, `anthropics/claude-code-security-review`); #326 merged (security checks, stacks nextjs,supabase,student-data); `--tier1` run on the Air, ruleset + Dependabot on — 2026-10-24 |

### Next session (on the Mac mini)
alchemy-timeclock iOS build: Capacitor 8.5.3 reaches the app only via a new
build, and its `ios/` project lives only on the mini (none on the Air — don't
regenerate with `npx cap add ios`). `npx cap sync ios` → bump version → Archive →
upload → submit (App Store Connect already has a 1.2 draft).

### Remaining
- SAI: sai-visas, sai-portal — **no app code yet** (docs/sketches + static demo HTML, no dependency files); history scan clean 2026-10-24. Apply the baseline once real code lands.
- alchemy-order-form: **parked, not in use** — Vite 8 deps PR #1 left open; security checks + `--tier1` after it's back in use
- Tier 2 repos; alerting in the PR monitor (`references/alerting.md`); deep audits (`references/deep-audit.md`)
- harper-timeclock: iOS 1.3 (4) submitted 2026-10-24, manual release — click **Release This Version** once approved
- payroll-cb: Tailwind 3 → 4 migration (planned upgrade). Dependabot #5 closed — it forced the major bump for a medium dev-only `postcss-selector-parser` alert, which was dismissed as tolerable risk
- Stripe "creative-excellence" → password-mu.vercel.app: **keep** (live plan sync for the frozen Safe, last delivery 2026-10-15); delete once Safe's Vercel repoint to the monorepo lands
- shorestack monorepo `apps/safe`: `/auth/callback` swallows the exchange error and silently redirects to /login — log the real error. (2026-10-24 magic-link failure traced to a Supabase incident; verifier cookie + callback path verified working)
- Explain shorestack ruleset's `require_extra_approval_for_unattributed_changes` default

## Constraints
- One step at a time with Brandon; short messages.
- Never paste secrets into chat; secrets go via `read -rs KEY | gh secret set`.
- Cloud sessions can't create rulesets / repo settings (proxy 403) or use GraphQL
  (`gh pr create`) — open PRs via `gh api repos/.../pulls`; Brandon runs
  `repo-settings.sh` on his Mac.
- Frozen repos (shorestack-safe) get CVE-driven dependency PRs only.
- Harper repos: verify prod actually moved after merge (Vercel dedupe).
- Deps check is Trivy over the lockfile, so dev-only HIGH/CRITICAL also block:
  land a deps PR first, then the security-checks PR.
- Claude GitHub App must be installed on each org (Crowded-Barrel added
  2026-10-23) or cloud sessions can't reach its repos.
- `apply-to-repo.sh` fails if the clone has a fetch refspec for a branch that
  was deleted on merge — unset it first.

## Open questions
None. Resolved 2026-10-24: Harper is **Days LLC** (keys already correct);
Brandon signed into password-mu.vercel.app after #27 (magic link + passkey + master password).
