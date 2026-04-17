---
name: obsidian-context
description: >
  Load relevant Obsidian vault notes as working context when starting a task or coding session.
  Reads the vault to give Claude cross-project awareness — architecture, database schemas, gotchas,
  conventions, and relationships between projects — so you don't start every session cold. Trigger
  on: "load obsidian context", "check obsidian", "what does obsidian say about", "get context from
  obsidian", "read my vault", "obsidian context", "what do my notes say", or any variation of
  pulling knowledge from Obsidian before starting work. Also trigger when the user starts a coding
  session and mentions Obsidian, when they say "restart" or "resume" and have an Obsidian vault,
  when they ask about a project and the answer might be in their vault, or when they want to
  understand how projects relate to each other. Even if the user just says "what do we know about
  shorestack-books" — check Obsidian first. Works in both Claude Code and Cowork. Pairs naturally
  with session-restart.
---

# Obsidian Context

Load project knowledge from the Obsidian vault to give Claude rich working context at the start
of a task. Instead of re-reading CLAUDE.md files and re-discovering architecture from source code,
pull the curated knowledge that's already been captured in the vault.

## Why This Matters

Every new Claude session starts with zero project knowledge. CLAUDE.md helps for single-project
work, but when projects share databases, conventions, or dependencies, you need cross-project
awareness. The Obsidian vault is the only place where all of this lives together — Barrel Tracking's
note links to HowDoYouWhisky (shared database), which links to Monthly Inventory (shared compliance
data). Loading context from the vault gives Claude this web of relationships instantly.

---

## When to Load Context

### Automatic triggers (suggest loading without being asked)

- **Session start on a known project** — if the user says "let's work on barrel-tracking" and
  there's an Obsidian vault available, offer to load its note for context
- **After session-restart** — the restart skill recovers project state from CLAUDE.md and git.
  Obsidian context adds the cross-project layer on top
- **When a question touches multiple projects** — "how does the payroll system connect to timeclock?"
  Load both notes to answer accurately

### Explicit triggers

- "Load obsidian context for shorestack-books"
- "What does my vault say about barrel tracking?"
- "Get me up to speed on the Harper apps"
- "Check obsidian before we start"

---

## Phase 1: Identify What to Load

### Single project

If the user named a specific project, find its Obsidian note. Check these locations:

- `Days LLC/Projects/` (Shorestack, Harper, Carla, Cheersworthy apps)
- `Crowded Barrel/` (CB app notes like Barrel Tracking, Alchemy App, etc.)
- The vault root or any other folder

Use the Quick Switcher search logic — match by project name, accounting for formatting differences
(e.g., "shorestack-books" → "Shorestack Books", "barrel-tracking" → "Barrel Tracking").

### Related projects (the graph walk)

After finding the primary note, check for wikilinks to related projects. These are the
cross-references that make Obsidian context more valuable than just reading CLAUDE.md:

- `[[HowDoYouWhisky]]` linked from Barrel Tracking → shared database, load it
- `[[Harper Payroll]]` linked from Harper Timeclock → shared Supabase project, load it
- `[[Alchemy]]` linked from Alchemy App → operations context, load it

Load up to 3 related notes. Beyond that, you're pulling in too much context for diminishing returns.

### Multi-project or broad context

If the user asks for broad context ("get me up to speed on everything" or "what's the status of
all my apps"), load the Projects hub note first — it has the master list with one-liners for every
project. Then selectively load detail notes for whatever the user is about to work on.

---

## Phase 2: Read and Summarize

### Read the notes

Read each identified Obsidian note. For each one, extract:

1. **Overview** — what it does, who it's for
2. **Current status** — build phase, version, test count
3. **Architecture highlights** — key design decisions, tech stack
4. **Database info** — schema overview, shared databases, dashboard links
5. **Known issues** — active gotchas and workarounds
6. **Cross-references** — what other projects it connects to and how

### Present context to the user

Don't just dump the raw notes. Synthesize them into a briefing:

> **Barrel Tracking** — Phase 5 complete, Phase 6 (Inventory & Fulfillment) is next. Uses direct
> PostgreSQL via `pg` (PostgREST broken). 476 barrels in the system. Shares the `howdoyouwhisky`
> Supabase database with Monthly Inventory. Key gotcha: CSV imports have header spacing issues.
>
> **Related:** [[HowDoYouWhisky]] (shared DB, ID: etnjhwfhxochwckpkthg, us-west-2)

For multi-project briefings, keep each project to 2-3 lines. The user can ask for more detail
on any specific one.

### Flag stale context

If a note looks outdated (e.g., status says "Phase 3" but CLAUDE.md says "Phase 5"), mention it:

> "Note: The Obsidian note for Barrel Tracking shows Phase 3 but the project may have progressed.
> Consider running obsidian-sync after this session to update it."

---

## Phase 3: Set Up Working Context

### For Claude Code sessions

After presenting the briefing, the context is now in the conversation. Claude can reference it
throughout the session. If the user starts coding, the architecture decisions, conventions, and
gotchas from the vault are already loaded — no need to re-read CLAUDE.md for background info
(though CLAUDE.md should still be read for the latest session-specific state).

### For Cowork sessions

Same approach — read the notes, present the briefing, and carry the context forward. In Cowork,
this is especially useful for tasks that span multiple projects (e.g., "update the Supabase schema
that Barrel Tracking and Monthly Inventory share").

### Combining with CLAUDE.md

Obsidian context and CLAUDE.md serve complementary roles:

- **Obsidian** = curated knowledge base, cross-project awareness, historical context
- **CLAUDE.md** = current session state, latest commands, active gotchas

Load Obsidian first for the broad picture, then read CLAUDE.md for the bleeding-edge state.
If there are conflicts, CLAUDE.md wins — it's closer to the source code.

---

## Edge Cases

**Note is empty or thin:** If the Obsidian note has little content, fall back to reading
CLAUDE.md directly from the project folder. Suggest running obsidian-enrich to populate
the note for next time.

**Vault not available:** If no Obsidian vault is mounted or accessible, skip gracefully.
Don't error out — just proceed without vault context and mention that connecting the vault
would help future sessions.

**User asks about a project with no note:** Search the vault for any mention of the project
name across all notes. It might be referenced in the Projects hub or in another project's
cross-references even if it doesn't have its own note yet.

**Too many related notes:** If the graph walk finds more than 5 related notes, load only the
ones directly relevant to the task at hand. Ask the user which ones matter if it's ambiguous.
