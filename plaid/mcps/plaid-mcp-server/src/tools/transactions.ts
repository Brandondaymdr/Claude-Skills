/**
 * Plaid transaction tools
 * Handles transaction syncing and retrieval
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PlaidClient } from "../services/plaid-client.js";
import { AccessTokenSchema, ResponseFormatSchema } from "../schemas/common.js";
import { PlaidTransaction } from "../types.js";

interface TransactionsSyncResponse {
  added: PlaidTransaction[];
  modified: PlaidTransaction[];
  removed: Array<{ transaction_id: string; account_id: string }>;
  has_more: boolean;
  next_cursor: string;
  request_id: string;
}

interface TransactionsGetResponse {
  transactions: PlaidTransaction[];
  total_transactions: number;
  request_id: string;
}

interface RecurringTransactionsResponse {
  inflow_streams: Array<{
    description: string;
    merchant_name: string | null;
    personal_finance_category: {
      primary: string;
      detailed: string;
    } | null;
    frequency: string;
    amount: number;
    transaction_ids: string[];
  }>;
  outflow_streams: Array<{
    description: string;
    merchant_name: string | null;
    personal_finance_category: {
      primary: string;
      detailed: string;
    } | null;
    frequency: string;
    amount: number;
    transaction_ids: string[];
  }>;
  request_id: string;
}

export function registerTransactionTools(
  server: McpServer,
  client: PlaidClient
) {
  // Sync Transactions
  server.tool(
    "plaid_sync_transactions",
    "Sync transactions using the Transactions Sync API (incremental updates)",
    {
      access_token: AccessTokenSchema,
      cursor: z
        .string()
        .optional()
        .describe("Cursor for pagination, from previous sync response"),
      count: z
        .number()
        .int()
        .positive()
        .optional()
        .default(100)
        .describe("Number of transactions to return (max 100)"),
      options: z
        .object({
          account_ids: z
            .array(z.string())
            .optional()
            .describe("Specific account IDs to sync"),
          include_personal_finance_category: z
            .boolean()
            .optional()
            .default(true)
            .describe("Include personal finance categories"),
        })
        .optional(),
      response_format: ResponseFormatSchema,
    },
    async (params: Record<string, unknown>) => {
      const {
        access_token,
        cursor,
        count = 100,
        options,
        response_format = "markdown",
      } = params;

      const requestData: Record<string, unknown> = {
        access_token,
        options: {
          include_personal_finance_category: true,
        },
      };

      if (cursor) {
        requestData.cursor = cursor;
      }

      if (typeof count === "number") {
        requestData.count = Math.min(count, 100);
      }

      if (options && typeof options === "object") {
        const opts = options as Record<string, unknown>;
        if (opts.account_ids) {
          (requestData.options as Record<string, unknown>).account_ids =
            opts.account_ids;
        }
        if (opts.include_personal_finance_category !== undefined) {
          (requestData.options as Record<string, unknown>).include_personal_finance_category =
            opts.include_personal_finance_category;
        }
      }

      const response =
        await client.makeApiRequest<TransactionsSyncResponse>(
          "/transactions/sync",
          requestData
        );

      if (response_format === "json") {
        return JSON.stringify(
          {
            added_count: response.added.length,
            modified_count: response.modified.length,
            removed_count: response.removed.length,
            has_more: response.has_more,
            next_cursor: response.next_cursor,
            request_id: response.request_id,
          },
          null,
          2
        );
      }

      const formatTransactions = (txns: PlaidTransaction[]) =>
        txns
          .slice(0, 10)
          .map(
            (txn) =>
              `- **${txn.name}** | ${txn.date} | $${txn.amount}\n  - Category: ${txn.personal_finance_category?.detailed || "Uncategorized"}\n  - Status: ${txn.pending ? "Pending" : "Posted"}`
          )
          .join("\n");

      return `# Transaction Sync Results

**Summary:**
- Added: ${response.added.length}
- Modified: ${response.modified.length}
- Removed: ${response.removed.length}
- Has More: ${response.has_more}

**Request ID:** ${response.request_id}

${response.has_more ? `**Next Cursor:** \`${response.next_cursor}\`` : ""}

## Recent Transactions (up to 10)
${response.added.length > 0 ? formatTransactions(response.added) : "No new transactions"}`;
    }
  );

  // Get Transactions (Legacy)
  server.tool(
    "plaid_get_transactions",
    "Get transactions for a date range (legacy endpoint)",
    {
      access_token: AccessTokenSchema,
      start_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe("Start date (YYYY-MM-DD)"),
      end_date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe("End date (YYYY-MM-DD)"),
      options: z
        .object({
          account_ids: z
            .array(z.string())
            .optional()
            .describe("Specific account IDs to fetch"),
          offset: z.number().int().optional().describe("Pagination offset"),
          count: z
            .number()
            .int()
            .optional()
            .describe("Number of transactions to return"),
          include_personal_finance_category: z
            .boolean()
            .optional()
            .default(true),
        })
        .optional(),
      response_format: ResponseFormatSchema,
    },
    async (params: Record<string, unknown>) => {
      const {
        access_token,
        start_date,
        end_date,
        options,
        response_format = "markdown",
      } = params;

      const requestData: Record<string, unknown> = {
        access_token,
        start_date,
        end_date,
        options: {
          include_personal_finance_category: true,
        },
      };

      if (options && typeof options === "object") {
        const opts = options as Record<string, unknown>;
        const opts_obj = requestData.options as Record<string, unknown>;
        if (opts.account_ids) {
          opts_obj.account_ids = opts.account_ids;
        }
        if (opts.offset !== undefined) {
          opts_obj.offset = opts.offset;
        }
        if (opts.count !== undefined) {
          opts_obj.count = opts.count;
        }
        if (opts.include_personal_finance_category !== undefined) {
          opts_obj.include_personal_finance_category =
            opts.include_personal_finance_category;
        }
      }

      const response =
        await client.makeApiRequest<TransactionsGetResponse>(
          "/transactions/get",
          requestData
        );

      if (response_format === "json") {
        return JSON.stringify(
          {
            transactions_count: response.transactions.length,
            total_transactions: response.total_transactions,
            request_id: response.request_id,
          },
          null,
          2
        );
      }

      const transactionsList = response.transactions
        .slice(0, 20)
        .map(
          (txn) =>
            `- **${txn.name}** | ${txn.date} | $${txn.amount}\n  - Category: ${txn.personal_finance_category?.detailed || "Uncategorized"}`
        )
        .join("\n");

      return `# Transactions (${start_date} to ${end_date})

**Summary:**
- Retrieved: ${response.transactions.length}
- Total Available: ${response.total_transactions}
- Request ID: ${response.request_id}

## Transactions (showing up to 20)
${transactionsList}`;
    }
  );

  // Get Recurring Transactions
  server.tool(
    "plaid_get_recurring_transactions",
    "Get recurring transaction streams based on transaction history",
    {
      access_token: AccessTokenSchema,
      options: z
        .object({
          account_ids: z
            .array(z.string())
            .optional()
            .describe("Specific account IDs"),
        })
        .optional(),
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

      const response =
        await client.makeApiRequest<RecurringTransactionsResponse>(
          "/transactions/recurring/get",
          requestData
        );

      if (response_format === "json") {
        return JSON.stringify(
          {
            inflow_count: response.inflow_streams.length,
            outflow_count: response.outflow_streams.length,
            request_id: response.request_id,
          },
          null,
          2
        );
      }

      const formatStreams = (
        streams: Array<{
          description: string;
          merchant_name: string | null;
          frequency: string;
          amount: number;
        }>
      ) =>
        streams
          .map(
            (s) =>
              `- **${s.description || s.merchant_name}** ($${s.amount}/${s.frequency})\n  - Transactions: ${s.merchant_name || "N/A"}`
          )
          .join("\n");

      return `# Recurring Transactions

**Request ID:** ${response.request_id}

## Income Streams (${response.inflow_streams.length})
${response.inflow_streams.length > 0 ? formatStreams(response.inflow_streams) : "None detected"}

## Expense Streams (${response.outflow_streams.length})
${response.outflow_streams.length > 0 ? formatStreams(response.outflow_streams) : "None detected"}`;
    }
  );

  // Refresh Transactions
  server.tool(
    "plaid_refresh_transactions",
    "Force an immediate refresh of transaction data from the institution",
    {
      access_token: AccessTokenSchema,
      response_format: ResponseFormatSchema,
    },
    async (params: Record<string, unknown>) => {
      const { access_token, response_format = "markdown" } = params;

      interface RefreshResponse {
        request_id: string;
      }

      const response = await client.makeApiRequest<RefreshResponse>(
        "/transactions/refresh",
        {
          access_token,
        }
      );

      if (response_format === "json") {
        return JSON.stringify(response, null, 2);
      }

      return `# Transaction Refresh Initiated

**Request ID:** ${response.request_id}

The transaction refresh has been queued. Updates will be available via webhook or in your next sync request.`;
    }
  );
}
