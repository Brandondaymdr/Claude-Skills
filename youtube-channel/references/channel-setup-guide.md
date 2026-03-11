# YouTube Channel Setup & Branding Guide

Complete guide for setting up and branding a YouTube channel, specifically tailored for
yoga/wellness creators like Carla Gentile Yoga.

## Table of Contents

1. [Channel Creation](#channel-creation)
2. [Channel Branding](#channel-branding)
3. [Channel Page Layout](#channel-page-layout)
4. [SEO & Discoverability](#seo--discoverability)
5. [Channel Settings & Verification](#channel-settings--verification)
6. [API Setup for Channel Management](#api-setup-for-channel-management)

---

## Channel Creation

### Brand Account vs. Personal Channel

For a yoga business channel, always use a **Brand Account**:

- Multiple owners/managers can access it
- Separate from personal Google account
- Professional appearance with business name
- Can be transferred to another person

**To create:**
1. Sign in to YouTube
2. Go to Settings → Create a new channel
3. Choose "Use a business or other name"
4. Enter "Carla Gentile Yoga" (or your brand name)
5. The channel is now linked to a Brand Account

### Channel Handle

Claim your handle early (e.g., `@carlagentileyoga`):
- Must be unique across YouTube
- 3-30 characters, letters, numbers, hyphens, underscores, periods
- Eligibility: channel must have at least 1 subscriber (the owner counts)

---

## Channel Branding

### Profile Picture

- **Dimensions:** 800×800px (displays as circle)
- **Format:** JPEG, PNG, GIF, BMP
- **Max size:** 4MB
- **Best practice:** Use the same logo/headshot as your Circle community and social media for brand consistency

### Channel Banner (Art)

- **Recommended:** 2560×1440px
- **Minimum:** 2048×1152px
- **Safe area** (visible on all devices): 1546×423px (centered)
- **Max file size:** 6MB
- **Best practice:** Include channel name, upload schedule, and brand colors

**Upload via API (3-step process):**

```
Step 1: Upload image
POST /channelBanners/insert
Content-Type: image/jpeg
[binary image data]
→ Returns { "url": "https://..." }

Step 2: Update channel with banner URL
PUT /channels?part=brandingSettings
{
  "id": "YOUR_CHANNEL_ID",
  "brandingSettings": {
    "image": {
      "bannerExternalUrl": "URL_FROM_STEP_1"
    }
  }
}
```

### Channel Description

Your channel description appears in the "About" section and in search results. Structure it for both humans and SEO:

**Template for yoga channels:**
```
Welcome to [Channel Name]! 🧘

I'm [Name], a [credentials, e.g., RYT-500 certified yoga teacher] based in [location].

On this channel, you'll find:
• [Content type 1, e.g., Vinyasa flow classes for all levels]
• [Content type 2, e.g., Guided meditation and breathwork]
• [Content type 3, e.g., Yoga philosophy and lifestyle tips]

New videos every [schedule, e.g., Tuesday and Friday at 9am ET]

Join my community: [Circle community link]
Website: [URL]
Instagram: @[handle]

#yoga #vinyasa #meditation #wellness #mindfulness
```

**Max length:** 1,000 characters

### Channel Keywords

Set via `brandingSettings.channel.keywords`:

```
"yoga vinyasa flow meditation mindfulness wellness health fitness
home yoga beginner yoga yin yoga restorative pranayama breathwork
yoga teacher yoga class online yoga"
```

**Best practices:**
- Include your brand name
- Mix broad terms (yoga, wellness) with specific (vinyasa flow, yin yoga)
- Include terms people search for
- Separate with spaces (YouTube treats as individual keywords)
- Max ~500 characters

### Channel Trailer

Set different videos for subscribed vs. unsubscribed viewers:

- **Unsubscribed trailer:** A short (1-2 min) introduction video that welcomes new visitors and encourages them to subscribe
- **Subscribed trailer:** Can be your latest video or a featured piece

Set via `brandingSettings.channel.unsubscribedTrailer`:

```json
PUT /channels?part=brandingSettings
{
  "id": "YOUR_CHANNEL_ID",
  "brandingSettings": {
    "channel": {
      "unsubscribedTrailer": "VIDEO_ID_OF_INTRO_VIDEO"
    }
  }
}
```

### Watermark

Add a subscribe button watermark overlay on all videos:

```
POST /watermarks/set?channelId=YOUR_CHANNEL_ID
Content-Type: image/png
[binary image data — 150x150px, transparent PNG recommended]
```

---

## Channel Page Layout

### Recommended Sections for a Yoga Channel

Organize your channel home page with up to 10 sections:

| Position | Section Type | Content |
|----------|-------------|---------|
| 1 | Channel trailer | Welcome/intro video (for non-subscribers) |
| 2 | Recent uploads | Auto-populated latest videos |
| 3 | Single playlist | "Most Popular Classes" |
| 4 | Single playlist | "Vinyasa Flow Series" |
| 5 | Single playlist | "Yin Yoga & Restorative" |
| 6 | Single playlist | "Meditation & Breathwork" |
| 7 | Single playlist | "Beginner Yoga" |
| 8 | Single playlist | "Yoga Challenges" |
| 9 | Popular uploads | Auto-populated by view count |

### Creating Sections via API

```json
POST /channelSections?part=snippet,contentDetails

{
  "snippet": {
    "type": "singlePlaylist",
    "title": "Vinyasa Flow Series",
    "position": 3
  },
  "contentDetails": {
    "playlists": ["PLxxxxxxxx"]
  }
}
```

**Section types:**
- `singlePlaylist` — One playlist
- `multiplePlaylists` — Multiple playlists
- `recentUploads` — Latest uploads (auto)
- `popularUploads` — Most viewed (auto)

---

## SEO & Discoverability

### YouTube Search Ranking Factors

YouTube's algorithm considers:

1. **Relevance** — Title, description, tags match search query
2. **Engagement** — Watch time, likes, comments, shares
3. **Quality** — Production value, viewer satisfaction signals
4. **Channel Authority** — Subscriber count, consistent upload schedule, niche focus

### Title Best Practices

- **Max length:** 100 characters (aim for 60-70 for full display)
- **Front-load keywords:** Put the most important terms first
- **Include level:** "Beginner", "Intermediate", "All Levels"
- **Include duration:** "30 Min", "20 Minute", "1 Hour"
- **Be specific:** "Morning Vinyasa Flow" beats "Yoga Class"

**Examples for yoga:**
```
30-Minute Morning Vinyasa Flow | All Levels Yoga
20-Min Yin Yoga for Deep Relaxation & Flexibility
Guided Meditation for Stress Relief | 15 Minutes
Beginner Yoga Full Body Stretch | No Equipment Needed
Power Yoga for Strength & Balance | Intermediate
```

### Description Best Practices

- **First 2-3 lines** are visible before "Show More" — make them count
- Include target keywords naturally in first 200 characters
- Add timestamps for class sections
- Include links (Circle community, website, social media)
- Add relevant hashtags (max 3 in description, max 15 total including #shorts)

**Template:**
```
Start your morning with this energizing 30-minute vinyasa flow class!
This all-levels yoga session focuses on building strength and flexibility
through flowing sequences. No props needed — just your mat.

⏱️ Timestamps:
0:00 Introduction
1:30 Centering & Breath
4:00 Warm-up Sequence
10:00 Standing Flow Series
20:00 Balance Poses
25:00 Cool Down
28:00 Savasana

🧘 Join my yoga community: [Circle link]
📱 Follow me on Instagram: @carlagentileyoga
🌐 Website: carlagentileyoga.com

#yoga #vinyasaflow #morningyoga
```

### Tags Best Practices

- Include exact match keywords: "morning vinyasa flow"
- Include broad terms: "yoga", "workout"
- Include misspellings people search for: "viniyasa", "yinyoga"
- Include your channel name
- 500 character limit
- Use a mix of 2-4 word phrases

### Category

For yoga content, use **Category ID 17** (Sports) or **Category ID 26** (Howto & Style).

---

## Channel Settings & Verification

### Channel Verification

Verify your channel to unlock features:
- **Phone verification** (basic): Custom thumbnails, videos >15 minutes, live streaming, content ID appeals
- **Official verification badge** (advanced): 100K+ subscribers

### Upload Defaults

Set default metadata for all new uploads:
- Default title template
- Default description (with your standard links/timestamps section)
- Default tags
- Default language
- Default category
- Default visibility (unlisted recommended for drafts)

### Monetization Requirements (YouTube Partner Program)

| Requirement | Threshold |
|-------------|-----------|
| Subscribers | 1,000 minimum |
| Watch hours (last 12 months) | 4,000 hours minimum |
| OR Shorts views (last 90 days) | 10 million views |
| Community guidelines | No active strikes |
| 2-step verification | Enabled |

### Linked Accounts

Connect your channel to:
- Google Ads (for promotion)
- Google Analytics (for detailed traffic analysis)
- Brand Account (for multi-user management)

---

## API Setup for Channel Management

### Step-by-Step: Getting Your API Credentials

1. **Go to Google Cloud Console:** https://console.cloud.google.com/
2. **Create a project:** Name it "Carla Gentile Yoga YouTube" (or similar)
3. **Enable YouTube Data API v3:**
   - APIs & Services → Library → Search "YouTube Data API v3" → Enable
4. **Create API Key** (for read-only public data):
   - APIs & Services → Credentials → Create Credentials → API Key
   - Restrict to YouTube Data API v3
5. **Create OAuth 2.0 Client ID** (for write operations):
   - APIs & Services → Credentials → Create Credentials → OAuth Client ID
   - Application type: Desktop app (for scripts) or Web app (for apps)
   - Download the client secrets JSON file
6. **Configure OAuth Consent Screen:**
   - User type: External (or Internal for Google Workspace)
   - App name, support email, authorized domains
   - Add scopes: youtube, youtube.upload

### Getting Your Channel ID

Your channel ID is needed for many API calls:

```
GET /channels?part=id&mine=true
Authorization: Bearer YOUR_OAUTH_TOKEN
```

Or find it in YouTube Studio → Settings → Advanced Settings → Channel ID.

### First API Call Test

Verify everything works with a simple channel info request:

```
GET /channels
  ?part=snippet,statistics
  &mine=true
  &key=YOUR_API_KEY

Authorization: Bearer YOUR_OAUTH_TOKEN
```

Expected response includes your channel name, subscriber count, and total views.
