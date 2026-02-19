# Shopify Storefront API Skill
## For WhiskeySomm × Cheersworthy Integration

---

## Overview

This skill covers how to connect WhiskeySomm to the Cheersworthy Shopify store using the **Shopify Storefront API (GraphQL)**. This is a public-facing, unauthenticated API — no user login required. It is read-only and safe to call from a Next.js API route.

---

## Store Details

- **Store domain:** `cheersworthy.myshopify.com`
- **Live domain (when launched):** `cheersworthy.com`
- **Platform:** Shopify (standard product pages with custom metafields for flavor clouds)
- **Access method:** Storefront API with public access token

---

## Environment Variables Required

```
SHOPIFY_STORE_DOMAIN=cheersworthy.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=your_public_storefront_access_token
```

The storefront token is **not** the Admin API key. It is generated in:
Shopify Admin → Apps → Develop Apps → [Your App] → Storefront API access token

Required API scopes:
- `unauthenticated_read_product_listings`
- `unauthenticated_read_product_tags`
- `unauthenticated_read_product_metafields`

---

## Base API Setup (`/lib/shopify.ts`)

```typescript
const SHOPIFY_ENDPOINT = `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`

export async function shopifyFetch(query: string, variables?: object) {
  const response = await fetch(SHOPIFY_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_TOKEN!,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status}`)
  }

  const json = await response.json()

  if (json.errors) {
    throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors)}`)
  }

  return json.data
}
```

---

## Key Query: Fetch All Products with Metafields

```graphql
query GetAllProducts {
  products(first: 250) {
    edges {
      node {
        id
        title
        handle
        descriptionHtml
        tags
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 3) {
          edges {
            node {
              url
              altText
            }
          }
        }
        metafields(identifiers: [
          { namespace: "custom", key: "flavor_cloud_image" },
          { namespace: "custom", key: "flavor_profile" },
          { namespace: "custom", key: "short_description" }
        ]) {
          key
          value
          reference {
            ... on MediaImage {
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
}
```

**Important:** The metafield namespace (`custom`) and keys (`flavor_cloud_image`, `flavor_profile`, `short_description`) are placeholders. Confirm the exact names in Cheersworthy's Shopify Admin → Products → any product → scroll to Metafields section. Update the query to match exactly.

---

## Product URL Format

Product pages follow standard Shopify URL structure:
```
https://cheersworthy.com/products/[product-handle]
```

Always use the `handle` field from the API response to construct product URLs.

**Always append UTM parameters for tracking:**
```typescript
const productUrl = `https://cheersworthy.com/products/${handle}?utm_source=whiskeysomm&utm_medium=app&utm_campaign=collection_match`
```

---

## Key Query: Fetch Single Product by Handle

```graphql
query GetProduct($handle: String!) {
  product(handle: $handle) {
    id
    title
    handle
    descriptionHtml
    images(first: 2) {
      edges {
        node {
          url
          altText
        }
      }
    }
    metafields(identifiers: [
      { namespace: "custom", key: "flavor_cloud_image" },
      { namespace: "custom", key: "flavor_profile" },
      { namespace: "custom", key: "short_description" }
    ]) {
      key
      value
      reference {
        ... on MediaImage {
          image {
            url
          }
        }
      }
    }
  }
}
```

---

## Parsing Metafield Values

Metafields return differently depending on type:

```typescript
// Text metafield — value is a plain string
const flavorProfile = metafields.find(m => m.key === 'flavor_profile')?.value

// File/image metafield — value is in reference.image.url
const flavorCloudUrl = metafields
  .find(m => m.key === 'flavor_cloud_image')
  ?.reference?.image?.url
```

Always null-check metafield values — not every product may have them populated.

---

## Suggestion Selection Flow

The `/api/suggestions` route should:

1. Fetch all products from Shopify (cache this response — it won't change often)
2. Build a simplified product list for Claude:
```typescript
const productList = products.map(p => ({
  handle: p.handle,
  title: p.title,
  tags: p.tags,
  flavor_profile: p.metafields.find(m => m.key === 'flavor_profile')?.value ?? ''
}))
```
3. Send productList + user's collection_profile to Claude
4. Ask Claude to return exactly 4 product handles
5. Fetch full data for those 4 handles
6. Return to frontend

---

## Caching Recommendation

The full product list query is expensive. Use Next.js fetch caching:

```typescript
const response = await fetch(SHOPIFY_ENDPOINT, {
  method: 'POST',
  headers: { ... },
  body: JSON.stringify({ query }),
  next: { revalidate: 3600 } // cache for 1 hour
})
```

---

## Error Handling Rules

- If Shopify returns fewer than 4 matching products, fill remaining slots with highest-tagged products (most tags = broadest appeal)
- If Storefront token is missing or invalid, silently hide the Cheersworthy panel — do not break the recommendation flow
- Never let a Shopify API failure affect the core Claude recommendation

---

## Store Status Note

Cheersworthy is currently in pre-launch (password protected). The Storefront API will not return products until the store is live OR the app is configured with proper Storefront API access during development. Build and test all Shopify integration last, after core recommendation flow is working.
