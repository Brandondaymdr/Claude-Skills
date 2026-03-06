# BenAI Skills

A plugin marketplace for Claude Code providing automation capabilities through specialized skills.

## Available Skills

### n8n Automation

Build, test, and deploy n8n workflows via REST API with incremental testing.

**Capabilities:**
- Workflow creation and management
- 40+ node type references
- JavaScript/Python code patterns
- Expression syntax guide
- Common pitfalls and solutions

**Setup:**
```bash
# Create .env file with:
N8N_API_URL=https://your-n8n-instance.com
N8N_API_KEY=your-api-key
N8N_CREDENTIALS_TEMPLATE_URL=your-template-url
```

### Video Editing

Video editing with FFmpeg and Remotion for stitching, transitions, captions, teasers, and transcription.

**Capabilities:**
- Video stitching and concatenation
- TikTok-style dynamic captions
- Teaser generation
- Audio transcription (whisper.cpp)
- Title cards and graphics

## Installation

### Option 1: Add Marketplace

```bash
/plugin marketplace add naveedharri/benai-skills
```

### Option 2: Install Individual Plugins

```bash
/plugin install n8n@benai-skills
/plugin install video@benai-skills
```

## Usage

### n8n Automation

```
/n8n Create a workflow that receives webhook data and saves it to Google Sheets
```

### Video Editing

```
/video Add TikTok-style captions to my video
```

## Project Structure

```
.
├── CLAUDE.md              # Skill overview for Claude
├── README.md              # This file
├── .claude-plugin/
│   └── marketplace.json   # Plugin registry
└── skills/
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

## Creating New Skills

1. Create a folder under `skills/` with your skill name
2. Add a `SKILL.md` with activation triggers and guidelines
3. Add reference documents in a `references/` subfolder
4. Register in `.claude-plugin/marketplace.json`

## License

MIT License - See LICENSE file for details.

## Credits

Original repository: [naveedharri/benai-skills](https://github.com/naveedharri/benai-skills)
