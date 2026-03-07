# YouTube Data API v3 — Complete Resource Reference

Base URL: `https://www.googleapis.com/youtube/v3`

All requests require either:
- `key=YOUR_API_KEY` query parameter (public read-only), OR
- `Authorization: Bearer YOUR_OAUTH_TOKEN` header (write operations & private data)

## Table of Contents

1. [Channels](#channels)
2. [Videos](#videos)
3. [Playlists](#playlists)
4. [PlaylistItems](#playlistitems)
5. [Search](#search)
6. [CommentThreads](#commentthreads)
7. [Comments](#comments)
8. [Subscriptions](#subscriptions)
9. [Thumbnails](#thumbnails)
10. [ChannelBanners](#channelbanners)
11. [ChannelSections](#channelsections)
12. [Captions](#captions)
13. [Activities](#activities)
14. [Members](#members)
15. [MembershipsLevels](#membershipslevels)

---

## Channels

Retrieve and update YouTube channel information, branding, and settings.

| Method | HTTP Request | Description | Auth | Quota |
|--------|-------------|-------------|------|-------|
| list | GET /channels | Returns channel resources matching criteria | API key or OAuth | 1 |
| update | PUT /channels | Updates channel metadata (brandingSettings, invideoPromotion) | OAuth | 50 |

### Parts (for `part` parameter)

| Part | Description |
|------|-------------|
| `snippet` | Title, description, custom URL, thumbnails, country, language |
| `contentDetails` | Related playlists (uploads, likes, favorites) |
| `statistics` | View count, subscriber count, video count |
| `brandingSettings` | Channel title, description, keywords, banner image, trailer |
| `topicDetails` | Topic categories associated with channel |
| `status` | Privacy, long upload eligibility, made-for-kids status |
| `localizations` | Translated channel metadata |
| `contentOwnerDetails` | Content owner info (MCN partners only) |
| `auditDetails` | Community guideline/copyright compliance (MCN only) |

### List Filters (use exactly one)

| Parameter | Description |
|-----------|-------------|
| `mine=true` | Authenticated user's channel |
| `id` | Comma-separated channel IDs (max 50) |
| `forHandle` | Channel by handle (e.g., `@carlagentileyoga`) |
| `forUsername` | Channel by legacy username |
| `managedByMe=true` | Channels managed by authenticated content owner |

### Key Channel Fields

```json
{
  "kind": "youtube#channel",
  "id": "UCxxxxxxxx",
  "snippet": {
    "title": "Carla Gentile Yoga",
    "description": "Welcome to my yoga channel...",
    "customUrl": "@carlagentileyoga",
    "publishedAt": "2026-01-15T00:00:00Z",
    "thumbnails": { "default": {}, "medium": {}, "high": {} },
    "country": "US",
    "defaultLanguage": "en"
  },
  "contentDetails": {
    "relatedPlaylists": {
      "likes": "LLxxxxxxxx",
      "uploads": "UUxxxxxxxx"
    }
  },
  "statistics": {
    "viewCount": "125000",
    "subscriberCount": "5200",
    "hiddenSubscriberCount": false,
    "videoCount": "87"
  },
  "brandingSettings": {
    "channel": {
      "title": "Carla Gentile Yoga",
      "description": "...",
      "keywords": "yoga vinyasa meditation wellness mindfulness",
      "unsubscribedTrailer": "VIDEO_ID_FOR_TRAILER"
    },
    "image": {
      "bannerExternalUrl": "https://..."
    }
  }
}
```

---

## Videos

The core content resource. Upload, list, update, and manage videos.

| Method | HTTP Request | Description | Auth | Quota |
|--------|-------------|-------------|------|-------|
| list | GET /videos | Returns videos matching parameters | API key or OAuth | 1 |
| insert | POST /videos | Uploads a video | OAuth | 1600 |
| update | PUT /videos | Updates video metadata | OAuth | 50 |
| delete | DELETE /videos | Deletes a video | OAuth | 50 |
| rate | POST /videos/rate | Like/dislike a video | OAuth | 50 |
| getRating | GET /videos/getRating | Get user's rating on videos | OAuth | 1 |
| reportAbuse | POST /videos/reportAbuse | Flag abusive content | OAuth | 50 |

### Parts

| Part | Description |
|------|-------------|
| `snippet` | Title (max 100 chars), description (max 5000 bytes), tags, categoryId, thumbnails, channelId, publishedAt |
| `contentDetails` | Duration (ISO 8601), dimension, definition, caption availability, licensing, regionRestriction |
| `status` | Upload status, privacy (private/public/unlisted), publishAt (scheduling), license, embeddable, madeForKids |
| `statistics` | viewCount, likeCount, commentCount |
| `player` | Embed HTML |
| `topicDetails` | Topic IDs and categories |
| `liveStreamingDetails` | Broadcast timing, concurrent viewers |
| `fileDetails` | Technical file info (owner-only) |
| `processingDetails` | Processing status and progress (owner-only) |
| `suggestions` | Processing recommendations (owner-only) |
| `localizations` | Translated titles and descriptions |

### List Filters (use exactly one)

| Parameter | Description |
|-----------|-------------|
| `id` | Comma-separated video IDs (max 50) |
| `chart=mostPopular` | Most popular videos |
| `myRating=like\|dislike` | Videos rated by authenticated user |

### Optional Parameters

| Parameter | Description |
|-----------|-------------|
| `maxResults` | Max items per page (1-50, default 5) |
| `pageToken` | Pagination token |
| `regionCode` | ISO 3166-1 country code |
| `videoCategoryId` | Filter by category |

### Video Insert (Upload)

Upload uses a multipart request:
1. Part 1: JSON metadata (snippet, status, etc.)
2. Part 2: Binary video file

```
POST https://www.googleapis.com/upload/youtube/v3/videos
  ?uploadType=resumable
  &part=snippet,status
```

### Key Video Fields

```json
{
  "kind": "youtube#video",
  "id": "dQw4w9WgXcQ",
  "snippet": {
    "publishedAt": "2026-03-01T10:00:00Z",
    "channelId": "UCxxxxxxxx",
    "title": "30-Minute Morning Vinyasa Flow | All Levels",
    "description": "Start your day with this energizing...",
    "thumbnails": {
      "default": { "url": "...", "width": 120, "height": 90 },
      "medium": { "url": "...", "width": 320, "height": 180 },
      "high": { "url": "...", "width": 480, "height": 360 },
      "standard": { "url": "...", "width": 640, "height": 480 },
      "maxres": { "url": "...", "width": 1280, "height": 720 }
    },
    "channelTitle": "Carla Gentile Yoga",
    "tags": ["yoga", "vinyasa", "morning yoga", "all levels"],
    "categoryId": "17"
  },
  "contentDetails": {
    "duration": "PT30M15S",
    "dimension": "2d",
    "definition": "hd",
    "caption": "true"
  },
  "status": {
    "uploadStatus": "processed",
    "privacyStatus": "public",
    "license": "youtube",
    "embeddable": true,
    "madeForKids": false
  },
  "statistics": {
    "viewCount": "15234",
    "likeCount": "892",
    "commentCount": "67"
  }
}
```

---

## Playlists

Organize videos into collections for your channel.

| Method | HTTP Request | Description | Auth | Quota |
|--------|-------------|-------------|------|-------|
| list | GET /playlists | Returns playlists matching criteria | API key or OAuth | 1 |
| insert | POST /playlists | Creates a playlist | OAuth | 50 |
| update | PUT /playlists | Modifies a playlist | OAuth | 50 |
| delete | DELETE /playlists | Deletes a playlist | OAuth | 50 |

### Parts

| Part | Description |
|------|-------------|
| `snippet` | Title, description, publishedAt, channelId, thumbnails |
| `status` | Privacy status (private/public/unlisted) |
| `contentDetails` | Item count |
| `player` | Embed HTML |
| `localizations` | Translated metadata |

### List Filters

| Parameter | Description |
|-----------|-------------|
| `mine=true` | Authenticated user's playlists |
| `id` | Comma-separated playlist IDs (max 50) |
| `channelId` | Playlists belonging to a channel |

### Create Playlist

```json
POST /playlists?part=snippet,status

{
  "snippet": {
    "title": "Vinyasa Flow Classes",
    "description": "Energizing vinyasa flow sessions for all levels",
    "tags": ["yoga", "vinyasa", "flow"],
    "defaultLanguage": "en"
  },
  "status": {
    "privacyStatus": "public"
  }
}
```

---

## PlaylistItems

Add, remove, and reorder videos within playlists.

| Method | HTTP Request | Description | Auth | Quota |
|--------|-------------|-------------|------|-------|
| list | GET /playlistItems | Returns items in a playlist | API key or OAuth | 1 |
| insert | POST /playlistItems | Adds a video to a playlist | OAuth | 50 |
| update | PUT /playlistItems | Updates item (e.g., position) | OAuth | 50 |
| delete | DELETE /playlistItems | Removes a video from a playlist | OAuth | 50 |

### Parts

| Part | Description |
|------|-------------|
| `snippet` | PlaylistId, position, resourceId (videoId), title, description, thumbnails |
| `contentDetails` | VideoId, start/end times for partial video |
| `status` | Privacy status |

### Add Video to Playlist

```json
POST /playlistItems?part=snippet

{
  "snippet": {
    "playlistId": "PLxxxxxxxx",
    "position": 0,
    "resourceId": {
      "kind": "youtube#video",
      "videoId": "dQw4w9WgXcQ"
    }
  }
}
```

---

## Search

Find videos, channels, and playlists across YouTube.

| Method | HTTP Request | Description | Auth | Quota |
|--------|-------------|-------------|------|-------|
| list | GET /search | Returns search results | API key or OAuth | 100 |

**Note:** Search costs 100 quota units per call. Use sparingly.

### Key Parameters

| Parameter | Description |
|-----------|-------------|
| `q` | Search query (supports `-` for NOT, `\|` for OR) |
| `type` | Resource type: `video`, `channel`, `playlist` |
| `channelId` | Restrict to a specific channel |
| `order` | Sort: `date`, `rating`, `relevance`, `title`, `videoCount`, `viewCount` |
| `publishedAfter` | Min publish date (RFC 3339) |
| `publishedBefore` | Max publish date (RFC 3339) |
| `maxResults` | Items per page (0-50, default 5) |
| `pageToken` | Pagination token |
| `regionCode` | ISO 3166-1 country code |
| `relevanceLanguage` | ISO 639-1 language preference |
| `videoDuration` | `short` (<4min), `medium` (4-20min), `long` (>20min) |
| `videoDefinition` | `high` (HD) or `standard` (SD) |
| `videoCaption` | `closedCaption` or `none` |
| `eventType` | `completed`, `live`, `upcoming` |
| `safeSearch` | `moderate`, `none`, `strict` |
| `topicId` | Freebase topic ID |

---

## CommentThreads

Top-level comments on videos (with their reply threads).

| Method | HTTP Request | Description | Auth | Quota |
|--------|-------------|-------------|------|-------|
| list | GET /commentThreads | List comment threads | API key or OAuth | 1 |
| insert | POST /commentThreads | Create a top-level comment | OAuth | 50 |

### Parts

| Part | Description |
|------|-------------|
| `snippet` | channelId, videoId, topLevelComment, canReply, totalReplyCount, isPublic |
| `replies` | Array of reply comment resources (partial — use comments.list for all) |

### List Filters

| Parameter | Description |
|-----------|-------------|
| `videoId` | Comments for a specific video |
| `channelId` | Comments across a channel |
| `allThreadsRelatedToChannelId` | All threads mentioning a channel |
| `id` | Specific comment thread IDs |

### Optional Parameters

| Parameter | Description |
|-----------|-------------|
| `maxResults` | Items per page (1-100, default 20) |
| `moderationStatus` | `heldForReview`, `likelySpam`, `published` |
| `order` | `time` or `relevance` |
| `searchTerms` | Filter comments by text content |

---

## Comments

Individual comments (replies) and moderation.

| Method | HTTP Request | Description | Auth | Quota |
|--------|-------------|-------------|------|-------|
| list | GET /comments | List comments (replies to a thread) | API key or OAuth | 1 |
| insert | POST /comments | Reply to a comment | OAuth | 50 |
| update | PUT /comments | Edit a comment | OAuth | 50 |
| delete | DELETE /comments | Delete a comment | OAuth | 50 |
| setModerationStatus | POST /comments/setModerationStatus | Approve/reject comments | OAuth | 50 |

### Moderation Statuses

| Status | Meaning |
|--------|---------|
| `published` | Visible to everyone |
| `heldForReview` | Waiting for moderator approval |
| `likelySpam` | Flagged as potential spam |
| `rejected` | Hidden from public view |

### Set Moderation Status

```
POST /comments/setModerationStatus
  ?id=COMMENT_ID
  &moderationStatus=published
  &banAuthor=false
```

---

## Subscriptions

Track and manage channel subscriptions.

| Method | HTTP Request | Description | Auth | Quota |
|--------|-------------|-------------|------|-------|
| list | GET /subscriptions | List subscriptions | API key or OAuth | 1 |
| insert | POST /subscriptions | Subscribe to a channel | OAuth | 50 |
| delete | DELETE /subscriptions | Unsubscribe | OAuth | 50 |

### Parts

| Part | Description |
|------|-------------|
| `snippet` | Title, channelId, resourceId, thumbnails |
| `contentDetails` | Total item count, new item count, activity type |
| `subscriberSnippet` | Subscriber's channel info |

---

## Thumbnails

Upload custom video thumbnails.

| Method | HTTP Request | Description | Auth | Quota |
|--------|-------------|-------------|------|-------|
| set | POST /thumbnails/set | Upload custom thumbnail for a video | OAuth | 50 |

**Requirements:**
- Channel must be verified for custom thumbnails
- Image: JPEG, PNG, GIF, or BMP
- Max size: 2MB
- Recommended: 1280x720px (min 640px wide), 16:9 aspect ratio

```
POST /thumbnails/set?videoId=VIDEO_ID
Content-Type: image/jpeg

[binary image data]
```

---

## ChannelBanners

Upload channel banner/art images.

| Method | HTTP Request | Description | Auth | Quota |
|--------|-------------|-------------|------|-------|
| insert | POST /channelBanners/insert | Upload banner image | OAuth | 50 |

**Three-step process:**
1. Upload image via `channelBanners.insert` → get URL
2. Extract `url` from response
3. Call `channels.update` with `brandingSettings.image.bannerExternalUrl` set to that URL

**Banner Requirements:**
- 16:9 aspect ratio
- Minimum: 2048×1152px
- Recommended: 2560×1440px

---

## ChannelSections

Organize the layout of your channel's home page.

| Method | HTTP Request | Description | Auth | Quota |
|--------|-------------|-------------|------|-------|
| list | GET /channelSections | List channel sections | API key or OAuth | 1 |
| insert | POST /channelSections | Add a section | OAuth | 50 |
| update | PUT /channelSections | Update a section | OAuth | 50 |
| delete | DELETE /channelSections | Remove a section | OAuth | 50 |

**Section Types:**
- `singlePlaylist` — Display a single playlist
- `multiplePlaylists` — Display multiple playlists
- `popularUploads` — Auto-populated popular videos
- `recentUploads` — Auto-populated recent uploads
- `likedPlaylists` — Playlists the channel liked

**Max sections per channel:** 10

---

## Captions

Manage subtitles and closed captions on videos.

| Method | HTTP Request | Description | Auth | Quota |
|--------|-------------|-------------|------|-------|
| list | GET /captions | List caption tracks for a video | OAuth | 50 |
| insert | POST /captions | Upload a caption track | OAuth | 400 |
| update | PUT /captions | Update a caption track | OAuth | 450 |
| delete | DELETE /captions | Delete a caption track | OAuth | 50 |
| download | GET /captions/{id} | Download caption file | OAuth | 200 |

### Supported Formats

| Format | Description |
|--------|-------------|
| `sbv` | SubViewer |
| `scc` | Scenarist Closed Caption |
| `srt` | SubRip |
| `ttml` | Timed Text Markup Language |
| `vtt` | Web Video Text Tracks |

---

## Activities

View channel activity feed (uploads, likes, comments, etc.).

| Method | HTTP Request | Description | Auth | Quota |
|--------|-------------|-------------|------|-------|
| list | GET /activities | List channel activity events | API key or OAuth | 1 |

### Filters

| Parameter | Description |
|-----------|-------------|
| `mine=true` | Authenticated user's activity |
| `channelId` | Activity for a specific channel |

---

## Members

Channel membership management (for channels with memberships enabled).

| Method | HTTP Request | Description | Auth | Quota |
|--------|-------------|-------------|------|-------|
| list | GET /members | List channel members | OAuth | 1 |

Requires channel owner authorization. Returns member info, level, and join date.

---

## MembershipsLevels

Retrieve membership pricing tiers for the authenticated channel.

| Method | HTTP Request | Description | Auth | Quota |
|--------|-------------|-------------|------|-------|
| list | GET /membershipsLevels | List membership levels | OAuth | 1 |

Returns level names, pricing, and display order.
