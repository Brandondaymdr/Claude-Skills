---
name: live-app-maintenance
description: Set up and operate a production-maintenance system for any live app — safety-net audit, MAINTENANCE.md runbook, always-sends weekly health digest cron, scheduled reminders, deploy verification, and the annual iOS/Apple release rhythm for apps with a native shell. Use this skill whenever the user mentions keeping a live/production app stable, maintenance best practices, health checks, uptime, "is my app okay", running the weekly/monthly check, onboarding a new app into maintenance, release/update cadence, staying compatible with iOS updates, or names a specific live app that needs ops attention. Trigger even if they just say "check on my apps" or "set this app up like the other ones."
---

# Live App Maintenance

A system for keeping small-team production apps stable: catch problems before
customers do, make recovery cheap, and turn "did anything break?" into a
one-email answer. Battle-tested on real payroll apps where silent data
corruption sat undetected for weeks until a customer noticed — the design
choices below all trace back to real incidents.

## Two modes — pick one first

**SETUP** — the app has no `MAINTENANCE.md` (or the user says "set up
maintenance for X"). Onboard it: audit, close gaps, generate the runbook,
build the digest, schedule the reminders.

**OPERATE** — the app already has a `MAINTENANCE.md` and the user wants a
check run ("run the weekly check", "monthly maintenance", "is everything
healthy"). Skip to [Operate mode](#operate-mode).

---

## Setup mode

### Step 1 — Audit what exists

Before building anything, inventory the current safety net. Grep the repo and
ask the user about anything you can't verify:

- **Uptime monitoring** (BetterStack, UptimeRobot, Pingdom…) — does anyone
  find out when the app is down, or do customers find out first?
- **Backups** — do they exist, AND has a restore actually been tested? An
  unverified backup is a hope, not a backup. Check retention and who holds
  the keys.
- **Tests + CI** — is there a test runner? Do tests guard the money paths
  (billing, payroll, orders) and any role-based data visibility?
- **Error/health alerting** — crons, drift audits, Sentry, log alerts.
- **Deploy verification** — after a push, does anyone confirm prod actually
  moved? (Vercel can dedup merge commits and silently leave prod stale.)
- **Secrets hygiene** — where do DB URLs and API keys live; when were they
  last rotated; are they ever pasted into chat/shell history?
- **Native/mobile surface** — App Store or Play Store binary? PWA with a
  service worker? These have their own update cadences.

Present the audit as a short gap list, worst-first.

### Step 2 — Close the gaps, in this order

Priority order matters because each layer catches what the previous one
can't:

1. **Uptime monitoring** (minutes to set up) — catches total outage.
2. **Backups with a verified restore** — catches catastrophe. Schedule the
   restore test quarterly; a backup pipeline that's never been restored from
   has unknown value.
3. **Weekly health digest** — catches *silent* problems: data drift, stuck
   records, dead cron infra. Build per
   [references/health-digest-pattern.md](references/health-digest-pattern.md).
   The core principle: the digest ALWAYS sends, even when everything is
   clean, because silence is ambiguous — it can mean "healthy" or "the
   alerting itself broke." A missing digest is itself an alert.
4. **Runbook** — makes the routine repeatable by a future you (or a future
   Claude session) with zero context.
5. **Reminders** — a runbook nobody is prompted to open is shelf-ware.

### Step 3 — Generate MAINTENANCE.md

Use [references/runbook-template.md](references/runbook-template.md). Fill it
with the app's real commands, URLs, and dashboards — a runbook full of
placeholders is worse than none because it looks done. Include:

- Weekly / monthly / quarterly cadences with exact commands
- **Domain gates**: business-critical checkpoints unique to this app (e.g.,
  "reconcile before payroll checks are cut", "verify inventory sync before a
  drop", "check Stripe webhook backlog before month-end billing"). Ask the
  user what event in their business would be expensive to get wrong — that's
  the gate.
- Deploy verification steps
- An incident quick-reference ("when something breaks") ordered by likelihood

### Step 4 — Build the weekly health digest

Follow [references/health-digest-pattern.md](references/health-digest-pattern.md).
Key architectural rules regardless of stack:

- Pure computation module, separately unit-tested; thin transport layer
  (route/job) around it
- Auth the endpoint with a secret header — never leave a data-summarizing
  endpoint open
- Reuse existing env vars/secrets and email infra where possible; every new
  secret is a new thing to rotate and lose

### Step 5 — Schedule the reminders

Use [references/scheduled-reminders.md](references/scheduled-reminders.md)
for ready-made prompts (weekly health check, monthly maintenance session,
quarterly restore test). If Cowork scheduled tasks are available, create them
there; otherwise suggest calendar entries or cron + email. Reminders should
*do* the automatable parts (fetch prod URLs, read-only dependency checks) and
*checklist* the human parts — never install, fix, commit, or deploy from a
reminder run.

### Step 6 — Native app rhythm (only if applicable)

If the app ships an iOS/Android binary or an installable PWA, add the annual
release rhythm from
[references/ios-release-rhythm.md](references/ios-release-rhythm.md) to the
runbook. The short version: beta-test in June when Apple previews the new
iOS, expect customer phones to auto-update in September, ship one fresh
binary per year, and remember PWA service-worker caches need explicit
version bumps or users keep the stale app forever.

---

## Operate mode

1. Read the app's `MAINTENANCE.md` and find the section matching the
   requested cadence (weekly/monthly/quarterly/pay-period/other gate).
2. Execute every check that can be automated from here:
   - Fetch production URLs — expect 200 with real content, not an error shell
   - Read-only dependency checks (`npm audit`, `npm outdated`, or the
     stack's equivalent) — report, don't fix
   - Cron/workflow status where accessible (`gh run list`, endpoint probes
     with the user's secret)
   - Deploy-verification hash comparisons if the runbook defines them
3. Checklist the human-only items (did the digest email arrive? any
   monitoring alerts? role-visibility smoke test?) so the user can tick
   through them.
4. End with a one-line verdict: **ALL CLEAR** or a short worst-first list of
   items needing attention.

Hard rule for operate mode: report only. No installs, no fixes, no commits,
no deploys — a health check that mutates the system can't be trusted, and
the user may be checking right before a business-critical event.

---

## Principles that should shape every decision

These come from production incidents; carry them into anything you build:

- **Silence is ambiguous.** Alert-only systems can't distinguish "healthy"
  from "alerting is broken." At least one signal must always send.
- **Cadence beats heroics.** A 10-minute weekly routine catches most things
  a 6-hour quarterly deep-dive would, weeks earlier.
- **Verify deploys moved.** Pushing is not deploying. Compare bundle hashes
  or version endpoints after every production push.
- **Pre-state before destructive changes.** Never run destructive SQL or
  bulk rebuilds without capturing the current rows first — daily backups are
  full-DB rollbacks, not surgical recovery.
- **Patch fast, major deliberately.** Patch-level dependency updates same
  week; majors get a scheduled session with release notes read. Never
  force-fix an audit blindly.
- **Denormalized data needs invariants + a watchdog.** Any cached/derived
  column that payroll, billing, or reporting reads must have a documented
  invariant and an automated check that recomputes it from the source of
  truth.
- **Role-gated data needs every surface audited** — render sites, CSVs,
  emails, aggregates. Hiding the input column is not enough; a derived total
  can leak the hidden value (e.g., gross pay ÷ hours = the hidden rate).
