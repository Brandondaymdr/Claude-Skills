/**
 * Plaid auth tools
 * Handles account and routing number retrieval
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PlaidClient } from "../services/plaid-client.js";
import { AccessTokenSchema, ResponseFormatSchema } from "../schemas/common.js";

interface AuthAccount {
  account_id: string;
  account_number: string;
  routing_number: string;
  wire_routing_number: string | null;
}

interface AuthResponse {
  accounts: AuthAccount[];
  numbers: {
    ach: Array<{
      account: string;
      routing: string;
    }>;
    eft: Array<{
      account: string;
      branch_code: string;
      transit_number: string;
    }>;
    international_iban: Array<{
      iban: string;
      bic: string | null;
    }>;
  };
  request_id: string;
}

export function registerAuthTools(server: McpServer, client: PlaidClient) {
  // Get Auth (Account and Routing Numbers)
  server.tool(
    "plaid_get_auth",
    "Get account and routing numbers for authenticated accounts",
    {
      access_token: AccessTokenSchema,
      response_format: ResponseFormatSchema,
    },
    async (params: Record<string, unknown>) => {
      const { access_token, response_format = "markdown" } = params;

      const response = await client.makeApiRequest<AuthResponse>(
        "/auth/get",
        {
          access_token,
        }
      );

      if (response_format === "json") {
        return JSON.stringify(response, null, 2);
      }

      const accountsList = response.accounts
        .map(
          (acc) =>
            `- **${acc.account_id}**\n  - Account Number: \`${acc.account_number}\`\n  - Routing Number: \`${acc.routing_number}\`${
              acc.wire_routing_number
                ? `\n  - Wire Routing: \`${acc.wire_routing_number}\``
                : ""
            }`
        )
        .join("\n");

      let numbersSection = "";
      if (response.numbers.ach.length > 0) {
        numbersSection += `### ACH Numbers\n${response.numbers.ach
          .map((n) => `- Account: \`${n.account}\` | Routing: \`${n.routing}\``)
          .join("\n")}\n\n`;
      }

      if (response.numbers.eft.length > 0) {
        numbersSection += `### EFT Numbers (Canada)\n${response.numbers.eft
          .map(
            (n) =>
              `- Account: \`${n.account}\` | Transit: \`${n.transit_number}\` | Branch: \`${n.branch_code}\``
          )
          .join("\n")}\n\n`;
      }

      if (response.numbers.international_iban.length > 0) {
        numbersSection += `### International IBAN\n${response.numbers.international_iban
          .map((n) => `- IBAN: \`${n.iban}\`${n.bic ? ` | BIC: \`${n.bic}\`` : ""}`)
          .join("\n")}\n\n`;
      }

      return `# Account Auth Details

**Request ID:** ${response.request_id}

## Accounts
${accountsList}

${numbersSection}`;
    }
  );
}
