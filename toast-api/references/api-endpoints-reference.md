# Toast API Endpoints Reference

Complete reference for all Toast REST API endpoints with request/response patterns.

Base URL: `https://ws-api.toasttab.com`

Required Headers (all requests):
```
Authorization: Bearer <token>
Toast-Restaurant-External-ID: <restaurant-GUID>
Content-Type: application/json
```

---

## Table of Contents
1. Authentication
2. Orders API
3. Menus API
4. Configuration API
5. Labor API
6. Stock API
7. Analytics (ERA) API
8. Restaurants API
9. Restaurant Availability API
10. Cash Management API
11. Partners API
12. Kitchen API
13. Order Management Config API
14. Packaging Config API

---

## 1. Authentication

### Login
```
POST /authentication/v1/authentication/login

Request:
{
  "clientId": "string",
  "clientSecret": "string",
  "userAccessType": "TOAST_MACHINE_CLIENT"
}

Response:
{
  "token": {
    "tokenType": "Bearer",
    "scope": "string",
    "expiresIn": 3600,
    "accessToken": "string"
  },
  "status": "SUCCESS"
}
```

Token expires after the time indicated by `expiresIn` (typically 1 hour). Refresh by re-authenticating.

---

## 2. Orders API

### Get Orders
```
GET /orders/v2/orders?businessDate=YYYYMMDD

Query Parameters:
- businessDate (string): Business date in YYYYMMDD format
- startDate (string): ISO 8601 start datetime
- endDate (string): ISO 8601 end datetime
- pageToken (string): Token for pagination
- pageSize (integer): Results per page (default varies)

Response: Array of Order objects
```

### Get Order by GUID
```
GET /orders/v2/orders/{orderGuid}

Response: Single Order object
```

### Create Order
```
POST /orders/v2/orders

Request body: Order object with:
- diningOption (object): { guid: "dining-option-guid" }
- checks (array): Array of Check objects
  - selections (array): Menu items being ordered
    - item (object): { guid: "menu-item-guid" }
    - quantity (integer)
    - modifiers (array): Applied modifiers

Response: Created Order object with assigned GUIDs
```

### Update Order
```
PATCH /orders/v2/orders/{orderGuid}

Request body: Partial Order object with fields to update

Response: Updated Order object
```

### Order Object Key Fields
```json
{
  "guid": "order-guid",
  "entityType": "Order",
  "externalId": "optional-external-reference",
  "openedDate": "ISO-8601-datetime",
  "modifiedDate": "ISO-8601-datetime",
  "promisedDate": "ISO-8601-datetime",
  "diningOption": { "guid": "dining-option-guid" },
  "checks": [
    {
      "guid": "check-guid",
      "entityType": "Check",
      "openedDate": "ISO-8601-datetime",
      "selections": [
        {
          "guid": "selection-guid",
          "item": { "guid": "menu-item-guid" },
          "quantity": 1,
          "unitOfMeasure": "NONE",
          "preDiscountPrice": 12.99,
          "price": 12.99,
          "tax": 1.04,
          "modifiers": []
        }
      ],
      "payments": [
        {
          "guid": "payment-guid",
          "type": "CREDIT",
          "amount": 14.03,
          "tipAmount": 2.80
        }
      ],
      "totalAmount": 14.03,
      "taxAmount": 1.04,
      "netAmount": 12.99
    }
  ],
  "revenueCenter": { "guid": "revenue-center-guid" },
  "server": { "guid": "employee-guid" }
}
```

---

## 3. Menus API

### Get Menus (V2)
```
GET /menus/v2/menus

Response: Array of Menu objects with full hierarchy
```

### Get Menu Metadata (V2)
```
GET /menus/v2/metadata

Response:
{
  "lastUpdated": "ISO-8601-datetime"
}
```
Use this to check if menus have changed before fetching the full menu payload.

### Menu Object Key Fields
```json
{
  "guid": "menu-guid",
  "name": "Drinks Menu",
  "description": "All beverages",
  "availability": {
    "alwaysAvailable": false,
    "timeOfDayAvailability": {
      "monday": [{ "startTime": "16:00", "endTime": "19:00" }]
    }
  },
  "menuGroups": [
    {
      "guid": "group-guid",
      "name": "Cocktails",
      "menuItems": [
        {
          "guid": "item-guid",
          "name": "Margarita",
          "price": 14.00,
          "description": "Classic lime margarita",
          "modifierGroups": [
            {
              "guid": "mod-group-guid",
              "name": "Spirit",
              "modifiers": [
                { "guid": "mod-guid", "name": "Patron", "priceAdjustment": 3.00 }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 4. Configuration API

### Get Revenue Centers
```
GET /config/v2/revenueCenters

