# BenAI Skills - Expert Automation

A marketplace of automation plugins for Claude Code

## Available Skills

### YouTube Channel Management (/youtube-channel)
Expert-level YouTube Data API v3 skill for managing YouTube channels, uploading and organizing video content, moderating comments, tracking analytics, and building audience growth strategies programmatically.

**Features:**
- YouTube Data API v3 full resource reference (Channels, Videos, Playlists, Comments, etc.)
- Channel setup and branding (banner, description, keywords, sections)
- Video upload workflow with resumable uploads
- Playlist organization strategies
- Comment moderation and community engagement
- YouTube Analytics API reporting
- SEO and discoverability optimization
- YouTube + Circle.so cross-platform integration
- Python and JavaScript code recipes

**Essential for:** Carla Gentile Yoga's YouTube channel operations

### Circle.so Community Admin (/circle-so-admin)
Expert-level Circle.so platform administration for managing communities, spaces, members, events, courses, payments, and gamification through the admin UI.

**Features:**
- Full platform navigation and feature reference
- Space setup and configuration
- Member management and access groups
- Events and course creation
- Payments and Stripe integration
- Automation workflows
- Gamification and engagement
- Yoga community-specific setup guide

**Essential for:** Carla Gentile Yoga's Circle community (carlagentileyoga@circle.so)

### Circle.so API (/circle-so-api)
Expert-level Circle.so Admin API v2 skill for building automations and managing communities programmatically.

**Features:**
- All 32 API resource endpoints
- TipTap body format for rich content
- Python and JavaScript code recipes
- Bulk member imports, space setup, event creation
- Membership tier management
- Reporting and analytics

### n8n Automation (/n8n)
Build, test, and deploy n8n workflows via REST API with incremental testing.

**Features:**
- Workflow automation via REST API
- Node references for 40+ common nodes
- JavaScript/Python code patterns
- Expression syntax reference
- Debugging guides

**Setup Requirements:**
```
N8N_API_URL=https://your-n8n-instance.com
N8N_API_KEY=your-api-key
N8N_CREDENTIALS_TEMPLATE_URL=your-template-url
```

### Shopify Storefront (/shopify-storefront)
Shopify Online Store 2.0 theme development for Cheersworthy.com spirits store.

**Features:**
- Liquid templating (sections, blocks, snippets, schema)
- Theme app extensions for age gates and custom blocks
- Spirit-specific metafields (ABV, tasting notes, origin, age statement)
- Storefront API (GraphQL) for headless/WhiskeySomm integration
- Spirits e-commerce compliance (TTB, state shipping, age verification)
- Checkout customization and shipping restrictions

### Shopify Sidekick (/shopify-sidekick)
Build Shopify Sidekick AI extensions — data sources and action intents for the Cheersworthy app.

**Features:**
- Data source extensions (admin.app.tools.data)
- Action intent extensions (admin.app.intent.link)
- tools.json schema definitions and shopify.tools.register handlers
- MCP Resource Links format for optimal Sidekick rendering
- Full Cheersworthy examples

### beehiiv Newsletter (/beehiiv)
Expert guide for the beehiiv newsletter platform — campaigns, subscribers, automations, and migration.

**Features:**
- Campaign creation and management
- Subscriber management and segmentation
- Automation workflows and welcome flows
- Platform migration support (ActiveCampaign → beehiiv)
- beehiiv API reference

### Video Editing (/video)
Video editing with FFmpeg and Remotion - stitching, transitions, captions, teasers, transcription.

**Features:**
- FFmpeg command reference
- Remotion React-based rendering
- TikTok-style captions
- Transcription with whisper.cpp
- Teaser generation

### Toast POS Admin (/toast-admin)
Toast POS daily operations and admin management.

### Toast POS API (/toast-api)
Toast POS API integrations for programmatic operations.

### Plaid Financial (/plaid)
Plaid financial platform integration for banking and transaction data.

---

## Critical Operational Principles

### Incremental Development
The core principle for n8n workflows:
**ADD ONE NODE → TEST → ADD ONE NODE → TEST → REPEAT**

This prevents batch errors by validating each addition individually.

### API Best Practices
- Use PUT for updates (not PATCH)
- Use POST for activation endpoints
- Webhook data is under .body (not root)

### Video Workflow
For video projects, follow:
1. Analyze source material
2. Transcribe audio
3. Clarify objectives
4. Plan edits
5. Run automated QA tests
6. Preview results
7. Iterate based on feedback

### Tool Selection

**n8n** — Prioritize native n8n nodes over HTTP Request or Code nodes.
Hierarchy: Native n8n node → HTTP Request node → Code node (last resort)

**Video** — Task Tool (fast operations, batch processing), FFmpeg (styled content, animations), Remotion

**MCP Server Integration** — If available, prefer MCP server tools for node discovery and validation before falling back to direct REST API approaches.

---

## Skill Directory Structure

```
skills/
├── youtube-channel/          # YouTube channel management
│   ├── SKILL.md
│   └── references/
│       ├── api-resources.md
│       ├── channel-setup-guide.md
│       ├── content-management.md
│       ├── audience-engagement.md
│       └── recipes.md
├── circle.so-skills/         # Circle.so community platform
│   ├── circle-so-admin/
│   │   ├── SKILL.md
│   │   └── references/
│   └── circle-so-api/
│       ├── SKILL.md
│       └── references/
├── Sidekick-shopify/         # Shopify Plugin (storefront + sidekick)
│   ├── plugin.json
│   ├── shared/
│   └── skills/
│       ├── shopify-storefront/
│       └── shopify-sidekick/
├── beehiiv/                  # beehiiv newsletter platform
│   ├── SKILL.md
│   └── references/
├── toast-admin/              # Toast POS admin
│   ├── SKILL.md
│   └── references/
├── toast-api/                # Toast POS API
│   ├── SKILL.md
│   └── references/
├── plaid/                    # Plaid financial platform
│   ├── manifest.json
│   ├── mcps/
│   └── skills/
├── n8n/                      # n8n workflow automation
│   ├── SKILL.md
│   └── references/
└── video/                    # Video editing
    ├── SKILL.md
    └── references/
```

---

## Loading a Skill

When a user invokes a skill command, immediately:
1. Read the skill's `SKILL.md` file
2. Read all files in `references/` directory
3. Create a todo list for the task
4. Follow the skill's operational guidelines

---

## Skill Creation & Installation Workflow

### For Claude Code
Skills are loaded automatically when Claude Code reads this `CLAUDE.md` at the project root. Each skill folder contains a `SKILL.md` that defines triggers and behavior, plus a `references/` directory with supporting documentation.

### For Cowork (Claude Desktop App)
Cowork manages skills through its own internal registry (`.skills/skills/`). To install a skill:
1. Package the skill directory as a `.skill` file: `cd parent-dir && zip -r skill-name.skill skill-name/`
2. Present the `.skill` file in a Cowork session for installation
3. The skill appears in subsequent sessions

### For GitHub (Backup & Sharing)
Push skill folders to this repository for version control and sharing.

### Creating a New Skill
1. Create folder: `~/Desktop/Storage/Claude/skills/your-skill-name/`
2. Add `SKILL.md` with frontmatter (name, description) and instructions
3. Add `references/` directory with supporting docs and code recipes
4. Package as `.skill` zip for Cowork installation
5. Push to GitHub for backup
