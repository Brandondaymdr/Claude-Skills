/**
 * Plaid Link token tools
 * Handles creation and exchange of Link tokens
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PlaidClient } from "../services/plaid-client.js";
import {
  ResponseFormatSchema,
  CountryCodesSchema,
  ProductsSchema,
  PlaidUserSchema,
  LanguageSchema,
  AccountFiltersSchema,
} from "../schemas/common.js";
import { PlaidLinkToken, PlaidPublicTokenExchange } from "../types.js";

export function registerLinkTools(server: McpServer, client: PlaidClient) {
  // Create Link Token
  server.tool(
    "plaid_create_link_token",
    "Create a Link token to initialize Plaid Link for end-user authentication",
    {
      client_name: z
        .string()
        .describe("The name of your application or company"),
      user: PlaidUserSchema.optional().describe(
        "User information for the Link flow"
      ),
      client_id: z
        .string()
        .optional()
        .describe("Plaid client ID (uses env var if not provided)"),
      country_codes: CountryCodesSchema,
      language: LanguageSchema,
      products: ProductsSchema,
      account_filters: AccountFiltersSchema,
      webhook: z
        .string()
        .url()
        .optional()
        .describe("URL for webhook notifications"),
      access_token: z
        .string()
        .optional()
        .describe("For Link update mode - existing access token"),
      response_format: ResponseFormatSchema,
    },
    async (params: Record<string, unknown>) => {
      const {
        client_name,
        user,
        country_codes,
        language,
        products,
        account_filters,
        webhook,
        access_token,
        response_format = "markdown",
      } = params;

      const requestData: Record<string, unknown> = {
        client_name,
        user: user || { client_user_id: "default-user" },
      };

      if (country_codes && Array.isArray(country_codes)) {
        requestData.country_codes = country_codes;
      }

      if (language) {
        requestData.language = language;
      }

      if (products && Array.isArray(products)) {
        requestData.products = products;
      }

      if (account_filters) {
        requestData.account_filters = account_filters;
      }

      if (webhook) {
        requestData.webhook = webhook;
      }

      if (access_token) {
        requestData.access_token = access_token;
      }

      const response = await client.makeApiRequest<PlaidLinkToken>(
        "/link/token/create",
        requestData
      );

      if (response_format === "json") {
        return JSON.stringify(response, null, 2);
      }

      return `# Link Token Created

**Link Token:** \`${response.link_token}\`

**Expiration:** ${response.expiration}

**Request ID:** ${response.request_id}

Use this link token to initialize Plaid Link in your frontend application.`;
    }
  );

  // Exchange Public Token
  server.tool(
    "plaid_exchange_public_token",
    "Exchange a public token from Plaid Link for an access token",
    {
      public_token: z
        .string()
        .describe(
          "The public token returned from Plaid Link after user authentication"
        ),
      response_format: ResponseFormatSchema,
    },
    async (params: Record<string, unknown>) => {
      const { public_token, response_format = "markdown" } = params;

      const response = await client.makeApiRequest<PlaidPublicTokenExchange>(
        "/item/public_token/exchange",
        {
          public_token,
        }
      );

      if (response_format === "json") {
        return JSON.stringify(response, null, 2);
      }

      return `# Public Token Exchanged

**Access Token:** \`${response.access_token}\`

**Item ID:** ${response.item_id}

**Request ID:** ${response.request_id}

The access token can now be used to make API calls for this financial institution connection.`;
    }
  );
}
