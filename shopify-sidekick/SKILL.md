---
name: shopify-sidekick
description: "Expert skill for building Shopify Sidekick AI extensions — data source tools and action intents that let merchants interact with your app through Shopify's native AI assistant. Use this skill whenever the user mentions Sidekick, Shopify AI, Shopify Sidekick extensions, app tools, admin.app.tools.data, admin.app.intent.link, MCP resource links in Shopify, exposing app data to Sidekick, registering intents, building Sidekick data sources, building Sidekick actions, tools.json, shopify.tools.register, or any integration between a Shopify app and Sidekick. Also trigger when the user wants to make their app's data searchable in Shopify Admin, let merchants invoke app actions through natural language, or build AI-powered extensions for the Shopify admin. This is the go-to skill for all Sidekick extension development for Cheersworthy.com and any Shopify app."
---

# Shopify Sidekick Extension Development

Build Sidekick app extensions that expose your app's data and actions to Shopify's AI assistant, letting merchants search app data and invoke actions through natural language.

## Before You Start

Read the shared references for store and platform context:
- `references/cheersworthy-config.md` — Store identity and compliance context
- `references/shopify-dev-patterns.md` — Shopify CLI commands, extension architecture

## What Sidekick Extensions Do

Sidekick is Shopify's built-in AI assistant. Extensions let your app participate in the Sidekick experience through two surfaces:

1. **Data Sources** (target: `admin.app.tools.data`) — Expose searchable data. Merchants ask Sidekick questions and your extension returns results with branded cards. Think: "Show me my best performing email campaigns" or "Find whiskey products with ABV over 40%."

2. **Action Intents** (target: `admin.app.intent.link`) — Register actions Sidekick can invoke. Merchants say "Edit the bourbon collection email" and Sidekick navigates them directly to the right page in your app.

## Constraints & Limits

These are hard limits from Shopify — design within them:

| Constraint | Limit |
|-----------|-------|
| Tools per app | 20 maximum |
| Intents per app | 5 maximum |
| Response time | 400ms |
| Response size | 4,000 tokens |
| Array items in response | 50 maximum |
| Results per query | 50 maximum |
| Tool name length | 64 characters |
| Tool description length | 512 characters |
| Extension description | 256 tokens |
| Instructions file | 2,048 tokens |

The 400ms response time is the most critical constraint — your data source must be fast. Use caching, pre-computed results, and efficient queries.

## Building Data Source Extensions

### Step 1: Generate the Extension

```bash
shopify app generate extension --template app_tools --name cheersworthy-tools
```

This creates a headless UI extension in `extensions/cheersworthy-tools/`.

### Step 2: File Structure

```
extensions/cheersworthy-tools/
├── shopify.extension.toml    # Extension config
├── src/index.js              # Tool handler implementations
├── tools.json                # Tool schemas (names, descriptions, input params)
├── instructions.md           # When/how to use these tools (2,048 token limit)
├── package.json
├── tsconfig.json
└── shopify.d.ts              # Type definitions
```

### Step 3: Configure (shopify.extension.toml)

```toml
[[extensions]]
name = "Cheersworthy Tools"
description = "Search spirits inventory, find products by tasting notes, check order fulfillment status, and get collection analytics for the Cheersworthy spirits store."
handle = "cheersworthy-tools"
type = "ui_extension"

[[extensions.targeting]]
module = "./src/index.js"
target = "admin.app.tools.data"
tools = "./tools.json"
instructions = "./instructions.md"
```

The `description` field (256 token limit) tells Sidekick when your tools are relevant. Make it specific about what data your extension provides.

### Step 4: Define Tool Schemas (tools.json)

Each tool has a name, description, and JSON Schema input definition:

```json
[
  {
    "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/tool.json",
    "name": "search_spirits",
    "description": "Search the spirits catalog by name, category, origin, or tasting notes. Returns product details including ABV, age statement, and availability.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "Full text search across product names and descriptions"
        },
        "category": {
          "type": "string",
          "enum": ["whiskey", "bourbon", "vodka", "tequila", "mezcal", "rum", "gin", "wine"],
          "description": "Spirit category filter"
        },
        "min_abv": {
          "type": "number",
          "description": "Minimum ABV percentage"
        },
        "max_abv": {
          "type": "number",
          "description": "Maximum ABV percentage"
        },
        "origin": {
          "type": "string",
          "description": "Country or region of origin"
        },
        "price_range": {
          "type": "object",
          "properties": {
            "min": { "type": "number" },
            "max": { "type": "number" }
          }
        },
        "in_stock": {
          "type": "boolean",
          "description": "Filter to only in-stock items"
        },
        "sortKey": {
          "type": "string",
          "enum": ["PRICE", "TITLE", "CREATED_AT", "BEST_SELLING"],
          "description": "Sort order for results"
        }
      }
    }
  },
  {
    "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/tool.json",
    "name": "get_product_details",
    "description": "Get detailed information about a specific spirit including tasting notes, awards, serving suggestions, and inventory levels.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "product_id": {
          "type": "string",
          "description": "The Shopify product GID"
        }
      },
      "required": ["product_id"]
    }
  },
  {
    "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/tool.json",
    "name": "collection_analytics",
    "description": "Get performance analytics for a spirits collection including sales volume, revenue, and top sellers.",
    "inputSchema": {
      "type": "object",
      "properties": {
        "collection_id": {
          "type": "string",
          "description": "The Shopify collection GID"
        },
        "period": {
          "type": "string",
          "enum": ["7d", "30d", "90d", "12m"],
          "description": "Time period for analytics"
        }
      },
      "required": ["collection_id"]
    }
  }
]
```

