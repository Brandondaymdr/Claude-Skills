# Realtime Deep Dive

Detailed patterns for implementing realtime message delivery, presence, and event handling in a Slack-like messaging app.

## Table of Contents

1. [Event Delivery Models](#event-delivery-models)
2. [WebSocket Connection Lifecycle](#websocket-connection-lifecycle)
3. [Event Types and Payloads](#event-types-and-payloads)
4. [Presence System](#presence-system)
5. [Typing Indicators](#typing-indicators)
6. [Reconnection Strategy](#reconnection-strategy)
7. [Supabase Realtime Specifics](#supabase-realtime-specifics)

---

## Event Delivery Models

Slack provides two delivery mechanisms. Understanding both helps you choose the right approach for your stack.

### Socket Mode (WebSocket)

How it works: The app opens a persistent WebSocket connection. Slack pushes events through this connection in real time.

When to use: Development, environments without static IPs, apps behind firewalls.

Pros: No public endpoints needed, bidirectional, low latency.
Cons: Requires persistent connection management, reconnection logic.

### HTTP Events API

How it works: Slack POSTs JSON payloads to a public URL when events occur.

When to use: Production deployments on cloud platforms with stable URLs.

Pros: Stateless, works with serverless functions.
Cons: Requires public endpoint, higher latency, no bidirectional communication.

### For Your App (Supabase Realtime)

Supabase Realtime gives you the WebSocket model out of the box. It listens to Postgres WAL (Write-Ahead Log) changes and pushes them through WebSocket channels. This is the simplest path for a Next.js + Supabase stack — no additional infrastructure needed.

---

## WebSocket Connection Lifecycle

### Connection Flow

```
1. User authenticates → receives JWT
2. Client opens WebSocket to Supabase Realtime
3. Client subscribes to channels:
   - `comms:channel:{channelId}` for each channel in sidebar
   - `presence:{workspaceId}` for online status
   - `typing:{channelId}` for the active channel
4. Server pushes events as they occur
5. Client unsubscribes when navigating away
6. Client disconnects on logout/tab close
```

### Subscription Management

Subscribe to channels lazily — don't subscribe to every channel on login. Subscribe to:
- The currently viewed channel (full events: messages, reactions, typing)
- All channels in the sidebar (unread counts only — lighter subscription)
- The workspace presence channel (online/offline status)

When the user switches channels:
1. Unsubscribe from the previous channel's typing indicator
2. Subscribe to the new channel's full events
3. Keep sidebar subscriptions alive

### Resource Budget

Each WebSocket subscription consumes server resources. For a small team (< 50 users), this isn't a concern. For larger deployments, consider:
- Batching sidebar unread count updates (poll every 30 seconds instead of subscribing to each channel)
- Using a single multiplexed subscription for the sidebar instead of per-channel subscriptions

---

## Event Types and Payloads

### Core Events

**message.created**
Triggered when a new message is inserted into `comms_messages`.

```json
{
  "type": "INSERT",
  "table": "comms_messages",
  "record": {
    "id": "uuid",
    "channel_id": "uuid",
    "user_id": "uuid",
    "content": "Hey team, the new batch is ready",
    "parent_id": null,
    "context_ref": { "type": "stock_item", "id": "batch-42", "label": "Batch #42" },
    "created_at": "2026-03-14T10:30:00Z"
  }
}
```

**message.updated**
Triggered when a message is edited (content change or soft delete).

```json
{
  "type": "UPDATE",
  "table": "comms_messages",
  "record": {
    "id": "uuid",
    "content": "Hey team, the new batch is ready for tasting",
    "edited_at": "2026-03-14T10:31:00Z"
  },
  "old_record": {
    "content": "Hey team, the new batch is ready"
  }
}
```

**reaction.added / reaction.removed**
```json
{
  "type": "INSERT",  // or "DELETE"
  "table": "comms_reactions",
  "record": {
    "message_id": "uuid",
    "user_id": "uuid",
    "emoji": "thumbsup"
  }
}
```

### Handling Events Client-Side

Pattern for processing realtime events in a React component:

```typescript
useEffect(() => {
  const channel = supabase
    .channel(`comms:channel:${channelId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'comms_messages',
      filter: `channel_id=eq.${channelId}`,
    }, (payload) => {
      // Only add to feed if it's a top-level message (not a thread reply)
      if (!payload.new.parent_id) {
        setMessages(prev => [...prev, payload.new])
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    })
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'comms_messages',
      filter: `channel_id=eq.${channelId}`,
    }, (payload) => {
      setMessages(prev =>
        prev.map(msg => msg.id === payload.new.id ? payload.new : msg)
      )
    })
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [channelId])
```

---

## Presence System

### How Slack Does It

Slack tracks presence globally — a user is "active" if they've interacted with any Slack client recently. Presence is broadcast to all workspaces the user belongs to.

### Implementation with Supabase Presence

Supabase has a built-in presence system on top of Realtime channels:

```typescript
// Track user presence for a workspace
const presenceChannel = supabase.channel(`presence:${workspaceId}`, {
  config: { presence: { key: userId } }
})

presenceChannel
  .on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState()
    // state is a map of userId → [{ user_id, name, online_at, status }]
    setOnlineUsers(Object.keys(state))
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    // User came online
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    // User went offline
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track({
        user_id: userId,
        name: userName,
        status: 'online',
        online_at: new Date().toISOString()
      })
    }
  })
```

### Away Detection

```typescript
let awayTimer: NodeJS.Timeout

function resetAwayTimer() {
  clearTimeout(awayTimer)
  awayTimer = setTimeout(() => {
    presenceChannel.track({ ...currentPresence, status: 'away' })
  }, 10 * 60 * 1000) // 10 minutes
}

// Reset on user interaction
document.addEventListener('mousemove', resetAwayTimer)
document.addEventListener('keydown', resetAwayTimer)

// Handle tab visibility
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Start shorter away timer when tab is hidden (2 minutes)
    awayTimer = setTimeout(() => {
      presenceChannel.track({ ...currentPresence, status: 'away' })
    }, 2 * 60 * 1000)
  } else {
    presenceChannel.track({ ...currentPresence, status: 'online' })
    resetAwayTimer()
  }
})
```

---

## Typing Indicators

### Broadcast Pattern

Use a dedicated Supabase Realtime channel for typing events — don't put them in the database:

```typescript
// Send typing event (debounced)
const broadcastTyping = debounce(() => {
  supabase
    .channel(`typing:${channelId}`)
    .send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: userId, name: userName }
    })
}, 3000, { leading: true, trailing: false })

