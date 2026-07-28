# Scheduled reminder templates

Three reminders per app family (weekly / monthly / quarterly). If Cowork
scheduled tasks are available, create them with these prompts; otherwise
offer the equivalent as calendar entries or a cron that emails the checklist.

Design rules for reminder prompts:

- **Fully self-contained.** Each run starts with zero conversation memory:
  include app names, prod URLs, repo paths, the runbook location, and the
  expected output format in the prompt itself.
- **Do the automatable, checklist the human.** The run should fetch prod
  URLs and do read-only dependency checks itself, then list what only the
  user can verify (did the digest email arrive? any monitoring alerts?).
- **Report-only, always.** State explicitly: no installs, no fixes, no
  commits, no deploys. A reminder that mutates the system is a hazard.
- **Degrade gracefully.** The run may not have repo folder access — say
  what to do in that case (report the item as manual) instead of failing.
- **End with a verdict** (ALL CLEAR / needs-attention list) so the user can
  triage from the first line.

Suggested schedules (local time): weekly Monday ~8am (the weekend digest is
in the inbox to verify); monthly on the 1st; quarterly aligned to the
restore-test due date. Add a domain-gate reminder (e.g., 1st + 16th for
semi-monthly payroll) when the runbook has one.

---

## Template — weekly health check

> You are running the weekly health check for [user]'s production app(s):
> [app] ([prod URL]) [+ siblings]. The runbook is MAINTENANCE.md at the root
> of each repo ([paths]) — read the "Weekly" section if you have folder
> access.
>
> Do the following, in order:
> 1. Fetch each production URL and confirm it returns 200 with real content
>    (not an error page). Report status.
> 2. If you have shell access to the repo folders, run the read-only
>    dependency checks ([commands]) and summarize findings (do NOT install
>    or fix anything — report only). If no folder access, list as manual.
> 3. Produce a short checklist of what the user must verify manually:
>    - Did the [digest email] arrive? (If NOT: the cron infra is broken —
>      check [cron logs]. A missing digest is itself an alert.)
>    - Any [uptime monitoring] alerts this week? ([dashboard URL])
>    - Did [backup job] run green? ([command])
>    - [2-minute smoke test items, incl. any role-visibility check]
> 4. End with a one-line verdict: ALL CLEAR or a list of items needing
>    attention.
>
> Keep the report concise. Do not modify any files or deploy anything.

## Template — monthly maintenance session

> This is the monthly maintenance reminder for [apps]. Full procedure:
> "Monthly" section of MAINTENANCE.md in each repo ([paths]).
>
> Produce a concise reminder with this checklist:
> 1. Dependency update session (~30–60 min): [update/test/build commands per
>    repo]. Ship patch+minor; defer majors ([list the big ones]) to a
>    deliberate session with release notes read. Never blind force-fix.
> 2. After pushing: verify prod actually moved — [deploy verification
>    command]. [PWA: bump service-worker cache if user-facing routes
>    changed.]
> 3. [Platform dashboard sweep: linter warnings, backups running, auth
>    config intact.]
> 4. [Store checks: App Store Connect notices, cert/membership expiry.]
> 5. Seasonal: in June, start iOS beta testing per the runbook's release
>    rhythm; in September, the annual rebuild.
>
> You may run read-only checks (audit/outdated) and include results, but do
> NOT install, update, commit, or deploy — the update session is the user's
> call.

## Template — quarterly reliability check

> Quarterly reliability reminder for [apps]. Procedure: "Quarterly" section
> of MAINTENANCE.md ([paths]).
>
> Remind the user to:
> 1. Backup restore test — the critical one. [Full chain description:
>    download artifact → decrypt → restore into throwaway → verify table
>    counts/policies/functions. Link to the app's restore-verification doc
>    and last-verified date.]
> 2. Secret sanity: [list command]; flag any never-rotate-casually secret
>    (backup passphrases).
> 3. [Any infra re-verification: push-notification delivery probe, webhook
>    health, certificate expiry.]
> 4. Prune stale TODOs in project docs.
>
> Output a short checklist. Do not perform the restore test yourself —
> it involves credentials and infrastructure the user manages.
