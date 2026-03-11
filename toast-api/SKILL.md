---
name: toast-api
description: >
  Expert Toast POS API and developer integration skill for building automations, retrieving
  data, and managing restaurants programmatically via Toast REST APIs. Use when the user asks
  about Toast API, Toast developer docs, building integrations, pulling data programmatically,
  webhooks, or connecting Toast to other systems. Trigger on: Toast API, Toast integration,
  Toast webhook, orders API, menus API, labor API, stock API, analytics API, config API,
  Toast REST API, or any programmatic Toast task. For admin/UI tasks, use toast-admin instead.
---

# Toast POS API & Integrations

## Overview

This skill makes you an expert on the Toast platform REST APIs, enabling you to help build integrations, pull data, automate workflows, and connect Toast with other systems programmatically.

The Toast API base URL is: `https://ws-api.toasttab.com`

All Toast APIs are REST-based, returning JSON. They support GET for reading and POST/PUT/PATCH/DELETE for writing. Access is controlled by integration type (partner, custom, standard, or analytics).

**Key documentation resources:**
- API Reference: `https://toastintegrations.redoc.ly/`
- Developer Guide: `https://doc.toasttab.com/doc/devguide/`
- Platform Guide: `https://doc.toasttab.com/doc/platformguide/`
- How-to Guides / Cookbook: `https://doc.toasttab.com/doc/cookbook/`

When helping users with API tasks, always reference the specific endpoint, HTTP method, and expected request/response structure. Point users to the full API reference for complete schema details.

## Authentication

Toast APIs use **OAuth 2.0 client credentials flow**.

**Getting credentials:**
1. Register as a Toast integration partner or request API access
2. Receive a `clientId` and `clientSecret`
3. Exchange credentials for an access token

**Token request:**
```
POST https://ws-api.toasttab.com/authentication/v1/authentication/login
Content-Type: application/json

{
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "userAccessType": "TOAST_MACHINE_CLIENT"
}
```

**Response:** Returns a JSON object with a `token` field containing a Bearer token.

**Using the token:**
Include in all subsequent requests:
```
Authorization: Bearer <token>
Toast-Restaurant-External-ID: <restaurant-GUID>
```

The `Toast-Restaurant-External-ID` header identifies which restaurant location you're querying.

## Available APIs

### Orders API (`/orders/v2/`)
The most commonly used API. Retrieve and create orders, checks, and payments.

**Key endpoints:**
- `GET /orders/v2/orders` — Get orders for a restaurant (with date filters)
- `GET /orders/v2/orders/{orderGuid}` — Get a specific order by GUID
- `POST /orders/v2/orders` — Create a new order
- `PATCH /orders/v2/orders/{orderGuid}` — Update an existing order

**Common query parameters:**
- `businessDate` — Filter by business date (YYYYMMDD format)
- `startDate` / `endDate` — Date range filter (ISO 8601)
- `pageToken` — Pagination token for large result sets

**Webhooks:** Subscribe to `order_updated` webhook to receive real-time order notifications.

**Important notes:**
- Orders created via API default to "fulfill ASAP" — no service hour validation
- API-created orders are limited to CREDIT and OTHER payment types
- Use the orders webhook for real-time updates rather than polling

### Menus API (`/menus/v2/` or `/menus/v3/`)
Retrieve the full menu structure for a location.

**Key endpoints:**
- `GET /menus/v2/menus` — Get all menus for a restaurant
- `GET /menus/v2/metadata` — Check if menu data has changed since last fetch

**Best practices:**
- Poll `/metadata` every 1-5 minutes to check for changes
- Only re-fetch full menu data when metadata indicates a change
- Subscribe to the menus webhook for real-time change notifications
- V3 is the newer version — use it for new integrations

**Menu hierarchy in API responses:**
Menu → MenuGroup → MenuItem → ModifierGroup → ModifierOption

### Configuration API (`/config/v2/`)
Get restaurant configuration details — revenue centers, dining options, payment types, and other settings.

**Key endpoints:**
- `GET /config/v2/revenueCenters` — Revenue centers
- `GET /config/v2/diningOptions` — Dining options (Dine In, Takeout, etc.)
- `GET /config/v2/alternatePaymentTypes` — Payment types configured
- `GET /config/v2/serviceCharges` — Service charges

Returns GUIDs used by other APIs. Think of Configuration as the "lookup tables" that other APIs reference.

### Labor API (`/labor/v1/`)
Manage employees, jobs, shifts, and schedules.

**Key endpoints:**
- `GET /labor/v1/employees` — Get all employees
- `GET /labor/v1/employees/{employeeGuid}` — Get specific employee
- `POST /labor/v1/employees` — Add an employee
- `PUT /labor/v1/employees/{employeeGuid}` — Update an employee
- `DELETE /labor/v1/employees/{employeeGuid}` — Remove an employee
- `GET /labor/v1/jobs` — Get all job definitions
- `GET /labor/v1/shifts` — Get shift data
- `GET /labor/v1/timeEntries` — Get clock in/out records

