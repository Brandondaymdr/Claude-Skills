# Plaid API Error Handling Guide

## Error Response Format

All Plaid API errors return a standardized JSON structure:

```javascript
{
  "error_type": "ITEM_ERROR",
  "error_code": "ITEM_LOGIN_REQUIRED",
  "error_message": "User login required to continue with the item.",
  "display_message": "Please log in again to your bank account.",
  "request_id": "NvxPqL1cVsYkQ6u"
}
```

**Response Fields:**
- `error_type` (string): Category of error
- `error_code` (string): Specific error code for handling
- `error_message` (string): Technical message for debugging
- `display_message` (string): User-friendly message for UI
- `request_id` (string): Unique identifier for support/debugging

## Error Types

### INVALID_REQUEST

The request was invalid or malformed.

**Common error codes:**
- `MISSING_FIELDS`: Required fields missing (e.g., no access_token)
- `INVALID_FIELD`: Invalid field value (e.g., malformed date)
- `UNKNOWN_FIELD`: Unexpected field in request
- `INVALID_BODY`: JSON body is malformed

**Handling:**
```javascript
try {
  const response = await client.accountsGet({ access_token });
} catch (error) {
  if (error.response?.data?.error_type === 'INVALID_REQUEST') {
    // Validate request parameters
    console.error('Invalid request:', error.response.data.error_message);
    // Return 400 Bad Request to client
  }
}
```

---

### INVALID_RESULT

The result returned was invalid or couldn't be parsed.

**Common error codes:**
- `PARSING_ERROR`: Response from bank couldn't be parsed
- `SCHEMA_MISMATCH`: Data doesn't match expected schema

**Handling:**
```javascript
if (error.response?.data?.error_type === 'INVALID_RESULT') {
  // Usually temporary; retry after a short delay
  console.error('Invalid result from bank:', error.response.data.error_message);
  // Implement exponential backoff and retry
}
```

---

### INVALID_INPUT

Input validation failed.

**Common error codes:**
- `INVALID_COUNTRY_CODE`: Invalid country code
- `INVALID_PRODUCT`: Invalid product specified
- `INVALID_INSTITUTION_ID`: Institution ID doesn't exist

**Handling:**
```javascript
if (error.response?.data?.error_type === 'INVALID_INPUT') {
  // Client provided bad data; fix before retrying
  console.error('Invalid input:', error.response.data.error_message);
}
```

---

### INSTITUTION_ERROR

The financial institution returned an error or is unavailable.

**Common error codes:**
- `INSTITUTION_DOWN`: Bank's systems are down
- `INSTITUTION_NOT_RESPONDING`: Bank didn't respond in time
- `INSTITUTION_NOT_AVAILABLE`: Service not available for this institution
- `MAINTENANCE_WINDOW`: Bank is undergoing maintenance

**Handling:**
```javascript
if (error.response?.data?.error_type === 'INSTITUTION_ERROR') {
  // Show user-friendly message; retry later
  const message = error.response.data.display_message ||
    'We\'re temporarily unable to connect to your bank. Please try again later.';
  console.error(message);
  // Implement retry with exponential backoff
}
```

---

### RATE_LIMIT_EXCEEDED

Too many requests sent to Plaid API.

**Common error codes:**
- `RATE_LIMIT_EXCEEDED`: General rate limit hit

