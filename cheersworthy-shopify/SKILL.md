---
name: cheersworthy-shopify
description: Shopify technical implementation skill for Cheersworthy.com. Use this skill whenever working on any Shopify platform decision, metafield architecture, app selection, theme configuration, Liquid templating, Search & Discovery setup, email/CRM flows, Shopify Flow automations, performance optimization, compliance configuration, or anything involving the Shopify backend for Cheersworthy. ALWAYS read this skill before making any Shopify platform, theme, or app decision.
---

# Cheersworthy Shopify Implementation Skill

This skill guides all technical Shopify decisions for Cheersworthy.com. Always cross-reference CLAUDE.md in the project repo — it is the single source of truth for all locked decisions. This skill contains the most important implementation rules and patterns.

---

## Core Platform Philosophy

**Native Shopify first → Turnkey apps second → Custom for differentiators only**

Custom development = Flavor Cloud rendering, Flavor Cloud ↔ filter connection, future quiz/taste profile.
Everything else = native Shopify feature or approved app.

**Current plan:** Standard Shopify. Upgrade to Plus only when monthly revenue justifies or checkout extensibility is needed.

---

## Metafield System

All custom metafields use the `cheersworthy` namespace. Never use `custom`, `cw`, or any other namespace — consistency is critical across the entire catalog.

### Critical Product Metafields
```
cheersworthy.whiskey_type        → single_line_text  (Bourbon/Rye/Scotch/etc.)
cheersworthy.distillery          → single_line_text
cheersworthy.region              → single_line_text
cheersworthy.proof               → number_decimal
cheersworthy.age_statement       → single_line_text  ("12 Years" or "NAS")
cheersworthy.top_flavors         → single_line_text  (top 5 flavors)
cheersworthy.flavor_profile_json → json  ([{"note":"vanilla","count":47,"confidence":0.92},...])
cheersworthy.flavor_cloud_status → single_line_text
cheersworthy.why_this_bottle     → multi_line_text  ("Why This Bottle" editorial block)
cheersworthy.tasting_nose        → multi_line_text
cheersworthy.tasting_palate      → multi_line_text
cheersworthy.tasting_finish      → multi_line_text
cheersworthy.distillery_story    → multi_line_text
cheersworthy.badge               → single_line_text  (manual curation)
cheersworthy.gift_ready          → boolean
cheersworthy.beginner_friendly   → boolean
```

See CLAUDE.md for the complete list of 17 metafields with types and sources.

### Metafield Rules
- Define ALL metafield definitions in Shopify Admin before any theme work begins
- Use proper validation and content types — don't store numbers as text
- Never duplicate data (same attribute in both metafield AND tags — pick one)
- Metafields are the single source of truth for all Cheersworthy product attributes
- Use Matrixify for bulk import/export at catalog scale

---

## Theme Implementation

### Theme Decision (Open — To Be Decided in Phase 0)
Current: Dawn v15.2.0 (default). Options under evaluation:
1. **Prestige** — Best aesthetic fit; editorial-first design; strong typography control
2. **Impulse** — Best large-catalog performance; built-in advanced filtering
3. **Symmetry** — Strong product showcase; balanced layout
4. **Dawn** (free, current) — Stay and heavily customize

### Theme Configuration Priorities
1. Load Fraunces (display) + Inter (UI) from Google Fonts — set in theme settings
2. Map color variables: Barrel Paper `#F4EDE3`, Charred Oak `#1A110D`, Aged Parchment `#E5D9CA`, White `#FFFFFF`
3. Set accent variables: Oxblood `#6E2535` (primary CTA), Copper `#A8541F`, Green `#2C5545`, Amber `#C47D1A`
4. Enable OS 2.0 dynamic sources for all `cheersworthy.*` metafields
5. Configure product card hover states
6. Set filter panel: left rail desktop / bottom drawer mobile

### Liquid Metafield Patterns
```liquid
{# Display proof #}
{{ product.metafields.cheersworthy.proof }} proof

{# Conditional badge rendering (one max per card, priority order) #}
{% assign badge = product.metafields.cheersworthy.badge %}
{% if badge == "limited_release" %}
  <span class="badge badge--amber">Limited Release</span>
{% elsif badge == "community_pick" %}
  <span class="badge badge--green">Community Pick</span>
{% elsif badge == "new_arrival" %}
  <span class="badge badge--copper">New Arrival</span>
{% endif %}

{# Flavor Cloud data #}
{% assign flavor_json = product.metafields.cheersworthy.flavor_profile_json %}
{# Parse and render — see Flavor Cloud section below #}
```

### Never Use
- Page builders (Shogun, GemPages, PageFly) — destroy performance and create debt
- Deprecated/vintage theme features
- Inline styles — use CSS variables from theme settings

---

## Approved App Stack

| Category | Solution | Status |
|---|---|---|
| Age Verification | AgeTrust or AgeChecker | To evaluate |
| Reviews | Judge.me (or alternatives) | To evaluate |
| Wishlist + Back-in-Stock | Wishlist Plus or Growave | To evaluate |
| Email/CRM | **TBD** — Klaviyo, Omnisend, Shopify Email, others | Open decision |
| Search & Discovery | Shopify Native first | Configure fully before paid app |
| Loyalty (post-MVP) | Smile.io | Phase 1.5 |

### App Evaluation Questions
Before approving any new app:
1. Does Shopify do this natively?
2. What is the JavaScript payload cost? (Check Lighthouse before/after)
3. Does it have documented Shopify Flow integration?
4. Can it be removed without data loss if we switch?
5. What's the pricing at 10K SKUs and 1K monthly orders?

