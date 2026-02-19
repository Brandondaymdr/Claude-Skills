---
name: toast-admin
description: >
  Expert Toast POS administration and daily operations for cafe/bar owners. Use whenever the user
  asks about Toast POS, Toast Web, menus, employees, reports, orders, online ordering, payments,
  tips, kitchen ops, or any cafe/bar management task on Toast. Trigger on: Toast, Toast POS,
  Toast Web, ToastTab, menu management, happy hour, tab management, Toast reporting, Toast
  employees, Toast scheduling, Toast inventory, Toast online ordering, cafe operations, bar
  management, or restaurant ops on Toast. For API/code tasks, use toast-api instead.
---

# Toast POS Admin & Operations

## Overview

This skill makes you an expert guide for managing a cafe, bar, or restaurant on the Toast POS platform. You can help with everything from day-to-day operations (opening/closing, taking orders, managing tabs) to back-office configuration (menus, employees, reports, payments) through Toast Web.

Toast is a cloud-based restaurant management platform used by 85,000+ restaurants. The core components are:

- **Toast POS app** — the point-of-sale terminals and handhelds (Toast Go) used by staff on the floor
- **Toast Web** — the admin backend at `https://pos.toasttab.com` where owners/managers configure menus, employees, reports, and settings
- **Toast Central** — the help/training portal at `https://central.toasttab.com`

When helping users, always orient them to *where* in Toast Web or the POS app to find what they need. Be specific about navigation paths (e.g., "In Toast Web, go to **Menu Management > Menus**").

## Quick Navigation Guide

Toast Web is organized into these main sections (accessible from the left sidebar after login at pos.toasttab.com):

| Section | What It Does |
|---------|-------------|
| **Home / Dashboard** | Overview of sales, orders, and key metrics |
| **Orders** | View and manage current and past orders |
| **Menu Management** | Create and edit menus, menu groups, items, modifiers |
| **Online Ordering** | Configure takeout/delivery settings and schedules |
| **Reporting** | Sales reports, product mix, labor costs, analytics |
| **Employees** | Add/edit staff, set roles and permissions, manage schedules |
| **Payments** | Configure payment types, service charges, tips, taxes |
| **Kitchen** | Set up prep stations, routing rules, KDS displays |
| **Marketing** | Loyalty programs, email campaigns, guest data |
| **Setup** | General restaurant configuration, dining options, revenue centers |

## Core Operations

### 1. Menu Management

Menus in Toast follow a hierarchy: **Menu → Menu Group → Menu Item → Modifier Group → Modifier**

**Setting up or editing menus:**
- In Toast Web: **Menu Management > Menus**
- Create a new menu (e.g., "Drinks Menu", "Food Menu", "Happy Hour")
- Add **Menu Groups** within each menu (e.g., "Cocktails", "Beer", "Wine", "Espresso Drinks")
- Add **Menu Items** to each group with name, price, description, and images
- Add **Modifier Groups** for customization (e.g., "Milk Options", "Size", "Add-ons")

**Key menu features for cafes/bars:**
- **Time-specific menus** — set menus to appear only during certain hours (happy hour pricing, brunch menu, late-night menu)
- **Menu item availability** — mark items as 86'd (out of stock) from the POS or Toast Web
- **Pricing by size/variant** — use Size Pricing or modifiers with price adjustments
- **Online vs. in-store menus** — configure which items appear for online ordering vs. dine-in separately

**Publishing changes:**
After making menu changes in Toast Web, you must **publish** them for changes to appear on POS devices. Go to **Menu Management > Publishing** or use the "Publish" button. Changes to online ordering menus publish to the web automatically, but POS changes require a manual publish.

### 2. Order Management

**Taking orders at the POS:**
- Tap items from the menu to add to an order
- Use the **Quick Order** screen for common items
- Apply **dining options** (Dine In, Takeout, Delivery) to route correctly
- Split checks by seat, item, or custom split

**Managing bar tabs:**
- Open a tab by swiping or holding a credit card
- Add items to an open tab throughout the visit
- Pre-authorize cards to hold a tab
- Close tabs and apply tips at the end

**Online orders:**
- Online orders appear in **Orders Hub** (Toast Web: **Orders**)
- Configure online ordering hours in **Online Ordering > Schedules**
- Set prep times, throttling (max orders per time window), and delivery zones
- Orders can auto-fire to the kitchen or require manual acceptance

**Voids and comps:**
- Void items before they're sent to kitchen (no manager approval needed by default)
- Void items after send or entire checks requires appropriate permissions
- Apply comps/discounts from pre-configured options

### 3. Employee Management

**Adding employees:**
- Toast Web: **Employees > Employees > Add Employee**
- Set name, email, phone, hire date
- Assign **Jobs** (bartender, server, host, manager, etc.)
- Each job has associated **Wage** and **Permissions**

**Access permissions:**
- Permissions control what employees can see and do
- Key permission levels: Employee, Manager, Restaurant Admin
- Restaurant Admin can access Toast Web and all settings
- Set POS-level permissions (void authority, discount authority, cash drawer access)

**Scheduling and labor:**
- Use Toast's built-in scheduling or integrate with third-party scheduling tools
- View labor costs in real-time through the **Labor** section of reporting
- Employees clock in/out on the POS device
- Manage shift swaps and availability

**Tips and payroll:**
- Configure tip pooling or individual tip tracking
- Set auto-gratuity rules (e.g., parties of 6+)
- Tip reports available in **Reporting > Tips**
- Export payroll data or integrate with payroll providers

