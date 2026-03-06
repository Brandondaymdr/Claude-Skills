# Plaid API Endpoints Reference

All endpoints use `POST` method and require `Content-Type: application/json` with authentication headers (`PLAID-CLIENT-ID`, `PLAID-SECRET`).

## Core Endpoints

### /link/token/create

Initialize Plaid Link UI for user authentication.

```
POST https://sandbox.plaid.com/link/token/create
```

**Key Request Parameters:**
- `user` (object): `client_user_id` (string, required)
- `client_name` (string): Your app name
- `products` (array): Features requested (e.g., `['auth', 'transactions']`)
- `country_codes` (array): ISO country codes (e.g., `['US']`)
- `language` (string): UI language (e.g., `'en'`)
- `account_filters` (object): Optional - filter by account type
- `required_if_supported_products` (array): Optional - products required only if supported

**Key Response Fields:**
- `link_token` (string): Token for initializing Plaid Link frontend
- `expiration` (string): ISO timestamp when link_token expires (10 minutes)
- `request_id` (string): Unique request identifier

**Example:**
```javascript
const response = await client.linkTokenCreate({
  user: { client_user_id: 'user-123' },
  client_name: 'My Financial App',
  products: ['auth', 'transactions'],
  country_codes: ['US'],
  language: 'en',
});
const linkToken = response.data.link_token;
```

---

### /item/public_token/exchange

Exchange a public_token (from Plaid Link) for an access_token.

```
POST https://sandbox.plaid.com/item/public_token/exchange
```

**Key Request Parameters:**
- `public_token` (string): Token returned from Plaid Link flow

**Key Response Fields:**
- `access_token` (string): Long-lived token for API calls
- `item_id` (string): Unique item identifier
- `request_id` (string)

**Example:**
```javascript
const response = await client.itemPublicTokenExchange({
  public_token: publicTokenFromLink,
});
const accessToken = response.data.access_token;
const itemId = response.data.item_id;
```

---

### /item/get

Retrieve basic item information.

```
POST https://sandbox.plaid.com/item/get
```

**Key Request Parameters:**
- `access_token` (string): Required

**Key Response Fields:**
- `item` (object):
  - `item_id` (string)
  - `institution_id` (string)
  - `webhook` (string): Webhook URL if configured
  - `error` (object): Null if no current error
- `status` (object): Account connection status
- `request_id` (string)

**Example:**
```javascript
const response = await client.itemGet({ access_token });
const item = response.data.item;
```

---

### /item/remove

Delete an item connection.

```
POST https://sandbox.plaid.com/item/remove
```

**Key Request Parameters:**
- `access_token` (string): Required

**Key Response Fields:**
- `removed` (boolean): True if item was successfully removed
- `request_id` (string)

**Example:**
```javascript
const response = await client.itemRemove({ access_token });
// Item is now disconnected, access_token is no longer valid
```

---

### /accounts/get

Retrieve accounts connected to an item.

```
POST https://sandbox.plaid.com/accounts/get
```

**Key Request Parameters:**
- `access_token` (string): Required

**Key Response Fields:**
- `accounts` (array): List of account objects
  - `account_id` (string)
  - `name` (string)
  - `official_name` (string)
  - `type` (string): 'checking', 'savings', 'credit', etc.
  - `subtype` (string): More specific type
  - `mask` (string): Last 2-4 digits (e.g., "0000")
- `item` (object)
- `request_id` (string)

**Example:**
```javascript
const response = await client.accountsGet({ access_token });
response.data.accounts.forEach(account => {
  console.log(account.name, account.mask); // "Checking 0000"
});
```

---

### /accounts/balance/get

Get real-time account balances.

```
POST https://sandbox.plaid.com/accounts/balance/get
```

**Key Request Parameters:**
- `access_token` (string): Required
- `options` (object): Optional
  - `account_ids` (array): Specific accounts to retrieve

**Key Response Fields:**
- `accounts` (array): Accounts with balance info
  - `account_id` (string)
  - `balances` (object):
    - `available` (number): Available balance (may be null)
    - `current` (number): Current balance
    - `limit` (number): Credit limit (credit accounts only, null otherwise)
  - `name`, `type`, `subtype`, `mask`
- `item` (object)
- `request_id` (string)

**Example:**
```javascript
const response = await client.accountsBalanceGet({ access_token });
response.data.accounts.forEach(account => {
  console.log(`${account.name}: $${account.balances.current}`);
});
```

---

### /institutions/get

Search for institutions with pagination.

```
POST https://sandbox.plaid.com/institutions/get
```

**Key Request Parameters:**
- `count` (integer): Number of institutions to return (max 500)
- `offset` (integer): Offset for pagination
- `country_codes` (array): Optional - filter by country

