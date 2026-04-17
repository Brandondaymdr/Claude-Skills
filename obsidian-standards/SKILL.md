---
name: obsidian-standards
description: >
  Shared reference defining what good Obsidian vault notes look like — note templates, required
  sections, quality criteria, and naming conventions for each note type. Used by obsidian-enrich,
  obsidian-sync, and obsidian-context to maintain consistency across the vault. Trigger on:
  "obsidian standards", "note template", "what should my notes look like", "obsidian format",
  "vault standards", "note quality", "how should I structure my obsidian", or any variation of
  defining or reviewing Obsidian note quality. Also trigger when creating new Obsidian notes from
  scratch, when reviewing vault health or note quality, when another obsidian skill needs to know
  what format to follow, or when the user asks about best practices for their vault. Even if the
  user just says "what goes in an app note" — use this skill. Works in both Claude Code and Cowork.
---

# Obsidian Standards

The shared reference for note quality across the vault. Every obsidian skill (enrich, sync, context)
follows these standards so notes stay consistent regardless of which skill created or updated them.

---

## Note Types

The vault has several distinct note types, each with its own template and requirements.

### 1. App Note (Project)

For any software project — apps, tools, services, scripts with their own codebase.

**Required sections:**
- Overview (2-4 sentences: what, who, why)
- Tech Stack (frameworks, languages, key libraries)
- Code (repo link, local path)

