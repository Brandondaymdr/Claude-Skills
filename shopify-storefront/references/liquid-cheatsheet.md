# Liquid Cheatsheet for Shopify

Quick reference for Shopify Liquid objects, filters, and tags.

## Table of Contents

1. [Global Objects](#global-objects)
2. [Product Object](#product-object)
3. [Collection Object](#collection-object)
4. [Cart Object](#cart-object)
5. [Customer Object](#customer-object)
6. [Common Filters](#common-filters)
7. [Control Flow Tags](#control-flow-tags)
8. [Iteration Tags](#iteration-tags)
9. [Theme Tags](#theme-tags)
10. [Section & Block Tags](#section--block-tags)

---

## Global Objects

| Object | Description |
|--------|-------------|
| `shop` | Store info (name, domain, currency) |
| `request` | Current request (host, path, page_type, locale) |
| `content_for_header` | Required in layout — Shopify scripts |
| `content_for_layout` | Required in layout — page content |
| `all_products` | All products (use sparingly) |
| `collections` | All collections |
| `pages` | All pages |
| `blogs` | All blogs |
| `linklists` | Navigation menus |
| `settings` | Theme settings |
| `routes` | URL routes (cart, collections, account) |
| `canonical_url` | Current page canonical URL |

## Product Object

```liquid
{{ product.id }}
{{ product.title }}
{{ product.handle }}
{{ product.description }}
{{ product.price | money }}
{{ product.compare_at_price | money }}
{{ product.type }}                    {# product type / category #}
{{ product.vendor }}
{{ product.available }}               {# true if any variant in stock #}
{{ product.tags }}                    {# array of tags #}
{{ product.featured_image | image_url: width: 400 }}
{{ product.url }}
{{ product.metafields.namespace.key }}

{% for variant in product.variants %}
  {{ variant.title }} — {{ variant.price | money }}
  {{ variant.available }}
  {{ variant.sku }}
  {{ variant.inventory_quantity }}
{% endfor %}

{% for image in product.images %}
  {{ image | image_url: width: 600 | image_tag }}
{% endfor %}
```

## Collection Object

```liquid
{{ collection.title }}
{{ collection.description }}
{{ collection.handle }}
{{ collection.products_count }}
{{ collection.image | image_url: width: 800 }}
{{ collection.url }}

{% for product in collection.products %}
  {% render 'product-card', product: product %}
{% endfor %}

{# Pagination #}
{% paginate collection.products by 24 %}
  {% for product in collection.products %}
    ...
  {% endfor %}
  {{ paginate | default_pagination }}
{% endpaginate %}
```

## Cart Object

```liquid
{{ cart.item_count }}
{{ cart.total_price | money }}
{{ cart.requires_shipping }}

{% for item in cart.items %}
  {{ item.product.title }}
  {{ item.variant.title }}
  {{ item.quantity }}
  {{ item.line_price | money }}
  {{ item.url }}
{% endfor %}
```

## Customer Object

```liquid
{% if customer %}
  {{ customer.first_name }}
  {{ customer.last_name }}
  {{ customer.email }}
  {{ customer.orders_count }}
  {{ customer.total_spent | money }}
  {{ customer.tags }}

  {% for address in customer.addresses %}
    {{ address.address1 }}
    {{ address.city }}, {{ address.province }} {{ address.zip }}
  {% endfor %}
{% endif %}
```

## Common Filters

### Money
```liquid
{{ price | money }}                    {# $10.00 #}
{{ price | money_with_currency }}      {# $10.00 USD #}
{{ price | money_without_currency }}   {# 10.00 #}
{{ price | money_without_trailing_zeros }} {# $10 #}
```

### Image
```liquid
{{ image | image_url: width: 400 }}
{{ image | image_url: width: 400, height: 400, crop: 'center' }}
{{ image | image_tag: loading: 'lazy', alt: product.title }}
```

### String
```liquid
{{ 'hello world' | capitalize }}       {# Hello world #}
{{ 'Hello' | downcase }}               {# hello #}
{{ 'hello' | upcase }}                 {# HELLO #}
{{ 'hello-world' | handleize }}        {# hello-world #}
{{ string | truncate: 50 }}
{{ string | strip_html }}
{{ string | url_encode }}
{{ string | replace: 'old', 'new' }}
{{ string | split: ',' }}
{{ string | append: ' suffix' }}
{{ string | prepend: 'prefix ' }}
```

### Array
```liquid
{{ array | size }}
{{ array | first }}
{{ array | last }}
{{ array | join: ', ' }}
{{ array | sort }}
{{ array | uniq }}
{{ array | where: 'available' }}
{{ array | map: 'title' }}
{{ array | concat: other_array }}
```

### Date
```liquid
{{ 'now' | date: '%Y-%m-%d' }}        {# 2026-03-06 #}
{{ article.created_at | date: '%B %d, %Y' }}  {# March 06, 2026 #}
{{ 'now' | date: '%s' }}              {# Unix timestamp #}
```

### URL
```liquid
{{ product.url }}
{{ 'cart' | routes }}
{{ 'style.css' | asset_url }}
{{ 'logo.png' | asset_url | image_tag }}
{{ product | url_for_type: collection }}
```

## Control Flow Tags

```liquid
{% if condition %}
{% elsif other_condition %}
{% else %}
{% endif %}

{% unless condition %}
{% endunless %}

{% case variable %}
  {% when 'value1' %}
  {% when 'value2' %}
  {% else %}
{% endcase %}

{# Ternary-like #}
{% if product.available %}In Stock{% else %}Sold Out{% endif %}
```

## Iteration Tags

```liquid
{% for item in array %}
  {{ forloop.index }}      {# 1-based index #}
  {{ forloop.index0 }}     {# 0-based index #}
  {{ forloop.first }}      {# true on first iteration #}
  {{ forloop.last }}       {# true on last iteration #}
  {{ forloop.length }}     {# total items #}
{% else %}
  No items found.
{% endfor %}

{# Limit and offset #}
{% for product in collection.products limit: 4 %}
{% for product in collection.products offset: 4 %}

{# Range #}
{% for i in (1..5) %}
```

## Theme Tags

```liquid
{% render 'snippet-name' %}
{% render 'product-card', product: product, show_price: true %}

{% section 'header' %}

{% style %}
  .my-class { color: {{ settings.primary_color }}; }
{% endstyle %}

{% javascript %}
  console.log('Section JS');
{% endjavascript %}

{{ 'custom.css' | asset_url | stylesheet_tag }}
{{ 'custom.js' | asset_url | script_tag }}

{% comment %} This won't render {% endcomment %}

{% raw %}
  {{ this won't be processed }}
{% endraw %}
```

## Section & Block Tags

```liquid
{# Access section settings #}
{{ section.settings.heading }}
{{ section.id }}

{# Iterate blocks #}
{% for block in section.blocks %}
  {% case block.type %}
    {% when 'text' %}
      <p {{ block.shopify_attributes }}>{{ block.settings.text }}</p>
    {% when 'image' %}
      {{ block.settings.image | image_url: width: 600 | image_tag }}
  {% endcase %}
{% endfor %}

{# Block shopify_attributes is required for theme editor support #}
<div {{ block.shopify_attributes }}>
  ...
</div>
```
