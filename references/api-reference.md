# Instagram Graph API Quick Reference

A condensed reference for the Instagram Graph API endpoints used by the MCP server.

## Base URLs

- Instagram Graph API: `https://graph.instagram.com/v21.0`
- Facebook Graph API: `https://graph.facebook.com/v21.0`

## Authentication

All requests require an `access_token` parameter with a valid long-lived token.
Tokens expire after 60 days and can be refreshed.

## Content Publishing

### Create Media Container
```
POST /{ig-user-id}/media
```

**Photo parameters:**
- `image_url` (required): Public URL to JPEG image
- `caption`: Post text (max 2,200 chars)
- `location_id`: Facebook Page location ID
- `user_tags`: JSON array of tagged users with x,y positions

**Video parameters:**
- `media_type`: "VIDEO"
- `video_url` (required): Public URL to MP4 video
- `caption`: Post text
- `thumb_offset`: Thumbnail frame in milliseconds

**Reels parameters:**
- `media_type`: "REELS"
- `video_url` (required): Public URL to MP4 (9:16, 5-90s)
- `caption`: Reel text
- `share_to_feed`: Boolean (default true)
- `cover_url`: Custom cover image URL
- `audio_name`: Name for original audio
- `collaborators`: Array of usernames (max 3)

**Story parameters:**
- `media_type`: "STORIES"
- `image_url` OR `video_url`: Public URL to media

**Carousel parameters:**
- `media_type`: "CAROUSEL"
- `children`: Comma-separated child container IDs
- `caption`: Carousel text

**Carousel item parameters:**
- `is_carousel_item`: true
- `image_url` OR `video_url`: Public URL
- `media_type`: "VIDEO" (only if video)

### Publish Container
```
POST /{ig-user-id}/media_publish
  creation_id={container-id}
```

### Check Container Status
```
GET /{container-id}?fields=status_code,status
```
Status codes: `IN_PROGRESS`, `FINISHED`, `ERROR`, `EXPIRED`

### Check Publishing Limit
```
GET /{ig-user-id}/content_publishing_limit?fields=config,quota_usage
```

## Media Management

### List Media
```
GET /{ig-user-id}/media
  ?fields=id,media_type,media_url,thumbnail_url,permalink,timestamp,caption,like_count,comments_count
  &limit=25
```

### Get Media Details
```
GET /{media-id}
  ?fields=id,media_type,media_url,thumbnail_url,permalink,timestamp,caption,like_count,comments_count,children{id,media_type,media_url}
```

## Comments

### List Comments
```
GET /{media-id}/comments
  ?fields=id,text,timestamp,username,like_count,replies{id,text,timestamp,username},hidden
  &limit=25
```

### Reply to Comment
```
POST /{comment-id}/replies
  message={text}
```

### Hide/Unhide Comment
```
POST /{comment-id}
  hide={true|false}
```

### Delete Comment
```
DELETE /{comment-id}
```

## Insights

### Account Insights
```
GET /{ig-user-id}/insights
  ?metric={comma-separated-metrics}
  &period={day|week|days_28|month|lifetime}
  &since={unix-timestamp}
  &until={unix-timestamp}
```

**Account metrics (time series):**
impressions, reach, follower_count, profile_views, accounts_engaged,
total_interactions, likes, comments, shares, saves, replies

**Demographic metrics (lifetime only):**
audience_gender_age, audience_locale, audience_country, audience_city,
online_followers

### Media Insights
```
GET /{media-id}/insights
  ?metric={comma-separated-metrics}
```

**Post metrics:** impressions, reach, engagement, saved, likes, comments,
shares, total_interactions

**Reels metrics:** plays, reach, likes, comments, shares, saved,
ig_reels_avg_watch_time, ig_reels_video_view_total_time, total_interactions

**Story metrics:** impressions, reach, exits, replies, taps_forward, taps_back

## Hashtags

### Search Hashtag
```
GET /ig_hashtag_search
  ?user_id={ig-user-id}
  &q={hashtag-name}
```
Limited to 30 unique hashtag searches per 7-day window.

### Get Hashtag Media
```
GET /{hashtag-id}/top_media
  ?user_id={ig-user-id}
  &fields=id,media_type,permalink,timestamp,caption,like_count,comments_count

GET /{hashtag-id}/recent_media
  (same parameters)
```

## Account Info

### Get Profile
```
GET /{ig-user-id}
  ?fields=id,username,name,profile_picture_url,followers_count,follows_count,media_count,account_type,biography,website
```

### Get Tagged Media
```
GET /{ig-user-id}/tags
  ?fields=id,media_type,permalink,timestamp,caption,username
```

## Token Management

### Refresh Long-Lived Token
```
GET /refresh_access_token
  ?grant_type=ig_refresh_token
  &access_token={current-token}
```
Returns new token valid for 60 days.

## Rate Limits

- **Publishing**: 25 posts per 24-hour rolling window
- **API calls**: Based on request complexity, not fixed count
- **Hashtag searches**: 30 unique hashtags per 7-day window
- **Token refresh**: Can refresh anytime before expiry

## Media Format Requirements

### Images
- Format: JPEG (recommended), PNG
- Max file size: 8MB
- Recommended: 1080x1080 (square), 1080x1350 (portrait), 1080x566 (landscape)

### Videos (Feed)
- Format: MP4 (H.264 codec)
- Max duration: 60 minutes
- Max file size: 250MB
- Recommended resolution: 1080p

### Reels
- Format: MP4
- Aspect ratio: 9:16 (required for Reels tab)
- Duration: 5-90 seconds (for Reels tab eligibility)
- Max file size: 250MB

### Stories
- Image: Same as regular images
- Video: Max 60 seconds, 9:16 aspect ratio recommended
- Disappear after 24 hours

### Carousel
- 2-10 items per carousel
- Mix of images and videos allowed
- All items should have consistent aspect ratio
