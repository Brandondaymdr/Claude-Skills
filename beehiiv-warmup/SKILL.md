---
name: beehiiv-warmup
description: IP warm-up strategy and phased sending schedule for WhiskeyTribe's migration from ActiveCampaign to beehiiv. Use this skill whenever the user asks about warming up beehiiv, the sending schedule during migration, deliverability monitoring, spam risk, when to scale up sends, or what to do if open rates drop or emails go to spam during the migration period. This skill contains WhiskeyTribe-specific send volumes and targets based on a 25,500 subscriber list.
---

# beehiiv IP Warm-Up Skill — WhiskeyTribe

## Why Warm-Up Is Necessary

Even though @whiskeytribe.com is authenticated and your list is healthy, beehiiv sends from shared IP pools that start with no reputation history for YOUR domain. Gmail, Outlook, and Yahoo need to see a gradual volume increase from a new sending setup before they fully trust it. Sending 25,500 emails from day one on a new IP = likely spam folder.

The goal is to ramp up volume over 4 weeks while your open rates signal to inbox providers that subscribers want your emails.

---

## Your Baseline Metrics (from ActiveCampaign)

Use these as your benchmarks during warm-up. If beehiiv numbers drop significantly below these, pause and investigate.

| Metric | AC Benchmark | Warm-Up Minimum Target |
|--------|-------------|------------------------|
| Open rate | 42.41% (healthy sends) | > 25% during warm-up |
| Bounce rate | 0.06–0.08% | Stay under 0.5% |
| Unsubscribe rate | 0.11–0.29% | Stay under 0.5% |
| Spam complaints | Not reported (very low) | Stay under 0.1% |

---

## 4-Week Warm-Up Schedule

### Week 1 — Tier 1 Only (Highly Engaged ~5,000–6,000)
**Who:** Subscribers who opened 3+ of your last 5 AC campaigns
**Send day:** Friday (keep your normal cadence)
**Volume:** ~5,000–6,000

**What to expect:**
- Open rates should be 35–50%+ — these are your best subscribers
- This high engagement signals to Gmail/Outlook that WhiskeyTribe emails are wanted
- This is the most important send of the entire migration

**Green light to proceed to Week 2 if:**
- Open rate > 30%
- Bounce rate < 0.5%
- No spam complaints

---

### Week 2 — Tier 1 + Tier 2 (~15,000–18,000)
**Who:** All Tier 1 + newly imported Tier 2 (moderately engaged)
**Send day:** Friday
**Volume:** ~15,000–18,000

**What to expect:**
- Open rates will come down from Week 1 — this is normal
- Target: > 25% open rate for the combined send
- Bounce rate stays low since Tier 2 is still active/engaged

**Green light to proceed to Week 3 if:**
- Open rate > 20%
- Bounce rate < 0.5%
- Spam complaints < 0.1%

---

### Week 3 — Full List (~25,500)
**Who:** All tiers including newly imported Tier 3
**Send day:** Friday
**Volume:** ~25,500

**What to expect:**
- Open rates will drop further with Tier 3 added — expected
- Target: > 15% open rate (still well above industry average of 20%)
- Watch unsubscribes more closely — Tier 3 is less engaged

**Green light that migration is successful if:**
- Open rate > 15%
- Bounce rate < 0.5%
- Unsubscribes < 0.5%

---

### Week 4 — Normal Operations
Full list, normal Friday cadence. Migration complete.
Start monitoring beehiiv analytics as your new source of truth.

---

## How to Monitor Deliverability Each Week

After each send, check these within 24 hours:

### In beehiiv
- Posts → click the sent post → **Analytics**
- Check: Open rate, Click rate, Bounces, Unsubscribes

### Red Flags — Stop and Investigate If:
| Signal | Threshold | Action |
|--------|-----------|--------|
| Open rate drops suddenly | Below 10% | Check spam placement (see below) |
| Bounce rate spikes | Above 1% | Pause — clean the segment before next send |
| Unsubscribe rate spikes | Above 1% | Review content relevance |
| Spam complaints | Above 0.1% | Pause immediately — contact beehiiv support |

### How to Check If Emails Are Going to Spam
1. Send a test email to a Gmail account and a personal Outlook/Hotmail account
2. Check if it lands in inbox or spam
3. If spam: check that domain authentication is still showing ✅ in beehiiv Settings → Domains
4. Use mail-tester.com — send a test email there and get a deliverability score (aim for 9+/10)

---

## What NOT to Do During Warm-Up

- ❌ Do not change your From name or From email mid-warm-up — consistency builds trust
- ❌ Do not send extra campaigns or tests to the full list — stick to the weekly schedule
- ❌ Do not send promotional/sales-heavy content during Week 1 — send your best editorial content to maximize opens
- ❌ Do not import and immediately send same-day — give beehiiv 24–48 hours after import
- ❌ Do not panic if open rates are lower than AC — AC rates can be inflated by Apple MPP; beehiiv tracking is more accurate

---

## Optimizing Week 1 for Maximum Opens

Week 1 is the most important send. To maximize opens from Tier 1:

- Use one of your best-performing subject lines from AC history
- Send at the same time as usual (your subscribers are trained to expect it)
- Keep content high value — this is not the week for a sales push
- Keep email length normal — don't send something unusually short or long
- Do NOT mention the platform change in the email

---

## Post-Migration: Ongoing Deliverability

Once warm-up is complete, maintain deliverability by:

- **Monthly:** Review open rates by segment — re-engage or remove Tier 3 subscribers who still haven't opened after 60 days on beehiiv
- **Quarterly:** Run a re-engagement campaign for inactive subscribers before deleting them
- **Ongoing:** Keep bounce rate under 0.5% — beehiiv automatically suppresses hard bounces
- **Watch:** Gmail Postmaster Tools — set up at postmaster.google.com with whiskeytribe.com to get ongoing domain reputation data

---

## Quick Reference — Week-by-Week

| Week | Segment | Volume | Open Rate Target | Action if Below Target |
|------|---------|--------|-----------------|----------------------|
| 1 | Tier 1 only | ~5,500 | > 30% | Do not proceed to Week 2, investigate |
| 2 | Tier 1 + 2 | ~17,000 | > 20% | Delay Week 3 by one week |
| 3 | Full list | ~25,500 | > 15% | Re-segment Tier 3, delay or clean |
| 4+ | Full list | ~25,500 | > 20% | Normal operations |

---

## Reference Files
- `references/deliverability-signals.md` — Detailed guide to reading deliverability signals and what to do when things go wrong
- `references/warmup-troubleshooting.md` — Specific scenarios and fixes if warm-up goes sideways
