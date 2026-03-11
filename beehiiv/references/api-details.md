# beehiiv API — Details & Reference

## Authentication

All requests require a Bearer token:
```
Authorization: Bearer YOUR_API_KEY
```

Create API keys at: **Settings → API → Create API Key** in your beehiiv dashboard.

---

## Base URL

```
https://api.beehiiv.com/v2
```

---

## Pagination

beehiiv uses cursor-based pagination.

Response includes:
```json
{
  "data": [...],
  "page": 1,
  "limit": 10,
  "total_results": 150,
  "next_page": 2
}
```

Pass `?page=2&limit=50` as query params. Max limit is typically 100 per request.

---

## Rate Limiting

- beehiiv enforces rate limits per API key
- If you hit a rate limit, you'll receive a `429 Too Many Requests` response
- Include exponential backoff in your code for batch operations
- Check response headers for `X-RateLimit-Remaining` and `X-RateLimit-Reset`

---

## Key Endpoints

### Publications
```
GET /publications
GET /publications/{publication_id}
```

### Posts
```
GET  /publications/{id}/posts
GET  /publications/{id}/posts/{post_id}
POST /publications/{id}/posts
PUT  /publications/{id}/posts/{post_id}
```

**Create Post body:**
```json
{
  "status": "draft",
  "send_at": null,
  "subject": "Your Newsletter Title",
  "preview_text": "Preview snippet...",
  "content_json": { ... },
  "content_html": "<html>...</html>",
  "audience": "free",
  "email_capture_disabled": false
}
```

### Subscriptions (Subscribers)
```
GET    /publications/{id}/subscriptions
POST   /publications/{id}/subscriptions
GET    /publications/{id}/subscriptions/{subscription_id}
PATCH  /publications/{id}/subscriptions/{subscription_id}
DELETE /publications/{id}/subscriptions/{subscription_id}
```

**Add Subscriber body:**
```json
{
  "email": "user@example.com",
  "reactivate_existing": true,
  "send_welcome_email": true,
  "utm_source": "activecampaign_migration",
  "utm_medium": "import",
  "custom_fields": [
    { "name": "first_name", "value": "Jane" }
  ]
}
```

### Custom Fields
```
GET  /publications/{id}/custom_fields
POST /publications/{id}/custom_fields
```

### Segments
```
GET /publications/{id}/segments
GET /publications/{id}/segments/{segment_id}
```

### Automations
```
GET /publications/{id}/automations
GET /publications/{id}/automations/{automation_id}
```
Note: Automation enrollment is done via the dashboard, not API.

### Webhooks
beehiiv supports webhooks for:
- `post.sent` — a post was sent
- `subscription.created` — new subscriber
- `subscription.updated` — subscriber status changed
- `survey.submitted` — survey response received

Configure at: Settings → Integrations → Webhooks

---

## Bulk Import via API

For large migrations (like from ActiveCampaign), use the Bulk Subscriptions endpoint:
```
POST /publications/{id}/bulk_subscriptions
```

Send an array of subscriber objects. Poll for completion status.

---

## OpenAPI Specification

Download the full spec for use in tools like Postman or Insomnia:
```
https://files.buildwithfern.com/.../beehiiv-API-Specification.yaml
```

Full docs: https://developers.beehiiv.com/api-reference
