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
  Carla Gentile Yoga's community (carlagentileyoga.com). Even if the user just says
  "Circle" and the context is about community management, use this skill.
---

# Circle.so Platform Administration

You are an expert Circle.so community administrator. Your job is to guide users through
every aspect of managing a Circle community — from initial setup through advanced features
like automation workflows, courses, events, and monetization.

This skill focuses on the **admin UI and platform features**. For programmatic API work,
direct the user to the `circle-so-api` skill instead.

## Platform Architecture

Circle.so organizes communities around a hierarchy that's important to understand:

```
Community (top-level account)
├── Space Groups (organizational folders in the sidebar)
│   └── Spaces (the actual content areas)
│       ├── Discussion spaces (forum-style posts & threads)
│       ├── Event spaces (scheduled events with RSVP)
│       ├── Course spaces (structured lessons with progress tracking)
│       ├── Chat spaces (real-time messaging)
│       └── Image Gallery spaces (photo collections)
├── Members
│   ├── Roles: Admin, Moderator, Member
│   ├── Tags (custom labels for organizing members)
│   └── Access Groups (content gating — controls who sees what)
├── Paywall Groups (monetization tiers connected to Stripe)
└── Community-wide Settings
```

## Reference Files

Read these files based on what the user needs help with:

- **`references/navigation.md`** — Step-by-step instructions for navigating every section of the Circle admin panel. Read this when the user needs help finding a setting, creating content, or managing any specific section.

- **`references/yoga-community-setup.md`** — Tailored setup guide for yoga/wellness communities on Circle. Read this when setting up a new community or restructuring an existing one, especially for Carla Gentile Yoga.

- **`references/advanced-features.md`** — Automation workflows, gamification, email hub, custom branding, and integrations. Read this when the user asks about automations, points/levels, email campaigns, or connecting Circle with other tools.

## Key Admin Sections

### Settings (gear icon or Admin menu)

The Settings area is where you configure your community's foundation:

- **General** — Community name, URL, logo, favicon, description, locale, timezone
- **Branding** — Primary color, sidebar color, fonts, custom CSS, email branding
- **Members** — Default roles, signup settings, profile fields, member directory
- **Spaces** — Default space settings, landing pages
- **Email** — Email hub, digest settings, sender configuration
- **Payments** — Stripe connection, pricing plans, paywall groups
- **Developers → Tokens** — API token management (for the circle-so-api skill)
- **Integrations** — Zapier, webhooks, custom integrations
- **Domain** — Custom domain configuration (e.g., community.carlagentileyoga.com)
- **Advanced** — Custom code injection, analytics, SEO

### Spaces & Space Groups

Spaces are the core of your community. Each space has a type (Discussion, Event, Course, Chat, or Image Gallery), visibility (Public, Private, or Secret), and its own settings for moderation, access groups, and appearance.

To create a space: **Sidebar → + button → Choose space type → Configure → Create**

### Members

Member management lives under the **Members** section in the admin sidebar. You can search and filter members, create segments, invite via email or shareable links, and manage individual member profiles including roles, tags, access groups, and activity history.

### Events

Events live inside Event-type spaces. You can create one-time or recurring events, set them as virtual (with Zoom/Meet/Circle Live links) or in-person, enable RSVP tracking, and Circle automatically sends email reminders at 24h, 1h, and event start time.

### Courses

Course spaces contain structured learning content organized into sections and lessons. Features include drip scheduling (release content over time), progress tracking, completion certificates, and prerequisites.

### Access Groups & Monetization

Access groups control who sees what content. The monetization flow works like this: create an access group, assign spaces to it, then connect it to a paywall group linked to Stripe. When a member pays, Stripe triggers Circle to add them to the appropriate access group automatically.

### Automation Workflows (Business plan and above)

Three types: trigger-based workflows (when X happens, do Y), bulk actions (perform action on filtered member groups), and scheduled workflows (run actions on a recurring schedule).

### Gamification

Points, levels, leaderboards, and rewards. Members earn points for posting, commenting, and attending events. Configure under **Settings → Gamification**.

## Pricing Tiers & Feature Availability

| Feature | Professional ($89/mo) | Business ($199/mo) | Circle Plus (Custom) |
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
| AI Agents | No | No | Yes |
| Custom SSO | No | No | Yes |
| Branded Mobile Apps | No | No | Yes |
| Priority Support | No | No | Yes |

**Email Hub Add-on:** $99/month per 10,000 contacts (available on Business+).

## Common Admin Tasks — Quick Reference

| Task | Path |
|------|------|
| Change community name | Settings → General → Community Name |
| Add custom domain | Settings → Domain → Add Domain |
| Connect Stripe | Settings → Payments → Connect Stripe |
| Create API token | Developers → Tokens → Generate Token |
| Enable gamification | Settings → Gamification → Enable |
| Set up email digest | Settings → Email → Digest Settings |
| Add custom CSS | Settings → Branding → Custom CSS |
| Enable SSO | Settings → Advanced → SSO Configuration |
| Add webhook | Settings → Integrations → Webhooks |
| Set default landing | Settings → Spaces → Default Space |

## Platform Tips

- **Mobile apps**: Circle has iOS and Android apps for member access.
- **SEO**: Public spaces are indexable by search engines. Configure under Settings → Advanced.
- **Custom domains**: Use your own domain under Settings → Domain. SSL is automatic.
- **White labeling**: Remove Circle branding on Business plan and above.
- **Rich media**: Posts support images, videos, GIFs, embeds (YouTube, Vimeo, etc.), polls, and file attachments.
- **14-day free trial**: All plans include a free trial with no credit card required.
