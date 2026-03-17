# Data Model Patterns

Schema design patterns for a Slack-like messaging system, including table structures, constraints, indexing strategies, and query patterns.

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Workspaces & Membership](#workspaces--membership)
3. [Channels](#channels)
4. [Messages](#messages)
5. [Threads](#threads)
6. [Direct Messages](#direct-messages)
7. [Reactions](#reactions)
8. [Read Receipts & Unread Counts](#read-receipts--unread-counts)
9. [Attachments](#attachments)
10. [Indexing Strategy](#indexing-strategy)
11. [Context References](#context-references)

---

## Schema Overview

The core tables for a messaging system, in dependency order:

```
workspaces
  → workspace_members (workspace_id, user_id)
  → channels (workspace_id)
    → messages (channel_id)
      → reactions (message_id)
      → attachments (message_id)
    → read_receipts (channel_id, user_id)

direct_conversations
  → dm_participants (conversation_id, user_id)
  → messages (dm_id)
```

Namespace all tables with a prefix (e.g., `comms_`) if sharing a database with other modules.

---

## Workspaces & Membership

### Workspace Table

```sql
create table comms_workspaces (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,              -- "Crowded Barrel Whiskey Co."
  slug        text not null unique,       -- "crowded-barrel"
  entity_tag  text,                       -- short label for badges
  created_at  timestamptz default now()
);
```

**Slug rules**: lowercase, hyphenated, no spaces. Slugs are stable identifiers used in URLs — never rename after creation. Enforce format with a check constraint:

```sql
alter table comms_workspaces
  add constraint valid_slug check (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$');
```

### Membership Table

```sql
create table comms_workspace_members (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid references comms_workspaces(id) on delete cascade,
  user_id       uuid references auth.users(id) on delete cascade,
  role          text default 'member' check (role in ('admin', 'member')),
  joined_at     timestamptz default now(),
  unique(workspace_id, user_id)
);
```

The unique constraint on `(workspace_id, user_id)` prevents duplicate memberships. This table is the foundation for all RLS policies — every access check joins through here.

---

## Channels

```sql
create table comms_channels (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid references comms_workspaces(id) on delete cascade,
  name          text not null,
  description   text,
  is_private    boolean default false,
  created_by    uuid references auth.users(id),
  created_at    timestamptz default now(),
  unique(workspace_id, name)  -- channel names unique within workspace
);
```

**Channel name rules**: lowercase, hyphenated, max 80 characters. Enforce with a check constraint:

```sql
alter table comms_channels
  add constraint valid_channel_name check (name ~ '^[a-z0-9][a-z0-9-]{0,78}[a-z0-9]$');
```

### Seeding Default Channels

Every new workspace should auto-create a `#general` channel:

```sql
create or replace function comms_seed_default_channel()
returns trigger as $$
begin
  insert into comms_channels (workspace_id, name, description, created_by)
  values (NEW.id, 'general', 'Company-wide announcements and conversations', NEW.created_by);
  return NEW;
end;
$$ language plpgsql;

create trigger on_workspace_created
  after insert on comms_workspaces
  for each row execute function comms_seed_default_channel();
```

---

## Messages

```sql
create table comms_messages (
  id           uuid primary key default gen_random_uuid(),
  channel_id   uuid references comms_channels(id) on delete cascade,
  dm_id        uuid references comms_direct_conversations(id) on delete cascade,
  parent_id    uuid references comms_messages(id),
  user_id      uuid references auth.users(id) on delete set null,
  content      text not null,
  edited_at    timestamptz,
  is_deleted   boolean default false,
  context_ref  jsonb,
  created_at   timestamptz default now(),
  check (
    (channel_id is not null and dm_id is null) or
    (channel_id is null and dm_id is not null)
  )
);
```

### Why the Check Constraint Matters

A message must belong to exactly one conversation — either a channel or a DM. Without this constraint, you risk orphan messages or messages that appear in both contexts. The check constraint enforces this at the database level, which is more reliable than application-level validation.

### Soft Delete Pattern

When deleting a message:
```sql
update comms_messages set is_deleted = true where id = $1 and user_id = $2;
```

In the frontend, render deleted messages as:
```
[This message was deleted]
```

Keep the row so threads aren't broken and reactions/reply counts remain accurate.

---

## Threads

Threads use self-referencing `parent_id` on the messages table. No separate table needed.

### Query: Top-Level Messages (Channel Feed)

```sql
select m.*,
  (select count(*) from comms_messages r where r.parent_id = m.id and not r.is_deleted) as reply_count,
  (select max(r.created_at) from comms_messages r where r.parent_id = m.id) as last_reply_at
from comms_messages m
where m.channel_id = $1
  and m.parent_id is null
  and not m.is_deleted
order by m.created_at desc
limit 50;
```

### Query: Thread Replies

```sql
select * from comms_messages
where parent_id = $1
  and not is_deleted
order by created_at asc;
```

### Thread Participant Avatars

To show who's in a thread on the parent message:

```sql
select distinct user_id from comms_messages
where parent_id = $1 and not is_deleted
limit 5;
```

---

## Direct Messages

### Conversation Table

```sql
create table comms_direct_conversations (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz default now()
);

create table comms_dm_participants (
  conversation_id  uuid references comms_direct_conversations(id) on delete cascade,
  user_id          uuid references auth.users(id) on delete cascade,
  primary key (conversation_id, user_id)
);
```

### Finding an Existing DM

Before creating a new DM, check if one already exists between the same participants:

```sql
-- Find existing DM between exactly user_a and user_b
select dp1.conversation_id
from comms_dm_participants dp1
join comms_dm_participants dp2 on dp1.conversation_id = dp2.conversation_id
where dp1.user_id = $user_a
  and dp2.user_id = $user_b
  and (
    select count(*) from comms_dm_participants
    where conversation_id = dp1.conversation_id
  ) = 2;
```

This query finds conversations where both users are participants AND the total participant count is exactly 2 (avoiding group DMs).

### Group DMs

For group DMs (3+ participants), the same table structure works. The difference is in the participant count check when finding existing conversations.

---

## Reactions

```sql
create table comms_reactions (
  id          uuid primary key default gen_random_uuid(),
  message_id  uuid references comms_messages(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete cascade,
  emoji       text not null,
  created_at  timestamptz default now(),
  unique(message_id, user_id, emoji)
);
```

### Aggregating Reactions for Display

```sql
select emoji, count(*) as count,
  array_agg(user_id) as user_ids,
  bool_or(user_id = $current_user) as current_user_reacted
from comms_reactions
where message_id = $1
group by emoji
order by min(created_at);
```

### Toggle Reaction

```sql
-- Try to insert; if unique violation, delete instead
insert into comms_reactions (message_id, user_id, emoji)
values ($message_id, $user_id, $emoji)
on conflict (message_id, user_id, emoji) do nothing
returning id;

-- If nothing returned, the reaction already existed — remove it
delete from comms_reactions
where message_id = $message_id and user_id = $user_id and emoji = $emoji;
```

Or handle this logic in the application layer with a simple check-then-insert/delete.

---

## Read Receipts & Unread Counts

```sql
create table comms_read_receipts (
  user_id     uuid references auth.users(id) on delete cascade,
  channel_id  uuid references comms_channels(id) on delete cascade,
  last_read   timestamptz default now(),
  primary key (user_id, channel_id)
);
```

### Update Read Position

Use upsert when user views a channel:

```sql
insert into comms_read_receipts (user_id, channel_id, last_read)
values ($user_id, $channel_id, now())
on conflict (user_id, channel_id)
do update set last_read = now();
```

### Unread Count Query

```sql
select c.id, c.name,
  count(m.id) filter (
    where m.created_at > coalesce(rr.last_read, '1970-01-01')
      and m.parent_id is null
      and not m.is_deleted
  ) as unread_count
from comms_channels c
left join comms_read_receipts rr on rr.channel_id = c.id and rr.user_id = $user_id
left join comms_messages m on m.channel_id = c.id
where c.workspace_id = $workspace_id
group by c.id, c.name
order by c.name;
```

### Mention-Specific Unreads

If you implement @mentions, you may want a separate count for unread mentions (Slack shows these with a red badge vs. white for regular unreads). This requires parsing mentions at message creation time and storing them in a `comms_mentions` table:

```sql
create table comms_mentions (
  message_id  uuid references comms_messages(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete cascade,
  primary key (message_id, user_id)
);
```

---

## Attachments

```sql
create table comms_attachments (
  id           uuid primary key default gen_random_uuid(),
  message_id   uuid references comms_messages(id) on delete cascade,
  storage_key  text not null,         -- path in Supabase Storage
  filename     text not null,
  mime_type    text,
  size_bytes   bigint,
  created_at   timestamptz default now()
);
```

### Storage Key Convention

```
comms/{workspace_slug}/{channel_id}/{message_id}/{filename}
```

This keeps files organized by context and makes cleanup straightforward if a workspace or channel is deleted.

---

## Indexing Strategy

### Essential Indexes

```sql
-- Messages by channel (the most common query)
create index idx_messages_channel_created
  on comms_messages (channel_id, created_at desc)
  where parent_id is null and not is_deleted;

-- Thread replies
create index idx_messages_parent
  on comms_messages (parent_id, created_at asc)
  where parent_id is not null;

-- DM messages
create index idx_messages_dm_created
  on comms_messages (dm_id, created_at desc)
  where dm_id is not null and parent_id is null;

-- Reactions by message
create index idx_reactions_message
  on comms_reactions (message_id);

-- Workspace membership lookups (used by every RLS policy)
create index idx_workspace_members_user
  on comms_workspace_members (user_id, workspace_id);

-- Full-text search
create index idx_messages_search
  on comms_messages using gin (to_tsvector('english', content));

-- Read receipts lookup
create index idx_read_receipts_user
  on comms_read_receipts (user_id);
```

### Partial Indexes

The `where` clauses on the message indexes are important. Most queries filter out deleted messages and thread replies, so partial indexes that pre-filter these conditions are significantly smaller and faster.

---

## Context References

The `context_ref` JSONB field on messages allows linking to external entities — invoices, tasks, inventory items, etc. This is one of the most powerful features for a business communication tool.

### Structure

```json
{
  "type": "books_transaction",
  "id": "txn_abc123",
  "label": "Invoice #204 - Crowded Barrel",
  "url": "/books/transactions/txn_abc123"
}
```

### Supported Types

Define a clear set of reference types for your platform:

| Type | Module | Example |
|------|--------|---------|
| `books_transaction` | Books (accounting) | Invoice, payment, journal entry |
| `ops_task` | Ops (task management) | Work order, maintenance task |
| `stock_item` | Stock (inventory) | Batch, SKU, warehouse item |
| `vault_entry` | Vault (document store) | Contract, license, permit |

### Rendering

Render context references as a small linked card below the message text. Include the type icon, label text, and a link to the referenced item. Keep it visually subtle — it's supplementary context, not the main content.

### Querying by Reference

To find all messages referencing a specific entity:

```sql
select * from comms_messages
where context_ref->>'type' = 'books_transaction'
  and context_ref->>'id' = 'txn_abc123'
order by created_at desc;
```

Add a GIN index if you query by context reference frequently:

```sql
create index idx_messages_context_ref on comms_messages using gin (context_ref);
```
