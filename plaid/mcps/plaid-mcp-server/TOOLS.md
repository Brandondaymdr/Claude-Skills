# Plaid MCP Server - Complete Tool Reference

## Tool Categories

## Link Token Management

### plaid_create_link_token
Create a Link token to initialize Plaid Link for user authentication.

**Parameters:**
- `client_name` (string, required): Name of your application
- `user` (object, optional): User info {client_user_id, legal_name, email_address, phone_number}
- `country_codes` (array, optional): Country codes (e.g., ["US"])
- `language` (enum, optional): UI language (en, es, fr, nl, de, it, pt)
- `products` (array, optional): Products to request (auth, transactions, balance, etc.)
- `account_filters` (object, optional): Filter account types shown in Link
- `webhook` (string, optional): Webhook URL for notifications
- `access_token` (string, optional): For Link update mode
- `response_format` (enum): markdown or json

**Returns:**
```json
{
  "link_token": "link-xxx",
  "expiration": "2024-01-01T00:00:00Z",
  "request_id": "req-xxx"
}
```

**Example:**
```
Tool: plaid_create_link_token
- client_name: "My App"
- country_codes: ["US"]
- products: ["transactions", "balance"]
- response_format: markdown
```

---

### plaid_exchange_public_token
Exchange a public token from Plaid Link for a permanent access token.

**Parameters:**
- `public_token` (string, required): Public token from Plaid Link
- `response_format` (enum): markdown or json

**Returns:**
```json
{
  "access_token": "access-xxx",
  "item_id": "item-xxx",
  "request_id": "req-xxx"
}
```

**Example:**
```
Tool: plaid_exchange_public_token
- public_token: "public-xxx-from-link"
```

---

## Account Management

### plaid_get_accounts
Get all accounts associated with a financial institution connection.

**Parameters:**
- `access_token` (string, required): Access token for the Item
- `response_format` (enum): markdown or json

**Returns:**
```json
{
  "accounts": [
    {
      "account_id": "acc-xxx",
      "name": "Checking",
      "mask": "1234",
      "type": "depository",
      "subtype": "checking",
      "verification_status": "verified"
    }
  ],
  "item_id": "item-xxx",
  "request_id": "req-xxx"
}
```

---

### plaid_get_balance
Get real-time account balances.

**Parameters:**
- `access_token` (string, required): Access token
- `options` (object, optional): {account_ids: string[]}
- `response_format` (enum): markdown or json

**Returns:**
```json
{
  "accounts": [
    {
      "account_id": "acc-xxx",
      "available": 1000.50,
      "current": 1500.50,
      "limit": 5000,
      "iso_currency_code": "USD"
    }
  ],
  "request_id": "req-xxx"
}
```

---

### plaid_get_item
Get Item details (linked financial institution).

**Parameters:**
- `access_token` (string, required): Access token
- `response_format` (enum): markdown or json

**Returns:**
```json
{
  "item": {
    "item_id": "item-xxx",
    "institution_id": "ins-xxx",
    "available_products": ["transactions", "balance", "auth"],
    "billed_products": ["transactions"],
    "webhook": "https://example.com/webhook"
  },
  "request_id": "req-xxx"
}
```

---

### plaid_remove_item
Remove an Item and disconnect from the financial institution.

**Parameters:**
- `access_token` (string, required): Access token
- `response_format` (enum): markdown or json

**Returns:**
```json
{
  "removed": true,
  "request_id": "req-xxx"
}
```

---

## Transactions

### plaid_sync_transactions
Sync transactions incrementally using cursor (recommended for repeated calls).

**Parameters:**
- `access_token` (string, required): Access token
- `cursor` (string, optional): Pagination cursor from previous response
- `count` (number, optional): Transactions to return (default: 100, max: 100)
- `options` (object, optional): {account_ids, include_personal_finance_category}
- `response_format` (enum): markdown or json

