# Quick Start Guide

## 1. Setup (5 minutes)

```bash
# Clone/download the server
cd plaid-mcp-server

# Install dependencies
npm install

# Create .env file with your credentials
cp .env.example .env
# Edit .env and add your PLAID_CLIENT_ID and PLAID_SECRET
```

## 2. Build

```bash
npm run build
```

## 3. Run

```bash
# Production
npm start

# Or development with auto-reload
npm run dev
```

## 4. Configure in Claude Code

In your MCP settings, add this server and you'll have access to all Plaid tools.

## Example Tool Usage

### Get Accounts
```
User: Use plaid_get_accounts to retrieve all accounts
  - access_token: <your_access_token>
  - response_format: markdown
```

### Get Balance
```
User: Check the account balance using plaid_get_balance
  - access_token: <your_access_token>
```

### Search Institutions
```
User: Find all Chase branches using plaid_search_institutions
  - query: "Chase"
  - country_codes: ["US"]
```

### Sync Transactions
```
User: Sync recent transactions using plaid_sync_transactions
  - access_token: <your_access_token>
  - count: 50
```

## Available Tools

### Quick Reference

| Category | Tool | Purpose |
|----------|------|---------|
| Link | plaid_create_link_token | Create Link token |
| Link | plaid_exchange_public_token | Exchange for access token |
| Accounts | plaid_get_accounts | List accounts |
| Accounts | plaid_get_balance | Get balances |
| Accounts | plaid_get_item | Item info |
| Accounts | plaid_remove_item | Disconnect |
| Transactions | plaid_sync_transactions | Sync incrementally |
| Transactions | plaid_get_transactions | Date range query |
| Transactions | plaid_get_recurring_transactions | Find patterns |
| Transactions | plaid_refresh_transactions | Force refresh |
| Auth | plaid_get_auth | Routing numbers |
| Identity | plaid_get_identity | Owner info |
| Identity | plaid_match_identity | Verify identity |
| Investments | plaid_get_holdings | Holdings list |
| Investments | plaid_get_investment_transactions | Investment trades |
| Liabilities | plaid_get_liabilities | Credit/loans |
| Institutions | plaid_search_institutions | Search banks |
| Institutions | plaid_get_institution | Bank details |
| Transfer | plaid_create_transfer | Create ACH |
| Transfer | plaid_get_transfer | Transfer status |
| Transfer | plaid_list_transfers | List transfers |
| Signal | plaid_evaluate_signal | Risk score |

## Common Workflows

### 1. Connect Bank Account
```
1. plaid_create_link_token
   → Get link token
2. User completes Plaid Link in frontend
3. plaid_exchange_public_token
   → Get access_token
```

### 2. Get Financial Overview
```
1. plaid_get_accounts
   → See all accounts
2. plaid_get_balance
   → Current balances
3. plaid_sync_transactions
   → Recent activity
4. plaid_get_liabilities
   → Debts overview
```

### 3. Investment Analysis
```
1. plaid_get_holdings
   → Current positions
2. plaid_get_investment_transactions
   → Trading history
```

### 4. Risk Assessment
```
1. plaid_evaluate_signal
   → Transaction risk score
```

## Environment Variables

```bash
# Required
PLAID_CLIENT_ID=your_id
PLAID_SECRET=your_secret

# Optional (defaults shown)
PLAID_ENV=sandbox              # sandbox | development | production
TRANSPORT=stdio                # stdio | http
PORT=3000                      # HTTP port
```

## Troubleshooting

### "Invalid credentials" error
- Check PLAID_CLIENT_ID and PLAID_SECRET in .env
- Verify you're using the correct environment

### "Timeout" error
- Check internet connection
- Plaid API might be temporarily unavailable
- Try again in a few seconds

### TypeScript errors
- Run `npm install` to update dependencies
- Ensure Node.js 18+
- Try `npm run build` to check compilation

## Performance Tips

- Use `plaid_sync_transactions` instead of `plaid_get_transactions` for repeated queries
- Provide `account_ids` when possible to reduce API payload
- Cache `access_token` values on your end
- Use pagination cursor for large transaction sets

## Support

- Plaid API docs: https://plaid.com/docs
- GitHub: Check repository for issues
- Environment: Use sandbox for testing before production

## Security Reminders

- Never commit .env files
- Keep PLAID_SECRET private
- Don't expose access_tokens in logs
- Use HTTPS in production
- Rotate credentials regularly

## Next Steps

1. Read README.md for detailed documentation
2. Review IMPLEMENTATION.md for architecture details
3. Check Plaid API docs for endpoint specifics
4. Test with sandbox credentials first
5. Deploy to production when ready
