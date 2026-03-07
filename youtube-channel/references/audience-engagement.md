# YouTube Audience Engagement & Analytics Guide

Managing comments, tracking subscribers, analyzing channel performance, and growing
a yoga YouTube channel's audience.

## Table of Contents

1. [Comment Management & Moderation](#comment-management--moderation)
2. [Subscriber Tracking](#subscriber-tracking)
3. [YouTube Analytics Overview](#youtube-analytics-overview)
4. [Key Metrics for Yoga Channels](#key-metrics-for-yoga-channels)
5. [Growth Strategies](#growth-strategies)
6. [Cross-Platform Integration](#cross-platform-integration)

---

## Comment Management & Moderation

### Listing Comments on Your Videos

```
GET /commentThreads
  ?part=snippet,replies
  &videoId=VIDEO_ID
  &maxResults=100
  &order=time
  &moderationStatus=published
```

### Moderation Workflow

YouTube holds some comments for review based on your channel settings. Use the API
to manage the moderation queue:

**1. List comments held for review:**
```
GET /commentThreads
  ?part=snippet
  &allThreadsRelatedToChannelId=YOUR_CHANNEL_ID
  &moderationStatus=heldForReview
  &maxResults=100
```

**2. List likely spam:**
```
GET /commentThreads
  ?part=snippet
  &allThreadsRelatedToChannelId=YOUR_CHANNEL_ID
  &moderationStatus=likelySpam
  &maxResults=100
```

**3. Approve a comment:**
```
POST /comments/setModerationStatus
  ?id=COMMENT_ID
  &moderationStatus=published
```

**4. Reject a comment:**
```
POST /comments/setModerationStatus
  ?id=COMMENT_ID
  &moderationStatus=rejected
```

**5. Reject and ban the author:**
```
POST /comments/setModerationStatus
  ?id=COMMENT_ID
  &moderationStatus=rejected
  &banAuthor=true
```

### Responding to Comments

Engage your community by replying to comments:

```json
POST /comments?part=snippet

{
  "snippet": {
    "parentId": "COMMENT_THREAD_ID",
    "textOriginal": "Thank you for practicing with me! So glad you enjoyed the class. 🧘"
  }
}
```

### Creating Top-Level Comments (Pinned Comments)

Post a comment on your own video (useful for adding links, corrections, or CTAs):

```json
POST /commentThreads?part=snippet

{
  "snippet": {
    "videoId": "YOUR_VIDEO_ID",
    "topLevelComment": {
      "snippet": {
        "textOriginal": "📌 Want more classes like this? Join my yoga community: [link]\n\n⏱️ Timestamps in the description!"
      }
    }
  }
}
```

Then pin the comment in YouTube Studio (pinning is not available via API).

### Search Comments by Keyword

Find comments mentioning specific topics:

```
GET /commentThreads
  ?part=snippet
  &allThreadsRelatedToChannelId=YOUR_CHANNEL_ID
  &searchTerms=beginner
  &maxResults=50
```

Useful for finding questions about specific topics to address in future content.

### Comment Moderation Best Practices for Yoga Channels

- **Respond to questions within 24 hours** — builds community and signals engagement
- **Heart comments** — use YouTube Studio to "heart" encouraging comments
- **Pin a CTA comment** — Link to your Circle community or next class
- **Set up auto-moderation** — Hold comments with links or specific words for review
- **Be positive** — yoga communities thrive on encouragement and support
- **Address corrections** — If someone points out a safety issue with a pose, respond thoughtfully

---

## Subscriber Tracking

### List Your Channel's Subscribers

```
GET /subscriptions
  ?part=snippet,subscriberSnippet
  &mySubscribers=true
  &maxResults=50
```

**Note:** This only returns subscribers who have made their subscriptions public.

### Check Subscriber Count Over Time

```
GET /channels
  ?part=statistics
  &id=YOUR_CHANNEL_ID
```

Returns `subscriberCount` (rounded to 3 significant figures for channels with >1000 subs).

### YouTube Membership Management

If your channel has Memberships enabled:

**List members:**
```
GET /members
  ?part=snippet
  &mode=listMembers
  &maxResults=100
```

**List membership levels:**
```
GET /membershipsLevels
  ?part=snippet
```

---

## YouTube Analytics Overview

The YouTube Analytics API provides detailed performance data beyond what the Data API offers.

### Authentication

Requires OAuth 2.0 with scope: `yt-analytics.readonly`

### Base URL

`https://youtubeanalytics.googleapis.com/v2`

### Core Report Request

```
GET /reports
  ?ids=channel==MINE
  &startDate=2026-01-01
  &endDate=2026-03-07
  &metrics=views,estimatedMinutesWatched,averageViewDuration,subscribersGained,likes
  &dimensions=day
  &sort=-day
```

### Available Metrics

| Metric | Description |
|--------|-------------|
| `views` | Total video views |
| `estimatedMinutesWatched` | Total watch time in minutes |
| `averageViewDuration` | Average seconds watched per view |
| `averageViewPercentage` | Average % of video watched |
| `subscribersGained` | New subscribers |
| `subscribersLost` | Unsubscribed |
| `likes` | Total likes |
| `dislikes` | Total dislikes |
| `comments` | Total comments |
| `shares` | Total shares |
| `annotationClickThroughRate` | Card/end screen click rate |
| `cardClickRate` | Info card click rate |
| `estimatedRevenue` | Earnings (requires monetary scope) |

### Available Dimensions

| Dimension | Description |
|-----------|-------------|
| `day` | Daily breakdown |
| `month` | Monthly breakdown |
| `video` | Per-video breakdown |
| `country` | Geographic breakdown |
| `deviceType` | Desktop, mobile, tablet, TV |
| `operatingSystem` | Android, iOS, Windows, etc. |
| `subscribedStatus` | Subscribed vs. not subscribed viewers |
| `liveOrOnDemand` | Live stream vs. VOD |
| `ageGroup` | Viewer age demographics |
| `gender` | Viewer gender demographics |

### Common Reports

**Daily channel performance:**
```
metrics=views,estimatedMinutesWatched,subscribersGained
&dimensions=day
&startDate=2026-02-01
&endDate=2026-03-07
```

**Top videos by watch time:**
```
metrics=estimatedMinutesWatched,views,likes
&dimensions=video
&sort=-estimatedMinutesWatched
&maxResults=25
```

**Traffic by country:**
```
metrics=views,estimatedMinutesWatched
&dimensions=country
&sort=-views
```

**Device breakdown:**
```
metrics=views,estimatedMinutesWatched
&dimensions=deviceType
```

**Audience retention for a specific video:**
```
metrics=audienceWatchRatio
&dimensions=elapsedVideoTimeRatio
&filters=video==VIDEO_ID
```

---

## Key Metrics for Yoga Channels

### Metrics That Matter Most

| Metric | Why It Matters | Target |
|--------|---------------|--------|
| **Watch time** | YouTube's #1 ranking factor | Growing month over month |
| **Average view duration** | Shows content quality | >50% of video length |
| **Click-through rate (CTR)** | Thumbnail + title effectiveness | 5-10% is good |
| **Subscriber conversion** | Channel growth health | 1-3% of viewers subscribe |
| **Comments per video** | Community engagement | Growing over time |
| **Return viewer rate** | Audience loyalty | Higher = better |

### Benchmarks for Yoga/Fitness Channels

| Metric | Typical Range |
|--------|--------------|
| Average view duration (30-min class) | 8-15 minutes |
| CTR | 4-8% |
| Like ratio | 95%+ |
| Comment rate | 0.5-2% of views |
| Subscriber growth (monthly) | 2-5% |

### What to Track Weekly

1. **Total views** (week over week trend)
2. **Watch time hours** (critical for monetization — need 4,000/year)
3. **Subscriber count** (track net gain/loss)
4. **Top performing video** (what resonated?)
5. **Comment activity** (community health)

### What to Track Monthly

1. **Subscriber milestone progress** (toward 1,000 for monetization)
2. **Watch time milestone progress** (toward 4,000 hours)
3. **Audience demographics** (who's watching — helps content planning)
4. **Traffic sources** (search, browse, external, suggested)
5. **Best performing content type** (which class styles get the most engagement)

---

## Growth Strategies

### YouTube SEO for Yoga

**Research keywords using the Search API:**
```
GET /search
  ?part=snippet
  &q=morning yoga flow
  &type=video
  &order=viewCount
  &maxResults=10
```

This shows top-performing videos for a keyword. Analyze their titles, descriptions,
and tags for patterns.

**Keyword research targets for yoga channels:**
- "yoga for beginners" — massive volume, competitive
- "morning yoga routine" — high intent, daily search
- "yoga for back pain" — problem-solving, high conversion
- "30 minute yoga" — specific duration search
- "[style] yoga class" — vinyasa, yin, hatha, etc.
- "yoga before bed" — time-specific
- "yoga for [condition]" — stress, anxiety, flexibility, weight loss

### Content Ideas Based on Search Trends

Use the Search API to find gaps in the market:

```
GET /search
  ?part=snippet
  &q=yoga for office workers
  &type=video
  &order=date
  &publishedAfter=2025-01-01T00:00:00Z
```

If few recent results exist for a high-demand topic, that's a content opportunity.

### Collaboration & Cross-Promotion

- **Collab with other yoga YouTubers** — shared audiences grow both channels
- **Guest teachers** — feature other teachers for variety
- **Challenge series** — "7-Day Yoga Challenge" drives daily viewing
- **Shorts strategy** — 60-second pose tutorials or tips for quick discovery

### End Screens & Cards

While not manageable via API, always add:
- **End screen** (last 20 seconds): Subscribe button + next video + playlist
- **Cards**: Link to related videos at relevant moments (e.g., link to beginner version during advanced class)

---

## Cross-Platform Integration

### YouTube + Circle Community

Create a flywheel between your YouTube channel and Circle community:

| YouTube Action | Circle Action |
|---------------|---------------|
| New video published | Post in Circle with video embed + discussion prompt |
| Video gets lots of comments | Highlight interesting questions in Circle |
| Milestone reached (1K subs) | Celebrate in Circle community |
| Upload unlisted video | Share link in gated Circle space (members-only) |
| Video request in comments | Create poll in Circle to vote on next class |

### YouTube + Social Media

- **Instagram:** Post thumbnail + short clip directing to full video
- **TikTok:** Repurpose YouTube Shorts or create teaser content
- **Email/Newsletter:** Weekly email featuring new YouTube videos

### Embedding YouTube in Circle

In Circle posts and course lessons, embed YouTube videos by pasting the URL.
Circle auto-converts YouTube links to embedded players:

```
https://www.youtube.com/watch?v=VIDEO_ID
```

For unlisted videos, the embed still works — members just need the link.
