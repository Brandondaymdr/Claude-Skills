# Dawn CSS System for Cheersworthy

Dawn uses vanilla CSS with custom properties (variables) — no Sass, no PostCSS, no Tailwind. All brand overrides flow through CSS variables, and section-specific styles are loaded on demand.

## Table of Contents

1. [CSS Variable Architecture](#css-variable-architecture)
2. [Cheersworthy Brand Overrides](#cheersworthy-brand-overrides)
3. [Typography System](#typography-system)
4. [Color Scheme System](#color-scheme-system)
5. [Spacing & Layout](#spacing--layout)
6. [Responsive Breakpoints](#responsive-breakpoints)
7. [Component Patterns](#component-patterns)
8. [Performance Guidelines](#performance-guidelines)

---

## CSS Variable Architecture

Dawn defines all its design tokens as CSS custom properties in `assets/base.css`. The theme editor writes values into these variables via inline styles on the `<body>` or `:root` element.

The hierarchy works like this:

```
Theme settings (set by merchant in editor)
    ↓
Injected as inline CSS variables on <body>
    ↓
Referenced by base.css, section-*.css, component-*.css
    ↓
Rendered in browser
```

This means you have two ways to customize:

1. **Theme editor** (preferred) — Change settings that Dawn already exposes. The CSS variables update automatically. No code changes needed.
2. **CSS overrides** — Add or modify CSS variables in a custom stylesheet for things the theme editor doesn't expose. Create `assets/custom-cheersworthy.css` and include it in `layout/theme.liquid`.

### Including Custom CSS

Add this line in `layout/theme.liquid` right after Dawn's base.css include:

```liquid
{{ 'custom-cheersworthy.css' | asset_url | stylesheet_tag }}
```

This keeps your customizations separate from Dawn's core files, making theme updates easier.

---

## Cheersworthy Brand Overrides

### Color Variables

Dawn's color scheme system uses RGB values stored as CSS variables. Each scheme has these variables:

```css
/* In custom-cheersworthy.css */

/* Scheme 1: Light (Barrel Paper background) */
.color-scheme--1 {
  --color-background: 244, 237, 227;      /* #F4EDE3 Barrel Paper */
  --color-foreground: 26, 17, 13;          /* #1A110D Charred Oak */
  --color-button: 110, 37, 53;             /* #6E2535 Oxblood */
  --color-button-text: 244, 237, 227;      /* #F4EDE3 */
  --color-link: 110, 37, 53;              /* #6E2535 Oxblood */
  --color-border: 26, 17, 13, 0.12;       /* Subtle border */
  --color-shadow: 26, 17, 13, 0.04;       /* Soft shadow */
}

/* Scheme 2: Dark (Charred Oak background) */
.color-scheme--2 {
  --color-background: 26, 17, 13;          /* #1A110D Charred Oak */
  --color-foreground: 244, 237, 227;       /* #F4EDE3 Barrel Paper */
  --color-button: 196, 125, 26;           /* #C47D1A Amber */
  --color-button-text: 26, 17, 13;         /* #1A110D */
  --color-link: 196, 125, 26;             /* #C47D1A Amber */
}

/* Scheme 3: Parchment (editorial surfaces) */
.color-scheme--3 {
  --color-background: 229, 217, 202;       /* #E5D9CA Aged Parchment */
  --color-foreground: 26, 17, 13;          /* #1A110D Charred Oak */
  --color-button: 110, 37, 53;            /* #6E2535 Oxblood */
  --color-button-text: 244, 237, 227;      /* #F4EDE3 */
  --color-link: 44, 85, 69;               /* #2C5545 Forest Green */
}
```

**Important:** Dawn stores colors as comma-separated RGB values (not hex), because it uses `rgb()` and `rgba()` functions throughout. Always define colors as `R, G, B` — not `#hex`.

### Accent Colors (Custom Variables)

Dawn doesn't have built-in variables for all the Cheersworthy accent colors, so define custom ones:

```css
:root {
  --cw-oxblood: 110, 37, 53;              /* #6E2535 Primary CTA */
  --cw-copper: 168, 84, 31;               /* #A8541F Accent, flavor cloud highlight */
  --cw-forest-green: 44, 85, 69;          /* #2C5545 Secondary accent */
  --cw-amber: 196, 125, 26;               /* #C47D1A Warm accent, dark surfaces */
  --cw-barrel-paper: 244, 237, 227;       /* #F4EDE3 Light background */
  --cw-charred-oak: 26, 17, 13;           /* #1A110D Dark background, text */
  --cw-aged-parchment: 229, 217, 202;     /* #E5D9CA Editorial background */
}
```

---

## Typography System

### Font Loading

Dawn loads fonts via Shopify's font library. Fraunces and Inter are both available as Google Fonts through the theme editor. Set them in Theme settings → Typography.

If the theme editor's font picker doesn't include the exact weights you need, you can supplement with a manual font-face declaration:

```css
/* Only needed if Dawn's font picker doesn't expose the weights you want */
@font-face {
  font-family: 'Fraunces';
  src: url('fraunces-variable.woff2') format('woff2');
  font-weight: 100 900;
  font-display: swap;
}
```

### Typography Scale

Dawn's heading sizes are controlled by these variables:

```css
:root {
  /* Dawn's default scale — override for Cheersworthy's premium feel */
  --font-heading-scale: 1.1;    /* Multiplier for heading sizes */
  --font-body-scale: 1.0;       /* Multiplier for body text */
}

/* Cheersworthy-specific type sizing */
h1, .h1 {
  font-family: var(--font-heading-family);
  font-size: calc(var(--font-heading-scale) * 3.2rem);  /* ~38px on mobile */
  line-height: 1.15;
  letter-spacing: -0.02em;
  font-weight: 400;  /* Fraunces looks best at regular weight for display */
}

h2, .h2 {
  font-family: var(--font-heading-family);
  font-size: calc(var(--font-heading-scale) * 2.4rem);
  line-height: 1.2;
  font-weight: 400;
}

h3, .h3 {
  font-family: var(--font-heading-family);
  font-size: calc(var(--font-heading-scale) * 1.8rem);
  line-height: 1.25;
  font-weight: 600;  /* Semibold for smaller headings */
}

/* Price styling */
.price-item--regular {
  font-family: var(--font-body-family);
  font-weight: 600;
  font-size: 1.375rem;  /* 22px per wireframe */
}

/* Inter body text */
body, .body {
  font-family: var(--font-body-family);
  font-size: 1rem;      /* 16px */
  line-height: 1.6;
  font-weight: 400;
}

/* Small text (metadata, badges) */
.text-caption {
  font-family: var(--font-body-family);
  font-size: 0.75rem;   /* 12px */
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
```

---

## Color Scheme System

Dawn v15 introduced a "color scheme" approach. Instead of setting colors on individual sections, you define up to 5 named color schemes in Theme settings → Colors, then assign a scheme to each section.

### How It Works Technically

1. Theme settings define schemes (Background, Text, Button, Accent colors per scheme)
2. Dawn generates CSS classes: `.color-scheme--1`, `.color-scheme--2`, etc.
3. Each section's `{% schema %}` includes a `color_scheme` setting
4. Sections render with `class="color-scheme--{{ section.settings.color_scheme }}"`
5. All child elements inherit the scheme's variables

### Cheersworthy Scheme Assignments

| Page / Section | Scheme |
|---|---|
| Header | 2 (Dark) |
| Footer | 2 (Dark) |
| Announcement bar | 2 (Dark) |
| Homepage hero (image-banner) | 2 (Dark) |
| Homepage intent cards (multicolumn) | 1 (Light) |
| Homepage featured collections | 1 (Light) |
| Collection page | 1 (Light) |
| PDP main product | 1 (Light) |
| PDP "Why This Bottle" | 3 (Parchment) |
| PDP tasting notes | 3 (Parchment) |
| Cart | 1 (Light) |
| Email signup banner | 2 (Dark) |
| Trust bar | 1 (Light) |

---

## Spacing & Layout

### Page Width

Dawn defaults to 1200px max-width. Cheersworthy should use 1440px for a more expansive premium feel:

```css
:root {
  --page-width: 144rem;  /* 1440px — Dawn uses rem-based widths */
}
```

Set this in Theme settings → Layout → Page width.

### Section Spacing

Dawn uses padding variables for section spacing. The wireframe emphasizes "breathing room signals premium" — increase spacing from Dawn's defaults:

```css
:root {
  --section-spacing-unit-size: 1.2rem;  /* Slightly larger than Dawn's default */
}

/* Section padding is controlled per-section in the theme editor
   using a range slider (0–100). Recommended values: */
/*
   Most content sections:  Top 60, Bottom 60
   Hero/banner sections:   Top 80, Bottom 80
   Between major groups:   Top 80, Bottom 80
*/
```

### Grid System

Dawn uses CSS Grid for product grids and content layouts:

```css
/* Product grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-desktop-columns, 4), 1fr);
  gap: var(--grid-gap, 1.5rem);
}

/* On mobile: 2 columns */
@media screen and (max-width: 749px) {
  .product-grid {
    grid-template-columns: repeat(var(--grid-mobile-columns, 2), 1fr);
    gap: 1rem;
  }
}
```

---

## Responsive Breakpoints

Dawn uses these breakpoints consistently:

```css
/* Dawn's breakpoints — use these, don't create new ones */
/* Small (mobile):      0 – 749px */
/* Medium (tablet):     750px – 989px */
/* Large (desktop):     990px+ */

@media screen and (min-width: 750px) { /* Tablet and up */ }
@media screen and (min-width: 990px) { /* Desktop */ }
@media screen and (max-width: 749px) { /* Mobile only */ }

/* Dawn also has a "large desktop" breakpoint for wide layouts: */
@media screen and (min-width: 1400px) { /* Wide desktop */ }
```

**Cheersworthy-specific responsive rules:**
- Product grid: 2 cols at ≤749px, 3 cols at 750–989px, 4 cols at 990px+
- PDP: Stacked layout at ≤749px, two-column at 990px+ (images left, info right)
- Flavor Cloud: Full width at ≤749px, contained within product info column at 990px+
- Intent cards: Stack to 1 column at ≤749px

---

## Component Patterns

### Buttons

```css
/* Primary button (Oxblood) */
.button--primary {
  background: rgb(var(--color-button));
  color: rgb(var(--color-button-text));
  border: none;
  border-radius: 4px;          /* Per brand spec — not fully rounded */
  padding: 1rem 2.5rem;
  font-family: var(--font-body-family);
  font-weight: 600;
  font-size: 0.9375rem;        /* 15px */
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: background 150ms ease;
}

.button--primary:hover {
  background: rgb(var(--color-button) / 0.85);
}

/* Secondary/Ghost button */
.button--secondary {
  background: transparent;
  color: rgb(var(--color-foreground));
  border: 1px solid rgb(var(--color-foreground) / 0.3);
  border-radius: 4px;
  padding: 1rem 2.5rem;
}
```

### Badges

```css
/* Product badges (Limited Release, Community Pick, New Arrival) */
.cw-badge {
  display: inline-block;
  font-family: var(--font-body-family);
  font-size: 0.6875rem;        /* 11px */
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.25rem 0.625rem;
  border-radius: 2px;
}

.cw-badge--amber {
  background: rgb(var(--cw-amber) / 0.15);
  color: rgb(var(--cw-amber));
}

.cw-badge--green {
  background: rgb(var(--cw-forest-green) / 0.15);
  color: rgb(var(--cw-forest-green));
}

.cw-badge--copper {
  background: rgb(var(--cw-copper) / 0.15);
  color: rgb(var(--cw-copper));
}
```

### Product Cards

```css
/* Enhance Dawn's default product card for Cheersworthy */
.card-wrapper {
  transition: transform 200ms ease;
}

.card-wrapper:hover {
  transform: translateY(-2px);
}

/* Flavor tags on product cards */
.cw-card-flavors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.5rem;
}

.cw-card-flavor-tag {
  font-size: 0.6875rem;
  color: rgb(var(--color-foreground) / 0.6);
  font-family: var(--font-body-family);
}
```

---

## Performance Guidelines

Dawn ships with a ~95 Lighthouse score. Every CSS addition has a cost. Follow these rules:

1. **Keep custom-cheersworthy.css under 10KB.** If it grows beyond that, break it into section-specific files that load conditionally.

2. **Never use `@import`** — it blocks rendering. Use `stylesheet_tag` in Liquid instead.

3. **Avoid layout shifts.** Set explicit dimensions on images and containers. Use `aspect-ratio` for responsive image containers.

4. **No CSS animations on page load.** Hover transitions are fine (keep under 200ms). Avoid entrance animations, parallax, or scroll-triggered effects — they look dated and hurt performance.

5. **Test after every change.** Run Lighthouse on the affected page type. If the score drops more than 3 points, investigate before proceeding.

6. **Font loading.** Fraunces and Inter are loaded via Shopify's CDN when selected in the theme editor. Don't add additional font-face declarations unless needed for weights the editor doesn't expose. Each additional font weight adds ~20KB.
