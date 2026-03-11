# Plaid Link Integration Guide

Comprehensive reference for implementing Plaid Link, the user-facing UI for secure bank account authentication.

## What is Plaid Link?

Plaid Link is a pre-built, secure user interface that guides users through connecting their financial accounts to your application. Instead of typing bank credentials into your app, users authenticate with Plaid Link, which handles the connection to their bank securely.

**Key benefits:**
- Consistent, polished user experience across all apps
- Users authenticate directly with banks (you never handle credentials)
- Built-in support for 12,000+ global institutions
- Automatic handling of MFA, re-authentication, and edge cases
- Mobile-optimized (Web, iOS, Android, React Native)
- Real-time status feedback and error recovery

## The Link Flow: Step by Step

### 1. User Initiates Account Linking
User clicks "Connect Bank Account" button in your application.

```
User → [Click Connect Button] → Your Frontend
```

### 2. Frontend Requests Link Token
Frontend makes secure backend call to request a Link Token (do not call Plaid directly from frontend for this step).

```javascript
// Frontend
fetch('/api/link-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: currentUser.id,
    // Optional: request specific products
    products: ['transactions', 'auth'],
    // Optional: filter account types
    accountType: 'checking'
  })
})
.then(res => res.json())
.then(data => initPlaidLink(data.linkToken))
```

### 3. Backend Generates Link Token
Your backend calls Plaid API to create a temporary Link Token.

```bash
# Backend → Plaid API
POST https://api.plaid.com/link/token/create

{
  "client_id": "YOUR_CLIENT_ID",
  "secret": "YOUR_SECRET",
  "user": {
    "client_user_id": "unique-user-id-from-your-system"
  },
  "client_name": "Your App Name",
  "language": "en",
  "country_codes": ["US"],
  "products": ["transactions"],
  "account_filters": {
    "depository": {
      "account_subtypes": ["checking"]
    }
  }
}
```

**Link Token Response:**
```json
{
  "link_token": "link-sandbox-abc123def456",
  "expiration": "2026-03-06T17:30:45Z"
}
```

**Key Token Properties:**
- **link_token**: The token to initialize Link with (valid 1 hour)
- **expiration**: ISO 8601 timestamp when token expires
- **request_id**: Unique request identifier for debugging

### 4. Frontend Initializes Plaid Link
Frontend receives Link Token and initializes the Link component.

```javascript
// Frontend - Web
import { usePlaidLink } from 'react-plaid-link';

const LinkFlow = ({ linkToken }) => {
  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: (publicToken, metadata) => {
      // Send public token to backend
      fetch('/api/exchange-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicToken })
      });
    },
    onExit: (err, metadata) => {
      // Handle user exit or error
      if (err) console.error('Link error:', err);
    },
    onEvent: (eventName, metadata) => {
      // Track Link events
      console.log(`Event: ${eventName}`, metadata);
    }
  });

  return (
    <button onClick={() => open()} disabled={!ready}>
      Connect Bank Account
    </button>
  );
};
```

**Android (React Native):**
```javascript
import { PlaidLink } from 'react-native-plaid-link-sdk';

export const PlaidLinkScreen = () => {
  return (
    <PlaidLink
      linkToken={linkToken}
      onSuccess={({ publicToken, metadata }) => {
        // Exchange token on backend
      }}
      onExit={(error, metadata) => {
        // Handle exit
      }}
    />
  );
};
```

**iOS:**
Use Plaid SDK for iOS (native Swift/Objective-C).

### 5. User Authenticates with Bank
User selects their bank and authenticates using Link's UI.

```
Link UI → [Select Institution] → [Enter Credentials] → [MFA if needed] → [Confirm Accounts]
```

Link handles:
- Institution search and selection
- Credential entry (never reaches your servers)
- Multi-factor authentication (SMS, security questions, etc.)
- Account selection (if user has multiple)
- Any additional steps required by the bank

### 6. Link Returns Public Token
Upon successful authentication, Link returns a `public_token` to your frontend's `onSuccess` callback.

```javascript
const onSuccess = (publicToken, metadata) => {
  console.log('Success! Public Token:', publicToken);
  console.log('Metadata:', metadata);
  // metadata includes itemId, accounts, institution, etc.

  // Now send to backend for token exchange
  fetch('/api/exchange-token', {
    method: 'POST',
    body: JSON.stringify({ publicToken })
  });
};
```

**Public Token Properties:**
- **publicToken**: One-time token valid for ~30 minutes
- **metadata.item_id**: Plaid item ID (useful for tracking)
- **metadata.public_token**: Same as publicToken (redundant)
- **metadata.institution**: Bank information (name, id)
- **metadata.accounts**: List of linked accounts and balances
- **metadata.link_session_id**: Session identifier

