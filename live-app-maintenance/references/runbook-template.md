# MAINTENANCE.md template

Generate the app's runbook from this skeleton. Replace every bracket with the
app's real values — commands that can be copy-pasted, URLs that can be
clicked. If a section doesn't apply (no native app, no backup Action), delete
it rather than leaving a stub; an accurate short runbook beats an aspirational
long one.

Two style rules that make runbooks survive contact with reality:

1. **Lead with what already exists.** A "Current safety net" block up top
   stops a future session from rebuilding monitoring that's already live.
2. **Explain the why in one clause.** "Confirm the digest arrived (a missing
   digest means the cron broke)" gets followed; a bare imperative gets
   skipped when the reader is busy.

---

```markdown
# MAINTENANCE.md — [App Name]

Operational runbook for keeping [app] stable in production.
[If part of a multi-app family: link sister runbooks + note shared
infrastructure like a common database, since DB-level items should live in
exactly one runbook.]

Current safety net (already live — don't rebuild, just keep healthy):

- [Uptime monitoring service, check frequency, alert channel]
- [Health digest / drift audit crons, schedule, what they cover]
- [Backup system: managed + offsite, retention, who holds keys]
- [Test suite size + what the critical guards are (money paths, role leaks)]

## Weekly (~10 min)

1. Confirm the [digest email / heartbeat] arrived. If it didn't, the cron
   infra is broken — check [cron logs location] before assuming all-clear.
2. Skim [monitoring dashboard] for downtime blips.
3. Dependency check (report only, do NOT blind-fix):
   [exact commands, e.g. `cd [repo] && npm audit && npm outdated`]
   Patches safe same-day; majors get a deliberate session.
4. Smoke test ([2 min]): [the 2–3 user paths that matter most, incl. any
   role-based visibility check]
5. [Verify backup job ran green: exact command]

## [Domain gate — e.g., "Every pay period (1st and 16th)"]

[The business-critical checkpoint: what must be verified before the
expensive-to-get-wrong event, with exact commands and the expected
clean-state output. Examples: reconciliation scripts before payroll is cut,
webhook backlog check before month-end billing, inventory sync before a
product drop.]

## Monthly (~30–60 min)

1. Dependency update session: [update + test + build commands]. Then commit,
   push, and verify prod moved (see Deploy verification).
2. [Platform dashboard sweep: database linter, backup status, auth config —
   whatever silently drifts on this stack]
3. [Store/account checks: App Store Connect notices, expiring certs,
   membership renewals, domain expiry]

## Quarterly

1. Restore test — full chain from backup artifact to a working throwaway
   database. Procedure: [link]. Next due: [date].
2. Secret sanity: [list command]; note any secret that must NEVER be rotated
   casually (e.g., a backup encryption passphrase — losing it makes all past
   backups unreadable).
3. Prune stale TODOs in project docs.

## Deploy verification (after EVERY production push)

[Stack-specific check that the deployed artifact actually changed, e.g.
comparing a local build hash to the served bundle:
`curl -s [prod-url] | grep -o 'index-[A-Za-z0-9]*\.js'`
and what to do when it didn't move (promote preview / push tree-changing
commit).]

## When something breaks

1. **App down**: [platform status page] and [DB status page] first, then
   [redeploy-last-good procedure].
2. [Next most likely failure and its first move]
3. [.. ordered by likelihood, from real incidents where possible]
4. **Data looks wrong**: [diagnostic procedure]. NEVER destructive SQL
   without a pre-state capture of the affected rows.

## Rules index

[Links to the repo's .claude/rules/ or equivalent invariant docs, one line
each on when to read them.]
```

---

## Native-app appendix

If the app ships an iOS/Android binary or installable PWA, append the
release-rhythm section — see `ios-release-rhythm.md` in this skill for the
content to adapt.
