---
name: obsidian-sync
description: >
  Sync project changes to Obsidian vault notes after a coding session. Updates app notes with new
  architecture decisions, status changes, gotchas, and build progress pulled from CLAUDE.md and
  recent git history. Designed to run after session-closeout or anytime the user wants to push
  session knowledge into Obsidian. Trigger on: "sync to obsidian", "update obsidian", "push to
  obsidian", "obsidian sync", "update my vault", "save this to obsidian", "closeout and sync",
  "keep obsidian updated", or any variation of persisting session work into Obsidian notes. Also
  trigger when the user finishes a coding session and mentions Obsidian, or when they say "closeout"
  and have an Obsidian vault connected. Even if the user just says "sync my notes" in a project
  context — use this skill. Works in both Claude Code and Cowork.
---

# Obsidian Sync

Push session knowledge from a coding session into the corresponding Obsidian vault note. This keeps
the vault current without requiring manual updates — after every session, the Obsidian note reflects
the latest architecture, status, gotchas, and decisions.

## When to Run

This skill is most valuable at these moments:

- **After session-closeout** — CLAUDE.md has just been updated with fresh gotchas, status, and
  architecture changes. This is the ideal time to sync because all session knowledge is captured.
- **After a major milestone** — shipped a feature, completed a build phase, hit a new test count.
- **After discovering a gotcha** — found something that breaks, a workaround, or a critical
  decision. Push it to Obsidian so it's available across all future sessions.
- **On demand** — user explicitly asks to update their Obsidian notes.

You don't need to wait for closeout. If the user says "sync this to obsidian" mid-session, do it.

---

## Phase 1: Identify What Changed

Figure out what's new since the Obsidian note was last updated.

### Read the current state

1. **Read CLAUDE.md** from the project directory — this is the source of truth for current project state
2. **Read the corresponding Obsidian note** — this is what the vault currently knows
3. **Check recent git history** for context on what work was done:
   ```bash
   git log --oneline -20
   ```

### Diff the content

Compare CLAUDE.md against the Obsidian note section by section. Look for:

- **New gotchas** — anything in CLAUDE.md's gotchas/known issues that isn't in the Obsidian note
- **Status changes** — build phase progress, new test counts, version bumps
- **Architecture changes** — new components, changed data flow, new integrations
- **New commands** — dev/build/test/deploy commands that were added or changed
- **New conventions** — coding patterns, naming rules, file organization rules
- **New references** — docs that were created during the session

Don't do a character-by-character diff. Read both documents and identify what's meaningfully new
or changed. A rephrased sentence isn't a change. A new database table is.

### Report what you found

Tell the user what changed before writing anything:

> "Found 3 updates for Shorestack Books: new gotcha about Stripe webhook retry behavior, status
> bumped to Phase 23, and a new MIGRATION-GUIDE.md reference. Want me to push these to Obsidian?"

For bulk syncs across multiple projects, summarize per-project:

> "Scanned 4 projects. Barrel Tracking has 2 new gotchas and a phase bump. Harper Timeclock has
> a new database table. The other two are already current. Sync all?"

---

## Phase 2: Merge Into Obsidian Note

Update the Obsidian note with the new content, preserving what's already there.

### Merge rules

These rules prevent data loss and keep notes clean:

**Append, don't replace gotchas.** Old gotchas may still be relevant even if they're not in the
current CLAUDE.md (which is kept lean). Add new ones to the existing list. Only remove a gotcha
if it's explicitly been resolved (e.g., "PostgREST fixed" means you can remove the PostgREST
workaround note).

**Update status in-place.** Replace the Status section with current info — old status is just noise.
Include version, test count, current phase, and what's next.

**Merge architecture — don't overwrite.** If the Obsidian note has architecture details from a
previous enrichment, add new details alongside them rather than replacing the whole section.
New components, new integrations, and changed data flows get appended.

**Preserve user-added content.** If the Obsidian note has content that doesn't come from CLAUDE.md
(the user added it manually in Obsidian), keep it. When in doubt, keep it and ask.

