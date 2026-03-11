# Plaid Products Overview

Complete reference for all Plaid products, their capabilities, use cases, and key endpoints.

## Transactions

**Purpose**: Retrieve and sync user transaction history with intelligent categorization and enrichment.

**What it does:**
- Fetches historical and ongoing transactions from connected accounts
- Automatically categorizes transactions (e.g., "Groceries", "Gas", "Utilities")
- Enriches transactions with merchant logos, categories, and website information
- Detects and highlights duplicate transactions
- Supports currency conversion for multi-currency accounts
- Provides transaction-level personal finance insights

**Key Features:**
- **Real-time sync**: Via `/transactions/refresh` or webhooks (SYNC_UPDATES_AVAILABLE)
- **Historical access**: Up to 24 months of transaction history (varies by institution)
- **Categorization**: 100+ predefined spending categories
- **Personal categorization**: Users can customize transaction categories
- **Counterparty data**: Merchant and peer-to-peer payment details
- **ISO currency support**: Handle multi-currency accounts and conversions

**Key Endpoints:**
- `/transactions/get`: Retrieve transactions for an account
- `/transactions/refresh`: Force sync with latest data from institution
- `/transactions/recurring/get`: Identify recurring transaction patterns
- `/transactions/sync`: Get all changes since last sync (best for large datasets)

**Use Cases:**
- Personal finance dashboards (expense tracking, budgeting)
- Accounting software (automatic ledger entry)
- Lending platforms (income and spending verification)
- Robo-advisors (investment decisions based on cash flow)
- B2B payment platforms (cash flow analysis)

**Limitations:**
- Historical lookback varies by institution (30 days to 24 months typical)
- Some institutions may not provide real-time updates
- User's bank connection must remain active for ongoing syncing

**Pricing**: Usage-based per API call to `/transactions/get`

---

## Auth

**Purpose**: Securely retrieve account and routing numbers for ACH, wire, and other payment methods.

**What it does:**
- Provides verified account numbers and routing numbers
- Returns account type and subtype information
- Supports ACH and wire transfer verification
- Compatible with micro-deposit verification (optional second factor)

**Key Features:**
- **Verified account data**: Account/routing numbers verified by Plaid
- **Account type details**: Checking, savings, money market, etc.
- **ACH & Wire ready**: Data formatted for payment initiation
- **OFAC compliance**: Built-in OFAC screening for wire transfers
- **Micro-deposits**: Optional second-factor verification via small deposits

**Key Endpoints:**
- `/auth/get`: Retrieve account/routing numbers and metadata
- `/auth/verify`: Explicitly verify user with micro-deposits
- `/processor/auth/get`: For Plaid's payment processing partners

**Use Cases:**
- ACH payment platforms (employer payroll, P2P transfers)
- Wire transfer services
- Payroll software (employee direct deposit setup)
- Business-to-business payment networks
- Micro-lending platforms
- Gig economy payment distribution

**Account Type Reference:**
- **depository**: Checking, Savings, Money Market, CD
- **credit**: Credit cards, lines of credit
- **investment**: Brokerage, retirement accounts
- **loan**: Auto loans, personal loans, student loans
- **other**: Business accounts, cryptocurrency

**Limitations:**
- Some institutions don't provide account numbers for security reasons
- Routing numbers may be institution routing rather than account-specific
- Micro-deposit verification adds 1-3 day delay

**Pricing**: Usage-based per API call to `/auth/get`

---

## Balance

**Purpose**: Retrieve real-time account balances with available and current balance information.

**What it does:**
- Fetches current account balance (real-time or near real-time)
- Provides available balance (amount user can withdraw)
- Returns current balance (total including pending transactions)
- Works across all account types (checking, savings, credit cards, etc.)
- Updates automatically on-demand or via webhooks

**Key Features:**
- **Real-time data**: Balance current as of last institution update
- **Dual balance tracking**: Available vs. current balance
- **Multi-account support**: All accounts in single API call
- **Instant updates**: No caching delays
- **Credit card support**: Available credit, credit limit, statement balance
- **ISO currency support**: Multi-currency accounts

**Key Endpoints:**
- `/accounts/balance/get`: Get real-time balances for all accounts
- `/processor/balance/get`: For payment processing partners

**Use Cases:**
- Mobile banking apps
- Personal finance dashboards
- Lending platforms (income verification, affordability checks)
- Bill payment services (balance verification before payment)
- Budget tracking apps
- Fraud detection (unusual balance changes)

