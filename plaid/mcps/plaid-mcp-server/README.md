# Plaid MCP Server

A comprehensive Model Context Protocol (MCP) server that enables Claude to make actual Plaid API calls. This server implements the full Plaid API surface, allowing Claude to interact with financial institution data.

## Features

- **Link Management**: Create Link tokens and exchange public tokens for access tokens
- **Account Operations**: Retrieve accounts, balances, and item information
- **Transactions**: Sync transactions, get transaction history, and identify recurring patterns
- **Authentication**: Access account and routing numbers
- **Identity**: Get account owner information and verify identity
- **Investments**: Retrieve investment holdings and transaction history
- **Liabilities**: Access credit cards, student loans, and mortgage information
- **Institutions**: Search for and get details about financial institutions
- **Transfers**: Create and manage ACH transfers
- **Signal**: Evaluate transaction risk with Plaid Signal

## Installation

### Prerequisites

- Node.js 18+
- Plaid API credentials (client ID and secret)

### Setup

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

4. Add your Plaid credentials to `.env`:

```
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
PLAID_ENV=sandbox
```

5. Build the project:

```bash
npm run build
```

## Running the Server

### Development Mode

```bash
npm run dev
```

This uses `tsx` to watch for file changes and automatically restart.

### Production Mode

```bash
npm start
```

## Configuration

### Environment Variables

- **PLAID_CLIENT_ID**: Your Plaid client ID (required)
- **PLAID_SECRET**: Your Plaid secret (required)
- **PLAID_ENV**: Environment - `sandbox`, `development`, or `production` (default: `sandbox`)
- **TRANSPORT**: Communication transport - `stdio` or `http` (default: `stdio`)
- **PORT**: Port for HTTP transport (default: `3000`)

### Using with Claude Code

1. Start the server:
```bash
npm run build && npm start
```

2. In Claude Code, configure the MCP server in your settings to connect to this server

## API Tools

### Link Token Management
- **plaid_create_link_token**: Create a Link token for user authentication
- **plaid_exchange_public_token**: Exchange a public token for an access token

### Account Management
- **plaid_get_accounts**: Get all accounts for a connection
- **plaid_get_balance**: Get real-time account balances
- **plaid_get_item**: Get Item details (linked institution)
- **plaid_remove_item**: Remove a connection

### Transactions
- **plaid_sync_transactions**: Sync transactions incrementally
- **plaid_get_transactions**: Get transactions for a date range
- **plaid_get_recurring_transactions**: Identify recurring transactions
- **plaid_refresh_transactions**: Force a transaction refresh

### Authentication
- **plaid_get_auth**: Get account and routing numbers

### Identity
- **plaid_get_identity**: Get account owner identity information
- **plaid_match_identity**: Verify user identity against institution records

### Investments
- **plaid_get_holdings**: Get investment account holdings
- **plaid_get_investment_transactions**: Get investment transaction history

### Liabilities
- **plaid_get_liabilities**: Get credit, student loan, and mortgage information

### Institutions
- **plaid_search_institutions**: Search for financial institutions
- **plaid_get_institution**: Get details about a specific institution

### Transfers
- **plaid_create_transfer**: Create an ACH transfer
- **plaid_get_transfer**: Get transfer details
- **plaid_list_transfers**: List transfers

### Risk Assessment
- **plaid_evaluate_signal**: Evaluate ACH transaction risk

## Architecture

### Service Layer
- **plaid-client.ts**: Handles authentication, request formatting, and error handling

### Type Definitions
- **types.ts**: TypeScript interfaces for all Plaid data structures

### Tool Modules
Each tool domain is organized into its own file:
- `link.ts`: Link token operations
- `accounts.ts`: Account and balance operations
- `transactions.ts`: Transaction retrieval and syncing
- `auth.ts`: Authentication/routing number access
- `identity.ts`: Identity information
- `investments.ts`: Investment data
- `liabilities.ts`: Liability information
- `institutions.ts`: Institution lookup
- `transfer.ts`: Transfer management
- `signal.ts`: Risk evaluation

## Error Handling

The server includes comprehensive error handling:
- Plaid API errors are parsed and formatted
- Network timeouts and connection errors are caught
- Invalid credentials are detected on startup
- Rate limiting is handled gracefully

## Response Formats

All tools support both Markdown and JSON response formats via the `response_format` parameter:
- `markdown` (default): Human-readable formatted output
- `json`: Structured JSON data

## Security Considerations

- Credentials are read from environment variables only
- No credentials are logged or transmitted unnecessarily
- All requests use HTTPS to Plaid's API
- The server validates credentials on startup
- No sensitive data is cached

## Rate Limiting

The Plaid API has rate limits. The server does not implement built-in retry logic; instead, it returns Plaid's rate limit errors for Claude to handle appropriately.

## Troubleshooting

### "Invalid credentials" error
- Verify PLAID_CLIENT_ID and PLAID_SECRET are set correctly
- Check that you're using the right environment (sandbox/development/production)

### "Timeout" errors
- Check network connectivity
- Verify the Plaid API endpoint is accessible
- Try again after a brief delay

### Type compilation errors
- Ensure TypeScript 5.3+ is installed
- Run `npm install` to update dependencies
- Clear `dist/` folder and rebuild

## License

MIT
