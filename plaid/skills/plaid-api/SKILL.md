---
name: plaid-api
description: Expert-level Plaid API integration skill for building financial applications. Use this skill whenever the user wants to write code that calls Plaid APIs, integrate Plaid into their application, set up Plaid authentication, handle Plaid tokens, make API calls to retrieve transactions/balances/accounts, implement Plaid Link in frontend code, handle Plaid webhooks programmatically, or troubleshoot Plaid API errors. Trigger when users mention Plaid API, Plaid SDK, plaid-node, plaid-python, access_token, link_token, public_token, or any Plaid endpoint. Essential for ShoreStack Books development and any Plaid API integration project.
---

# Plaid API Integration Skill

This skill provides expert guidance for integrating the Plaid API into financial applications. Use it when working with Plaid SDKs, managing tokens, making API calls, or handling authentication flows.

## Quick Reference

### Authentication Pattern

All Plaid API requests require three core credentials:

```javascript
// Node.js example with plaid-node
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox, // or development, production
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const client = new PlaidApi(configuration);
```

```python
# Python example with plaid-python
from plaid.api import client
from plaid.model.country_code import CountryCode
from plaid.model.products import Products

configuration = client.Configuration(
    host=plaid.ApiClient.Environment.SANDBOX,
    api_key='PLAID-CLIENT-ID',
    api_key_prefix='',
    api_key_2='PLAID-SECRET',
    api_key_prefix_2='',
)
api_client = plaid.ApiClient(configuration)
client = plaid.PlaidApi(api_client)
```

### Token Exchange Flow

The Plaid Link flow involves three token stages:

1. **link_token**: Generated server-side, used to initialize Plaid Link on frontend
2. **public_token**: Generated client-side after user authenticates in Link, returned to your app
3. **access_token**: Exchanged server-side from public_token, used for all API calls

```javascript
// Step 1: Create link_token (server-side)
const linkTokenResponse = await client.linkTokenCreate({
  user: { client_user_id: 'user-123' },
  client_name: 'My App',
  products: ['auth', 'transactions'],
  country_codes: ['US'],
  language: 'en',
});
const linkToken = linkTokenResponse.data.link_token;

// Step 2: Initialize Plaid Link (frontend) and get public_token
// User completes authentication flow in Link

// Step 3: Exchange public_token for access_token (server-side)
const exchangeResponse = await client.itemPublicTokenExchange({
  public_token: publicTokenFromClient,
});
const accessToken = exchangeResponse.data.access_token;
```

### Request/Response Patterns

All Plaid endpoints follow this pattern:

```
Method: POST
Content-Type: application/json
Headers:
  PLAID-CLIENT-ID: your_client_id
  PLAID-SECRET: your_secret

Request Body: JSON object with parameters
Response: JSON object with data or error
```

```javascript
// Generic request pattern
const response = await client.methodName({
  access_token: accessToken,
  param1: value1,
  param2: value2,
});

// Response structure
{
  data: {
    // endpoint-specific fields
    request_id: 'uuid-string'
  }
}

// Error response
{
  error_type: 'INVALID_REQUEST',
  error_code: 'MISSING_FIELDS',
  error_message: 'Missing required field: access_token',
  display_message: 'User-friendly message',
  request_id: 'uuid-string'
}
```

### Environment Configuration

Configure endpoints based on environment:

```javascript
// Sandbox: for development and testing
basePath: PlaidEnvironments.sandbox
// URL: https://sandbox.plaid.com

// Development: for internal testing with real credentials
basePath: PlaidEnvironments.development
// URL: https://development.plaid.com

// Production: for live usage
basePath: PlaidEnvironments.production
// URL: https://production.plaid.com
```

Store credentials in environment variables:
```
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
PLAID_ENV=sandbox  # or development, production
```

### Error Handling Patterns

Plaid uses structured error responses with error_type and error_code:

```javascript
try {
  const response = await client.accountsGet({ access_token });
} catch (error) {
  const { error_type, error_code, display_message } = error.response.data;

  if (error_type === 'ITEM_ERROR' && error_code === 'ITEM_LOGIN_REQUIRED') {
    // User must re-authenticate - trigger Link update mode
    // Pass the access_token to Link's update flow
  } else if (error_type === 'RATE_LIMIT_EXCEEDED') {
    // Implement exponential backoff and retry
  } else if (error_type === 'INVALID_REQUEST') {
    // Validate request parameters
  }
}
```

Common error codes and handling:
- `ITEM_LOGIN_REQUIRED`: User credentials expired, re-authenticate via Link update
- `RATE_LIMIT_EXCEEDED`: Too many requests, wait and retry with backoff
- `INVALID_ACCESS_TOKEN`: Token invalid/expired, obtain new access_token
- `INVALID_REQUEST`: Missing/invalid parameters, check request body
- `INSTITUTION_ERROR`: Bank is down, show user-friendly message and retry later

### Client Library Setup

**Node.js Setup:**
```bash
npm install plaid
```

```javascript
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const client = new PlaidApi(configuration);
```

**Python Setup:**
```bash
pip install plaid-python
```

```python
import plaid
from plaid.api import client

api_client = plaid.ApiClient(
    plaid.Configuration(
        host=plaid.ApiClient.Environment.SANDBOX,
        api_key='PLAID-CLIENT-ID',
        api_key_prefix='',
        api_key_2='PLAID-SECRET',
        api_key_prefix_2='',
    )
)
client = plaid.PlaidApi(api_client)
```

## Common Use Cases

### Getting Account Information
Retrieve connected accounts after token exchange:

```javascript
const response = await client.accountsGet({ access_token });
// Returns: accounts[], item, request_id
```

### Getting Account Balances
Get real-time balance information:

```javascript
const response = await client.accountsBalanceGet({ access_token });
// Returns: accounts[] with balances, item, request_id
```

### Syncing Transactions
Retrieve transactions efficiently using cursor-based pagination:

```javascript
const response = await client.transactionsSync({
  access_token,
  cursor: savedCursor, // or undefined for first call
});
// Returns: transactions[], next_cursor, has_more, request_id
```

### Getting User Identity
Extract identity information tied to the account:

```javascript
const response = await client.identityGet({ access_token });
// Returns: accounts[] with identity info, request_id
```

## Key Concepts

- **Items**: Represents a user's connection to a financial institution
- **Access Tokens**: Long-lived credentials for making API calls (store securely in database)
- **Link Tokens**: Short-lived tokens for initializing the Plaid Link UI
- **Products**: Features you're using (auth, transactions, identity, etc.)
- **Sandbox**: Test environment with test credentials (user_good, user_bad, etc.)
- **Webhooks**: Optional: receive notifications about item/account changes

## References

For detailed endpoint specifications, error codes, and authentication details, see:
- `references/endpoints.md` - Complete endpoint reference
- `references/error-handling.md` - Error handling guide
- `references/authentication.md` - Authentication deep dive
