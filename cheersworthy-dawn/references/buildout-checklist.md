# Cheersworthy Dawn Buildout Checklist

Prioritized task sequence organized by phase. Each phase has prerequisites from the previous phase. Work top to bottom within each phase.

## Phase 0: Foundation (Do First — Everything Depends on This)

These are configuration tasks, not code. All done in the Shopify admin and theme editor.

| # | Task | Where | Dependencies | Notes |
|---|---|---|---|---|
| 0.1 | Define all metafield definitions | Settings → Custom data → Products | None | See cheersworthy-shopify for the full list of 17 metafields. Do this BEFORE any theme work. |
| 0.2 | Set up color schemes (3 schemes) | Theme editor → Theme settings → Colors | None | Light (Barrel Paper), Dark (Charred Oak), Parchment (Aged Parchment). See dawn-css-system.md. |
| 0.3 | Set typography (Fraunces + Inter) | Theme editor → Theme settings → Typography | None | Heading: Fraunces. Body: Inter. |
| 0.4 | Set layout width to 1440px | Theme editor → Theme settings → Layout | None | Dawn default is 1200px — increase it. |
| 0.5 | Set button style (4px radius) | Theme editor → Theme settings → Buttons | None | |
| 0.6 | Upload Cheersworthy logo | Theme editor → Theme settings → Logo | Need final logo file | Replace WhiskeyTribe logo currently on site. |
| 0.7 | Create navigation menus | Shopify Admin → Navigation | 0.6 | Main menu: Home, Browse, Gifts, About. Footer menu: Shipping, Privacy, Refund, Contact. |
| 0.8 | Configure header section | Theme editor → Header | 0.6, 0.7 | Sticky header on, search visible, color scheme 2 (Dark). |
| 0.9 | Configure footer section | Theme editor → Footer | 0.7 | Newsletter signup, social links, policy links, payment badges. Color scheme 2 (Dark). |
| 0.10 | Create collection structure | Shopify Admin → Products → Collections | 0.1 | At minimum: All, Bourbon, Rye, Scotch, Irish, Community Picks, New Arrivals, Gifts. |
| 0.11 | Configure Search & Discovery | Search & Discovery app | 0.1, 0.10 | Synonyms, filters, product boost rules. See cheersworthy-shopify. |

**Phase 0 checkpoint:** Site should have brand colors, typography, logo, navigation, and collections — even if pages are empty.

---

## Phase 1: Core Pages (The Store Starts Working)

### 1A. Age Gate (First — Legal Requirement)

| # | Task | Where | Dependencies | Notes |
|---|---|---|---|---|
| 1A.1 | Create age-verification.liquid snippet | Code editor → Snippets | Phase 0 | See custom-sections-patterns.md for full template. |
| 1A.2 | Create age-verification.js | Code editor → Assets | 1A.1 | Cookie-based DOB verification. |
| 1A.3 | Create age-verification.css | Code editor → Assets | 1A.1 | Full-screen overlay styles. |
| 1A.4 | Insert render tag in theme.liquid | Code editor → Layout | 1A.1–1A.3 | `{% render 'age-verification' %}` after `<body>`, skip on policy pages. |
| 1A.5 | Test age gate | Browser | 1A.4 | Verify: blocks content, DOB validation works, cookie persists, policy pages accessible. |

### 1B. Product Detail Page (Most Important Page)

| # | Task | Where | Dependencies | Notes |
|---|---|---|---|---|
| 1B.1 | Configure main-product blocks | Theme editor → Product template | Phase 0 | Add blocks in wireframe order (badge → name → type → price → pills → flavor cloud → trust → buy). |
| 1B.2 | Create badge Custom Liquid block | Theme editor → Product → Custom Liquid | 0.1 | See custom-sections-patterns.md. Reads `cheersworthy.badge` metafield. |
| 1B.3 | Create pill stats Custom Liquid block | Theme editor → Product → Custom Liquid | 0.1 | Proof · Age · Volume pills. Reads `cheersworthy.proof` and `cheersworthy.age_statement`. |
| 1B.4 | Create Flavor Cloud component | Code editor → Assets + Theme editor | 0.1 | CSS + JS files in assets, Custom Liquid block in theme editor. See custom-sections-patterns.md. |
| 1B.5 | Create trust row Custom Liquid block | Theme editor → Product → Custom Liquid | None | Shipping, cost, adult signature notice. Static for now — dynamic state detection in Phase 2. |
| 1B.6 | Connect metafields via dynamic sources | Theme editor → Product | 0.1 | For each text block: click database icon → select cheersworthy.* metafield. |
| 1B.7 | Add collapsible rows | Theme editor → Product template | 0.1 | "Why This Bottle", Tasting Notes (Nose/Palate/Finish), Shipping Info, FAQ. |
| 1B.8 | Configure related products section | Theme editor → Product template | 0.11 | "You Might Also Like" — 4 products. Powered by Search & Discovery. |
| 1B.9 | Create custom-cheersworthy.css | Code editor → Assets | Phase 0 | Brand overrides, badge styles, pill styles, card enhancements. See dawn-css-system.md. |
| 1B.10 | Test PDP on mobile and desktop | Browser | 1B.1–1B.9 | Check wireframe compliance. Flavor Cloud above Add to Cart. All metafields displaying. |

### 1C. Homepage