**Handling:**
```javascript
if (error.response?.data?.error_type === 'RATE_LIMIT_EXCEEDED') {
  // Check rate limit headers for reset time
  const resetTime = error.response.headers['plaid-ratelimit-reset'];
  const delay = parseInt(resetTime) * 1000; // Convert to milliseconds

  // Implement exponential backoff
  await sleep(delay);
  // Retry request
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

**Best practices:**
- Check `Plaid-Ratelimit-Remaining` header on each response
- Implement exponential backoff before hitting the limit
- Queue requests if approaching limit
- Use cursors for pagination instead of offset (lower request count)

---

### API_ERROR

An unexpected error occurred on Plaid's servers.

**Common error codes:**
- `INTERNAL_SERVER_ERROR`: 500 error on Plaid servers
- `SERVICE_UNAVAILABLE`: Plaid is temporarily unavailable

**Handling:**
```javascript
if (error.response?.data?.error_type === 'API_ERROR') {
  // Retry with exponential backoff
  // Check Plaid status page: https://plaid.statuspage.io/
  console.error('Plaid service error, retrying...');
}
```

---

### ITEM_ERROR

Error related to the item (bank connection).

**Common error codes:**

#### ITEM_LOGIN_REQUIRED
User's credentials expired; must re-authenticate.

```javascript
if (error.response?.data?.error_code === 'ITEM_LOGIN_REQUIRED') {
  // Trigger Link update mode with the access_token
  // User will re-authenticate their bank account

  // Frontend: Initialize Link in update mode
  const response = await fetch('/api/link-token-update', {
    method: 'POST',
    body: JSON.stringify({ access_token }),
  });
  const { link_token } = await response.json();

  // Use link_token in Link SDK with mode: 'update'
  plaid.open(link_token, 'update'); // Pseudo-code
}
```

#### ITEM_REMOVED
The item has been removed by the user or institution.

```javascript
if (error.response?.data?.error_code === 'ITEM_REMOVED') {
  // Item is no longer valid; ask user to reconnect
  // Request a new link_token and have user re-authenticate
}
```

#### ITEM_NOT_FOUND
Access token doesn't correspond to a valid item.

```javascript
if (error.response?.data?.error_code === 'ITEM_NOT_FOUND') {
  // Invalid access_token; may need to exchange public_token again
  // or have user re-authenticate via Link
}
```

#### INVALID_ACCESS_TOKEN
Access token is malformed or invalid.

```javascript
if (error.response?.data?.error_code === 'INVALID_ACCESS_TOKEN') {
  // Token is invalid; exchange a new one from public_token
  // or ask user to re-authenticate
}
```

#### ITEM_WEBHOOK_UPDATE_ACKNOWLEDGED
Webhook received but not processed (informational).

---

## Common Error Codes and Solutions

| Error Code | Error Type | Cause | Solution |
|------------|------------|-------|----------|
| ITEM_LOGIN_REQUIRED | ITEM_ERROR | User credentials expired | Trigger Link update mode |
| INVALID_ACCESS_TOKEN | ITEM_ERROR | Token invalid/malformed | Exchange new access_token from public_token |
| RATE_LIMIT_EXCEEDED | RATE_LIMIT_EXCEEDED | Too many requests | Wait and retry with exponential backoff |
| INSTITUTION_DOWN | INSTITUTION_ERROR | Bank unavailable | Show user message, retry later |
| MISSING_FIELDS | INVALID_REQUEST | Required field missing | Validate request, add missing field |
| INVALID_INSTITUTION_ID | INVALID_INPUT | Institution ID invalid | Check institution ID, search for correct one |
| ITEM_REMOVED | ITEM_ERROR | Item deleted | Ask user to reconnect via Link |
| PARSING_ERROR | INVALID_RESULT | Bank response unparseable | Retry with exponential backoff |
| INSTITUTION_NOT_RESPONDING | INSTITUTION_ERROR | Bank timeout | Show user message, retry later |
| INTERNAL_SERVER_ERROR | API_ERROR | Plaid server error | Retry with exponential backoff |

---

## Error Handling Best Practices

### 1. Structured Error Handling

```javascript
class PlaidErrorHandler {
  static async handleError(error) {
    if (!error.response?.data) {
      throw error; // Not a Plaid error
    }

    const { error_type, error_code, display_message } = error.response.data;

    switch (error_type) {
      case 'ITEM_ERROR':
        return this.handleItemError(error_code, display_message);
      case 'RATE_LIMIT_EXCEEDED':
        return this.handleRateLimit(error.response.headers);
      case 'INSTITUTION_ERROR':
        return this.handleInstitutionError(error_code, display_message);
      case 'INVALID_REQUEST':
        return this.handleInvalidRequest(error_code);
      default:
        return this.handleGenericError(display_message);
    }
  }

  static async handleItemError(code, message) {
    if (code === 'ITEM_LOGIN_REQUIRED') {
      return { action: 'update_link', message };
    }
    if (code === 'ITEM_REMOVED') {
      return { action: 'reconnect', message };
    }
    return { action: 'error', message };
  }

  static async handleRateLimit(headers) {
    const resetTime = parseInt(headers['plaid-ratelimit-reset']) * 1000;
    const delay = Math.max(resetTime - Date.now(), 1000);
    return { action: 'retry', delay };
  }

  static async handleInstitutionError(code, message) {
    return { action: 'retry', message, retryable: true };
  }

  static handleInvalidRequest(code) {
    return { action: 'error', message: 'Invalid request parameters' };
  }

