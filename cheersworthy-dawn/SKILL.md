---
name: cheersworthy-dawn
description: "Dawn theme buildout and configuration skill for Cheersworthy.com. Use this skill whenever working on the Cheersworthy Shopify store's Dawn theme — configuring sections in the theme editor, customizing CSS, creating custom Liquid sections, mapping wireframes to Dawn components, or executing any part of the store buildout. Trigger on: Dawn theme, theme editor, theme customizer, section configuration, Dawn sections, Dawn CSS, Dawn settings, store buildout, homepage build, PDP build, collection page build, header/footer setup, age gate implementation, or any task that involves configuring or customizing the Dawn theme for Cheersworthy. Even if the user just says 'set up the homepage' or 'configure the product page' — if it's about the Cheersworthy store, use this skill. ALWAYS use alongside cheersworthy-wireframe (for layout specs) and cheersworthy-content (for copy). For metafield architecture and app decisions, also read cheersworthy-shopify."
---

# Cheersworthy Dawn Theme Buildout

This skill is the operational execution guide for building out Cheersworthy.com on Shopify's Dawn theme (v15.x). It bridges the gap between the wireframe specs (cheersworthy-wireframe), the content strategy (cheersworthy-content), and the platform decisions (cheersworthy-shopify) — telling you exactly how to implement each piece inside Dawn.

## How This Skill Relates to Others

Think of it this way: the other Cheersworthy skills define *what* to build. This skill defines *how to build it in Dawn*.

- **cheersworthy-wireframe** → Page layouts and component hierarchy (the blueprint)
- **cheersworthy-content** → Brand voice, copy, and editorial formats (the words)
- **cheersworthy-shopify** → Metafields, apps, flows, compliance (the platform layer)
- **shopify-storefront** → Liquid fundamentals, schema patterns, dev workflow (the language)
- **This skill** → Dawn section configuration, CSS overrides, custom sections, theme editor settings, buildout sequence (the execution)

Always read cheersworthy-wireframe alongside this skill when building any page. Read cheersworthy-content when writing any copy that goes into theme settings.

## Before You Start Any Task

1. Identify which page or component is being built
2. Check `references/buildout-checklist.md` for dependencies and sequence
3. Look up the relevant Dawn sections in `references/dawn-sections-inventory.md`
4. If CSS customization is needed, reference `references/dawn-css-system.md`
5. If Dawn doesn't have a native section for what you need, check `references/custom-sections-patterns.md`

---

## Dawn Architecture Quick Reference

Dawn is Shopify's reference theme — minimal, fast, and built on vanilla CSS and Web Components (no Sass, no jQuery, no React). Understanding these constraints matters because they determine how you customize.

### File Structure That Matters

```
dawn/
├── assets/
│   ├── base.css              ← Global CSS variables, resets, typography
│   ├── section-*.css         ← Per-section stylesheets (loaded on demand)
│   ├── component-*.css       ← Shared component styles
│   └── global.js             ← Shared JS utilities
├── config/
│   ├── settings_schema.json  ← Theme-wide settings (colors, typography, etc.)
│   └── settings_data.json    ← Current values for all theme settings
├── layout/
│   └── theme.liquid          ← Master layout — age gate goes here
├── sections/                 ← 54 section files (see inventory reference)
├── snippets/                 ← Reusable partials (product cards, icons, etc.)
└── templates/                ← JSON templates that compose sections into pages
    ├── index.json            ← Homepage
    ├── product.json          ← PDP
    ├── collection.json       ← Collection/browse page
    └── page.*.json           ← Custom page templates
```

### Key Technical Facts

- **CSS**: Vanilla CSS with custom properties. No preprocessor. All brand overrides go through CSS variables defined in `base.css` or injected via theme settings.
- **JavaScript**: Web Components (`<details-disclosure>`, `<modal-dialog>`, etc.). Dawn uses custom elements, not a framework. New interactive behavior should follow this pattern.
- **Section rendering**: Each section loads its own CSS file via `{{ 'section-image-banner.css' | asset_url | stylesheet_tag }}`. This keeps unused CSS off pages that don't need it.
- **Performance budget**: Dawn ships with a ~95 Lighthouse score. Every customization should be measured. No JavaScript libraries over 10KB gzipped without justification.
- **Theme editor**: All section configuration happens through `{% schema %}` blocks. Merchants interact with sections through the Shopify Admin → Online Store → Customize interface.

---

## Theme Editor Configuration (Global Settings)

These are the first things to configure after installing Dawn. They're set in the theme editor under "Theme settings" (the paint palette icon), not inside individual sections.

### Colors

Map the Cheersworthy brand palette to Dawn's color system. Dawn uses a "scheme" system — you define color schemes and then assign them to individual sections.

