/**
 * Plaid identity tools
 * Handles account owner identity information and verification
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PlaidClient } from "../services/plaid-client.js";
import { AccessTokenSchema, ResponseFormatSchema } from "../schemas/common.js";
import { PlaidIdentity } from "../types.js";

interface IdentityResponse {
  accounts: PlaidIdentity[];
  request_id: string;
}

interface MatchIdentityResponse {
  match_score: number;
  request_id: string;
}

export function registerIdentityTools(server: McpServer, client: PlaidClient) {
  // Get Identity
  server.tool(
    "plaid_get_identity",
    "Get account owner identity information (names, emails, phone, addresses)",
    {
      access_token: AccessTokenSchema,
      options: z
        .object({
          account_ids: z
            .array(z.string())
            .optional()
            .describe("Specific account IDs to retrieve identity for"),
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

      const response = await client.makeApiRequest<IdentityResponse>(
        "/identity/get",
        requestData
      );

      if (response_format === "json") {
        return JSON.stringify(
          response.accounts.map((acc) => ({
            account_id: acc.account_id,
            name: acc.names[0] || "Not provided",
            emails_count: acc.emails.length,
            phones_count: acc.phone_numbers.length,
            addresses_count: acc.addresses.length,
          })),
          null,
          2
        );
      }

      const accountsList = response.accounts
        .map((acc) => {
          const primaryEmail = acc.emails.find((e) => e.primary)?.data || "N/A";
          const primaryPhone = acc.phone_numbers.find((p) => p.primary)?.data || "N/A";
          const primaryAddress = acc.addresses
            .find((a) => a.primary)
            ?.data;

          let accountDetails = `- **Account:** ${acc.account_id}\n  - Name: ${acc.names[0] || "Not provided"}\n  - Email: ${primaryEmail}\n  - Phone: ${primaryPhone}`;

          if (primaryAddress) {
            accountDetails += `\n  - Address: ${primaryAddress.street}, ${primaryAddress.city}, ${primaryAddress.region} ${primaryAddress.postal_code}`;
          }

          return accountDetails;
        })
        .join("\n");

      return `# Account Identity Information

**Request ID:** ${response.request_id}

## Accounts
${accountsList}`;
    }
  );

  // Match Identity
  server.tool(
    "plaid_match_identity",
    "Match user identity information against the institution's records",
    {
      access_token: AccessTokenSchema,
      user: z.object({
        email_address: z
          .string()
          .email()
          .optional()
          .describe("Email address to match"),
        phone_number: z
          .string()
          .optional()
          .describe("Phone number to match"),
        legal_name: z.string().optional().describe("Legal name to match"),
        address: z
          .object({
            street: z.string().optional(),
            city: z.string().optional(),
            region: z.string().optional(),
            postal_code: z.string().optional(),
            country: z.string().optional(),
          })
          .optional()
          .describe("Address to match"),
      }),
      options: z
        .object({
          account_ids: z
            .array(z.string())
            .optional()
            .describe("Specific account IDs to match against"),
        })
        .optional(),
      response_format: ResponseFormatSchema,
    },
    async (params: Record<string, unknown>) => {
      const { access_token, user, options, response_format = "markdown" } =
        params;

      const requestData: Record<string, unknown> = {
        access_token,
        user,
      };

      if (options && typeof options === "object" && "account_ids" in options) {
        const accountIds = (options as Record<string, unknown>).account_ids;
        if (Array.isArray(accountIds)) {
          requestData.options = { account_ids: accountIds };
        }
      }

      const response =
        await client.makeApiRequest<MatchIdentityResponse>(
          "/identity/match",
          requestData
        );

      if (response_format === "json") {
        return JSON.stringify(response, null, 2);
      }

      const matchPercentage = Math.round(response.match_score * 100);
      const matchLevel =
        response.match_score >= 0.8
          ? "High confidence match"
          : response.match_score >= 0.5
            ? "Moderate confidence match"
            : "Low confidence match";

      return `# Identity Match Result

**Request ID:** ${response.request_id}

**Match Score:** ${matchPercentage}%

**Assessment:** ${matchLevel}

The provided user information has been compared against the financial institution's records.`;
    }
  );
}
