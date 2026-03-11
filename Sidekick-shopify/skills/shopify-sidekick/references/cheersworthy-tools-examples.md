# Cheersworthy Sidekick Tools — Full Examples

Complete implementation examples for the Cheersworthy spirits store's Sidekick integration.

## Example 1: Spirit Search with Faceted Filtering

A merchant asks Sidekick: "Show me all bourbon under $50 that's in stock"

### tools.json entry

```json
{
  "$schema": "https://extensions.shopifycdn.com/shopifycloud/schemas/v1/tool.json",
  "name": "search_spirits",
  "description": "Search the Cheersworthy spirits catalog with filters for category, price, ABV, origin, tasting notes, and stock status.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Free-text search across product names and descriptions"
      },
      "category": {
        "type": "string",
        "enum": ["whiskey", "bourbon", "scotch", "vodka", "tequila", "mezcal", "rum", "gin", "wine", "cocktail-kit"],
        "description": "Spirit category"
      },
      "price_min": { "type": "number", "description": "Minimum price in USD" },
      "price_max": { "type": "number", "description": "Maximum price in USD" },
      "min_abv": { "type": "number", "description": "Minimum ABV %" },
      "max_abv": { "type": "number", "description": "Maximum ABV %" },
      "origin": { "type": "string", "description": "Country or region" },
      "in_stock": { "type": "boolean", "description": "Only show in-stock items" },
      "sort_by": {
        "type": "string",
        "enum": ["relevance", "price_asc", "price_desc", "newest", "best_selling"],
        "description": "Sort order"
      },
      "limit": { "type": "number", "description": "Max results (default 20, max 50)" }
    }
  }
}
```

### Handler Implementation

```javascript
shopify.tools.register('search_spirits', async (params) => {
  const {
    query = '',
    category,
    price_min,
    price_max,
    min_abv,
    max_abv,
    origin,
    in_stock = false,
    sort_by = 'relevance',
    limit = 20
  } = params;

  // Build Shopify search query string
  const filters = [];
  if (query) filters.push(query);
  if (category) filters.push(`product_type:${category}`);
  if (in_stock) filters.push('inventory_total:>0');
  if (origin) filters.push(`tag:origin-${origin.toLowerCase().replace(/\s+/g, '-')}`);

  // Map sort
  const sortMap = {
    relevance: 'RELEVANCE',
    price_asc: 'PRICE',
    price_desc: 'PRICE',
    newest: 'CREATED_AT',
    best_selling: 'BEST_SELLING',
  };

  const graphqlQuery = `
    query SearchSpirits($query: String!, $first: Int!, $sortKey: ProductSortKeys, $reverse: Boolean) {
      products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
        edges {
          node {
            id
            title
            productType
            vendor
            totalInventory
            priceRangeV2 {
              minVariantPrice { amount currencyCode }
              maxVariantPrice { amount currencyCode }
            }
            metafields(identifiers: [
              { namespace: "cheersworthy", key: "abv" },
              { namespace: "cheersworthy", key: "origin" },
              { namespace: "cheersworthy", key: "age_statement" },
              { namespace: "cheersworthy", key: "tasting_notes" }
            ]) {
              key
              value
            }
            featuredImage { url altText }
          }
        }
      }
    }
  `;

  const response = await fetch('shopify:admin/api/graphql.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: graphqlQuery,
      variables: {
        query: filters.join(' '),
        first: Math.min(limit, 50),
        sortKey: sortMap[sort_by] || 'RELEVANCE',
        reverse: sort_by === 'price_desc',
      },
    }),
  });

  const data = await response.json();
  let products = data.data.products.edges.map(({ node }) => node);

  // Post-filter by price and ABV (can't do in GraphQL query string)
  if (price_min !== undefined) {
    products = products.filter(p =>
      parseFloat(p.priceRangeV2.minVariantPrice.amount) >= price_min
    );
  }
  if (price_max !== undefined) {
    products = products.filter(p =>
      parseFloat(p.priceRangeV2.minVariantPrice.amount) <= price_max
    );
  }
  if (min_abv !== undefined || max_abv !== undefined) {
    products = products.filter(p => {
      const abvField = p.metafields.find(m => m?.key === 'abv');
      if (!abvField) return false;
      const abv = parseFloat(abvField.value);
      if (min_abv !== undefined && abv < min_abv) return false;
      if (max_abv !== undefined && abv > max_abv) return false;
      return true;
    });
  }

  // Format as MCP Resource Links
  return {
    results: products.map(p => {
      const price = p.priceRangeV2.minVariantPrice.amount;
      const abv = p.metafields.find(m => m?.key === 'abv')?.value;
      const age = p.metafields.find(m => m?.key === 'age_statement')?.value;

      let description = `$${price}`;
      if (abv) description += ` · ${abv}% ABV`;
      if (age) description += ` · ${age}`;
      description += ` · ${p.totalInventory} in stock`;

      return {
        type: 'resource_link',
        uri: `gid:application/product/${p.id.split('/').pop()}`,
        name: p.title,
        mimeType: 'application/product',
        description,
      };
    }),
  };
});
```

