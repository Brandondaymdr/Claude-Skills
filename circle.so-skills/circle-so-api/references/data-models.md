# Circle.so Admin API v2 — Data Models

These are the core data models returned by the API, based on the official OpenAPI/Swagger schema.

## basic_post

The core content unit. Returned by all post-related endpoints.

| Field | Type | Notes |
|-------|------|-------|
| id | integer | Unique post ID |
| status | string | "published" or "draft" |
| name | string (nullable) | Post title |
| tiptap_body | object | Rich text body in TipTap format |
| body | object | Legacy body format |
| slug | string | URL slug |
| url | string | Full post URL |
| space_name | string | Name of containing space |
| space_slug | string | Space URL slug |
| space_id | integer | ID of containing space |
| user_id | integer | Author's user ID |
| user_email | string | Author's email |
| user_name | string | Author's display name |
| comments_count | integer | Number of comments |
| community_id | integer | Community ID |
| hide_meta_info | boolean | Whether meta info is hidden |
| user_avatar_url | string | Author's avatar URL |
| published_at | datetime | When published |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |
| cover_image | string | Cover image data |
| cover_image_url | string | Cover image URL |
| cardview_thumbnail | string | Card view thumbnail data |
| cardview_thumbnail_url | string | Card view thumbnail URL |
| is_comments_enabled | boolean | Comments allowed |
| is_comments_closed | boolean | Comments closed |
| is_liking_enabled | boolean | Likes allowed |
| flagged_for_approval_at | datetime | Flagged timestamp |
| unresolved_flagged_reports_count | integer | Number of unresolved flags |
| custom_html | string | Custom HTML content |
| likes_count | integer | Number of likes |
| topics | array | Associated topics |
| member_posts_count | integer | Author's total posts |
| member_comments_count | integer | Author's total comments |
| member_likes_count | integer | Author's total likes |

## community

Top-level community settings and configuration.

| Field | Type | Notes |
|-------|------|-------|
| id | integer | Community ID |
| created_at | datetime | Creation timestamp |
| name | string | Community name |
| locale | string | Language locale |
| slug | string | URL slug |
| allow_signups_to_public_community | boolean | Public signups enabled |
| community_switcher_enabled | boolean | Multi-community switcher |
| is_private | boolean | Private community |
| white_label | boolean | White-label enabled |
| weekly_digest_enabled | boolean | Email digests on |
| reply_to_email | string | Reply-to address |
| custom_tos_enabled | boolean | Custom terms of service |
| custom_tos | string | Custom TOS content |
| default_new_member_space_id | integer | Landing space for new members |
| default_existing_member_space_id | integer | Landing space for returning members |
| default_logged_out_space_id | integer | Landing space for logged-out visitors |
| default_search_sorting | string | Default search sort order |
| prefs | object | Community preferences |
| community_setting | object | Nested settings |

**Locked Post CTA Fields:**
locked_post_cta_heading, locked_post_cta_body, locked_post_cta_button_text, locked_post_cta_button_url

**Digest Fields:**
digest_subject, digest_intro, digests_hide_posts, digests_hide_comments, digests_hide_stats, digests_hide_members

## rich_text_body (TipTap Format)

Used for post and comment bodies in the TipTap editor format.

| Field | Type | Notes |
|-------|------|-------|
| body | object | TipTap document structure |
| body.type | string | Always "doc" |
| body.content | array | Array of TipTap nodes |
| circle_ios_fallback_text | string | Plain text for iOS |
| attachments | array | File attachments |
| inline_attachments | array | Inline file attachments |
| sgids_to_object_map | object | Signed global ID mapping |
| format | string | Content format identifier |
| community_members | array | Mentioned members |
| entities | array | Referenced entities |
| group_mentions | array | Group mentions |
| polls | array | Poll data |

## direct_upload_response

Returned when creating a direct upload.

| Field | Type | Notes |
|-------|------|-------|
| id | integer | Upload ID |
| key | string | Storage key |
| filename | string | Original filename |
| content_type | string | MIME type |
| byte_size | integer | File size in bytes |
| checksum | string | File checksum |
| created_at | datetime | Upload timestamp |
| signed_id | string | Signed identifier |
| attachable_sgid | string | Attachable signed global ID |
| direct_upload | object | Upload URL and headers |
| url | string | Final file URL |

## ai_summary

Returned by the space AI summary endpoint.

| Field | Type | Notes |
|-------|------|-------|
| overview | string | High-level summary |
| content | string | Detailed content summary |

## Key Relationships

```
Community
├── Space Groups
│   └── Spaces (discussion, event, course, chat, image_gallery)
│       ├── Posts
│       │   ├── Comments
│       │   └── Topics
│       ├── Events
│       │   └── Event Attendees
│       ├── Course Sections
│       │   └── Course Lessons
│       │       └── Course Lesson Progress
│       └── Image Posts
├── Community Members
│   ├── Member Tags (via Tagged Members)
│   ├── Access Groups (via Access Group Members)
│   └── Space Memberships (via Space Members)
├── Access Groups
├── Paywall Groups
├── Forms
│   └── Form Submissions
├── Invitation Links
├── Profile Fields
└── Community Segments
```

## ID Reference

When making API calls, you need various IDs. Here's how to find them:

- **community_id** — `GET /community` → response.id
- **space_id** — `GET /spaces` → find your space → .id
- **member_id** — `GET /community_members/search?email=xxx` → .id
- **post_id** — `GET /posts?space_id=xxx` → find post → .id
- **event_id** — `GET /events?space_id=xxx` → find event → .id
- **access_group_id** — `GET /access_groups` → find group → .id
- **member_tag_id** — `GET /member_tags` → find tag → .id
