---
name: instagram
description: >-
  Instagram management and content strategy skill for running Instagram Business
  accounts via the Graph API. Use this skill whenever the user mentions Instagram,
  publishing posts/reels/stories/carousels, analytics, comments, hashtags, or any
  IG account management. Also trigger for content ideas, caption help, hashtag
  suggestions, growth strategies, engagement tips, content calendars, or any
  Instagram marketing guidance. Trigger for "IG", "Insta", social media posting,
  engagement metrics, or follower demographics. Essential for managing
  carlagentileyoga and carlagentileday accounts. Even if the user just says
  "what should Carla post?" or "check engagement", use this skill.
---

# Instagram Account Manager

This skill provides both **strategic content guidance** and **technical API tools** for
managing Instagram Business accounts. It combines a comprehensive yoga/wellness content
strategy (see `references/content-strategy.md`) with the `instagram-mcp-server` MCP
tools for publishing, analytics, and community management.

When the user asks for advice, strategy, or "what to post," consult the content strategy
reference first. When they want to execute (publish, check analytics, manage comments),
use the MCP tools. Often you'll do both — advise on what to create, then help publish it.

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

## Content Strategy & Advice

**Read `references/content-strategy.md` for the full guide.** It covers:

- **Content pillars** — 5 pillars for @carlagentileyoga (Educate 30%, Inspire 20%,
  Demonstrate 25%, Connect 15%, Convert 10%) with specific content ideas for each
- **Posting cadence** — How often to post each format, and best times for yoga niche
- **Format strategy** — When to use Reels vs. Carousels vs. Stories vs. Feed posts
- **Caption formulas** — Hook + Value + CTA structure with yoga-specific templates
- **Hashtag strategy** — Categories, rotation, and research workflow using MCP tools
- **Growth tactics** — Collaborations, engagement-first approach, SEO on Instagram
- **Funnel strategy** — Moving followers from IG → Circle community → class purchases
- **Reels & Stories best practices** — Structure, technical tips, what the algorithm wants
- **Content calendar template** — Weekly plan you can customize
- **Analytics-driven optimization** — Weekly review checklist and KPIs to track

When the user asks for content advice, pull from this reference and tailor it to their
specific question. Always ground recommendations in what the data shows — use the
analytics tools to back up strategy decisions.

### Business Goals (always keep these in mind)
1. **Grow followers and reach** — prioritize Reels and shareable carousels
2. **Drive to Circle community** — tease exclusive content, show community value
3. **Sell classes and workshops** — testimonials, countdowns, limited-time offers

### Voice & Tone

**@carlagentileyoga:**
- Warm, encouraging, welcoming to all levels
- Expert but approachable — teaches without condescending
- Uses line breaks for readability
- Every post ends with a CTA (question, save prompt, link to community)
- Mixes educational value with personal practice insights

**@carlagentileday:**
- More personal, lifestyle-oriented, authentic
- How yoga integrates into real daily life
- Casual and relatable
- Cross-promotes yoga account naturally, not forcefully

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

Read `references/content-strategy.md` for:
- Content pillars and posting cadence
- Caption formulas and hashtag strategy
- Growth tactics and funnel strategy
- Reels/Stories best practices
- Content calendar template
- Analytics-driven optimization
