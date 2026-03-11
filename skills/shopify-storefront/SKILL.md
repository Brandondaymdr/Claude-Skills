---
name: shopify-storefront
description: "Comprehensive Shopify storefront and theme development skill for building Online Store 2.0 themes, Liquid templates, theme app extensions, sections, blocks, and the full merchant-facing shopping experience. Use this skill whenever the user mentions Shopify theme, Liquid, storefront, Online Store 2.0, sections, blocks, snippets, templates, theme customization, Dawn theme, product pages, collection pages, cart, checkout UI, metafields in themes, schema settings, or any front-end Shopify store development. Also trigger when the user wants to build product displays, collection grids, age verification gates, custom landing pages, or any customer-facing Shopify page. Essential for building and customizing the Cheersworthy.com spirits store. Even if the user just says 'Shopify' and the context is about the store's look, feel, or customer experience, use this skill."
---

# Shopify Storefront Development

Build and customize Shopify Online Store 2.0 themes with Liquid, sections, blocks, and theme app extensions.

## Before You Start

Read the shared store config for Cheersworthy-specific details:
- `references/cheersworthy-config.md` — Store identity, brand, compliance requirements
- `references/shopify-dev-patterns.md` — Common Shopify CLI commands and patterns

## Cheersworthy Metafield Namespace Convention

**All spirit-specific metafields use the `cheersworthy` namespace.** This is critical for consistency across the theme, Sidekick extensions, admin UI, and Storefront API. Never use `custom`, `spirits`, `spirit_attributes`, or any other namespace for Cheersworthy product data.

The standard spirit metafields are: `cheersworthy.tasting_notes`, `cheersworthy.abv`, `cheersworthy.origin`, `cheersworthy.distillery`, `cheersworthy.age_statement`, `cheersworthy.awards`, `cheersworthy.pairing_notes`, `cheersworthy.serving_suggestions`.

In Liquid, access them as `product.metafields.cheersworthy.abv` (not `product.metafields.custom.abv`).

## Core Concepts

### Online Store 2.0 Architecture

Online Store 2.0 themes use JSON templates that reference sections. This decouples content from layout and lets merchants customize pages without code.

```
theme/
├── assets/          # CSS, JS, images, fonts
├── config/
│   ├── settings_schema.json   # Theme settings definitions
│   └── settings_data.json     # Current theme settings values
├── layout/
│   └── theme.liquid            # Main layout wrapper
├── locales/                    # Translation files
├── sections/                   # Reusable page sections
├── snippets/                   # Reusable Liquid partials
├── templates/                  # JSON templates (OS 2.0)
│   ├── product.json
│   ├── collection.json
│   ├── index.json
│   └── page.json
└── blocks/                     # Theme blocks (granular section components)
```

### Liquid Fundamentals

Liquid is Shopify's templating language. Three building blocks:

**Objects** output dynamic content:
```liquid
{{ product.title }}
{{ product.price | money }}
{{ product.metafields.cheersworthy.tasting_notes }}
```

**Tags** control logic:
```liquid
{% if product.tags contains 'limited-edition' %}
  <span class="badge">Limited Edition</span>
{% endif %}

{% for product in collection.products %}
  {% render 'product-card', product: product %}
{% endfor %}
```

**Filters** transform output:
```liquid
{{ product.price | money_with_currency }}
{{ product.title | downcase | handleize }}
{{ 'now' | date: '%Y' }}
```

### Section Schema

Every section declares its settings via a `{% schema %}` block. This is how merchants configure sections in the theme editor. For a complete reference of all available setting types, see `references/theme-settings-types.md`.

