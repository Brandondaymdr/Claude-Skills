# YouTube Content Management Guide

Everything about managing videos, playlists, thumbnails, captions, and content
organization for a yoga YouTube channel.

## Table of Contents

1. [Video Upload Workflow](#video-upload-workflow)
2. [Video Metadata Best Practices](#video-metadata-best-practices)
3. [Playlist Organization](#playlist-organization)
4. [Thumbnail Management](#thumbnail-management)
5. [Captions & Accessibility](#captions--accessibility)
6. [Content Scheduling](#content-scheduling)
7. [Video Privacy & Visibility](#video-privacy--visibility)
8. [Bulk Operations](#bulk-operations)

---

## Video Upload Workflow

### The Complete Upload Process

Uploading a video via the API involves several steps:

**Step 1: Upload the Video File**

Use a resumable upload for reliability (especially for large yoga class recordings):

```
POST https://www.googleapis.com/upload/youtube/v3/videos
  ?uploadType=resumable
  &part=snippet,status,contentDetails
Authorization: Bearer YOUR_OAUTH_TOKEN
Content-Type: application/json

{
  "snippet": {
    "title": "30-Minute Morning Vinyasa Flow | All Levels",
    "description": "Start your day with this energizing vinyasa flow...",
    "tags": ["yoga", "vinyasa", "morning yoga", "all levels", "30 minute yoga"],
    "categoryId": "17",
    "defaultLanguage": "en"
  },
  "status": {
    "privacyStatus": "private",
    "selfDeclaredMadeForKids": false,
    "publishAt": "2026-03-15T14:00:00Z"
  }
}
```

The API returns a `Location` header with an upload URI. Send the video binary to that URI.

**Step 2: Set Custom Thumbnail**

After the video is uploaded and processed:

```
POST /thumbnails/set?videoId=NEW_VIDEO_ID
Content-Type: image/jpeg
[binary thumbnail image data]
```

**Step 3: Add to Playlist(s)**

```json
POST /playlistItems?part=snippet

{
  "snippet": {
    "playlistId": "PLxxxxxxxx",
    "resourceId": {
      "kind": "youtube#video",
      "videoId": "NEW_VIDEO_ID"
    }
  }
}
```

**Step 4: Add Captions (optional but recommended)**

```
POST /captions?part=snippet
Content-Type: multipart/related

{
  "snippet": {
    "videoId": "NEW_VIDEO_ID",
    "language": "en",
    "name": "English"
  }
}
[caption file in SRT or VTT format]
```

### Resumable Upload Details

For large video files (typical for yoga classes — 30-90 min HD/4K):

1. **Initiate:** POST with metadata, get upload URI in `Location` header
2. **Upload chunks:** PUT binary data in chunks (recommended 5-10MB each)
3. **Resume on failure:** If interrupted, query the upload URI for status, then continue from last byte

**Quota cost:** 1,600 units per video upload (max ~6 uploads per day on default quota)

---

## Video Metadata Best Practices

### Title Formulas for Yoga Content

**Formula 1: Duration + Style + Descriptor**
```
30-Minute Vinyasa Flow for Energy & Strength
20-Min Yin Yoga for Flexibility & Relaxation
15-Minute Guided Morning Meditation
```

**Formula 2: Target Audience + Style + Benefit**
```
Beginner Yoga Full Body Stretch | No Props Needed
Intermediate Power Yoga for Core Strength
Prenatal Yoga for Second Trimester | Safe & Gentle
```

**Formula 3: Series + Episode + Topic**
```
Yoga Foundations Ep. 3: Sun Salutation A (Surya Namaskar A)
30-Day Yoga Challenge Day 15: Hip Openers
```

### Description Structure

```
[Hook — first 2 sentences visible in search results]

[Full description of the class — what to expect, level, props needed]

⏱️ Timestamps:
0:00 Welcome & Introduction
2:00 Centering Breath
5:00 Warm-Up Sequence
12:00 Standing Flow
22:00 Floor Work
27:00 Cool Down & Savasana

🧘 Props needed: Yoga mat, optional blocks and strap

📌 Related videos:
• Beginner Vinyasa Flow: [link]
• Yin Yoga for Recovery: [link]

🔗 Connect with me:
• Yoga Community: [Circle link]
• Website: [URL]
• Instagram: @[handle]

#yoga #vinyasaflow #homeyoga
```

### Tags Strategy

**Primary tags** (exact search matches):
```
morning vinyasa flow, 30 minute yoga, all levels yoga, home yoga workout
```

**Secondary tags** (broader reach):
```
yoga, vinyasa, yoga class, yoga workout, yoga for beginners
```

**Brand tags** (channel recognition):
```
carla gentile yoga, carla gentile
```

**Long-tail tags** (specific searches):
```
morning yoga routine for energy, yoga flow no equipment,
vinyasa yoga class at home, online yoga class 30 minutes
```

### Video Categories for Yoga

| Category ID | Name | When to Use |
|-------------|------|-------------|
| 17 | Sports | Physical yoga classes, flows, workouts |
| 26 | Howto & Style | Tutorials, pose breakdowns, technique videos |
| 22 | People & Blogs | Vlogs, day-in-the-life, personal stories |
| 27 | Education | Yoga philosophy, anatomy, teacher training |

---

## Playlist Organization

### Recommended Playlist Structure for Yoga Channels

| Playlist | Description | Use Case |
|----------|-------------|----------|
| **Vinyasa Flow Classes** | All vinyasa/flow style classes | Core content |
| **Yin Yoga & Restorative** | Slow, deep-stretch classes | Variety |
| **Meditation & Breathwork** | Guided meditations, pranayama | Complementary |
| **Beginner Yoga** | Foundation classes for new students | Onboarding |
| **Quick Yoga (Under 20 Min)** | Short practices for busy days | Accessibility |
| **Full-Length Classes (45+ Min)** | Longer immersive sessions | Dedicated practitioners |
| **Yoga Challenges** | 7-day, 21-day, 30-day series | Engagement |
| **Yoga for [Specific Need]** | Back pain, stress, flexibility, etc. | SEO/targeting |
| **Most Popular** | Top-performing videos | Social proof |
| **Seasonal/Monthly Series** | Spring yoga, holiday specials | Timely content |

### Creating a Playlist

```json
POST /playlists?part=snippet,status

{
  "snippet": {
    "title": "Vinyasa Flow Classes | Carla Gentile Yoga",
    "description": "Energizing vinyasa flow yoga classes for all levels. From quick 15-minute flows to full 60-minute classes. New videos added weekly!",
    "tags": ["vinyasa", "yoga flow", "yoga class"],
    "defaultLanguage": "en"
  },
  "status": {
    "privacyStatus": "public"
  }
}
```

### Playlist Best Practices

- **Title:** Include your channel name for branding (e.g., "Vinyasa Flow | Carla Gentile Yoga")
- **Description:** 2-3 sentences with keywords, describe what viewers will find
- **Order:** Put the best/most accessible video first (it becomes the playlist thumbnail)
- **Add all relevant videos:** A video can belong to multiple playlists
- **Create "Start Here" playlists:** Guide new subscribers to the best content

---

## Thumbnail Management

### Thumbnail Requirements

| Property | Requirement |
|----------|-------------|
| Dimensions | 1280×720px (minimum 640px wide) |
| Aspect ratio | 16:9 |
| Format | JPEG, PNG, GIF, BMP |
| Max file size | 2MB |
| Channel verification | Required for custom thumbnails |

### Thumbnail Design Tips for Yoga

**Elements of a great yoga thumbnail:**
- **Clear pose or action shot** — Show a recognizable yoga pose
- **Text overlay** — 3-5 words max, large readable font
- **Consistent branding** — Same colors, fonts, layout across videos
- **Face visible** — Thumbnails with faces get more clicks
- **High contrast** — Stands out at small sizes (mobile)
- **Avoid clutter** — Simple backgrounds, minimal text

**Template layout:**
```
┌────────────────────────────────────────┐
│                                        │
│   [Yoga pose photo]    ┌────────────┐  │
│                        │ 30 MIN     │  │
│                        │ VINYASA    │  │
│                        │ FLOW       │  │
│                        └────────────┘  │
│                                        │
│   [Brand logo/name in corner]          │
└────────────────────────────────────────┘
```

### Upload Custom Thumbnail via API

```python
def set_thumbnail(video_id, image_path, oauth_token):
    """Upload a custom thumbnail for a video."""
    import requests

    url = f"https://www.googleapis.com/upload/youtube/v3/thumbnails/set"
    params = {"videoId": video_id}
    headers = {
        "Authorization": f"Bearer {oauth_token}",
        "Content-Type": "image/jpeg"
    }

    with open(image_path, "rb") as f:
        response = requests.post(url, params=params, headers=headers, data=f)

    response.raise_for_status()
    return response.json()
```

---

## Captions & Accessibility

### Why Captions Matter

- **Accessibility:** Deaf/hard-of-hearing viewers
- **SEO:** YouTube indexes caption text for search
- **Engagement:** Many viewers watch without sound
- **Global reach:** Auto-translate becomes available with captions

### Caption Options

| Method | Quality | Effort |
|--------|---------|--------|
| Auto-generated | Fair (YouTube's ASR) | None — automatic |
| Upload SRT/VTT | Excellent | Moderate — need caption file |
| Manual in YouTube Studio | Excellent | High — type everything |
| Third-party service | Excellent | Low effort, some cost |

### SRT Caption Format

```srt
1
00:00:00,000 --> 00:00:03,500
Welcome to today's morning vinyasa flow class.

2
00:00:03,500 --> 00:00:07,000
We'll start in a comfortable seated position.

3
00:00:07,000 --> 00:00:12,000
Take a moment to close your eyes and
connect with your breath.
```

### Upload Captions via API

```
POST /captions?part=snippet
Authorization: Bearer YOUR_OAUTH_TOKEN
Content-Type: multipart/related; boundary=BOUNDARY

--BOUNDARY
Content-Type: application/json

{
  "snippet": {
    "videoId": "VIDEO_ID",
    "language": "en",
    "name": "English",
    "isDraft": false
  }
}
--BOUNDARY
Content-Type: text/plain

[SRT or VTT file content]
--BOUNDARY--
```

---

## Content Scheduling

### Scheduling a Video for Future Publication

When uploading, set `privacyStatus` to `private` and add `publishAt`:

```json
{
  "status": {
    "privacyStatus": "private",
    "publishAt": "2026-03-15T14:00:00.000Z"
  }
}
```

**Important notes:**
- `publishAt` requires ISO 8601 format with timezone
- The video must be set to `private` for scheduling to work
- YouTube automatically changes it to `public` at the scheduled time
- Minimum scheduling: a few minutes from now
- Subscribers get notified at publish time

### Content Calendar for Yoga Channel

**Recommended upload schedule:**

| Day | Content Type | Example |
|-----|-------------|---------|
| Monday | Full-length flow class | "Monday Morning Vinyasa Flow" |
| Wednesday | Short practice or tutorial | "10-Min Desk Yoga" or "How to: Crow Pose" |
| Friday | Specialty class | "Yin Yoga Friday" or "Meditation & Breathwork" |

**Consistency is key** — YouTube's algorithm rewards regular upload schedules.

---

## Video Privacy & Visibility

### Privacy Settings

| Setting | Visibility | Use Case |
|---------|-----------|----------|
| `public` | Everyone can find and watch | Published content |
| `unlisted` | Only people with the link can watch | Members-only content shared via Circle |
| `private` | Only you (and invited accounts) | Drafts, scheduled videos |

### Using Unlisted for Members-Only Content

Create a premium content strategy by combining YouTube + Circle:

1. Upload yoga class to YouTube as **unlisted**
2. Share the unlisted link in your **Circle community** (gated space)
3. Free viewers get public videos; paying members get unlisted extras
4. This uses YouTube's hosting/streaming without exposing content publicly

---

## Bulk Operations

### Bulk Update Video Descriptions

Add a new link or CTA to all existing video descriptions:

```python
def bulk_update_descriptions(channel_id, append_text, oauth_token):
    """Append text to all video descriptions on a channel."""
    # 1. Get uploads playlist
    channel = youtube_get("channels", {
        "part": "contentDetails",
        "id": channel_id
    })
    uploads_playlist = channel["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]

    # 2. List all videos in uploads playlist
    videos = []
    page_token = None
    while True:
        params = {"part": "snippet", "playlistId": uploads_playlist, "maxResults": 50}
        if page_token:
            params["pageToken"] = page_token
        result = youtube_get("playlistItems", params)
        videos.extend(result["items"])
        page_token = result.get("nextPageToken")
        if not page_token:
            break

    # 3. Update each video's description
    for item in videos:
        video_id = item["snippet"]["resourceId"]["videoId"]
        # Get current video details
        video = youtube_get("videos", {"part": "snippet", "id": video_id})
        if video["items"]:
            snippet = video["items"][0]["snippet"]
            if append_text not in snippet["description"]:
                snippet["description"] += f"\n\n{append_text}"
                youtube_put("videos", {"part": "snippet"}, {
                    "id": video_id,
                    "snippet": snippet
                })
                print(f"Updated: {snippet['title']}")
```

### Bulk Add Videos to a Playlist

```python
def add_videos_to_playlist(playlist_id, video_ids, oauth_token):
    """Add multiple videos to a playlist."""
    for i, video_id in enumerate(video_ids):
        data = {
            "snippet": {
                "playlistId": playlist_id,
                "position": i,
                "resourceId": {
                    "kind": "youtube#video",
                    "videoId": video_id
                }
            }
        }
        youtube_post("playlistItems", {"part": "snippet"}, data)
        print(f"Added video {video_id} at position {i}")
```