**Key Response Fields:**
- `institutions` (array): Institution objects
  - `institution_id` (string)
  - `name` (string)
  - `products` (array): Supported products
  - `country_codes` (array)
- `total` (integer): Total institutions available
- `request_id` (string)

**Example:**
```javascript
const response = await client.institutionsGet({
  count: 100,
  offset: 0,
  country_codes: ['US'],
});
```

---

### /institutions/get_by_id

Get a specific institution by ID.

```
POST https://sandbox.plaid.com/institutions/get_by_id
```

**Key Request Parameters:**
- `institution_id` (string): Required
- `country_codes` (array): Optional

**Key Response Fields:**
- `institution` (object):
  - `institution_id`, `name`, `products`, `country_codes`
  - `routing_numbers` (array): Available routing numbers
  - `oauth` (boolean): OAuth available
- `request_id` (string)

**Example:**
```javascript
const response = await client.institutionsGetById({
  institution_id: 'ins_123456',
});
```

---

### /institutions/search

Search institutions by name or routing number.

```
POST https://sandbox.plaid.com/institutions/search
```

**Key Request Parameters:**
- `query` (string): Institution name to search
- `products` (array): Filter by supported products
- `country_codes` (array): Filter by country
- `options` (object):
  - `include_display_data` (boolean): Include display info

**Key Response Fields:**
- `institutions` (array): Matching institutions
- `request_id` (string)

**Example:**
```javascript
const response = await client.institutionsSearch({
  query: 'Chase',
  products: ['auth', 'transactions'],
  country_codes: ['US'],
});
```

---

## Product Endpoints

### /auth/get

Get routing and account numbers (auth product).

```
POST https://sandbox.plaid.com/auth/get
```

**Key Request Parameters:**
- `access_token` (string): Required

**Key Response Fields:**
- `accounts` (array): Accounts with auth info
  - `account_id` (string)
  - `account_number` (string)
  - `routing_number` (string)
  - `wire_routing_number` (string): For wire transfers
- `numbers` (object): Deprecated, use accounts
- `item` (object)
- `request_id` (string)

**Example:**
```javascript
const response = await client.authGet({ access_token });
response.data.accounts.forEach(account => {
  console.log(`${account.account_id}: ${account.routing_number}`);
});
```

---

### /transactions/sync

Get transactions using cursor-based pagination (recommended).

```
POST https://sandbox.plaid.com/transactions/sync
```

**Key Request Parameters:**
- `access_token` (string): Required
- `cursor` (string): Pagination cursor (null for first call)
- `options` (object): Optional
  - `include_pending` (boolean): Include pending transactions
  - `account_ids` (array): Specific accounts only

**Key Response Fields:**
- `transactions` (array): Transaction objects
  - `transaction_id` (string)
  - `account_id` (string)
  - `amount` (number): Absolute value
  - `iso_currency_code` (string)
  - `date` (string): ISO date
  - `name` (string): Transaction description
  - `pending` (boolean)
  - `personal_finance_category` (object): Category classification
- `next_cursor` (string): Cursor for next request (null if no more)
- `has_more` (boolean): More transactions available
- `request_id` (string)

**Example:**
```javascript
let cursor = null;
let allTransactions = [];

while (true) {
  const response = await client.transactionsSync({
    access_token,
    cursor,
  });

  allTransactions = allTransactions.concat(response.data.transactions);
  cursor = response.data.next_cursor;

  if (!response.data.has_more) break;
}
```

---

### /transactions/get (Legacy)

Get transactions with offset-based pagination (not recommended, use /transactions/sync).

```
POST https://sandbox.plaid.com/transactions/get
```

**Key Request Parameters:**
- `access_token` (string): Required
- `start_date` (string): ISO date
- `end_date` (string): ISO date
- `options` (object):
  - `offset` (integer): Pagination offset
  - `count` (integer): Number to return (max 100)

**Key Response Fields:**
- `transactions` (array): Transaction objects
- `total_transactions` (integer): Total available
- `item` (object)
- `request_id` (string)

**Example:**
```javascript
const response = await client.transactionsGet({
  access_token,
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  options: {
    offset: 0,
    count: 100,
  },
});
```

---

### /transactions/refresh

Force a refresh of transactions (available in certain products).

```
POST https://sandbox.plaid.com/transactions/refresh
```

**Key Request Parameters:**
- `access_token` (string): Required

**Key Response Fields:**
- `request_id` (string)

**Example:**
```javascript
const response = await client.transactionsRefresh({ access_token });
// Transactions will be updated asynchronously; use webhooks for notification
```

---

### /transactions/recurring/get

Get recurring transaction patterns.

```
POST https://sandbox.plaid.com/transactions/recurring/get
```

**Key Request Parameters:**
- `access_token` (string): Required
- `account_id` (string): Optional - specific account
- `options` (object):
  - `include_pending_transactions` (boolean)

