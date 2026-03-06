# Plaid MCP Server - Implementation Guide

## Overview

This is a production-quality Plaid MCP server implementation in TypeScript. It provides Claude with direct access to the Plaid API for financial data retrieval, account management, and risk assessment.

## Project Structure

```
plaid-mcp-server/
├── src/
│   ├── services/
│   │   └── plaid-client.ts          # Plaid API client wrapper
│   ├── schemas/
│   │   └── common.ts                # Shared Zod validation schemas
│   ├── tools/                       # Tool implementations by domain
│   │   ├── link.ts                  # Link token & auth
│   │   ├── accounts.ts              # Account & balance operations
│   │   ├── transactions.ts          # Transaction retrieval & syncing
│   │   ├── auth.ts                  # Account numbers & routing info
│   │   ├── identity.ts              # Identity verification
│   │   ├── investments.ts           # Investment holdings & history
│   │   ├── liabilities.ts           # Credit/loan/mortgage data
│   │   ├── institutions.ts          # Institution search & details
│   │   ├── transfer.ts              # ACH transfer management
│   │   └── signal.ts                # Risk evaluation
│   ├── types.ts                     # TypeScript type definitions
│   └── index.ts                     # MCP server entry point
├── package.json                     # Dependencies & scripts
├── tsconfig.json                    # TypeScript configuration
├── .env.example                     # Example environment variables
├── .gitignore                       # Git ignore rules
├── README.md                        # User documentation
└── IMPLEMENTATION.md                # This file
```

## Architecture

### 1. Service Layer (plaid-client.ts)

**Purpose**: Centralized Plaid API communication

**Key Features**:
- Handles authentication (injects client_id and secret into requests)
- Manages base URL selection (sandbox/development/production)
- Provides consistent error handling
- All requests are POST with JSON content-type
- 30-second request timeout

**API**:
```typescript
class PlaidClient {
  constructor(clientId: string, secret: string, environment: string)
  async makeApiRequest<T>(endpoint: string, data: Record<string, unknown>): Promise<T>
  getBaseUrl(): string
}
```

### 2. Type System (types.ts)

**Purpose**: TypeScript interfaces for all Plaid data structures

**Key Interfaces**:
- `PlaidAccount`: Account details
- `PlaidTransaction`: Transaction record
- `PlaidBalance`: Account balance
- `PlaidInstitution`: Financial institution
- `PlaidItem`: Linked connection
- `PlaidIdentity`: Account owner information
- `PlaidInvestmentHolding`: Investment position
- `PlaidLiability`: Credit/loan data
- `PlaidTransfer`: ACH transfer record

All interfaces are non-null-asserting for production use while handling optional fields.

### 3. Schemas (schemas/common.ts)

**Purpose**: Zod validation schemas for tool inputs

**Shared Schemas**:
- `ResponseFormatSchema`: Enum for markdown/json
- `PaginationSchema`: Cursor and count for pagination
- `AccessTokenSchema`: Access token validation
- `CountryCodesSchema`: Country code arrays
- `PlaidUserSchema`: User information (name, email, phone)
- `PlaidAddressSchema`: Address information
- `LanguageSchema`: Supported UI languages
- `AccountFiltersSchema`: Account filtering options

**Usage**:
```typescript
server.tool(
  "tool_name",
  "description",
  {
    access_token: AccessTokenSchema,
    response_format: ResponseFormatSchema,
    // ... other fields
  },
  async (params) => { /* implementation */ }
);
```

### 4. Tool Modules

Each tool module follows a consistent pattern:

**Export Format**:
```typescript
export function register[Domain]Tools(server: McpServer, client: PlaidClient) {
  server.tool(
    "plaid_operation_name",
    "Detailed description with Args, Returns, Examples, Error Handling",
    {
      // Zod schema with .strict() for all fields
    },
    async (params) => {
      // Implementation
    }
  );

  // More tools...
}
```

**Tool Characteristics**:
- Input validation with Zod schema.strict()
- Descriptive names starting with `plaid_`
- Comprehensive docstrings
- Support for both markdown and JSON responses
- Error handling with user-friendly messages
- Optional parameters have .optional() and descriptions
- Enum fields use z.enum() for type safety

### 5. Entry Point (index.ts)

**Purpose**: MCP server initialization and transport setup

**Flow**:
1. Validates PLAID_CLIENT_ID and PLAID_SECRET on startup
2. Creates PlaidClient instance
3. Creates McpServer with name and version
4. Registers all tool domains
5. Configures transport (stdio or HTTP)
6. Starts server

**Transport Support**:
- **stdio** (default): Standard input/output for MCP communication
- **http**: Streamable HTTP for testing/debugging

## Tool Categories

### Link Tokens (2 tools)
- Create Link tokens for user authentication
- Exchange public tokens for access tokens

**Endpoint**: `/link/token/create`, `/item/public_token/exchange`

### Accounts (4 tools)
- Retrieve accounts, balances, item info
- Remove Item connections

**Endpoints**: `/accounts/get`, `/accounts/balance/get`, `/item/get`, `/item/remove`

### Transactions (4 tools)
- Sync transactions (incremental)
- Get transaction history
- Identify recurring patterns
- Force refresh

**Endpoints**: `/transactions/sync`, `/transactions/get`, `/transactions/recurring/get`, `/transactions/refresh`

