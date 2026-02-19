# Circle.so Advanced Features

Automation workflows, advanced settings, integrations, and power-user features.

## Table of Contents

1. [Automation Workflows](#automation-workflows)
2. [Integrations](#integrations)
3. [Custom Domain & Branding](#custom-domain--branding)
4. [Advanced Member Management](#advanced-member-management)
5. [Analytics & Reporting](#analytics--reporting)
6. [Custom Code & Embeds](#custom-code--embeds)
7. [Mobile App Configuration](#mobile-app-configuration)

---

## Automation Workflows

Available on Business plan ($199/month) and above.

### Trigger-Based Workflows

Create workflows that fire when specific events occur:

**Available Triggers:**
- Member joins the community
- Member joins a space
- Member completes a course
- Member completes a lesson
- Member reaches a gamification level
- Member earns X points
- Member is added to an access group
- Member submits a form
- New post is created
- New comment is created
- Event RSVP

**Available Actions:**
- Send an email
- Send a DM (direct message)
- Add member to a space
- Remove member from a space
- Add member to an access group
- Remove member from an access group
- Apply a tag to member
- Remove a tag from member
- Update member profile field
- Create a post
- Trigger a webhook

### Example Workflows for Yoga Community

**1. Welcome New Members**
- Trigger: Member joins community
- Action 1: Send DM "Welcome to Carla Gentile Yoga! Here's how to get started..."
- Action 2: Add to "Welcome" space
- Action 3: Apply tag "New Member"

**2. Course Completion Celebration**
- Trigger: Member completes "Beginner Yoga Foundations" course
- Action 1: Send email "Congratulations on completing the course!"
- Action 2: Apply tag "Foundations Graduate"
- Action 3: Add to "Intermediate Classes" access group

**3. Engagement Reward**
- Trigger: Member reaches Level 5
- Action 1: Send DM "You've reached Yoga Warrior level!"
- Action 2: Apply tag "Yoga Warrior"

**4. Event Follow-Up**
- Trigger: Event ends
- Action: Create post in the class space "Thanks for joining today's class! How did it feel?"

### Bulk Actions

Perform actions on many members at once:

1. Go to Members → filter to your target group
2. Select all or specific members
3. Choose bulk action:
   - Add/remove from space
   - Add/remove from access group
   - Apply/remove tag
   - Send email
   - Deactivate/ban

### Scheduled Workflows

Run actions on a recurring schedule:
- Daily, weekly, monthly frequency
- Example: Weekly Monday email "Here's your yoga class schedule for the week"
- Example: Monthly leaderboard post celebrating top engaged members

---

## Integrations

### Zapier Integration

Connect Circle to 5000+ apps via Zapier:

**Popular Zaps for Yoga Communities:**
- New Stripe payment → Add member to Circle access group
- New Circle member → Add to Mailchimp/ConvertKit list
- New Circle event → Create Google Calendar event
- New Circle post → Share to Instagram/social media
- Form submission (Typeform) → Invite member to Circle

**Setup:**
1. Settings → Integrations → Zapier
2. Connect your Zapier account
3. Create Zaps using Circle as trigger or action

### Webhooks

Receive real-time notifications when events happen in your community:

**Setup:**
1. Settings → Integrations → Webhooks
2. Add a webhook URL
3. Select which events to receive:
   - member.created, member.updated, member.deleted
   - post.created, post.updated
   - comment.created
   - event.rsvp
   - course.lesson_completed

**Webhook Payload Example:**
```json
{
  "event": "member.created",
  "data": {
    "id": 12345,
    "email": "student@example.com",
    "name": "Jane Doe",
    "created_at": "2026-01-15T10:00:00Z"
  }
}
```

### Third-Party Integrations

| Tool | Use Case | How to Connect |
|------|----------|---------------|
| **Zoom** | Virtual classes | Paste Zoom links in events |
| **Google Meet** | Virtual classes | Paste Meet links in events |
| **Stripe** | Payments | Settings → Payments → Connect Stripe |
| **Mailchimp** | Email marketing | Via Zapier or API |
| **ConvertKit** | Email marketing | Via Zapier or API |
| **Teachable** | Course hosting | Via API migration |
| **Vimeo** | Video hosting | Embed in posts/lessons |
| **YouTube** | Video hosting | Embed in posts/lessons |
| **Calendly** | Booking | Embed in posts |
| **Google Analytics** | Tracking | Settings → Advanced → Analytics |

---

## Custom Domain & Branding

### Custom Domain Setup

1. **Choose your domain**: e.g., `community.carlagentileyoga.com`
2. **Add DNS record**: CNAME pointing to Circle's servers
3. **Configure in Circle**: Settings → Domain → Add Custom Domain
4. **SSL**: Automatic — Circle provisions SSL certificates

### White Labeling (Business plan+)

- Remove "Powered by Circle" branding
- Custom favicon
- Custom email sender name and address
- Custom login page

### Custom CSS

Inject custom CSS to match your yoga brand:

```css
/* Example: Custom brand colors */
:root {
  --primary-color: #7B68EE;  /* Lavender purple */
  --accent-color: #DDA0DD;   /* Plum */
}

/* Custom sidebar styling */
.sidebar {
  background-color: #f5f0eb;  /* Warm beige */
}

/* Custom heading font */
h1, h2, h3 {
  font-family: 'Playfair Display', serif;
}
```

Access: Settings → Branding → Custom CSS

---

## Advanced Member Management

### Custom Profile Fields

Create custom fields for member profiles:

1. Settings → Members → Profile Fields
2. Add fields like:
   - "Yoga Experience Level" (dropdown: Beginner, Intermediate, Advanced)
   - "Preferred Class Style" (multi-select: Vinyasa, Yin, Hatha, Meditation)
   - "Teacher Training Status" (dropdown: Not Enrolled, In Progress, Graduated)
   - "How did you find us?" (text field)
3. Set which fields are required at signup

### Segments

Create dynamic member groups based on criteria:

**Useful Segments for Yoga:**
- "Active This Month" — Members who posted/commented in last 30 days
- "Inactive 30+ Days" — Members who haven't been active
- "Free Tier Only" — Members without paid access groups
- "Course Completers" — Members who finished a course
- "High Engagement" — Members with 100+ gamification points

### Member Import/Export

**Import:**
- CSV upload with columns: email, name, tags
- Bulk invite via Admin → Members → Import

**Export:**
- Admin → Members → Export
- CSV download with all member data

---

## Analytics & Reporting

### Built-in Analytics

Circle provides analytics under Admin → Analytics:

- **Member Growth** — New members over time, retention
- **Active Members** — Daily/weekly/monthly active members
- **Content** — Posts, comments, likes over time
- **Spaces** — Activity per space
- **Events** — Attendance, RSVP rates
- **Courses** — Enrollment, completion rates
- **Revenue** — Subscription revenue (if using Circle payments)

### Google Analytics Integration

1. Settings → Advanced → Analytics
2. Add your Google Analytics tracking ID
3. Track page views, events, and conversions

---

## Custom Code & Embeds

### Head/Body Code Injection

Settings → Advanced → Custom Code

Inject code into the `<head>` or `<body>` of your community pages:
- Analytics scripts (Google Analytics, Facebook Pixel, Hotjar)
- Custom fonts
- Chat widgets (Intercom, Crisp)
- SEO meta tags

### Embedding External Content

In posts and lessons, you can embed:
- YouTube/Vimeo videos (paste URL)
- Spotify playlists (embed code)
- Google Forms (embed code)
- Calendly scheduling (embed code)
- CodePen demos
- Loom videos
- Any oEmbed-compatible service

### Embedding Circle in External Sites

Use iframes to embed Circle spaces in your main website:
```html
<iframe src="https://community.carlagentileyoga.com/c/welcome"
        width="100%" height="600px" frameborder="0">
</iframe>
```

---

## Mobile App Configuration

### Circle Mobile App

Circle has native iOS and Android apps that members can download.

**What works on mobile:**
- All space types (discussion, events, courses, chat, galleries)
- Push notifications
- RSVP to events
- Course progress tracking
- Direct messages
- Member profiles

### Push Notification Settings

Members can configure per-space notification preferences:
- All activity
- Mentions only
- None

Admins can set default notification preferences per space.

### Branded Mobile App (Plus Plan)

On the Circle Plus plan (custom pricing), you get:
- Fully branded iOS and Android apps
- Your own app name and icon in the App Store/Play Store
- Custom splash screen
- No Circle branding