### 7. Frontend Sends Public Token to Backend
Frontend securely transmits the public token to your backend (never expose on frontend otherwise).

```javascript
// Frontend
await fetch('/api/exchange-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}` // Optional auth
  },
  body: JSON.stringify({
    publicToken: publicToken,
    userId: currentUser.id // For your records
  })
});
```

### 8. Backend Exchanges Public Token for Access Token
Your backend calls Plaid to exchange the public token for a long-lived access token.

```bash
# Backend → Plaid API
POST https://api.plaid.com/item/public_token/exchange

{
  "client_id": "YOUR_CLIENT_ID",
  "secret": "YOUR_SECRET",
  "public_token": "public-sandbox-abc123def456"
}
```

**Access Token Response:**
```json
{
  "access_token": "access-sandbox-xyz789uvw012",
  "item_id": "KdxrPLBVnZsXj..."
}
```

**Key Token Properties:**
- **access_token**: Long-lived token for API calls (store securely!)
- **item_id**: Unique item identifier for future reference

### 9. Backend Stores Access Token
Backend securely stores the access token in your database, associated with the user.

```javascript
// Backend - Node.js example
const user = await User.findById(userId);
user.plaidAccessToken = accessToken;
user.plaidItemId = itemId;
await user.save();
```

**Storage best practices:**
- Encrypt access tokens at rest (use database encryption)
- Never log or expose in error messages
- Rotate tokens periodically (request new ones from Plaid)
- Delete tokens when user removes bank connection
- Use HSM or key management service for token encryption

### 10. Backend Uses Access Token to Fetch Data
Backend can now use the access token to fetch financial data.

```bash
# Backend → Plaid API
POST https://api.plaid.com/transactions/get

{
  "client_id": "YOUR_CLIENT_ID",
  "secret": "YOUR_SECRET",
  "access_token": "access-sandbox-xyz789uvw012",
  "start_date": "2026-01-01",
  "end_date": "2026-03-06"
}
```

---

## Link Token Creation Parameters

Complete reference for `/link/token/create` configuration.

### Required Parameters

**client_id** (string)
- Your Plaid application ID
- Found in Dashboard > Team Settings > Keys

**secret** (string)
- Your Plaid secret key
- Never expose to frontend

**user.client_user_id** (string)
- Unique identifier for the user in your system
- Used by Plaid to track updates for this user
- Example: "user-12345" or UUID

**client_name** (string)
- Your application name displayed in Link UI
- Example: "Budget Buddy" or "My Fintech App"

**country_codes** (array of strings)
- Supported countries for institution search
- Example: `["US"]` or `["US", "GB", "FR"]`
- Determines institution availability

**language** (string)
- UI language for Link
- Examples: "en", "es", "fr", "de"
- Default: "en"

### Optional Parameters

**products** (array of strings)
```javascript
products: [
  "transactions",      // Fetch transaction history
  "auth",             // Get account/routing numbers
  "balance",          // Real-time balance checks
  "identity",         // Owner verification
  "investments",      // Holdings and securities
  "liabilities",      // Debt aggregation
  "income",           // Income verification
  "transfer",         // Payment initiation
  "signal"            // Risk assessment
]
```
- Request only products you need (improves user experience)
- Users see permissions for each product
- Can be updated later via update mode

**account_filters** (object)
```javascript
account_filters: {
  depository: {
    account_subtypes: [
      "checking",
      "savings",
      "money market",
      "cd"
    ]
  },
  credit: {
    account_subtypes: ["credit card"]
  },
  investment: {
    account_subtypes: ["brokerage"]
  },
  loan: {
    account_subtypes: ["auto", "student"]
  }
}
```
- Filter which account types users can select
- Helpful for specific use cases (e.g., checking accounts only)
- Users can override filters in some cases

**webhook** (string)
```javascript
webhook: "https://yourdomain.com/webhooks/plaid"
```
- URL for real-time event notifications
- Plaid will POST events when data changes
- Must be HTTPS and publicly accessible

**access_token** (string, optional)
```javascript
access_token: "access-sandbox-existing-token"
```
- For update mode flows (re-authentication)
- Enables user to refresh/update existing connection

**authentication_flow** (string, optional)
```javascript
authentication_flow: "FLEXIBLE" // or "OAUTH"
```
- "FLEXIBLE": Let Link choose best method per institution
- "OAUTH": Use OAuth only (some institutions don't support)
- Default: "FLEXIBLE"

**account_subtypes** (array, optional)
```javascript
account_subtypes: ["checking", "savings"]
```
- Alternative to account_filters for simpler filtering

**user.legal_name** (object, optional)
```javascript
user: {
  client_user_id: "user-123",
  legal_name: {
    first_name: "John",
    last_name: "Doe"
  }
}
```
- Pre-populate user name in Link UI
- Used for verification endpoints
- Improves user experience

---

## Link Configuration Options

### Appearance & Customization

Customize Link appearance via Dashboard settings:

1. Navigate to **Apps** → [Your App]
2. Scroll to **Link Configuration**
3. Customize:
   - **Color scheme**: Match your brand
   - **Logo**: Your app logo
   - **Font**: Brand typography
   - **Button style**: Primary button appearance

Link UI will reflect these settings automatically.

### Language Support

Plaid Link supports 20+ languages:

```javascript
// Language codes
language: "en"  // English
language: "es"  // Spanish
language: "fr"  // French
language: "de"  // German
language: "it"  // Italian
language: "pt"  // Portuguese
language: "ja"  // Japanese
language: "nl"  // Dutch
language: "pl"  // Polish
// ... and more
```

### Platform-Specific Configuration

**Web (React/Vue/Vanilla JS)**
- Use `react-plaid-link` NPM package (recommended)
- Or use plain Plaid Link SDK loaded from CDN
- Responsive design adapts to all screen sizes

**Mobile (iOS)**
- Native SDK for iOS
- Supports Objective-C and Swift
- Deeplinks to native banking apps

**Mobile (Android)**
- Native SDK for Android
- Java and Kotlin support
- Deeplinks to native banking apps

**React Native**
- `react-native-plaid-link-sdk` package
- Works on iOS and Android
- Native performance

---

## Token Exchange & Access Token Management

### Public Token Exchange

Exchange a public token for an access token:

```bash
POST /item/public_token/exchange

