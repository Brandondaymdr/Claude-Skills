# Toast Integration Cookbook

Step-by-step recipes for common Toast integration scenarios.

## Table of Contents
1. Daily Sales Export to Accounting
2. Employee/Payroll Sync
3. Real-Time Online Ordering
4. Inventory Sync with External System
5. Custom Reporting Dashboard
6. Multi-Location Data Aggregation

---

## 1. Daily Sales Export to Accounting

**Goal:** Pull daily sales data from Toast and format for import into QuickBooks, Xero, or similar.

### Steps

1. **Authenticate**
```python
import requests

auth_response = requests.post(
    "https://ws-api.toasttab.com/authentication/v1/authentication/login",
    json={
        "clientId": "YOUR_CLIENT_ID",
        "clientSecret": "YOUR_CLIENT_SECRET",
        "userAccessType": "TOAST_MACHINE_CLIENT"
    }
)
token = auth_response.json()["token"]["accessToken"]
headers = {
    "Authorization": f"Bearer {token}",
    "Toast-Restaurant-External-ID": "YOUR_RESTAURANT_GUID"
}
```

2. **Fetch orders for a business date**
```python
orders = []
page_token = None

while True:
    params = {"businessDate": "20260218"}
    if page_token:
        params["pageToken"] = page_token

    response = requests.get(
        "https://ws-api.toasttab.com/orders/v2/orders",
        headers=headers,
        params=params
    )
    data = response.json()
    orders.extend(data.get("orders", data if isinstance(data, list) else []))

    page_token = response.headers.get("Toast-Next-Page-Token")
    if not page_token:
        break
```

3. **Aggregate by category**
```python
summary = {
    "total_sales": 0,
    "total_tax": 0,
    "total_tips": 0,
    "total_discounts": 0,
    "payment_types": {}
}

for order in orders:
    for check in order.get("checks", []):
        summary["total_sales"] += check.get("totalAmount", 0)
        summary["total_tax"] += check.get("taxAmount", 0)

        for payment in check.get("payments", []):
            summary["total_tips"] += payment.get("tipAmount", 0)
            ptype = payment.get("type", "OTHER")
            summary["payment_types"][ptype] = (
                summary["payment_types"].get(ptype, 0) + payment.get("amount", 0)
            )
```

4. **Format for accounting system** — Map Toast categories to your chart of accounts.

### Schedule
Run this as a nightly job after the business day closes (typically after midnight).

---

## 2. Employee/Payroll Sync

**Goal:** Keep your payroll system in sync with Toast employee and timecard data.

### Steps

1. **Pull employee roster**
```python
employees = requests.get(
    "https://ws-api.toasttab.com/labor/v1/employees",
    headers=headers
).json()
```

2. **Pull time entries for pay period**
```python
time_entries = requests.get(
    "https://ws-api.toasttab.com/labor/v1/timeEntries",
    headers=headers,
    params={
        "startDate": "2026-02-01T00:00:00Z",
        "endDate": "2026-02-15T23:59:59Z"
    }
).json()
```

3. **Calculate hours per employee**
```python
from datetime import datetime

employee_hours = {}
for entry in time_entries:
    emp_guid = entry.get("employeeGuid")
    clock_in = datetime.fromisoformat(entry["inDate"])
    clock_out = datetime.fromisoformat(entry["outDate"]) if entry.get("outDate") else None

    if clock_out:
        hours = (clock_out - clock_in).total_seconds() / 3600
        # Subtract break time if present
        break_minutes = entry.get("breakMinutes", 0)
        hours -= break_minutes / 60

        employee_hours[emp_guid] = employee_hours.get(emp_guid, 0) + hours
```

4. **Export to payroll system** — Map employee GUIDs to payroll IDs and submit hours.

---

## 3. Real-Time Online Ordering

**Goal:** Build a custom ordering frontend that submits orders to Toast.

### Steps

1. **Fetch and display menus**
```python
menus = requests.get(
    "https://ws-api.toasttab.com/menus/v3/menus",
    headers=headers
).json()

# Build your frontend menu from this data
# Respect availability windows and stock status
```

2. **Check stock before displaying items**
```python
stock = requests.get(
    "https://ws-api.toasttab.com/stock/v1/inventory",
    headers=headers
).json()

out_of_stock_guids = {
    item["menuItemGuid"]
    for item in stock
    if item["status"] == "OUT_OF_STOCK"
}
```

