# Obsidian Flavored Markdown Reference

Quick reference for Obsidian-specific syntax. Use these in all vault notes.

## Wikilinks

```markdown
[[Note Name]]                    — Link to a note
[[Note Name|Display Text]]       — Link with custom display text
[[Note Name#Heading]]            — Link to a specific heading
[[Note Name#^block-id]]          — Link to a specific block
```

## Embeds

```markdown
![[Note Name]]                   — Embed entire note
![[Note Name#Heading]]           — Embed specific section
![[image.png]]                   — Embed image
![[image.png|300]]               — Embed image with width
![[audio.mp3]]                   — Embed audio
![[document.pdf]]                — Embed PDF
```

## Callouts

Use callouts to visually highlight important content. Syntax:

```markdown
> [!note] Optional Title
> Content here

> [!tip] Optional Title
> Content here

> [!warning] Optional Title
> Content here

> [!important] Optional Title
> Content here

> [!question] Optional Title
> Content here

> [!success] Optional Title
> Content here

> [!failure] Optional Title
> Content here

> [!info] Optional Title
> Content here

> [!todo] Optional Title
> Content here
```

Callouts can be **foldable** with `+` (expanded) or `-` (collapsed):

```markdown
> [!tip]- Click to expand
> Hidden content here
```

Callouts can be **nested**:

```markdown
> [!question] Can callouts be nested?
> > [!success] Yes!, they can.
```

### When to Use Each Callout

| Callout | Use For |
|---------|---------|
| `[!note]` | General information, context |
| `[!tip]` | Wins, positive outcomes, helpful hints |
| `[!warning]` | Blockers, risks, overdue items |
| `[!important]` | Key decisions, critical info |
| `[!question]` | Open questions, unresolved items |
| `[!todo]` | Action items, next steps |
| `[!success]` | Completed goals, achievements |
| `[!failure]` | Failed attempts, lessons from mistakes |
| `[!info]` | Reference data, stats, metrics |

## Highlights & Comments

```markdown
==highlighted text==             — Yellow highlight
%%hidden comment%%               — Only visible in edit mode, not preview
```

## Tags

```markdown
#tag                             — Inline tag
#nested/tag                      — Nested tag
```

In frontmatter:
```yaml
tags: [tag1, tag2, nested/tag]
```

## Properties (Frontmatter)

Supported types:
- **Text**: `key: value`
- **List**: `key: [item1, item2]`
- **Number**: `key: 42`
- **Checkbox**: `key: true` / `key: false`
- **Date**: `key: 2026-01-15`
- **Date & time**: `key: 2026-01-15T09:30:00`

### Standard Properties for This Vault

```yaml
---
type: daily-note | meeting | project | reference | thinking
date: YYYY-MM-DD
status: active | completed | archived
project: Project-Name
tags: [tag1, tag2]
priority: high | normal | low
---
```

## Anti-Patterns (Do NOT Do These)

- Do NOT use `[text](path)` markdown links for internal notes — use `[[wikilinks]]` instead
- Do NOT put tags in the body when they belong in frontmatter `tags:` field
- Do NOT use `# Title` if the same title is already the filename — Obsidian shows the filename as title
- Do NOT embed large files without specifying dimensions — use `![[image.png|400]]`
- Do NOT create orphan notes — always link new notes from at least one existing note
