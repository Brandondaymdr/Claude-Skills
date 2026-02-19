# Circle.so Admin API v2 — Complete Endpoint Reference

Base URL: `https://app.circle.so/api/admin/v2`

All requests require: `Authorization: Token YOUR_API_TOKEN`

## Table of Contents

1. [Access Groups](#access-groups)
2. [Access Group Members](#access-group-members)
3. [Advanced Search](#advanced-search)
4. [Chat Preferences](#chat-preferences)
5. [Comments](#comments)
6. [Community](#community)
7. [Community Members](#community-members)
8. [Community Segments](#community-segments)
9. [Course Lessons](#course-lessons)
10. [Course Sections](#course-sections)
11. [Course Lesson Progress](#course-lesson-progress)
12. [Direct Uploads](#direct-uploads)
13. [Embeds](#embeds)
14. [Events](#events)
15. [Event Attendees](#event-attendees)
16. [Flagged Content](#flagged-content)
17. [Forms](#forms)
18. [Form Submissions](#form-submissions)
19. [Gamification](#gamification)
20. [Image Posts](#image-posts)
21. [Invitation Links](#invitation-links)
22. [Member Tags](#member-tags)
23. [Paywall Groups](#paywall-groups)
24. [Posts](#posts)
25. [Profile Fields](#profile-fields)
26. [Space Groups](#space-groups)
27. [Space Group Members](#space-group-members)
28. [Space Members](#space-members)
29. [Spaces](#spaces)
30. [AI Summaries](#ai-summaries)
31. [Tagged Members](#tagged-members)
32. [Topics](#topics)

---

## Access Groups

Access groups control which content members can see. Essential for gating premium yoga content.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/access_groups` | Create Access Group |
| GET | `/access_groups` | List Access Groups |
| PUT | `/access_groups/{id}` | Update Access Group |
| DELETE | `/access_groups/{id}` | Archive Access Group |
| PATCH | `/access_groups/{id}/unarchive` | Unarchive Access Group |

**Create Access Group** — `POST /access_groups`
```json
{
  "name": "Premium Yoga Members",
  "description": "Access to all premium yoga content"
}
```

---

## Access Group Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/access_groups/{access_group_id}/community_members` | Add Member to Access Group |
| DELETE | `/access_groups/{access_group_id}/community_members` | Remove Member from Access Group |
| GET | `/access_groups/{access_group_id}/community_members` | List Access Group Members |
| GET | `/access_groups/{access_group_id}/community_member` | Show Access Group Member |

**Add Member** — `POST /access_groups/{access_group_id}/community_members`
- Parameters: `community_member_id` (required)

---

## Advanced Search

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/advanced_search` | Search across community content |

Query parameters: `query`, `type` (posts, members, etc.), pagination params.

---

## Chat Preferences

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/chat_preferences` | Update community chat preferences |

---

## Comments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/comments` | Create Comment |
| GET | `/comments` | List Comments |
| GET | `/comments/{id}` | Show Comment |
| DELETE | `/comments/{id}` | Destroy Comment |

**Create Comment** — `POST /comments`
```json
{
  "post_id": 12345,
  "body": "Great job in class today!"
}
```

Parameters for List: `post_id` (required), `page`, `per_page`

---

## Community

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/community` | Get community details |
| PUT | `/community` | Update community settings |

**Community Response Fields:**
id, name, slug, locale, is_private, allow_signups_to_public_community, weekly_digest_enabled, white_label, reply_to_email, custom_tos_enabled, default_new_member_space_id, default_existing_member_space_id, default_logged_out_space_id, community_setting, prefs

---

## Community Members

The most-used resource for managing your yoga community members.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/community_members` | Create/Invite a community member |
| GET | `/community_members` | List Community Members |
| GET | `/community_members/{id}` | Show a community member |
| PUT | `/community_members/{id}` | Update a community member |
| DELETE | `/community_members/{id}` | Deactivate a community member |
| PUT | `/community_members/{id}/delete_member` | Permanently delete member |
| GET | `/community_members/search` | Search for a community member |
| GET | `/community_members/{id}/spaces` | List member's spaces |
| GET | `/community_members/{id}/access_groups` | List member's access groups |
| PUT | `/community_members/{id}/ban` | Ban a community member |

**Create/Invite Member** — `POST /community_members`
```json
{
  "email": "student@example.com",
  "name": "Jane Doe",
  "skip_invitation": false,
  "space_ids": [123, 456],
  "access_group_ids": [789]
}
```

**Search Members** — `GET /community_members/search`
Query parameters: `email`, `name`, `page`, `per_page`

**Member Response Fields:**
id, email, name, bio, headline, avatar_url, admin, moderator, created_at, last_seen_at, space_ids, profile_fields, preferences, external_id

---

## Community Segments

Segments let you group members by criteria for bulk actions.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/community_segments` | Create a segment |
| GET | `/community_segments` | List segments |
| PUT | `/community_segments/{id}` | Update a segment |
| DELETE | `/community_segments/{id}` | Delete a segment |
| POST | `/community_segments/{id}/duplicate` | Duplicate a segment |

---

## Course Lessons

For building yoga training programs and course content.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/course_lessons` | Create a course lesson |
| GET | `/course_lessons` | List course lessons |
| DELETE | `/course_lessons/{id}` | Delete a course lesson |
| GET | `/course_lessons/{id}` | Show a course lesson |
| PUT | `/course_lessons/{id}` | Update a course lesson |

**Create Course Lesson** — `POST /course_lessons`
```json
{
  "course_section_id": 123,
  "name": "Sun Salutation A - Beginner",
  "body": "Learn the foundational Sun Salutation A sequence..."
}
```

Parameters for List: `course_section_id`, `space_id`, `page`, `per_page`

---

## Course Sections

Organize course lessons into sections (like "Week 1", "Module 1").

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/course_sections` | Create a course section |
| GET | `/course_sections` | List course sections |
| DELETE | `/course_sections/{id}` | Delete a course section |
| GET | `/course_sections/{id}` | Show a course section |
| PUT | `/course_sections/{id}` | Update a course section |

Parameters for List: `space_id` (required), `page`, `per_page`

---

## Course Lesson Progress

Track student progress through yoga courses.

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/course_lesson_progress` | Update Course Lesson Progress |

```json
{
  "community_member_id": 123,
  "course_lesson_id": 456,
  "status": "completed"
}
```

---

## Direct Uploads

Upload images and files to Circle.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/direct_uploads` | Create Direct Upload |

Returns a presigned upload URL. Use this for uploading cover images, attachments, etc.

---

## Embeds

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/embeds` | Create Embed |
| GET | `/embeds/{sgid}` | Get Embed |

---

## Events

Critical for scheduling yoga classes and workshops.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/events` | Create Event |
| GET | `/events` | List Events |
| GET | `/events/{id}` | Get Event |
| PUT | `/events/{id}` | Update Event |
| DELETE | `/events/{id}` | Delete Event |
| POST | `/spaces/{space_id}/events/{id}/duplicate` | Duplicate Event |

**Create Event** — `POST /events`
```json
{
  "space_id": 123,
  "name": "Morning Vinyasa Flow",
  "description": "Start your day with an energizing vinyasa class",
  "start_time": "2026-03-01T09:00:00Z",
  "end_time": "2026-03-01T10:00:00Z",
  "location_type": "virtual",
  "external_link": "https://zoom.us/j/123456789",
  "is_recurring": true,
  "recurrence_rule": "FREQ=WEEKLY;BYDAY=MO,WE,FR"
}
```

**Event Response Fields:**
id, name, description, slug, url, space_id, start_time, end_time, location_type, location, external_link, is_recurring, recurrence_rule, cover_image_url, attendees_count, created_at, updated_at

---

## Event Attendees

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/event_attendees` | Create Event Attendee (RSVP) |
| DELETE | `/event_attendees` | Delete Event Attendee |
| GET | `/event_attendees` | List Event Attendees |

**RSVP a member** — `POST /event_attendees`
```json
{
  "event_id": 123,
  "community_member_id": 456
}
```

---

## Flagged Content

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/flagged_contents` | Report Flagged Content |
| GET | `/flagged_contents` | List Flagged Contents |

---

## Forms

Create intake forms, feedback surveys, etc.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/forms` | List Forms |
| GET | `/forms/{id}` | Show a form |
| PUT | `/forms/{id}` | Update a form |
| DELETE | `/forms/{id}` | Delete a form |
| POST | `/forms/{id}/duplicate` | Duplicate a form |

---

## Form Submissions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/forms/{form_id}/submissions` | Create a form submission |
| GET | `/forms/{form_id}/submissions` | List form submissions |

---

## Gamification

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/gamification/leaderboard` | Show Leaderboard |

Returns members ranked by engagement points. Great for encouraging yoga community participation.

---

## Image Posts

For photo galleries in spaces (e.g., yoga pose libraries).

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/spaces/{space_id}/images/posts` | Create Image Post |
| DELETE | `/spaces/{space_id}/images/posts/{id}` | Delete Image Post |
| POST | `/spaces/{space_id}/images/posts/{id}/duplicate` | Duplicate Image Post |

---

## Invitation Links

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/invitation_links` | List Invitation Links |
| DELETE | `/invitation_links/{id}` | Delete invitation link |
| PATCH | `/invitation_links/{id}/revoke` | Revoke invitation link |

---

## Member Tags

Organize members with tags like "Beginner", "Advanced", "Teacher Training".

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/member_tags` | Create Member Tag |
| GET | `/member_tags` | List Member Tags |
| GET | `/member_tags/{id}` | Show Member Tag |
| PUT | `/member_tags/{id}` | Update Member Tag |
| DELETE | `/member_tags/{id}` | Delete Member Tag |

**Create Tag** — `POST /member_tags`
```json
{
  "name": "200hr YTT Graduate"
}
```

---

## Paywall Groups

For monetizing premium yoga content.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/paywall_groups` | Create a paywall group |
| GET | `/paywall_groups` | List paywall groups |
| PUT | `/paywall_groups/{id}` | Update a paywall group |
| DELETE | `/paywall_groups/{id}` | Delete a paywall group |

---

## Posts

The core content unit in Circle spaces.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/posts` | Create Basic Post |
| GET | `/posts` | List Basic Posts |
| GET | `/posts/{id}` | Show Basic Post |
| PUT | `/posts/{id}` | Update Basic Post |
| DELETE | `/posts/{id}` | Delete Basic Post |
| GET | `/posts/{post_id}/summary` | Get AI Post Summary |

**Create Post** — `POST /posts`
```json
{
  "space_id": 123,
  "name": "This Week's Class Schedule",
  "status": "published",
  "body": "<p>Here's what we have coming up this week...</p>",
  "is_comments_enabled": true,
  "is_liking_enabled": true
}
```

**Post Response Fields:**
id, status, name, body, slug, url, space_id, space_name, user_id, user_email, user_name, comments_count, likes_count, published_at, created_at, updated_at, cover_image_url, is_comments_enabled, is_comments_closed, is_liking_enabled, topics, hide_meta_info, flagged_for_approval_at, custom_html

---

## Profile Fields

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/profile_fields` | List Profile Fields |
| PUT | `/profile_fields/{id}/archive` | Archive Profile Field |
| PUT | `/profile_fields/{id}/unarchive` | Unarchive Profile Field |

---

## Space Groups

Organize spaces into navigable groups (e.g., "Classes", "Community", "Resources").

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/space_groups` | Create Space Group |
| GET | `/space_groups` | List Space Groups |
| GET | `/space_groups/{id}` | Show Space Group |
| PUT | `/space_groups/{id}` | Update Space Group |
| DELETE | `/space_groups/{id}` | Delete Space Group |

---

## Space Group Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/space_group_members` | Add Member to Space Group |
| DELETE | `/space_group_members` | Remove Member from Space Group |
| GET | `/space_group_members` | List Space Group Members |
| GET | `/space_group_member` | Show Space Group Member |

---

## Space Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/space_members` | Add Member to Space |
| DELETE | `/space_members` | Remove Member from Space |
| GET | `/space_members` | List Space Members |
| GET | `/space_member` | Show Space Member |

---

## Spaces

The fundamental organizational unit in Circle.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/spaces` | Create Space |
| GET | `/spaces` | List Spaces |
| GET | `/spaces/{id}` | Show a Space |
| PUT | `/spaces/{id}` | Update Space |
| DELETE | `/spaces/{id}` | Delete a Space |

**Space Types:** discussion, event, course, chat, image_gallery

**Create Space** — `POST /spaces`
```json
{
  "name": "Vinyasa Flow Classes",
  "space_group_id": 123,
  "space_type": "discussion",
  "is_private": false,
  "description": "Discussion space for our Vinyasa Flow classes"
}
```

**Space Response Fields:**
id, name, slug, url, space_type, is_private, is_hidden, description, emoji, custom_emoji_url, cover_image_url, space_group_id, created_at, updated_at, post_count, member_count

---

## AI Summaries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/spaces/{space_id}/ai_summaries` | Get AI summary of a space |

Returns an overview and content summary generated by AI.

---

## Tagged Members

Apply and manage tags on specific members.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/tagged_members` | Tag a Member |
| DELETE | `/tagged_members` | Untag a Member |
| GET | `/tagged_members` | List Tagged Members |
| GET | `/tagged_members/{id}` | Get Tagged Member |

**Tag a Member** — `POST /tagged_members`
```json
{
  "community_member_id": 123,
  "member_tag_id": 456
}
```

---

## Topics

Organize discussions within spaces.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/topics` | Create a topic |
| GET | `/topics` | List topics |
| GET | `/topics/{id}` | Show topic details |
| PUT | `/topics/{id}` | Update a topic |
| DELETE | `/topics/{id}` | Delete a topic |

**Create Topic** — `POST /topics`
```json
{
  "space_id": 123,
  "name": "Beginner Questions"
}
```
