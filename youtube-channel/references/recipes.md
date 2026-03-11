# YouTube API Recipes — Practical Code Examples

Working code recipes for managing a YouTube channel, with a focus on yoga/wellness creators.

## Table of Contents

1. [Setup & Authentication](#setup--authentication)
2. [Channel Info](#channel-info)
3. [Video Management](#video-management)
4. [Playlist Management](#playlist-management)
5. [Comment Moderation](#comment-moderation)
6. [Analytics & Reporting](#analytics--reporting)
7. [Search & Research](#search--research)
8. [Bulk Operations](#bulk-operations)
9. [YouTube + Circle Integration](#youtube--circle-integration)

---

## Setup & Authentication

### Python Setup

```python
import requests
import json

BASE_URL = "https://www.googleapis.com/youtube/v3"
API_KEY = "YOUR_API_KEY"  # For read-only public data
OAUTH_TOKEN = "YOUR_OAUTH_TOKEN"  # For write operations

def youtube_get(resource, params=None):
    """GET request to YouTube Data API."""
    url = f"{BASE_URL}/{resource}"
    if params is None:
        params = {}
    params["key"] = API_KEY
    resp = requests.get(url, params=params)
    resp.raise_for_status()
    return resp.json()

def youtube_get_auth(resource, params=None):
    """Authenticated GET request."""
    url = f"{BASE_URL}/{resource}"
    headers = {"Authorization": f"Bearer {OAUTH_TOKEN}"}
    resp = requests.get(url, headers=headers, params=params or {})
    resp.raise_for_status()
    return resp.json()

def youtube_post(resource, params=None, data=None):
    """Authenticated POST request."""
    url = f"{BASE_URL}/{resource}"
    headers = {
        "Authorization": f"Bearer {OAUTH_TOKEN}",
        "Content-Type": "application/json"
    }
    resp = requests.post(url, headers=headers, params=params or {}, json=data)
    resp.raise_for_status()
    return resp.json()

def youtube_put(resource, params=None, data=None):
    """Authenticated PUT request."""
    url = f"{BASE_URL}/{resource}"
    headers = {
        "Authorization": f"Bearer {OAUTH_TOKEN}",
        "Content-Type": "application/json"
    }
    resp = requests.put(url, headers=headers, params=params or {}, json=data)
    resp.raise_for_status()
    return resp.json()

def youtube_delete(resource, params=None):
    """Authenticated DELETE request."""
    url = f"{BASE_URL}/{resource}"
    headers = {"Authorization": f"Bearer {OAUTH_TOKEN}"}
    resp = requests.delete(url, headers=headers, params=params or {})
    resp.raise_for_status()
    return resp
```

### JavaScript/Node Setup

```javascript
const BASE_URL = "https://www.googleapis.com/youtube/v3";
const API_KEY = "YOUR_API_KEY";
const OAUTH_TOKEN = "YOUR_OAUTH_TOKEN";

async function youtubeGet(resource, params = {}) {
  params.key = API_KEY;
  const url = new URL(`${BASE_URL}/${resource}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`${resp.status}: ${await resp.text()}`);
  return resp.json();
}

async function youtubePost(resource, params = {}, data = {}) {
  const url = new URL(`${BASE_URL}/${resource}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OAUTH_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
  if (!resp.ok) throw new Error(`${resp.status}: ${await resp.text()}`);
  return resp.json();
}
```

### OAuth 2.0 Token Flow (Python with google-auth)

```python
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import pickle
import os

SCOPES = [
    "https://www.googleapis.com/auth/youtube",
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/yt-analytics.readonly"
]

def get_authenticated_service():
    """Get an authenticated OAuth token, with caching."""
    creds = None
    # Load cached credentials
    if os.path.exists("token.pickle"):
        with open("token.pickle", "rb") as token:
            creds = pickle.load(token)

    # Refresh or create new credentials
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                "client_secrets.json", SCOPES
            )
            creds = flow.run_local_server(port=8080)

        # Save for future use
        with open("token.pickle", "wb") as token:
            pickle.dump(creds, token)

    return creds.token
```

---

## Channel Info

### Get Your Channel Details

```python
def get_my_channel():
    """Retrieve authenticated user's channel info."""
    result = youtube_get_auth("channels", {
        "part": "snippet,statistics,contentDetails,brandingSettings",
        "mine": "true"
    })
    if result["items"]:
        channel = result["items"][0]
        print(f"Channel: {channel['snippet']['title']}")
        print(f"Subscribers: {channel['statistics']['subscriberCount']}")
        print(f"Total Views: {channel['statistics']['viewCount']}")
        print(f"Video Count: {channel['statistics']['videoCount']}")
        print(f"Uploads Playlist: {channel['contentDetails']['relatedPlaylists']['uploads']}")
        return channel
    return None
```

### Update Channel Description and Keywords

```python
def update_channel_branding(channel_id, description=None, keywords=None, trailer_video_id=None):
    """Update channel branding settings."""
    # Get current settings first
    current = youtube_get_auth("channels", {
        "part": "brandingSettings",
        "id": channel_id
    })
    branding = current["items"][0]["brandingSettings"]

    if description:
        branding["channel"]["description"] = description
    if keywords:
        branding["channel"]["keywords"] = keywords
    if trailer_video_id:
        branding["channel"]["unsubscribedTrailer"] = trailer_video_id

    return youtube_put("channels", {"part": "brandingSettings"}, {
        "id": channel_id,
        "brandingSettings": branding
    })

# Example
update_channel_branding(
    "UCxxxxxxxx",
    description="Welcome to Carla Gentile Yoga! Vinyasa, Yin, Meditation & more.",
    keywords="yoga vinyasa meditation wellness mindfulness yin restorative pranayama"
)
```

---

## Video Management

### List All Channel Videos with Statistics

```python
def get_all_channel_videos(channel_id):
    """Get all videos from a channel with their statistics."""
    # Get uploads playlist ID
    channel = youtube_get("channels", {
        "part": "contentDetails",
        "id": channel_id
    })
    uploads_id = channel["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]

    # Paginate through all uploads
    all_video_ids = []
    page_token = None
    while True:
        params = {
            "part": "snippet",
            "playlistId": uploads_id,
            "maxResults": 50
        }
        if page_token:
            params["pageToken"] = page_token
        result = youtube_get("playlistItems", params)
        for item in result["items"]:
            all_video_ids.append(item["snippet"]["resourceId"]["videoId"])
        page_token = result.get("nextPageToken")
        if not page_token:
            break

    # Get statistics for all videos (batch by 50)
    all_videos = []
    for i in range(0, len(all_video_ids), 50):
        batch = all_video_ids[i:i+50]
        result = youtube_get("videos", {
            "part": "snippet,statistics,contentDetails",
            "id": ",".join(batch)
        })
        all_videos.extend(result["items"])

    return all_videos

def print_video_report(videos):
    """Print a summary report of channel videos."""
    print(f"{'Title':<60} {'Views':>10} {'Likes':>8} {'Comments':>8} {'Duration'}")
    print("-" * 105)
    for v in sorted(videos, key=lambda x: int(x["statistics"].get("viewCount", 0)), reverse=True):
        title = v["snippet"]["title"][:58]
        views = v["statistics"].get("viewCount", "0")
        likes = v["statistics"].get("likeCount", "0")
        comments = v["statistics"].get("commentCount", "0")
        duration = v["contentDetails"]["duration"]
        print(f"{title:<60} {views:>10} {likes:>8} {comments:>8} {duration}")
```

### Upload a Video

```python
def upload_video(file_path, title, description, tags, category_id="17",
                 privacy="private", publish_at=None, playlist_id=None):
    """Upload a video with metadata and optionally add to a playlist."""
    import os

    # Step 1: Initiate resumable upload
    metadata = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": tags,
            "categoryId": category_id,
            "defaultLanguage": "en"
        },
        "status": {
            "privacyStatus": privacy,
            "selfDeclaredMadeForKids": False
        }
    }
    if publish_at and privacy == "private":
        metadata["status"]["publishAt"] = publish_at

    headers = {
        "Authorization": f"Bearer {OAUTH_TOKEN}",
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": "video/*",
        "X-Upload-Content-Length": str(os.path.getsize(file_path))
    }

    init_url = "https://www.googleapis.com/upload/youtube/v3/videos"
    params = {"uploadType": "resumable", "part": "snippet,status"}
    resp = requests.post(init_url, headers=headers, params=params, json=metadata)
    resp.raise_for_status()
    upload_url = resp.headers["Location"]

    # Step 2: Upload video file
    with open(file_path, "rb") as f:
        upload_headers = {
            "Authorization": f"Bearer {OAUTH_TOKEN}",
            "Content-Type": "video/*"
        }
        resp = requests.put(upload_url, headers=upload_headers, data=f)
        resp.raise_for_status()
        video = resp.json()

    video_id = video["id"]
    print(f"Uploaded video: {title} (ID: {video_id})")

    # Step 3: Add to playlist if specified
    if playlist_id:
        youtube_post("playlistItems", {"part": "snippet"}, {
            "snippet": {
                "playlistId": playlist_id,
                "resourceId": {
                    "kind": "youtube#video",
                    "videoId": video_id
                }
            }
        })
        print(f"Added to playlist: {playlist_id}")

    return video

# Example: Upload a yoga class
upload_video(
    "morning_vinyasa_march15.mp4",
    "30-Minute Morning Vinyasa Flow | All Levels | Carla Gentile Yoga",
    "Start your day with this energizing vinyasa flow class!\n\n"
    "⏱️ Timestamps:\n0:00 Welcome\n2:00 Centering\n5:00 Warm-up\n...",
    ["yoga", "vinyasa", "morning yoga", "all levels", "30 minute yoga"],
    privacy="private",
    publish_at="2026-03-15T14:00:00Z",
    playlist_id="PLxxxxxxxx"
)
```

### Update Video Metadata

```python
def update_video_metadata(video_id, title=None, description=None, tags=None):
    """Update a video's metadata (title, description, tags)."""
    # Get current metadata
    result = youtube_get_auth("videos", {"part": "snippet", "id": video_id})
    if not result["items"]:
        raise ValueError(f"Video not found: {video_id}")

    snippet = result["items"][0]["snippet"]

    if title:
        snippet["title"] = title
    if description:
        snippet["description"] = description
    if tags:
        snippet["tags"] = tags

    return youtube_put("videos", {"part": "snippet"}, {
        "id": video_id,
        "snippet": snippet
    })
```

### Set Custom Thumbnail

```python
def set_thumbnail(video_id, image_path):
    """Upload a custom thumbnail for a video."""
    url = "https://www.googleapis.com/upload/youtube/v3/thumbnails/set"
    params = {"videoId": video_id}
    headers = {
        "Authorization": f"Bearer {OAUTH_TOKEN}",
        "Content-Type": "image/jpeg"
    }

    with open(image_path, "rb") as f:
        resp = requests.post(url, params=params, headers=headers, data=f)

    resp.raise_for_status()
    print(f"Thumbnail set for video {video_id}")
    return resp.json()
```

---

## Playlist Management

### Create Playlists for Yoga Channel

```python
def create_yoga_playlists():
    """Set up the standard playlist structure for a yoga channel."""
    playlists = [
        {
            "title": "Vinyasa Flow Classes | Carla Gentile Yoga",
            "description": "Energizing vinyasa flow yoga classes for all levels. "
                           "From quick 15-minute flows to full 60-minute sessions."
        },
        {
            "title": "Yin Yoga & Restorative | Carla Gentile Yoga",
            "description": "Slow, deep-stretching yin yoga and restorative classes "
                           "for flexibility, recovery, and relaxation."
        },
        {
            "title": "Meditation & Breathwork | Carla Gentile Yoga",
            "description": "Guided meditations, pranayama breathing exercises, "
                           "and mindfulness practices."
        },
        {
            "title": "Beginner Yoga Series | Carla Gentile Yoga",
            "description": "New to yoga? Start here! Foundation classes covering "
                           "basic poses, alignment, and breathing."
        },
        {
            "title": "Quick Yoga (Under 20 Min) | Carla Gentile Yoga",
            "description": "Short yoga practices for busy days. Perfect for a "
                           "quick morning stretch or lunch break yoga."
        },
        {
            "title": "Full-Length Classes (45+ Min) | Carla Gentile Yoga",
            "description": "Longer immersive yoga sessions for a complete practice. "
                           "All styles and levels."
        },
        {
            "title": "Yoga Challenges | Carla Gentile Yoga",
            "description": "Multi-day yoga challenges to build consistency. "
                           "7-day, 21-day, and 30-day series."
        },
        {
            "title": "Yoga for Back Pain & Posture | Carla Gentile Yoga",
            "description": "Therapeutic yoga sequences targeting back pain relief, "
                           "spinal health, and posture improvement."
        },
    ]

    created = []
    for playlist in playlists:
        result = youtube_post("playlists", {"part": "snippet,status"}, {
            "snippet": {
                "title": playlist["title"],
                "description": playlist["description"],
                "defaultLanguage": "en"
            },
            "status": {
                "privacyStatus": "public"
            }
        })
        created.append(result)
        print(f"Created playlist: {playlist['title']} (ID: {result['id']})")

    return created
```

### Add Videos to a Playlist

```python
def add_to_playlist(playlist_id, video_ids):
    """Add multiple videos to a playlist in order."""
    for position, video_id in enumerate(video_ids):
        youtube_post("playlistItems", {"part": "snippet"}, {
            "snippet": {
                "playlistId": playlist_id,
                "position": position,
                "resourceId": {
                    "kind": "youtube#video",
                    "videoId": video_id
                }
            }
        })
        print(f"Added {video_id} at position {position}")
```

### List Videos in a Playlist

```python
def list_playlist_videos(playlist_id):
    """Get all videos in a playlist with their details."""
    videos = []
    page_token = None
    while True:
        params = {
            "part": "snippet,contentDetails",
            "playlistId": playlist_id,
            "maxResults": 50
        }
        if page_token:
            params["pageToken"] = page_token
        result = youtube_get("playlistItems", params)
        videos.extend(result["items"])
        page_token = result.get("nextPageToken")
        if not page_token:
            break

    for v in videos:
        title = v["snippet"]["title"]
        video_id = v["contentDetails"]["videoId"]
        position = v["snippet"]["position"]
        print(f"  {position}: {title} ({video_id})")

    return videos
```

---

## Comment Moderation

### Review and Approve Pending Comments

```python
def review_pending_comments(channel_id):
    """List comments held for review and return them for action."""
    result = youtube_get_auth("commentThreads", {
        "part": "snippet",
        "allThreadsRelatedToChannelId": channel_id,
        "moderationStatus": "heldForReview",
        "maxResults": 100
    })

    comments = []
    for thread in result.get("items", []):
        comment = thread["snippet"]["topLevelComment"]["snippet"]
        comments.append({
            "id": thread["snippet"]["topLevelComment"]["id"],
            "author": comment["authorDisplayName"],
            "text": comment["textDisplay"],
            "video_id": thread["snippet"].get("videoId", "N/A"),
            "published": comment["publishedAt"]
        })
        print(f"[{comment['authorDisplayName']}]: {comment['textDisplay'][:80]}...")

    return comments

def approve_comment(comment_id):
    """Approve a held comment."""
    url = f"{BASE_URL}/comments/setModerationStatus"
    params = {"id": comment_id, "moderationStatus": "published"}
    headers = {"Authorization": f"Bearer {OAUTH_TOKEN}"}
    resp = requests.post(url, headers=headers, params=params)
    resp.raise_for_status()
    print(f"Approved comment: {comment_id}")

def reject_comment(comment_id, ban_author=False):
    """Reject a comment, optionally banning the author."""
    url = f"{BASE_URL}/comments/setModerationStatus"
    params = {
        "id": comment_id,
        "moderationStatus": "rejected",
        "banAuthor": str(ban_author).lower()
    }
    headers = {"Authorization": f"Bearer {OAUTH_TOKEN}"}
    resp = requests.post(url, headers=headers, params=params)
    resp.raise_for_status()
    print(f"Rejected comment: {comment_id} (ban: {ban_author})")
```

### Reply to Comments

```python
def reply_to_comment(parent_comment_id, reply_text):
    """Reply to a specific comment."""
    return youtube_post("comments", {"part": "snippet"}, {
        "snippet": {
            "parentId": parent_comment_id,
            "textOriginal": reply_text
        }
    })

# Example: Thank a subscriber
reply_to_comment(
    "UgxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxAAgBQ",
    "Thank you so much for practicing with me! So glad you enjoyed the class. 🧘 "
    "Let me know if there's a specific class style you'd like to see next!"
)
```

### List Recent Comments Across Channel

```python
def get_recent_channel_comments(channel_id, max_results=50):
    """Get the most recent comments across all channel videos."""
    result = youtube_get_auth("commentThreads", {
        "part": "snippet",
        "allThreadsRelatedToChannelId": channel_id,
        "maxResults": max_results,
        "order": "time",
        "moderationStatus": "published"
    })

    comments = []
    for thread in result.get("items", []):
        comment = thread["snippet"]["topLevelComment"]["snippet"]
        comments.append({
            "id": thread["id"],
            "comment_id": thread["snippet"]["topLevelComment"]["id"],
            "author": comment["authorDisplayName"],
            "text": comment["textDisplay"],
            "video_id": thread["snippet"].get("videoId"),
            "likes": comment.get("likeCount", 0),
            "replies": thread["snippet"]["totalReplyCount"],
            "published": comment["publishedAt"]
        })

    return comments
```

---

## Analytics & Reporting

### Weekly Channel Report

```python
def weekly_channel_report(start_date, end_date):
    """Pull a weekly analytics summary for the channel."""
    analytics_url = "https://youtubeanalytics.googleapis.com/v2/reports"
    headers = {"Authorization": f"Bearer {OAUTH_TOKEN}"}

    # Daily metrics
    params = {
        "ids": "channel==MINE",
        "startDate": start_date,
        "endDate": end_date,
        "metrics": "views,estimatedMinutesWatched,averageViewDuration,"
                   "subscribersGained,subscribersLost,likes,comments,shares",
        "dimensions": "day",
        "sort": "day"
    }

    resp = requests.get(analytics_url, headers=headers, params=params)
    resp.raise_for_status()
    data = resp.json()

    print(f"\n📊 Channel Report: {start_date} to {end_date}")
    print("=" * 60)

    totals = {"views": 0, "watch_min": 0, "subs_gained": 0,
              "subs_lost": 0, "likes": 0, "comments": 0}
    for row in data.get("rows", []):
        totals["views"] += row[1]
        totals["watch_min"] += row[2]
        totals["subs_gained"] += row[4]
        totals["subs_lost"] += row[5]
        totals["likes"] += row[6]
        totals["comments"] += row[7]

    print(f"Total Views: {totals['views']:,}")
    print(f"Watch Time: {totals['watch_min']:,.0f} minutes ({totals['watch_min']/60:.1f} hours)")
    print(f"Net Subscribers: +{totals['subs_gained'] - totals['subs_lost']}")
    print(f"Likes: {totals['likes']:,}")
    print(f"Comments: {totals['comments']:,}")

    return data
```

### Top Videos Report

```python
def top_videos_report(start_date, end_date, max_results=10):
    """Get the top performing videos in a date range."""
    analytics_url = "https://youtubeanalytics.googleapis.com/v2/reports"
    headers = {"Authorization": f"Bearer {OAUTH_TOKEN}"}

    params = {
        "ids": "channel==MINE",
        "startDate": start_date,
        "endDate": end_date,
        "metrics": "views,estimatedMinutesWatched,averageViewDuration,likes",
        "dimensions": "video",
        "sort": "-estimatedMinutesWatched",
        "maxResults": max_results
    }

    resp = requests.get(analytics_url, headers=headers, params=params)
    resp.raise_for_status()
    data = resp.json()

    # Get video titles
    if data.get("rows"):
        video_ids = [row[0] for row in data["rows"]]
        videos = youtube_get("videos", {
            "part": "snippet",
            "id": ",".join(video_ids)
        })
        title_map = {v["id"]: v["snippet"]["title"] for v in videos["items"]}

        print(f"\n🏆 Top {max_results} Videos: {start_date} to {end_date}")
        print("=" * 80)
        for row in data["rows"]:
            vid_id, views, watch_min, avg_dur, likes = row
            title = title_map.get(vid_id, vid_id)[:50]
            print(f"  {title:<52} Views: {views:>6}  Watch: {watch_min:>6.0f}min")

    return data
```

---

## Search & Research

### Research Competitor Content

```python
def research_topic(query, max_results=10):
    """Search YouTube for a topic and analyze top results."""
    result = youtube_get("search", {
        "part": "snippet",
        "q": query,
        "type": "video",
        "order": "viewCount",
        "maxResults": max_results
    })

    video_ids = [item["id"]["videoId"] for item in result["items"]]

    # Get statistics for these videos
    stats = youtube_get("videos", {
        "part": "snippet,statistics,contentDetails",
        "id": ",".join(video_ids)
    })

    print(f"\n🔍 Research: '{query}'")
    print("=" * 90)
    for v in stats["items"]:
        title = v["snippet"]["title"][:55]
        views = int(v["statistics"].get("viewCount", 0))
        likes = int(v["statistics"].get("likeCount", 0))
        duration = v["contentDetails"]["duration"]
        print(f"  {title:<57} {views:>10} views  {likes:>6} likes  {duration}")

    return stats

# Research popular yoga content
research_topic("morning yoga flow 30 minutes")
research_topic("yoga for beginners full body stretch")
research_topic("yin yoga relaxation")
```

### Find Content Gaps

```python
def find_content_gaps(topic, days_back=90):
    """Find topics with demand but few recent uploads."""
    from datetime import datetime, timedelta

    cutoff = (datetime.now() - timedelta(days=days_back)).strftime("%Y-%m-%dT00:00:00Z")

    # Search for recent uploads on this topic
    recent = youtube_get("search", {
        "part": "snippet",
        "q": topic,
        "type": "video",
        "order": "date",
        "publishedAfter": cutoff,
        "maxResults": 50
    })

    # Also search by view count to see demand
    popular = youtube_get("search", {
        "part": "snippet",
        "q": topic,
        "type": "video",
        "order": "viewCount",
        "maxResults": 10
    })

    recent_count = len(recent.get("items", []))
    popular_views = []
    if popular.get("items"):
        vid_ids = [i["id"]["videoId"] for i in popular["items"]]
        stats = youtube_get("videos", {"part": "statistics", "id": ",".join(vid_ids)})
        popular_views = [int(v["statistics"].get("viewCount", 0)) for v in stats["items"]]

    avg_views = sum(popular_views) / len(popular_views) if popular_views else 0

    print(f"\n📈 Content Gap Analysis: '{topic}'")
    print(f"  Recent uploads (last {days_back} days): {recent_count}")
    print(f"  Top 10 avg views: {avg_views:,.0f}")
    print(f"  Opportunity score: {'HIGH' if avg_views > 50000 and recent_count < 20 else 'MEDIUM' if avg_views > 10000 else 'LOW'}")

    return {"topic": topic, "recent_count": recent_count, "avg_views": avg_views}
```

---

## Bulk Operations

### Bulk Update All Video Descriptions

```python
def bulk_append_to_descriptions(channel_id, text_to_append):
    """Add text (e.g., a new link) to all video descriptions."""
    videos = get_all_channel_videos(channel_id)

    updated = 0
    skipped = 0
    for v in videos:
        current_desc = v["snippet"]["description"]
        if text_to_append in current_desc:
            skipped += 1
            continue

        v["snippet"]["description"] = current_desc + "\n\n" + text_to_append
        try:
            youtube_put("videos", {"part": "snippet"}, {
                "id": v["id"],
                "snippet": v["snippet"]
            })
            updated += 1
            print(f"Updated: {v['snippet']['title'][:60]}")
        except Exception as e:
            print(f"Failed: {v['snippet']['title'][:60]} — {e}")

    print(f"\nDone: {updated} updated, {skipped} already had the text")

# Example: Add Circle community link to all videos
bulk_append_to_descriptions(
    "UCxxxxxxxx",
    "🧘 Join my yoga community for exclusive content and live classes:\n"
    "https://carlagentileyoga.circle.so"
)
```

### Bulk Add Tags to All Videos

```python
def bulk_add_tags(channel_id, new_tags):
    """Add tags to all videos that don't already have them."""
    videos = get_all_channel_videos(channel_id)

    for v in videos:
        current_tags = v["snippet"].get("tags", [])
        tags_to_add = [t for t in new_tags if t not in current_tags]
        if not tags_to_add:
            continue

        v["snippet"]["tags"] = current_tags + tags_to_add
        try:
            youtube_put("videos", {"part": "snippet"}, {
                "id": v["id"],
                "snippet": v["snippet"]
            })
            print(f"Added tags to: {v['snippet']['title'][:60]}")
        except Exception as e:
            print(f"Failed: {v['snippet']['title'][:60]} — {e}")

# Example: Ensure all videos have brand tags
bulk_add_tags("UCxxxxxxxx", ["carla gentile yoga", "online yoga"])
```

---

## YouTube + Circle Integration

### Post New YouTube Video to Circle Community

```python
import requests as req

CIRCLE_BASE = "https://app.circle.so/api/admin/v2"
CIRCLE_TOKEN = "YOUR_CIRCLE_API_TOKEN"

def post_youtube_to_circle(video_id, circle_space_id):
    """Create a Circle post announcing a new YouTube video."""
    # Get video details from YouTube
    video = youtube_get("videos", {
        "part": "snippet",
        "id": video_id
    })["items"][0]

    title = video["snippet"]["title"]
    description = video["snippet"]["description"].split("\n")[0]  # First line
    youtube_url = f"https://www.youtube.com/watch?v={video_id}"

    # Create Circle post
    circle_headers = {
        "Authorization": f"Token {CIRCLE_TOKEN}",
        "Content-Type": "application/json"
    }

    post_data = {
        "space_id": circle_space_id,
        "name": f"🎬 New Video: {title}",
        "status": "published",
        "body": (
            f"<p>New class is live on YouTube!</p>"
            f"<p>{description}</p>"
            f"<p><a href='{youtube_url}'>Watch now on YouTube →</a></p>"
            f"<p>{youtube_url}</p>"
            f"<p>Let me know what you think in the comments below! 🧘</p>"
        ),
        "is_comments_enabled": True,
        "is_liking_enabled": True
    }

    resp = req.post(
        f"{CIRCLE_BASE}/posts",
        headers=circle_headers,
        json=post_data
    )
    resp.raise_for_status()
    print(f"Posted to Circle: {title}")
    return resp.json()
```

### Sync YouTube Stats to Circle Post

```python
def create_weekly_youtube_digest(channel_id, circle_space_id):
    """Create a weekly Circle post with YouTube channel stats and top videos."""
    # Get channel stats
    channel = youtube_get("channels", {
        "part": "statistics",
        "id": channel_id
    })["items"][0]

    stats = channel["statistics"]

    # Get recent videos (last 7 days)
    from datetime import datetime, timedelta
    week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%dT00:00:00Z")
    recent = youtube_get("search", {
        "part": "snippet",
        "channelId": channel_id,
        "type": "video",
        "order": "date",
        "publishedAfter": week_ago,
        "maxResults": 10
    })

    # Build post body
    body = f"<h2>📊 This Week on YouTube</h2>"
    body += f"<p><strong>Total Subscribers:</strong> {stats['subscriberCount']}</p>"
    body += f"<p><strong>Total Views:</strong> {stats['viewCount']}</p>"

    if recent["items"]:
        body += "<h3>New Videos This Week:</h3><ul>"
        for item in recent["items"]:
            vid_id = item["id"]["videoId"]
            title = item["snippet"]["title"]
            url = f"https://www.youtube.com/watch?v={vid_id}"
            body += f"<li><a href='{url}'>{title}</a></li>"
        body += "</ul>"

    body += "<p>Which class was your favorite this week? Let us know below! 💬</p>"

    # Post to Circle
    circle_headers = {
        "Authorization": f"Token {CIRCLE_TOKEN}",
        "Content-Type": "application/json"
    }
    resp = req.post(f"{CIRCLE_BASE}/posts", headers=circle_headers, json={
        "space_id": circle_space_id,
        "name": "📊 Weekly YouTube Roundup",
        "status": "published",
        "body": body,
        "is_comments_enabled": True,
        "is_liking_enabled": True
    })
    resp.raise_for_status()
    print("Posted weekly YouTube digest to Circle")
    return resp.json()
```
