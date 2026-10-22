# Checklist — Shopify, n8n and e-commerce integrations

- [ ] Shopify webhooks verify `X-Shopify-Hmac-Sha256` over the raw body.
- [ ] Shopify custom-app tokens carry only the scopes used; rotate any older than a year.
- [ ] Every n8n webhook that triggers a write requires header auth.
- [ ] n8n instance behind login, on the current release (it has had critical CVEs), with
      its encryption key backed up outside the instance.
- [ ] Airtable / third-party tokens scoped to the single base or resource they need.
- [ ] Prices, discounts and inventory read from the platform API, never from client input.
- [ ] Admin tokens absent from theme code, storefront JS and committed config.
