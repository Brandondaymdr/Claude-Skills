# Plaid Webhooks Reference

Complete reference for webhook events, verification, and best practices.

## What are Webhooks?

Webhooks enable real-time notifications from Plaid about important events in your financial data integration. Instead of polling APIs repeatedly, Plaid notifies you when:
- New transactions are available for syncing
- Account balances have changed
- Items require re-authentication
- Payments have settled
- Verification is complete

## Setting Up Webhooks

### Configure Webhook URL

1. Log in to **dashboard.plaid.com**
2. Navigate to **Team Settings > Webhooks**
3. Add your webhook endpoint URL:
   ```
   https://yourdomain.com/webhooks/plaid
   ```

**Requirements:**
- Must be HTTPS (not HTTP)
- Must be publicly accessible (not localhost)
- Must handle POST requests
- Should return HTTP 200 quickly
- Should implement exponential backoff for retries

### Alternative: Per-Application Configuration

Set webhook URL during Link Token creation:

```bash
POST /link/token/create

{
  "client_id": "YOUR_CLIENT_ID",
  "secret": "YOUR_SECRET",
  "user": {
    "client_user_id": "user-123"
  },
  "client_name": "Your App",
  "country_codes": ["US"],
  "language": "en",
  "products": ["transactions"],
  "webhook": "https://yourdomain.com/webhooks/plaid"  // Per-app webhook
}
```

This overrides the team-level webhook for that specific Link instance.

### Retrieve Webhook Key

For webhook verification (signing):

1. Navigate to **Team Settings > Keys**
2. Find **Webhook Verification Key**
3. Use this to verify webhook authenticity

---

## Webhook Request Format

### HTTP Headers

```
POST /webhooks/plaid HTTP/1.1
Host: yourdomain.com
Content-Type: application/json
User-Agent: Plaid-Webhook/1.0
X-Plaid-Verification: hmac-sha256-signature-here
```

### Request Body

```json
{
  "webhook_type": "TRANSACTIONS",
  "webhook_code": "SYNC_UPDATES_AVAILABLE",
  "item_id": "KdxrPLBVnZsXj...",
  "user_id": "user-123",
  "error": null,
  "new_transactions": 42,
  "environment": "sandbox"
}
```

**Key Fields:**
- **webhook_type**: Category of event (TRANSACTIONS, ITEM, PAYMENT, etc.)
- **webhook_code**: Specific event type (SYNC_UPDATES_AVAILABLE, TRANSACTIONS_REMOVED, etc.)
- **item_id**: The Plaid Item affected
- **user_id**: Your application's user ID (if provided during Link)
- **error**: Error object if applicable (usually null)
- **environment**: "sandbox", "development", or "production"

### Immediate Response Required

Respond immediately with HTTP 200:

```javascript
// Express.js example
app.post('/webhooks/plaid', (req, res) => {
  // Respond immediately
  res.status(200).json({ status: 'received' });

  // Process webhook asynchronously
  processWebhookAsync(req.body);
});
```

**Important:** Plaid times out webhooks after ~30 seconds. Respond immediately and process asynchronously.

---

## Webhook Verification

Always verify webhook authenticity before processing.

### Step 1: Extract Signature

Get the signature from HTTP header:

```javascript
const signature = req.headers['x-plaid-verification'];
```

### Step 2: Get Verification Key

Retrieve webhook verification key from Dashboard:

```
Dashboard > Team Settings > Keys > Webhook Verification Key
```

### Step 3: Calculate Expected Signature

```javascript
const crypto = require('crypto');

const webhookBody = JSON.stringify(req.body);
const webhookKey = process.env.PLAID_WEBHOOK_KEY; // From Dashboard

const hmac = crypto
  .createHmac('sha256', webhookKey)
  .update(webhookBody)
  .digest('hex');

const expectedSignature = `hmac-sha256=${hmac}`;
```

### Step 4: Verify Signature Matches

```javascript
if (signature !== expectedSignature) {
  // Webhook signature invalid, discard
  res.status(401).json({ error: 'Invalid signature' });
  return;
}

// Webhook verified, safe to process
processWebhook(req.body);
```

### Complete Verification Example

