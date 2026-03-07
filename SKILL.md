---
name: instagram
description: >-
  Comprehensive Instagram management skill for running Instagram Business accounts
  using the Instagram Graph API via MCP tools. Use this skill whenever the user
  mentions Instagram, wants to publish posts/reels/stories/carousels, check analytics
  or insights, manage comments, research hashtags, monitor mentions, or do anything
  related to Instagram account management. Also trigger when the user mentions
  "IG", "Insta", social media posting, content publishing, engagement metrics,
  follower demographics, or social media management for Instagram. Essential for
  managing the carlagentileyoga and carlagentileday Instagram accounts and any
  Instagram Business or Creator account operations. Even if the user just says
  "post this" or "check engagement" in an Instagram context, use this skill.
---

# Instagram Account Manager

This skill provides comprehensive tools and guidance for managing Instagram Business
accounts through the Instagram Graph API. It powers the `instagram-mcp-server` which
gives you direct access to Instagram's publishing, analytics, and community management
capabilities.

## Managed Accounts

- **@carlagentileyoga** — Carla Gentile's yoga teaching and wellness account
- **@carlagentileday** — Carla Gentile's personal/lifestyle account

When the user doesn't specify which account, ask which one they mean. You can switch
between accounts by passing different `account_id` values to any tool.

## Quick Reference: Available Tools

### Content Publishing
| Tool | What It Does |
|------|-------------|
| `instagram_publish_photo` | Publish a single photo to the feed |
| `instagram_publish_video` | Publish a video to the feed |
| `instagram_publish_reel` | Publish a Reel (short-form video) |
| `instagram_publish_story` | Publish a Story (image or video, 24hr) |
| `instagram_publish_carousel` | Publish a carousel (2-10 slides) |
| `instagram_check_container_status` | Check if video/reel is done processing |
| `instagram_publish_container` | Publish a processed container |

### Analytics & Insights
| Tool | What It Does |
|------|-------------|
| `instagram_get_account_insights` | Account-level metrics (reach, impressions, etc.) |
| `instagram_get_media_insights` | Per-post performance metrics |
| `instagram_get_follower_demographics` | Audience age, gender, location, online times |

### Community Management
| Tool | What It Does |
|------|-------------|
| `instagram_list_comments` | Read comments on any post |
| `instagram_reply_to_comment` | Reply to a specific comment |
| `instagram_hide_comment` | Hide/unhide a comment |
| `instagram_delete_comment` | Permanently delete a comment |

### Account & Discovery
| Tool | What It Does |
|------|-------------|
| `instagram_get_account_info` | Get profile info and follower counts |
| `instagram_get_publishing_limit` | Check remaining daily post quota (25/day) |
| `instagram_list_media` | Browse recent posts |
| `instagram_get_media_details` | Get full details on a specific post |
| `instagram_search_hashtag` | Look up a hashtag ID |
| `instagram_get_hashtag_media` | See top/recent posts for a hashtag |
| `instagram_get_mentions` | Find posts you're tagged in |
| `instagram_refresh_token` | Refresh the access token before expiry |

---

## Content Publishing Workflow

Publishing follows a consistent pattern across all content types:

### Photos (Immediate)
1. Call `instagram_publish_photo` with a public image URL and caption
2. Done — photo publishes immediately

### Videos, Reels, Video Stories (Two-Step)
Video content requires processing time on Instagram's servers:
1. Call the appropriate publish tool (e.g., `instagram_publish_reel`) — this creates a **container**
2. Wait 30-60 seconds, then call `instagram_check_container_status` with the container ID
3. Once status is `FINISHED`, call `instagram_publish_container` to go live
4. If status is `IN_PROGRESS`, wait and check again

### Carousels (Multi-Step)
1. Call `instagram_publish_carousel` with an array of 2-10 image/video items
2. If all items are images, it publishes immediately
3. If videos are included, follow the two-step process above

### Important Constraints
- **Daily limit**: 25 API-published posts per 24-hour rolling window
- **Caption**: Max 2,200 characters
- **Hashtags**: Max 30 per post
- **Carousel**: 2-10 items
- **Reels**: 5-90 seconds, 9:16 aspect ratio for Reels tab eligibility
- **Images**: Must be publicly accessible URLs (JPEG recommended)
- **Videos**: Must be publicly accessible URLs (MP4 format)

---

## Writing Great Captions

When helping write captions for the yoga accounts, keep these principles in mind:

### For @carlagentileyoga
- Warm, encouraging tone that welcomes all levels
- Include relevant yoga/wellness hashtags
- Use line breaks for readability
- End with a call to action (question, invitation to practice, link to classes)
- Mix educational content with personal practice insights

### For @carlagentileday
- More personal, lifestyle-oriented voice
- Authentic and relatable
- Can be more casual than the yoga account

### Hashtag Strategy
Use `instagram_search_hashtag` and `instagram_get_hashtag_media` to research hashtags
before posting. Look at what's performing well in the yoga/wellness space. Aim for a
mix of broad reach hashtags and niche community tags.

---

## Analytics Best Practices

### Checking Performance
1. Use `instagram_get_account_insights` with period "days_28" for monthly trends
2. Use `instagram_get_media_insights` on recent posts to see what's resonating
3. Use `instagram_get_follower_demographics` to understand the audience

### Key Metrics to Track
- **Reach**: Unique accounts that saw your content
- **Impressions**: Total times content was displayed
- **Engagement**: Likes + comments + saves + shares
- **Saves**: Strong signal of valuable content
- **Shares**: Indicates content worth spreading
- **Follower growth**: Track via follower_count over time

### For Reels specifically
- **Plays**: Total views
- **Average watch time**: How engaging the reel is
- **Shares**: Key growth metric for reels

---

## Community Management

### Comment Moderation Workflow
1. Use `instagram_list_comments` on recent posts
2. Reply to genuine questions and positive comments with `instagram_reply_to_comment`
3. Hide spam or inappropriate comments with `instagram_hide_comment`
4. Only delete comments as a last resort with `instagram_delete_comment`

### Engagement Tips
- Reply to comments within 24 hours for best algorithmic benefit
- Ask questions in captions to encourage comments
- Use `instagram_get_mentions` to find and engage with user-generated content

---

## Token Management

The Instagram access token expires every 60 days. Set a reminder to refresh it:
1. Call `instagram_refresh_token` before the current token expires
2. Update the `INSTAGRAM_ACCESS_TOKEN` environment variable with the new token
3. Restart the MCP server

If you get authentication errors, the token has likely expired. Refresh it or
re-authenticate through the OAuth flow described in `references/meta-app-setup.md`.

---

## Troubleshooting

Read `references/meta-app-setup.md` if you need help with:
- Creating a Meta Developer App
- Getting the initial access token
- Understanding required permissions
- Connecting Instagram Business accounts to the API

Read `references/api-reference.md` for:
- Detailed endpoint documentation
- Media format requirements
- Rate limit details
- Error code reference