**Returns:**
```json
{
  "added": [{"transaction_id": "...", "amount": 50.00, "date": "2024-01-01", ...}],
  "modified": [...],
  "removed": [{"transaction_id": "...", "account_id": "..."}],
  "has_more": true,
  "next_cursor": "xxx",
  "request_id": "req-xxx"
}
```

---

### plaid_get_transactions
Get transactions for a specific date range.

**Parameters:**
- `access_token` (string, required): Access token
- `start_date` (string, required): Start date (YYYY-MM-DD)
- `end_date` (string, required): End date (YYYY-MM-DD)
- `options` (object, optional): {account_ids, offset, count, include_personal_finance_category}
- `response_format` (enum): markdown or json

**Returns:**
```json
{
  "transactions": [...],
  "total_transactions": 150,
  "request_id": "req-xxx"
}
```

---

### plaid_get_recurring_transactions
Identify recurring transaction patterns.

**Parameters:**
- `access_token` (string, required): Access token
- `options` (object, optional): {account_ids}
- `response_format` (enum): markdown or json

**Returns:**
```json
{
  "inflow_streams": [
    {
      "description": "Salary Deposit",
      "frequency": "MONTHLY",
      "amount": 3000,
      "transaction_ids": [...]
    }
  ],
  "outflow_streams": [
    {
      "description": "Rent Payment",
      "frequency": "MONTHLY",
      "amount": 1200,
      "transaction_ids": [...]
    }
  ],
  "request_id": "req-xxx"
}
```

---

### plaid_refresh_transactions
Force an immediate refresh of transaction data from the institution.

**Parameters:**
- `access_token` (string, required): Access token
- `response_format` (enum): markdown or json

**Returns:**
```json
{
  "request_id": "req-xxx"
}
```

---

## Authentication

### plaid_get_auth
Get account and routing numbers for authenticated accounts.

**Parameters:**
- `access_token` (string, required): Access token
- `response_format` (enum): markdown or json

**Returns:**
```json
{
  "accounts": [
    {
      "account_id": "acc-xxx",
      "account_number": "1234567890",
      "routing_number": "021000021",
      "wire_routing_number": "021000021"
    }
  ],
  "numbers": {
    "ach": [{"account": "1234567890", "routing": "021000021"}],
    "eft": [...],
    "international_iban": [...]
  },
  "request_id": "req-xxx"
}
```

---

## Identity

### plaid_get_identity
Get account owner identity information.

**Parameters:**
- `access_token` (string, required): Access token
- `options` (object, optional): {account_ids}
- `response_format` (enum): markdown or json

**Returns:**
```json
{
  "accounts": [
    {
      "account_id": "acc-xxx",
      "names": ["John Doe"],
      "emails": [{"data": "john@example.com", "primary": true, "type": "personal"}],
      "phone_numbers": [{"data": "+12025551234", "primary": true, "type": "mobile"}],
      "addresses": [
        {
          "data": {
            "street": "123 Main St",
            "city": "New York",
            "region": "NY",
            "postal_code": "10001",
            "country": "US"
          },
          "primary": true
        }
      ]
    }
  ],
  "request_id": "req-xxx"
}
```

---

### plaid_match_identity
Verify user identity against institution records.

**Parameters:**
- `access_token` (string, required): Access token
- `user` (object, required): {email_address, phone_number, legal_name, address}
- `options` (object, optional): {account_ids}
- `response_format` (enum): markdown or json

**Returns:**
```json
{
  "match_score": 0.95,
  "request_id": "req-xxx"
}
```

---

## Investments

### plaid_get_holdings
Get investment account holdings.

**Parameters:**
- `access_token` (string, required): Access token
- `options` (object, optional): {account_ids}
- `response_format` (enum): markdown or json

**Returns:**
```json
{
  "accounts": [...],
  "holdings": [
    {
      "account_id": "acc-xxx",
      "security_id": "sec-xxx",
      "quantity": 10.5,
      "institution_price": 150.25,
      "institution_price_as_of": "2024-01-01",
      "cost_basis": 1200.00
    }
  ],
  "securities": [
    {
      "security_id": "sec-xxx",
      "name": "Apple Inc.",
      "symbol": "AAPL",
      "type": "EQUITY"
    }
  ],
  "request_id": "req-xxx"
}
```