### Step 5: Implement Tool Handlers (src/index.js)

```javascript
export default () => {
  // Register each tool defined in tools.json
  shopify.tools.register('search_spirits', async (params) => {
    // Use Direct API to query products via GraphQL
    const query = buildProductQuery(params);
    const response = await fetch('shopify:admin/api/graphql.json', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
    const data = await response.json();

    // Return MCP Resource Links format for optimal Sidekick rendering
    return {
      results: data.data.products.edges.map(({ node }) => ({
        type: 'resource_link',
        uri: `gid:application/product/${node.id}`,
        name: node.title,
        mimeType: 'application/product',
        description: `${node.variants.edges[0]?.node.price} · ${getMetafield(node, 'abv')}% ABV`,
      })),
    };
  });

  shopify.tools.register('get_product_details', async ({ product_id }) => {
    const response = await fetch('shopify:admin/api/graphql.json', {
      method: 'POST',
      body: JSON.stringify({
        query: PRODUCT_DETAIL_QUERY,
        variables: { id: product_id },
      }),
    });
    return response.json();
  });

  shopify.tools.register('collection_analytics', async ({ collection_id, period }) => {
    const response = await fetch(`/api/analytics/collection/${collection_id}?period=${period}`);
    return response.json();
  });
};

function buildProductQuery(params) {
  // Build GraphQL query with filters from params
  let queryStr = '';
  if (params.query) queryStr += params.query;
  if (params.category) queryStr += ` product_type:${params.category}`;
  if (params.in_stock) queryStr += ' inventory_total:>0';

  return `{
    products(first: 20, query: "${queryStr}") {
      edges {
        node {
          id
          title
          productType
          variants(first: 1) { edges { node { price } } }
          metafields(identifiers: [
            { namespace: "cheersworthy", key: "abv" },
            { namespace: "cheersworthy", key: "tasting_notes" },
            { namespace: "cheersworthy", key: "origin" },
            { namespace: "cheersworthy", key: "age_statement" }
          ]) {
            key
            value
          }
        }
      }
    }
  }`;
}

const PRODUCT_DETAIL_QUERY = `
  query ($id: ID!) {
    product(id: $id) {
      id title description productType vendor tags
      variants(first: 10) {
        edges { node { id title price inventoryQuantity } }
      }
      metafields(identifiers: [
        { namespace: "cheersworthy", key: "tasting_notes" },
        { namespace: "cheersworthy", key: "abv" },
        { namespace: "cheersworthy", key: "origin" },
        { namespace: "cheersworthy", key: "distillery" },
        { namespace: "cheersworthy", key: "age_statement" },
        { namespace: "cheersworthy", key: "awards" },
        { namespace: "cheersworthy", key: "pairing_notes" },
        { namespace: "cheersworthy", key: "serving_suggestions" }
      ]) {
        key value type
      }
      images(first: 5) {
        edges { node { url altText } }
      }
    }
  }
`;
```

### Step 6: Write Instructions (instructions.md)

This file (2,048 token limit) tells Sidekick how and when to use your tools:

```markdown
# Cheersworthy Tools

These tools provide access to the Cheersworthy spirits catalog and analytics.

## When to use

- Use `search_spirits` when a merchant asks about products, inventory, or wants to find specific spirits by category, origin, tasting notes, or price range.
- Use `get_product_details` when a merchant asks about a specific product's details, tasting notes, awards, or stock levels.
- Use `collection_analytics` when a merchant asks about sales performance, revenue, or top sellers for a collection.

## Important guidelines

- Always confirm destructive operations with the merchant before proceeding.
- For price-related queries, default currency is USD.
- ABV values are percentages (e.g., 43.0 means 43% alcohol by volume).
- The `search_spirits` tool supports combining multiple filters in a single query.
```

## Building Action Intent Extensions

Action intents let Sidekick navigate merchants to the right page in your app when they describe what they want to do. Here are Cheersworthy-specific examples showing the pattern:

### Cheersworthy Intent Examples

**1. Open a spirit product for editing**
Merchant says: "Open the Blanton's Single Barrel page" → Sidekick navigates to `/products/{id}/edit`

**2. Edit a spirits collection**
Merchant says: "Edit the bourbon collection" → Sidekick navigates to `/collections/{id}/edit`

**3. View an order's fulfillment details**
Merchant says: "Show me order #1042 shipping status" → Sidekick navigates to `/orders/{id}/fulfillment`

Each intent follows the same pattern: declare it in TOML, define a schema, and Sidekick handles the routing.

### Step 1: Generate the Extension

