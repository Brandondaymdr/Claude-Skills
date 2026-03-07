# Instagram Plugin for Claude

A comprehensive Instagram management plugin for Claude Cowork and Claude Code. Manage Instagram Business accounts — publish posts, reels, stories, and carousels; track analytics; moderate comments; research hashtags — all through Claude.

## What's Included

| Component | Description |
|-----------|-------------|
| `SKILL.md` | Skill file that teaches Claude how to use the Instagram tools effectively |
| `instagram-mcp-server/` | TypeScript MCP server wrapping the Instagram Graph API |
| `references/` | Setup guides and API reference documentation |

## 20 MCP Tools

### Publishing (7 tools)
- **instagram_publish_photo** — Post photos to feed
- **instagram_publish_video** — Post videos to feed
- **instagram_publish_reel** — Post Reels (short-form video)
- **instagram_publish_story** — Post Stories (24hr)
- **instagram_publish_carousel** — Post carousels (2-10 slides)
- **instagram_check_container_status** — Check video processing status
- **instagram_publish_container** — Publish processed content

### Analytics (3 tools)
- **instagram_get_account_insights** — Account metrics (reach, impressions, etc.)
- **instagram_get_media_insights** — Per-post performance
- **instagram_get_follower_demographics** — Audience age, gender, location

### Community (4 tools)
- **instagram_list_comments** — Read comments
- **instagram_reply_to_comment** — Reply to comments
- **instagram_hide_comment** — Hide/unhide comments
- **instagram_delete_comment** — Delete comments

### Account & Discovery (6 tools)
- **instagram_get_account_info** — Profile info
- **instagram_get_publishing_limit** — Check daily quota
- **instagram_list_media** — Browse recent posts
- **instagram_get_media_details** — Full post details
- **instagram_search_hashtag** / **instagram_get_hashtag_media** — Hashtag research
- **instagram_get_mentions** — Tagged/mentioned posts
- **instagram_refresh_token** — Refresh access token

## Prerequisites

1. **Instagram Business or Creator account** (not personal)
2. **Meta Developer App** with Instagram Graph API access
3. **Long-lived access token** (60-day validity)
4. **Node.js 18+**

See `references/meta-app-setup.md` for detailed setup instructions.

## Quick Start

### 1. Build the MCP Server

```bash
cd instagram-mcp-server
npm install
npm run build
```

### 2. Set Environment Variables

```bash
export INSTAGRAM_ACCESS_TOKEN="your-long-lived-token"
export INSTAGRAM_ACCOUNT_ID="your-default-account-id"
```

### 3. Add to Claude Code

Add to your Claude Code MCP settings (`~/.claude/settings.json` or project-level `.claude/settings.json`):

```json
{
  "mcpServers": {
    "instagram": {
      "command": "node",
      "args": ["/path/to/instagram/instagram-mcp-server/dist/index.js"],
      "env": {
        "INSTAGRAM_ACCESS_TOKEN": "your-token-here",
        "INSTAGRAM_ACCOUNT_ID": "your-account-id"
      }
    }
  }
}
```

### 4. Add Skill to Claude Code

Copy the skill folder to your Claude Code skills directory:

```bash
cp -r /path/to/instagram ~/.claude/skills/instagram
```

Or add it as a project-level skill by placing it in your project's `.claude/skills/` directory.

### 5. Add to Claude Cowork

In Claude Desktop (Cowork mode):
1. Go to Settings → Skills
2. Add the instagram skill folder
3. Go to Settings → MCP Servers
4. Add the MCP server configuration above

## Managing Multiple Accounts

The plugin supports multiple Instagram accounts. Set one as your default via `INSTAGRAM_ACCOUNT_ID` and pass the other account's ID using the `account_id` parameter on any tool call.

## Token Refresh

Access tokens expire every 60 days. Use the `instagram_refresh_token` tool to get a new one, then update your environment variable.

## File Structure

```
instagram/
├── SKILL.md                          # Skill instructions for Claude
├── README.md                         # This file
├── references/
│   ├── meta-app-setup.md            # How to set up Meta App & get tokens
│   └── api-reference.md             # Instagram Graph API quick reference
└── instagram-mcp-server/
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── index.ts                  # Server entry point
    │   ├── constants.ts              # API URLs, limits, enums
    │   ├── types.ts                  # TypeScript interfaces
    │   ├── services/
    │   │   └── instagram-api.ts      # API client
    │   ├── schemas/
    │   │   ├── publishing.ts         # Zod schemas for publishing
    │   │   ├── insights.ts           # Zod schemas for insights
    │   │   ├── comments.ts           # Zod schemas for comments
    │   │   └── account.ts            # Zod schemas for account tools
    │   └── tools/
    │       ├── publishing.ts         # Publishing tool implementations
    │       ├── insights.ts           # Insights tool implementations
    │       ├── comments.ts           # Comment tool implementations
    │       └── account.ts            # Account tool implementations
    └── dist/                         # Built JavaScript (after npm run build)
```

## License

Private — for use with Carla Gentile's Instagram accounts.