```
Scheme 1 — "Light" (default for most sections):
  Background:  Barrel Paper     #F4EDE3
  Text:        Charred Oak      #1A110D
  Accent 1:    Oxblood          #6E2535
  Accent 2:    Copper           #A8541F

Scheme 2 — "Dark" (hero, featured sections):
  Background:  Charred Oak      #1A110D
  Text:        Barrel Paper     #F4EDE3
  Accent 1:    Amber            #C47D1A
  Accent 2:    Copper           #A8541F

Scheme 3 — "Parchment" (editorial blocks, Why This Bottle):
  Background:  Aged Parchment   #E5D9CA
  Text:        Charred Oak      #1A110D
  Accent 1:    Oxblood          #6E2535
  Accent 2:    Forest Green     #2C5545
```

### Typography

Dawn has two font slots: Heading and Body.

```
Heading font:  Fraunces (Google Fonts)
  - Used for: H1–H3, section titles, editorial headlines
  - Weight: 400 for display, 600 for emphasis
  - Character: Soft serif with optical size axis — feels warm, premium

Body font:     Inter (Google Fonts)
  - Used for: Paragraphs, UI elements, buttons, navigation, prices
  - Weight: 400 regular, 500 medium, 600 semibold
  - Character: Clean, highly legible, neutral
```

In the theme editor: Theme settings → Typography → Change heading font → search "Fraunces". Same for body → "Inter".

### Layout

```
Page width:         1440px (Dawn default is 1200px — increase it)
Section spacing:    Adjust to create the "breathing room" that signals premium
                    (cheersworthy-wireframe specifies generous whitespace)
```

### Buttons

```
Border radius:   4px (subtle rounding — not fully rounded, not sharp)
Shadow:          None (clean and modern)
```

---

## Page-by-Page Buildout Guide

For each page, this section tells you which Dawn sections to use, what settings to configure in the theme editor, and where you'll need custom sections.

### Homepage (templates/index.json)

The homepage wireframe (see cheersworthy-wireframe) has these sections top to bottom:

| Wireframe Section | Dawn Section to Use | Custom? |
|---|---|---|
| Header + Search | `header.liquid` (in header-group.json) | Configure only |
| Hero with tagline + CTAs | `image-banner` | Configure |
| Three Intent Cards | `multicolumn` | Configure |
| "What the Tribe is drinking" | `featured-collection` | Configure |
| "Find a whiskey by flavor" | **Custom section needed** | Yes — `flavor-discovery.liquid` |
| "What are you drinking for?" | `collection-list` | Configure |
| "What just landed" | `featured-collection` (second instance) | Configure |
| Trust bar | `rich-text` or **custom** | Configure or custom |
| Footer | `footer.liquid` (in footer-group.json) | Configure |

**Theme editor sequence for homepage:**
1. Open Customize → Home page
2. Remove all default sections except Header and Footer
3. Add sections in order listed above
4. Configure each section (settings detailed in `references/dawn-sections-inventory.md`)

### Product Detail Page (templates/product.json)

The PDP is the most important page. The wireframe specifies a rich layout that needs both Dawn native sections and custom blocks.

| Wireframe Section | Dawn Section / Block | Custom? |
|---|---|---|
| Product images + info | `main-product` | Configure — uses blocks |
| → Badge (Community Pick, etc.) | Custom block in main-product | Yes |
| → Flavor Cloud | Custom block in main-product | Yes |
| → Flavor chip tags | Custom block in main-product | Yes |
| → Trust row (shipping, compliance) | Custom block in main-product | Yes |
| → Price + variant selector | Native block | Configure |
| → Buy button | Native block | Configure |
| → Wishlist / Back-in-Stock | App block (from Wishlist Plus/Growave) | App |
| Why This Bottle | `rich-text` or custom section | Configure/Custom |
| Tasting Profile (Nose/Palate/Finish) | `collapsible-content` or custom | Configure/Custom |
| About [Distillery] | `rich-text` with dynamic source | Configure |
| Community Notes (Reviews) | App section (Judge.me) | App |
| You Might Also Like | `related-products` | Configure |
| Shipping & FAQ accordions | `collapsible-content` | Configure |

**Key PDP configuration notes:**
- `main-product` in Dawn supports blocks — you can add/remove/reorder blocks in the theme editor. This is where most PDP customization happens.
- The Flavor Cloud and trust row need custom blocks added to `main-product` (see `references/custom-sections-patterns.md`).
- Connect metafields to blocks using "dynamic sources" — click the database icon next to any text field in the theme editor and select the appropriate `cheersworthy.*` metafield.

### Collection Page (templates/collection.json)

