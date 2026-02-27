---
name: beehiiv
description: Expert guide for navigating and operating the beehiiv newsletter platform. Use this skill whenever the user mentions beehiiv, wants to create or manage newsletter campaigns, work with email posts, manage subscribers, set up automations, build segments, configure their publication, or migrate from another platform (like ActiveCampaign) to beehiiv. Also trigger when users ask about drafting newsletters, scheduling sends, setting up welcome flows, or analyzing newsletter performance in beehiiv. This skill covers both the beehiiv web UI and the beehiiv API.
---

# beehiiv Skill

beehiiv is a newsletter platform built for growth. This skill guides you through all major workflows in the beehiiv dashboard and API so the team can create, manage, and optimize newsletter campaigns efficiently.

## Dashboard Overview

**Left Panel Navigation:**
- **Home** — Account dashboard, active subscribers, quick stats
- **Posts** — All newsletters; "Start Writing" button top-right
- **Audience** — Subscribers, Segments, Tags
- **Automations** — Workflow builder, RSS-to-Send
- **Monetization** — Ad Network, paid subscriptions, referral program
- **Design** — Website Builder, theme customization
- **Settings** — Publication settings, team, API keys, domain, integrations

**Shortcut:** Type `beehiiv.new` in the browser address bar to instantly open a blank draft.

---

## Core Workflow: Creating & Sending a Post (Newsletter)

The Post Builder has **5 tabs** — work through them in order or jump freely:

### 1. Compose Tab
- Click **Start Writing** from the dashboard → choose Blank draft or a Template
- Give the post a **Title**, **Subtitle**, and **Thumbnail**
- Add **Tags** and **Authors**
- Write content using the editor; use **slash-commands** (`/`) for:
  - `/image` — insert image
  - `/poll` — embed a poll
  - `/section` — group content blocks
  - `/html` — insert custom HTML snippet (paid plans)
  - `/paywall` — add a premium content break (paid plans)
- Use the **Style tab** (right panel) to adjust fonts, colors, spacing
- **Sections** let you set content visibility: email only, web only, or both — useful for free vs. paid content
- Toggle **mobile preview** to verify rendering

### 2. Audience Tab
- Select who receives this post:
  - All subscribers
  - Specific **Segments** (static, dynamic, or manual)
  - Specific **Tags**
- If sending to a segment, manually recalculate the segment first for accuracy

### 3. Email Tab
- Set **From name** and **Reply-to** email
- Write the **Subject line** and **Preview text** (preheader)
- Enable **A/B testing** on subject lines (Max/Enterprise plans)
- Configure **tracking** (opens, clicks)
- Schedule or send immediately

### 4. Web Tab
- Control whether the post is published to your public website
- Set **SEO title**, **meta description**, and **canonical URL**
- Choose to **hide from feed** or **password-protect**

### 5. Review Tab
- Final checklist before sending
- Send a **test email** to yourself
- **Publish** or **Schedule** the campaign

---

## Templates

- Go to **Posts → Start Writing** to access the Template Library
- Choose: Blank draft, Quick Start templates, or your saved templates
- Click **New template** to create a reusable design
- Template builder has the same Write/Style tabs as the post editor
- **Set a default template** to keep branding consistent
- Save any finished post as a template via the 3-dots menu

---

## Subscriber Management

**Access:** Left panel → **Audience → Subscribers**

Subscriber statuses: `Active`, `Paused`, `Pending`, `Needs Approval`, `Inactive`

**Importing subscribers:**
- Go to Audience → Subscribers → **Import Subscribers**
- Supports CSV upload with field mapping
- When migrating from ActiveCampaign: export your list as CSV, clean it, then import

**Subscriber Profile includes:**
- Engagement history (opens, clicks per post)
- Acquisition source (channel + UTM)
- Geographic location (updated on open/click)
- Tags and tier membership
- Automation enrollment history

**Bulk actions:** Use segments to apply tags, delete, or enroll in automations in bulk.

---

## Segments

**Access:** Audience → **Segments**

Three segment types:
| Type | Behavior |
|------|----------|
| **Static** | Snapshot at time of creation; does not auto-update |
| **Dynamic** | Updates nightly based on conditions |
| **Manual** | You manually choose which subscribers to include |

**Creating a segment:**
1. Audience → Segments → **Create Segment**
2. Name and describe the segment
3. Choose type (Static / Dynamic / Manual)
4. Define conditions — combine with **All (AND)**, **At least one (OR)**, or **None** logic
5. Save → segment dashboard opens immediately

