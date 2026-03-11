/**
 * Common Zod schemas used across Plaid tools
 */

import { z } from "zod";

export const ResponseFormatSchema = z
  .enum(["markdown", "json"])
  .default("markdown")
  .describe("Format for the response output");

export const PaginationSchema = z
  .object({
    cursor: z
      .string()
      .optional()
      .describe("Cursor for pagination, if applicable"),
    count: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("Number of records to return"),
  })
  .optional();

export const AccessTokenSchema = z
  .string()
  .describe(
    "The Plaid access token for the authenticated financial institution"
  );

export const CountryCodesSchema = z
  .array(z.string())
  .optional()
  .describe("List of country codes (e.g., US, GB, FR)");

export const ProductsSchema = z
  .array(z.string())
  .optional()
  .describe(
    "List of Plaid products to request (e.g., auth, transactions, balance)"
  );

export const PlaidUserSchema = z.object({
  client_user_id: z
    .string()
    .optional()
    .describe(
      "Unique identifier for the end user (e.g., UUID, username, email)"
    ),
  legal_name: z
    .string()
    .optional()
    .describe("The legal name of the user"),
  email_address: z
    .string()
    .email()
    .optional()
    .describe("The user email address"),
  phone_number: z
    .string()
    .optional()
    .describe("The user phone number"),
});

export const PlaidAddressSchema = z.object({
  street: z.string().optional().describe("Street address"),
  city: z.string().optional().describe("City"),
  region: z.string().optional().describe("State or region"),
  postal_code: z.string().optional().describe("ZIP or postal code"),
  country: z.string().optional().describe("Country code (ISO 3166-1 alpha-2)"),
});

export const LanguageSchema = z
  .enum(["en", "es", "fr", "nl", "de", "it", "pt"])
  .optional()
  .describe("Language for the Link flow UI");

export const AccountFiltersSchema = z
  .object({
    depository: z
      .object({
        account_subtypes: z.array(z.string()).optional(),
      })
      .optional(),
    credit: z
      .object({
        account_subtypes: z.array(z.string()).optional(),
      })
      .optional(),
    loan: z
      .object({
        account_subtypes: z.array(z.string()).optional(),
      })
      .optional(),
    investment: z
      .object({
        account_subtypes: z.array(z.string()).optional(),
      })
      .optional(),
  })
  .optional()
  .describe("Account type and subtype filters for Link");