| Wireframe Section | Dawn Section | Custom? |
|---|---|---|
| Collection banner + editorial intro | `main-collection-banner` | Configure |
| Filter + sort controls | `main-collection-product-grid` | Configure |
| Product grid | `main-collection-product-grid` | Configure |

**Collection page is mostly native Dawn.** The main work is:
1. Configuring filters (requires Search & Discovery app setup — see cheersworthy-shopify)
2. Setting grid columns (2 mobile / 4 desktop)
3. Enabling filter chips above grid
4. Connecting collection description to editorial intro copy

### Cart (templates/cart.json)

Dawn's cart uses `main-cart-items` and `main-cart-footer`. The wireframe's cost breakdown, adult signature notice, and free shipping progress bar all need attention:

- Cost breakdown: Configure Dawn's native cart footer settings
- Adult signature notice: Add via `cart-notification` custom snippet or rich-text block
- Free shipping progress bar: Requires custom Liquid in `main-cart-items` or a lightweight app

### Other Pages

- **Gift page**: Create as a custom collection template (`collection.gift.json`) with curated sections
- **Age Gate**: Implement in `layout/theme.liquid` as a full-screen overlay (see custom sections reference)
- **Account pages**: Dawn native — light customization only
- **Contact page**: Dawn native `contact-form` section

---

## Working with Dawn Sections in the Theme Editor

The theme editor (Shopify Admin → Online Store → Customize) is the merchant-facing configuration interface. Here's how section configuration works:

### Adding a Section
1. Open the page template in the editor
2. Click "Add section" in the left sidebar
3. Select from Dawn's section library or any custom sections you've added
4. Configure settings in the right panel

### Section Settings vs Block Settings
- **Section settings** control the section wrapper (background color scheme, padding, heading)
- **Block settings** control individual items within the section (each column in multicolumn, each product in featured-collection)
- Blocks can be reordered by dragging in the sidebar

### Dynamic Sources (Metafield Connections)
This is how you connect Cheersworthy metafields to theme sections without code:
1. In the theme editor, select any text, image, or URL setting
2. Click the small database icon (Connect dynamic source)
3. Browse to the metafield (e.g., Product → cheersworthy.why_this_bottle)
4. The section now pulls live data from the metafield for each product

This is the preferred approach for most metafield display — it avoids custom Liquid and lets merchants edit the connection themselves.

### Color Schemes in Sections
Every section in Dawn has a "Color scheme" dropdown. Use this to apply the Cheersworthy schemes:
- **Scheme 1 (Light)** — Most sections: collection grids, text blocks, product info
- **Scheme 2 (Dark)** — Hero banners, featured sections, announcements
- **Scheme 3 (Parchment)** — Editorial blocks, "Why This Bottle," tasting notes

---

## Custom Development Patterns

When Dawn doesn't have what you need, you create custom sections or blocks. See `references/custom-sections-patterns.md` for full Liquid templates. The key custom components for Cheersworthy are:

1. **Flavor Cloud** — Interactive word cloud from `flavor_profile_json` metafield
2. **Flavor Discovery Grid** — Homepage section: tappable flavor family cards
3. **Trust Row** — PDP block: shipping state, cost, adult signature notice
4. **Intent Cards** — Homepage section: three-card navigation ("I know what I want" / "I know my flavors" / "Help me find something")
5. **Age Gate Overlay** — Full-screen DOB verification in theme.liquid

### Custom Section Checklist
When creating any custom section:
- [ ] Include `{% schema %}` with all configurable settings
- [ ] Load CSS conditionally (`{{ 'section-my-section.css' | asset_url | stylesheet_tag }}`)
- [ ] Follow Dawn's class naming conventions (`section-{{ section.id }}-padding`)
- [ ] Include a `presets` block so the section appears in "Add section" menu
- [ ] Test at 375px mobile and 1440px desktop
- [ ] Verify Lighthouse score hasn't dropped

---

## Reference Files

Read these as needed — they contain the detail that would bloat this main skill file:

- **`references/dawn-sections-inventory.md`** — Complete inventory of all 54 Dawn sections with configuration options, which Cheersworthy pages use them, and recommended settings
- **`references/dawn-css-system.md`** — Dawn's CSS variable system, how to override for Cheersworthy brand, responsive breakpoints, typography scale, and spacing system
- **`references/custom-sections-patterns.md`** — Full Liquid templates for every custom section Cheersworthy needs (Flavor Cloud, trust row, intent cards, age gate, flavor discovery)
- **`references/buildout-checklist.md`** — Prioritized task sequence with dependencies, organized by phase (Phase 0: foundation → Phase 1: core pages → Phase 2: enhancements → Phase 3: polish)