---

## Search & Discovery Configuration

Configure this BEFORE soft launch — it's a first-day requirement.

### Synonym Groups to Configure
```
sweet → vanilla, caramel, honey, toffee, butterscotch
smoky → smoke, peat, campfire, peaty
spicy → black pepper, cinnamon, rye spice, ginger
smooth → smooth, easy drinking, approachable, beginner-friendly
fruity → fruit, apple, pear, dried fruit, dark fruit, citrus
rich → chocolate, coffee, leather, tobacco, dark fruit
```

### Filters to Enable (In Order)
1. Flavor Profile (from `cheersworthy.top_flavors`)
2. Price Range
3. Whiskey Type (`cheersworthy.whiskey_type`)
4. Proof Range (`cheersworthy.proof`)
5. Age Statement (`cheersworthy.age_statement`)
6. Gift Ready (`cheersworthy.gift_ready`)
7. Beginner Friendly (`cheersworthy.beginner_friendly`)
8. Region (`cheersworthy.region`)

---

## Email/CRM Flows (Required at Launch)

**Note: Email/CRM app is an open decision (Klaviyo, Omnisend, Shopify Email, others). These flows apply regardless of platform chosen.**

| Flow | Trigger | Priority |
|---|---|---|
| Welcome Series | Email signup | P0 — 3 emails: welcome + flavor intro + community intro |
| Abandoned Cart | Cart abandoned 1hr | P0 |
| Back-in-Stock Alert | Stock restored | P0 |
| Post-Purchase | Order confirmed | P1 — 1 email: thank you + "what to try next" |
| Browse Abandonment | PDP view, no add-to-cart | P1 |
| Win-Back | 90 days no purchase | P2 |

### Segments to Create at Launch
- Has purchased (any)
- Has purchased bourbon / rye / scotch / etc. (by type)
- Wishlist active (back-in-stock alert signup)
- Email engaged (opened in last 30 days)
- High-value customer (AOV > $100)

---

## Shopify Flow Automations

```
Trigger: Product back in stock
→ Action: Send back-in-stock flow to tagged customers (via chosen email/CRM app)

Trigger: New order placed
→ Action: Tag customer "has_ordered"
→ Action: If order total > $150, tag "high_value"

Trigger: Product tagged "limited_release" AND inventory < 10
→ Action: Post internal alert to team Slack/email

Trigger: Customer joins email list
→ Action: Enroll in welcome flow (via chosen email/CRM app)

Trigger: Product created
→ Action: Alert catalog team to populate editorial fields
```

---

## Performance Requirements

| Metric | Mobile Target | Desktop Target |
|---|---|---|
| Lighthouse Performance | ≥ 80 | ≥ 90 |
| LCP | < 2.5s | < 1.5s |
| CLS | < 0.1 | < 0.1 |
| TTFB | < 600ms | < 400ms |

### Performance Rules
- All product images: WebP format, max 800KB at 2x resolution
- Lazy load all images below the fold
- Audit app JavaScript quarterly — each app costs
- Never install apps "just to try them" on production

---

## Compliance Requirements

### Age Verification
- DOB entry (not checkbox alone) — required
- App must log verification attempts with timestamp
- Cookie persists verification for 30 days minimum
- State-specific age rules configurable

### Alcohol Shipping
- State eligibility must display on PDP — not hidden until checkout
- Adult signature notice visible on PDP, cart, and order confirmation
- Longhorn handles compliance for fulfillment; Cheersworthy is responsible for display

### Data Privacy
- SSL active at all times
- DOB data stored securely (PII)
- Cookie consent configured for California (CCPA)
- Privacy policy linked in footer

---

## Longhorn Integration Notes

- Longhorn provides inventory feed, order routing, state eligibility, adult signature flags
- Confirm integration method with Longhorn (API vs. native Shopify integration)
- State eligibility data needs to be accessible for PDP trust row display
- Price sync: confirm whether Longhorn controls MSRP or if Cheersworthy sets prices
- Adult signature by state: confirm which states require it and ensure compliance display reflects this

---

## Flavor Cloud Custom Component

### Current State (MVP)
Flavor Clouds are currently static images built in WordArt from Airtable flavor data, manually uploaded to Shopify product pages. The dynamic rendering described below is the future goal.

### Future Architecture (Dynamic Rendering)
The Flavor Cloud will become a custom Shopify section/block that:
1. Reads `cheersworthy.flavor_profile_json` metafield (array of `{note, count, confidence}` objects)
2. Normalizes weights to 5 size tiers
3. Renders as proportional word cloud (organic layout, center-out by weight)
4. Applies Inter font at weights mapped to tiers
5. Accent color (Cask Copper `#A8541F`) on top 1–2 terms
6. Renders responsively down to 280px wide

### Implementation Options
- **React component** rendered via Shopify App Block (cleanest; most maintainable)
- **Vanilla JS + CSS** in theme — works without app overhead; faster
- **Liquid + CSS** — most limited but zero JS; suitable for simple version

Recommended: Vanilla JS rendering in a custom section block. Avoids React bundle overhead on every PDP load.

### Mini Cloud (Product Card Hover)
Reads same `cheersworthy.flavor_profile_json` but renders only top 3–5 terms. Triggered by CSS hover state with 250ms transition. No additional API call needed if metafield is pre-loaded on collection page.
