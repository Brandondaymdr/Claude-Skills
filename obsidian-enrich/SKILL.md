---
name: obsidian-enrich
description: >
  Enrich Obsidian vault notes with full project context pulled from CLAUDE.md files and codebases.
  Use this skill whenever the user wants to populate, enrich, update, or sync their Obsidian vault
  with real project context — architecture, database schemas, build status, gotchas, commands, and
  conventions. Trigger on: "enrich obsidian", "update obsidian", "sync to obsidian", "populate my
  vault", "pull context into obsidian", "obsidian is thin", "fill in my obsidian notes", "update
  my app notes", or any variation of making Obsidian notes richer with project data. Also trigger
  when the user says "obsidian" in the context of project documentation being incomplete or stale.
  Even if the user just says "update my notes" and the context involves Obsidian — use this skill.
  Works in both Claude Code and Cowork.
---

# Obsidian Enrich

Pull real project context from CLAUDE.md files and codebases into Obsidian vault notes. This turns
thin placeholder notes into a genuine knowledge base that Claude can use for cross-project context.

## Why This Matters

An Obsidian vault full of one-line descriptions and file paths isn't useful context — it's an index.
The real value is when each app note contains the architecture decisions, database schemas, coding
conventions, build status, and known gotchas that would otherwise live only in CLAUDE.md files buried
in project folders. When the vault is rich, any Claude session can load relevant context from Obsidian
instead of re-discovering it from the codebase every time.

## How It Works

The enrichment process has three phases: Discovery, Extraction, and Writing. You scan for source
material, pull out the meaningful content, and structure it into each Obsidian note using a consistent
template. The skill handles both initial enrichment (filling empty/thin notes) and re-enrichment
(updating notes that have gone stale).

---

## Phase 1: Discovery

Map each Obsidian app note to its source project folder.

### Locate the vault and project folders

The user's setup may vary. Common patterns:

- **Obsidian vault:** Look for `.obsidian/` directory to confirm vault root
- **Project folders:** Often in `Desktop/Storage/Claude/` or similar. Each project has a CLAUDE.md at its root
- **Mapping:** Each Obsidian note typically has a `Local:` path or folder reference that points to the project

Ask the user to confirm the vault path and project folder path if they aren't obvious from context.

### Scan for CLAUDE.md files

```bash
find <project-root> -maxdepth 3 -name "CLAUDE.md" -type f
```

For each CLAUDE.md found, identify which Obsidian note it maps to. The project folder name usually
matches the note name (e.g., `shorestack-books/CLAUDE.md` → `Shorestack Books.md`).

### Assess current note depth

Before enriching, check what's already in each Obsidian note. Categorize:

- **Empty/stub:** Just a title or a few words. Needs full enrichment.
- **Thin:** Has an overview and links but no architecture, schemas, or conventions. Needs enrichment.
- **Rich:** Already has detailed sections. May need refresh if CLAUDE.md has changed.

Report the findings to the user: "Found 15 CLAUDE.md files. 3 notes are empty, 8 are thin, 4 are already rich. Want me to enrich all of them, or just the empty/thin ones?"

---

## Phase 2: Extraction

Read each CLAUDE.md and extract content into a structured format. CLAUDE.md files typically contain
these sections (not all projects have all sections):

### What to extract

| Section | What it contains | Priority |
|---------|-----------------|----------|
| Project Identity | Description, tech stack, URLs, version | Always include |
| Architecture | System design, data flow, key decisions | Always include |
| Database / Schema | Tables, relationships, migration notes | Always include if present |
| Commands | Dev, build, test, deploy commands | Always include |
| Code Conventions | Patterns, rules, naming conventions | Include — this is institutional knowledge |
| Project Structure | Key files/folders and their purpose | Include |
| Build Status / Roadmap | What's done, what's next, phase tracking | Always include |
| Gotchas / Known Issues | Warnings, quirks, things that break | Always include — highest-value content |
| References | Links to detailed docs (BUILD-PLAN.md, etc.) | Include as links |

### Also check for supplementary files

Some projects have additional context files beyond CLAUDE.md:

```bash
ls <project-root>/{BUILD-PLAN,DISCOVERY,AUDIT-REPORT,MIGRATION,ARCHITECTURE,SCHEMA}*.md 2>/dev/null
```

If these exist, read them and pull key details into the Obsidian note. Don't duplicate the entire
file — summarize and link. For example: "See `BUILD-PLAN.md` for full phase breakdown. Current
status: Phase 3 of 5 complete."

### Check for database schema info

If the project uses Supabase, look for:
- Schema definitions in CLAUDE.md (often as markdown tables)
- Migration files in `supabase/migrations/`
- Type definitions in TypeScript files that reveal table structures
- The Supabase project ID, org, region, and tier from config files or CLAUDE.md
- The dashboard URL — format: `https://supabase.com/dashboard/project/<project-ref-id>`

Database schemas are some of the most valuable context to have in Obsidian because they're needed
across multiple tools and sessions. Always include a clickable dashboard link — this lets the user
jump straight from Obsidian to the Supabase console.