**Expected sections** (include when the information exists):
- Architecture (design decisions, data flow, component relationships)
- Database (schema overview, Supabase project info with dashboard link)
- Commands (dev, build, test, deploy)
- Conventions (coding patterns, naming rules)
- Status (version, build phase, test count, what's next)
- Known Issues (gotchas, workarounds, things that break)
- References (links to project docs: BUILD-PLAN.md, ARCHITECTURE.md, etc.)

**Quality bar:**
- Minimum 50 words for any active project (if it's under 50, it's a stub that needs enrichment)
- Architecture section should explain *why* key decisions were made, not just what they are
- Gotchas should be specific and actionable, not vague ("PostgREST broken — PGRST002 schema
  cache error, using direct pg instead" not "database has some issues")
- Supabase projects must include: project name, org, region, compute size, and a clickable
  [Dashboard](https://supabase.com/dashboard/project/<ref-id>) link

**Template:**
```markdown
## Overview
[What it does, who it's for, what problem it solves]

## Tech Stack
[Frameworks, languages, key libraries, deployment target]

## Architecture
[Key design decisions and why. Data flow. How components connect.]

## Database
- **Project:** [name]
- **Org:** [org name] ([tier])
- **Region:** [region] | [compute size]
- [Dashboard](https://supabase.com/dashboard/project/[ref-id])

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| ... | ... | ... |

## Commands
\`\`\`bash
npm run dev     # Start dev server
npm run test    # Run test suite
npm run build   # Production build
\`\`\`

## Conventions
[Coding patterns, naming rules, file organization]

## Status
[Version, build phase, test count, current work, what's next]

## Known Issues
[Gotchas, workarounds, things that break — be specific]

## Code
- **Repo:** [GitHub](url)
- **Local:** \`path/to/project\`

## References
| Topic | File |
|-------|------|
| ... | ... |
```

### 2. Operations Note

For business processes — payroll, taxes, inventory, licensing, vendor management.

**Required sections:**
- Key Info (account numbers, EINs, license numbers — the reference data people look up)
- Sub-notes or linked SOPs

**Expected sections:**
- Google Drive links (to worksheets, templates, original documents)
- Vendor contacts
- Renewal dates / deadlines
- Process overview

**Quality bar:**
- Reference data (EINs, license numbers, permit numbers) must be exact — no approximations
- Links to Google Drive should use external markdown links: `[Sheet Name](https://docs.google.com/...)`
- SOPs should be separate linked notes, not inline: `[[Payroll SOP]]`

### 3. Hub Note

For index/overview pages that link to many sub-notes (Projects hub, Crowded Barrel Overview).

**Required sections:**
- Brief intro (1-2 sentences explaining what this hub covers)
- Organized links to sub-notes using wikilinks

**Quality bar:**
- Every sub-note listed in the hub should actually exist in the vault
- Group links by category (product line, department, type)
- Include a one-liner description next to each link:
  `- [[Shorestack Books]] — Bookkeeping (QuickBooks replacement)`

### 4. Reference Note

For standalone reference material — bottle releases index, event planning, creative assets.

**Required sections:**
- Whatever the content demands — these are flexible

**Quality bar:**
- Should link to related notes where connections exist
- Should have a clear purpose stated at the top

---

## Universal Standards

These apply to every note in the vault regardless of type.

### Naming

- **Title case** for note names: `Shorestack Books`, not `shorestack-books` or `SHORESTACK BOOKS`
- **Match the display name**, not the technical name: `Barrel Tracking`, not `barrel-tracking`
- **No file extensions** in note names (Obsidian adds `.md` automatically)

### Linking

- **Wikilinks** for internal vault references: `[[Note Name]]`
- **Markdown links** for external URLs: `[Display Text](https://...)`
- **Link related projects** whenever they share a database, codebase, or workflow
- **Link from hub notes** to sub-notes, and from sub-notes back to hubs where helpful

### Formatting

- **H2 (`##`) for top-level sections** — H1 is reserved for the note title (auto-generated by Obsidian)
- **Tables for structured data** — database schemas, reference links, vendor lists
- **Code blocks for commands** with inline comments explaining what each does
- **Bold for labels** in key-value pairs: `- **Project:** shorestack-books`
- **Backticks for code/paths**: `` `Desktop/Storage/Claude/DaysLLC/shorestack-books` ``

### Content quality

- **Be specific, not vague.** "Uses React 18 + Vite 6 with IndexedDB for offline-first" beats
  "Built with modern JavaScript frameworks"
- **Preserve the developer voice.** Don't sanitize technical content into marketing speak.
  "PostgREST broke, using direct pg via pooler" is better than "Alternative database connection
  method implemented"
- **Include the why.** Architecture decisions without rationale are just trivia. "Direct PG instead
  of PostgREST: PostgREST returned PGRST002 schema cache error and never recovered" tells the
  next developer why they shouldn't try switching back
- **Gotchas are gold.** The Known Issues section is often the most valuable part of a note because
  it captures knowledge that isn't documented anywhere else. Keep gotchas specific, with the
  symptom, cause, and workaround

### Freshness

- **Status should reflect reality.** If the note says "Phase 3" but the project is on Phase 6,
  the note is stale and should be updated via obsidian-sync
- **Don't remove old gotchas** unless they're confirmed resolved. A gotcha that was relevant
  6 months ago might still bite someone today
- **References should point to files that exist.** If a referenced doc was deleted or renamed,
  update or remove the reference

---

## Vault Structure

The vault is organized by business entity and function:

```
daysllc-obsidian/
├── Admin/               — Business admin (finances, etc.)
├── Crowded Barrel/      — CB Bible content + CB app notes
│   ├── Operations/      — Payroll, taxes, vendors
│   ├── Alchemy/         — Bar ops
│   ├── Distillery/      — Production
│   ├── Whiskey Tribe/   — Content, newsletters
│   ├── Barrel Tracking.md  — App note
│   ├── Payroll CB.md       — App note
│   └── ...
├── Days LLC/
│   ├── Projects/        — Master project hub
│   │   ├── Shorestack/  — Shorestack suite apps
│   │   ├── Harper/      — Harper salon apps
│   │   ├── Carla/       — Carla Gentile apps
│   │   └── Cheersworthy.md
│   └── Finances/
└── .obsidian/           — Obsidian config (don't modify)
```

**Placement rules:**
- Shorestack/Harper/Carla/Cheersworthy app notes → `Days LLC/Projects/[Product Line]/`
- Crowded Barrel app notes → `Crowded Barrel/` (alongside the Bible content)
- Operations/process notes → inside their entity folder
- Hub notes → at the level they index (Projects.md in Projects/, CB Overview in Crowded Barrel/)