Response: Array of RevenueCenterConfig objects
[{ "guid": "rc-guid", "name": "Bar", "description": "Bar area" }]
```

### Get Dining Options
```
GET /config/v2/diningOptions

Response: Array of DiningOptionConfig objects
[{ "guid": "do-guid", "name": "Dine In", "behavior": "DINE_IN" }]
```

### Get Alternate Payment Types
```
GET /config/v2/alternatePaymentTypes

Response: Array of payment type configurations
```

### Get Service Charges
```
GET /config/v2/serviceCharges

Response: Array of ServiceChargeConfig objects
```

---

## 5. Labor API

### Get All Employees
```
GET /labor/v1/employees

Response: Array of Employee objects
```

### Get Employee by GUID
```
GET /labor/v1/employees/{employeeGuid}
```

### Create Employee
```
POST /labor/v1/employees

Request:
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phoneNumber": "555-0123",
  "externalEmployeeId": "EMP-001",
  "jobReferences": [
    { "guid": "job-guid", "wage": 15.00 }
  ]
}
```

### Update Employee
```
PUT /labor/v1/employees/{employeeGuid}

Request: Full Employee object with updates
```

### Delete Employee
```
DELETE /labor/v1/employees/{employeeGuid}
```

### Get Jobs
```
GET /labor/v1/jobs

Response: Array of Job objects with title, wage info, permissions
```

### Get Time Entries
```
GET /labor/v1/timeEntries?startDate=ISO8601&endDate=ISO8601

Response: Array of TimeEntry objects with clock-in/out times, breaks, job info
```

### Get Shifts
```
GET /labor/v1/shifts?startDate=ISO8601&endDate=ISO8601

Response: Array of scheduled Shift objects
```

---

## 6. Stock API

### Get Inventory
```
GET /stock/v1/inventory

Response: Array of stock status objects
[{
  "menuItemGuid": "item-guid",
  "status": "IN_STOCK" | "OUT_OF_STOCK" | "QUANTITY",
  "quantity": 25.0
}]
```

### Update Inventory
```
POST /stock/v1/inventory/update

Request: Array of stock updates
[{
  "menuItemGuid": "item-guid",
  "status": "OUT_OF_STOCK"
}]
```

or with quantity:
```json
[{
  "menuItemGuid": "item-guid",
  "status": "QUANTITY",
  "quantity": 10.0
}]
```

---

## 7. Analytics (ERA) API

### Query Analytics Data
```
POST /era/v1/reports

Request varies by report type. Requires Analytics API access level.
```

Refer to the full API reference at `https://toastintegrations.redoc.ly/` for ERA-specific query formats and available report types.

---

## 8. Restaurants API

### Get Restaurant Info
```
GET /restaurants/v1/restaurants/{restaurantGuid}

Response:
{
  "guid": "restaurant-guid",
  "name": "My Cafe & Bar",
  "location": {
    "address1": "123 Main St",
    "city": "Portland",
    "stateCode": "OR",
    "zipCode": "97201"
  },
  "schedules": [...],
  "generalInfo": {
    "timeZone": "America/Los_Angeles",
    "phone": "555-0100"
  }
}
```

---

## 9. Restaurant Availability API

### Check Availability
```
GET /restaurant-availability/v1/availability

Response:
{
  "availability": "AVAILABLE" | "UNAVAILABLE",
  "reasons": []
}
```

---

## 10. Cash Management API

### Get Cash Entries
```
GET /cashmgmt/v1/entries?businessDate=YYYYMMDD

Response: Array of cash event objects (pay-ins, pay-outs, drawer opens)
```

---

## 11. Partners API

### List Accessible Restaurants
```
GET /partners/v1/restaurants

Response: Array of restaurant location objects your API client has access to
[{
  "restaurantGuid": "guid",
  "managementGroupGuid": "guid",
  "restaurantName": "My Cafe"
}]
```

---

## 12. Kitchen API

### Get Prep Stations
```
GET /kitchen/v1/prepStations

Response: Array of prep station configurations
```

---

## 13. Order Management Config API

### Get Online Ordering Schedules
```
GET /ordermgmt-config/v1/orderingSchedules

Response: Online ordering schedule configuration
```

---

## 14. Packaging Config API

### Get Packaging Preferences
```
GET /packaging/v1/packagingPreferences

Response: Packaging configuration for the location
```

---

## Pagination

For endpoints returning large datasets, use the `pageToken` pattern:

1. First request: `GET /orders/v2/orders?businessDate=20260218`
2. Response includes a `pageToken` if more results exist
3. Next request: `GET /orders/v2/orders?businessDate=20260218&pageToken=<token>`
4. Repeat until no `pageToken` is returned

---

## Full API Reference

For complete request/response schemas, see:
- Interactive API Reference: `https://toastintegrations.redoc.ly/`
- Developer Guide: `https://doc.toasttab.com/doc/devguide/`
