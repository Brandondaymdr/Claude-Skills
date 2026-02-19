# Brandon's Claude Skills

> Personal skills marketplace for Claude Code and Cowork

## Available Skills

### Toast POS - Admin (`/toast-admin`)

Daily operations and management for cafes/bars on Toast POS.

**Features:**
- Menu management (items, modifiers, happy hour, 86'd items, publishing)
- Order management (tabs, online orders, voids/comps)
- Employee management (roles, permissions, scheduling, tips)
- Reporting & analytics (sales, product mix, labor, payments)
- Kitchen operations (prep stations, routing, KDS)
- Online ordering setup and optimization
- Guest management & loyalty programs

### Toast POS - API (`/toast-api`)

Toast platform REST API integrations and developer reference.

**Features:**
- Authentication (OAuth 2.0 client credentials)
- Orders API — retrieve and create orders
- Menus API — fetch menu structure
- Labor API — employees, jobs, shifts, time entries
- Stock API — inventory management
- Analytics API (ERA) — reporting data
- Webhooks — real-time event notifications
- Integration patterns (accounting sync, online ordering, payroll)

### Circle.so - Admin (`/circle-so-admin`)

Circle.so platform administration and community management.

**Features:**
- Space and member management
- Events and courses
- Community settings and customization
- Gamification and workflows

### Circle.so - API (`/circle-so-api`)

Circle.so Admin API v2 for programmatic community management.

**Features:**
- CRUD for spaces, members, posts, events, courses
- Access groups and forms
- Automation workflows
- Data migration

### n8n Automation (`/n8n`)

Build, test, and deploy n8n workflows via REST API with incremental testing.

**Features:**
- Workflow automation via REST API
- Node references for 40+ common nodes
- JavaScript/Python code patterns
- Expression syntax reference
- Debugging guides

**Setup:**
```env
N8N_API_URL=https://your-n8n-instance.com
N8N_API_KEY=your-api-key
N8N_CREDENTIALS_TEMPLATE_URL=your-template-url
```

### Video Editing (`/video`)

Video editing with FFmpeg and Remotion — stitching, transitions, captions, teasers, transcription.

**Features:**
- FFmpeg command reference
- Remotion React-based rendering
- TikTok-style captions
- Transcription with whisper.cpp
- Teaser generation

## Skill Directory Structure

```
skills/
├── toast-admin/           # Toast POS daily operations
│   ├── SKILL.md
│   └── references/
│       ├── cafe-bar-playbook.md
│       └── toast-web-navigation.md
├── toast-api/             # Toast POS API integrations
│   ├── SKILL.md
│   └── references/
│       ├── api-endpoints-reference.md
│       ├── webhook-setup.md
│       └── integration-cookbook.md
├── circle.so-skills/      # Circle.so community platform
│   ├── circle-so-admin/
│   └── circle-so-api/
├── n8n/                   # n8n workflow automation
│   ├── SKILL.md
│   └── references/
└── video/                 # Video editing
    ├── SKILL.md
    └── references/
```

## Loading a Skill

When a user invokes a skill command, immediately:

1. Read the skill's `SKILL.md` file
2. Read relevant files in `references/` directory
3. Create a todo list for the task
4. Follow the skill's operational guidelines
