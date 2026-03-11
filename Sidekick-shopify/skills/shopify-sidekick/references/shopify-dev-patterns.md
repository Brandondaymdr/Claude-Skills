# Shopify Development Patterns

Common patterns, conventions, and best practices shared across all Shopify skills in this plugin.

## Shopify CLI Essentials

```bash
# Create a new app
shopify app init

# Generate extensions
shopify app generate extension --template <template> --name <name>

# Start dev server
shopify app dev

# Deploy
shopify app deploy
```

## API Version Strategy

Always use the latest stable API version. Shopify releases quarterly (January, April, July, October). Pin to a specific version in config but update regularly.

```graphql
# Check current API version in requests
POST https://{shop}.myshopify.com/admin/api/2025-01/graphql.json
```

## Authentication Patterns

### Session Tokens (Embedded Apps)
Shopify's default for embedded apps. App Bridge handles token refresh automatically.

### OAuth (Non-Embedded)
Use for apps that run outside Shopify Admin. Follow the standard OAuth 2.0 flow.

### Direct API Access (Extensions)
Sidekick extensions and UI extensions use Direct API — no separate auth needed. The extension sandbox provides scoped API access matching your app's permissions.

## Extension Architecture

All Shopify extensions follow this pattern:

```
extensions/<extension-name>/
├── shopify.extension.toml    # Config: targets, capabilities, permissions
├── src/
│   └── index.{js,ts,jsx,tsx} # Entry point
├── package.json
└── locales/                  # Optional i18n
```

### Extension Targets

Each extension declares what surface it plugs into:
- `admin.app.tools.data` — Sidekick data tools (headless)
- `admin.app.intent.link` — Sidekick action intents
- `admin.product-details.block.render` — Product page blocks
- `purchase.checkout.block.render` — Checkout UI extensions
- `customer-account.page.render` — Customer account pages

## GraphQL Best Practices

Shopify strongly prefers GraphQL over REST. Key patterns:

```graphql
# Always request only fields you need
query {
  products(first: 10) {
    edges {
      node {
        id
        title
        variants(first: 5) {
          edges {
            node {
              id
              price
            }
          }
        }
      }
    }
  }
}
```

### Pagination
Use cursor-based pagination with `first`/`after` or `last`/`before`. Never use offset pagination.

### Rate Limits
- Admin API: Calculated query cost (max 1000 points per second)
- Storefront API: No hard rate limit but throttled at high volume

## Metafields Pattern

Use metafields for custom data on any Shopify resource:

```graphql
mutation {
  metafieldsSet(metafields: [
    {
      namespace: "cheersworthy"
      key: "tasting_notes"
      value: "Oak, vanilla, caramel with a smooth finish"
      type: "single_line_text_field"
      ownerId: "gid://shopify/Product/123"
    }
  ]) {
    metafields { id }
    userErrors { field, message }
  }
}
```

## Webhook Subscriptions

Subscribe to events rather than polling:

```graphql
mutation {
  webhookSubscriptionCreate(
    topic: ORDERS_CREATE
    webhookSubscription: {
      callbackUrl: "https://your-app.com/webhooks/orders"
      format: JSON
    }
  ) {
    webhookSubscription { id }
    userErrors { field, message }
  }
}
```

## File Organization for Cheersworthy

```
cheersworthy-app/
├── app/                    # Remix app (routes, components)
│   ├── routes/
│   ├── components/
│   └── utils/
├── extensions/             # All Shopify extensions
│   ├── sidekick-tools/     # Sidekick data extension
│   ├── sidekick-actions/   # Sidekick action intents
│   ├── theme-blocks/       # Theme app extensions
│   └── checkout-ui/        # Checkout extensions
├── prisma/                 # Database schema
├── shopify.app.toml        # App config
└── .env                    # Secrets (never commit)
```
