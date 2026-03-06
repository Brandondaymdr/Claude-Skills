/**
 * Plaid transfer tools
 * Handles ACH transfer creation and management
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PlaidClient } from "../services/plaid-client.js";
import { AccessTokenSchema, ResponseFormatSchema } from "../schemas/common.js";
import { PlaidTransfer } from "../types.js";

interface CreateTransferResponse {
  transfer: PlaidTransfer;
  request_id: string;
}

interface GetTransferResponse {
  transfer: PlaidTransfer;
  request_id: string;
}

interface ListTransfersResponse {
  transfers: PlaidTransfer[];
  request_id: string;
}

export function registerTransferTools(server: McpServer, client: PlaidClient) {
  // Create Transfer
  server.tool(
    "plaid_create_transfer",
    "Create an ACH transfer (requires Transfer product)",
    {
      access_token: AccessTokenSchema,
      account_id: z
        .string()
        .describe("The account ID to transfer from"),
      funding_account_id: z
        .string()
        .describe("Plaid Processor Token or account ID to transfer to"),
      type: z
        .enum(["debit", "credit"])
        .describe("Transfer type (debit to pull funds, credit to push)"),
      amount: z
        .string()
        .describe("Amount to transfer (e.g., '123.45')"),
      description: z
        .string()
        .describe("Description of the transfer"),
      user: z
        .object({
          legal_name: z
            .string()
            .describe("Legal name of the user initiating transfer"),
          email_address: z
            .string()
            .email()
            .optional()
            .describe("Email address"),
          address: z
            .object({
              street: z.string().optional(),
              city: z.string().optional(),
              region: z.string().optional(),
              postal_code: z.string().optional(),
              country: z.string().optional(),
            })
            .optional()
            .describe("User address"),
        })
        .optional(),
      response_format: ResponseFormatSchema,
    },
    async (params: Record<string, unknown>) => {
      const {
        access_token,
        account_id,
        funding_account_id,
        type,
        amount,
        description,
        user,
        response_format = "markdown",
      } = params;

      const requestData: Record<string, unknown> = {
        access_token,
        account_id,
        funding_account_id,
        type,
        amount,
        description,
      };

      if (user) {
        requestData.user = user;
      }

      const response = await client.makeApiRequest<CreateTransferResponse>(
        "/transfer/create",
        requestData
      );

      if (response_format === "json") {
        return JSON.stringify(
          {
            transfer_id: response.transfer.id,
            status: response.transfer.status,
            amount: response.transfer.amount,
            request_id: response.request_id,
          },
          null,
          2
        );
      }

      const decision = response.transfer.authorization_decision;
      const decisionText =
        decision === "approved"
          ? "APPROVED"
          : decision === "denied"
            ? "DENIED"
            : "PENDING";

      return `# Transfer Created

**Transfer ID:** \`${response.transfer.id}\`

**Status:** ${response.transfer.status}

**Decision:** ${decisionText}

**Amount:** ${response.transfer.amount} ${response.transfer.iso_currency_code}

**Description:** ${response.transfer.description}

**Request ID:** ${response.request_id}

${
  response.transfer.authorization_decision_rationale
    ? `**Decision Reason:** ${response.transfer.authorization_decision_rationale.description}`
    : ""
}`;
    }
  );

  // Get Transfer
  server.tool(
    "plaid_get_transfer",
    "Get details about a specific transfer",
    {
      transfer_id: z
        .string()
        .describe("The ID of the transfer to retrieve"),
      response_format: ResponseFormatSchema,
    },
    async (params: Record<string, unknown>) => {
      const { transfer_id, response_format = "markdown" } = params;

      interface GetTransferRequest {
        transfer_id: string;
        client_id: string;
        secret: string;
      }

      const response = await client.makeApiRequest<GetTransferResponse>(
        "/transfer/get",
        {
          transfer_id,
        }
      );

      if (response_format === "json") {
        return JSON.stringify(response.transfer, null, 2);
      }

      const transfer = response.transfer;

      return `# Transfer Details

**Transfer ID:** \`${transfer.id}\`

**Status:** ${transfer.status}

**Amount:** ${transfer.amount} ${transfer.iso_currency_code}

**Type:** ${transfer.type}

**Created:** ${transfer.created}

**Description:** ${transfer.description}

**Request ID:** ${response.request_id}

## User Information
- **Name:** ${transfer.user.legal_name}
- **Email:** ${transfer.user.email_address || "Not provided"}
- **Address:** ${transfer.user.address.street}, ${transfer.user.address.city}, ${transfer.user.address.region} ${transfer.user.address.postal_code}

## Authorization
- **Decision:** ${transfer.authorization_decision}
${
  transfer.authorization_decision_rationale
    ? `- **Reason:** ${transfer.authorization_decision_rationale.description}`
    : ""
}`;
    }
  );

  // List Transfers
  server.tool(
    "plaid_list_transfers",
    "List transfers for an account or Item",
    {
      access_token: AccessTokenSchema.optional().describe(
        "Access token for Item-level listing"
      ),
      account_id: z
        .string()
        .optional()
        .describe("Account ID to filter by"),
      originator_client_id: z
        .string()
        .optional()
        .describe("Filter by originator client ID"),
      max_results: z
        .number()
        .int()
        .optional()
        .describe("Maximum results to return"),
      response_format: ResponseFormatSchema,
    },
    async (params: Record<string, unknown>) => {
      const {
        access_token,
        account_id,
        originator_client_id,
        max_results,
        response_format = "markdown",
      } = params;

      const requestData: Record<string, unknown> = {};

      if (access_token) {
        requestData.access_token = access_token;
      }

      if (account_id) {
        requestData.account_id = account_id;
      }

      if (originator_client_id) {
        requestData.originator_client_id = originator_client_id;
      }

      if (max_results) {
        requestData.max_results = max_results;
      }

      const response = await client.makeApiRequest<ListTransfersResponse>(
        "/transfer/list",
        requestData
      );

      if (response_format === "json") {
        return JSON.stringify(
          response.transfers.map((t) => ({
            id: t.id,
            status: t.status,
            amount: t.amount,
            type: t.type,
          })),
          null,
          2
        );
      }

      const transfersList = response.transfers
        .map(
          (t) =>
            `- **${t.id}** | ${t.type.toUpperCase()} | ${t.amount} ${t.iso_currency_code}\n  - Status: ${t.status}\n  - Description: ${t.description}`
        )
        .join("\n");

      return `# Transfers

**Request ID:** ${response.request_id}

## Summary
- **Total Transfers:** ${response.transfers.length}

## Transfers
${response.transfers.length > 0 ? transfersList : "No transfers found"}`;
    }
  );
}
