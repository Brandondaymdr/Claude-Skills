# ActiveCampaign Export Guide — WhiskeyTribe

## Creating Engagement-Based Segments in AC Before Exporting

### Step 1: Create the Tier 1 Segment (Highly Engaged)
1. In AC → **Contacts** → **Segments** → **New Segment**
2. Name it: `Migration - Tier 1 Engaged`
3. Add condition: **Campaign Activity** → **Has opened** → select your last 3 campaigns
4. Logic: **Any** (opened at least one)
5. Save and note the subscriber count

### Step 2: Create the Tier 2 Segment (Moderately Engaged)
1. New Segment → Name: `Migration - Tier 2 Moderate`
2. Condition 1: **Campaign Activity** → **Has opened** → any campaign in last 6 months
3. Condition 2: **Not in segment** → Migration - Tier 1 Engaged
4. Logic: **All**
5. Save and note count

### Step 3: Create the Tier 3 Segment (Low Engagement)
1. New Segment → Name: `Migration - Tier 3 Low`
2. Condition 1: **Subscription status** → Active
3. Condition 2: **Not in segment** → Migration - Tier 1 Engaged
4. Condition 3: **Not in segment** → Migration - Tier 2 Moderate
5. Logic: **All**
6. Save and note count

**Verify:** Tier 1 + Tier 2 + Tier 3 counts should add up to ~25,500

---

## Exporting Each Segment as CSV

1. Go to **Contacts** → **Manage Lists** → select your main list
2. Click **Export** button (top right)
3. Under **Segment**, select `Migration - Tier 1 Engaged`
4. Select fields to export:
   - Email ✅ (required)
   - First Name ✅
   - Last Name ✅
   - Any custom fields you use for personalization ✅
   - Tags (if used) ✅
5. Click **Export**
6. Download when ready (AC emails you a download link)
7. Rename file: `whiskeytribe-tier1-engaged.csv`
8. Repeat for Tier 2 → `whiskeytribe-tier2-moderate.csv`
9. Repeat for Tier 3 → `whiskeytribe-tier3-low.csv`

---

## CSV Cleaning Checklist

Before importing any file to beehiiv, open in Excel or Google Sheets and:

- [ ] Remove any rows where email column is blank
- [ ] Remove obvious typos: @gmial.com, @yaho.com, @hotmal.com, @gmal.com
- [ ] Remove role-based emails: info@, admin@, support@, noreply@, sales@
- [ ] Check for and remove duplicate email addresses
- [ ] Ensure First Name column has no numbers or special characters
- [ ] Save as CSV (not .xlsx)

**Time estimate:** 15–30 minutes per file depending on list size
