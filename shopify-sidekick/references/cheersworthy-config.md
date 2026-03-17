# Cheersworthy.com — Store Configuration

This file is the single source of truth for the Cheersworthy Shopify store. All Shopify skills in this plugin should reference this file for store-specific details.

## Store Identity

- **Store name**: Cheersworthy
- **Domain**: cheersworthy.com
- **Industry**: Spirits / Alcohol / Beverages
- **Platform**: Shopify (Plus recommended for spirits compliance)

## Brand Guidelines

<!-- Fill these in as the brand develops -->
- **Primary color**: TBD
- **Secondary color**: TBD
- **Typography**: TBD
- **Logo path**: TBD
- **Tone of voice**: Premium, celebratory, approachable — "every occasion deserves a worthy cheers"

## Technical Stack

- **Theme**: TBD (Online Store 2.0 compatible required)
- **Shopify CLI version**: Latest stable
- **Node.js**: 18+ LTS
- **App framework**: Remix (Shopify's default app template)
- **API version**: 2025-01 or later (always use latest stable)

## Key Shopify IDs

<!-- Populate after store setup -->
- **Shop domain**: cheersworthy.myshopify.com
- **Storefront API access token**: (store in .env, never commit)
- **Admin API access token**: (store in .env, never commit)
- **App client ID**: TBD
- **App client secret**: (store in .env, never commit)

## Compliance Notes

Spirits/alcohol e-commerce has specific requirements:
- Age verification gate required (21+ in US)
- Shipping restrictions by state/country — must validate at checkout
- Cannot ship to all US states (varies by product type and carrier)
- Must comply with TTB (Alcohol and Tobacco Tax and Trade Bureau) regulations
- Product descriptions must not make health claims
- Some payment processors restrict alcohol sales — verify Shopify Payments eligibility

## Collections Structure (Planned)

- Whiskey / Bourbon
- Vodka
- Tequila / Mezcal
- Rum
- Gin
- Wine
- Cocktail Kits / Mixers
- Gifts & Bundles
- Limited Editions

## Integrations (Planned)

- Age verification app (e.g., Agechecker.net, Blaze Commerce)
- Shipping compliance (e.g., ShipCompliant by Sovos)
- Email marketing (Klaviyo or Beehiiv integration)
- Reviews (Judge.me or Stamped.io)
- Loyalty program
- Sidekick AI extensions (this plugin)