{
  "client_id": "YOUR_CLIENT_ID",
  "secret": "YOUR_SECRET",
  "public_token": "public-sandbox-abc123"
}
```

Response:
```json
{
  "access_token": "access-sandbox-xyz789",
  "item_id": "KdxrPLBVnZsXj..."
}
```

**Important notes:**
- Public token is one-time use only
- Expires if not exchanged within ~30 minutes
- Exchange must happen server-to-server (secure)
- Access token valid for life of item (until user revokes)

### Access Token Rotation

Rotate access token periodically for security:

```bash
POST /item/access_token/rotate

{
  "client_id": "YOUR_CLIENT_ID",
  "secret": "YOUR_SECRET",
  "access_token": "access-sandbox-old-token"
}
```

Response:
```json
{
  "new_access_token": "access-sandbox-new-token",
  "item_id": "KdxrPLBVnZsXj..."
}
```

**Rotation best practices:**
- Rotate tokens every 90 days minimum
- Store new token before invalidating old one
- Update in-flight requests to use new token
- Log rotation events for audit trail

### Item Management

**Get Item Information**
```bash
POST /item/get

{
  "client_id": "YOUR_CLIENT_ID",
  "secret": "YOUR_SECRET",
  "access_token": "access-sandbox-xyz789"
}
```

Response includes institution, accounts, products available, and connection status.

**Remove Item**
```bash
POST /item/remove

{
  "client_id": "YOUR_CLIENT_ID",
  "secret": "YOUR_SECRET",
  "access_token": "access-sandbox-xyz789"
}
```

Permanently disconnects user's account. They must re-authenticate to reconnect.

---

## Error Handling & Recovery

### Common Link Errors

**INVALID_LINK_TOKEN**
- Cause: Link token expired or invalid
- Solution: Request new Link token from backend
- Timing: Tokens valid for 1 hour

**INVALID_PUBLIC_TOKEN**
- Cause: Public token not exchanged within time limit
- Solution: Restart Link flow and get new tokens
- Timing: Public tokens valid ~30 minutes

**ITEM_LOGIN_REQUIRED**
- Cause: User's bank credentials invalid/expired
- Solution: User must re-authenticate (use update mode)
- Action: Trigger update flow with existing access token

**INSTITUTION_NOT_SUPPORTED**
- Cause: Institution not available in your region/products
- Solution: Check institution is in coverage for your product
- Remedy: Contact Plaid support for institution additions

**INSTITUTION_NOT_RESPONDING**
- Cause: Bank's servers temporarily down
- Solution: Retry after delay (exponential backoff)
- Timing: Usually resolves within minutes

### Error Recovery Flow

```javascript
const onExit = (error, metadata) => {
  if (!error) {
    // User exited normally
    console.log('Link exited');
    return;
  }

  switch (error.error_code) {
    case 'INVALID_LINK_TOKEN':
      // Request new token
      refreshLinkToken();
      break;

    case 'INSTITUTION_NOT_SUPPORTED':
      // Show message to user
      showError('This institution is not supported. Please select another.');
      break;

    case 'ITEM_LOGIN_REQUIRED':
      // User needs to re-authenticate
      showMessage('Please re-enter your bank credentials.');
      openLinkInUpdateMode();
      break;

    case 'INTERNAL_ERROR':
      // Plaid server error, retry later
      showError('Temporary issue. Please try again in a few moments.');
      scheduleRetry();
      break;

    default:
      // Generic error handling
      logErrorToMonitoring(error);
      showError('An error occurred. Please try again.');
  }
};
```

---

## Update Mode: Re-authentication & Account Changes

Use update mode when an existing user needs to:
- Re-enter bank credentials (MFA expired, password changed)
- Add new accounts to existing connection
- Remove/update accounts
- Grant new product permissions

### Triggering Update Mode

```javascript
// Backend - Generate new Link token with existing access_token
POST /link/token/create

