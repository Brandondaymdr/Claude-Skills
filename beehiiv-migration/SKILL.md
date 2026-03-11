---
name: beehiiv-migration
description: Step-by-step guide for migrating WhiskeyTribe's 25,500 subscribers from ActiveCampaign to beehiiv safely, without triggering spam filters or requiring subscribers to re-confirm. Use this skill whenever the user mentions migrating, importing subscribers, exporting from ActiveCampaign, list migration, or moving to beehiiv. Also trigger for tasks like cleaning the list, mapping custom fields, or setting up beehiiv domain authentication before the first send.
---

# beehiiv Migration Skill — WhiskeyTribe

## Your Starting Position (from ActiveCampaign audit)

| Metric | Value |
|--------|-------|
| Total subscribers | ~25,500 |
| Sending domain | @whiskeytribe.com ✅ Authenticated |
| Best campaign open rate | 42.41% (02/06/2026) |
| Recent open rate | 15.76% (02/27/2026 — sent same day, still climbing) |
| Bounce rate | 0.06–0.08% ✅ Excellent |
| Unsubscribe rate | 0.11–0.29% ✅ Healthy |
| Send frequency | Weekly on Fridays |

**Key insight:** Your domain is already authenticated and your list health is excellent. The migration risk is beehiiv's sending IPs being new — not your list quality. This means a phased warm-up is required but you are in the best possible position.

---

## Phase 1: beehiiv Account Setup (Before Any Import)

Complete ALL of these before importing a single subscriber.

### 1. Domain Authentication in beehiiv
**This is the most critical step — do not skip.**

1. Log in to beehiiv → **Settings → Domains**
2. Click **Add Domain** → enter `whiskeytribe.com`
3. beehiiv will generate SPF, DKIM, and DMARC DNS records
4. Add those records in your DNS provider (wherever whiskeytribe.com DNS is managed)
5. Wait for verification (can take up to 24 hours)
6. Confirm status shows ✅ Authenticated before proceeding

> **Why:** Your @whiskeytribe.com domain already has a strong sender reputation built in ActiveCampaign. Authenticating it in beehiiv transfers that trust to your new sending setup.

### 2. Configure Sending Identity
- Settings → **Sending** → set From Name: `WhiskeyTribe` or `Whiskey Tribe`
- Set From Email: `newsletter@whiskeytribe.com` (match what subscribers recognize from AC)
- Set Reply-To: your preferred reply address

### 3. Set Up Custom Fields
Mirror the custom fields from ActiveCampaign:
- Settings → **Custom Fields** → recreate each field
- At minimum: First Name, Last Name, any tags/segments you use for personalization

### 4. Create Your Segment Structure
Before importing, create these 3 segments in beehiiv (Audience → Segments):

| Segment Name | Criteria | Approx Size |
|---|---|---|
| **Tier 1 — Highly Engaged** | Opened 3+ of last 5 emails in AC | ~5,000–6,000 |
| **Tier 2 — Moderately Engaged** | Opened 1–2 of last 5 emails | ~10,000–12,000 |
| **Tier 3 — Low Engagement** | Opened 0 of last 5 emails | ~7,000–9,000 |

You'll import each tier separately and send to them in sequence during warm-up.

---

## Phase 2: Export from ActiveCampaign

### How to Export Your List
1. In AC → **Contacts** → **Manage Lists**
2. Select your main list → **Export**
3. Choose **CSV format**
4. Include ALL custom fields
5. Filter and export **Active subscribers only** — do NOT include:
   - Unsubscribed contacts
   - Hard bounced contacts
   - Spam complaints

### How to Segment by Engagement Before Export
In AC, create 3 separate exports using the Segment filter:

**Tier 1 export** — filter by: Opened any of your last 3 campaigns
**Tier 2 export** — filter by: Opened at least 1 campaign in last 6 months, NOT in Tier 1
**Tier 3 export** — everyone else who is Active

Label your CSV files clearly:
- `whiskeytribe-tier1-engaged.csv`
- `whiskeytribe-tier2-moderate.csv`
- `whiskeytribe-tier3-low.csv`

### Clean Each CSV Before Import
- Remove any emails with obvious typos (e.g., @gmial.com, @yaho.com)
- Remove role-based emails if any (info@, admin@, support@) — these hurt deliverability
- Remove duplicates

---

## Phase 3: Import into beehiiv

Import one tier at a time — **do not bulk import all 25,500 at once.**

### Import Steps (repeat for each tier)
1. Audience → Subscribers → **Import Subscribers**
2. Upload the tier CSV
3. Map fields:
   - Email → Email (required)
   - First Name → First Name custom field
   - Any other fields → matching beehiiv custom fields
4. Set **Subscription Status** → Active (do NOT require re-confirmation)
5. Set UTM source for tracking: `utm_source=activecampaign_migration`
6. Set UTM medium: `utm_medium=import_tier1` (or tier2/tier3)
7. **Disable welcome email** during import — subscribers already know WhiskeyTribe
8. Click Import

### Import Order & Timing
- **Week 1:** Import Tier 1 only (~5,000–6,000)
- **Week 2:** Import Tier 2 (~10,000–12,000)
- **Week 3:** Import Tier 3 (~7,000–9,000)

> Import each tier 2–3 days before you plan to send to them so beehiiv has time to process.

---

## Phase 4: Verification Checklist Before First Send

- [ ] Domain shows ✅ Authenticated in beehiiv Settings → Domains
- [ ] From name and email match what subscribers recognize from AC
- [ ] Tier 1 import complete and subscriber count matches expected number
- [ ] Test email sent to yourself — renders correctly, links work
- [ ] Subject line and preview text set
- [ ] Unsubscribe link present in footer (required by law)
- [ ] Send time matches usual Friday cadence (don't change the day — subscribers expect it)

---

## Important Notes

- **Do NOT send to all 25,500 on day one** — see the beehiiv-warmup skill for the phased schedule
- **Do NOT send a "we've moved" announcement** — just send your normal newsletter from beehiiv. The content is what subscribers signed up for, not the platform.
- **Keep AC active** for 30 days after migration cutover as a backup
- **Re-confirmation is NOT required** if subscribers gave valid consent when they originally signed up — and they did

---

## Reference Files
- `references/ac-export-guide.md` — Detailed ActiveCampaign export walkthrough with screenshots guide
- `references/field-mapping.md` — AC fields → beehiiv field mapping reference
