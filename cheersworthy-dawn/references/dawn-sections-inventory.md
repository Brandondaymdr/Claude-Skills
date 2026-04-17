# Dawn Sections Inventory for Cheersworthy

Complete inventory of Dawn v15.x sections, organized by function. For each section: what it does, which Cheersworthy page uses it, and the key settings to configure.

## Table of Contents

1. [Header & Navigation](#header--navigation)
2. [Hero & Banner Sections](#hero--banner-sections)
3. [Product Display](#product-display)
4. [Collection & Browse](#collection--browse)
5. [Content & Editorial](#content--editorial)
6. [Forms & Communication](#forms--communication)
7. [Blog](#blog)
8. [Cart](#cart)
9. [Account & Auth](#account--auth)
10. [Utility Sections](#utility-sections)

---

## Header & Navigation

### header.liquid + header-group.json

**What it does:** Site header with logo, navigation, search, cart icon, and account link. Configured as a "section group" that persists across all pages.

**Cheersworthy configuration:**
- Logo: Upload Cheersworthy wordmark (not the WhiskeyTribe logo that's currently there)
- Logo width: 120–150px (desktop), scales down on mobile
- Menu: Create a primary navigation with: Home, Browse (→ /collections/all), Gifts (→ /collections/gifts), About
- Enable sticky header: Yes (keeps nav accessible while scrolling)
- Show search: Yes — search must be visible without scrolling (per wireframe)
- Color scheme: Scheme 2 (Dark) for the premium feel

**Settings to set in theme editor:**
```
Logo image:           [Upload Cheersworthy logo]
Logo width:           130
Menu:                 Main menu (create in Navigation admin)
Enable sticky header: ✓
Show line separator:  ✗ (cleaner look)
Color scheme:         Scheme 2 (Dark)
```

### announcement-bar.liquid

**What it does:** Thin banner above the header for promotions, shipping info, or alerts.

**Cheersworthy use:** "Free shipping on orders over $75" or "Ships to [X] states"

**Settings:**
```
Text:            "Free shipping on orders over $75 · Adult signature required"
Color scheme:    Scheme 2 (Dark) or custom accent
Link:            /pages/shipping-info
```

---

## Hero & Banner Sections

### image-banner.liquid

**What it does:** Full-width hero image with overlay text and buttons. Dawn's primary hero section.

**Cheersworthy Homepage Hero configuration:**
```
Image:                [Premium spirits lifestyle image — NOT the barrel/bottles image currently there]
Desktop height:       Medium (550px)
Mobile height:        Medium
Show overlay:         ✓
Overlay opacity:      30%
Desktop content position: Middle center
Heading:              "The most trustworthy whiskey shop on the internet."
Heading size:         Large
Description:          (leave empty — heading is enough)
Button label 1:       "Find Your Whiskey"
Button link 1:        /collections/all (or future quiz URL)
Button style 1:       Solid (Oxblood via color scheme)
Button label 2:       "Browse the Collection"
Button link 2:        /collections/all
Button style 2:       Outline
Color scheme:         Scheme 2 (Dark)
```

**Important:** Do NOT use the autoplay or slideshow features. The wireframe explicitly says "No rotating carousels, no autoplay."

### image-with-text.liquid

**What it does:** Side-by-side image + text block. Good for storytelling sections.

**Cheersworthy use:** Could be used for "About Cheersworthy" section on homepage or a brand story page. Also useful for the "About [Distillery]" section on PDP if not using rich-text.

**Settings to configure:**
```
Image:            [Brand image or distillery photo]
Heading:          [Section heading in Fraunces]
Content:          [Body text in Inter]
Button label:     [Optional CTA]
Desktop image placement: Left or Right (alternate for visual rhythm)
Desktop content position: Center
Color scheme:     Scheme 3 (Parchment) for editorial feel
```

---

## Product Display

### main-product.liquid

**What it does:** The primary product detail section. This is the most complex section in Dawn — it uses a block-based system where you add, remove, and reorder blocks to compose the product page.

**This is the most important section for Cheersworthy.**

**Native blocks available in main-product:**
| Block | Use for Cheersworthy | Notes |
|---|---|---|
| Text | Subtitle, type/distillery line | Dynamic source: `cheersworthy.whiskey_type` |
| Price | Price display | Standard — no changes needed |
| Variant picker | Bottle size selection (if applicable) | Usually just 750mL |
| Quantity selector | Quantity input | Standard |
| Buy buttons | Add to Cart + dynamic checkout | Label: "Add to Your Shelf" |
| Description | Product description | Standard |
| Collapsible row | Shipping info, FAQ accordions | Add multiple for different topics |
| Share | Social share buttons | Optional — lower priority |
| Custom Liquid | **Flavor Cloud, trust row, badges** | This is how you inject custom blocks |
| Rating | Star rating from reviews app | Requires Judge.me or similar |
| Complementary products | "You might also like" | Configure in Search & Discovery |
| SKU | SKU display | Optional |

**Recommended block order for Cheersworthy PDP (top to bottom):**
1. Custom Liquid → Badge (Community Pick, Limited Release, etc.)
2. Text → Product name (automatic from product title)
3. Text → Type · Distillery line (dynamic source: metafields)
4. Price
5. Text → Proof · Age · Size pill row (dynamic source: metafields)
6. Custom Liquid → Flavor Cloud
7. Custom Liquid → Flavor chip tags
8. Custom Liquid → Trust row (shipping state, cost, adult signature)
9. Buy buttons (label: "Add to Your Shelf")
10. Collapsible row → "Why This Bottle" (dynamic source: `cheersworthy.why_this_bottle`)
11. Collapsible row → Tasting Notes (Nose/Palate/Finish)
12. Collapsible row → About the Distillery
13. Collapsible row → Shipping & Delivery
14. Share

**Theme editor settings:**
```
Media:
  Desktop layout:            Stacked (or Thumbnails for multiple images)
  Mobile layout:             Thumbnails
  Hide variants unavailable: ✓
  Enable video looping:      ✗

Product information:
  [Add blocks in order above]

Color scheme:                Scheme 1 (Light)
Padding top:                 36
Padding bottom:              36
```

### featured-product.liquid

**What it does:** Displays a single product as a standalone section (not inside a product template). Useful for homepage "featured bottle" or landing pages.

**Cheersworthy use:** Could feature "Bottle of the Week" on homepage, but the wireframe doesn't currently call for this. Keep in reserve.

### related-products.liquid

**What it does:** Shows related/complementary products below the main product section.

**Cheersworthy PDP configuration:**
```
Heading:             "You Might Also Like"
Heading size:        Medium
Max products to show: 4
Products per row:    4 (desktop) — Dawn handles responsive
Color scheme:        Scheme 1 (Light)
```

**Note:** Related products are powered by Shopify's Search & Discovery app. Configure product recommendations there — not in the theme.

---

## Collection & Browse

### main-collection-banner.liquid

**What it does:** Banner at the top of collection pages with collection title, description, and optional image.

**Cheersworthy configuration:**
```
Show collection description: ✓
Show collection image:       ✓ (if collection has a curated image)
Color scheme:                Scheme 1 (Light)
```

The collection description should use the editorial intros from cheersworthy-content (e.g., "The bottles our community reaches for when they want something they know they'll love.").

### main-collection-product-grid.liquid

**What it does:** The product grid with filtering and sorting. This is the workhorse of the collection page.

**Cheersworthy configuration:**
```
Products per page:        24
Columns desktop:          4
Columns mobile:           2
Image ratio:              Adapt to image (or Portrait for consistent bottle layout)
Show secondary image:     ✓ (on hover)
Show vendor:              ✗
Show rating:              ✓ (if Judge.me installed)
Enable filtering:         ✓
Enable sorting:           ✓
Filter layout:            Drawer (mobile bottom sheet, per wireframe)
Desktop filter layout:    Sidebar (left rail per wireframe)
Collapse filter groups:   ✗ (keep open for discoverability)
Enable color swatches:    ✗ (not relevant for spirits)
```

**Filter configuration** happens in the Search & Discovery app (see cheersworthy-shopify for the filter list and order).

### collection-list.liquid

**What it does:** Grid of collection cards with images. Links to different collections.

**Cheersworthy Homepage use:** "What are you drinking for?" occasion collection tiles.

```
Heading:          "What are you drinking for?"
Heading size:     Medium
Image ratio:      Square
Columns desktop:  4
Columns mobile:   2
Color scheme:     Scheme 1 (Light)

Blocks (each is a collection):
  - Campfire Collection
  - Movie Night Collection
  - Celebration Collection
  - The Starter Shelf Collection
```

### main-list-collections.liquid

**What it does:** Full-page listing of all collections. Used on the /collections page.

**Configuration:** Standard — list all active collections with images.

---

## Content & Editorial

### rich-text.liquid

**What it does:** Simple text section with heading and body. Extremely versatile.

**Cheersworthy uses:**
- "Why This Bottle" as a standalone section below the product (if not using collapsible row)
- Trust bar on homepage ("21+ · Free shipping over $75 · Secure checkout")
- Any editorial text block that needs a dedicated section

```
Heading:       [Section heading]
Heading size:  Medium
Text:          [Body copy — can use dynamic sources]
Color scheme:  Scheme 3 (Parchment) for editorial, Scheme 1 (Light) for trust bars
Desktop text alignment: Center (for trust bar) or Left (for editorial)
Full width:    ✗
```

### multicolumn.liquid

**What it does:** Multiple columns with icon/image, heading, and text. Dawn's most flexible grid section.

**Cheersworthy Homepage use:** Three Intent Cards ("I know what I want" / "I know my flavors" / "Help me find something").

```
Heading:           (leave empty — the cards speak for themselves)
Image width:       Medium
Image ratio:       Square
Columns desktop:   3
Columns mobile:    1
Column alignment:  Center
Background:        ✓ (card style with subtle background)
Color scheme:      Scheme 1 (Light)

Block 1:
  Image:    [Search icon illustration]
  Heading:  "I know what I want"
  Text:     "Search for a specific bottle or browse the full collection."
  Link:     /collections/all

Block 2:
  Image:    [Flavor wheel illustration]
  Heading:  "I know my flavors"
  Text:     "Find bottles that match the flavors you love."
  Link:     /pages/flavor-discovery (or /collections/all?filter=...)

Block 3:
  Image:    [Handshake illustration]
  Heading:  "Help me find something"
  Text:     "Tell us what you like and we'll point you in the right direction."
  Link:     /pages/quiz (or /collections/community-picks)
```

### collage.liquid

**What it does:** Asymmetric grid layout mixing images, products, and collections. Visually interesting.

**Cheersworthy use:** Optional — could work for a brand story section or editorial feature. Not in the current wireframes, but available for future use.

### multirow.liquid

**What it does:** Alternating rows of image + text. Good for feature lists or step-by-step content.

**Cheersworthy use:** Could work for "How Cheersworthy Works" or "Why Shop With Us" education section.

### collapsible-content.liquid

**What it does:** Accordion-style collapsible rows. Used for FAQ, shipping info, return policies.

**Cheersworthy PDP use:** Tasting notes (Nose/Palate/Finish as separate rows), shipping info, FAQ.

**Cheersworthy Homepage/Page use:** FAQ section.

```
Heading:        "Frequently Asked Questions"
Heading size:   Medium
Row icon:       Plus
Color scheme:   Scheme 1 (Light)

Blocks (each is a collapsible row):
  - "How does shipping work for alcohol?"
  - "Which states can you ship to?"
  - "What is the Flavor Cloud?"
  - "How do I return a bottle?"
```

### custom-liquid.liquid

**What it does:** A section that renders arbitrary Liquid code. Your escape hatch for anything Dawn can't do natively.

**Cheersworthy use:** Any one-off custom section that doesn't warrant its own section file. Use sparingly — proper custom sections are better for reusable components.

### video.liquid

**What it does:** Embeds a video (YouTube, Vimeo, or Shopify-hosted).

**Cheersworthy use:** Brand video or distillery tour on About page. Not in MVP wireframes.

---

## Forms & Communication

### contact-form.liquid

**What it does:** Standard contact form (name, email, phone, message).

**Cheersworthy /pages/contact:** Use as-is with minimal customization.

### email-signup-banner.liquid

**What it does:** Email capture with heading, description, and signup form.

**Cheersworthy use:** Newsletter signup — could appear above footer on homepage.

```
Heading:      "Get the first pour"
Description:  "New arrivals, community picks, and bottles you won't see anywhere else."
Color scheme: Scheme 2 (Dark)
Full width:   ✓
```

### newsletter.liquid

**What it does:** Simpler email signup section (less visual than email-signup-banner).

**Cheersworthy use:** Footer email capture (already part of footer-group.json in Dawn).

### predictive-search.liquid

**What it does:** Live search results as the user types. Configured in header but renders via this section.

**Configuration:** Enable — it works out of the box. Search & Discovery app enhances results.

---

## Cart

### main-cart-items.liquid

**What it does:** The cart line items list with quantity adjusters and remove buttons.

**Cheersworthy customization needed:**
- Add adult signature notice when applicable
- Add free shipping progress bar (custom Liquid injection)

### main-cart-footer.liquid

**What it does:** Cart totals, notes, checkout button, and accelerated payment buttons.

**Cheersworthy configuration:**
- Ensure "Estimated shipping" displays (Shopify calculates based on shipping zones)
- Enable accelerated checkout buttons (Apple Pay, Google Pay, Shop Pay)
- Cart notes: Enable (customers may want to add gift messages)

### cart-drawer.liquid

**What it does:** Slide-out cart drawer that appears when adding to cart (alternative to dedicated cart page).

**Cheersworthy recommendation:** Use the cart drawer for quick add-to-cart interactions, but keep the full cart page as the pre-checkout review step. The wireframe's cost breakdown and compliance notices work better on a full page.

### cart-icon-bubble.liquid / cart-notification-*.liquid

**What it does:** Cart icon badge (item count) and add-to-cart notification popups.

**Configuration:** Standard — enable notification on add-to-cart for feedback.

---

## Account & Auth

Dawn's account sections are straightforward and don't need heavy customization for MVP:

- `main-account.liquid` — Order history and account details
- `main-login.liquid` — Login form
- `main-register.liquid` — Registration form
- `main-addresses.liquid` — Saved shipping addresses
- `main-activate-account.liquid` — Account activation
- `main-reset-password.liquid` — Password reset

**Cheersworthy note:** The wireframe specifies a warm, personal account area ("Welcome back, [Name]"). This requires minor Liquid customization to `main-account.liquid` — adding the customer name greeting and reorder CTAs.

---

## Utility Sections

### main-404.liquid

**What it does:** 404 error page.

**Cheersworthy customization:** Add brand voice: "This bottle must have walked off the shelf. Try searching for what you're looking for, or head back to the collection."

### main-page.liquid / page.liquid

**What it does:** Generic content page (About, FAQ, shipping info, etc.).

**Configuration:** Standard. Use rich-text blocks within the page template for structured content.

### main-search.liquid

**What it does:** Search results page.

**Configuration:** Standard. Search & Discovery app handles relevance.

### main-password-header.liquid / main-password-footer.liquid

**What it does:** Password page shown when store is in development/password-protected mode.

**Cheersworthy:** Configure with brand colors and "Coming soon" messaging if needed pre-launch.

### apps.liquid

**What it does:** Container section for app blocks (Judge.me reviews, Wishlist Plus, etc.). App developers use this to inject their UI.

**Configuration:** Apps self-register their blocks here. No manual configuration needed.

---

## Section Group Files

### header-group.json / footer-group.json

These are special "section groups" — collections of sections that appear on every page. You edit them in the theme editor by clicking on the header or footer area.

**Header group** typically contains:
- announcement-bar
- header

**Footer group** typically contains:
- footer (with newsletter signup, navigation links, social icons, payment badges)

Configure these once — they propagate across all pages automatically.
