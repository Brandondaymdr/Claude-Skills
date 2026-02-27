# ActiveCampaign → beehiiv Migration Checklist

## Phase 1: Preparation (Before Migration)

- [ ] Audit your ActiveCampaign lists — note total subscribers per list
- [ ] Document all active automations and their trigger logic
- [ ] Note all custom fields used in AC and their data types
- [ ] Export email templates you want to preserve
- [ ] Record current open/click rates as a baseline benchmark
- [ ] Set your target migration date (allow 2-4 weeks for setup)

---

## Phase 2: beehiiv Account Setup

- [ ] Sign up / log in to beehiiv — go to app.beehiiv.com
- [ ] Complete **Publication Settings**: name, logo, brand colors
  - Settings → Publication → Publication Settings
- [ ] Connect **custom domain** (if applicable)
  - Settings → Domains → Connect Domain
- [ ] Authenticate your email domain (**SPF, DKIM, DMARC**)
  - Settings → Domains → Authentication — critical for deliverability!
- [ ] Set up **Custom Fields** that match your AC custom fields
  - Settings → Custom Fields → Add Field
- [ ] Invite **team members**
  - Settings → Team → Invite

---

## Phase 3: Export from ActiveCampaign

- [ ] Go to ActiveCampaign → Contacts → Export
- [ ] Select all relevant lists
- [ ] Include all custom fields in the export
- [ ] Export as CSV
- [ ] Filter out: unsubscribed, hard bounced, spam complaints
- [ ] Filter out: invalid/test emails
- [ ] If you have multiple lists, export each separately and label them

---

## Phase 4: Import to beehiiv

- [ ] Go to Audience → Subscribers → **Import Subscribers**
- [ ] Upload CSV (one list at a time if multiple)
- [ ] Map columns to beehiiv fields:
  - Email → Email
  - First Name → custom field or standard field
  - Custom fields → map to matching beehiiv custom fields
- [ ] Set UTM source to track migration (e.g., `utm_source=activecampaign`)
- [ ] Disable welcome emails during import (unless intentional)
- [ ] Verify import counts match expected numbers

---

## Phase 5: Recreate Segments & Tags

- [ ] Create **Tags** in beehiiv to match your AC tags/lists
  - Audience → Subscribers → Tags tab
- [ ] Recreate **key segments** using beehiiv's Segment builder
  - Audience → Segments → Create Segment
  - Priority segments: High engagement, Inactive, Paid customers, etc.
- [ ] Apply tags to imported subscribers via segment bulk actions

---

## Phase 6: Rebuild Automations

- [ ] Map out each AC automation as a diagram first
- [ ] Recreate in beehiiv → **Automations → New Automation**
- [ ] Priority automations to rebuild first:
  - [ ] Welcome series (trigger: Signed Up)
  - [ ] Re-engagement sequence
  - [ ] Onboarding flow
  - [ ] Any purchase/conversion flows
- [ ] Set up **RSS-to-Send** if you have a blog feed
  - Automations → RSS-to-Send

---

## Phase 7: Recreate Templates

- [ ] Build or import your newsletter templates
  - Posts → Start Writing → New Template
- [ ] Set brand colors and fonts in the Style tab
- [ ] Set your most-used template as **default**
- [ ] Preview on both desktop and mobile

---

## Phase 8: Pre-Send Testing

- [ ] Send a **test email** to yourself from the Post Builder (Review tab)
- [ ] Verify links work correctly
- [ ] Check mobile rendering
- [ ] Confirm subject line and preview text look correct
- [ ] Verify sender name and reply-to address
- [ ] Check that your domain authentication is active (look for ✓ in Settings → Domains)

---

## Phase 9: First Campaign Send

- [ ] Send first campaign to a **small segment** (e.g., 100 highly engaged subscribers)
- [ ] Monitor for:
  - Delivery rate > 95%
  - No major spam complaints
  - Open/click rates comparable to AC baseline
- [ ] If all looks good, send to full list

---

## Phase 10: Post-Migration Cleanup

- [ ] Update any website subscribe forms to point to beehiiv embed or link
- [ ] Update any Zapier/Make automations to use beehiiv triggers/actions
- [ ] Set a date to pause/cancel ActiveCampaign (wait 30 days post-migration)
- [ ] Archive old AC templates and automations for reference
- [ ] Document your new beehiiv workflow for the team

---

## Important Notes

- **Do not send duplicate campaigns** during the transition period — pick a cutover date
- **Deliverability:** beehiiv has strong deliverability, but SPF/DKIM setup is essential before first send
- **Subscriber consent:** Only import subscribers who explicitly opted in
- **Soft bounces** from AC: These are fine to import; beehiiv will manage them going forward
- **Hard bounces** from AC: Do NOT import — they damage deliverability

---

## beehiiv Support Resources

- Knowledge Base: https://support.beehiiv.com
- Developer Docs: https://developers.beehiiv.com
- Submit a ticket: https://app.beehiiv.com/?new_support_ticket
- Video tutorials: https://www.youtube.com/@beehiiv