### Authentication (1 tool)
- Get account and routing numbers

**Endpoint**: `/auth/get`

### Identity (2 tools)
- Get account owner information
- Verify identity against institution

**Endpoints**: `/identity/get`, `/identity/match`

### Investments (2 tools)
- Retrieve holdings
- Get transaction history

**Endpoints**: `/investments/holdings/get`, `/investments/transactions/get`

### Liabilities (1 tool)
- Get credit cards, student loans, mortgages

**Endpoint**: `/liabilities/get`

### Institutions (2 tools)
- Search for institutions
- Get institution details

**Endpoints**: `/institutions/search`, `/institutions/get_by_id`

### Transfers (3 tools)
- Create ACH transfer
- Get transfer status
- List transfers

**Endpoints**: `/transfer/create`, `/transfer/get`, `/transfer/list`

### Signal (1 tool)
- Evaluate ACH transaction risk

**Endpoint**: `/signal/evaluate`

## API Patterns

### Request Format
All Plaid API requests follow this pattern:
```typescript
{
  client_id: "your_client_id",
  secret: "your_secret",
  access_token?: "access_token_if_needed",
  // ... other parameters
}
```

Method: POST
Content-Type: application/json

### Response Format
All tools support dual response formats:

**Markdown** (default):
```markdown
# Title

**Bold text:** Value

- Bullet points
- Additional details

## Sections
Detailed information
```

**JSON**:
```json
{
  "field": "value",
  "numbers": 123,
  "array": ["item1", "item2"]
}
```

Selected by `response_format` parameter.

### Error Handling

**Plaid API Errors**:
```typescript
{
  error_type: "INVALID_REQUEST",
  error_code: "MISSING_FIELDS",
  error_message: "user not provided",
  display_message: null,
  request_id: "..."
}
```

**Server Error Handling**:
- Parses Plaid error structure
- Returns user-friendly error messages
- Logs full error details to stderr
- Handles network timeouts (30s)
- Detects authentication failures
- Manages rate limiting

## Configuration

### Environment Variables

```bash
# Required
PLAID_CLIENT_ID=your_client_id          # Plaid client ID
PLAID_SECRET=your_secret                 # Plaid secret

# Optional
PLAID_ENV=sandbox                        # sandbox, development, production
TRANSPORT=stdio                          # stdio or http
PORT=3000                                # HTTP port (if using http transport)
```

### Base URLs by Environment

- Sandbox: https://sandbox.plaid.com
- Development: https://development.plaid.com
- Production: https://production.plaid.com

## Development

### Building

```bash
npm run build
```

Compiles TypeScript to JavaScript in `dist/` folder.

### Development Mode

```bash
npm run dev
```

Uses `tsx` for hot-reloading during development.

### Type Checking

```bash
npx tsc --noEmit
```

Verifies TypeScript compilation without output.

### Testing

To test with sample data, start the server and use the CLI or MCP client:

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Use MCP client or curl
```

## Security Considerations

1. **Credentials**: Read only from environment variables, never hardcoded
2. **Transport**: All requests use HTTPS
3. **Validation**: Zod schemas validate all inputs
4. **Logging**: Sensitive data never logged; logs go to stderr
5. **Timeouts**: 30-second timeout prevents hanging requests
6. **Error Messages**: User-friendly without exposing internals

## Performance

- Lightweight: Minimal dependencies (axios, zod)
- Efficient: Single PlaidClient instance reused
- Scalable: Stateless design allows horizontal scaling
- Fast: Direct API passthrough without caching

## Extensibility

### Adding a New Tool

1. Create `src/tools/newdomain.ts`
2. Define Zod input schema
3. Implement tool function
4. Export `registerNewDomainTools()`
5. Import and call in `index.ts`

Example:
```typescript
export function registerNewDomainTools(server: McpServer, client: PlaidClient) {
  server.tool(
    "plaid_new_operation",
    "Description",
    { /* schema */ },
    async (params) => {
      const response = await client.makeApiRequest("/endpoint", params);
      return formatResponse(response, params.response_format);
    }
  );
}
```

### Adding a New Product

If Plaid adds a new product/endpoint:

1. Add types to `types.ts`
2. Create new schema file if needed
3. Create tool file in `tools/`
4. Register in `index.ts`

## Troubleshooting

### Build Errors
- Run `npm install` to ensure dependencies
- Check Node.js version (18+)
- Clear `dist/` folder

### Runtime Errors
- Verify environment variables
- Check Plaid credentials
- Ensure network connectivity
- Review error messages from stderr

### Type Errors
- Run `npx tsc --noEmit`
- Check TypeScript version (5.3+)
- Review interface definitions

## Maintenance

### Updating Dependencies
```bash
npm update
npm audit fix
```

### Updating Plaid API
1. Review Plaid API changelog
2. Update types.ts with new fields
3. Update relevant tool files
4. Test new endpoints
5. Update documentation

## Production Deployment

### Recommendations

1. **Use Environment Variables**: Never commit .env files
2. **Enable HTTPS**: For HTTP transport, use reverse proxy
3. **Rate Limiting**: Implement at reverse proxy level
4. **Monitoring**: Log requests and errors
5. **Scaling**: Run multiple instances behind load balancer
6. **Health Checks**: Implement /health endpoint if needed

### Example Docker Setup

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
CMD ["npm", "start"]
```

## License

MIT
