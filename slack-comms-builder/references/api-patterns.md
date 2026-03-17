# Slack API Patterns Reference

How Slack organizes its API surface, and patterns to follow when building your own messaging API.

## Table of Contents

1. [Method Families](#method-families)
2. [Request/Response Conventions](#requestresponse-conventions)
3. [Error Handling](#error-handling)
4. [Authentication](#authentication)
5. [Pagination](#pagination)
6. [Rate Limiting Tiers](#rate-limiting-tiers)

---

## Method Families

Slack organizes 200+ API methods into semantic families using dot-notation: `family.action` or `family.resource.action`. This is an RPC-style API, not REST.

### Core Families for a Messaging App

| Family | Purpose | Key Methods |
|--------|---------|-------------|
| `chat.*` | Message CRUD | `postMessage`, `update`, `delete`, `postEphemeral` |
| `conversations.*` | Channel/DM management | `create`, `list`, `info`, `members`, `history`, `replies`, `join`, `leave`, `archive` |
| `users.*` | User data | `list`, `info`, `getPresence`, `setPresence` |
| `reactions.*` | Emoji reactions | `add`, `remove`, `list`, `get` |
| `files.*` | File operations | `upload`, `list`, `info`, `delete`, `sharedPublicURL` |
| `pins.*` | Pinned messages | `add`, `remove`, `list` |
| `search.*` | Message search | `messages`, `files`, `all` |

### Naming Convention

The pattern `resource.action` makes APIs self-documenting:
- `chat.postMessage` — post a message to chat
- `conversations.history` — get history of a conversation
- `reactions.add` — add a reaction

For your own API, follow this convention. It's more intuitive than REST paths for messaging operations where the relationships are complex.

---

## Request/Response Conventions

### Every Response Has `ok`

All Slack API responses include a top-level boolean `ok` field:

```json
// Success
{ "ok": true, "channel": "C123", "ts": "1234567890.123456", "message": {...} }

// Error
{ "ok": false, "error": "channel_not_found" }
```

This is a much better pattern than relying on HTTP status codes alone. Adopt it.

### Request Formats

Slack accepts:
- GET with query parameters
- POST with `application/x-www-form-urlencoded`
- POST with `application/json`

For your own API: standardize on JSON request/response bodies. Simpler for everyone.

### Message Timestamps as IDs

Slack uses the `ts` (timestamp) field as a message identifier within a channel. It's a string like `"1234567890.123456"` — seconds since epoch with microsecond precision.

For your own system, prefer UUIDs. They're globally unique without needing a channel context, work better with ORMs and frontend state management, and don't have precision/collision concerns.

---

## Error Handling

### Error Response Structure

```json
{
  "ok": false,
  "error": "channel_not_found",
  "response_metadata": {
    "warnings": ["missing_charset"]
  }
}
```

### Common Error Codes to Implement

| Error | Meaning | Your equivalent |
|-------|---------|----------------|
| `channel_not_found` | Channel doesn't exist or user lacks access | Return 404 or empty result via RLS |
| `not_in_channel` | User isn't a member | RLS handles this automatically |
| `message_not_found` | Message doesn't exist | 404 |
| `cant_update_message` | Not the author | RLS `update` policy |
| `already_reacted` | Duplicate reaction | Unique constraint violation |
| `too_many_attachments` | File limit exceeded | Custom validation |
| `rate_limited` | Too many requests | 429 + Retry-After header |

### Warnings vs Errors

Slack returns warnings for non-fatal issues (deprecated parameters, missing charset). For a small-team tool, you don't need this — just errors.

---

## Authentication

### Slack's Token Types

| Token | Prefix | Purpose |
|-------|--------|---------|
| Bot token | `xoxb-` | App identity, most API calls |
| User token | `xoxp-` | Individual user actions |
| App token | `xapp-` | Socket Mode connections |

### For Your App

If you're using Supabase Auth, you already have JWT-based authentication. The token goes in the Authorization header, and Supabase handles user identification via `auth.uid()` in RLS policies. No need to implement a separate token system.

Key security rules:
- All API calls over HTTPS (TLS 1.2+)
- Never accept tokens in query parameters (they leak in server logs and browser history)
- Token in `Authorization: Bearer <token>` header only
- Validate the token on every request (Supabase does this automatically)

---

## Pagination

### Cursor-Based (Slack's Approach)

Slack uses cursor-based pagination for all list endpoints:

```json
{
  "ok": true,
  "messages": [...],
  "has_more": true,
  "response_metadata": {
    "next_cursor": "dXNlcjpVMDYxTkZUVDI="
  }
}
```

Next page: include `cursor=dXNlcjpVMDYxTkZUVDI=` in the request.

### Why Cursor > Offset

For a messaging app, cursor pagination is essential:
- **Offset breaks with new data**: If 5 messages arrive while paginating, offset shifts and you get duplicates
- **Cursor is stable**: "Messages before this timestamp" always returns the right window
- **Performance**: Offset-based queries get slower as offset increases (Postgres has to skip rows)

### Implementation Pattern

Use `created_at` as your cursor for message history:

```
GET /api/channels/:id/messages?before=2026-03-14T10:00:00Z&limit=50
```

Response:
```json
{
  "ok": true,
  "messages": [...],
  "has_more": true,
  "next_cursor": "2026-03-14T09:45:00Z"
}
```

---

## Rate Limiting Tiers

### Slack's System

| Tier | Rate | Used For |
|------|------|----------|
| Tier 1 | 1/min | Infrequent admin ops |
| Tier 2 | 20/min | Most methods |
| Tier 3 | 50/min | Paginated collection reads |
| Tier 4 | 100/min | High-frequency reads |
| Special | 1/sec/channel | `chat.postMessage` |

### Rate Limit Response

```
HTTP/1.1 429 Too Many Requests
Retry-After: 30
```

### For a Small Company Tool

You probably don't need four tiers. A simple approach:
- **Message posting**: 1/second per user per channel (prevents spam)
- **General API**: 60/minute per user (covers most use cases)
- **File uploads**: 20/hour per user (prevents storage abuse)
- **Search**: 10/minute per user (search is expensive)

Implement with a simple token bucket or sliding window counter in Redis or in-memory. For very small teams (< 20 users), you might not need rate limiting at all initially — but add it before you regret it.
