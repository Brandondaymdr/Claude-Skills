---
name: circle-so-api
description: >
  Expert-level Circle.so Admin API v2 skill for building automations, managing communities,
  members, spaces, posts, events, courses, and all platform features programmatically.
  Use this skill whenever the user mentions Circle.so API, Circle API, community API,
  building Circle automations, migrating data to/from Circle, managing a Circle community
  programmatically, or working with any Circle.so endpoints. Also trigger when the user
  wants to create, update, or manage spaces, members, posts, events, courses, access groups,
  forms, gamification, or any Circle.so resource via code or API calls. This skill is
  essential for Carla Gentile Yoga's Circle community (carlagentileyoga@circle.so) and any
  Circle.so community management tasks.
---

# Circle.so Admin API v2 — Expert Skill

You are an expert in the Circle.so Admin API v2. Your job is to help build automations,
integrations, migration scripts, and administrative tools for Circle.so communities —
particularly for yoga/wellness communities like Carla Gentile Yoga.

## Quick Orientation

Circle.so offers three API layers:

1. **Admin API v2** (this skill's focus) — For community admins to build automations, migrations, and admin integrations. Requests are admin-authenticated with an API token. Available on Business plan and above.
2. **Member API (Headless)** — For building member-facing experiences in external apps. Member-authenticated via JWT tokens.
3. **Data API** — For ETL integrations to data warehouses (Plus Platform plan only).

Always use Admin API **v2** — it's the current version. The v1 API is legacy and won't receive new features.

## Authentication

Every request requires two headers:

```
Authorization: Token YOUR_API_TOKEN
```

The API token is found in the Circle admin dashboard under **Settings → API**.

Base URL: `https://app.circle.so/api/admin/v2/`

## Pagination

Most list endpoints support pagination:
- `page` — Page number (defaults to 1)
- `per_page` — Items per page (defaults to 10, max varies by endpoint)

## Rate Limits

Circle enforces rate limits on API requests. If you hit a 429 response, back off and retry with exponential delay. Keep automations to reasonable request rates (~2-5 requests/second).

## Core Resource Reference

For the full endpoint reference organized by resource, read:
```
references/api-endpoints.md
```

For data model schemas (what each resource looks like), read:
```
references/data-models.md
```

For practical recipes and common automation patterns (especially for yoga/wellness communities), read:
```
references/recipes.md
```

## Resource Overview

The API covers these resource categories:

| Category | What You Can Do |
|----------|----------------|
| **Community** | Get/update community details and settings |
| **Members** | Invite, list, search, update, ban, deactivate, delete members |
| **Spaces** | Create, list, update, delete spaces; manage space members |
| **Space Groups** | Organize spaces into groups; manage group membership |
| **Posts** | Create, list, update, delete posts in spaces; manage image posts |
| **Comments** | Create, list, show, delete comments on posts |
| **Topics** | Create, list, update, delete discussion topics |
| **Events** | Create, list, update, delete, duplicate events; manage attendees |
| **Courses** | Create/manage course lessons and sections; track lesson progress |
| **Access Groups** | Create/manage access groups for gating content |
| **Forms** | Create, list, update, delete, duplicate forms; manage submissions |
| **Member Tags** | Create, list, update, delete tags; tag/untag members |
| **Gamification** | View leaderboard data |
| **Profile Fields** | List, archive, unarchive custom profile fields |
| **Invitation Links** | List, delete, revoke invitation links |
| **Flagged Content** | Report and list flagged content |
| **Advanced Search** | Search across community content |
| **Chat** | Update chat preferences |
| **Media** | Direct uploads, embeds, image posts |
| **AI Summaries** | Get AI-generated space summaries |
| **Segments** | Create, list, update, delete, duplicate community segments |
| **Paywall Groups** | Create, list, update, delete paywall groups for monetization |

## Writing API Code

When writing code that calls the Circle API:

1. **Always use v2 endpoints** — Path format: `/api/admin/v2/{resource}`
2. **Include both headers** — `Authorization: Token XXX`
3. **Handle pagination** — Loop through pages for list endpoints
4. **Handle errors gracefully** — Check for 401 (auth), 404 (not found), 422 (validation), 429 (rate limit)
5. **Use the TipTap body format** for rich text content in posts — Circle uses TipTap editor format
6. **IDs are integers** — Community, space, member, post IDs are all integers

## Common Patterns for Yoga Communities

Since this skill is tailored for managing yoga class communities, here are high-value patterns:

- **Auto-invite new students** → POST to `/community_members` with email and access group
- **Create class schedule events** → POST to `/events` with recurring yoga class details
- **Organize by class type** → Create spaces for "Vinyasa", "Yin", "Meditation", etc.
- **Gate premium content** → Use access groups + paywall groups for paid membership tiers
- **Track course progress** → Use course lessons API for yoga training programs
- **Welcome new members** → Combine member creation with automatic post in welcome space
- **Community engagement** → Use gamification leaderboard to track active members

Read `references/recipes.md` for complete code examples of these patterns.

## TipTap Body Format

Posts and comments use TipTap rich text format:

```json
{
  "tiptap_body": {
    "body": {
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "Welcome to today's yoga class!" }
          ]
        }
      ]
    }
  }
}
```

For plain text posts, you can often just use the `body` field with HTML or plain text, depending on the endpoint.

## Error Handling

| Status | Meaning | Action |
|--------|---------|--------|
| 200/201 | Success | Process response |
| 401 | Unauthorized | Check API token |
| 403 | Forbidden | Check permissions/plan |
| 404 | Not Found | Check resource ID |
| 422 | Validation Error | Check request body |
| 429 | Rate Limited | Back off, retry |
| 500 | Server Error | Retry after delay |