```javascript
const crypto = require('crypto');

function verifyPlaidWebhook(req) {
  const signature = req.headers['x-plaid-verification'];
  const body = JSON.stringify(req.body);
  const secret = process.env.PLAID_WEBHOOK_KEY;

  const hmac = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  const expectedSignature = `hmac-sha256=${hmac}`;

  return signature === expectedSignature;
}

// Middleware
app.post('/webhooks/plaid', (req, res) => {
  // Verify immediately
  if (!verifyPlaidWebhook(req)) {
    console.warn('Invalid webhook signature');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Respond immediately
  res.status(200).json({ status: 'received' });

  // Process asynchronously
  handleWebhookAsync(req.body).catch(err => {
    console.error('Webhook processing error:', err);
  });
});
```

---

## Webhook Types & Events

### TRANSACTIONS Webhooks

**SYNC_UPDATES_AVAILABLE**
- **Trigger**: New transactions available for an account
- **When**: Usually within 30 minutes of transaction posting at bank
- **Action**: Call `/transactions/sync` or `/transactions/get` to retrieve new data
- **Data**:
  ```json
  {
    "webhook_type": "TRANSACTIONS",
    "webhook_code": "SYNC_UPDATES_AVAILABLE",
    "item_id": "KdxrPLBVnZsXj...",
    "new_transactions": 5
  }
  ```

**TRANSACTIONS_REMOVED**
- **Trigger**: Transactions removed from account (reversal, correction)
- **When**: When bank corrects or reverses transaction
- **Action**: Call `/transactions/sync` to get removed transaction IDs
- **Data**:
  ```json
  {
    "webhook_type": "TRANSACTIONS",
    "webhook_code": "TRANSACTIONS_REMOVED",
    "item_id": "KdxrPLBVnZsXj...",
    "removed_transactions": ["txn-123", "txn-124"]
  }
  ```

**SYNC_UPDATES_COMPLETE**
- **Trigger**: Sync completed (all transactions downloaded)
- **When**: After successful `/transactions/sync`
- **Action**: Can optimize UI to show "sync complete" message
- **Data**:
  ```json
  {
    "webhook_type": "TRANSACTIONS",
    "webhook_code": "SYNC_UPDATES_COMPLETE",
    "item_id": "KdxrPLBVnZsXj..."
  }
  ```

**RECURRING_TRANSACTIONS_UPDATE**
- **Trigger**: Recurring transaction pattern detected
- **When**: When sufficient data available for pattern analysis
- **Action**: Call `/transactions/recurring/get` for updated patterns
- **Data**:
  ```json
  {
    "webhook_type": "TRANSACTIONS",
    "webhook_code": "RECURRING_TRANSACTIONS_UPDATE",
    "item_id": "KdxrPLBVnZsXj..."
  }
  ```

### ITEM Webhooks

**PENDING_EXPIRATION**
- **Trigger**: Item will expire soon (re-authentication needed)
- **When**: 30 days before expected expiration
- **Action**: Display notification to user or trigger update mode
- **Data**:
  ```json
  {
    "webhook_type": "ITEM",
    "webhook_code": "PENDING_EXPIRATION",
    "item_id": "KdxrPLBVnZsXj...",
    "error": {
      "error_code": "ITEM_LOGIN_REQUIRED",
      "error_message": "Account credentials expired"
    }
  }
  ```

**ITEM_LOGIN_REQUIRED**
- **Trigger**: User credentials invalid/expired
- **When**: When bank invalidates user's session
- **Action**: Trigger update mode for re-authentication
- **Data**:
  ```json
  {
    "webhook_type": "ITEM",
    "webhook_code": "ITEM_LOGIN_REQUIRED",
    "item_id": "KdxrPLBVnZsXj...",
    "error": {
      "error_code": "ITEM_LOGIN_REQUIRED",
      "error_message": "Invalid credentials"
    }
  }
  ```

**WEBHOOK_UPDATE_ACKNOWLEDGED**
- **Trigger**: Webhook endpoint updated successfully
- **When**: After configuring new webhook URL
- **Action**: Confirms new URL is working
- **Data**:
  ```json
  {
    "webhook_type": "ITEM",
    "webhook_code": "WEBHOOK_UPDATE_ACKNOWLEDGED",
    "timestamp": "2026-03-06T12:00:00Z"
  }
  ```