```liquid
{% schema %}
{
  "name": "Spirit Showcase",
  "tag": "section",
  "class": "spirit-showcase",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Featured Spirits"
    },
    {
      "type": "richtext",
      "id": "description",
      "label": "Description"
    },
    {
      "type": "collection",
      "id": "collection",
      "label": "Collection to display"
    },
    {
      "type": "range",
      "id": "products_per_row",
      "min": 2,
      "max": 5,
      "step": 1,
      "default": 4,
      "label": "Products per row"
    }
  ],
  "blocks": [
    {
      "type": "product_card",
      "name": "Product Card",
      "settings": [
        {
          "type": "product",
          "id": "product",
          "label": "Product"
        }
      ]
    }
  ],
  "presets": [
    {
      "name": "Spirit Showcase"
    }
  ]
}
{% endschema %}
```

### Theme App Extensions

Theme app extensions let your app inject sections and blocks into any merchant theme without modifying theme code directly. This is the recommended approach for app-provided UI.

```
extensions/theme-block/
├── blocks/
│   └── age-gate.liquid       # Age verification block
├── snippets/
│   └── age-gate-modal.liquid
├── assets/
│   └── age-gate.js
└── shopify.extension.toml
```

```toml
# shopify.extension.toml
[[extensions]]
type = "theme"
name = "Cheersworthy Age Gate"

[[extensions.targeting]]
target = "section.*.block"
```

## Spirits-Specific Patterns

### Age Verification Gate

Required for spirits e-commerce. Implement as a theme app extension or inline in `theme.liquid`:

```liquid
{% comment %} Age verification - must appear before any product content {% endcomment %}
{% unless request.page_type == 'policy' or request.page_type == 'captcha' %}
  {% render 'age-verification-modal' %}
{% endunless %}
```

The modal should:
- Block all content until age is confirmed
- Store verification in a cookie (session or 30-day)
- Redirect users who decline to a non-product page
- Be accessible (keyboard navigable, screen reader friendly)

### Product Metafields for Spirits

Use metafields to store spirit-specific data that Liquid can render:

| Namespace | Key | Type | Example |
|-----------|-----|------|---------|
| cheersworthy | tasting_notes | multi_line_text_field | "Oak, vanilla, caramel..." |
| cheersworthy | abv | number_decimal | 43.0 |
| cheersworthy | origin | single_line_text_field | "Kentucky, USA" |
| cheersworthy | age_statement | single_line_text_field | "12 Years" |
| cheersworthy | distillery | single_line_text_field | "Buffalo Trace" |
| cheersworthy | serving_suggestion | multi_line_text_field | "Neat or on the rocks..." |
| cheersworthy | awards | json | [{"name":"Gold Medal","event":"SIP Awards 2025"}] |
| cheersworthy | pairing_notes | multi_line_text_field | "Dark chocolate, aged cheese..." |

### Product Page Template

For spirits, the product page needs more than a standard template. Key sections:

1. **Hero** — Large product image with bottle photography
2. **Details** — Name, price, ABV, origin, age statement
3. **Tasting Notes** — Visual tasting wheel or descriptive section
4. **Serving Suggestions** — How to enjoy
5. **Awards & Ratings** — Trust signals
6. **Pairings** — Food and occasion pairings
7. **Related Products** — Same category or complementary spirits
8. **Reviews** — Social proof
9. **Age Verification Reminder** — Subtle legal compliance note

## Reference Files

For deeper dives, read the reference files in `references/`:
- `references/liquid-cheatsheet.md` — Complete Liquid object/filter reference
- `references/theme-settings-types.md` — All available schema setting types
- `references/spirits-compliance.md` — Alcohol e-commerce legal requirements
- `references/whiskeysomm-storefront-api.md` — WhiskeySomm sister app Storefront API integration
- `references/cheersworthy-config.md` — Store identity, brand, and compliance context
- `references/shopify-dev-patterns.md` — Common Shopify CLI commands and development patterns

## Development Workflow

1. **Start with Dawn** — Clone Shopify's Dawn theme as your base (or use a premium theme)
2. **Shopify CLI for local dev**: `shopify theme dev --store cheersworthy`
3. **Use theme check** for linting: `shopify theme check`
4. **Preview changes** with hot reload before pushing
5. **Version control** — Keep theme in Git, use branches for features
6. **Deploy**: `shopify theme push` to publish changes
