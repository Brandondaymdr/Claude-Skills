---
name: cheersworthy-wireframe
description: Page wireframing and layout specification skill for Cheersworthy.com. Use this skill whenever wireframing, speccing, or defining the layout and component hierarchy for any Cheersworthy page — PDP, homepage, collection page, gift page, cart, checkout, account, or any other page. ALWAYS read this alongside cheersworthy-design for the visual system. This skill handles structure and layout; cheersworthy-design handles visual language.
---

# Cheersworthy Wireframing Skill

This skill guides page structure, information hierarchy, and component layout decisions for Cheersworthy.com. Always work mobile-first (375px as primary canvas). Desktop is a scale-up from mobile — not the primary design surface.

Always cross-reference CLAUDE.md and the PDF style guide (CLAUDE cheersworthy-style-guide.pdf) in the project repo for the full visual system — colors, typography, spacing, and component specs.

---

## Universal Layout Principles

- **Mobile-first always.** Design at 375px. Scale up to 1440px desktop.
- **One job per section.** Don't combine discovery and purchase in the same visual block.
- **The most important action is always thumb-reachable on mobile.**
- **No rotating carousels, no autoplay.** One thing at a time.
- **Breathing room signals premium.** More whitespace, not less.
- **Labels are navigation.** Section headings must orient, not just label.

---

## Page Priority Order

Design in this order — each page informs the next:

1. **Product Detail Page (PDP)** — Most important; Flavor Cloud and conversion live here
2. **Homepage** — First impression; three-intent navigation model
3. **Collection / Browse** — Discovery engine; filter system
4. **Gift Collection Page** — Second-highest commercial priority
5. **Cart** — Trust + pre-checkout cost transparency
6. **Age Gate** — Required; simple; brand touchpoint
7. **Account Area** — Personal utility dashboard

---

## Page Wireframe Specs

### Product Detail Page (PDP)

**The most important page on the site. Design it first.**

#### Mobile Layout (375px)

```
┌────────────────────────────────────┐
│  ← Back to [Collection]            │  ← Breadcrumb, small, Inter 12px
├────────────────────────────────────┤
│                                    │
│         BOTTLE IMAGE               │  ← Full width, white bg, swipeable
│         (1 of 3)  ● ○ ○            │  ← Dot pagination
│                                    │
├────────────────────────────────────┤
│  Community Pick badge (if applies) │
│  Bottle Name in Fraunces           │  ← H2 size on mobile
│  Whiskey Type · Distillery         │  ← Inter 14px, secondary color
│  $49.99                            │  ← Inter SemiBold 22px
│  86 proof · 12 year · 750mL        │  ← Pill stats row
├────────────────────────────────────┤
│  ╔══════════════════════════════╗  │
│  ║    FLAVOR CLOUD              ║  │  ← ABOVE THE FOLD — ALWAYS
│  ║  vanilla  caramel  oak       ║  │  ← Aged Parchment bg
│  ║    pepper     honey          ║  │
│  ║  cinnamon  dried fruit  char ║  │
│  ╚══════════════════════════════╝  │
│  "Taste is personal — but these    │
│   are the flavors most people      │
│   find in this whiskey."           │  ← Positioning line, Inter 13px
├────────────────────────────────────┤
│  [vanilla] [caramel] [oak] +2 more │  ← Flavor chip tags, scrollable
├────────────────────────────────────┤
│  Ships to Texas                    │  ← Trust row 1: state eligibility
│  Est. $8.99 shipping               │  ← Trust row 2: shipping cost
│  ⚠ Adult signature required        │  ← Trust row 3: compliance notice
├────────────────────────────────────┤
│  [    Add to Your Shelf    ]       │  ← Oxblood button, full width
│  [♡ Save / Back-in-Stock Alert]    │  ← Secondary action, text style
├────────────────────────────────────┤
│  Why This Bottle                   │  ← Fraunces H3 section header
│  [Editorial paragraph...]          │  ← Inter 16px, 75–150 words
├────────────────────────────────────┤
│  Tasting Profile                   │
│  Nose · Palate · Finish tabs       │
├────────────────────────────────────┤
│  About [Distillery]                │
│  [2-3 sentence context]            │
├────────────────────────────────────┤
│  Community Notes (if applicable)   │
├────────────────────────────────────┤
│  You Might Also Like               │
│  [Horizontal scroll of 3–4 cards] │
├────────────────────────────────────┤
│  Shipping & Delivery Details       │  ← Expandable accordion
│  Frequently Asked Questions        │  ← Expandable accordion
└────────────────────────────────────┘
```

