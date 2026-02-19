# Circle.so API Recipes — Common Automation Patterns

Practical code recipes for managing Circle.so communities, with a focus on yoga/wellness communities.

## Table of Contents

1. [Setup & Authentication](#setup--authentication)
2. [Member Management](#member-management)
3. [Space Organization](#space-organization)
4. [Event Scheduling](#event-scheduling)
5. [Course Management](#course-management)
6. [Content & Posts](#content--posts)
7. [Access Control & Monetization](#access-control--monetization)
8. [Bulk Operations](#bulk-operations)
9. [Reporting & Analytics](#reporting--analytics)

---

## Setup & Authentication

### Python Setup

```python
import requests

BASE_URL = "https://app.circle.so/api/admin/v2"
HEADERS = {
    "Authorization": "Token YOUR_API_TOKEN",
    "Content-Type": "application/json"
}

def circle_get(endpoint, params=None):
    """GET request with automatic pagination."""
    url = f"{BASE_URL}/{endpoint}"
    resp = requests.get(url, headers=HEADERS, params=params)
    resp.raise_for_status()
    return resp.json()

def circle_post(endpoint, data=None):
    """POST request to create resources."""
    url = f"{BASE_URL}/{endpoint}"
    resp = requests.post(url, headers=HEADERS, json=data)
    resp.raise_for_status()
    return resp.json()

def circle_put(endpoint, data=None):
    """PUT request to update resources."""
    url = f"{BASE_URL}/{endpoint}"
    resp = requests.put(url, headers=HEADERS, json=data)
    resp.raise_for_status()
    return resp.json()

def circle_delete(endpoint, params=None):
    """DELETE request to remove resources."""
    url = f"{BASE_URL}/{endpoint}"
    resp = requests.delete(url, headers=HEADERS, params=params)
    resp.raise_for_status()
    return resp.json()
```

### JavaScript/Node Setup

```javascript
const BASE_URL = "https://app.circle.so/api/admin/v2";
const HEADERS = {
  "Authorization": "Token YOUR_API_TOKEN",
  "Content-Type": "application/json"
};

async function circleGet(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const resp = await fetch(url, { headers: HEADERS });
  if (!resp.ok) throw new Error(`${resp.status}: ${await resp.text()}`);
  return resp.json();
}

async function circlePost(endpoint, data) {
  const resp = await fetch(`${BASE_URL}/${endpoint}`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(data)
  });
  if (!resp.ok) throw new Error(`${resp.status}: ${await resp.text()}`);
  return resp.json();
}
```

---

## Member Management

### Invite a New Yoga Student

```python
def invite_student(email, name, space_ids=None, access_group_ids=None):
    """Invite a new student to the yoga community."""
    data = {
        "email": email,
        "name": name,
        "skip_invitation": False  # Send welcome email
    }
    if space_ids:
        data["space_ids"] = space_ids
    if access_group_ids:
        data["access_group_ids"] = access_group_ids
    return circle_post("community_members", data)

# Example: Invite to Beginner spaces
invite_student(
    "jane@example.com",
    "Jane Doe",
    space_ids=[101, 102],  # Beginner Yoga, Community Chat
    access_group_ids=[201]  # Free Tier
)
```

### Bulk Invite from CSV

```python
import csv

def bulk_invite_from_csv(csv_path, default_space_ids, default_access_group_ids):
    """Bulk invite members from a CSV file (columns: email, name)."""
    results = {"success": [], "failed": []}
    with open(csv_path) as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                result = invite_student(
                    row["email"], row["name"],
                    default_space_ids, default_access_group_ids
                )
                results["success"].append(row["email"])
            except Exception as e:
                results["failed"].append({"email": row["email"], "error": str(e)})
    return results
```

### Search and Tag Members

```python
def find_and_tag_member(email, tag_name):
    """Find a member by email and apply a tag."""
    # Search for member
    members = circle_get("community_members/search", {"email": email})
    if not members:
        raise ValueError(f"No member found with email: {email}")
    member_id = members[0]["id"]

    # Find or create tag
    tags = circle_get("member_tags")
    tag = next((t for t in tags if t["name"] == tag_name), None)
    if not tag:
        tag = circle_post("member_tags", {"name": tag_name})

    # Apply tag
    return circle_post("tagged_members", {
        "community_member_id": member_id,
        "member_tag_id": tag["id"]
    })
```

### List All Members with Pagination

```python
def get_all_members():
    """Retrieve all community members across all pages."""
    all_members = []
    page = 1
    while True:
        members = circle_get("community_members", {"page": page, "per_page": 50})
        if not members:
            break
        all_members.extend(members)
        if len(members) < 50:
            break
        page += 1
    return all_members
```

---

## Space Organization

### Set Up Yoga Community Spaces

```python
def setup_yoga_community(space_group_id):
    """Create a complete space structure for a yoga community."""
    spaces = [
        {"name": "Welcome & Introductions", "space_type": "discussion",
         "description": "Introduce yourself to the community!"},
        {"name": "Class Schedule & Events", "space_type": "event",
         "description": "Upcoming yoga classes and workshops"},
        {"name": "Vinyasa Flow", "space_type": "discussion",
         "description": "Discuss and share your Vinyasa practice"},
        {"name": "Yin & Restorative", "space_type": "discussion",
         "description": "Slow down with Yin and Restorative yoga"},
        {"name": "Meditation & Breathwork", "space_type": "discussion",
         "description": "Pranayama, meditation, and mindfulness"},
        {"name": "Pose Library", "space_type": "image_gallery",
         "description": "Visual guides for yoga poses"},
        {"name": "200hr Teacher Training", "space_type": "course",
         "description": "Yoga teacher training course materials"},
        {"name": "Community Chat", "space_type": "chat",
         "description": "Casual chat with fellow yogis"},
    ]

    created = []
    for space_def in spaces:
        space_def["space_group_id"] = space_group_id
        space_def["is_private"] = False
        result = circle_post("spaces", space_def)
        created.append(result)
        print(f"Created space: {space_def['name']}")
    return created
```

---

## Event Scheduling

### Create Recurring Yoga Class

```python
def create_weekly_class(space_id, name, description, day_of_week,
                        start_hour, duration_minutes=60, zoom_link=None):
    """Create a recurring weekly yoga class event."""
    from datetime import datetime, timedelta

    # Map day names to iCal day codes
    day_map = {
        "monday": "MO", "tuesday": "TU", "wednesday": "WE",
        "thursday": "TH", "friday": "FR", "saturday": "SA", "sunday": "SU"
    }
    ical_day = day_map[day_of_week.lower()]

    # Calculate next occurrence
    today = datetime.now()
    target_day = list(day_map.keys()).index(day_of_week.lower())
    days_ahead = target_day - today.weekday()
    if days_ahead <= 0:
        days_ahead += 7
    next_date = today + timedelta(days=days_ahead)

    start_time = next_date.replace(hour=start_hour, minute=0, second=0)
    end_time = start_time + timedelta(minutes=duration_minutes)

    event_data = {
        "space_id": space_id,
        "name": name,
        "description": description,
        "start_time": start_time.isoformat() + "Z",
        "end_time": end_time.isoformat() + "Z",
        "location_type": "virtual",
        "is_recurring": True,
        "recurrence_rule": f"FREQ=WEEKLY;BYDAY={ical_day}"
    }
    if zoom_link:
        event_data["external_link"] = zoom_link

    return circle_post("events", event_data)

# Example: Set up weekly class schedule
create_weekly_class(123, "Morning Vinyasa", "Energizing morning flow",
                    "monday", 9, 75, "https://zoom.us/j/123")
create_weekly_class(123, "Yin Yoga", "Deep stretch and relaxation",
                    "wednesday", 18, 60, "https://zoom.us/j/456")
create_weekly_class(123, "Weekend Flow", "All-levels weekend practice",
                    "saturday", 10, 90, "https://zoom.us/j/789")
```

### RSVP Members to Events

```python
def rsvp_members_to_event(event_id, member_ids):
    """RSVP multiple members to an event."""
    results = []
    for member_id in member_ids:
        try:
            result = circle_post("event_attendees", {
                "event_id": event_id,
                "community_member_id": member_id
            })
            results.append({"member_id": member_id, "status": "success"})
        except Exception as e:
            results.append({"member_id": member_id, "status": "failed", "error": str(e)})
    return results
```

---

## Course Management

### Build a Yoga Course

```python
def create_yoga_course(space_id, course_structure):
    """
    Create a full course with sections and lessons.

    course_structure = [
        {
            "section_name": "Week 1: Foundations",
            "lessons": [
                {"name": "Intro to Yoga Philosophy", "body": "..."},
                {"name": "Basic Breath Work", "body": "..."},
            ]
        },
        ...
    ]
    """
    for section_def in course_structure:
        section = circle_post("course_sections", {
            "space_id": space_id,
            "name": section_def["section_name"]
        })
        print(f"Created section: {section_def['section_name']}")

        for lesson_def in section_def["lessons"]:
            lesson = circle_post("course_lessons", {
                "course_section_id": section["id"],
                "name": lesson_def["name"],
                "body": lesson_def.get("body", "")
            })
            print(f"  Created lesson: {lesson_def['name']}")
```

### Track Student Progress

```python
def mark_lesson_complete(member_id, lesson_id):
    """Mark a course lesson as completed for a member."""
    return circle_put("course_lesson_progress", {
        "community_member_id": member_id,
        "course_lesson_id": lesson_id,
        "status": "completed"
    })
```

---

## Content & Posts

### Create an Announcement Post

```python
def create_announcement(space_id, title, body_html, pin=False):
    """Create an announcement post in a space."""
    data = {
        "space_id": space_id,
        "name": title,
        "status": "published",
        "body": body_html,
        "is_comments_enabled": True,
        "is_liking_enabled": True
    }
    return circle_post("posts", data)

# Example
create_announcement(
    123,
    "New Year Yoga Challenge Starts January 1st!",
    "<p>Join us for a 30-day yoga challenge to kick off the new year.</p>"
    "<p>Practice daily and share your progress in this space!</p>"
)
```

### Create a Post with TipTap Body

```python
def create_rich_post(space_id, title, paragraphs):
    """Create a post with TipTap rich text body."""
    content = []
    for para in paragraphs:
        content.append({
            "type": "paragraph",
            "content": [{"type": "text", "text": para}]
        })

    data = {
        "space_id": space_id,
        "name": title,
        "status": "published",
        "tiptap_body": {
            "body": {
                "type": "doc",
                "content": content
            }
        }
    }
    return circle_post("posts", data)
```

---

## Access Control & Monetization

### Set Up Membership Tiers

```python
def setup_membership_tiers():
    """Create access groups for different membership levels."""
    tiers = [
        {"name": "Free Community", "description": "Access to public spaces and community chat"},
        {"name": "Monthly Member", "description": "Access to all classes and recordings"},
        {"name": "Annual Member", "description": "All classes plus teacher training content"},
        {"name": "Teacher Training", "description": "200hr YTT program access"},
    ]

    created_groups = []
    for tier in tiers:
        group = circle_post("access_groups", tier)
        created_groups.append(group)
        print(f"Created access group: {tier['name']} (ID: {group['id']})")
    return created_groups
```

### Move Member to New Tier

```python
def upgrade_member(member_id, old_group_id, new_group_id):
    """Move a member from one access group to another."""
    # Remove from old group
    circle_delete("access_groups/{}/community_members".format(old_group_id),
                  {"community_member_id": member_id})
    # Add to new group
    circle_post("access_groups/{}/community_members".format(new_group_id),
                {"community_member_id": member_id})
    print(f"Upgraded member {member_id} from group {old_group_id} to {new_group_id}")
```

---

## Bulk Operations

### Add All Members to a Space

```python
def add_all_members_to_space(space_id):
    """Add every community member to a specific space."""
    members = get_all_members()
    for member in members:
        try:
            circle_post("space_members", {
                "space_id": space_id,
                "community_member_id": member["id"]
            })
        except Exception:
            pass  # Member may already be in space
    print(f"Added {len(members)} members to space {space_id}")
```

---

## Reporting & Analytics

### Community Overview Report

```python
def community_report():
    """Generate a summary report of community activity."""
    community = circle_get("community")
    members = get_all_members()
    spaces = circle_get("spaces")
    access_groups = circle_get("access_groups")

    report = {
        "community_name": community["name"],
        "total_members": len(members),
        "total_spaces": len(spaces),
        "total_access_groups": len(access_groups),
        "spaces": [{"name": s["name"], "type": s.get("space_type", "unknown")}
                   for s in spaces],
    }

    # Get leaderboard for engagement
    try:
        leaderboard = circle_get("gamification/leaderboard")
        report["top_engaged_members"] = leaderboard[:10]
    except Exception:
        pass

    return report
```

### Export Members with Tags

```python
import csv

def export_members_csv(output_path):
    """Export all members with their tags to CSV."""
    members = get_all_members()
    tags = circle_get("member_tags")

    # Build tag lookup
    member_tags = {}
    for tag in tags:
        tagged = circle_get("tagged_members", {"member_tag_id": tag["id"]})
        for tm in tagged:
            mid = tm.get("community_member_id")
            if mid not in member_tags:
                member_tags[mid] = []
            member_tags[mid].append(tag["name"])

    with open(output_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["ID", "Name", "Email", "Tags", "Created At"])
        for m in members:
            writer.writerow([
                m["id"], m.get("name", ""), m.get("email", ""),
                "; ".join(member_tags.get(m["id"], [])),
                m.get("created_at", "")
            ])
    print(f"Exported {len(members)} members to {output_path}")
```
