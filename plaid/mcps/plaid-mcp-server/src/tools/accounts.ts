/**
 * Plaid account tools
 * Handles account and balance retrieval
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PlaidClient } from "../services/plaid-client.js";
import { AccessTokenSchema, ResponseFormatSchema } from "../schemas/common.js";
import { PlaidAccount, PlaidBalance, PlaidItem } from "../types.js";

interface AccountsResponse {
  accounts: PlaidAccount[];
  item: PlaidItem;
  request_id: string;
}

interface BalanceResponse {
  accounts: Array<PlaidBalance>;
  item: PlaidItem;
  request_id: string;
}

interface ItemResponse {
  item: PlaidItem;
  request_id: string;
}

export function registerAccountTools(server: McpServer, client: PlaidClient) {
  // Get Accounts
  server.tool(
    "plaid_get_accounts",
    "Get all accounts associated with a financial institution connection",
    {
      access_token: AccessTokenSchema,
      response_format: ResponseFormatSchema,
    },
    async (params: Record<string, unknown>) => {
      const { access_token, response_format = "markdown" } = params;

      const response = await client.makeApiRequest<AccountsResponse>(
        "/accounts/get",
        {
          access_token,
        }
      );

      if (response_format === "json") {
        return JSON.stringify(
          {
            accounts: response.accounts,
            item_id: response.item.item_id,
            request_id: response.request_id,
          },
          null,
          2
        );
      }

      const accountsList = response.accounts
        .map(
          (acc) =>
            `- **${acc.name}** (${acc.type}/${acc.subtype})\n  - Account ID: \`${acc.account_id}\`\n  - Mask: ${acc.mask}\n  - Status: ${acc.verification_status}`
        )
        .join("\n");

      return `# Accounts for Item ${response.item.item_id}

## Summary
- **Total Accounts:** ${response.accounts.length}
- **Institution:** ${response.item.institution_id}
- **Request ID:** ${response.request_id}

## Accounts
${accountsList}`;
    }
  );

  // Get Balance
  server.tool(
    "plaid_get_balance",
    "Get real-time balances for all accounts",
    {
      access_token: AccessTokenSchema,
      options: z
        .object({
          account_ids: z
            .array(z.string())
            .optional()
            .describe("Specific account IDs to fetch balances for"),
        })
        .optional()
        .describe("Optional filters and parameters"),
      response_format: ResponseFormatSchema,
    },
    async (params: Record<string, unknown>) => {
      const { access_token, options, response_format = "markdown" } = params;

      const requestData: Record<string, unknown> = {
        access_token,
      };

      if (options && typeof options === "object" && "account_ids" in options) {
        const accountIds = (options as Record<string, unknown>).account_ids;
        if (Array.isArray(accountIds)) {
          requestData.options = { account_ids: accountIds };
        }
      }

      const response = await client.makeApiRequest<BalanceResponse>(
        "/accounts/balance/get",
        requestData
      );

      if (response_format === "json") {
        return JSON.stringify(
          {
            accounts: response.accounts,
            request_id: response.request_id,
          },
          null,
          2
        );
      }

      const balancesList = response.accounts
        .map((bal) => {
          const available = bal.available !== null ? `$${bal.available}` : "N/A";
          const current = `$${bal.current}`;
          const limit = bal.limit !== null ? `$${bal.limit}` : "N/A";

          return `- **${bal.account_id}**\n  - Available: ${available}\n  - Current: ${current}\n  - Limit: ${limit}`;
        })
        .join("\n");

      return `# Account Balances

**Request ID:** ${response.request_id}

## Balances
${balancesList}`;
    }
  );

  // Get Item
  server.tool(
    "plaid_get_item",
    "Get information about an Item (linked financial institution)",
    {
      access_token: AccessTokenSchema,
      response_format: ResponseFormatSchema,
    },
    async (params: Record<string, unknown>) => {
      const { access_token, response_format = "markdown" } = params;

      const response = await client.makeApiRequest<ItemResponse>(
        "/item/get",
        {
          access_token,
        }
      );

      if (response_format === "json") {
        return JSON.stringify(response.item, null, 2);
      }

      const availableProducts = response.item.available_products.join(", ");
      const billedProducts = response.item.billed_products.join(", ");

      return `# Item Details

**Item ID:** \`${response.item.item_id}\`

**Institution ID:** ${response.item.institution_id}

**Request ID:** ${response.request_id}

## Products
- **Available:** ${availableProducts || "None"}
- **Billed:** ${billedProducts || "None"}

## Status
${
  response.item.status
    ? `- **Transactions:** ${response.item.status.transactions?.last_successful_update || "Not updated"}
- **Investments:** ${response.item.status.investments?.last_successful_update || "Not updated"}`
    : "No status information available"
}

${response.item.error ? `## Error\n${response.item.error.error_message}` : ""}`;
    }
  );

  // Remove Item
  server.tool(
    "plaid_remove_item",
    "Remove an Item and disconnect from the financial institution",
    {
      access_token: AccessTokenSchema,
      response_format: ResponseFormatSchema,
    },
    async (params: Record<string, unknown>) => {
      const { access_token, response_format = "markdown" } = params;

      interface RemoveItemResponse {
        removed: boolean;
        request_id: string;
      }

      const response = await client.makeApiRequest<RemoveItemResponse>(
        "/item/remove",
        {
          access_token,
        }
      );

      if (response_format === "json") {
        return JSON.stringify(response, null, 2);
      }

      return `# Item Removed

**Status:** ${response.removed ? "Successfully removed" : "Removal failed"}

**Request ID:** ${response.request_id}

The Item has been disconnected and all associated data has been removed.`;
    }
  );
}
