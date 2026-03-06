# BenAI Skills - Expert Automation

> A marketplace of automation plugins for Claude Code

## Available Skills

### n8n Automation (`/n8n`)

Build, test, and deploy n8n workflows via REST API with incremental testing.

**Features:**
- Workflow automation via REST API
- Node references for 40+ common nodes
- JavaScript/Python code patterns
- Expression syntax reference
- Debugging guides

**Setup Requirements:**
```env
N8N_API_URL=https://your-n8n-instance.com
N8N_API_KEY=your-api-key
N8N_CREDENTIALS_TEMPLATE_URL=your-template-url
```

### Video Editing (`/video`)

Video editing with FFmpeg and Remotion - stitching, transitions, captions, teasers, transcription.

**Features:**
- FFmpeg command reference
- Remotion React-based rendering
- TikTok-style captions
- Transcription with whisper.cpp
- Teaser generation

## Critical Operational Principles

### Incremental Development

The core principle for n8n workflows:
```
ADD ONE NODE → TEST → ADD ONE NODE → TEST → REPEAT
```

This prevents batch errors by validating each addition individually.

### API Best Practices

- Use **PUT** for updates (not PATCH)
- Use **POST** for activation endpoints
- Webhook data is under `.body` (not root)

### Video Workflow

For video projects, follow:
1. Analyze source material
2. Transcribe audio
3. Clarify objectives
4. Plan edits
5. Run automated QA tests
6. Preview results
7. Iterate based on feedback

## Tool Selection

### n8n

**Prioritize native n8n nodes** over HTTP Request or Code nodes.

Hierarchy:
1. Native n8n node
2. HTTP Request node
3. Code node (last resort)

### Video

| Task | Tool |
|------|------|
| Fast operations, batch processing | FFmpeg |
| Styled content, animations | Remotion |

## MCP Server Integration

If available, prefer MCP server tools for node discovery and validation before falling back to direct REST API approaches.

## Skill Directory Structure

```
skills/
├── n8n/
│   ├── SKILL.md
│   └── references/
│       ├── pitfalls.md
│       ├── build-process.md
│       └── expressions.md
└── video/
    ├── SKILL.md
    └── references/
        ├── captions.md
        └── transcription.md
```

## Loading a Skill

When a user invokes a skill command, immediately:

1. Read the skill's `SKILL.md` file
2. Read all files in `references/` directory
3. Create a todo list for the task
4. Follow the skill's operational guidelines
