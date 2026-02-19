# Brandon's Claude Skills

A personal skills repo for Claude Code and Cowork — Toast POS, Circle.so, n8n automation, video editing, and more.

## Available Skills

| Skill | Description |
|-------|-------------|
| **toast-admin** | Toast POS daily operations — menus, orders, employees, reports, payments, kitchen ops |
| **toast-api** | Toast POS REST API — orders, menus, labor, stock, analytics, webhooks |
| **circle-so-admin** | Circle.so admin — spaces, members, events, courses, community settings |
| **circle-so-api** | Circle.so API v2 — programmatic community management and automations |
| **n8n** | n8n workflow automation via REST API with incremental testing |
| **video** | Video editing with FFmpeg and Remotion — stitching, captions, teasers |

## Installation

### Cowork (Desktop App)

1. Go to **Cowork Settings > Skills**
2. Package any skill folder as a `.skill` file and upload it
3. Or connect this repo as a skills source

### Claude Code (CLI)

Add this repo as a plugin marketplace:

```bash
claude plugin marketplace add Brandondaymdr/Claude-Skills
```

Or install individual skills:

```bash
claude plugin install toast-admin@Brandondaymdr/Claude-Skills
claude plugin install toast-api@Brandondaymdr/Claude-Skills
```

## Project Structure

```
.
├── CLAUDE.md                  # Skill overview for Claude
├── README.md                  # This file
├── .claude-plugin/
│   └── marketplace.json       # Plugin registry
└── skills/
    ├── toast-admin/           # Toast POS daily operations
    │   ├── SKILL.md
    │   └── references/
    ├── toast-api/             # Toast POS API integrations
    │   ├── SKILL.md
    │   └── references/
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

## Creating New Skills

1. Create a folder under `skills/` with your skill name
2. Add a `SKILL.md` with YAML frontmatter (`name` and `description`) and instructions
3. Add reference documents in a `references/` subfolder
4. Register in `.claude-plugin/marketplace.json`
5. Push to this repo

## Credits

- n8n and video skills originally from [naveedharri/benai-skills](https://github.com/naveedharri/benai-skills)
- Toast POS and Circle.so skills by Brandon Day