### 4. Reporting & Analytics

Toast provides powerful reporting through Toast Web: **Reporting**

**Key reports for cafe/bar owners:**
- **Sales Summary** — total sales, check count, average check size, by day/week/month
- **Product Mix** — which items sell most, revenue by menu category, helps optimize your menu
- **Labor Summary** — labor cost %, hours worked, overtime, by employee or job
- **Payment Summary** — breakdown by payment type (credit, cash, gift card)
- **Hourly Sales** — identify peak hours and slow periods for staffing
- **Server Sales** — performance by employee
- **Discount Report** — track comp/discount usage
- **Void Report** — monitor void frequency and reasons

**Using reports effectively:**
- Compare periods (this week vs. last week, this month vs. same month last year)
- Filter by revenue center, dining option, or time period
- Export reports to CSV/Excel for further analysis
- Set up **nightly email reports** to receive key metrics automatically

**Analytics (ERA) dashboard:**
- More advanced analytics available if you have Analytics API access
- Track trends over time, identify patterns, and benchmark performance

### 5. Payments & Money

**Payment configuration:**
- Toast Web: **Setup > Payment**
- Configure accepted payment types (credit, debit, cash, gift cards, Apple Pay, etc.)
- Set up **service charges** (auto-gratuity, room charges, delivery fees)
- Configure **tax rates** by item type or location

**Cash management:**
- Track cash drawer opens, pay-ins, and pay-outs
- Run **cash drawer reports** to reconcile at end of shift
- Configure expected starting cash amounts

**Tips:**
- Configure tip suggestions (percentage or dollar amounts) on customer-facing display
- Set tip pooling rules
- Manage tip-out from servers to support staff

### 6. Kitchen Operations

**Prep stations and routing:**
- Toast Web: **Kitchen > Prep Stations**
- Route items to the correct station (bar, kitchen, expo, etc.)
- Items route based on menu item configuration
- Use **Kitchen Display System (KDS)** for paperless ticket management

**For bars specifically:**
- Set up a dedicated **Bar** prep station
- Route drink orders directly to bar printers or bar KDS
- Configure **coursing** if you serve food and drinks in courses

### 7. Online Ordering & Off-Premise

**Setting up online ordering:**
- Toast Web: **Online Ordering**
- Configure your online ordering page (menu, hours, branding)
- Set ordering schedules (different from dine-in hours if needed)
- Configure **prep time estimates** and **throttling** to manage volume
- Set up **delivery zones** and delivery fees (if applicable)

**Toast TakeOut app:**
- Customers can order through the Toast TakeOut mobile app
- Orders appear alongside in-house orders
- No commission fees — flat monthly rate

### 8. Guest Management & Marketing

**Guest data:**
- Toast tracks guest information from online orders and loyalty signups
- View guest profiles, order history, and preferences
- Toast Web: **Guests**

**Loyalty programs:**
- Configure points-based or visit-based loyalty
- Set reward tiers and redemption rules
- Guests can check loyalty status through online ordering

**Email marketing:**
- Send targeted campaigns to your guest database
- Promote specials, events, and new menu items

## Common Cafe/Bar Scenarios

### Setting up Happy Hour
1. Go to **Menu Management > Menus**
2. Create a new menu called "Happy Hour" (or duplicate your regular menu and adjust prices)
3. Set **Availability** to your happy hour days/times (e.g., Mon-Fri 4-7pm)
4. Adjust prices on the items included in happy hour
5. Publish the menu

### Managing a Busy Bar Night
- Use **Toast Go** handhelds for tableside ordering
- Pre-authorize credit cards for tabs
- Set up **quick order** buttons for high-volume items
- Use KDS at the bar for ticket management
- Enable **auto-close tabs** at a set time if needed

### Running End-of-Day
1. Close all open tabs/checks
2. Run the **Close Out** process on each POS terminal
3. Review the **Daily Sales Summary** in Toast Web Reporting
4. Reconcile cash drawers
5. Review voids, comps, and discounts
6. Check **labor summary** for the day

### Dealing with 86'd Items
- On the POS: long-press the item > Mark as 86'd (out of stock)
- In Toast Web: **Menu Management > find item > toggle availability**
- Item will appear greyed out on POS and hidden from online ordering
- Reset availability when item is back in stock

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Menu changes not showing on POS | Publish changes: Menu Management > Publishing |
| Employee can't log in to POS | Check their PIN is set and job has POS access permission |
| Online orders not coming through | Check Online Ordering schedules and that location is set to "accepting orders" |
| Can't void an item | Check if the employee's job has void permissions |
| Reports showing $0 | Check date range filter and selected revenue center |
| Kitchen not receiving tickets | Check prep station routing and that the station is enabled |
| Credit card reader not working | Restart the terminal; check network connection; contact Toast support |

## Getting Help

- **Toast Central** (training & help): `https://central.toasttab.com`
- **Toast Support**: Available 24/7 — call from Toast Web or the POS app
- **Platform Guide** (technical docs): `https://doc.toasttab.com/doc/platformguide/`
- **Toast Community**: Forums for restaurant owners using Toast

## Resources

### references/

For deeper dives, consult:
- `references/toast-web-navigation.md` — Detailed Toast Web navigation paths for every setting
- `references/toast-api-quick-ref.md` — Quick reference if you need to cross over into API territory
- `references/cafe-bar-playbook.md` — Tactical playbook for common cafe/bar operations on Toast