// Listen for typing events
supabase
  .channel(`typing:${channelId}`)
  .on('broadcast', { event: 'typing' }, ({ payload }) => {
    setTypingUsers(prev => ({
      ...prev,
      [payload.user_id]: { name: payload.name, at: Date.now() }
    }))
  })
  .subscribe()
```

### Display Logic

Show "X is typing..." for 5 seconds after the last typing event. If multiple users are typing: "X and Y are typing..." or "Several people are typing..." for 3+.

Clear stale typing indicators with a periodic check:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    setTypingUsers(prev => {
      const now = Date.now()
      return Object.fromEntries(
        Object.entries(prev).filter(([_, v]) => now - v.at < 5000)
      )
    })
  }, 1000)
  return () => clearInterval(interval)
}, [])
```

---

## Reconnection Strategy

### Slack's Retry Pattern

Slack retries event delivery with this schedule:
1. Immediate retry
2. After 1 minute
3. After 5 minutes

After 3 failures, the event is dropped (unless "Delayed Events" is enabled, which retries hourly for 24 hours).

### Client-Side Reconnection

```typescript
function createRealtimeConnection(channelId: string) {
  let retryCount = 0
  const maxRetry = 30000 // 30 seconds max backoff

  function connect() {
    const channel = supabase
      .channel(`comms:channel:${channelId}`)
      .on('postgres_changes', { /* ... */ })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          retryCount = 0
          setConnectionStatus('connected')
          // Fill any message gaps
          fetchMessagesSince(lastReceivedTimestamp)
        }
        if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setConnectionStatus('reconnecting')
          const delay = Math.min(1000 * Math.pow(2, retryCount), maxRetry)
          retryCount++
          setTimeout(connect, delay)
        }
      })
    return channel
  }

  return connect()
}
```

### Gap Detection

After reconnecting, fetch any messages that arrived during the disconnect:

```typescript
async function fetchMessagesSince(since: string) {
  const { data } = await supabase
    .from('comms_messages')
    .select('*')
    .eq('channel_id', channelId)
    .gt('created_at', since)
    .order('created_at', { ascending: true })

  if (data?.length) {
    setMessages(prev => {
      const existingIds = new Set(prev.map(m => m.id))
      const newMessages = data.filter(m => !existingIds.has(m.id))
      return [...prev, ...newMessages]
    })
  }
}
```

---

## Supabase Realtime Specifics

### Channel Naming Convention

Use a consistent prefix pattern for different subscription types:
- `comms:channel:{channelId}` — message events for a specific channel
- `comms:dm:{conversationId}` — message events for a DM
- `presence:{workspaceId}` — user presence for a workspace
- `typing:{channelId}` — typing indicators for a channel

### RLS and Realtime

Supabase Realtime respects RLS policies. If a user doesn't have access to a channel's messages through RLS, they won't receive realtime events for that channel either. This means your security model is consistent across HTTP queries and WebSocket subscriptions.

### Realtime Quotas

Supabase has limits on concurrent connections and messages per second, depending on your plan. For a small company (< 50 concurrent users), the free/pro tier is sufficient. Monitor the Realtime dashboard for connection counts and message throughput.

### Broadcast vs. Postgres Changes

Two types of Realtime subscriptions:
- **Postgres Changes**: Triggered by database inserts/updates/deletes. Use for messages, reactions, attachments — anything persisted.
- **Broadcast**: Ephemeral messages sent directly through the channel. Use for typing indicators, cursor positions, temporary state — anything NOT persisted.

This distinction is important. Typing indicators should never touch the database.