## Example 2: Order Fulfillment Status

Merchant asks: "What orders are pending fulfillment this week?"

```json
{
  "name": "pending_orders",
  "description": "Get orders pending fulfillment, filterable by date range and status.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "status": {
        "type": "string",
        "enum": ["unfulfilled", "partially_fulfilled", "fulfilled", "restocked"],
        "description": "Fulfillment status filter"
      },
      "created_after": { "type": "string", "format": "date-time" },
      "created_before": { "type": "string", "format": "date-time" },
      "limit": { "type": "number" }
    }
  }
}
```

```javascript
shopify.tools.register('pending_orders', async ({ status = 'unfulfilled', created_after, created_before, limit = 20 }) => {
  let query = `fulfillment_status:${status}`;
  if (created_after) query += ` created_at:>${created_after}`;
  if (created_before) query += ` created_at:<${created_before}`;

  const response = await fetch('shopify:admin/api/graphql.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
        query ($query: String!, $first: Int!) {
          orders(first: $first, query: $query) {
            edges {
              node {
                id name createdAt
                totalPriceSet { shopMoney { amount currencyCode } }
                displayFulfillmentStatus
                customer { displayName }
                lineItems(first: 5) { edges { node { title quantity } } }
              }
            }
          }
        }
      `,
      variables: { query, first: Math.min(limit, 50) },
    }),
  });

  const data = await response.json();

  return {
    results: data.data.orders.edges.map(({ node }) => ({
      type: 'resource_link',
      uri: `gid:application/order/${node.id.split('/').pop()}`,
      name: `${node.name} — ${node.customer?.displayName || 'Guest'}`,
      mimeType: 'application/order',
      description: `${node.totalPriceSet.shopMoney.amount} ${node.totalPriceSet.shopMoney.currencyCode} · ${node.displayFulfillmentStatus} · ${node.lineItems.edges.length} items`,
    })),
  };
});
```

## Example 3: Age Verification Analytics

Merchant asks: "How many visitors were blocked by age verification this month?"

```json
{
  "name": "age_verification_stats",
  "description": "Get age verification gate analytics including pass/fail rates and conversion impact.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "period": {
        "type": "string",
        "enum": ["today", "7d", "30d", "90d"],
        "description": "Time period"
      }
    }
  }
}
```

```javascript
shopify.tools.register('age_verification_stats', async ({ period = '30d' }) => {
  // This would hit your app's backend analytics endpoint
  const response = await fetch(`/api/analytics/age-verification?period=${period}`);
  const stats = await response.json();

  return {
    period,
    total_checks: stats.total,
    passed: stats.passed,
    declined: stats.declined,
    pass_rate: `${((stats.passed / stats.total) * 100).toFixed(1)}%`,
    conversion_after_pass: `${stats.conversion_rate}%`,
    top_declined_regions: stats.top_declined_regions,
  };
});
```
