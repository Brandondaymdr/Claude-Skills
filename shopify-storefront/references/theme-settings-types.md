# Shopify Theme Settings Types Reference

Complete reference for all setting types available in section `{% schema %}` blocks and `settings_schema.json`.

## Table of Contents

1. [Basic Input Types](#basic-input-types)
2. [Specialized Input Types](#specialized-input-types)
3. [Resource Picker Types](#resource-picker-types)
4. [Media Types](#media-types)
5. [Layout & Sidebar Types](#layout--sidebar-types)
6. [Common Properties](#common-properties)

---

## Basic Input Types

### text
Single-line text input.
```json
{
  "type": "text",
  "id": "heading",
  "label": "Heading",
  "default": "Welcome",
  "placeholder": "Enter heading text"
}
```

### textarea
Multi-line text input.
```json
{
  "type": "textarea",
  "id": "description",
  "label": "Description",
  "default": "Some longer text here"
}
```

### richtext
Rich text editor (returns HTML). Supports bold, italic, links, lists.
```json
{
  "type": "richtext",
  "id": "body",
  "label": "Body content"
}
```
Access in Liquid: `{{ section.settings.body }}`

### inline_richtext
Inline rich text (no block-level elements like paragraphs). Useful for headings.
```json
{
  "type": "inline_richtext",
  "id": "heading",
  "label": "Heading",
  "default": "Welcome to <em>our store</em>"
}
```

### number
Numeric input (integer).
```json
{
  "type": "number",
  "id": "items_count",
  "label": "Number of items",
  "default": 4
}
```

### range
Slider input with min/max/step.
```json
{
  "type": "range",
  "id": "opacity",
  "min": 0,
  "max": 100,
  "step": 5,
  "unit": "%",
  "label": "Opacity",
  "default": 100
}
```

### checkbox
Boolean toggle.
```json
{
  "type": "checkbox",
  "id": "show_price",
  "label": "Show price",
  "default": true
}
```

### select
Dropdown selector.
```json
{
  "type": "select",
  "id": "layout",
  "label": "Layout",
  "options": [
    { "value": "grid", "label": "Grid" },
    { "value": "list", "label": "List" },
    { "value": "carousel", "label": "Carousel" }
  ],
  "default": "grid"
}
```

### radio
Radio button group (same as select, different UI).
```json
{
  "type": "radio",
  "id": "alignment",
  "label": "Text alignment",
  "options": [
    { "value": "left", "label": "Left" },
    { "value": "center", "label": "Center" },
    { "value": "right", "label": "Right" }
  ],
  "default": "center"
}
```

---

## Specialized Input Types

### color
Color picker. Returns hex value.
```json
{
  "type": "color",
  "id": "accent_color",
  "label": "Accent color",
  "default": "#4A90D9"
}
```

### color_scheme
Picks from theme's defined color schemes.
```json
{
  "type": "color_scheme",
  "id": "color_scheme",
  "label": "Color scheme",
  "default": "scheme-1"
}
```

### color_background
Gradient-capable color picker. Returns CSS gradient or solid color.
```json
{
  "type": "color_background",
  "id": "background",
  "label": "Background"
}
```

### font_picker
Font selector from Shopify's font library.
```json
{
  "type": "font_picker",
  "id": "heading_font",
  "label": "Heading font",
  "default": "helvetica_n4"
}
```
Access in Liquid: `{{ section.settings.heading_font | font_face }}`

### url
URL input with link picker.
```json
{
  "type": "url",
  "id": "link",
  "label": "Link"
}
```

### html
Raw HTML input (use carefully).
```json
{
  "type": "html",
  "id": "custom_html",
  "label": "Custom HTML"
}
```

### liquid
Liquid code input (renders Liquid at runtime).
```json
{
  "type": "liquid",
  "id": "custom_liquid",
  "label": "Custom Liquid"
}
```

---

## Resource Picker Types

These open Shopify's resource picker dialogs in the theme editor.

### product
Pick a product.
```json
{
  "type": "product",
  "id": "featured_product",
  "label": "Featured product"
}
```
Access: `{{ section.settings.featured_product }}` (returns product object)

### collection
Pick a collection.
```json
{
  "type": "collection",
  "id": "collection",
  "label": "Collection"
}
```

### blog
Pick a blog.
```json
{
  "type": "blog",
  "id": "blog",
  "label": "Blog"
}
```

### article
Pick a blog article.
```json
{
  "type": "article",
  "id": "article",
  "label": "Article"
}
```

### page
Pick a page.
```json
{
  "type": "page",
  "id": "page",
  "label": "Page"
}
```

### link_list
Pick a navigation menu.
```json
{
  "type": "link_list",
  "id": "menu",
  "label": "Menu",
  "default": "main-menu"
}
```

### product_list
Pick multiple products (returns array).
```json
{
  "type": "product_list",
  "id": "products",
  "label": "Products",
  "limit": 12
}
```

### collection_list
Pick multiple collections (returns array).
```json
{
  "type": "collection_list",
  "id": "collections",
  "label": "Collections",
  "limit": 6
}
```

---

## Media Types

### image_picker
Upload or select an image.
```json
{
  "type": "image_picker",
  "id": "image",
  "label": "Image"
}
```
Access: `{{ section.settings.image | image_url: width: 600 | image_tag }}`

### video
Select a Shopify-hosted video.
```json
{
  "type": "video",
  "id": "video",
  "label": "Video"
}
```

### video_url
Enter a YouTube or Vimeo URL.
```json
{
  "type": "video_url",
  "id": "video_url",
  "label": "Video URL",
  "accept": ["youtube", "vimeo"]
}
```

---

## Layout & Sidebar Types

### header
Section divider in the theme editor (not a setting — no value stored).
```json
{
  "type": "header",
  "content": "Layout settings"
}
```

### paragraph
Informational text in the theme editor (not a setting — no value stored).
```json
{
  "type": "paragraph",
  "content": "Configure the layout options for this section."
}
```

---

## Common Properties

All setting types support these properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `type` | string | Yes | Setting type (from above) |
| `id` | string | Yes | Unique identifier (used in Liquid) |
| `label` | string | Yes | Display label in theme editor |
| `default` | varies | No | Default value |
| `info` | string | No | Help text shown below the setting |
| `placeholder` | string | No | Placeholder text (text/textarea only) |

## Using Settings in Liquid

```liquid
{# Text setting #}
{{ section.settings.heading }}

{# Checkbox #}
{% if section.settings.show_price %}
  {{ product.price | money }}
{% endif %}

{# Image picker #}
{% if section.settings.image != blank %}
  {{ section.settings.image | image_url: width: 800 | image_tag: loading: 'lazy' }}
{% endif %}

{# Color #}
<div style="color: {{ section.settings.text_color }};">

{# Select #}
<div class="layout--{{ section.settings.layout }}">

{# Font picker #}
{{ section.settings.heading_font | font_face }}
```