**Account Balance Fields:**
- `available`: Amount available for withdrawal
- `current`: Total balance including pending transactions
- `limit`: Credit limit (credit accounts only)
- `iso_currency_code`: Currency of the balance

**Limitations:**
- Balance may lag behind institution (typically minutes to hours)
- Credit card available balance may exclude pending transactions
- Some institutions update balances only daily
- Real-time balance not available for all institution types

**Pricing**: Usage-based per API call to `/accounts/balance/get`

---

## Identity

**Purpose**: Verify account owner identity and match against user-provided information.

**What it does:**
- Retrieves owner name, address, phone, and email from bank account
- Compares retrieved information against user-provided details
- Provides match scores indicating confidence level
- Supports identity verification for lending and account opening

**Key Features:**
- **Owner data retrieval**: Name, address, phone, email from financial institution
- **Match scoring**: Confidence scores for name, address, email matches
- **Multi-account identity**: Consistent identity across multiple linked accounts
- **Address history**: Primary and historical addresses when available
- **Phone and email verification**: Banks provide verified contact information
- **Regex matching**: Pattern-based matching for flexible comparisons

**Key Endpoints:**
- `/identity/get`: Retrieve owner identity information
- `/identity/match`: Compare identity against user-provided data
- `/processor/identity/get`: For payment processing partners

**Use Cases:**
- Lending platforms (KYC verification)
- Account opening workflows (identity verification)
- Fraud prevention (identity consistency checking)
- AML compliance (anti-money laundering screening)
- Credit applications (verify applicant identity)
- Financial advisory platforms (client verification)

**Match Score Interpretation:**
- **100**: Exact match
- **90-99**: High confidence match
- **75-89**: Moderate confidence match
- **< 75**: Low confidence (likely mismatch)

**Identity Fields Available:**
- `names`: All account owner names
- `addresses`: Primary and secondary addresses
- `emails`: Verified email addresses
- `phone_numbers`: Associated phone numbers

**Limitations:**
- Not all institutions provide identity information
- Address format varies by country/institution
- Some banks don't maintain email/phone in account records
- Identity data may lag behind recent user changes

**Pricing**: Usage-based per API call to `/identity/get`

---

## Investments

**Purpose**: Access detailed holdings, securities, and investment account transaction history.

**What it does:**
- Retrieves investment account holdings (stocks, bonds, funds, etc.)
- Provides real-time security prices and valuations
- Returns investment transaction history (buys, sells, dividends)
- Supports portfolio analysis and rebalancing workflows
- Aggregates data across multiple accounts and institutions

**Key Features:**
- **Holdings data**: Quantity, cost basis, current value for each security
- **Security master data**: CUSIP, ISIN, ticker symbols
- **Real-time pricing**: Current market prices and valuations
- **Transaction history**: Buys, sells, dividends, splits, transfers
- **Investment account types**: Brokerage, 401k, IRA, etc.
- **Cash positions**: Uninvested cash in accounts
- **Margin data**: Margin balance and buying power

**Key Endpoints:**
- `/investments/holdings/get`: Retrieve current holdings and valuations
- `/investments/transactions/get`: Get investment transaction history

**Use Cases:**
- Robo-advisors (portfolio management and rebalancing)
- Wealth management platforms (client asset aggregation)
- Financial planning tools (net worth tracking)
- Tax reporting software (cost basis, realized gains)
- Portfolio risk analytics
- Investment dashboards

**Holdings Fields:**
- `security_id`: Unique identifier for security
- `quantity`: Shares or units held
- `cost_basis_per_unit`: Average purchase price
- `institution_value`: Current market value at institution
- `currency`: Currency of holdings

**Security Information:**
- `cusip`: Committee on Uniform Securities ID
- `isin`: International Securities ID
- `ticker`: Stock ticker symbol
- `name`: Official security name
- `type`: Stock, bond, fund, etc.

**Limitations:**
- Historical data availability varies (typically 1-3 years)
- Some institutions don't provide cost basis or transaction details
- Real-time pricing may be delayed (15-20 minutes typical)
- Cryptocurrency holdings not supported by most institutions

**Pricing**: Usage-based per API call to `/investments/holdings/get`

---

## Liabilities

**Purpose**: Aggregate credit cards, student loans, mortgages, and other debt with balance and payment details.

