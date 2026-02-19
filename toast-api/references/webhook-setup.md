# Toast Webhook Setup & Payload Reference

## Overview

Toast webhooks push real-time event data to your HTTPS endpoint when changes occur in the restaurant (new orders, menu updates, stock changes). Using webhooks is the recommended approach for staying in sync with Toast data — it's more efficient and timely than polling.

## Available Webhooks

| Webhook Event | Description | Fires When |
|---|---|---|
| `order_updated` | Order changes | New order created, order modified, payment applied, check closed |
| `menu_updated` | Menu changes | Menu items, groups, modifiers, or pricing changed |
| `stock_updated` | Inventory changes | Item stock status or quantity changes (86'd, restocked, quantity adjusted) |

## Setting Up Webhooks

### Prerequisites
1. You must have a publicly accessible HTTPS endpoint
2. Your endpoint must return a 200 status code within 5 seconds
3. You must be registered as a Toast integration partner or have custom integration access

### Registration
Webhook URLs are configured through the Toast developer portal during integration setup. You specify the URL Toast should send events to for each webhook type.

## Webhook Payload Format

### Order Updated Webhook

When an order is created or updated, Toast sends a POST request:

```json
{
  "webhookType": "ORDER_UPDATED",
  "restaurantGuid": "restaurant-guid-here",
  "orderGuid": "order-guid-here",
  "modifiedDate": "2026-02-18T15:30:00.000Z"
}
```

**Important:** The webhook payload contains only the order GUID and metadata — not the full order data. After receiving the webhook, fetch the full order details:

```
GET /orders/v2/orders/{orderGuid}
```

### Menu Updated Webhook

```json
{
  "webhookType": "MENU_UPDATED",
  "restaurantGuid": "restaurant-guid-here",
  "modifiedDate": "2026-02-18T12:00:00.000Z"
}
```

After receiving, fetch the updated menus:
```
GET /menus/v3/menus
```

### Stock Updated Webhook

```json
{
  "webhookType": "STOCK_UPDATED",
  "restaurantGuid": "restaurant-guid-here",
  "menuItemGuid": "item-guid-here",
  "status": "OUT_OF_STOCK",
  "quantity": null,
  "modifiedDate": "2026-02-18T16:45:00.000Z"
}
```

## Best Practices

### Reliability
- **Acknowledge quickly**: Return 200 within 5 seconds. Process the data asynchronously.
- **Idempotency**: You may receive duplicate webhook events. Design your handler to be idempotent.
- **Retry handling**: If your endpoint returns a non-200 status, Toast may retry the webhook.
- **Fallback polling**: If you miss a webhook, poll the relevant API as a fallback.

### Architecture Pattern
```
Toast Platform → Webhook POST → Your API Gateway → Message Queue → Worker Process → Database
```

1. Receive webhook, immediately return 200
2. Enqueue the event for async processing
3. Worker fetches full data from Toast API
4. Update your database/system

### Security
- Validate the `restaurantGuid` matches your expected restaurant
- Consider implementing HMAC signature validation if available
- Use HTTPS only — Toast will not send webhooks to HTTP endpoints
- Whitelist Toast IP ranges if possible

### Monitoring
- Log all incoming webhook events
- Alert on missed webhooks (compare webhook receipts with polling data)
- Monitor processing latency
- Track webhook failure rates
