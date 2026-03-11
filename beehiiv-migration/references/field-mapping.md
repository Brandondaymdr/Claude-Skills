# Field Mapping: ActiveCampaign → beehiiv

## Standard Fields

| ActiveCampaign Field | beehiiv Field | Notes |
|---------------------|---------------|-------|
| Email | Email | Required, maps automatically |
| First Name | First Name | Standard field in beehiiv |
| Last Name | Last Name | Standard field in beehiiv |
| Phone | Custom Field: Phone | Create as text custom field |

## Custom Fields to Create in beehiiv First

Before importing, go to beehiiv **Settings → Custom Fields** and create:

| Field Name | Type | Notes |
|---|---|---|
| First Name | Text | If not already default |
| Last Name | Text | If not already default |
| AC Migration Tier | Text | Values: tier1, tier2, tier3 — useful for future segmentation |
| AC Import Date | Date | Set to import date for tracking |

## Tags

AC tags do not import automatically. Options:
1. Include a Tags column in your CSV and map to a beehiiv custom field
2. After import, use beehiiv Segments to recreate tag-based groupings
3. Use the UTM medium field to identify tier at import time (recommended — already in SKILL.md)

## UTM Parameters to Set at Import

These help you track migration performance in beehiiv analytics:

| Tier | utm_source | utm_medium | utm_campaign |
|------|-----------|------------|--------------|
| Tier 1 | activecampaign | import_tier1 | migration_2026 |
| Tier 2 | activecampaign | import_tier2 | migration_2026 |
| Tier 3 | activecampaign | import_tier3 | migration_2026 |
