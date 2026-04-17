---
type: guide
folder: Intelligence
---

# Intelligence

What you know — synthesized knowledge, meeting history, competitive intel, and decision records.

## What Goes Here

| Subfolder | Contents | Modes |
|-----------|----------|-------|
| `meetings/` | Meeting transcripts and summaries | All modes |
| `competitors/` | Competitor profiles, analysis, positioning notes | General, Business |
| `market/` | Market research, trends, customer insights | General, Business |
| `decisions/` | Decision records with reasoning (`YYYY-MM-DD-title.md`) | All modes |
| `processes/` | Org-wide SOPs, runbooks, workflows | Business only |
| `archive/` | Older entries moved here when thresholds are exceeded | All modes |

## Meeting Subfolders by Mode

**General:** `team-standups/`, `client-calls/`, `one-on-ones/`, `general/`

**Business:** `team-standups/`, `client-calls/`, `one-on-ones/`, `board-reviews/`, `all-hands/`, `cross-team/`, `general/`

**Personal:** `general/`, `personal/`

## Naming Conventions

- **Meetings**: `YYYY-MM-DD Meeting Title.md`
- **Decisions**: `YYYY-MM-DD-decision-title.md`
- **Competitors**: `company-name.md`
- **Market**: descriptive title (e.g., `ai-market-landscape.md`)
- **Processes**: action-oriented (e.g., `incident-response-runbook.md`)

## Frontmatter

```yaml
---
type: intelligence
subtype: meeting | decision | competitor | market | process
date: YYYY-MM-DD
tags: [relevant-tags]
---
```

## Tips
- Meetings are auto-filed by `/meetings`
- Write a decision record whenever you make a non-obvious choice — future you will thank present you
- Competitive intel compounds over time — even small observations are worth capturing
- Use [[wikilinks]] to connect intelligence to projects and context files