---

### plaid_get_investment_transactions
Get investment transaction history.

**Parameters:**
- `access_token` (string, required): Access token
- `start_date` (string, required): Start date (YYYY-MM-DD)
- `end_date` (string, required): End date (YYYY-MM-DD)
- `options` (object, optional): {account_ids, offset, count}
- `response_format` (enum): markdown or json

**Returns:**
```json
{
  "accounts": [...],
  "investment_transactions": [
    {
      "investment_transaction_id": "itxn-xxx",
      "account_id": "acc-xxx",
      "security_id": "sec-xxx",
      "date": "2024-01-01",
      "name": "BUY",
      "quantity": 10,
      "amount": 1500.00,
      "price": 150.00,
      "type": "buy"
    }
  ],
  "securities": [...],
  "total_investment_transactions": 50,
  "request_id": "req-xxx"
}
```

---

## Liabilities

### plaid_get_liabilities
Get credit cards, student loans, and mortgage information.

**Parameters:**
- `access_token` (string, required): Access token
- `options` (object, optional): {account_ids}
- `response_format` (enum): markdown or json

**Returns:**
```json
{
  "liabilities": {
    "credit": [
      {
        "account_id": "acc-xxx",
        "account_number": "1234",
        "outstanding_balance": 2500.00,
        "minimum_payment_amount": 100.00,
        "interest_rate_percentage": 18.99,
        "payment_due_date": 15,
        "is_overdue": false
      }
    ],
    "student": [...],
    "mortgage": [...]
  },
  "request_id": "req-xxx"
}
```

---

## Institutions

### plaid_search_institutions
Search for financial institutions supported by Plaid.

**Parameters:**
- `query` (string, required): Institution name or routing number
- `products` (array, optional): Products to filter by
- `country_codes` (array, optional): Countries to search
- `options` (object, optional): {include_optional_metadata, include_auth_metadata}
- `response_format` (enum): markdown or json

**Returns:**
```json
{
  "institutions": [
    {
      "institution_id": "ins-xxx",
      "name": "Chase Bank",
      "url": "https://chase.com",
      "logo": "https://...",
      "primary_color": "#117DBA",
      "routing_numbers": ["021000021"],
      "products": ["transactions", "auth", "balance"],
      "country_codes": ["US"]
    }
  ],
  "request_id": "req-xxx"
}
```

---

### plaid_get_institution
Get detailed information about a specific institution.

**Parameters:**
- `institution_id` (string, required): Institution ID
- `country_codes` (array, optional): Countries
- `options` (object, optional): {include_optional_metadata, include_auth_metadata}
- `response_format` (enum): markdown or json

**Returns:**
```json
{
  "institution": {
    "institution_id": "ins-xxx",
    "name": "Chase Bank",
    "url": "https://chase.com",
    "logo": "https://...",
    "primary_color": "#117DBA",
    "routing_numbers": ["021000021"],
    "products": ["transactions", "auth", "balance"],
    "country_codes": ["US"]
  },
  "request_id": "req-xxx"
}
```

---

## Transfers

### plaid_create_transfer
Create an ACH transfer.

**Parameters:**
- `access_token` (string, required): Access token
- `account_id` (string, required): Source account ID
- `funding_account_id` (string, required): Destination account ID
- `type` (enum, required): debit or credit
- `amount` (string, required): Amount (e.g., "123.45")
- `description` (string, required): Transfer description
- `user` (object, optional): {legal_name, email_address, address}
- `response_format` (enum): markdown or json

**Returns:**
```json
{
  "transfer": {
    "id": "txfr-xxx",
    "created": "2024-01-01T00:00:00Z",
    "authorization_decision": "approved",
    "funding_account_id": "acc-xxx",
    "type": "credit",
    "amount": "123.45",
    "description": "Transfer description",
    "status": "pending",
    "user": {...},
    "iso_currency_code": "USD"
  },
  "request_id": "req-xxx"
}
```

