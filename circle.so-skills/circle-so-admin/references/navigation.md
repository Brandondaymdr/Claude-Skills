# Circle.so Admin Panel — Complete Navigation Guide

Step-by-step instructions for navigating every section of the Circle admin panel.

## Table of Contents

1. [Dashboard Overview](#dashboard-overview)
2. [Sidebar Navigation](#sidebar-navigation)
3. [Space Management](#space-management)
4. [Member Management](#member-management)
5. [Event Management](#event-management)
6. [Course Management](#course-management)
7. [Settings Deep Dive](#settings-deep-dive)
8. [Content Moderation](#content-moderation)

---

## Dashboard Overview

When you log into Circle as an admin, you'll see:

- **Left Sidebar** — Main navigation with space groups and spaces
- **Top Bar** — Search, notifications, profile menu
- **Main Content Area** — Whatever space or page you've selected
- **Admin Menu** — Gear icon or "Admin" button for admin-specific pages

The admin has access to everything members see, plus additional admin-only sections.

---

## Sidebar Navigation

The left sidebar is the primary navigation for your community:

### Structure
```
[Community Logo/Name]
[Search Bar]
────────────────────
Space Group 1
  ├── Space A
  ├── Space B
  └── Space C
Space Group 2
  ├── Space D
  └── Space E
────────────────────
[Direct Messages]
[Notifications]
────────────────────
[Admin / Settings]
```

### Managing the Sidebar
- **Reorder space groups**: Drag and drop in admin settings
- **Reorder spaces within groups**: Drag and drop
- **Collapse/expand groups**: Click the group name
- **Add new space**: Click the "+" button next to a space group

---

## Space Management

### Creating a New Space

1. Click the **"+"** button next to any space group in the sidebar
2. Choose the space type:
   - **Discussion** — Forum-style posts with comments
   - **Event** — Calendar with RSVP events
   - **Course** — Structured lessons and sections
   - **Chat** — Real-time messaging
   - **Image Gallery** — Photo collections
3. Configure the space:
   - **Name** — Display name in sidebar
   - **Description** — What this space is for
   - **Emoji** — Icon displayed in sidebar
   - **Visibility** — Public, Private, or Secret
   - **Cover Image** — Header banner image
4. Click **Create**

### Space Settings (per space)

Access by clicking the **gear icon** within any space or **⋯ menu → Settings**:

- **General** — Name, description, emoji, cover image
- **Access** — Which access groups see this space; who can post
- **Notifications** — Default notification preferences for this space
- **Moderation** — Post approval requirements
- **Sort Order** — How posts are sorted (newest, oldest, trending)
- **SEO** — Custom meta title and description

### Creating a Space Group

1. Go to **Admin → Spaces** (or Settings → Spaces)
2. Click **"New Space Group"**
3. Name the group (e.g., "Classes", "Community", "Resources")
4. Drag spaces into the group to organize

---

## Member Management

### Viewing All Members

1. Click **Members** in the admin sidebar (or navigate to Admin → Members)
2. You'll see a list of all members with:
   - Name, avatar, email
   - Join date
   - Last active date
   - Role (Admin, Moderator, Member)
   - Tags

### Filtering & Searching Members

- **Search bar** — Search by name or email
- **Filters** — Filter by tag, access group, role, activity, join date
- **Segments** — Save filter combinations as reusable segments

### Inviting Members

**Method 1: Direct Invite**
1. Members → Invite Members
2. Enter email addresses (one per line or comma-separated)
3. Select spaces to add them to
4. Select access groups
5. Click Send Invitations

**Method 2: Invitation Links**
1. Members → Invitation Links
2. Create a new link with:
   - Expiration date
   - Max uses
   - Default spaces and access groups
3. Share the link

**Method 3: API** (see circle-so-api skill)

### Managing a Specific Member

Click on any member to see their profile and admin controls:

- **Profile** — View/edit name, bio, headline, avatar
- **Spaces** — See and manage which spaces they're in
- **Access Groups** — Add/remove access group membership
- **Tags** — Apply/remove tags
- **Activity** — See their posts, comments, events attended
- **Actions** — Promote to admin/moderator, ban, deactivate, delete

### Member Roles

| Role | Permissions |
|------|------------|
| **Admin** | Full access to all settings, spaces, members, and admin panel |
| **Moderator** | Can manage posts, comments, and members within assigned spaces |
| **Member** | Standard access based on space visibility and access groups |

---

## Event Management

### Creating an Event

1. Navigate to an **Event-type space**
2. Click **"Create Event"** or **"+"** button
3. Fill in event details:
   - **Title** — Event name
   - **Description** — Rich text with formatting
   - **Date & Time** — Start and end time with timezone
   - **Location Type** — Virtual or In-Person
   - **Virtual Link** — Zoom/Meet/Circle Live URL
   - **Cover Image** — Event banner
   - **Recurrence** — One-time or recurring (daily, weekly, monthly, custom)
   - **RSVP Settings** — Enable/disable RSVP, set attendee limit
4. Click **Publish** or **Save as Draft**

### Managing Events

- **Edit** — Click event → Edit button
- **Duplicate** — Click event → ⋯ menu → Duplicate (great for recurring class formats)
- **Cancel/Delete** — Click event → ⋯ menu → Delete
- **View Attendees** — Click event → Attendees tab
- **Send Update** — Edit the event to notify all RSVPed members

### Event Reminders

Circle automatically sends email reminders to RSVPed members:
- 24 hours before the event
- 1 hour before the event
- At event start time

---

## Course Management

### Creating a Course

1. Create a **Course-type space** (or navigate to an existing one)
2. The course editor opens with:
   - **Sections** — Create sections (like chapters or weeks)
   - **Lessons** — Add lessons within sections

### Adding Course Content

**Creating a Section:**
1. Click **"Add Section"**
2. Name the section (e.g., "Week 1: Yoga Foundations")
3. Optionally set a drip schedule

**Creating a Lesson:**
1. Click **"Add Lesson"** within a section
2. Add lesson content:
   - **Title** — Lesson name
   - **Body** — Rich text content (text, images, videos, embeds)
   - **Video** — Upload or embed video
   - **Attachments** — PDFs, files for download
3. Set lesson settings:
   - **Free preview** — Available without access group
   - **Required** — Must complete to progress

### Drip Content

Release course content on a schedule:
1. Go to course space settings
2. Enable **Drip Schedule**
3. Set release dates for each section:
   - **On join** — Available immediately when enrolled
   - **X days after join** — Delayed release
   - **Specific date** — Fixed calendar date

### Progress Tracking

- Members see a progress bar showing completed lessons
- Admins can view per-member progress in the admin panel
- Completion triggers can fire automations (Business plan)

---

## Settings Deep Dive

### General Settings
**Path:** Settings → General

- Community Name
- Community URL/Slug
- Description
- Logo (appears in sidebar and emails)
- Favicon
- Language/Locale
- Timezone

### Branding
**Path:** Settings → Branding

- **Primary Color** — Accent color throughout the platform
- **Sidebar Color** — Background color of the sidebar
- **Font** — Choose from available font families
- **Custom CSS** — Advanced styling with CSS (overrides defaults)
- **Email Branding** — Logo and colors for emails

### Payment Settings
**Path:** Settings → Payments

1. **Connect Stripe** — Link your Stripe account
2. **Create Pricing Plans** — Monthly, annual, one-time
3. **Create Paywall Groups** — Bundle pricing with access groups
4. **Manage Subscriptions** — View/cancel member subscriptions

### Domain Settings
**Path:** Settings → Domain

- Add a custom domain (e.g., community.yourbrand.com)
- Configure DNS records (CNAME)
- SSL is automatic

### Integration Settings
**Path:** Settings → Integrations

- **Zapier** — Connect to 5000+ apps
- **Webhooks** — Receive event notifications at your URL
- **Single Sign-On (SSO)** — SAML-based SSO for enterprise
- **Custom OAuth** — Build custom auth flows

---

## Content Moderation

### Moderation Tools

- **Post Approval** — Require approval before posts are visible (per-space setting)
- **Flagged Content** — Members can flag posts/comments; admins review in the flagged queue
- **Ban Members** — Block members from accessing the community
- **Delete Content** — Remove posts, comments, or events
- **Pin Posts** — Keep important posts at the top of a space
- **Lock Posts** — Prevent new comments on a post
- **Close Comments** — Disable commenting on a specific post

### Moderation Queue

1. Navigate to **Admin → Moderation** (or the flagged content section)
2. Review flagged items
3. Actions: Approve, Remove, Ban author, Dismiss flag

### Setting Up Moderation Rules

Per space, you can configure:
- Whether all posts require approval
- Whether only new members' posts require approval
- Which roles can post (everyone, moderators only, admins only)
- Profanity filter settings