**What it does:**
- Retrieves credit card accounts with balance and interest rate
- Aggregates student loan debt with repayment terms
- Fetches mortgage information including loan terms and principal/interest breakdown
- Provides payment details and due dates
- Supports debt consolidation and financial planning workflows

**Key Features:**
- **Credit card aggregation**: Balance, APR, available credit, statement details
- **Student loan details**: Current balance, interest rate, repayment plan, servicer
- **Mortgage information**: Current principal, original loan amount, interest rate, term
- **Payment schedules**: Due dates, minimum payments, last payment date
- **Interest and fees**: Breakdown of charges
- **Loan origination details**: Original amount, origination date, term length
- **Account status**: Active, deferred, in deferment, etc.

**Key Endpoints:**
- `/liabilities/get`: Get all liabilities for an item
- `/liabilities/credit_cards/get`: Credit card-specific data
- `/liabilities/student_loans/get`: Student loan-specific data
- `/liabilities/mortgages/get`: Mortgage-specific data

**Use Cases:**
- Debt management platforms
- Lending platforms (debt-to-income calculations)
- Financial planning tools (net worth, debt tracking)
- Credit counseling services
- Mortgage refinance marketplaces
- Personal finance dashboards
- Budgeting applications

**Liability Types:**
- **Credit Cards**: CREDIT account type, APR, available credit
- **Student Loans**: LOAN account type, federal/private, repayment plan
- **Mortgages**: LOAN account type, fixed/ARM, remaining term
- **Auto Loans**: LOAN account type, vehicle details, remaining balance
- **Personal Loans**: LOAN account type, payment schedule

**Key Fields:**
- `account_id`: Account identifier
- `balance`: Current outstanding balance
- `interest_rate`: Current interest rate
- `last_payment_date`: Date of most recent payment
- `next_payment_due_date`: Upcoming payment due date
- `min_payment_amount`: Minimum required payment

**Limitations:**
- Not all institutions provide detailed liability information
- Student loan servicers may have limited data sharing
- Mortgage details may be incomplete for newer loans
- APR and payment details may not update in real-time

**Pricing**: Usage-based per API call to `/liabilities/get`

---

## Income

**Purpose**: Verify user income through multiple verification methods for lending and financial decisions.

**What it does:**
- Enables income verification through three methods: bank verification, payroll verification, and document upload
- Provides income history and patterns
- Calculates annualized income and confidence scores
- Supports lending workflows (loan applications, credit underwriting)
- Aggregates income from multiple sources

**Key Features:**
- **Bank-based verification**: Real transaction analysis for income deposits
- **Payroll integration**: Direct payroll provider connections
- **Document upload**: W2s, 1099s, tax returns, offer letters
- **Income history**: Monthly and annual income trends
- **Multi-source aggregation**: Salary, freelance, bonus, rental income
- **Confidence scoring**: Reliability indicator for verified income
- **Employment details**: Employer name, position, start date

**Key Endpoints:**
- `/income/verification/create`: Initiate income verification
- `/income/verification/get`: Retrieve verification results
- `/income/verification/documents/get`: Access uploaded documents

**Verification Methods:**
1. **BANK**: Analyze income deposits in connected bank account
   - Real transaction data
   - Works for all income types
   - Best for recent employment

2. **PAYROLL**: Connect to payroll provider directly
   - Authoritative income data
   - W2 and paystub access
   - Most reliable for W2 employment

3. **DOCUMENTS**: User uploads tax documents
   - W2, 1099, tax returns, offer letters
   - Flexible for various income types
   - Manual upload and verification

**Use Cases:**
- Mortgage lending platforms
- Personal loan underwriting
- Credit card applications
- Rental applications (landlord verification)
- Gig economy income verification
- Student loan refinancing
- Income-based financial planning

**Income Calculation:**
- **Monthly income**: Average monthly deposits
- **Annual income**: Monthly income × 12
- **YTD income**: Year-to-date total
- **Income stability score**: Coefficient of variation in deposits

**Document Types Accepted:**
- W2 (wage and salary income)
- 1099 (self-employment, freelance, contract)
- 1040 Schedule C (self-employment)
- Tax return (various forms)
- Paystub (salary verification)
- Offer letter (future income)
- Bank statements (self-employed verification)

**Limitations:**
- Bank verification requires 2+ months of history
- Payroll method availability varies by employer/provider
- Document verification is manual and may take 1-2 days
- Income from recent employment (< 2 months) may lack history

**Pricing**: Usage-based per API call or per document verified

---

## Transfer