{
  "client_id": "YOUR_CLIENT_ID",
  "secret": "YOUR_SECRET",
  "user": {
    "client_user_id": "user-123"
  },
  "client_name": "Your App",
  "language": "en",
  "country_codes": ["US"],
  "access_token": "access-sandbox-existing-token",  // KEY: Include existing token
  "products": ["transactions"]  // Can add new products here
}
```

The returned Link Token will open in update mode, allowing users to:
- Re-authenticate if credentials expired
- Add new accounts
- Grant additional permissions

### When to Trigger Update Mode

**Automatic triggers:**
- Webhook indicates `ITEM_LOGIN_REQUIRED`
- Backend detects failed API call with 401 error
- User explicitly clicks "Re-authenticate" button

**Manual triggers:**
- User adds a new account
- User wants to grant access to additional products
- User grants permission for historical data access

---

## OAuth Redirect Handling

For institutions using OAuth authentication:

### Setup Redirect URI

1. Navigate to Dashboard > Apps > [Your App]
2. Add Redirect URI under OAuth Settings
3. Examples:
   - Web: `https://yourapp.com/auth/callback`
   - Mobile: `yourapp://oauth-callback`

### OAuth Flow

```
1. User selects OAuth institution
2. Link redirects to bank's OAuth login
3. User authenticates with bank
4. Bank redirects to your callback URI
5. Link resumes authentication
6. Link returns public token
```

### Callback Handling

```javascript
// Your redirect callback endpoint
app.get('/auth/callback', (req, res) => {
  // State parameter matches what was sent
  const state = req.query.state;

  // Plaid Link handles OAuth completion
  // You don't need to do anything special here
  // Just redirect back or acknowledge

  res.send('Authentication successful. You can close this window.');
});
```

---

## Webhook Events for Link

Link workflow generates webhooks:

```
PENDING_EXPIRATION
  Trigger: User's bank credentials will expire soon
  Action: Trigger update mode for re-authentication

ITEM_LOGIN_REQUIRED
  Trigger: User's credentials are invalid/expired
  Action: Trigger update mode

WEBHOOK_VERIFICATION_FAILED
  Trigger: Webhook verification failed
  Action: Check webhook secret is correct
```

See webhooks.md for complete webhook reference.

---

## Best Practices

### Security
1. Never expose client_id or secret to frontend
2. Generate new Link Token for each Link session
3. Exchange public tokens immediately after success
4. Encrypt and secure access tokens in database
5. Verify webhook signatures before processing
6. Use HTTPS for all endpoints
7. Implement rate limiting on token creation

### User Experience
1. Show loading state while requesting Link Token
2. Display clear error messages with recovery options
3. Disable "Connect" button until Link Token received
4. Provide fallback if Link fails (manual account entry)
5. Show progress during account linking
6. Confirm successful account connection

### Operations
1. Log all Link events for debugging
2. Monitor link success/failure rates
3. Alert on unusual Link error patterns
4. Track time from token creation to success
5. Monitor webhook delivery success
6. Test with Sandbox before deploying

### Testing

**Sandbox Testing:**
- Use any username with password "pass_good"
- Test error scenarios with special usernames
- No actual institution connection

**Development Environment:**
- Use real test credentials provided by banks
- Test with real institutions
- Careful with personal data

**Production:**
- Monitor for unusual patterns
- Implement fraud detection
- Rotate tokens regularly
- Maintain audit logs

---

**Last Updated**: 2026
**SDK Versions**: react-plaid-link ^3.3.0+, Plaid API v2025+