#### Desktop Layout Differences
- Left column: product images (sticky) — 55% width
- Right column: all purchase content — 45% width
- Right column scrolls independently while images stay visible
- Flavor Cloud is in the right column, between price row and Add to Cart
- Below fold: full-width sections in order listed above

#### Critical PDP Rules
- **Flavor Cloud is ABOVE the Add to Cart button.** It's a purchase-decision tool.
- **Shipping cost is VISIBLE on PDP** — not revealed at checkout.
- **State eligibility is VISIBLE on PDP** — clear message if not shipping to detected state.
- **Add to Cart is ALWAYS THUMB-REACHABLE** on mobile — sticky on scroll if needed.
- **One primary CTA.** No competing buttons at the same visual weight.

---

### Homepage

#### Mobile Layout (375px)

```
┌────────────────────────────────────┐
│  [Logo]              [Cart] [Acct] │  ← Sticky nav
│  [         🔍 Search             ] │  ← Search always visible
├────────────────────────────────────┤
│                                    │
│  The most trustworthy whiskey      │
│  shop on the internet.             │  ← Fraunces H1, 38–42px
│                                    │
│  [      Find Your Whiskey      ]   │  ← Oxblood button
│  [    Browse the Collection    ]   │  ← Ghost button
│                                    │
├────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐         │
│  │ 🔍       │ │ 🎯       │         │
│  │ I know   │ │ I know   │         │
│  │ what I   │ │ my       │         │
│  │ want     │ │ flavors  │         │
│  └──────────┘ └──────────┘         │
│  ┌──────────────────────────────┐  │
│  │ 🤝 Help me find something    │  │  ← 3rd card full-width or 2-column
│  └──────────────────────────────┘  │
├────────────────────────────────────┤
│  What the Tribe is drinking        │  ← Section header, Fraunces
│  right now                         │
│  [Card] [Card] [Card] →            │  ← Horizontal scroll
├────────────────────────────────────┤
│  Find a whiskey that tastes        │
│  like what you love                │
│  [Sweet] [Smoky] [Spicy] [Fruity]  │  ← Flavor family tap targets
│  [Rich]  [Smooth] [Floral] [Wood]  │
├────────────────────────────────────┤
│  What are you drinking for?        │
│  [Campfire] [Movie Night]          │
│  [Celebration] [Starter Shelf]     │  ← Occasion collection tiles
├────────────────────────────────────┤
│  What just landed                  │
│  [Card] [Card] [Card] →            │
├────────────────────────────────────┤
│  [Trust bar: shipping / age / SSL] │
└────────────────────────────────────┘
```

#### Homepage Rules
- **Search bar visible without scrolling** — not in hamburger menu
- **Three intent cards immediately below hero** — this is the UX core of the site
- **No rotating carousel** on hero or anywhere else
- **Community Picks section first** after intent cards — social proof above fold
- **Flavor family cards are tappable links** — not decorative

---

### Collection / Browse Page

#### Mobile Layout (375px)

```
┌────────────────────────────────────┐
│  [Sticky nav + search]             │
├────────────────────────────────────┤
│  [Collection Name in Fraunces]     │
│  [1-sentence editorial intro]      │
│  132 bottles                       │  ← Result count
├────────────────────────────────────┤
│  [Sort: Community Picks ▼]  [Filter ≡] │  ← Always visible, sticky
│  [vanilla] [bourbon] [under $50] ✕ │  ← Active filter chips
├────────────────────────────────────┤
│  ┌────────┐ ┌────────┐             │
│  │        │ │        │             │  ← 2-column grid mobile
│  │ IMAGE  │ │ IMAGE  │             │
│  │        │ │        │             │
│  │ Name   │ │ Name   │             │
│  │ Type   │ │ Type   │             │
│  │ $49.99 │ │ $34.99 │             │
│  │vanilla │ │ smoky  │             │
│  │caramel │ │  peat  │             │
│  └────────┘ └────────┘             │
│  [Load more] or [infinite scroll]  │
└────────────────────────────────────┘
```