---

## Phase 3: Writing

Structure the extracted content into each Obsidian note using a consistent template.

### Enriched Note Template

Every enriched app note should follow this structure. Sections with no content should be omitted
entirely (don't leave empty headers):

```markdown
## Overview
[2-4 sentences: what this app does, who it's for, what problem it solves]

## Tech Stack
[Frameworks, languages, key libraries, deployment target]

## Architecture
[Key design decisions, data flow, how components connect.
This is the section that saves future-you from re-reading the entire codebase.]

## Database
[Schema overview — key tables, relationships, important columns.
If the project uses Supabase, ALWAYS include:
- Project name and ref ID
- Org and tier (Free/Pro)
- Region and compute size
- Clickable dashboard link: [Dashboard](https://supabase.com/dashboard/project/<ref-id>)
For complex schemas, use a summary table:]

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| ... | ... | ... |

## Commands
[Dev server, build, test, deploy — the commands someone needs to work on this project]

```bash
npm run dev     # Start dev server
npm run test    # Run test suite
npm run build   # Production build
```

## Conventions
[Coding patterns, naming rules, file organization rules — the stuff that
makes PRs consistent and prevents style drift]

## Status
[Current build phase, what's complete, what's in progress, what's next.
Include test count if available (e.g., "2,766 passing unit tests")]

## Known Issues
[Gotchas, workarounds, things that break. This is often the most valuable
section because it captures hard-won knowledge that isn't documented anywhere else.]

## Code
- **Repo:** [GitHub](url) (if applicable)
- **Local:** `path/to/project`

## References
[Links to detailed docs within the project: BUILD-PLAN.md, DISCOVERY.md, etc.
Also cross-links to related Obsidian notes using [[wikilinks]].]
```

### Writing Guidelines

**Preserve the source voice.** CLAUDE.md files are written for developers in an active session.
Keep that directness. Don't sanitize "This will break if you..." into "Users should be aware that..."

**Include the gotchas verbatim.** Known issues, workarounds, and warnings are the highest-value
content. Copy them as-is from CLAUDE.md rather than summarizing — the specific details matter.

**Use wikilinks for cross-references.** If Barrel Tracking shares a database with HowDoYouWhisky,
link them: `Shares database with [[HowDoYouWhisky]]`. This is what makes Obsidian powerful.

**Keep database schemas as tables.** Markdown tables render well in Obsidian and are scannable.
Don't convert them to prose.

**Don't duplicate full reference docs.** If a project has a 200-line BUILD-PLAN.md, summarize the
current status and link to the file rather than copying the whole thing into the note.

---

## Environment-Specific Behavior

### Cowork Mode

In Cowork, you have access to the vault via the mounted folder and can write files directly.
However, Obsidian on the user's Mac may not immediately see filesystem changes (mount sync delay).

**For notes that Obsidian has already indexed as empty:**
These need clipboard paste. Use `write_clipboard` + Quick Switcher (`Cmd+O`) to navigate to
the note, then `Cmd+V` to paste. This is slower but guarantees Obsidian sees the content.

**For new notes that don't exist yet:**
Write them to the filesystem via the Write tool. Then tell the user to reload Obsidian
(`Cmd+P` → "Reload app without saving") to pick them up.

**For notes that already have content:**
Read the current content first, merge the enriched content, then write back via filesystem.
These usually sync without issues since Obsidian is already tracking the file.

### Claude Code Mode

In Claude Code, you have direct filesystem access to both the vault and project folders.
Write enriched content directly to the Obsidian vault files. No clipboard workaround needed.

After writing, remind the user to reload Obsidian if it's open: `Cmd+P` → "Reload app without saving".

---

## Incremental Enrichment

This skill supports re-running on notes that have already been enriched. When re-enriching:

1. **Read the current Obsidian note** to see what's already there
2. **Read the current CLAUDE.md** to see what's changed
3. **Diff the content** — identify new sections, updated status, new gotchas
4. **Merge intelligently:**
   - Add new sections that didn't exist before
   - Update Status/Roadmap sections with current progress
   - Append new gotchas (don't remove old ones — they may still be relevant)
   - Don't overwrite user-added content (anything not from CLAUDE.md)

If you're unsure whether the user added something manually, ask before overwriting.

---

## Verification

After enriching notes, verify the results:

1. **Word count check:** Enriched notes should typically be 50-200+ words depending on project complexity.
   A 15-word note after enrichment means something went wrong.
2. **Section check:** Every enriched note should have at minimum: Overview, Tech Stack, and Code.
   Architecture and Status should be present for any active project.
3. **Link check:** Wikilinks should point to notes that actually exist in the vault.
4. **In Cowork:** Open a few notes in Obsidian via Quick Switcher and visually confirm content rendered.

Report results to the user: "Enriched 12 notes. Average depth: 120 words. 3 notes have database
schemas, 8 have gotchas sections, all have architecture overviews."