3. **Check restaurant availability**
```python
availability = requests.get(
    "https://ws-api.toasttab.com/restaurant-availability/v1/availability",
    headers=headers
).json()

if availability["availability"] != "AVAILABLE":
    # Show "not accepting orders" message
    pass
```

4. **Submit the order**
```python
order_payload = {
    "entityType": "Order",
    "diningOption": {"guid": "takeout-dining-option-guid"},
    "checks": [{
        "entityType": "Check",
        "selections": [{
            "entityType": "MenuItemSelection",
            "item": {"guid": "menu-item-guid"},
            "quantity": 1,
            "modifiers": [{
                "entityType": "ModifierSelection",
                "item": {"guid": "modifier-guid"},
                "quantity": 1
            }]
        }],
        "customer": {
            "firstName": "John",
            "lastName": "Doe",
            "phone": "555-0123",
            "email": "john@example.com"
        }
    }]
}

new_order = requests.post(
    "https://ws-api.toasttab.com/orders/v2/orders",
    headers=headers,
    json=order_payload
).json()
```

5. **Listen for updates via webhook** — Subscribe to `order_updated` to track order status.

---

## 4. Inventory Sync with External System

**Goal:** Keep your external inventory management system in sync with Toast stock levels.

### Approach A: Webhook-Driven (Recommended)

1. Set up webhook endpoint for `stock_updated`
2. When webhook fires, update your inventory system
3. Periodically reconcile with full `GET /stock/v1/inventory` call

### Approach B: Push from External System to Toast

```python
# When your inventory system detects low stock:
stock_updates = [
    {
        "menuItemGuid": "item-guid",
        "status": "OUT_OF_STOCK"
    }
]

requests.post(
    "https://ws-api.toasttab.com/stock/v1/inventory/update",
    headers=headers,
    json=stock_updates
)
```

### Approach C: Bidirectional Sync

Combine both approaches:
1. Listen to Toast webhooks for POS-driven stock changes
2. Push updates from your system when you receive deliveries
3. Reconcile nightly with a full inventory pull

---

## 5. Custom Reporting Dashboard

**Goal:** Build a real-time dashboard showing key business metrics.

### Data Sources

```python
# Sales data
orders = fetch_orders_for_date(today)

# Labor data
time_entries = fetch_time_entries(today_start, today_end)

# Configuration (cache this — changes rarely)
revenue_centers = fetch_revenue_centers()
dining_options = fetch_dining_options()

# Restaurant info
restaurant = fetch_restaurant_info()
```

### Key Metrics to Calculate

- **Total sales**: Sum of all check totalAmounts
- **Average check size**: Total sales / number of checks
- **Sales by hour**: Group orders by openedDate hour
- **Sales by revenue center**: Group by order revenueCenter
- **Labor cost %**: (Total wages for hours worked) / Total sales × 100
- **Top selling items**: Count selections by item GUID, join with menu names
- **Payment mix**: Group payments by type

### Refresh Strategy
- Use `order_updated` webhook for near-real-time sales updates
- Poll labor time entries every 15 minutes
- Cache menu and configuration data, refresh on `menu_updated` webhook

---

## 6. Multi-Location Data Aggregation

**Goal:** Aggregate data across multiple restaurant locations.

### Steps

1. **Get all accessible locations**
```python
locations = requests.get(
    "https://ws-api.toasttab.com/partners/v1/restaurants",
    headers={"Authorization": f"Bearer {token}"}
).json()
```

2. **Query each location**
```python
all_orders = {}
for location in locations:
    loc_headers = {
        "Authorization": f"Bearer {token}",
        "Toast-Restaurant-External-ID": location["restaurantGuid"]
    }
    orders = fetch_orders(loc_headers, business_date)
    all_orders[location["restaurantName"]] = orders
```

3. **Aggregate and compare** — Build comparison reports across locations.

### Important Notes
- Each API call is scoped to a single location (via the `Toast-Restaurant-External-ID` header)
- You must loop through locations — there's no "all locations" endpoint for orders
- Be mindful of rate limits when querying many locations
- Consider parallelizing requests (with rate limit awareness)
