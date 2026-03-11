/**
 * Plaid signal tools
 * Handles ACH transaction risk evaluation
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PlaidClient } from "../services/plaid-client.js";
import { ResponseFormatSchema } from "../schemas/common.js";

interface SignalEvaluationResponse {
  request_id: string;
  illegal_activity_score: number;
  rip_confidence: number;
  ppd_confidence: number;
  days_requested: number;
}

export function registerSignalTools(server: McpServer, client: PlaidClient) {
  // Evaluate Signal
  server.tool(
    "plaid_evaluate_signal",
    "Evaluate ACH transaction risk using Plaid Signal",
    {
      access_token: z
        .string()
        .describe("Access token for the account"),
      account_id: z
        .string()
        .describe("The account ID being evaluated"),
      amount: z
        .number()
        .describe("Transaction amount in dollars"),
      client_transaction_id: z
        .string()
        .optional()
        .describe("Unique client transaction identifier"),
      user: z
        .object({
          legal_name: z
            .string()
            .optional()
            .describe("Legal name of ACH originator"),
          email_address: z
            .string()
            .email()
            .optional()
            .describe("Email address"),
          phone_number: z
            .string()
            .optional()
            .describe("Phone number"),
          address: z
            .object({
              street: z.string().optional(),
              city: z.string().optional(),
              region: z.string().optional(),
              postal_code: z.string().optional(),
              country: z.string().optional(),
            })
            .optional()
            .describe("Address information"),
        })
        .optional()
        .describe("Originating user information"),
      response_format: ResponseFormatSchema,
    },
    async (params: Record<string, unknown>) => {
      const {
        access_token,
        account_id,
        amount,
        client_transaction_id,
        user,
        response_format = "markdown",
      } = params;

      const requestData: Record<string, unknown> = {
        access_token,
        account_id,
        amount,
      };

      if (client_transaction_id) {
        requestData.client_transaction_id = client_transaction_id;
      }

      if (user) {
        requestData.user = user;
      }

      const response =
        await client.makeApiRequest<SignalEvaluationResponse>(
          "/signal/evaluate",
          requestData
        );

      if (response_format === "json") {
        return JSON.stringify(response, null, 2);
      }

      const illegalActivityPercent = Math.round(response.illegal_activity_score * 100);
      const ripConfidencePercent = Math.round(response.rip_confidence * 100);
      const ppdConfidencePercent = Math.round(response.ppd_confidence * 100);

      const riskLevel =
        response.illegal_activity_score >= 0.7
          ? "HIGH RISK"
          : response.illegal_activity_score >= 0.4
            ? "MEDIUM RISK"
            : "LOW RISK";

      return `# ACH Transaction Risk Evaluation

**Request ID:** ${response.request_id}

**Transaction Amount:** $${amount}

**Days Requested:** ${response.days_requested}

## Risk Scores

### Illegal Activity Score: ${illegalActivityPercent}%
**Overall Risk Level:** ${riskLevel}

The probability this transaction represents illegal activity (fraud, money laundering, etc.)

### Rapid Inflow Predictiveness (RIP): ${ripConfidencePercent}%
Likelihood of rapid inflows into the receiving account

### Possible Payroll Deduction (PPD): ${ppdConfidencePercent}%
Likelihood the transaction is a legitimate payroll deduction

## Recommendation
${
  response.illegal_activity_score >= 0.7
    ? "RECOMMEND REVIEW: This transaction has characteristics of high-risk activity. Consider additional verification steps."
    : response.illegal_activity_score >= 0.4
      ? "RECOMMEND CAUTION: This transaction shows some risk indicators. Standard verification is recommended."
      : "APPROVE: This transaction appears to be low-risk based on available signals."
}`;
    }
  );
}
