---
name: youtube-channel
description: >
  Expert-level YouTube Data API v3 skill for managing YouTube channels, uploading
  and organizing video content, moderating comments, tracking analytics, and building
  audience growth strategies programmatically. Use this skill whenever the user mentions
  YouTube API, YouTube channel management, video uploads, playlist management, YouTube
  SEO, video metadata, comment moderation, subscriber tracking, YouTube analytics,
  thumbnail management, channel branding, or any YouTube channel operations. Also
  trigger when the user wants to set up a new YouTube channel, organize video content,
  manage community engagement, pull channel statistics, or automate any YouTube
  workflow. Essential for managing Carla Gentile Yoga's YouTube channel and any
  creator-focused YouTube operations. Even if the user just says 'YouTube' and the
  context is about channel management, content, or audience, use this skill.
---

# YouTube Data API v3 — Expert Skill

You are an expert in the YouTube Data API v3. Your job is to help set up, manage,
and grow YouTube channels — particularly for yoga/wellness creators like Carla Gentile Yoga.

## Quick Orientation

The YouTube Data API v3 lets you programmatically do almost everything you can do on
youtube.com: upload videos, manage playlists, read/write comments, update channel
branding, pull video statistics, and more.

**Base URL:** `https://www.googleapis.com/youtube/v3`

### API Layers

| API | Purpose | Auth Required |
|-----|---------|---------------|
| **YouTube Data API v3** (this skill's primary focus) | Channel management, videos, playlists, comments, subscriptions | API key (read-only public) or OAuth 2.0 (write/private) |
| **YouTube Analytics API** | Channel performance metrics, reports, revenue data | OAuth 2.0 |
| **YouTube Reporting API** | Bulk data export via scheduled reports | OAuth 2.0 |

## Authentication

YouTube supports two authentication methods:

### API Key (Read-Only Public Data)
For listing public videos, channels, playlists, and search:
```
GET /youtube/v3/videos?part=snippet&id=VIDEO_ID&key=YOUR_API_KEY
```

### OAuth 2.0 (Required for Write Operations & Private Data)
Required for: uploads, updates, deletes, comment moderation, accessing private data.

```
Authorization: Bearer YOUR_OAUTH_TOKEN
```

**OAuth Scopes:**
| Scope | Access |
|-------|--------|
| `youtube` | Full manage access (videos, playlists, subscriptions) |
| `youtube.readonly` | Read-only access to account info |
| `youtube.upload` | Upload videos only |
| `youtube.force-ssl` | View/manage via SSL (comments, ratings) |
| `yt-analytics.readonly` | View analytics reports |
| `yt-analytics-monetary.readonly` | View monetary analytics |

**Setup Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or select existing)
3. Enable "YouTube Data API v3" in APIs & Services
4. Create credentials: API key for read-only, OAuth 2.0 Client ID for write
5. Configure OAuth consent screen
6. For server-side apps, create a Service Account or use installed app flow

## Quota System

**Critical to understand** — YouTube enforces daily quotas:

| Default Allocation | 10,000 units/day |
|---|---|
| **Read operations** (list) | 1 unit |
| **Write operations** (insert/update/delete) | 50 units |
| **Search requests** | 100 units |
| **Video uploads** | 1,600 units |

**Quota math example:** With 10,000 units/day you can do:
- ~10,000 list calls, OR
- ~200 write operations, OR
- ~100 searches, OR
- ~6 video uploads
- Or any combination that sums to ≤10,000

To request higher quotas, submit a quota extension request via Google Cloud Console.

## Resource Overview

For the full endpoint reference, read:
```
references/api-resources.md
```

For channel setup and branding guidance, read:
```
references/channel-setup-guide.md
```

For video and content management, read:
```
references/content-management.md
```

For community engagement and analytics, read:
```
references/audience-engagement.md
```

For practical code recipes, read:
```
references/recipes.md
```

## Core Resources at a Glance

| Resource | What It Does | Key Methods |
|----------|-------------|-------------|
| **Channels** | Channel metadata, branding, stats | list, update |
| **Videos** | Video content, metadata, stats | list, insert, update, delete, rate |
| **Playlists** | Video collections | list, insert, update, delete |
| **PlaylistItems** | Videos within playlists | list, insert, update, delete |
| **Search** | Find videos, channels, playlists | list |
| **CommentThreads** | Top-level comments on videos | list, insert |
| **Comments** | Replies and moderation | list, insert, update, delete, setModerationStatus |
| **Subscriptions** | Channel subscribers | list, insert, delete |
| **Thumbnails** | Custom video thumbnails | set |
| **ChannelBanners** | Channel art/banner image | insert |
| **ChannelSections** | Channel page layout | list, insert, update, delete |
| **Captions** | Subtitles and closed captions | list, insert, update, delete, download |

## Common Patterns for Yoga Channels

Since this skill is tailored for managing yoga creator channels, here are high-value workflows:

- **Upload class recordings** → POST to `/videos` with metadata optimized for yoga SEO
- **Organize by class type** → Create playlists for "Vinyasa Flow", "Yin Yoga", "Meditation", etc.
- **Manage community** → List and moderate comments to build engagement
- **Track growth** → Pull channel/video statistics for views, subscribers, watch time
- **Brand the channel** → Update channel banner, description, sections layout
- **Cross-promote** → Link YouTube content in Circle community posts
- **SEO optimization** → Use Search API to research keywords and competitor content

## Error Handling

| Status | Meaning | Action |
|--------|---------|--------|
| 200 | Success | Process response |
| 400 | Bad Request | Check parameters |
| 401 | Unauthorized | Check API key or OAuth token |
| 403 | Forbidden / Quota Exceeded | Check permissions or quota usage |
| 404 | Not Found | Check resource ID |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Back off, retry |
| 500 | Server Error | Retry after delay |

## Important Restrictions

- Videos uploaded via **unverified API projects** (created after July 28, 2020) default to **private** and require an API audit for public uploads
- **Quota resets daily** at midnight Pacific Time
- **Thumbnails** require channel verification for custom uploads
- **Live streaming** requires separate enablement on the channel
- **Monetization** is managed through YouTube Studio, not the API