**ITEM_STATUS_UPDATED**
- **Trigger**: Item status or metadata changed
- **When**: After status changes (status codes vary by institution)
- **Action**: Update item status in your system
- **Data**:
  ```json
  {
    "webhook_type": "ITEM",
    "webhook_code": "ITEM_STATUS_UPDATED",
    "item_id": "KdxrPLBVnZsXj...",
    "error": null
  }
  ```

### AUTH Webhooks

**VERIFIED_AUTH_AVAILABLE**
- **Trigger**: Auth data ready (account/routing numbers)
- **When**: After user grants Auth permission
- **Action**: Call `/auth/get` to retrieve account numbers
- **Data**:
  ```json
  {
    "webhook_type": "AUTH",
    "webhook_code": "VERIFIED_AUTH_AVAILABLE",
    "item_id": "KdxrPLBVnZsXj..."
  }
  ```

### PAYMENT Webhooks

**PAYMENT_STATUS_UPDATE**
- **Trigger**: Payment status changed
- **When**: Status changes (PROCESSING → POSTED → SETTLED, etc.)
- **Action**: Update payment status in UI
- **Data**:
  ```json
  {
    "webhook_type": "PAYMENT",
    "webhook_code": "PAYMENT_STATUS_UPDATE",
    "payment_id": "pymnt-123",
    "item_id": "KdxrPLBVnZsXj...",
    "status": "POSTED"
  }
  ```

**TRANSFER_STATUS_UPDATE**
- **Trigger**: Transfer status changed
- **When**: Transfer progresses through settlement
- **Action**: Update transfer status, notify user
- **Data**:
  ```json
  {
    "webhook_type": "TRANSFER",
    "webhook_code": "TRANSFER_STATUS_UPDATE",
    "transfer_id": "xfer-123",
    "status": "POSTED"
  }
  ```

### LIABILITIES Webhooks

**LIABILITIES_UPDATE_AVAILABLE**
- **Trigger**: Updated liability info available
- **When**: Account balance, interest rate, or terms change
- **Action**: Call `/liabilities/get` to retrieve updates
- **Data**:
  ```json
  {
    "webhook_type": "LIABILITIES",
    "webhook_code": "LIABILITIES_UPDATE_AVAILABLE",
    "item_id": "KdxrPLBVnZsXj..."
  }
  ```

### INCOME Webhooks

**INCOME_VERIFICATION_COMPLETED**
- **Trigger**: Income verification finished
- **When**: After document review or processing complete
- **Action**: Call `/income/verification/get` for results
- **Data**:
  ```json
  {
    "webhook_type": "INCOME",
    "webhook_code": "INCOME_VERIFICATION_COMPLETED",
    "user_id": "user-123",
    "verification_id": "v-123"
  }
  ```

### SIGNAL Webhooks

**SIGNAL_SCORE_AVAILABLE**
- **Trigger**: Risk score calculated
- **When**: After calling `/signal/evaluate`
- **Action**: Risk score ready (can ignore this webhook)
- **Data**:
  ```json
  {
    "webhook_type": "SIGNAL",
    "webhook_code": "SIGNAL_SCORE_AVAILABLE",
    "item_id": "KdxrPLBVnZsXj..."
  }
  ```

---

## Webhook Event Flow Examples

### Example 1: New Transactions Available

```
User transaction posts at bank
↓
Plaid detects new transaction (~30 min later)
↓
Sends: SYNC_UPDATES_AVAILABLE webhook
↓
Your code receives webhook
↓
Your code calls /transactions/sync
↓
Receives new transactions with details
↓
Updates your database
↓
Updates user UI
```

### Example 2: Authentication Failure

```
User changes bank password / MFA expires
↓
Plaid detects auth failure
↓
Sends: ITEM_LOGIN_REQUIRED webhook
↓
Your code receives webhook
↓
Your code shows notification to user
↓
User clicks "Update account"
↓
Link opens in update mode
↓
User re-enters credentials
↓
Link completes
↓
Access restored
```

### Example 3: Payment Settlement

```
User initiates ACH payment via your app
↓
Your code calls /transfer/create
↓
Transfer status: PROCESSING
↓
Payment submitted to bank
↓
Plaid sends: TRANSFER_STATUS_UPDATE (PENDING)
↓
Funds clear next business day
↓
Plaid sends: TRANSFER_STATUS_UPDATE (POSTED)
↓
Funds settle at destination
↓
Plaid sends: TRANSFER_STATUS_UPDATE (SETTLED)
↓
Your code notifies user "Payment complete"
```

