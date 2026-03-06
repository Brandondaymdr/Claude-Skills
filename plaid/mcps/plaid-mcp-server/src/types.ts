/**
 * Plaid data type definitions
 */

export interface PlaidError {
  error_type: string;
  error_code: string;
  error_message: string;
  display_message: string | null;
  request_id: string;
}

export interface PlaidAccount {
  account_id: string;
  name: string;
  mask: string;
  type: string;
  subtype: string;
  verification_status: string;
}

export interface PlaidTransaction {
  transaction_id: string;
  account_id: string;
  amount: number;
  currency_code: string;
  date: string;
  datetime: string | null;
  merchant_name: string | null;
  personal_finance_category: {
    primary: string;
    detailed: string;
  } | null;
  pending: boolean;
  name: string;
  unofficial_currency_code: string | null;
}

export interface PlaidBalance {
  account_id: string;
  available: number | null;
  current: number;
  limit: number | null;
  iso_currency_code: string | null;
  unofficial_currency_code: string | null;
}

export interface PlaidInstitution {
  institution_id: string;
  name: string;
  url: string | null;
  logo: string | null;
  primary_color: string | null;
  routing_numbers: string[];
  products: string[];
  country_codes: string[];
}

export interface PlaidItem {
  item_id: string;
  institution_id: string;
  webhook: string | null;
  error: PlaidError | null;
  available_products: string[];
  billed_products: string[];
  products: string[];
  consent_expiration_time: string | null;
  status: {
    investments: {
      last_successful_update: string | null;
      last_failed_update: string | null;
    } | null;
    transactions: {
      last_successful_update: string | null;
      last_failed_update: string | null;
    } | null;
  };
}

export interface PlaidIdentity {
  account_id: string;
  names: string[];
  emails: Array<{
    data: string;
    primary: boolean;
    type: string;
  }>;
  phone_numbers: Array<{
    data: string;
    primary: boolean;
    type: string;
  }>;
  addresses: Array<{
    data: {
      city: string;
      country: string;
      postal_code: string;
      region: string;
      street: string;
    };
    primary: boolean;
  }>;
}

export interface PlaidInvestmentHolding {
  account_id: string;
  security_id: string;
  quantity: number;
  institution_price: number;
  institution_price_as_of: string;
  cost_basis: number | null;
}

export interface PlaidSecurity {
  security_id: string;
  isin: string | null;
  cusip: string | null;
  sedol: string | null;
  symbol: string | null;
  name: string;
  ticker: string | null;
  type: string;
}

export interface PlaidLiability {
  account_id: string;
  account_number: string;
  account_owner_name: string;
  type: string;
  liability_type: string;
  outstanding_balance: number;
  next_payment_due_date: string | null;
  last_payment_date: string | null;
  last_statement_issue_date: string | null;
  last_statement_balance: number | null;
  minimum_payment_amount: number | null;
  payment_due_date: number | null;
  purchase_apr: number | null;
  cash_apr: number | null;
  transfer_apr: number | null;
  interest_charge_amount: number | null;
  interest_rate_percentage: number | null;
  principal: number | null;
  legal_name: string | null;
  account_status: string | null;
  days_past_due: number | null;
  is_overdue: boolean | null;
}

export interface PlaidTransfer {
  id: string;
  created: string;
  authorization_decision: string;
  authorization_decision_rationale: {
    code: string;
    description: string;
  } | null;
  funding_account_id: string;
  type: string;
  amount: string;
  description: string;
  status: string;
  user: {
    legal_name: string;
    email_address: string;
    address: {
      street: string;
      city: string;
      region: string;
      postal_code: string;
      country: string;
    };
  };
  origination_account_id: string;
  originator_client_id: string | null;
  iso_currency_code: string;
}

export interface PlaidSignalEvaluation {
  request_id: string;
  core_attributes: {
    illegal_activity_score: number;
    rip_confidence: number;
    ppd_confidence: number;
  };
  proactive_source: string | null;
  days_requested: number;
}

export interface PlaidLinkToken {
  link_token: string;
  expiration: string;
  request_id: string;
}

export interface PlaidPublicTokenExchange {
  access_token: string;
  item_id: string;
  request_id: string;
}
