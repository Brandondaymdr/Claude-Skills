# Layer 5 — alerting

The daily PR monitor (`~/Projects/.pr-monitor/pr-monitor.py`, Mac launchd, 4 AM)
already posts to Slack and feeds the 6 AM weekday watchdog push. Extend it rather
than adding a second alert path.

- [ ] Add a Security section: per repo, `security` workflow runs that failed in the
      last 24 hours (`GET /repos/{o}/{r}/actions/workflows/security.yml/runs?status=failure`)
      and open critical/high Dependabot alerts (`GET /repos/{o}/{r}/dependabot/alerts?state=open&severity=critical,high`).
- [ ] Add `Actions: Read` and `Dependabot alerts: Read` to the monitor's
      fine-grained tokens (rotate them at the same time if they are near expiry).
- [ ] Append a security count to the machine-readable STATUS line so the watchdog
      push says e.g. `security: 2 failing, 1 critical alert`.
- [ ] The weekly scheduled `security` run (Mondays) is what surfaces new CVEs in
      code nobody touched — make sure its failures show up in Monday's push.