#### Filter Drawer (Mobile — Bottom Sheet)
```
┌────────────────────────────────────┐
│  Filters                    [Done] │
│  ─────────────────────────────────│
│  Flavor Profile                    │
│  [Sweet ✓] [Smoky] [Spicy] [Fruity]│
│  [Rich] [Smooth] [Floral] [Wood]   │
│  ─────────────────────────────────│
│  Price Range                       │
│  $[20]────────────────[$200]       │
│  ─────────────────────────────────│
│  Whiskey Type                      │
│  ☑ Bourbon  ☐ Rye  ☐ Scotch        │
│  ─────────────────────────────────│
│  [Clear All]         [Show 47]     │
└────────────────────────────────────┘
```

#### Collection Page Rules
- **Sort default:** Community Picks first
- **Active filters visible as chips** above the grid — each removable with ×
- **Result count always visible** — helps orient in large catalog
- **Filter button always visible** — sticky with sort control
- **Product cards 2-col mobile / 4-col desktop**
- **Load more** preferred over infinite scroll (better for back-navigation)

---

### Gift Collection Page

#### Mobile Layout (375px)

```
┌────────────────────────────────────┐
│  [Sticky nav]                      │
├────────────────────────────────────┤
│  A bottle they'll actually         │  ← Fraunces H1
│  want to open.                     │
│  Free shipping on orders over $75  │  ← Trust line
│  Estimated delivery: Dec 22–24     │  ← If seasonal
├────────────────────────────────────┤
│  ─────── For the enthusiast ─────  │  ← Section divider with label
│  "If they talk about whiskey a lot,│
│   they probably don't have this."  │  ← 1-sentence gifter framing
│  [Card] [Card]  →  See all         │
├────────────────────────────────────┤
│  ── Just getting into whiskey ──   │
│  "Easy to love, safe to choose."   │
│  [Card] [Card]  →  See all         │
├────────────────────────────────────┤
│  ─────── For the bourbon lover ──  │
│  [Card] [Card]  →  See all         │
├────────────────────────────────────┤
│  ─── When you have no idea ──────  │
│  "These are the crowd-pleasers.    │
│   Universally liked. Hard to       │
│   wrong-choose."                   │
│  [Card] [Card]  →  See all         │
└────────────────────────────────────┘
```

#### Gift Page Rules
- **Structure by recipient type** — not by whiskey category
- **Gifter-first copy** — "they'll love it," not "you'll taste vanilla"
- **Delivery date visible at top of page** — the #1 gift-buyer anxiety
- **Gift Ready badge explanation near top** — what it means, why it matters
- **Cards show Gift Ready badge prominently** if applicable

---

### Cart

#### Mobile Layout (375px)

```
┌────────────────────────────────────┐
│  Your Cart (2 items)               │  ← Fraunces H2
├────────────────────────────────────┤
│  ┌──────────────────────────────┐  │
│  │ [img] Elijah Craig 12yr      │  │
│  │        Bourbon · 750mL       │  │
│  │        $49.99          [- 1 +]│  │
│  │        [Remove]              │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ [img] Redbreast 12           │  │
│  │        Irish Whiskey · 750mL │  │
│  │        $59.99          [- 1 +]│  │
│  └──────────────────────────────┘  │
├────────────────────────────────────┤
│  Add $15.01 for free shipping →   │  ← Progress bar if near threshold
├────────────────────────────────────┤
│  Subtotal              $109.98     │
│  Estimated shipping    $8.99       │  ← Visible BEFORE checkout
│  Adult signature fee   $5.95       │  ← Visible if applicable
│  ─────────────────────────────────│
│  Estimated total       $124.92     │
├────────────────────────────────────┤
│  ⚠ Adult signature required on    │  ← Compliance notice
│  delivery. Someone 21+ must be    │
│  home to receive this order.      │
├────────────────────────────────────┤
│  [       Checkout →       ]        │  ← Oxblood, full width
│  [  Continue Shopping  ]           │  ← Ghost button
│  [   🍎    💳    ♟    ]            │  ← Apple Pay / Google Pay / Shop Pay
└────────────────────────────────────┘
```