**Purpose**: Enable multi-rail US payments including ACH, RTP, Wire, and FedNow through a unified API.

**What it does:**
- Initiates payments across multiple delivery rails automatically
- Handles bank account verification and fund routing
- Provides real-time transfer status and settlement tracking
- Manages return and exception handling
- Enables payment history and reconciliation

**Key Features:**
- **Multi-rail payment**: ACH, RTP, Wire, FedNow in single API call
- **Smart rail selection**: Automatic selection based on amount, speed, cost
- **Fund verification**: Balance checks before initiating transfer
- **Real-time status**: Webhook notifications on transfer state changes
- **Failure recovery**: Automatic retries and fallback options
- **OFAC screening**: Built-in compliance checks for wire transfers
- **Scheduled payments**: Set up transfers for future dates

**Key Endpoints:**
- `/transfer/create`: Initiate a new transfer
- `/transfer/get`: Check transfer status
- `/transfer/event/get`: Get transfer events and history
- `/transfer/recurring/create`: Set up recurring transfers
- `/transfer/balance/get`: Check transfer wallet balance (if applicable)

**Payment Rails:**
- **ACH**: Electronic funds transfer, 1-3 days, low cost, most common
- **RTP**: Real-time payments, minutes, higher cost, growing availability
- **Wire**: Domestic or international, same day, highest cost
- **FedNow**: Instant settlement, 24/7 availability, newer rail

**Transfer Types:**
- **ACH**: DEBIT (pull from account) or CREDIT (push to account)
- **RTP**: Credit transfer only
- **Wire**: Credit transfer with beneficiary bank routing
- **FedNow**: Credit transfer, instant settlement

**Use Cases:**
- Payroll platforms (employee direct deposit)
- B2B payment platforms (invoice payments)
- Marketplace payments (seller payouts)
- Bill payment services
- Gig economy payment (contractor payouts)
- Lending platforms (loan disbursement)
- Fintech apps (peer-to-peer transfers)

**Transfer Status Lifecycle:**
1. **PROCESSING**: Pending verification and processing
2. **PENDING**: Awaiting settlement
3. **POSTED**: Successfully settled
4. **SETTLED**: Funds received by beneficiary
5. **CANCELLED**: Transfer cancelled
6. **FAILED**: Transfer failed
7. **RETURNED**: Funds returned to source

**Common Reasons for Transfer Failure:**
- Insufficient funds in source account
- Invalid account/routing number
- Account holder name mismatch
- Institution rejection (suspected fraud, hold, etc.)
- OFAC block (wire transfers)
- Inactive or closed account

**Limitations:**
- ACH transfers subject to daily and monthly limits per institution
- RTP and FedNow availability depends on bank support (growing)
- Wire transfers have per-transaction cost and minimum amounts
- Some bank pairs may not support certain rail combinations
- International wires require additional SWIFT codes

**Pricing**: Per-transaction fees vary by rail type (ACH lowest, Wire highest)

---

## Payment Initiation (PPI)

**Purpose**: Initiate payment transfers across European payment networks (SEPA, FPS) for global payment scenarios.

**What it does:**
- Enables single payments or recurring payments across SEPA network (EU/EEA)
- Supports UK Faster Payments Service (FPS)
- Handles payment authorization flows
- Provides payment status tracking and reconciliation
- Manages payment scheme compliance and rules

**Key Features:**
- **SEPA Credit Transfers**: EU/EEA payments, 1-2 days
- **SEPA Instant Payments**: Near-instant EU/EEA transfers
- **Faster Payments Service**: UK payments, typically 2 hours
- **Recurring payments**: Set up and manage standing orders
- **Authorization flows**: Secure user confirmation for payments
- **Compliance**: PSD2, GDPR, and local regulation support
- **Payment status tracking**: Real-time status updates

**Key Endpoints:**
- `/payment_initiation/payment/create`: Initiate single or recurring payment
- `/payment_initiation/payment/get`: Check payment status
- `/payment_initiation/consent/create`: Create payment authorization consent
- `/payment_initiation/consent/get`: Check consent status

**Payment Schemes:**
- **SEPA CT**: Standard Euro credit transfer, 1-2 business days
- **SEPA Instant**: Instant Euro transfer, 24/7/365
- **FPS**: Faster Payments Service (UK), typically 2 hours
- **BACS**: UK batch processing, 3 working days

