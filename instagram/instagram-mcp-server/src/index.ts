#!/usr/bin/env node
/**
 * Instagram MCP Server
 *
 * A comprehensive MCP server for managing Instagram Business and Creator accounts
 * through the Instagram Graph API. Supports content publishing (photos, videos,
 * reels, stories, carousels), analytics/insights, comment management, hashtag
 * research, and account management.
 *
 * Required environment variables:
 *   INSTAGRAM_ACCESS_TOKEN - Long-lived Instagram access token
 *   INSTAGRAM_ACCOUNT_ID   - Instagram Business Account ID (optional, can be passed per-tool)
 *
 * Usage:
 *   INSTAGRAM_ACCESS_TOKEN=xxx node dist/index.js          # stdio transport (default)
 *   TRANSPORT=http INSTAGRAM_ACCESS_TOKEN=xxx node dist/index.js  # HTTP transport
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerPublishingTools } from "./tools/publishing.js";
import { registerInsightsTools } from "./tools/insights.js";
import { registerCommentTools } from "./tools/comments.js";
import { registerAccountTools } from "./tools/account.js";

// Create MCP server
const server = new McpServer({
  name: "instagram-mcp-server",
  version: "1.0.0",
});

// Register all tool groups
registerPublishingTools(server);
registerInsightsTools(server);
registerCommentTools(server);
registerAccountTools(server);

// ─── Start Server ───

async function runStdio(): Promise<void> {
  if (!process.env.INSTAGRAM_ACCESS_TOKEN) {
    console.error(
      "ERROR: INSTAGRAM_ACCESS_TOKEN environment variable is required.\n" +
      "Set it to your long-lived Instagram access token.\n" +
      "See the Meta App setup guide in references/meta-app-setup.md for instructions."
    );
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Instagram MCP server running via stdio");
}

async function runHTTP(): Promise<void> {
  if (!process.env.INSTAGRAM_ACCESS_TOKEN) {
    console.error("ERROR: INSTAGRAM_ACCESS_TOKEN environment variable is required.");
    process.exit(1);
  }

  // Dynamic import for express (only needed for HTTP transport)
  const { default: express } = await import("express");
  const { StreamableHTTPServerTransport } = await import(
    "@modelcontextprotocol/sdk/server/streamableHttp.js"
  );

  const app = express();
  app.use(express.json());

  app.post("/mcp", async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    res.on("close", () => transport.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  const port = parseInt(process.env.PORT || "3000");
  app.listen(port, () => {
    console.error(`Instagram MCP server running on http://localhost:${port}/mcp`);
  });
}

// Choose transport
const transport = process.env.TRANSPORT || "stdio";
if (transport === "http") {
  runHTTP().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
} else {
  runStdio().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}
