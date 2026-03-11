---
name: plaid-platform
description: Comprehensive navigation and operational guide for the Plaid financial data platform. Use this skill whenever the user mentions Plaid, Plaid Link, bank account linking, financial data aggregation, transaction syncing, balance checks, identity verification, ACH payments, or any Plaid product (Transactions, Auth, Balance, Identity, Investments, Liabilities, Transfer, Income, Signal, Payment Initiation). Also trigger when users ask about connecting bank accounts, retrieving financial data, setting up Plaid webhooks, or working with the Plaid Dashboard. Essential for ShoreStack Books and any financial data integration project.
---

# Plaid Platform Navigation Guide

## Overview

Plaid is the leading financial data connectivity platform, enabling secure connections between applications and financial institutions. Rather than storing credentials, Plaid uses OAuth-style authentication to grant applications read or write access to user financial data across 12,000+ institutions globally.

**Key strengths:**
- Bank account and payment authentication without credential handling
- Real-time financial data access (transactions, balances, account details)
- Identity verification and financial risk assessment
- Multi-rail payment capabilities
- Regulatory compliance built-in (PSD2, GDPR, SOC 2)

**When to use Plaid:**
- Building fintech applications requiring banking data
- Implementing account linking features
- Verifying user income or identity
- Processing ACH or wire payments
- Detecting fraud or credit risk
- Syncing transaction data to accounting systems

## Plaid's Product Suite

Plaid offers a comprehensive set of products serving different financial data and payment needs:

### Data Products
- **Transactions**: Real-time and historical transaction data with categorization
- **Auth**: Account and routing numbers for ACH/wire payments
- **Balance**: Real-time account balances and account type information
- **Identity**: Account owner verification and identity matching
- **Investments**: Holdings, securities, and investment transaction history
- **Liabilities**: Credit cards, student loans, mortgages with balance tracking
- **Income**: Income verification via documents, payroll, or bank data

### Risk & Insights
- **Signal**: ML-powered risk scoring for ACH transactions

### Payments
- **Transfer**: Multi-rail US payments (ACH, RTP, Wire, FedNow)
- **Payment Initiation**: European payments (SEPA, FPS)

See **references/products-overview.md** for detailed product documentation.

## The Plaid Link Flow

Plaid Link is the user-facing UI for account authentication. It provides a standardized, secure experience where users select their institution and provide credentials.

### High-Level Flow
1. **Backend requests Link Token** from Plaid API (passing app config and user details)
2. **Frontend initializes Plaid Link** with the token
3. **User selects institution** and authenticates
4. **Plaid completes OAuth** with the bank
5. **Link returns a `public_token`** to your frontend
6. **Frontend sends public_token to backend**
7. **Backend exchanges public_token for `access_token`**
8. **Backend uses access_token** to fetch financial data

### Key Tokens
- **Link Token**: Temporary token enabling Link initialization. Expires in 1 hour.
- **Public Token**: One-time token from Link containing encryption credentials. Exchanged for access token.
- **Access Token**: Long-lived token authorizing data access. Stored securely on your backend.

### Customization
- Configure which products are requested (Transactions, Auth, etc.)
- Set account type filters (Checking, Credit Card, etc.)
- Customize Link UI appearance via Dashboard
- Set webhook URLs for real-time notifications

See **references/link-integration.md** for implementation details, platform support (Web, iOS, Android, React Native), and error recovery strategies.

## Plaid Dashboard

The Plaid Dashboard is your control center for configuration, monitoring, and testing.

### Key Sections

**Team Settings**
- Manage team members and permissions
- API keys for development and production
- Webhook configuration
- IP whitelisting

**Apps**
- Create and manage applications
- Configure Link customization
- Set product permissions
- Manage OAuth redirect URIs

**Data**
- Monitor your API usage and costs
- View recent API calls and responses
- Test API endpoints directly
- Access historical logs

**Monitoring**
- Health status of integrations
- Webhook delivery status
- Institution coverage and updates

### Finding Your Credentials
1. Log in to dashboard.plaid.com
2. Navigate to **Team Settings > Keys**
3. Note your **Client ID** and **Secret** (keep these secure!)
4. Use these credentials for all API requests

### Environment URLs
- **Sandbox**: api.sandbox.plaid.com (for testing)
- **Development**: api.development.plaid.com (integration testing with real institutions)
- **Production**: api.plaid.com (live traffic)

## Environment Management

Plaid provides three isolated environments for development and production.

### Sandbox
- **Purpose**: Testing without external dependencies
- **Users**: Use test credentials (any username, password "pass_good")
- **Institutions**: Limited set of mock institutions
- **Use case**: Rapid development and unit testing
- **Access**: Included with all plans
- **Data**: Realistic but fabricated