**Useful segment examples:**
- Open rate ≥ 80% → highly engaged subscribers
- Subscribed in last 30 days → new subscribers
- Never opened or clicked → re-engagement candidates
- Subscribed via specific UTM source → acquisition source analysis

**Pro tips:**
- Recalculate a dynamic segment manually before sending to it
- Dynamic segments become inactive if no changes occur in 30 days — click Reactivate
- Use **Segment Groups** for complex multi-condition logic

---

## Automations

**Access:** Left panel → **Automations**

Build automated email journeys with triggers, actions, and conditional logic.

**Key triggers:**
- **Signed Up** — new subscriber joins
- **Email Submitted** — subscriber submits a specific subscribe form
- **Survey Form Submitted** — after completing a survey
- **Manual** — you manually enroll subscribers or a segment

**Common automation templates:**
- Welcome series
- Re-engagement flow (90-day inactivity)
- Lead magnet delivery
- Upsell / upgrade sequences

**To enroll a segment into an automation:**
1. Create automation with a **Manual trigger**
2. Go to Audience → Segments → select segment
3. Click **Enroll in Automation** → choose the automation

**RSS-to-Send:**  
Automations → **RSS-to-Send** → enter RSS URL → customize format and schedule → enable.  
Automatically converts new blog/RSS content into a newsletter send.

---

## Migrating from ActiveCampaign to beehiiv

1. **Export from ActiveCampaign:** Go to Lists → Export → CSV (include all custom fields)
2. **Clean the CSV:** Remove unsubscribed, bounced, and invalid emails
3. **Import to beehiiv:** Audience → Subscribers → Import Subscribers → map fields
4. **Map custom fields:** Settings → Custom Fields to recreate field structure
5. **Recreate segments:** Rebuild your AC lists/tags as beehiiv Segments or Tags
6. **Rebuild automations:** Use the drag-and-drop Automation builder to recreate sequences
7. **Verify domain authentication:** Settings → Domains → set up SPF, DKIM, DMARC
8. **Send a test campaign** to a small segment before full migration

---

## Analytics & Performance

**Post-level analytics** (click the post → Analytics):
- Open rate, Click-through rate (CTR)
- Bounce rate, Unsubscribes
- Geographic breakdown

**Audience-level analytics:**
- Audience → Subscribers → Overview tab: active subscribers over time
- Segment dashboards show aggregate engagement for that group

**Key benchmarks to watch:**
- Open rate < 20% → revisit subject lines and send times
- Spike in unsubscribes → content relevance issue
- High bounce rate → list hygiene needed

---

## Publication & Design Settings

**Theme customization:** Design → Website Builder → Settings  
- Set color palette, fonts, logo, header/footer
- Control navbar, static pages, and subscription preference center

**Domain settings:** Settings → Domains  
- Connect custom domain
- Set up SPF / DKIM / DMARC for email deliverability

**Team access:** Settings → Team → invite members with appropriate roles

---

## beehiiv API (for programmatic tasks)

Base URL: `https://api.beehiiv.com/v2`

**Auth:** Bearer token in Authorization header  
**Create API key:** Settings → API → Create API Key

**Key endpoints:**
| Resource | Endpoint |
|----------|----------|
| Publications | `GET /publications` |
| Posts | `GET /publications/{id}/posts` |
| Create Post | `POST /publications/{id}/posts` |
| Subscriptions | `GET /publications/{id}/subscriptions` |
| Add Subscriber | `POST /publications/{id}/subscriptions` |
| Segments | `GET /publications/{id}/segments` |
| Custom Fields | `GET /publications/{id}/custom_fields` |
| Automations | `GET /publications/{id}/automations` |

**Rate limiting:** beehiiv uses rate limiting; see `references/api-details.md` for pagination and limits.

Full API docs: https://developers.beehiiv.com/api-reference

---

## Quick Reference: Common Tasks

| Task | Path |
|------|------|
| Write a new newsletter | Posts → Start Writing (or type `beehiiv.new`) |
| Use a saved template | Posts → Start Writing → My Templates |
| Schedule a send | Post Builder → Email tab → Schedule |
| Import subscribers | Audience → Subscribers → Import Subscribers |
| Create a segment | Audience → Segments → Create Segment |
| Build an automation | Automations → New Automation |
| Check open rates | Posts → click post → Analytics |
| Add team members | Settings → Team |
| Create API key | Settings → API |
| Set up domain / DKIM | Settings → Domains |
| Customize website | Design → Website Builder |

---

## Reference Files

- `references/api-details.md` — API pagination, rate limits, and detailed endpoint examples
- `references/migration-checklist.md` — Step-by-step ActiveCampaign → beehiiv migration

Read these when handling API integrations or migration tasks.