| # | Task | Where | Dependencies | Notes |
|---|---|---|---|---|
| 1C.1 | Configure image-banner hero | Theme editor → Home | Phase 0 | Premium spirits image, heading, two CTAs. See dawn-sections-inventory.md. |
| 1C.2 | Configure multicolumn intent cards | Theme editor → Home | Phase 0 | Three cards: "I know what I want" / "I know my flavors" / "Help me find something." |
| 1C.3 | Add featured-collection: Community Picks | Theme editor → Home | 0.10 | "What the Tribe is drinking right now." |
| 1C.4 | Create Flavor Discovery section | Code editor → Sections | Phase 0 | Custom section. See custom-sections-patterns.md. 8 flavor family cards. |
| 1C.5 | Add collection-list: Occasions | Theme editor → Home | 0.10 | "What are you drinking for?" — Campfire, Movie Night, Celebration, Starter Shelf. |
| 1C.6 | Add featured-collection: New Arrivals | Theme editor → Home | 0.10 | "What just landed." |
| 1C.7 | Add trust bar section | Theme editor → Home | None | Rich-text with shipping, age verification, secure checkout trust signals. |
| 1C.8 | Configure announcement bar | Theme editor → Header group | None | Free shipping threshold message. |
| 1C.9 | Test homepage on mobile and desktop | Browser | 1C.1–1C.8 | Check wireframe compliance, no rotating carousels, search visible. |

### 1D. Collection / Browse Page

| # | Task | Where | Dependencies | Notes |
|---|---|---|---|---|
| 1D.1 | Configure collection-product-grid | Theme editor → Collection template | 0.11 | 4 cols desktop, 2 cols mobile. Filtering enabled. Drawer layout on mobile. |
| 1D.2 | Configure collection-banner | Theme editor → Collection template | 0.10 | Show collection title + editorial description. |
| 1D.3 | Add editorial descriptions to collections | Shopify Admin → Collections | cheersworthy-content | Use cheersworthy-content skill for proper brand voice. |
| 1D.4 | Configure sort defaults | Search & Discovery | 0.11 | Default sort: "Community Picks" (requires a sort weight — could use manual sort order). |
| 1D.5 | Test filtering and browsing | Browser | 1D.1–1D.4 | All filters working, active chips visible, result count shown. |

---

## Phase 2: Enhancement Pages (Store Gets Polished)

| # | Task | Where | Dependencies | Notes |
|---|---|---|---|---|
| 2.1 | Build Gift collection template | Theme editor + Code editor | Phase 1 | Custom template `collection.gift.json` with recipient-based sections. See cheersworthy-wireframe. |
| 2.2 | Configure cart page | Theme editor → Cart template | Phase 1 | Cost breakdown, compliance notice, accelerated checkout. |
| 2.3 | Add free shipping progress bar to cart | Code editor | 2.2 | Custom Liquid in cart — shows progress toward free shipping threshold. |
| 2.4 | Install and configure age verification app | Shopify Admin → Apps | Phase 1 | AgeTrust or AgeChecker — evaluate and install. May replace custom age gate from 1A. |
| 2.5 | Install and configure reviews app | Shopify Admin → Apps | 1B | Judge.me — add review widget to PDP. |
| 2.6 | Install and configure wishlist app | Shopify Admin → Apps | 1B | Wishlist Plus or Growave — "Save" / "Alert Me When It's Back" on PDP. |
| 2.7 | Build About page | Theme editor → Pages | Phase 0 | Brand story using image-with-text and rich-text sections. |
| 2.8 | Build FAQ page | Theme editor → Pages | Phase 0 | Collapsible-content section with common questions. |
| 2.9 | Configure email signup banner | Theme editor → Homepage or Footer | Phase 0 | "Get the first pour" — newsletter capture. |
| 2.10 | Write editorial content for top 50 bottles | Shopify Admin → Products | 1B | "Why This Bottle" + tasting notes. Use cheersworthy-content skill. |

---

## Phase 3: Polish & Launch Prep

| # | Task | Where | Dependencies | Notes |
|---|---|---|---|---|
| 3.1 | Mobile QA pass | Browser (375px) | All Phase 1–2 | Every page, every interaction. Thumb-reachable CTAs, no horizontal scroll, images loading. |
| 3.2 | Desktop QA pass | Browser (1440px) | All Phase 1–2 | Layouts, hover states, sticky header behavior. |
| 3.3 | Lighthouse audit | Chrome DevTools | All phases | Mobile target: ≥80. Desktop target: ≥90. See cheersworthy-shopify for full targets. |
| 3.4 | Fix performance issues | Code editor | 3.3 | Image optimization, lazy loading, CSS/JS audit. |
| 3.5 | SEO check | Browser + Search Console | All phases | Meta titles, descriptions, structured data, canonical URLs. |
| 3.6 | Accessibility audit | Browser + aXe/Lighthouse | All phases | Focus states, alt text, color contrast (especially on dark scheme), screen reader flow. |
| 3.7 | Set up email/CRM flows | Email platform | Phase 2 apps | Welcome, abandoned cart, back-in-stock. See cheersworthy-shopify. |
| 3.8 | Configure Shopify Flow automations | Shopify Admin → Flow | Phase 2 | Customer tagging, low-stock alerts. See cheersworthy-shopify. |
| 3.9 | Test checkout end-to-end | Browser | All phases | Place test order. Verify age gate → browse → PDP → cart → checkout → confirmation flow. |
| 3.10 | Remove password protection | Shopify Admin → Preferences | 3.9 | Go live. |

---

## Ongoing (Post-Launch)

| Task | Cadence |
|---|---|
| Populate "Why This Bottle" for new arrivals | Within 1 week of listing |
| Update Community Picks collection | Monthly |
| Audit app JavaScript payload | Quarterly |
| Review and optimize Search & Discovery | Monthly (check search analytics) |
| Lighthouse performance check | Monthly |
| Update metafield data for new products | As products are added |
