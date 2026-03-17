---
name: slack-comms-builder
description: >
  Comprehensive guide for building a small-company internal messaging app modeled on Slack's core architecture — channels, DMs, threads, reactions, presence, and realtime delivery. Use this skill whenever building, designing, or debugging a Slack-like communication tool, implementing realtime chat features with WebSockets, designing channel/DM/thread data models, building message feeds or composers, implementing presence tracking, adding emoji reactions, handling file attachments in chat, designing unread counts or read receipts, building @mention systems, or architecting any internal team messaging feature. Also trigger when the user mentions "comms", "chat app", "messaging", "channels", "threads", "DMs", "Slack clone", "team communication", or any internal messaging tool development. Even if the user just says "add messaging" or "build a chat feature" — if it involves team communication, use this skill.
---

# Slack Comms Builder

A practical guide for building the essential features of a Slack-style internal messaging tool for small companies. This isn't about integrating with Slack's API — it's about understanding how Slack works architecturally so you can build your own lean, focused version.

The goal: channels, DMs, threads, reactions, presence, and realtime delivery. No bloat.

## When to use this skill

Read this skill before implementing any of these features:

- Channel-based messaging (public, private, workspace-scoped)
- Direct messages (1:1 and group)
- Threaded replies on messages
- Emoji reactions
- User presence / online indicators
- Realtime message delivery via WebSockets
- Unread counts and read receipts
- File attachments on messages
- @mentions and notifications
- Message search
- Context links (linking messages to external entities like invoices, tasks, etc.)

For deeper API method patterns and data structures, see the reference files in `references/`.

---

## Core Architecture

### The Data Model

Slack's messaging architecture revolves around five core entities. Every Slack-like system needs these:

**Workspaces** — The top-level container. For a small company with multiple business entities (like a parent company with subsidiaries), each entity maps to a workspace. Users can belong to multiple workspaces. Think of these as the organizational boundary for permissions.

**Channels** — Named conversation containers within a workspace. Channels are either public (visible to all workspace members) or private (invite-only). Channel names should be lowercase, hyphenated, no spaces — enforced client-side. Every workspace needs a `#general` equivalent.

**Messages** — The atomic unit. A message belongs to exactly one channel OR one direct conversation (never both — enforce this with a database check constraint). Messages carry text content, optional structured blocks, and optional metadata linking to external entities. Slack identifies messages by their timestamp (`ts`), which serves as a unique ID within a channel context. For your own system, UUIDs are simpler and avoid the timestamp-collision edge cases.

**Threads** — A thread is just a message with children. The parent message has `parent_id = null`, and replies point their `parent_id` to the parent's ID. Slack uses `thread_ts` to identify the parent, then `conversations.replies` to fetch the thread. The key UX decision: do thread replies appear in the main channel feed, or only in a slide-out panel? Slack defaults to panel-only but offers `reply_broadcast` to echo a reply into the channel. For a small team tool, the slide-out panel keeps the main feed clean.

**Direct Conversations** — DMs are conversations between 2+ specific users, not scoped to a channel. They need a separate table (`direct_conversations` + `dm_participants`) rather than being modeled as "private channels with 2 members." This distinction matters because DMs don't have names, don't belong to a workspace's channel list, and have different permission semantics.

### Entity Relationship Summary

```
workspace
  └── channels (many)
        └── messages (many)
              ├── thread replies (self-referencing via parent_id)
              ├── reactions (many)
              └── attachments (many)

direct_conversation
  ├── participants (many-to-many with users)
  └── messages (many)
        ├── thread replies
        ├── reactions
        └── attachments

user
  ├── workspace_memberships (many)
  ├── channel messages (many)
  ├── dm participations (many)
  └── read_receipts (per channel)
```

---

## Messaging Patterns

### Message Structure

Every message needs these fields at minimum:

| Field | Purpose |
|-------|---------|
| `id` | Unique identifier (UUID) |
| `channel_id` | Which channel (null for DMs) |
| `dm_id` | Which DM conversation (null for channel messages) |
| `parent_id` | Thread parent (null for top-level messages) |
| `user_id` | Who sent it |
| `content` | Text body |
| `edited_at` | Timestamp if edited (null otherwise) |
| `is_deleted` | Soft delete flag — never hard delete messages |
| `context_ref` | Optional JSON linking to external entities |
| `created_at` | When sent |