**Update the References table.** Add new doc files that were created during the session. Don't
remove existing references — the docs they point to may still exist.

**Keep Supabase info current.** If the project's Supabase config changed (new tables, region
change, tier upgrade), update the Database section. Always preserve the dashboard link.

### Follow the enriched note template

The note structure should match the obsidian-enrich template:

```
## Overview
## Tech Stack
## Architecture
## Database
## Commands
## Conventions
## Status          ← most frequently updated section
## Known Issues    ← second most frequently updated
## Code
## References      ← new docs get added here
```

If the existing note doesn't follow this structure (e.g., it was created before the enrich skill
existed), restructure it while preserving all content.

---

## Phase 3: Write the Update

### Single project sync

If syncing one project:

1. Read the current Obsidian note
2. Build the updated note content with changes merged in
3. Write the updated note to the vault

**In Claude Code:** Write directly to the vault file.

**In Cowork:** If the note already has content in Obsidian, write to the filesystem — Obsidian
usually picks up changes to existing files. If the note is empty/new, use the clipboard paste
workflow (write_clipboard → Cmd+O → navigate → Cmd+V).

### Bulk sync

If syncing multiple projects at once:

1. Scan all project directories for CLAUDE.md files
2. Map each to its Obsidian note
3. For each project with changes, merge and write
4. Report results:

> "Synced 3 of 5 projects:
> - Barrel Tracking: +2 gotchas, status → Phase 6
> - Harper Timeclock: +1 DB table (shift_templates), status → v2.1
> - Shorestack Books: +1 reference (MIGRATION-GUIDE.md)
> Skipped 2 (already current): Payroll CB, WhiskeySomm"

### Update the Projects hub

If a project's status changed significantly (new phase, major milestone), update the one-liner
in the Projects hub note too. For example, if Barrel Tracking moved from Phase 5 to Phase 6,
update its entry in Projects.md.

---

## Phase 4: Verify

After writing updates:

1. **Read back the updated note** to confirm content was written correctly
2. **Check word count** — it should be equal to or greater than before (we're adding, not removing)
3. **Check wikilinks** — new cross-references should point to notes that exist
4. **In Cowork:** Open the note in Obsidian via Quick Switcher and visually confirm

Report to the user:

> "Synced Barrel Tracking to Obsidian. Note went from 78 words → 112 words. Added 2 gotchas
> and updated status to Phase 6."

---

## Pairing with Session Closeout

This skill is designed to complement session-closeout. The ideal workflow:

1. User says "closeout" or "wrap up"
2. Session-closeout runs (commits work, updates CLAUDE.md, cleans up)
3. After closeout completes, suggest: "Want me to sync these changes to Obsidian too?"
4. If yes, run obsidian-sync on the project that was just closed out

If the user says "closeout and sync to obsidian" in one request, run session-closeout first,
then obsidian-sync after it completes. Don't try to run them simultaneously — closeout needs
to finish updating CLAUDE.md before sync can read it.

---

## Edge Cases

**CLAUDE.md doesn't exist:** Skip the project. Not every project folder has a CLAUDE.md — some
are simple scripts or config repos. Report it and move on.

**Obsidian note doesn't exist:** Create a new note following the enriched template from
obsidian-enrich. Place it in the appropriate vault folder and add a link from the Projects hub.

**Obsidian note is richer than CLAUDE.md:** This can happen if the user manually added detail
to their Obsidian note, or if a previous enrichment pulled from supplementary docs that CLAUDE.md
doesn't reference. Preserve the Obsidian content — only add new items from CLAUDE.md, don't
trim the note down to match CLAUDE.md's scope.

**Multiple projects changed in one session:** Sync all of them. Session-closeout sometimes covers
work across related projects (e.g., Barrel Tracking and HowDoYouWhisky share a database).

**No changes detected:** Tell the user: "Obsidian note for [project] is already current — nothing
to sync." Don't write to the file if nothing changed.