  static handleGenericError(message) {
    return { action: 'error', message };
  }
}
```

### 2. Exponential Backoff Retry

```javascript
async function apiCallWithRetry(apiCall, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      const { error_type, error_code } = error.response?.data || {};

      // Only retry on retryable errors
      const retryable =
        error_type === 'RATE_LIMIT_EXCEEDED' ||
        error_type === 'INSTITUTION_ERROR' ||
        error_type === 'API_ERROR' ||
        error_code === 'PARSING_ERROR';

      if (!retryable || attempt === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s...
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage
const accounts = await apiCallWithRetry(() =>
  client.accountsGet({ access_token })
);
```

### 3. Request ID Logging

Always log the request_id for debugging:

```javascript
try {
  const response = await client.accountsGet({ access_token });
} catch (error) {
  const { error_code, error_message, request_id } = error.response.data;

  console.error(
    `Plaid error: ${error_code} (Request: ${request_id})\n${error_message}`
  );

  // Send to error tracking service
  errorTracker.captureException(error, {
    tags: { error_type: 'plaid_api' },
    extra: { request_id, error_code },
  });
}
```

### 4. User-Friendly Error Messages

```javascript
function getUserFriendlyMessage(error) {
  const { error_type, error_code, display_message } = error.response.data;

  // Use Plaid's display_message if available
  if (display_message) {
    return display_message;
  }

  // Fallback custom messages
  const messages = {
    ITEM_LOGIN_REQUIRED: 'Please log in again to your bank account.',
    INSTITUTION_DOWN: 'Your bank is temporarily unavailable. Please try again later.',
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please wait a moment and try again.',
    INVALID_ACCESS_TOKEN: 'Your connection has expired. Please reconnect your account.',
  };

  return messages[error_code] || 'An unexpected error occurred. Please try again.';
}
```

---

## Sandbox Test Error Codes

Use these error codes when testing with sandbox credentials:

| User | Institution | Error Code | Use Case |
|------|-------------|-----------|----------|
| user_good | Any sandbox bank | None | Successful authentication |
| user_bad | Chase | INVALID_CREDENTIALS | Failed login |
| user_locked | Plaid Test Bank | ITEM_LOGIN_REQUIRED | Account locked/expired |
| user_setup_needed | Wells Fargo | INVALID_CREDENTIALS | MFA setup required |
| user_old | Bank of America | ITEM_LOGIN_REQUIRED | Credentials expired |

**Example:**
```javascript
// Sandbox: Trigger ITEM_LOGIN_REQUIRED error
const publicToken = 'public-sandbox-ITEM_LOGIN_REQUIRED-bank_of_america';
// Now any API call with this token will return ITEM_LOGIN_REQUIRED error
```

---

## Webhook Error Handling

Webhooks notify you of background errors:

```javascript
app.post('/plaid-webhook', (req, res) => {
  const { webhook_type, webhook_code, item_id } = req.body;

  if (webhook_type === 'ITEM') {
    if (webhook_code === 'LOGIN_REQUIRED') {
      // Similar to ITEM_LOGIN_REQUIRED: user must re-authenticate
      notifyUser(item_id, 'Please re-authenticate your account');
    } else if (webhook_code === 'ERROR') {
      // Generic item error; investigate with request_id if provided
      console.error('Item error:', req.body.error);
    }
  }

  res.sendStatus(200);
});
```

---

## Debugging Tips

1. **Always save request_id**: Include in error logs and support requests
2. **Check Plaid Status**: Visit https://plaid.statuspage.io/ for known issues
3. **Validate Credentials**: Ensure PLAID_CLIENT_ID and PLAID_SECRET are correct
4. **Check Environment**: Sandbox credentials won't work on production endpoints
5. **Enable Debug Logging**: Use client library's debug mode:
   ```javascript
   // Node.js: Set environment variable
   DEBUG=plaid:* node app.js
   ```

---

## Monitoring and Alerting

Set up alerts for critical errors:

```javascript
const ErrorMonitor = {
  criticalErrors: ['INTERNAL_SERVER_ERROR', 'ITEM_REMOVED', 'INVALID_ACCESS_TOKEN'],

  async logError(error) {
    const { error_code } = error.response?.data || {};

    if (this.criticalErrors.includes(error_code)) {
      // Alert ops team immediately
      await alertOps(`Critical Plaid error: ${error_code}`);
    }

    // Always log to database
    await db.errors.create({
      error_code,
      timestamp: new Date(),
      context: error.config?.url,
    });
  },
};
```