```bash
shopify app generate extension --template admin_intent_link --name open-product
```

### Step 2: File Structure

```
extensions/open-product/
├── product-schema.json         # Intent input schema
├── shopify.extension.toml      # Config with intent declaration
└── README.md
```

### Step 3: Configure with Intents

```toml
[[extensions]]
name = "Open Product"
description = "Navigate to a product editing page in the Cheersworthy app"
handle = "open-product"
type = "admin_link"

[[extensions.targeting]]
target = "admin.app.intent.link"
url = "/products/{id}/edit"

[[extensions.targeting.intents]]
type = "application/product"
action = "edit"
schema = "./product-schema.json"
```

Note: The `action` field supports `"open"` and `"edit"`. Use `"edit"` when the intent navigates to an editable view, `"open"` for read-only views.

### Step 4: Define Intent Schema

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/intent.json",
  "inputSchema": {
    "$ref": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/application/product.json"
  }
}
```

When Sidekick determines a merchant wants to open/edit a product, it resolves the intent to your app and navigates the merchant to your specified URL with the product ID filled in.

### Connecting Data Sources to Intents

The real power comes from pairing data tools with action intents. When your data source returns MCP Resource Links with the right `mimeType`, clicking a result card automatically invokes the matching intent:

```javascript
// Data source returns this for a spirit search:
{
  type: 'resource_link',
  uri: 'gid:application/product/12345',
  name: "Blanton's Single Barrel",
  mimeType: 'application/product',          // ← matches intent type
  description: '$64.99 · 46.5% ABV · Bourbon'
}
// Clicking this card invokes the "open-product" intent → navigates to /products/12345/edit
```

## MCP Resource Links Format

Sidekick is optimized for results in Model Context Protocol Resource Links format. Always return data in this structure from data source tools. For the full specification and advanced patterns, see `references/mcp-resource-links.md`.

```javascript
{
  results: [
    {
      type: 'resource_link',
      uri: 'gid:application/<type>/<id>',   // Unique resource identifier
      name: 'Display Name',                  // What Sidekick shows the merchant
      mimeType: 'application/<type>',        // Resource type
      description: 'Optional subtitle'       // Additional context
    }
  ]
}
```

The `uri` field connects data results to action intents — when a merchant clicks a result card, Sidekick can invoke the matching intent to navigate to that resource in your app.

## Performance Optimization

The 400ms response time limit is strict. Strategies:

1. **Cache aggressively** — Use Redis or in-memory caching for frequently accessed data
2. **Pre-compute** — Build search indexes for common queries
3. **Limit response size** — Return only essential fields, respect the 50-item limit
4. **Use Direct API** — Faster than going through your backend for Shopify data
5. **Parallelize** — If a tool needs multiple data sources, fetch concurrently
6. **Use `metafields(identifiers: [...])` instead of `metafields(first: N)`** — Fetches only the specific metafields you need, avoiding unnecessary data transfer

## Common Mistakes to Avoid

These are easy to get wrong — each one will break your extension:

**1. Confusing data sources with action intents.**
`tools.json` and `shopify.tools.register()` are ONLY for data source extensions (`admin.app.tools.data`). Action intents (`admin.app.intent.link`) are configured entirely in `shopify.extension.toml` with a separate schema JSON file. Never put intent configuration in tools.json.

**2. Using `shopify.extension.toml` for data sources but `shopify.app.toml` for the extension.**
The app-level config (`shopify.app.toml`) declares your app. Each extension gets its own `shopify.extension.toml` inside its `extensions/<name>/` folder. Don't mix them up.

**3. Returning data in the wrong format.**
Sidekick expects MCP Resource Links format from data sources. If you return raw JSON objects instead of `{ results: [{ type: 'resource_link', uri, name, mimeType }] }`, Sidekick can't render your results as branded cards and can't link them to action intents.

**4. Exceeding the 400ms response time.**
This is a hard cutoff, not a guideline. If your handler takes 401ms, it times out. Always use Direct API (`fetch('shopify:admin/api/graphql.json', ...)`) instead of routing through your backend. Cache aggressively. Use `metafields(identifiers: [...])` instead of `metafields(first: N)` to avoid fetching unnecessary data.

**5. Using inconsistent metafield namespaces.**
All Cheersworthy spirit metafields use the `cheersworthy` namespace. Don't use `custom`, `spirits`, `spirit_attributes`, or any other namespace — it creates confusion across the storefront theme, Sidekick tools, and admin UI.

## Current Status

Sidekick app extensions are in **developer preview** (as of Winter '26 Edition). Shopify is working with partners in Q1 2026 to build out the ecosystem. You need to submit interest through Shopify's form for early access. The API surface may change before GA.

## Reference Files

For deeper dives, see `references/`:
- `references/sidekick-api-reference.md` — Complete API reference with all schemas
- `references/mcp-resource-links.md` — MCP format specification and examples
- `references/cheersworthy-tools-examples.md` — Full example implementations for Cheersworthy
- `references/cheersworthy-config.md` — Store identity, brand, and compliance context
- `references/shopify-dev-patterns.md` — Common Shopify CLI commands and development patterns