**Key Response Fields:**
- `recurring_transactions` (array): Recurring patterns
  - `id` (string)
  - `description` (string)
  - `merchant_name` (string)
  - `frequency` (string): 'WEEKLY', 'BIWEEKLY', 'MONTHLY', etc.
  - `amount` (number)
  - `account_id` (string)
  - `first_date` (string): First occurrence
  - `last_date` (string): Most recent occurrence
- `request_id` (string)

**Example:**
```javascript
const response = await client.transactionsRecurringGet({ access_token });
response.data.recurring_transactions.forEach(recurring => {
  console.log(`${recurring.description}: ${recurring.frequency}`);
});
```

---

### /identity/get

Get user identity information.

```
POST https://sandbox.plaid.com/identity/get
```

**Key Request Parameters:**
- `access_token` (string): Required

**Key Response Fields:**
- `accounts` (array): Accounts with identity info
  - `account_id` (string)
  - `owner` (object):
    - `names` (array): List of names on account
    - `emails` (array): List of emails
    - `phone_numbers` (array): List of phone numbers
    - `addresses` (array): List of addresses
      - `street`, `city`, `region`, `postal_code`, `country`
- `item` (object)
- `request_id` (string)

**Example:**
```javascript
const response = await client.identityGet({ access_token });
const owner = response.data.accounts[0].owner;
console.log(owner.names[0]); // Primary name
```

---

### /identity/match

Match user identity against account records.

```
POST https://sandbox.plaid.com/identity/match
```

**Key Request Parameters:**
- `access_token` (string): Required
- `user` (object): Identity data to match
  - `legal_name` (object): `first_name`, `last_name`
  - `phone_number` (string): Optional
  - `email_address` (string): Optional

**Key Response Fields:**
- `match` (object): Matching result for each account
  - `account_id` (string)
  - `match` (boolean): Identity matched
  - `match_score` (number): Confidence 0-100
- `request_id` (string)

**Example:**
```javascript
const response = await client.identityMatch({
  access_token,
  user: {
    legal_name: {
      first_name: 'John',
      last_name: 'Doe',
    },
    phone_number: '2025550123',
  },
});
```

---

### /investments/holdings/get

Get investment holdings.

```
POST https://sandbox.plaid.com/investments/holdings/get
```

**Key Request Parameters:**
- `access_token` (string): Required
- `options` (object):
  - `account_ids` (array): Optional

**Key Response Fields:**
- `holdings` (array): Investment holdings
  - `account_id` (string)
  - `security_id` (string)
  - `quantity` (number)
  - `institution_price` (number): Price from institution
  - `institution_price_as_of` (string): Date of price
  - `cost_basis` (number): Original purchase cost
- `securities` (array): Security details
  - `security_id`, `isin`, `cusip`, `sedol`, `name`, `ticker`, `type`
- `item` (object)
- `request_id` (string)

**Example:**
```javascript
const response = await client.investmentsHoldingsGet({ access_token });
```

---

### /investments/transactions/get

Get investment transactions.

```
POST https://sandbox.plaid.com/investments/transactions/get
```

**Key Request Parameters:**
- `access_token` (string): Required
- `start_date` (string): ISO date
- `end_date` (string): ISO date
- `options` (object):
  - `account_ids` (array): Optional
  - `offset` (integer): Pagination
  - `count` (integer): Max 100

**Key Response Fields:**
- `investment_transactions` (array): Transactions
  - `investment_transaction_id` (string)
  - `account_id` (string)
  - `security_id` (string)
  - `date` (string)
  - `quantity` (number)
  - `price` (number)
  - `type` (string): 'buy', 'sell', 'dividend', etc.
- `securities` (array): Security details
- `item` (object)
- `request_id` (string)

**Example:**
```javascript
const response = await client.investmentsTransactionsGet({
  access_token,
  start_date: '2024-01-01',
  end_date: '2024-12-31',
});
```

---

### /investments/refresh

Force a refresh of investment data.

```
POST https://sandbox.plaid.com/investments/refresh
```

**Key Request Parameters:**
- `access_token` (string): Required

**Key Response Fields:**
- `request_id` (string)

---

### /liabilities/get

Get liability information (mortgages, student loans, etc.).

```
POST https://sandbox.plaid.com/liabilities/get
```

**Key Request Parameters:**
- `access_token` (string): Required
- `options` (object):
  - `account_ids` (array): Optional

**Key Response Fields:**
- `liabilities` (object):
  - `credit_cards` (array): Credit card liabilities
  - `mortgages` (array): Mortgage liabilities
  - `student_loans` (array): Student loan liabilities
  - `other` (array): Other liabilities
- `item` (object)
- `request_id` (string)

**Example:**
```javascript
const response = await client.liabilitiesGet({ access_token });
const mortgages = response.data.liabilities.mortgages;
```

