# The always-sends weekly health digest

A weekly email that summarizes the app's health and ALWAYS sends — clean week
or not. This exists to solve a specific blind spot: alert-only systems (drift
audits, error monitors) are silent when healthy AND silent when the alerting
itself has broken. Nobody can tell the difference until something expensive
slips through. The digest converts that ambiguity into a contract: *email
every Sunday, or the infrastructure is broken.*

Origin: a payroll app where an edit-modal bug silently corrupted stored hours
for ~3 weeks. The UI looked right; only stored numbers drifted. A nightly
alert-only audit was later added, but a missing alert still looked identical
to a clean night. The digest closed that gap.

## Architecture (stack-agnostic)

```
[scheduler] → [authed HTTP endpoint or job] → [pure computation module] → [email]
                                                    ↑ unit tests live here
```

1. **Pure computation module** — takes rows in, returns a digest object out.
   No DB client, no fetch, no env. This is where ALL the logic lives, and
   it's fully unit-testable. The transport layer should be too thin to hide
   bugs.
2. **Thin endpoint/job** — auths the request, fetches rows, calls the pure
   module, renders email HTML, sends. Return the digest as JSON too, so a
   manual curl doubles as a debugging tool.
3. **Auth with a bearer secret** — even a "read-only summary" endpoint leaks
   business data (hours, volumes, employee names). Reuse an existing cron
   secret if one exists; don't mint new secrets casually.
4. **Reuse existing email infra** (Resend/SES/Postmark — whatever the app
   already sends with). A digest on a novel email path adds a new failure
   mode to the thing whose job is detecting failure modes.

## What goes in the digest

Adapt to the domain, but the categories generalize:

| Category | Payroll example | E-commerce example |
|---|---|---|
| Volume stats | shifts completed, hours worked, per-employee totals | orders, revenue, per-SKU units |
| Invariant violations | stored_hours ≠ elapsed − breaks (recomputed from source of truth) | order total ≠ Σ line items; inventory < 0 |
| Stuck states | clock-ins active >24h | orders unfulfilled >N days, payments stuck "processing" |
| Anomalies | single entries >12h | refund spikes, $0 orders |
| Pending human queues | entries awaiting approval, flagged rows | disputes open, reviews unmoderated |
| Verdict | ALL CLEAR ✓ / NEEDS ATTENTION | same |

Rules of thumb:

- **Invariant checks recompute from the source of truth**, not from the
  cached/denormalized column being checked. If `total_hours` is derived from
  `break_entries`, the check re-sums `break_entries`. Checking a cache
  against itself always passes.
- **Watch for NULL-coalescing blindness**: `(cached_value || 0)` in a check
  can make a NULL bug invisible when the derived value was *also* computed
  with the same NULL. Check the field's presence independently of the math.
- **Excluded rows still count.** Rows excluded from downstream processing
  (flagged, voided) shouldn't pollute totals or invariants — but report
  their count; a growing pile of flagged rows is itself a finding.
- **Pending ≠ unhealthy.** Items awaiting normal human review shouldn't trip
  the NEEDS ATTENTION verdict; stuck/violating items should.
- Subject line carries the verdict, so triage happens from the inbox list:
  `[App] weekly digest — ALL CLEAR ✓ (214 orders, $18,240)` vs
  `[App] weekly digest — 3 item(s) need attention`.

## Scheduling options

- **Vercel Cron** (`vercel.json` → `crons`) — simplest if already on Vercel.
  Hobby plan: max 2 cron jobs, no sub-daily schedules, ± timing slop.
  Vercel automatically sends `Authorization: Bearer $CRON_SECRET` if that
  env var is set.
- **GitHub Actions** `schedule:` — good when there's no server platform or
  cron slots are full; secrets via repo settings.
- **pg_cron + pg_net** (Postgres/Supabase) — for sub-daily needs or when the
  DB should own the schedule.
- Cron expressions on most platforms are **UTC** — convert from the
  business's timezone and note the DST wobble in a comment.
- Sunday evening local time is a good default: the week is complete, and the
  report is waiting Monday morning.

## Reference implementation shape (TypeScript/Next.js)

Condensed from the harper-timeclock implementation
(`src/lib/weekly-digest.ts` + `src/app/api/audit/digest/route.ts` — read
those for a full working example if that repo is available):

```ts
// lib/weekly-digest.ts — PURE, unit-tested
export function computeWeeklyDigest(rows: Row[], activeRows: Row[], now: Date): Digest {
  // volume aggregation, invariant recomputation from source-of-truth child
  // rows, stuck/anomaly detection, allClear verdict
}

// app/api/audit/digest/route.ts — THIN
export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const [closed, active] = await Promise.all([/* two scoped queries */])
  const digest = computeWeeklyDigest(closed, active, new Date())
  await sendEmail(renderHtml(digest))          // ALWAYS — no allClear gate
  return NextResponse.json({ ok: true, ...digest })
}
```

Testing note: unit-test the pure module with fixture rows covering each
issue category, including regression fixtures for any real past incident
(the exact data shape that once slipped through is the most valuable test
you own). Manual trigger for verification after deploy:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://[app]/api/audit/digest
```

## Pairing with an alert-only audit

The digest complements (does not replace) a more frequent alert-only check —
e.g., a nightly invariant audit that emails only on violations, with a tight
threshold. Nightly catches problems within a day; the weekly digest proves
the whole apparatus is alive and gives the human a bounded weekly ritual.