The `channel_id` / `dm_id` mutual exclusion is important — enforce it with a check constraint:
```sql
check (
  (channel_id is not null and dm_id is null) or
  (channel_id is null and dm_id is not null)
)
```

### Text Formatting

Slack uses a lightweight markdown variant. For a small-team tool, support at minimum:
- Bold: `*text*`
- Italic: `_text_`
- Strikethrough: `~text~`
- Inline code: backtick-wrapped
- Code blocks: triple-backtick
- User mentions: `@username` parsed to user ID references
- Channel references: `#channel-name` parsed to channel ID links

### Soft Deletes

Never hard-delete messages. Set `is_deleted = true` and render deleted messages as "[This message was deleted]" in the feed. This preserves thread integrity — if a parent message is hard-deleted, its thread replies become orphans.

### Message Editing

Track edits with an `edited_at` timestamp. Show "(edited)" next to edited messages. Only the message author should be able to edit their own messages. For audit purposes, you may want an `edit_history` JSONB field, but for MVP this is overkill.

---

## Realtime Delivery

This is the heart of any chat app. You need messages to appear instantly for all participants without page refreshes.

### WebSocket Architecture

Slack offers two delivery mechanisms: HTTP webhooks (events posted to a URL) and Socket Mode (persistent WebSocket connections). For a self-hosted small-company tool, WebSockets are the right choice — they give you bidirectional, low-latency communication without needing public endpoints.

**Connection pattern:**
1. Client authenticates and opens a WebSocket connection
2. Client subscribes to channels they're a member of
3. Server pushes new messages, reactions, presence changes, and typing indicators through the socket
4. Client sends messages through HTTP API (not through the WebSocket — keep write operations separate for reliability)

**If using Supabase Realtime**, the pattern is simpler — subscribe to Postgres changes on the `messages` table filtered by `channel_id`:

```typescript
supabase
  .channel(`comms:channel:${channelId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `channel_id=eq.${channelId}`,
  }, (payload) => onNewMessage(payload.new))
  .subscribe()
```

### Event Types to Handle

At minimum, your realtime layer needs to broadcast:

| Event | Trigger | Data |
|-------|---------|------|
| `message.created` | New message sent | Full message object |
| `message.updated` | Message edited | Updated message object |
| `message.deleted` | Soft delete | Message ID + `is_deleted: true` |
| `reaction.added` | Emoji reaction | Message ID, user ID, emoji |
| `reaction.removed` | Reaction removed | Message ID, user ID, emoji |
| `typing` | User is typing | Channel ID, user ID |
| `presence.changed` | User goes online/offline | User ID, status |

### Subscription Cleanup

Every realtime subscription must be cleaned up on component unmount. Return an unsubscribe function and call it in the cleanup phase of your effect:

```typescript
useEffect(() => {
  const unsub = subscribeToChannel(channelId, handleMessage)
  return () => unsub()
}, [channelId])
```

Failing to clean up subscriptions causes memory leaks and duplicate message rendering — one of the most common bugs in chat apps.

### Retry and Reconnection

WebSocket connections drop. Your client needs:
- Automatic reconnection with exponential backoff (1s, 2s, 4s, 8s, max 30s)
- A "reconnecting..." UI indicator
- Message gap detection — after reconnecting, fetch messages since the last received timestamp to fill any gaps
- Slack's retry pattern: immediate retry, then 1 minute, then 5 minutes

---

## Presence Tracking

Presence is how users see who's online. Slack tracks presence per-user across all their channels.

### Implementation Pattern

Use a presence channel (separate from message channels) where clients broadcast their status:

```typescript
const presenceChannel = supabase.channel(`presence:${channelId}`, {
  config: { presence: { key: user.id } },
})

presenceChannel
  .on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState()
    // Update online users list from state
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track({
        user_id: user.id,
        name: user.name,
        online_at: new Date().toISOString()
      })
    }
  })