**Use Cases:**
- European fintech applications
- Global payroll platforms (employee payments in EU)
- International marketplace (seller payouts)
- Cross-border e-commerce (payment collection)
- Travel and accommodation payments
- Business expense management
- Freelancer payments

**Payment Status:**
- **INITIATED**: Payment request created
- **AUTHORISED**: User authorized payment
- **SUBMITTED**: Submitted to payment scheme
- **PENDING**: Awaiting settlement
- **COMPLETED**: Successfully settled
- **FAILED**: Payment failed
- **REVOKED**: User revoked payment

**Compliance Requirements:**
- **PSD2 Strong Customer Authentication**: Secure payment authorization
- **Consent Management**: Explicit user consent for payments
- **GDPR**: Data protection for EU users
- **Regulatory Reporting**: Payment records for compliance

**Limitations:**
- Limited to EEA/UK (not available for US or other regions)
- SEPA Instant requires participating bank support
- Recurring payment rules vary by country
- FPS limited to UK only
- Currency limited to EUR (SEPA) or GBP (FPS)

**Pricing**: Per-transaction fees based on payment scheme

---

## Signal

**Purpose**: Machine learning-powered risk assessment for ACH transactions to reduce fraud and chargebacks.

**What it does:**
- Scores ACH transactions for fraud and return risk
- Provides decision recommendations (approve, review, decline)
- Analyzes transaction characteristics, user history, and network patterns
- Enables risk-based pricing and automated decision-making
- Integrates into transfer workflows for pre-transfer assessment

**Key Features:**
- **Fraud scoring**: ML model trained on billions of ACH transactions
- **Chargeback prediction**: Likelihood of ACH return or chargeback
- **Return risk assessment**: Predictive analytics for failed transfers
- **User risk profiling**: Historical ACH behavior analysis
- **Anomaly detection**: Unusual transaction patterns
- **Decision recommendations**: Approve, review, or decline guidance
- **Real-time scoring**: Sub-second risk assessment

**Key Endpoints:**
- `/signal/evaluate`: Score transaction for risk
- `/signal/decision/report`: Report transaction outcome for model improvement

**Use Cases:**
- ACH payment platforms (fraud reduction)
- B2B marketplaces (seller payout fraud prevention)
- Lending platforms (loan disbursement risk)
- Bill payment services
- Gig economy platforms (contractor payout validation)
- Fintech apps (P2P transfer risk assessment)
- Chargeback prevention

**Signal Scores:**
- **0.0-0.2**: Very low risk (safe to approve)
- **0.2-0.4**: Low risk (approval likely safe)
- **0.4-0.6**: Medium risk (consider review)
- **0.6-0.8**: High risk (additional verification recommended)
- **0.8-1.0**: Very high risk (likely fraudulent, consider declining)

**Key Features Used in Scoring:**
- Sender/receiver bank account characteristics
- Transaction amount and frequency
- Sender/receiver history and trustworthiness
- Network analysis (known fraud rings)
- Behavioral anomalies
- Device and IP reputation
- User registration and identity signals

**Output Details:**
- `risk_score`: Numerical score 0-1
- `recommended_decision`: APPROVE, REVIEW, DECLINE
- `confidence_level`: Model confidence in assessment
- `decision_rationale`: Key factors influencing score
- `business_classification`: Sender/receiver business type
- `account_attributes`: Account age, transaction patterns

**Limitations:**
- Requires ACH payment rails (not applicable to wire transfers)
- Score effectiveness depends on complete user/transaction data
- Model trained primarily on US ACH patterns
- Not a guarantee against fraud (supplementary risk layer)
- Requires `/signal/decision/report` feedback for continuous improvement

**Pricing**: Usage-based per API call to `/signal/evaluate`

---

## Quick Product Selection Guide

**User wants to...**
- Link their bank account → **Transactions** + **Link**
- Send money via ACH → **Auth** + **Transfer**
- Check account balance → **Balance**
- Verify income → **Income**
- Verify identity → **Identity**
- Access investment data → **Investments**
- See debt details → **Liabilities**
- Assess fraud risk → **Signal**
- Make European payments → **Payment Initiation**

**Use product combinations:**
- Lending platform: Income + Identity + Liabilities + Signal
- Personal finance app: Transactions + Balance + Investments + Liabilities
- Payroll processor: Auth + Income + Transfer
- B2B payment platform: Auth + Transfer + Signal
- Wealth manager: Investments + Transactions + Identity + Balance

---

**Last Updated**: 2026
**Documentation**: https://plaid.com/docs
