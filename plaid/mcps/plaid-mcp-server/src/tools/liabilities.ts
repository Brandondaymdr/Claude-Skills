/**
 * Plaid liability tools
 * Handles credit, student loan, and mortgage data retrieval
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PlaidClient } from "../services/plaid-client.js";
import { AccessTokenSchema, ResponseFormatSchema } from "../schemas/common.js";
import { PlaidLiability } from "../types.js";

interface LiabilitiesResponse {
  liabilities: {
    credit: PlaidLiability[];
    student: PlaidLiability[];
    mortgage: PlaidLiability[];
  };
  request_id: string;
}

export function registerLiabilityTools(server: McpServer, client: PlaidClient) {
  // Get Liabilities
  server.tool(
    "plaid_get_liabilities",
    "Get liability information (credit cards, student loans, mortgages)",
    {
      access_token: AccessTokenSchema,
      options: z
        .object({
          account_ids: z
            .array(z.string())
            .optional()
            .describe("Specific account IDs to retrieve liabilities for"),
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

      const response = await client.makeApiRequest<LiabilitiesResponse>(
        "/liabilities/get",
        requestData
      );

      if (response_format === "json") {
        return JSON.stringify(
          {
            credit_accounts: response.liabilities.credit.length,
            student_loans: response.liabilities.student.length,
            mortgages: response.liabilities.mortgage.length,
            request_id: response.request_id,
          },
          null,
          2
        );
      }

      const formatLiability = (liability: PlaidLiability) => {
        let details = `- **${liability.account_owner_name || "Unknown"}**\n`;
        details += `  - Account: ${liability.account_number}\n`;
        details += `  - Outstanding Balance: $${liability.outstanding_balance}\n`;

        if (liability.minimum_payment_amount) {
          details += `  - Minimum Payment: $${liability.minimum_payment_amount}\n`;
        }

        if (liability.interest_rate_percentage) {
          details += `  - Interest Rate: ${liability.interest_rate_percentage}%\n`;
        }

        if (liability.payment_due_date) {
          details += `  - Payment Due: Day ${liability.payment_due_date} of month\n`;
        }

        if (liability.is_overdue) {
          details += `  - Status: OVERDUE\n`;
        }

        return details;
      };

      let liabilitiesSection = "";

      if (response.liabilities.credit.length > 0) {
        liabilitiesSection += `## Credit Accounts (${response.liabilities.credit.length})\n`;
        liabilitiesSection += response.liabilities.credit
          .map(formatLiability)
          .join("\n");
        liabilitiesSection += "\n\n";
      }

      if (response.liabilities.student.length > 0) {
        liabilitiesSection += `## Student Loans (${response.liabilities.student.length})\n`;
        liabilitiesSection += response.liabilities.student
          .map(formatLiability)
          .join("\n");
        liabilitiesSection += "\n\n";
      }

      if (response.liabilities.mortgage.length > 0) {
        liabilitiesSection += `## Mortgages (${response.liabilities.mortgage.length})\n`;
        liabilitiesSection += response.liabilities.mortgage
          .map(formatLiability)
          .join("\n");
      }

      const totalDebt =
        response.liabilities.credit.reduce(
          (sum, l) => sum + l.outstanding_balance,
          0
        ) +
        response.liabilities.student.reduce(
          (sum, l) => sum + l.outstanding_balance,
          0
        ) +
        response.liabilities.mortgage.reduce(
          (sum, l) => sum + l.outstanding_balance,
          0
        );

      return `# Liability Information

**Request ID:** ${response.request_id}

## Summary
- **Total Debt:** $${totalDebt.toFixed(2)}
- **Credit Accounts:** ${response.liabilities.credit.length}
- **Student Loans:** ${response.liabilities.student.length}
- **Mortgages:** ${response.liabilities.mortgage.length}

${liabilitiesSection}`;
    }
  );
}