---

### plaid_get_transfer
Get transfer status and details.

**Parameters:**
- `transfer_id` (string, required): Transfer ID
- `response_format` (enum): markdown or json

**Returns:**
```json
{
  "transfer": {
    "id": "txfr-xxx",
    "status": "posted",
    "amount": "123.45",
    "type": "credit",
    "created": "2024-01-01T00:00:00Z",
    "authorization_decision": "approved"
  },
  "request_id": "req-xxx"
}
```

---

### plaid_list_transfers
List transfers for an account or Item.

**Parameters:**
- `access_token` (string, optional): Access token for Item-level
- `account_id` (string, optional): Filter by account
- `originator_client_id` (string, optional): Filter by originator
- `max_results` (number, optional): Maximum results
- `response_format` (enum): markdown or json

**Returns:**
```json
{
  "transfers": [...],
  "request_id": "req-xxx"
}
```

---

## Risk Assessment

### plaid_evaluate_signal
Evaluate ACH transaction risk.

**Parameters:**
- `access_token` (string, required): Access token
- `account_id` (string, required): Account ID
- `amount` (number, required): Transaction amount
- `client_transaction_id` (string, optional): Transaction ID
- `user` (object, optional): {legal_name, email_address, phone_number, address}
- `response_format` (enum): markdown or json

**Returns:**
```json
{
  "request_id": "req-xxx",
  "illegal_activity_score": 0.15,
  "rip_confidence": 0.82,
  "ppd_confidence": 0.45,
  "days_requested": 30
}
```

**Score Interpretation:**
- **illegal_activity_score**: 0.0-1.0 (higher = more suspicious)
- **rip_confidence**: Likelihood of rapid inflows
- **ppd_confidence**: Likelihood of payroll deduction

---

## Common Error Responses

All tools may return errors in this format:

```json
{
  "error_type": "INVALID_REQUEST",
  "error_code": "MISSING_FIELDS",
  "error_message": "access_token is required",
  "display_message": null,
  "request_id": "req-xxx"
}
```

**Common Error Codes:**
- `INVALID_REQUEST`: Missing or invalid parameters
- `INVALID_ACCESS_TOKEN`: Token is expired or invalid
- `ITEM_LOGIN_REQUIRED`: User needs to re-authenticate
- `INSTITUTION_ERROR`: Bank temporarily unavailable
- `RATE_LIMIT_EXCEEDED`: Too many requests

---

## Response Format Examples

### Markdown (default)
```markdown
# Account Balance

**Account:** Checking
**Available:** $1,000.00
**Current:** $1,500.00

Last updated: 2024-01-01
```

### JSON
```json
{
  "account_id": "acc-xxx",
  "available": 1000.00,
  "current": 1500.00,
  "currency": "USD"
}
```

---

## Tool Selection Guide

| Need | Tool |
|------|------|
| Connect a bank | plaid_create_link_token → plaid_exchange_public_token |
| Check balance | plaid_get_balance |
| Get recent activity | plaid_sync_transactions |
| Find spending patterns | plaid_get_recurring_transactions |
| Get routing numbers | plaid_get_auth |
| Check creditworthiness | plaid_get_identity + plaid_match_identity |
| Portfolio overview | plaid_get_holdings + plaid_get_investment_transactions |
| Debt summary | plaid_get_liabilities |
| Find a bank | plaid_search_institutions |
| Transfer money | plaid_create_transfer |
| Check transfer status | plaid_get_transfer |
| Evaluate transaction | plaid_evaluate_signal |

---

## Pagination

Transactions APIs support pagination via cursor:

```
1. First call: Don't provide cursor
2. Response includes: has_more, next_cursor
3. Next call: Use next_cursor to continue
4. Repeat until: has_more = false
```

---

## Rate Limits

Plaid API rate limits vary by plan. Server returns Plaid's rate limit errors. Implement exponential backoff on your end if needed.

---
