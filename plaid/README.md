# Plaid Plugin for Claude

Complete Plaid financial platform integration for Claude, built for ShoreStack Books.

## What's Included

### Skills

**plaid-platform** — Navigation and operational guide for the Plaid platform. Covers all products, the Plaid Dashboard, Link integration flow, webhooks, and environment management.

**plaid-api** — Developer-focused API integration skill. Covers authentication, endpoint reference, error handling, token lifecycle, and code patterns for Node.js and Python.

### MCP Server

**plaid-mcp-server** — TypeScript MCP server providing 20+ tools for direct Plaid API access:

| Domain | Tools |
|--------|-------|
| Link | Create link tokens, exchange public tokens |
| Accounts | Get accounts, balances, item details |
| Transactions | Sync transactions, get recurring, refresh |
| Auth | Get account/routing numbers |
| Identity | Get identity info, match identity |
| Investments | Get holdings, investment transactions |
| Liabilities | Get credit, student loan, mortgage data |
| Institutions | Search institutions, get institution details |
| Transfer | Create, get, list transfers |
| Signal | Evaluate ACH transaction risk |

## Setup

### 1. Get Plaid Credentials

Sign up at [dashboard.plaid.com](https://dashboard.plaid.com) and get your `client_id` and `secret`.

### 2. Build the MCP Server

```bash
cd mcps/plaid-mcp-server
npm install
npm run build
```

### 3. Configure Environment

Set these environment variables:

```bash
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
PLAID_ENV=sandbox  # or development, production
```

### 4. Install the Plugin

Add the plugin to your Claude configuration by pointing to this directory's `manifest.json`.

## Environments

- **Sandbox**: Free testing with simulated data. Use test credentials like `user_good` / `pass_good`.
- **Development**: Test with real institutions (limited to 100 Items).
- **Production**: Full access after Plaid approval.
