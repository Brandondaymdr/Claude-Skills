# Spirits E-Commerce Compliance Reference

Legal and regulatory requirements for selling alcohol online in the United States. This is a reference guide — always consult a legal professional for your specific situation.

## Federal Requirements (TTB)

The Alcohol and Tobacco Tax and Trade Bureau (TTB) regulates alcohol at the federal level.

### Key Requirements

- Must hold appropriate federal permits (Basic Permit under the Federal Alcohol Administration Act)
- Direct-to-consumer shipping requires compliance with both origin and destination state laws
- Product labels must be TTB-approved (COLA — Certificate of Label Approval)
- Cannot make health claims about alcohol products
- Advertising must comply with TTB advertising regulations (27 CFR Part 4/5/7)

## State-by-State Shipping

Alcohol shipping laws vary dramatically by state. Three categories:

### States That Allow DTC Spirit Shipping (as of 2025)
Laws change frequently. Always verify current status with a compliance service like ShipCompliant.

### States That Prohibit DTC Spirit Shipping
Many states still prohibit direct-to-consumer spirits shipping. Some allow wine/beer but not spirits.

### Common Requirements for Permitted States
- Must hold a direct shipper license in the destination state
- Age verification at point of sale AND point of delivery
- Volume limits (varies by state — often 2-12 cases per year per customer)
- Reporting requirements (monthly/quarterly/annual depending on state)
- Tax remittance (excise taxes, sales taxes, state-specific fees)

## Age Verification Requirements

### Online (Point of Sale)
- Age gate on website entry — minimum requirement
- Date of birth collection recommended (not just "Are you 21+?")
- Third-party age verification services provide stronger compliance:
  - Agechecker.net
  - Veratad
  - IDology
- Consider ID upload verification for high-value orders

### At Delivery (Point of Delivery)
- Adult signature required (21+ with valid ID)
- Carrier must be licensed for alcohol delivery (FedEx, UPS with alcohol endorsement)
- Cannot leave at door / no signature release
- Delivery person must verify ID matches recipient

## Shopify Implementation

### Age Gate Implementation
```liquid
{# Minimum viable age gate — enhance with third-party verification #}
{% unless customer.tags contains 'age-verified' %}
  {% render 'age-verification-modal' %}
{% endunless %}
```

Requirements for the age gate:
- Must appear before any product content is visible
- Must block navigation until verified
- Should store verification status (cookie or account tag)
- Must be accessible (WCAG compliant)
- Consider geolocation to show state-specific messaging

### Shipping Restrictions at Checkout
- Use Shopify's carrier-calculated shipping with an alcohol-compliant carrier
- Implement address validation to block restricted states/zip codes
- Use a compliance service API to validate each order in real-time
- Consider Shopify Functions for custom shipping logic

### Product Page Requirements
- Display ABV prominently
- Include standard health warnings where required
- No health benefit claims
- Age restriction notices
- State availability notices (if not shipping to all states)

### Payment Processing
- Verify Shopify Payments supports alcohol in your jurisdiction
- Some processors require additional documentation for alcohol merchants
- Higher processing fees are common for alcohol sales
- Chargeback rates may affect your merchant account

## Compliance Services

Recommended third-party services for alcohol e-commerce compliance:

| Service | What It Does |
|---------|-------------|
| ShipCompliant (Sovos) | Real-time compliance validation, tax calculation, reporting |
| Avalara for Beverage Alcohol | Tax calculation, exemption management |
| Compli | Licensing, compliance management |
| Agechecker.net | Age verification at checkout |

## Common Pitfalls

1. Shipping to a state without the required license
2. Not collecting and remitting state excise taxes
3. Exceeding volume limits for a customer in a restricted state
4. Missing reporting deadlines (can result in license revocation)
5. Inadequate age verification (liability exposure)
6. Marketing alcohol to minors (social media, email targeting)
7. Not updating compliance when laws change (they change often)

## Resources

- TTB: https://www.ttb.gov
- ShipCompliant: https://www.sovos.com/shipcompliant
- Wine Institute DTC shipping laws: https://www.wineinstitute.org (reference for wine, spirits differ)