```

### Presence States

Keep it simple for a small team: **online** (green dot), **away** (yellow/empty dot), **offline** (no dot). Don't implement custom status messages for MVP — it's a nice-to-have that adds complexity without proportional value for small teams.

### Away Detection

Set users to "away" after 10 minutes of inactivity. Track the last interaction timestamp client-side and send a presence update when the threshold is crossed. Also handle browser tab visibility changes — when a user switches tabs, start the away timer.

---

## Threads

### Data Model

Threads are self-referencing messages. A message with `parent_id = null` is a top-level message. A message with `parent_id = <some-message-id>` is a thread reply.

### Thread UX Pattern

The Slack pattern that works well for small teams:
1. Thread replies do NOT appear in the main channel feed by default
2. Clicking a message with replies opens a slide-out panel showing the thread
3. The parent message in the main feed shows a reply count and avatars of participants
4. Optionally: "Also send to channel" checkbox that posts the reply to both the thread and the main feed

### Fetching Threads

Two queries needed:
- **Channel feed**: `SELECT * FROM messages WHERE channel_id = ? AND parent_id IS NULL ORDER BY created_at`
- **Thread replies**: `SELECT * FROM messages WHERE parent_id = ? ORDER BY created_at`

Add a `reply_count` column or compute it with a subquery for displaying thread indicators on parent messages.

---

## Reactions

### Data Model

Reactions are emoji + user pairs on a message, with a unique constraint on `(message_id, user_id, emoji)` — each user can only add the same emoji once per message.

### Rendering Pattern

Group reactions by emoji and show a count. Clicking an existing reaction toggles it (add if you haven't reacted with that emoji, remove if you have). Highlight reactions the current user has added.

```
[thumbsup 3] [heart 1] [eyes 2]
```

### Adding Reactions UX

Slack uses a hover-triggered emoji picker. For MVP, a simple emoji shortlist (thumbsup, heart, eyes, fire, check, laugh) on hover is sufficient. Full emoji picker can come later.

---

## Unread Counts & Read Receipts

### Read Receipt Model

Track the last-read timestamp per user per channel:

```sql
create table read_receipts (
  user_id    uuid,
  channel_id uuid,
  last_read  timestamptz default now(),
  primary key (user_id, channel_id)
);
```

### Unread Count Calculation

Count messages in a channel created after the user's `last_read` timestamp:

```sql
SELECT count(*) FROM messages
WHERE channel_id = ?
  AND created_at > (
    SELECT last_read FROM read_receipts
    WHERE user_id = ? AND channel_id = ?
  )
  AND is_deleted = false
  AND parent_id IS NULL  -- only count top-level messages
```

### Updating Read Position

Update `last_read` when a user views a channel. Don't update on every message — update when the user scrolls to the bottom or when the component mounts with the channel visible. Debounce these updates to avoid hammering the database.

---

## File Attachments

### Storage Pattern

Store files in object storage (S3, Supabase Storage, etc.) and reference them from an `attachments` table:

| Field | Purpose |
|-------|---------|
| `id` | UUID |
| `message_id` | Which message this is attached to |
| `storage_key` | Path in object storage |
| `filename` | Original filename |
| `mime_type` | File type for rendering |
| `size_bytes` | For display and upload limits |

### Upload Flow

1. User selects file in the composer
2. Upload to object storage, get back a storage key
3. Create the message with content + attachment record in a single transaction
4. Render attachments below the message text — images inline, other files as download links

### Size Limits

For a small company tool, keep it reasonable: 25MB per file (matches Slack's free tier). Enforce both client-side (prevent upload) and server-side (reject oversized files).

---

## Mentions & Notifications

### @mention Parsing

Parse `@username` in message content before saving. Replace with a structured reference like `<@user_id>` so mentions survive username changes. On render, resolve the user ID back to the display name.

### Mention Types

- `@user` — notify a specific person
- `@channel` or `@here` — notify all members (use sparingly for small teams)

### Notification Delivery

For MVP, focus on in-app notifications:
- Unread badge count in the navigation
- Bold channel name in sidebar for channels with unread mentions
- A "Mentions" view that aggregates all messages where the user was @mentioned

Browser push notifications (Web Push API) are a Phase 2+ feature. They require a service worker, permission prompts, and a push notification server — significant complexity for marginal benefit in a small team where people are likely already in the app.

---

## Channel Management

### Channel Types

For a small company, you need:
- **Public channels** — visible to all workspace members, anyone can join
- **Private channels** — invite-only, hidden from non-members
- **DMs** — 1:1 or small group, outside the channel system

You probably don't need: shared channels across workspaces, channel categories/sections, or archived channels (for MVP).

### Default Channels

Every workspace should auto-create a `#general` channel and add all members to it. This provides a guaranteed place for announcements and ensures no user has an empty sidebar.