---

### /signal/evaluate

Evaluate transaction risk (Signal product).

```
POST https://sandbox.plaid.com/signal/evaluate
```

**Key Request Parameters:**
- `access_token` (string): Required
- `client_transaction_id` (string): Your transaction ID
- `amount` (number): Transaction amount
- `user_present` (boolean): Is user present at transaction

**Key Response Fields:**
- `signal_score` (number): 0-1 risk score (higher = riskier)
- `signal_decision` (string): 'APPROVE', 'DECLINE', 'REVIEW'
- `request_id` (string)

**Example:**
```javascript
const response = await client.signalEvaluate({
  access_token,
  client_transaction_id: 'txn-123',
  amount: 100.00,
  user_present: true,
});
```

---

### /signal/decision/report

Report outcomes of Signal evaluations.

```
POST https://sandbox.plaid.com/signal/decision/report
```

**Key Request Parameters:**
- `client_transaction_id` (string): Your transaction ID
- `decision` (string): 'APPROVE' or 'DECLINE'
- `outcome` (string): 'APPROVED', 'DECLINED', 'UNKNOWN'
- `verified_outcome` (string): 'FRAUD', 'LEGITIMATE', 'UNKNOWN'

**Key Response Fields:**
- `request_id` (string)

---

### /processor/token/create

Create a processor token for payment partners.

```
POST https://sandbox.plaid.com/processor/token/create
```

**Key Request Parameters:**
- `access_token` (string): Required
- `account_id` (string): Required
- `processor` (string): 'dwolla', 'stripe', 'fiserv', etc.

**Key Response Fields:**
- `processor_token` (string): Token for payment partner
- `request_id` (string)

**Example:**
```javascript
const response = await client.processorTokenCreate({
  access_token,
  account_id: 'account123',
  processor: 'dwolla',
});
```

---

### /transfer/create

Initiate a transfer (Transfer product).

```
POST https://sandbox.plaid.com/transfer/create
```

**Key Request Parameters:**
- `access_token` (string): Required
- `account_id` (string): Required
- `type` (string): 'debit' or 'credit'
- `network` (string): 'ach', 'same_day_ach', 'wire'
- `amount` (string): Amount as string
- `description` (string): Transfer description
- `user_present` (boolean): Is user initiating
- `funding_account_id` (string): For credit transfers

**Key Response Fields:**
- `transfer_id` (string)
- `status` (string): 'pending', 'posted', 'failed'
- `request_id` (string)

**Example:**
```javascript
const response = await client.transferCreate({
  access_token,
  account_id: 'account123',
  type: 'debit',
  network: 'ach',
  amount: '10.00',
  description: 'Rent payment',
  user_present: true,
});
```

---

### /transfer/get

Get transfer details.

```
POST https://sandbox.plaid.com/transfer/get
```

**Key Request Parameters:**
- `transfer_id` (string): Required

**Key Response Fields:**
- `transfer` (object):
  - `transfer_id`, `status`, `amount`, `network`, `type`
  - `created` (string): ISO timestamp
- `request_id` (string)

---

### /transfer/list

List transfers with pagination.

```
POST https://sandbox.plaid.com/transfer/list
```

**Key Request Parameters:**
- `start_date` (string): ISO date
- `end_date` (string): ISO date
- `options` (object):
  - `count` (integer): Max 100
  - `offset` (integer)

**Key Response Fields:**
- `transfers` (array): Transfer objects
- `total` (integer): Total transfers
- `request_id` (string)

---

### /payment_initiation/payment/create

Create a payment using payment initiation (Open Banking API).

```
POST https://sandbox.plaid.com/payment_initiation/payment/create
```

**Key Request Parameters:**
- `recipient_id` (string): ID of payment recipient
- `reference` (string): Payment reference
- `amount` (object):
  - `value` (number)
  - `currency` (string): 'GBP', 'EUR', etc.

**Key Response Fields:**
- `payment_id` (string)
- `status` (string): 'PAYMENT_STATUS_INPUT_NEEDED', 'PAYMENT_STATUS_AUTHORISED', etc.
- `request_id` (string)

---

### /payment_initiation/payment/get

Get payment initiation status.

```
POST https://sandbox.plaid.com/payment_initiation/payment/get
```

**Key Request Parameters:**
- `payment_id` (string): Required

**Key Response Fields:**
- `payment_id` (string)
- `status` (string): Payment status
- `amount` (object): Payment amount
- `recipient_id` (string)
- `request_id` (string)

---

## Rate Limits

- Standard: 100 requests per minute
- High-volume: Contact Plaid for higher limits
- Sandbox: No rate limits for testing

All endpoints return remaining rate limit info in response headers:
- `Plaid-Ratelimit-Remaining`
- `Plaid-Ratelimit-Reset`
