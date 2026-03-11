#!/usr/bin/env node

/**
 * Plaid MCP Server
 * Provides Claude with access to Plaid API endpoints
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createPlaidClient } from "./services/plaid-client.js";
import { registerLinkTools } from "./tools/link.js";
import { registerAccountTools } from "./tools/accounts.js";
import { registerTransactionTools } from "./tools/transactions.js";
import { registerAuthTools } from "./tools/auth.js";
import { registerIdentityTools } from "./tools/identity.js";
import { registerInvestmentTools } from "./tools/investments.js";
import { registerLiabilityTools } from "./tools/liabilities.js";
import { registerInstitutionTools } from "./tools/institutions.js";
import { registerTransferTools } from "./tools/transfer.js";
import { registerSignalTools } from "./tools/signal.js";

const SERVER_NAME = "plaid-mcp-server";
const SERVER_VERSION = "1.0.0";

async function main() {
  // Validate environment variables
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;

  if (!clientId || !secret) {
    console.error(
      "ERROR: PLAID_CLIENT_ID and PLAID_SECRET environment variables are required"
    );
    process.exit(1);
  }

  // Create Plaid client
  const plaidClient = createPlaidClient();

  // Create MCP server
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Register all tool domains
  registerLinkTools(server, plaidClient);
  registerAccountTools(server, plaidClient);
  registerTransactionTools(server, plaidClient);
  registerAuthTools(server, plaidClient);
  registerIdentityTools(server, plaidClient);
  registerInvestmentTools(server, plaidClient);
  registerLiabilityTools(server, plaidClient);
  registerInstitutionTools(server, plaidClient);
  registerTransferTools(server, plaidClient);
  registerSignalTools(server, plaidClient);

  // Use stdio transport (standard for MCP servers)
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`${SERVER_NAME} v${SERVER_VERSION} started on stdio`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