#### Cart Rules
- **Full cost breakdown visible in cart** — no surprises at checkout
- **Adult signature notice in cart** if any item requires it
- **Guest checkout is the primary path** — no "create account" push here
- **Accelerated payment options** (Apple Pay etc.) visible immediately
- **Free shipping progress bar** if within $20 of threshold

---

### Age Gate

```
┌────────────────────────────────────┐
│                                    │
│         [Cheersworthy Logo]        │
│                                    │
│   You must be 21 or older to       │
│   enter this site.                 │  ← Simple, no personality
│                                    │
│   What's your date of birth?       │
│                                    │
│   [Month ▼] [Day ▼] [Year ▼]       │  ← Or single date input
│                                    │
│   [       Enter Site       ]       │  ← Oxblood button
│                                    │
│   By entering, you confirm you     │
│   are 21 years of age or older     │
│   and agree to our Terms of Use.   │  ← Small legal text
│                                    │
└────────────────────────────────────┘
```

#### Age Gate Rules
- **Full-screen overlay** before any content is visible
- **DOB entry required** — not a checkbox alone (compliance)
- **Mobile-friendly** — large input targets, no pinch-zoom
- **Zero personality** — this is a legal surface, not a brand moment
- **Cookie persistence** — 30 days minimum; don't re-gate returning users
- **Background:** Barrel Paper with logo — branded but simple

---

### Account Area

#### Mobile Layout (375px)

```
┌────────────────────────────────────┐
│  Welcome back, [Name]              │  ← Fraunces H2 (warm)
├────────────────────────────────────┤
│  Recent Orders                     │
│  ┌──────────────────────────────┐  │
│  │ Order #1042 · Feb 28         │  │
│  │ Redbreast 12 · Delivered ✓   │  │
│  │ [View Order]  [Order Again]  │  │
│  └──────────────────────────────┘  │
├────────────────────────────────────┤
│  Saved Bottles                     │
│  [Card] [Card] [Card] →            │
├────────────────────────────────────┤
│  Back-in-Stock Alerts              │
│  ┌──────────────────────────────┐  │
│  │ Blanton's Original           │  │
│  │ Alerting you when back →     │  │
│  └──────────────────────────────┘  │
├────────────────────────────────────┤
│  Recently Viewed                   │
│  [Card] [Card] [Card] →            │
├────────────────────────────────────┤
│  Your Flavor Profile               │  ← Placeholder at MVP
│  [Take the quiz to build yours]    │  ← Seeds the post-MVP quiz
│  Coming soon...                    │
└────────────────────────────────────┘
```

#### Account Rules
- **Personal and warm** — notebook aesthetic, not corporate portal
- **Reorder is prominent** — repeat purchase is a KPI
- **Flavor Profile section exists at MVP** as placeholder — it primes the quiz
- **Saved bottles and alerts on the same page** — utility first

---

## Wireframe Output Format

When producing a wireframe for review, include:

1. **Mobile layout first** (375px canvas)
2. **Desktop notes** — what changes, not a full redraw (unless significantly different)
3. **Component inventory** — list all components needed (so dev can scope)
4. **Content notes** — placeholder text type and source (editorial vs. dynamic metafield)
5. **Interaction notes** — hover states, tap behaviors, drawer triggers
6. **Open questions** — anything that requires a decision before build

Wireframes can be ASCII (for quick reference), HTML prototypes, or annotated visual mockups depending on the fidelity level needed.
