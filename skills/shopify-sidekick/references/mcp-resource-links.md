# MCP Resource Links — Shopify Sidekick Format

Model Context Protocol (MCP) Resource Links are the optimized response format for Sidekick data source extensions. Using this format ensures Sidekick renders branded result cards and can link results to action intents.

## Table of Contents

1. [Format Specification](#format-specification)
2. [Field Reference](#field-reference)
3. [URI Format](#uri-format)
4. [Supported Application Types](#supported-application-types)
5. [Connecting to Action Intents](#connecting-to-action-intents)
6. [Examples](#examples)

---

## Format Specification

Every data source tool handler should return results wrapped in this structure:

```javascript
return {
  results: [
    {
      type: 'resource_link',
      uri: 'gid:application/<type>/<id>',
      name: 'Display Name',
      mimeType: 'application/<type>',
      description: 'Optional subtitle text'
    }
  ]
};
```

## Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Always `"resource_link"` — identifies this as an MCP resource |
| `uri` | string | Yes | Unique resource identifier in GID format |
| `name` | string | Yes | Primary display name shown in Sidekick result cards |
| `mimeType` | string | Yes | Resource type — determines which action intent handles clicks |
| `description` | string | No | Subtitle text shown below the name on result cards |

## URI Format

```
gid:application/<type>/<id>
```

The URI uniquely identifies a resource and connects it to action intents. When a merchant clicks a result card, Sidekick resolves the URI against registered intents.

**Examples:**

- `gid:application/product/12345` — A Shopify product
- `gid:application/email/67890` — An email campaign
- `gid:application/order/11111` — An order
- `gid:application/spirit/22222` — A custom app resource

## Supported Application Types

| mimeType | Intent Action | Description |
|----------|--------------|-------------|
| `application/product` | open, edit | Shopify products |
| `application/email` | open, edit | Email campaigns |
| `application/order` | open | Orders |

More types are expected as Sidekick extensions mature. You can also define custom application types for app-specific resources.

## Connecting to Action Intents

The `mimeType` field is the bridge between data sources and action intents. When your data source returns a result with `mimeType: 'application/product'`, and you have an action intent registered for `type: 'application/product'`, clicking the result card invokes that intent.

```
Data Source returns:
  mimeType: 'application/product'  ──→  Matches intent type: 'application/product'
  uri: 'gid:application/product/123'    ──→  Fills URL template: /products/{id}/edit
                                              ──→  Merchant navigates to /products/123/edit
```

This means you should always ensure your data source `mimeType` values match the `type` values in your action intent TOML configurations.

## Examples

### Spirit Product Search Results

```javascript
return {
  results: products.map(p => ({
    type: 'resource_link',
    uri: `gid:application/product/${p.id.split('/').pop()}`,
    name: p.title,
    mimeType: 'application/product',
    description: `$${p.price} · ${p.abv}% ABV · ${p.origin}`
  }))
};
```

### Order Fulfillment Results

```javascript
return {
  results: orders.map(o => ({
    type: 'resource_link',
    uri: `gid:application/order/${o.id.split('/').pop()}`,
    name: `${o.name} — ${o.customer?.displayName || 'Guest'}`,
    mimeType: 'application/order',
    description: `${o.total} · ${o.fulfillmentStatus} · ${o.itemCount} items`
  }))
};
```

### Email Campaign Results

```javascript
return {
  results: campaigns.map(c => ({
    type: 'resource_link',
    uri: `gid:application/email/${c.id}`,
    name: c.subject,
    mimeType: 'application/email',
    description: `Sent ${c.sentDate} · ${c.openRate}% open rate`
  }))
};
```

## Best Practices

- Always include a `description` — it provides valuable context on result cards
- Keep `name` concise (under 60 characters) for clean card rendering
- Use the actual Shopify GID in the `uri` when referencing Shopify resources
- For custom app resources, use a consistent `application/<your-type>` pattern
- Limit results to 50 items maximum (Shopify hard limit)
- Return results in a meaningful sort order — Sidekick presents them as-is
