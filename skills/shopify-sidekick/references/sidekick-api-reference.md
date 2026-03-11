# Sidekick API Reference

Complete reference for Shopify Sidekick extension APIs.

## Table of Contents

1. [Data Source Extensions](#data-source-extensions)
2. [Action Intent Extensions](#action-intent-extensions)
3. [Tool Schema Specification](#tool-schema-specification)
4. [Intent Schema Specification](#intent-schema-specification)
5. [MCP Resource Links](#mcp-resource-links)
6. [Direct API Access](#direct-api-access)
7. [Error Handling](#error-handling)

---

## Data Source Extensions

### Target
`admin.app.tools.data`

### Extension Type
`ui_extension` (runs headlessly — no UI rendered)

### TOML Configuration

```toml
[[extensions]]
name = "My Tools"
description = "256-token description of what data your tools expose"
handle = "my-tools"
type = "ui_extension"

[[extensions.targeting]]
module = "./src/index.js"
target = "admin.app.tools.data"
tools = "./tools.json"
instructions = "./instructions.md"
```

### Registration API

```javascript
// src/index.js
export default () => {
  shopify.tools.register('tool_name', async (inputParams) => {
    // inputParams matches the inputSchema from tools.json
    // Return data (must be under 4,000 tokens, within 400ms)
    return { results: [...] };
  });
};
```

### Available APIs Inside Tools

| API | Usage | Auth |
|-----|-------|------|
| Direct API | `fetch('shopify:admin/api/graphql.json', {...})` | Automatic (app scopes) |
| App Backend | `fetch('/api/your-endpoint', {...})` | Session token |
| External APIs | `fetch('https://external-api.com', {...})` | You manage |

### Response Format

Best practice — use MCP Resource Links:

```javascript
return {
  results: [
    {
      type: 'resource_link',
      uri: 'gid:application/email/123',
      name: 'Campaign: Summer Sale',
      mimeType: 'application/email',
      description: 'Sent Jul 15 · 42% open rate'
    }
  ]
};
```

Plain data also works:

```javascript
return {
  total: 5,
  items: [
    { id: '123', title: 'Buffalo Trace', abv: 45.0, price: '29.99' }
  ]
};
```

---

## Action Intent Extensions

### Target
`admin.app.intent.link`

### Extension Type
`admin_link`

### TOML Configuration

```toml
[[extensions]]
name = "Open Email"
description = "Edit an email campaign"
handle = "open-email"
type = "admin_link"

[[extensions.targeting]]
target = "admin.app.intent.link"
url = "/edit/{id}"

[[extensions.targeting.intents]]
type = "application/email"
action = "open"
schema = "./email-schema.json"
```

### URL Template Variables

The `url` field supports template variables that Sidekick fills from the matched resource:

- `{id}` — Resource ID
- Other fields from the intent schema

### Supported Intent Actions

- `open` — Navigate to view/edit a resource
- More actions expected as the API matures

### Supported Application Types

| Type | Description |
|------|-------------|
| `application/email` | Email campaigns |
| `application/product` | Products |

More types will be added. Check Shopify's schema registry for the latest.

---

## Tool Schema Specification

### tools.json Format

```json
[
  {
    "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/tool.json",
    "name": "tool_name",
    "description": "What this tool does (512 char max)",
    "inputSchema": {
      "type": "object",
      "properties": {
        "param_name": {
          "type": "string|number|boolean|array|object",
          "description": "What this parameter does",
          "enum": ["optional", "allowed", "values"]
        }
      },
      "required": ["required_param_names"]
    }
  }
]
```

### Supported Input Types

- `string` — Text input, optionally with `enum` for fixed options
- `number` — Numeric input
- `boolean` — True/false
- `array` — List of items with `items` schema
- `object` — Nested object with its own `properties`

### Date/Time Parameters

Use `format: "date-time"` for temporal filters:

```json
{
  "type": "object",
  "properties": {
    "from": { "type": "string", "format": "date-time" },
    "to": { "type": "string", "format": "date-time" }
  }
}
```

---

## Intent Schema Specification

### intent-schema.json Format

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/<type>.json"
  }
}
```

### Custom Input Schema

You can define custom properties instead of using `$ref`:

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "inputSchema": {
    "type": "object",
    "properties": {
      "id": { "type": "string" },
      "action": { "type": "string", "enum": ["edit", "view", "duplicate"] }
    },
    "required": ["id"]
  }
}
```

---

## MCP Resource Links

Model Context Protocol Resource Links format — optimized for Sidekick rendering.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | Always `"resource_link"` |
| uri | string | Yes | Unique resource identifier (GID format) |
| name | string | Yes | Display name shown in Sidekick results |
| mimeType | string | Yes | Resource type (e.g., `application/email`) |
| description | string | No | Subtitle/additional context |

### URI Format

```
gid:application/<type>/<id>
```

Examples:
- `gid:application/email/123`
- `gid:application/product/456`
- `gid:application/spirit/789`

The URI connects data results to action intents. When a merchant clicks a result, Sidekick resolves the URI against registered intents to find the matching action.

---

## Direct API Access

Inside Sidekick extensions, use the Direct API for Shopify data:

```javascript
const response = await fetch('shopify:admin/api/graphql.json', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `{ shop { name } }`,
  }),
});
const data = await response.json();
```

This uses your app's OAuth scopes automatically — no token management needed.

---

## Error Handling

Return errors as structured responses:

```javascript
shopify.tools.register('my_tool', async (params) => {
  try {
    // ... your logic
    return { results: [...] };
  } catch (error) {
    return {
      error: {
        message: 'Unable to fetch data',
        code: 'DATA_FETCH_ERROR',
      },
    };
  }
});
```

Sidekick will present the error message to the merchant gracefully.
