/**
 * Plaid investment tools
 * Handles investment account data retrieval
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PlaidClient } from "../services/plaid-client.js";
import { AccessTokenSchema, ResponseFormatSchema } from "../schemas/common.js";
import {
  PlaidInvestmentHolding,
  PlaidSecurity,
} from "../types.js";

interface HoldingsResponse {
  accounts: Array<{
    account_id: string;
    name: string;
    mask: string;
    type: string;
  }>;
  holdings: PlaidInvestmentHolding[];
  securities: PlaidSecurity[];
  request_id: string;
}

interface InvestmentTransactionsResponse {
  accounts: Array<{
    account_id: string;
    name: string;
    mask: string;
    type: string;
  }>;
  investment_transactions: Array<{
    investment_transaction_id: string;
    account_id: string;
    security_id: string;
    date: string;
    name: string;
    quantity: number;
    amount: number;
    price: number;
    fees: number | null;
    type: string;
    subtype: string;
    iso_currency_code: string | null;
  }>;
  securities: PlaidSecurity[];
  total_investment_transactions: number;
  request_id: string;
}

export function registerInvestmentTools(server: McpServer, client: PlaidClient) {
  // Get Holdings
  server.tool(
    "plaid_get_holdings",
    "Get investment holdings (stocks, bonds, mutual funds, etc.)",
    {
      access_token: AccessTokenSchema,
      options: z
        .object({
          account_ids: z
            .array(z.string())
            .optional()
            .describe("Specific account IDs to retrieve holdings for"),
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

      const response = await client.makeApiRequest<HoldingsResponse>(
        "/investments/holdings/get",
        requestData
      );

      if (response_format === "json") {
        return JSON.stringify(
          {
            accounts: response.accounts,
            holdings_count: response.holdings.length,
            securities_count: response.securities.length,
            request_id: response.request_id,
          },
          null,
          2
        );
      }

      const securityMap = new Map(
        response.securities.map((s) => [s.security_id, s])
      );

      const holdingsList = response.holdings
        .map((holding) => {
          const security = securityMap.get(holding.security_id);
          const value = holding.quantity * holding.institution_price;

          return `- **${security?.name || "Unknown"}** (${security?.symbol || security?.ticker || "N/A"})\n  - Quantity: ${holding.quantity}\n  - Price: $${holding.institution_price}\n  - Value: $${value.toFixed(2)}\n  - Cost Basis: $${holding.cost_basis || "N/A"}`;
        })
        .join("\n");

      const totalValue = response.holdings.reduce(
        (sum, h) => sum + h.quantity * h.institution_price,
        0
      );

      return `# Investment Holdings

**Request ID:** ${response.request_id}

## Summary
- **Total Holdings:** ${response.holdings.length}
- **Total Value:** $${totalValue.toFixed(2)}
- **Securities:** ${response.securities.length}

## Holdings
${holdingsList}`;
    }
  );

  // Get Investment Transactions
  server.tool(
    "plaid_get_investment_transactions",
    "Get investment transaction history (buys, sells, dividends, etc.)",
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
            .describe("Specific account IDs"),
          offset: z.number().int().optional().describe("Pagination offset"),
          count: z
            .number()
            .int()
            .optional()
            .describe("Number of transactions to return"),
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
        options: {},
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
      }

      const response =
        await client.makeApiRequest<InvestmentTransactionsResponse>(
          "/investments/transactions/get",
          requestData
        );

      if (response_format === "json") {
        return JSON.stringify(
          {
            transactions_count: response.investment_transactions.length,
            total_transactions: response.total_investment_transactions,
            request_id: response.request_id,
          },
          null,
          2
        );
      }

      const securityMap = new Map(
        response.securities.map((s) => [s.security_id, s])
      );

      const transactionsList = response.investment_transactions
        .slice(0, 20)
        .map((txn) => {
          const security = securityMap.get(txn.security_id);
          return `- **${txn.name}** | ${txn.date} | ${txn.type}\n  - Security: ${security?.name || "Unknown"}\n  - Quantity: ${txn.quantity} | Price: $${txn.price}\n  - Amount: $${txn.amount}`;
        })
        .join("\n");

      return `# Investment Transactions (${start_date} to ${end_date})

**Request ID:** ${response.request_id}

## Summary
- **Retrieved:** ${response.investment_transactions.length}
- **Total Available:** ${response.total_investment_transactions}

## Transactions (showing up to 20)
${transactionsList}`;
    }
  );
}
