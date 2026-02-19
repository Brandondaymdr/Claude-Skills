---
name: circle-so-admin
description: >
  Expert-level Circle.so platform administration and navigation skill. Use this skill
  whenever the user asks about Circle.so features, how to navigate the Circle admin panel,
  set up spaces, manage members, configure events, create courses, customize community
  settings, set up payments, use automation workflows, manage gamification, or any other
  Circle.so platform task. This covers the UI/admin side of Circle — for API/code tasks,
  use the circle-so-api skill instead. Trigger whenever someone mentions Circle.so,
  circle community, community platform, online community management, yoga community setup,
  or wants help with any Circle.so admin feature. Especially relevant for managing
  Carla Gentile Yoga's community (carlagentileyoga@circle.so).
---

# Circle.so Platform Administration — Expert Skill

You are an expert Circle.so community administrator. Your job is to guide users through
every aspect of managing a Circle community — from initial setup through advanced features
like automation workflows, courses, events, and monetization.

This skill focuses on the **admin UI and platform features**. For programmatic API work,
the user should also have the `circle-so-api` skill.

## Platform Architecture

Circle.so is organized around a hierarchy that's important to understand:

```
Community (your top-level account)
├── Space Groups (organizational folders in the sidebar)
│   └── Spaces (the actual content areas)
│       ├── Discussion spaces (forum-style posts & threads)
│       ├── Event spaces (scheduled events with RSVP)
│       ├── Course spaces (structured lessons with progress tracking)
│       ├── Chat spaces (real-time messaging)
│       └── Image Gallery spaces (photo collections)
├── Members (your community members)
│   ├── Roles: Admin, Moderator, Member
│   ├── Tags (custom labels)
│   └── Access Groups (content gating)
├── Paywall Groups (monetization tiers via Stripe)
└── Community-wide Settings
```

## Admin Navigation Guide

For detailed navigation instructions for every section of the Circle admin panel, read:
```
references/navigation.md
```

For setting up a yoga/wellness community specifically, read:
```
references/yoga-community-setup.md
```

For automation workflows and advanced features, read:
```
references/advanced-features.md
```

## Key Admin Sections

### Settings (gear icon)

The Settings area is where you configure your community's foundation:

- **General** — Community name, URL, logo, favicon, description, locale
- **Branding** — Colors, fonts, custom CSS, email branding
- **Members** — Default roles, signup settings, profile fields, member directory
- **Spaces** — Default space settings, landing pages
- **Email** — Email hub, digest settings, sender configuration
- **Payments** — Stripe connection, pricing plans, paywall groups
- **API** — API token management (for the circle-so-api skill)
- **Integrations** — Zapier, webhooks, custom integrations
- **Domain** — Custom domain configuration
- **Advanced** — Custom code injection, analytics, SEO

### Spaces & Space Groups

Spaces are the core of your community. Each space has:

- **Type** — Discussion, Event, Course, Chat, or Image Gallery
- **Visibility** — Public (all members), Private (invite-only), Secret (hidden)
- **Settings** — Name, description, emoji/icon, cover image, sort order
- **Access** — Which access groups can see this space
- **Moderation** — Auto-approve posts or require approval

To create a space: **Sidebar → + button → Choose space type → Configure**

### Members

Member management lives under the **Members** section in the admin sidebar:

- **All Members** — Searchable list with filters
- **Pending** — Members awaiting approval
- **Banned** — Blocked members
- **Invitations** — Pending invitation links
- **Tags** — Custom tags for organizing members
- **Segments** — Dynamic member groups based on criteria

### Events

Events are created within Event-type spaces:

- **One-time events** — Single occurrence
- **Recurring events** — Weekly, monthly, custom recurrence
- **Virtual events** — Link to Zoom, Google Meet, or Circle's built-in streaming
- **In-person events** — Physical location with address
- **RSVP tracking** — See who's attending
- **Automatic reminders** — Email notifications before events

### Courses

Course spaces contain structured learning content:

- **Sections** — Group lessons into modules/weeks
- **Lessons** — Individual content pieces within sections
- **Progress tracking** — Students mark lessons complete
- **Drip content** — Release lessons on a schedule
- **Completion certificates** — Award on course completion
- **Prerequisites** — Require completion of previous courses

### Access Groups & Monetization

Access groups control who sees what:

1. Create an access group (e.g., "Premium Members")
2. Assign spaces to the access group
3. Add members manually or via paywall groups
4. Connect paywall groups to Stripe for automated access

**Paywall flow:** Member pays → Stripe webhook → Circle adds to paywall group → Access group grants space access

### Automation Workflows (Business plan+)

Three types of automations:

1. **Trigger-based workflows** — When X happens, do Y
   - Triggers: Member joins, completes course, reaches level, etc.
   - Actions: Send email, add to space, apply tag, send DM, etc.
2. **Bulk actions** — Perform action on filtered member groups
3. **Scheduled workflows** — Run actions on a recurring schedule

### Gamification

- **Points** — Members earn points for posting, commenting, attending events
- **Levels** — Custom level thresholds with names and badges
- **Leaderboard** — Ranking of most active members
- **Rewards** — Trigger automations at point milestones
- Configure under **Settings → Gamification**

### Email Hub

Circle's built-in email system:

- **Broadcasts** — One-time emails to segments
- **Automations** — Triggered email sequences
- **Templates** — Reusable email designs
- **Analytics** — Open rates, click rates
- Configure under **Settings → Email**

## Common Admin Tasks — Quick Reference

| Task | How To |
|------|--------|
| Change community name | Settings → General → Community Name |
| Add custom domain | Settings → Domain → Add Domain |
| Connect Stripe | Settings → Payments → Connect Stripe |
| Create API token | Settings → API → Generate Token |
| Enable gamification | Settings → Gamification → Enable |
| Set up email digest | Settings → Email → Digest Settings |
| Add custom CSS | Settings → Branding → Custom CSS |
| Enable SSO | Settings → Advanced → SSO Configuration |
| Add webhook | Settings → Integrations → Webhooks |
| Set default landing | Settings → Spaces → Default Space |

## Platform Tips

- **Mobile apps**: Circle has iOS and Android apps. Members can access everything on mobile.
- **SEO**: Public spaces are indexable by search engines. Configure SEO under Settings → Advanced.
- **Custom domains**: Use your own domain (e.g., community.carlagentileyoga.com) under Settings → Domain.
- **White labeling**: Remove Circle branding on Business plan and above.
- **Embeds**: You can embed Circle spaces in external websites using iframes.
- **Rich media**: Posts support images, videos, GIFs, embeds (YouTube, Vimeo, etc.), polls, and file attachments.

## Pricing Tiers & Feature Availability

| Feature | Professional ($89/mo) | Business ($199/mo) | Enterprise ($419/mo) |
|---------|----------------------|--------------------|--------------------|
| Spaces & Members | Unlimited | Unlimited | Unlimited |
| Courses | Yes | Yes | Yes |
| Events | Yes | Yes | Yes |
| Gamification | Yes | Yes | Yes |
| API Access | No | Yes | Yes |
| Automation Workflows | No | Yes | Yes |
| White Label | No | Yes | Yes |
| Custom Domain | Yes | Yes | Yes |
| Paywall/Payments | Yes | Yes | Yes |
| Email Hub | Limited | Full | Full |
| Priority Support | No | No | Yes |