### Stock API (`/stock/v1/`)
Manage inventory availability for menu items.

**Key endpoints:**
- `GET /stock/v1/inventory` — Get current stock status for items
- `POST /stock/v1/inventory/update` — Update stock quantities or status

**Webhooks:** Subscribe to stock webhook for real-time inventory updates.

**Use case:** Prevent online customers from ordering out-of-stock items by checking stock before displaying menu items.

### Analytics API / ERA (`/era/v1/`)
Access reporting and performance data.

**Key endpoints:**
- POST-based queries for sales data, labor data, and performance metrics
- Requires Analytics API access level

### Restaurants API (`/restaurants/v1/`)
Get restaurant location information — name, address, hours, schedules.

**Key endpoints:**
- `GET /restaurants/v1/restaurants/{restaurantGuid}` — Get location details

### Restaurant Availability API
Check if a location is currently accepting online orders.

**Key endpoints:**
- `GET /restaurant-availability/v1/availability` — Get current availability status

### Cash Management API (`/cashmgmt/v1/`)
Access cash drawer event information.

**Key endpoints:**
- `GET /cashmgmt/v1/entries` — Get cash drawer events (pay-ins, pay-outs, etc.)

### Kitchen API (`/kitchen/v1/`)
Access kitchen prep station information.

### Partners API (`/partners/v1/`)
Get information about which restaurant locations your API client can access.

**Key endpoints:**
- `GET /partners/v1/restaurants` — List accessible restaurant locations

### Order Management Config API (`/ordermgmt-config/v1/`)
Get online ordering schedule configuration.

### Packaging Config API (`/packaging/v1/`)
Get packaging preference configurations for a location.

## Outbound APIs (You Host These)

Some Toast integrations are "outbound" — Toast sends requests TO your endpoint:

### Gift Cards API
Toast sends gift card transaction requests to your endpoint. You implement the gift card provider service.

### Loyalty API
Toast sends loyalty program lookups and transactions to your endpoint. You implement the loyalty provider service.

### Tender API
Toast sends tender/payment transaction information to your endpoint for record-keeping.

**For all outbound APIs:** You must host an HTTPS endpoint that accepts POST requests from Toast and returns predefined response formats.

## Webhooks

Toast uses webhooks to push real-time updates to your system.

**Key webhooks:**
- `order_updated` — New orders and order changes
- `menu_updated` — Menu changes
- `stock_updated` — Inventory/stock changes

**Setup:** Configure webhook URLs through the Toast developer portal or API.

**Best practice:** Use webhooks as your primary data sync mechanism, with polling as a fallback if you miss a webhook.

## Common Integration Patterns

### Pulling Sales Data for Accounting
1. Authenticate and get token
2. `GET /orders/v2/orders?businessDate=YYYYMMDD` to get all orders for a date
3. Parse order totals, taxes, tips, discounts from the response
4. Map to your accounting system's chart of accounts

### Building an Online Ordering Integration
1. Fetch menus: `GET /menus/v3/menus`
2. Check stock: `GET /stock/v1/inventory`
3. Check availability: `GET /restaurant-availability/v1/availability`
4. Submit order: `POST /orders/v2/orders`
5. Subscribe to `order_updated` webhook for status changes

### Syncing Employee Data
1. `GET /labor/v1/employees` to pull current employee roster
2. `GET /labor/v1/timeEntries?startDate=X&endDate=Y` for timesheet data
3. Map to payroll system
4. Use `POST /labor/v1/employees` to add new hires from HR system

### Real-Time Inventory Sync
1. Subscribe to `stock_updated` webhook
2. When webhook fires, update your inventory system
3. Fallback: poll `GET /stock/v1/inventory` periodically
4. Push updates back: `POST /stock/v1/inventory/update`

## Rate Limits & Best Practices

- Respect rate limits — Toast will return 429 if you exceed them
- Use webhooks instead of polling wherever possible
- Cache menu and configuration data; only re-fetch when metadata indicates changes
- Always include `Toast-Restaurant-External-ID` header
- Handle pagination with `pageToken` for large result sets
- Use date filters to limit response sizes
- Store GUIDs — they're the primary identifiers across all Toast APIs

## Error Handling

Common HTTP status codes:
- `200` — Success
- `400` — Bad request (check your payload)
- `401` — Unauthorized (token expired or invalid)
- `403` — Forbidden (insufficient permissions for this integration type)
- `404` — Resource not found
- `429` — Rate limited (back off and retry)
- `500` — Toast server error (retry with exponential backoff)

## Resources

### references/

For deeper technical detail, consult:
- `references/api-endpoints-reference.md` — Complete endpoint reference with request/response examples
- `references/webhook-setup.md` — Detailed webhook configuration and payload formats
- `references/integration-cookbook.md` — Step-by-step recipes for common integration scenarios
