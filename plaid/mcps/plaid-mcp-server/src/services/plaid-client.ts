/**
 * Plaid API client service
 * Handles authentication, requests, and error handling
 */

import axios, { AxiosInstance } from "axios";
import { PlaidError } from "../types.js";

export class PlaidClient {
  private client: AxiosInstance;
  private clientId: string;
  private secret: string;
  private baseUrl: string;

  constructor(
    clientId: string,
    secret: string,
    environment: string = "sandbox"
  ) {
    this.clientId = clientId;
    this.secret = secret;

    const baseUrls: Record<string, string> = {
      sandbox: "https://sandbox.plaid.com",
      development: "https://development.plaid.com",
      production: "https://production.plaid.com",
    };

    this.baseUrl = baseUrls[environment] || baseUrls.sandbox;

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
    });
  }

  async makeApiRequest<T>(
    endpoint: string,
    data: Record<string, unknown>
  ): Promise<T> {
    try {
      const requestData = {
        ...data,
        client_id: this.clientId,
        secret: this.secret,
      };

      const response = await this.client.post<T>(endpoint, requestData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      throw this.handlePlaidError(error);
    }
  }

  private handlePlaidError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as Record<string, unknown> | undefined;

      if (data && "error_type" in data && "error_code" in data) {
        const plaidError = data as PlaidError;
        return new Error(
          `Plaid API Error [${plaidError.error_code}]: ${plaidError.error_message}`
        );
      }

      if (error.response?.status === 401) {
        return new Error("Plaid authentication failed: Invalid credentials");
      }

      if (error.response?.status === 400) {
        return new Error(
          `Plaid API Error: Invalid request - ${JSON.stringify(data)}`
        );
      }

      if (error.response?.status === 429) {
        return new Error("Plaid API rate limit exceeded");
      }

      return new Error(
        `Plaid API Error: ${error.response?.status || "Unknown"} - ${
          error.message
        }`
      );
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error("Unknown error occurred");
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}

export function createPlaidClient(): PlaidClient {
  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  const environment = process.env.PLAID_ENV || "sandbox";

  if (!clientId || !secret) {
    throw new Error(
      "PLAID_CLIENT_ID and PLAID_SECRET environment variables are required"
    );
  }

  return new PlaidClient(clientId, secret, environment);
}