### Development
- **Purpose**: Integration testing with real institutions
- **Users**: Real bank credentials (with institution's permission)
- **Institutions**: Full 12,000+ coverage
- **Use case**: End-to-end testing before production
- **Access**: Included with business plans
- **Data**: Real data from live institutions
- **Caution**: Use test accounts provided by banks

### Production
- **Purpose**: Live user traffic
- **Users**: Real end-user bank credentials
- **Institutions**: Full coverage
- **Use case**: Serving actual customers
- **Access**: Enabled after approval
- **Monitoring**: Full dashboard analytics
- **Cost**: Usage-based pricing per endpoint call

### Switching Environments
Simply change your base URL and API keys:
```
Sandbox: https://api.sandbox.plaid.com
Development: https://api.development.plaid.com
Production: https://api.plaid.com
```

## Key Concepts

### Item
An **Item** represents a user's connection to a financial institution. Once created via Link, an Item has:
- A unique `item_id`
- An associated `access_token`
- Linked institution credentials (encrypted and managed by Plaid)
- Product availability (which endpoints you can call)

Items are persistent—they don't expire unless the user revokes access or the institution forces a re-authentication.

### Access Token
Long-lived credentials authorizing data access for an Item. Should be:
- Stored securely in your database
- Never transmitted to frontend
- Rotated periodically (Plaid can provide new tokens)
- Invalidated when user deletes connection

### Link Token
Temporary, one-time authorization to initialize Plaid Link. Generated by your backend, passed to frontend, expires in 1 hour. Each Link flow requires a fresh token.

### Public Token
Generated when Link completes successfully. One-time use, contains encryption credentials needed to exchange for access token. Typically valid for 30 minutes.

### Webhook
Real-time notifications from Plaid when events occur (new transactions available, item updated, payment status changed). See **references/webhooks.md** for full webhook reference.

## Common Workflows

### Workflow 1: Account Linking
**Goal**: Allow users to connect bank accounts for transaction access

1. Frontend requests Link Token from backend
2. Backend calls `/link/token/create` with product="Transactions"
3. Frontend initializes Plaid Link with token
4. User authenticates with their bank
5. Link returns public_token to frontend
6. Frontend sends public_token to backend
7. Backend calls `/item/public_token/exchange` to get access_token
8. Backend stores access_token securely
9. Backend calls `/transactions/get` to fetch data

### Workflow 2: Payment Initiation
**Goal**: Enable users to send money via ACH or other rails

1. Frontend requests Link Token with product="Auth"
2. User authenticates and grants access to Auth data
3. Backend exchanges public_token for access_token
4. Backend calls `/auth/get` to retrieve account/routing numbers
5. Backend initiates transfer via `/transfer/create`
6. Monitor transfer status via `/transfer/get` or webhooks

### Workflow 3: Income Verification
**Goal**: Verify user income for lending or qualification

1. Request Link Token with product="Income"
2. User authenticates (bank or document upload)
3. Backend calls `/income/verification/create` to start verification
4. Backend calls `/income/verification/get` to retrieve results
5. Optional: Call `/income/verification/documents/get` for underlying documents

### Workflow 4: Webhook Handling
**Goal**: React to real-time events without polling

1. Configure webhook URL in Dashboard
2. Plaid sends HTTP POST to your endpoint when events occur
3. Verify webhook signature using webhook_verification_key
4. Parse event type (e.g., SYNC_UPDATES_AVAILABLE)
5. Trigger appropriate backend action (sync transactions, etc.)
6. Return HTTP 200 to acknowledge receipt

See **references/webhooks.md** for event types and best practices.

## Authentication & Security

### API Key Authentication
All backend API requests require:
- **client_id**: Your application identifier
- **secret**: Your authentication credential
- **access_token**: For authenticated endpoints (optional on token creation endpoints)

**Best Practice**: Never expose client_id or secret to frontend. All API calls should originate from your backend.

### OAuth Security
- Users authenticate directly with banks, not with your app
- Your app never receives raw credentials
- Plaid manages encryption and secure communication
- User can revoke access via Plaid or their bank

### Webhook Verification
Always verify webhook signatures before processing:
1. Extract `webhook_verification_key` from Dashboard
2. Calculate HMAC-SHA256(body, key)
3. Compare with `X-Plaid-Verification` header
4. Discard unverified webhooks

## Troubleshooting Quick Reference

**"Institution not supported"**
- Verify you're using correct environment (Production for full coverage)
- Check institution is included in your product set
- Confirm user is accessing right institution (typos in search)

**"Invalid access_token"**
- Token may have expired (rotate periodically)
- Item may have been deleted
- User may have revoked access via bank
- Verify you're using correct environment's token

**"Link initialization failed"**
- Link Token may have expired (1 hour limit)
- Verify Link Token was generated in same environment
- Check for JavaScript errors in browser console
- Confirm firewall/CORS allows plaid.com connections

**"Webhook not delivering"**
- Verify webhook URL is publicly accessible
- Check firewall allows POST from Plaid IP ranges
- Confirm endpoint returns HTTP 200
- Review webhook retry behavior (exponential backoff, max 5 attempts)

**"Rate limit exceeded"**
- Implement exponential backoff (retry after 1, 2, 4, 8 seconds)
- Cache results to avoid duplicate calls
- Contact Plaid for higher rate limits if needed

## Next Steps

- **Getting Started**: Explore references/link-integration.md for step-by-step Link implementation
- **Product Details**: See references/products-overview.md for deep dives on specific endpoints
- **Real-Time Updates**: Read references/webhooks.md for webhook patterns
- **API Reference**: Visit docs.plaid.com for complete endpoint documentation
- **Support**: Contact Plaid support via Dashboard or support@plaid.com

---

**Last Updated**: 2026
**Compatible with**: Plaid API v2025+