---

## Webhook Retry Behavior

Plaid automatically retries failed webhooks:

### Retry Schedule

```
Attempt 1: Immediate
Attempt 2: After 1 minute
Attempt 3: After 2 minutes
Attempt 4: After 4 minutes
Attempt 5: After 8 minutes
```

Max 5 total attempts over ~15 minute period.

### What Counts as Success

- HTTP 2xx status code returned
- Within 30 second timeout
- Webhook verified signature (if configured)

### What Causes Retry

- Any HTTP 4xx or 5xx
- Connection timeout
- DNS resolution failure
- Body too large
- Invalid JSON

### Best Practices

1. **Respond immediately** (within 1 second):
   ```javascript
   res.status(200).json({ status: 'received' });
   ```

2. **Process asynchronously**:
   ```javascript
   res.status(200).json({ received: true });
   queue.add(processWebhook, req.body);
   ```

3. **Use queue/job system**: Bull, RabbitMQ, or similar
4. **Implement idempotency**: Handle duplicate webhooks gracefully
5. **Log all webhooks**: For debugging and audit trail

---

## Webhook Processing Patterns

### Pattern 1: Async Queue

```javascript
const Queue = require('bull');
const webhookQueue = new Queue('plaid-webhooks');

// Webhook handler
app.post('/webhooks/plaid', (req, res) => {
  if (!verifyPlaidWebhook(req)) {
    return res.status(401).json({ error: 'Invalid' });
  }

  // Add to queue immediately
  webhookQueue.add(req.body, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });

  // Return 200 immediately
  res.status(200).json({ status: 'queued' });
});

// Process queue
webhookQueue.process(async (job) => {
  const webhook = job.data;

  if (webhook.webhook_code === 'SYNC_UPDATES_AVAILABLE') {
    await syncTransactions(webhook.item_id);
  } else if (webhook.webhook_code === 'ITEM_LOGIN_REQUIRED') {
    await notifyUserNeedsReauth(webhook.item_id);
  }
  // ... handle other webhook types
});
```

### Pattern 2: Idempotent Processing

```javascript
// Store processed webhook IDs to avoid duplicates
const processedWebhooks = new Set();

async function handleWebhook(webhook) {
  // Create unique key
  const key = `${webhook.item_id}-${webhook.webhook_code}-${webhook.timestamp}`;

  // Check if already processed
  if (processedWebhooks.has(key)) {
    console.log('Webhook already processed, skipping');
    return;
  }

  // Mark as processing
  processedWebhooks.add(key);

  try {
    // Process webhook
    if (webhook.webhook_code === 'SYNC_UPDATES_AVAILABLE') {
      await syncTransactions(webhook.item_id);
    }
  } catch (error) {
    console.error('Webhook processing failed:', error);
    // Re-throw to trigger retry
    throw error;
  }
}
```

### Pattern 3: Webhook Monitoring Dashboard

```javascript
// Track webhook metrics
const webhookMetrics = {
  received: 0,
  processed: 0,
  failed: 0,
  latency: []
};

app.post('/webhooks/plaid', async (req, res) => {
  const startTime = Date.now();
  webhookMetrics.received++;

  if (!verifyPlaidWebhook(req)) {
    webhookMetrics.failed++;
    return res.status(401).json({ error: 'Invalid' });
  }

  res.status(200).json({ status: 'received' });

  try {
    await processWebhook(req.body);
    webhookMetrics.processed++;
  } catch (error) {
    webhookMetrics.failed++;
    console.error('Webhook error:', error);
  }

  const latency = Date.now() - startTime;
  webhookMetrics.latency.push(latency);
});

// Expose metrics
app.get('/metrics/webhooks', (req, res) => {
  const avgLatency = webhookMetrics.latency.reduce((a, b) => a + b, 0) /
                     webhookMetrics.latency.length;

  res.json({
    ...webhookMetrics,
    avgLatency: Math.round(avgLatency)
  });
});
```

---

## Common Webhook Issues & Solutions

### Issue: Webhook Not Delivering

**Symptoms**: Webhooks configured but not receiving events