### Channel Sidebar

Organize the sidebar as:
1. **Channels** — alphabetical, with unread counts
2. **Direct Messages** — sorted by most recent activity

Slack also has sections, starred channels, and custom sidebar categories — skip these for MVP.

---

## Permission Model

### Row-Level Security Pattern

For a Supabase/Postgres stack, Row Level Security (RLS) maps naturally to Slack's scope model:

- **Channels**: Users can only see channels in workspaces they belong to
- **Messages**: Users can only see messages in channels they have access to
- **Insert**: Authenticated users can create messages (with `user_id = auth.uid()`)
- **Update**: Users can only edit their own messages
- **Delete**: Soft delete only, by the message author or workspace admins

The key RLS pattern: every read policy joins through `workspace_members` to verify the requesting user has membership in the workspace that owns the channel.

### Admin vs. Member Roles

Keep roles simple: `admin` and `member`. Admins can create/delete channels, manage workspace members, and delete any message. Members can post, edit their own messages, and join public channels.

---

## UI/UX Patterns

### Message Feed Layout

Use a linear log layout (like IRC or Linear), not chat bubbles. This is more information-dense and scales better for work communication. Each message row should contain:

```
[Avatar] [Username]  [Timestamp]
[Message content]
[Attachments if any]
[Reactions if any]
[Reply count + "View thread" if threaded]
```

### Timestamp Display

- Within the last hour: "5m ago", "32m ago"
- Today: "10:34 AM"
- Yesterday: "Yesterday 3:15 PM"
- Older: "Mar 12, 2026"
- Use monospaced font for timestamps to maintain visual alignment

### Message Grouping

Group consecutive messages from the same user within a 5-minute window — show the avatar and username only on the first message, and show subsequent messages with just the content (indented to align). This reduces visual noise significantly.

### Composer

The message input should support:
- Multi-line input (Shift+Enter for newline, Enter to send)
- File attachment button
- Emoji picker button
- @mention autocomplete (triggered by typing `@`)
- Typing indicator ("Brandon is typing...")

---

## Rate Limiting & Performance

### Client-Side

- Debounce typing indicators (send at most once per 3 seconds)
- Debounce read receipt updates (at most once per 2 seconds)
- Paginate message history (load 50 messages at a time, load more on scroll-up)

### Server-Side

Slack uses a tiered rate limit system. For a small company tool, simpler rules work:
- Message posting: max 1 per second per user per channel
- API calls: max 50 per minute per user
- File uploads: max 20 per hour per user
- Return `429 Too Many Requests` with a `Retry-After` header when limits are hit

### Message Pagination

Use cursor-based pagination, not offset-based. Cursor pagination is stable when new messages arrive (offset-based shifts and can cause duplicates or gaps):

```sql
SELECT * FROM messages
WHERE channel_id = ?
  AND created_at < ?  -- cursor: timestamp of oldest loaded message
  AND parent_id IS NULL
ORDER BY created_at DESC
LIMIT 50
```

---

## Search

### Full-Text Search

Postgres has built-in full-text search that works well for small-to-medium message volumes:

```sql
SELECT * FROM messages
WHERE channel_id IN (/* user's accessible channels */)
  AND to_tsvector('english', content) @@ plainto_tsquery('english', ?)
ORDER BY ts_rank(to_tsvector('english', content), plainto_tsquery('english', ?)) DESC
LIMIT 20
```

Add a GIN index on `to_tsvector('english', content)` for performance. For a small company (thousands of messages, not millions), this scales fine without needing Elasticsearch or Algolia.

---

## Reference Files

For deeper implementation details, see:

- `references/api-patterns.md` — Slack's API method families, request/response conventions, error handling patterns, and how to design your own API surface
- `references/realtime-deep-dive.md` — Detailed WebSocket event delivery, Socket Mode vs HTTP, retry strategies, rate limiting thresholds, and connection management patterns
- `references/data-model-patterns.md` — Full schema patterns for channels, messages, threads, reactions, attachments, and read receipts with indexing strategies
