/**
 * Plaid institution tools
 * Handles institution search and details
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PlaidClient } from "../services/plaid-client.js";
import { ResponseFormatSchema, CountryCodesSchema } from "../schemas/common.js";
import { PlaidInstitution } from "../types.js";

interface InstitutionsSearchResponse {
  institutions: PlaidInstitution[];
  request_id: string;
}

interface InstitutionResponse {
  institution: PlaidInstitution;
  request_id: string;
}

export function registerInstitutionTools(server: McpServer, client: PlaidClient) {
  // Search Institutions
  server.tool(
    "plaid_search_institutions",
    "Search for financial institutions supported by Plaid",
    {
      query: z
        .string()
        .min(1)
        .describe("Search query (institution name, routing number, etc.)"),
      products: z
        .array(z.string())
        .optional()
        .describe(
          "Filter by Plaid products (e.g., transactions, auth, balance)"
        ),
      country_codes: CountryCodesSchema,
      options: z
        .object({
          include_optional_metadata: z
            .boolean()
            .optional()
            .describe("Include optional metadata like logos and colors"),
          include_auth_metadata: z
            .boolean()
            .optional()
            .describe("Include authentication metadata"),
        })
        .optional(),
      response_format: ResponseFormatSchema,
    },
    async (params: Record<string, unknown>) => {
      const {
        query,
        products,
        country_codes,
        options,
        response_format = "markdown",
      } = params;

      const requestData: Record<string, unknown> = {
        query,
      };

      if (products && Array.isArray(products)) {
        requestData.products = products;
      }

      if (country_codes && Array.isArray(country_codes)) {
        requestData.country_codes = country_codes;
      } else {
        requestData.country_codes = ["US"];
      }

      if (options && typeof options === "object") {
        const opts = options as Record<string, unknown>;
        requestData.options = {};
        const opts_obj = requestData.options as Record<string, unknown>;
        if (opts.include_optional_metadata !== undefined) {
          opts_obj.include_optional_metadata = opts.include_optional_metadata;
        }
        if (opts.include_auth_metadata !== undefined) {
          opts_obj.include_auth_metadata = opts.include_auth_metadata;
        }
      }

      const response =
        await client.makeApiRequest<InstitutionsSearchResponse>(
          "/institutions/search",
          requestData
        );

      if (response_format === "json") {
        return JSON.stringify(
          response.institutions.map((inst) => ({
            institution_id: inst.institution_id,
            name: inst.name,
            products: inst.products,
            countries: inst.country_codes,
          })),
          null,
          2
        );
      }

      const institutionsList = response.institutions
        .slice(0, 20)
        .map(
          (inst) =>
            `- **${inst.name}** (\`${inst.institution_id}\`)\n  - Products: ${inst.products.join(", ")}\n  - Countries: ${inst.country_codes.join(", ")}\n  - Routing Numbers: ${inst.routing_numbers.length > 0 ? inst.routing_numbers.slice(0, 3).join(", ") : "None listed"}`
        )
        .join("\n");

      return `# Institution Search Results

**Query:** ${query}

**Request ID:** ${response.request_id}

## Results (showing up to 20)
${institutionsList}`;
    }
  );

  // Get Institution
  server.tool(
    "plaid_get_institution",
    "Get detailed information about a specific financial institution",
    {
      institution_id: z
        .string()
        .describe("The Plaid institution ID"),
      country_codes: CountryCodesSchema,
      options: z
        .object({
          include_optional_metadata: z
            .boolean()
            .optional()
            .describe("Include optional metadata"),
          include_auth_metadata: z
            .boolean()
            .optional()
            .describe("Include authentication metadata"),
        })
        .optional(),
      response_format: ResponseFormatSchema,
    },
    async (params: Record<string, unknown>) => {
      const {
        institution_id,
        country_codes,
        options,
        response_format = "markdown",
      } = params;

      const requestData: Record<string, unknown> = {
        institution_id,
      };

      if (country_codes && Array.isArray(country_codes)) {
        requestData.country_codes = country_codes;
      } else {
        requestData.country_codes = ["US"];
      }

      if (options && typeof options === "object") {
        const opts = options as Record<string, unknown>;
        requestData.options = {};
        const opts_obj = requestData.options as Record<string, unknown>;
        if (opts.include_optional_metadata !== undefined) {
          opts_obj.include_optional_metadata = opts.include_optional_metadata;
        }
        if (opts.include_auth_metadata !== undefined) {
          opts_obj.include_auth_metadata = opts.include_auth_metadata;
        }
      }

      const response = await client.makeApiRequest<InstitutionResponse>(
        "/institutions/get_by_id",
        requestData
      );

      if (response_format === "json") {
        return JSON.stringify(response.institution, null, 2);
      }

      const inst = response.institution;

      return `# Institution Details

**Name:** ${inst.name}

**Institution ID:** \`${inst.institution_id}\`

**Request ID:** ${response.request_id}

## Information
- **Website:** ${inst.url || "Not provided"}
- **Countries:** ${inst.country_codes.join(", ")}

## Products Supported
${inst.products.map((p) => `- ${p}`).join("\n")}

## Routing Numbers
${inst.routing_numbers.length > 0 ? inst.routing_numbers.join(", ") : "None listed"}

${inst.logo ? `**Logo:** ${inst.logo}` : ""}

${inst.primary_color ? `**Primary Color:** ${inst.primary_color}` : ""}`;
    }
  );
}