**Troubleshooting**:
1. Check webhook URL is HTTPS (not HTTP)
2. Verify URL is publicly accessible (not localhost)
3. Check firewall allows POST from Plaid IP ranges
4. Verify endpoint returns HTTP 200
5. Check server logs for incoming requests
6. Use ngrok or RequestBin for debugging locally

**Solution**:
```bash
# Test webhook URL with curl
curl -X POST https://yourdomain.com/webhooks/plaid \
  -H "Content-Type: application/json" \
  -d '{"webhook_type":"TEST","webhook_code":"TEST"}'
```

### Issue: Webhook Signature Verification Failing

**Symptoms**: All webhooks rejected due to invalid signature

**Troubleshooting**:
1. Confirm webhook key from Dashboard is correct
2. Verify you're using the raw request body (not parsed/stringified differently)
3. Check HMAC-SHA256 calculation is correct
4. Ensure no request body transformations

**Solution**:
```javascript
// Correct: Use raw body, not JSON-parsed
const body = req.rawBody; // Express: app.use(express.raw({type: '*/*'}))

const hmac = crypto
  .createHmac('sha256', secret)
  .update(body)
  .digest('hex');
```

### Issue: Duplicate Webhooks

**Symptoms**: Processing same event multiple times

**Cause**: Plaid retries, network issues cause duplicates

**Solution**: Implement idempotency keys
```javascript
// Store processed webhook IDs in database
const webhookLog = await db.webhooks.findOne({
  item_id: webhook.item_id,
  webhook_code: webhook.webhook_code,
  received_at: { $gte: Date.now() - 60000 } // Within last minute
});

if (webhookLog) {
  // Already processed, skip
  return;
}

// Process webhook
await processWebhook(webhook);
```

### Issue: Webhook Processing Too Slow

**Symptoms**: Plaid times out webhooks, getting repeated retries

**Cause**: Processing takes too long before responding

**Solution**: Always respond immediately
```javascript
// Wrong: Process before responding
app.post('/webhooks/plaid', async (req, res) => {
  await processWebhook(req.body); // Slow!
  res.status(200).json({ ok: true });
});

// Correct: Respond immediately
app.post('/webhooks/plaid', (req, res) => {
  res.status(200).json({ status: 'received' }); // Fast!
  processWebhookAsync(req.body); // Process later
});
```

---

## Testing Webhooks

### Sandbox Testing

Manually trigger test webhooks in Dashboard:

1. Navigate to **Dashboard > Data**
2. Find test/sandbox item
3. Click "Send Test Webhook"
4. Select webhook type to test
5. Verify your endpoint receives it

### Local Testing with ngrok

```bash
# Start ngrok tunnel
ngrok http 3000

# Get URL like: https://abc123.ngrok.io
# Use as webhook URL: https://abc123.ngrok.io/webhooks/plaid

# View incoming webhooks in ngrok dashboard
```

### Testing Script

```javascript
// Test webhook verification
const crypto = require('crypto');

const testWebhook = {
  webhook_type: 'TRANSACTIONS',
  webhook_code: 'SYNC_UPDATES_AVAILABLE',
  item_id: 'test-item-123'
};

const body = JSON.stringify(testWebhook);
const secret = 'your-webhook-key';

const hmac = crypto
  .createHmac('sha256', secret)
  .update(body)
  .digest('hex');

const signature = `hmac-sha256=${hmac}`;

console.log('Webhook:', testWebhook);
console.log('Signature:', signature);

// Send test webhook
fetch('http://localhost:3000/webhooks/plaid', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Plaid-Verification': signature
  },
  body: body
});
```

---

## Webhook Monitoring Checklist

- [ ] Webhook URL configured in Dashboard
- [ ] Webhook URL is HTTPS and publicly accessible
- [ ] Endpoint returns HTTP 200 status
- [ ] Webhook verification implemented
- [ ] Asynchronous processing configured
- [ ] Idempotency keys implemented
- [ ] Logging and monitoring enabled
- [ ] Error alerting configured
- [ ] Retry handling implemented
- [ ] Tested with sandbox items
- [ ] Tested failure scenarios
- [ ] Rate limiting implemented
- [ ] Database query optimization (N+1 problems)
- [ ] Webhook delivery SLA monitored

---

**Last Updated**: 2026
**Compatible with**: Plaid API v2025+
