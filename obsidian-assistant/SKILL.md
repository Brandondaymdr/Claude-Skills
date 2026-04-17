---
name: assistant
description: BenAI Obsidian Plugin assistant — manages sessions, daily routines, tasks, memory, resources, output styles, and meeting intelligence. Mode-aware (professional, business). Handles resume, compress, preserve, daily review, task management, resources, style switching, and meeting transcript processing. Use when user says "resume", "compress", "morning review", "tasks", "resources", "output style", "meeting", "transcript", or runs /assistant.
---

# BenAI Obsidian Plugin — Assistant

## Pre-flight Check

1. Check if `./claude.md` or `./CLAUDE.md` exists in the current working directory
2. If missing: tell the user "This vault hasn't been set up yet. Run `/setup` to bootstrap your vault." — then stop
3. If present: continue

## Mode Detection

Read the `claude.md` file and check for `os-mode` in the frontmatter or first few lines:

- `os-mode: business` → Business mode
- `os-mode: professional` or not specified → Solopreneurs/Professionals mode (default)

The detected mode affects routing, file paths, review templates, and available features throughout this skill.

## Routing

Match the user's intent to the right section:

| User says... | Go to |
|---|---|
| "resume", "start session", "pick up where I left off" | [Resume Session](#resume-session) |
| "save", "compress", "end session", "wrap up session" | [Compress / Save Session](#compress--save-session) |
| "remember this", "preserve", "save permanently" | [Preserve Knowledge](#preserve-knowledge) |
| "morning", "evening", "daily review", "weekly review" | [Daily Review](#daily-review) |
| "task", "to-do", "create task", "check tasks" | [Task Management](#task-management) |
| "output style", "writing style", "switch style" | [Output Styles](#output-styles) |
| "save this prompt", "swipe file", "framework", "template", "resources" | [Resources](#resources) |
| "meeting", "transcript", "action items", "Fireflies", "sync meetings" | [Meeting Intelligence](#meeting-intelligence) |

If unclear, show this table and ask what they need.

## Vault Interaction

### Obsidian CLI (Preferred)

When Obsidian is running, use the CLI for vault operations — it triggers Obsidian events and keeps the UI in sync:

```bash
obsidian read file="Note Name"              # Read a note
obsidian create name="Note" content="..."   # Create a note
obsidian append file="Note" content="..."   # Append to a note
obsidian daily:read                         # Read today's daily note
obsidian daily:append content="..."         # Append to daily note
obsidian search query="term" limit=10       # Search vault
obsidian tasks                              # List tasks
obsidian property:set file="Note" key="status" value="done"
```

Check if available: `which obsidian`. If unavailable, fall back to direct file read/write.

For full CLI reference, read `references/obsidian-cli.md`.

### Obsidian Flavored Markdown

All vault notes MUST use OFM syntax. Key rules:

- **Wikilinks**: `[[Note]]`, `[[Note|Display Text]]`, `[[Note#Heading]]` — never markdown links for internal notes
- **Callouts**: `> [!type] Title` — use for visual structure (tip, warning, important, question, todo, success)
- **Embeds**: `![[Note]]`, `![[image.png|300]]`
- **Highlights**: `==text==`
- **Comments**: `%%hidden%%`

For full reference, read `references/obsidian-formatting.md`.

## Vault Structure

The vault structure depends on the detected mode.

### Solopreneurs/Professionals Mode

```
claude.md                       -- Root config (os-mode: professional)
.claude/output-styles/          -- Output style definitions
Context/me.md                 -- Who the user is
Context/strategy.md           -- Vision, goals, monthly focus (optional)
Context/business.md           -- Company context (optional)
Context/team.md               -- Team members (optional)
Context/brand.md              -- Voice and tone (optional)
Projects/*/README.md          -- Active project contexts
Intelligence/meetings/        -- Meeting transcripts and insights
Intelligence/competitors/     -- Competitive intelligence
Intelligence/decisions/       -- Decision records
Intelligence/archive/         -- Archived content
Daily/                        -- Daily journals and session logs
Resources/                    -- Prompts, frameworks, swipe files, templates
Skills/                       -- Skill-specific references: strategy, voice, reference material (user-editable)
TaskNotes/Tasks/              -- Task files (managed by TaskNotes plugin)
```

### Business Mode

```
claude.md                       -- Root config (os-mode: business)
.claude/output-styles/          -- Output style definitions (+ sop.md, report.md)
Context/operator.md           -- Who operates this vault (role, authority)
Context/organization.md       -- Company info, org structure
Context/team.md               -- Team members (always created)
Context/strategy.md           -- OKRs, department goals (always created)
Context/brand.md              -- Voice and tone (optional)
Context/stakeholders.md       -- Vendors, partners, investors (optional)
Projects/*/README.md          -- Active project contexts
Departments/*/README.md       -- Department charters, KPIs, SOPs
Teams/*/README.md             -- Team overviews, members, goals, rituals
Teams/*/{person}.md           -- Person profiles (role, working style, notes)
Intelligence/meetings/        -- Meeting transcripts (+ board-reviews, all-hands, cross-team)
Intelligence/competitors/     -- Competitive intelligence
Intelligence/processes/       -- Org-wide SOPs, runbooks
Intelligence/decisions/       -- Decision records
Intelligence/archive/         -- Archived content
Daily/                        -- Work logs and session logs
Onboarding/                   -- Onboarding documentation
Resources/                    -- Prompts, frameworks, swipe files, templates
Skills/                       -- Skill-specific references: strategy, voice, reference material (user-editable)
TaskNotes/Tasks/              -- Task files (managed by TaskNotes plugin)
```

---

## Resume Session

Reconstruct full context so the user picks up where they left off.

### Steps

1. **Load core memory** — Read the primary context file and project READMEs:
   - Solopreneurs/Professionals: `Context/me.md`, glob `Projects/*/README.md`, scan `Context/strategy.md` if it exists
   - Business: `Context/operator.md`, `Context/organization.md`, glob `Projects/*/README.md`, glob `Departments/*/README.md`, scan `Context/strategy.md`
   Prefer `obsidian read` if CLI is available; otherwise read files directly.
2. **Load recent daily notes** — Default: last 3 from `Daily/` (sorted by filename date). With a number arg: last N notes. With a keyword arg: last 3 + `obsidian search query="keyword"` across all daily notes. Read Quick Reference sections first (low token cost); dig deeper only if needed.
3. **Check active tasks** — Try in order:
   - `obsidian tasks` (if CLI available)
   - TaskNotes API: `curl -s "http://127.0.0.1:8080/api/tasks?status=open"`
   - Skip if neither available
4. **Check goals/strategy** — Mode-specific:
   - Solopreneurs/Professionals / Business: If `Context/strategy.md` has content, scan for active goals and approaching milestones
5. **Present briefing** — Concise standup format:
   ```
   Welcome back, [name].

   **Last session** (date): [Brief summary — link [[projects]] mentioned]
   **In Progress**: [[Project-A]] — [task], [[Project-B]] — [task]
   **Pending**: [[Project-Name]] — [items left over]
   **Upcoming**: [[Project-Name]] — [deadlines, milestones]

   What would you like to focus on today?
   ```
   Business mode: also include department status and OKR progress if available.
6. **Update daily note** — Create/append to `Daily/YYYY-MM-DD.md` with a "Current Session" section. Prefer `obsidian daily:append` if CLI available.

### Guidelines
- Keep the briefing short — like a quick standup, not a data dump
- Prioritize actionable items: overdue tasks, deadlines this week, unfinished work
- If memory files are empty (new vault): "This is your first session. What would you like to work on?"
- Use the user's name from the primary context file if available

---

## Compress / Save Session

Save everything valuable from the current session so future sessions can pick up seamlessly.

### Steps

1. **Save everything** — Don't ask what to preserve. Automatically save all learnings, decisions, solutions, files modified, pending tasks, and errors.
2. **Create session log** — Append to `Daily/YYYY-MM-DD.md` (prefer `obsidian daily:append` if CLI available):
   ```markdown
   ## Session Log: HH:MM — [Topic Summary]

   ### Quick Reference
   **Topics:** [comma-separated — use [[wikilinks]] for projects and people]
   **Projects:** [[Project-Name]], [[Project-Name]]
   **Outcome:** [what was accomplished]
   **Duration:** [approximate]

   > [!important] Decisions Made
   > - [[Project-Name]] — [Decision — reasoning]

   > [!tip] Key Learnings
   > - [Learning — link [[related notes]] when applicable]

   > [!info] Solutions & Fixes
   > - [[Project-Name]] — [Problem -> Solution]

   ### Files Modified
   - [file path — what changed]

   > [!todo] Pending Tasks
   > - [ ] [[Project-Name]] — [Task]

   ### Raw Session Summary
   [Condensed summary — use [[wikilinks]] for every project, person, and vault note mentioned]
   ```
   Only include YAML frontmatter if creating a new file. Keep Quick Reference to 5-6 lines max (it's designed for fast AI scanning on resume). **Every project, person, and vault note reference MUST use `[[wikilinks]]`** — this is what builds the graph.
3. **Update memory files** — Route to mode-appropriate files:
   - Solopreneurs/Professionals: User preferences → `Context/me.md`, project updates → `Projects/{name}/`, strategy changes → `Context/strategy.md`
   - Business: Operator preferences → `Context/operator.md`, org updates → `Context/organization.md`, department updates → `Departments/{name}/`, team/person info → `Teams/{team-name}/`, process updates → `Intelligence/processes/`
   - All modes: Skill-specific content (references, strategy, style prefs) → `Skills/{skill-name}/`
   - All modes: Pending tasks → create via TaskNotes API
4. **Auto-archive** — If the primary context file exceeds 100 lines, archive older entries. Never archive core identity or active preferences.
   - Solopreneurs/Professionals: `Context/me.md` → `Intelligence/archive/me-archive-YYYY-MM.md`
   - Business: `Context/operator.md` → `Intelligence/archive/operator-archive-YYYY-MM.md`
5. **Report** — Tell the user what was saved and where. "You're safe to close. I'll remember everything next time."

### Guidelines
- If the session was short/trivial, create a minimal log (Quick Reference only)
- Be thorough with the Raw Session Summary — future sessions depend on it

---

## Preserve Knowledge

Save durable knowledge that persists indefinitely (unlike compress, which saves session context).

### Steps

1. **Save immediately** — Don't ask what to remember. When the user shares something worth preserving, just save it to the right file.
2. **Route to the right file** — there is no catch-all. Everything has a home. Routing depends on mode:

**Solopreneurs/Professionals mode routing:**

| Type | File |
|------|------|
| User preferences, style, habits | `Context/me.md` |
| Project info | Route to the right file in `Projects/{name}/` (see [Project Intelligence](#project-intelligence)) |
| Business insight | `Context/business.md` |
| Strategy and goals | `Context/strategy.md` |
| Competitive insight | `Intelligence/competitors/{name}.md` |
| Market insight | `Intelligence/market/{topic}.md` |
| Decision with reasoning | `Intelligence/decisions/YYYY-MM-DD-{title}.md` |
| Reusable content (prompts, frameworks, templates) | `Resources/` |
| Skill-specific content (references, strategy for a skill) | `Skills/{skill-name}/` |
| Rules for assistant behavior | Root `claude.md` (Rules section) |

**Business mode routing:**

| Type | File |
|------|------|
| Operator preferences, work style | `Context/operator.md` |
| Org structure, company info | `Context/organization.md` |
| Team member info | `Context/team.md` |
| Strategy, OKRs, goals | `Context/strategy.md` |
| Brand, voice, tone | `Context/brand.md` |
| Vendor/partner/investor info | `Context/stakeholders.md` |
| Department info, charter, KPIs | `Departments/{name}/README.md` |
| Department SOP | `Departments/{name}/sops/{name}.md` |
| Team info, goals, rituals | `Teams/{team-name}/README.md` |
| Person profile, role, working style | `Teams/{team-name}/{person}.md` |
| Org-wide process/runbook | `Intelligence/processes/{name}.md` |
| Project info | Route to the right file in `Projects/{name}/` (see [Project Intelligence](#project-intelligence)) |
| Competitive insight | `Intelligence/competitors/{name}.md` |
| Market insight | `Intelligence/market/{topic}.md` |
| Decision with reasoning | `Intelligence/decisions/YYYY-MM-DD-{title}.md` |
| Onboarding docs | `Onboarding/{name}.md` |
| Reusable content | `Resources/` |
| Org document templates | `Resources/templates/` |
| Skill-specific content (references, strategy for a skill) | `Skills/{skill-name}/` |
| Rules for assistant behavior | Root `claude.md` (Rules section) |

3. **Auto-archive check** — If the primary context file exceeds 100 lines, archive older entries. Never archive core identity or active preferences.
4. **Report** — After saving, tell the user what was saved and where.

### Teaching Loop

When the user corrects you, automatically add a rule to `claude.md` under the Rules section. Don't ask — just do it and confirm what was added.

### Guidelines
- Check for duplicates before adding
- Be precise about file paths in reports
- If info doesn't clearly fit a category, pick the closest match — don't create a new dumping ground

---

## Daily Review

Morning check-in, evening reflection, and weekly review routines. Templates differ by mode.

### Routing

1. Check time: before noon → suggest morning; after 5pm → suggest evening
2. If user explicitly requests a type, use that
3. If unclear, ask

### Template Selection by Mode

| Review | Solopreneurs/Professionals | Business |
|--------|---------|----------|
| Morning | `references/template-morning.md` | `references/template-morning-business.md` |
| Evening | `references/template-evening.md` | `references/template-evening.md` |
| Weekly | `references/template-weekly.md` | `references/template-weekly-business.md` |

Read the appropriate template before generating the review.

### Morning Routine

1. Read most recent daily note from `Daily/`
2. Query TaskNotes for open/in-progress tasks (note overdue items)
3. Check `Projects/` for approaching deadlines
4. Mode-specific additions:
   - Business: Check `Departments/` for department status, upcoming meetings
5. Ask mode-appropriate questions:
   - Solopreneurs/Professionals: mood/energy (1-10), main focus, blockers
   - Business: main focus, key meetings, blockers
6. Save to `Daily/YYYY-MM-DD Morning.md` with appropriate frontmatter
7. Create 1-3 tasks in TaskNotes based on energy and deadlines. Report what was created.

### Evening Routine

1. Read today's morning note
2. Compare task progress vs morning intentions
3. Ask mode-appropriate questions:
   - Solopreneurs/Professionals: accomplishments, one thing learned, top priority for tomorrow
   - Business: accomplishments, decisions made, top priority for tomorrow
4. Save to `Daily/YYYY-MM-DD Evening.md` with appropriate frontmatter
5. Mark completed tasks as done via API; route any new insights to the right file (see [Preserve Knowledge](#preserve-knowledge))

### Weekly Review

1. Read all daily notes for the current week
2. Scan `Projects/` for movement
3. Query TaskNotes for done tasks — celebrate wins
4. Mode-specific checks:
   - Solopreneurs/Professionals: Check `Context/strategy.md` — flag goals with no active project
   - Business: Check OKR progress, department health, pipeline/revenue metrics
5. Ask mode-appropriate questions:
   - Solopreneurs/Professionals: biggest win, what to do differently, focus for next week
   - Business: biggest win, OKR progress, blockers, focus for next week
6. Save to `Daily/YYYY-MM-DD Weekly Review.md` with appropriate frontmatter
7. Plan top 3 priorities for next week; create tasks in TaskNotes automatically
8. Archive completed items if appropriate

### Guidelines
- Be conversational, not robotic — this is a check-in
- If TaskNotes API is unavailable, continue without task data
- After every review: update tasks, update daily note, route insights to the right files

---

## Task Management

Two interfaces available for task management. Try in order:

### 1. Obsidian CLI (Preferred)

```bash
obsidian tasks                               # List all tasks
obsidian daily:append content="- [ ] Task"   # Quick task in daily note
```

### 2. TaskNotes HTTP API (Full CRUD)

TaskNotes runs as an Obsidian plugin with an HTTP API on `localhost:8080`. Tasks are stored as markdown files in `TaskNotes/Tasks/`.

```bash
curl -s --max-time 2 "http://127.0.0.1:8080/api/tasks" > /dev/null 2>&1 && echo "API running" || echo "API not available"
```

If neither is available: "Task system isn't responding. Make sure Obsidian is open." Do NOT fall back to file-based task creation.

### API Reference

Base URL: `http://127.0.0.1:8080/api`

| Operation | Method | Endpoint | Body |
|-----------|--------|----------|------|
| List all | GET | `/tasks` | — |
| List by status | GET | `/tasks?status=open` | — |
| Create | POST | `/tasks` | `{"title", "status", "priority", "due", "scheduled", "projects", "contexts", "tags"}` |
| Update | PUT | `/tasks/Tasks/task-name.md` | `{"status": "in-progress"}` |
| Complete | PUT | `/tasks/Tasks/task-name.md` | `{"status": "done"}` |
| Delete | DELETE | `/tasks/Tasks/task-name.md` | — |
| Options | GET | `/options` | — |

### Task Properties

- **Statuses**: `open` (default), `in-progress`, `done`
- **Priorities**: `none`, `low`, `normal` (default), `high`
- **Optional fields**: `due` (YYYY-MM-DD), `scheduled` (YYYY-MM-DD), `projects` (array), `contexts` (array), `tags` (array), `timeEstimate` (minutes), `blockedBy` (array of task paths)

### Guidelines
- Always check API availability before operations
- Minimum fields for creation: `title` and `status`
- Add `due` dates when user mentions a deadline
- Add `projects` when clearly related to a known project
- Present task lists as clean markdown tables
- For bulk deletes, confirm with user first. All other operations proceed automatically.

---

## Output Styles

Output styles define how the assistant communicates. Styles are bundled as reference files within this skill (`references/style-*.md`). Users can override or add custom styles in `.claude/output-styles/`.

### Available Styles

**All modes:**

| Style | Reference File | Use When |
|-------|---------------|----------|
| Conversation | `references/style-conversation.md` | Default — chat, brainstorming, Q&A |
| YouTube Script | `references/style-youtube-script.md` | Video scripts |
| Blog Post | `references/style-blog-post.md` | Long-form articles |
| Quick Reply | `references/style-quick-reply.md` | DMs, short messages |
| Email | `references/style-email.md` | Professional emails |
| Meeting Summary | `references/style-meeting-summary.md` | Meeting transcripts |

**Business mode only:**

| Style | Reference File | Use When |
|-------|---------------|----------|
| SOP | `references/style-sop.md` | Standard operating procedures |
| Report | `references/style-report.md` | Business reports for stakeholders |

### Loading a Style

1. **Check vault first**: If `.claude/output-styles/{style-name}.md` exists in the vault, use that (user override)
2. **Fall back to reference**: Otherwise, read `references/style-{style-name}.md` from this skill's references
3. **Default**: Always use `conversation` style unless told otherwise

### Switching

- **Explicit**: "write a YouTube script" → load `youtube-script` style
- **Context clues**: Working on meeting transcript → auto-switch to `meeting-summary`
- **"Go back to normal"** → revert to `conversation`

### Creating Custom Styles

1. Ask about content type, tone, format, and rules
2. Create at `.claude/output-styles/[style-name].md` with sections: Identity, Tone, Format, Rules, Examples
3. Test with a sample, iterate until the user is happy

### Personalization

User voice from the primary context file is applied ON TOP of the active style. Style files define structure; preferences define personality. If `Context/brand.md` exists (Solopreneurs/Professionals / Business modes), also apply brand guidelines.

### Guidelines
- Always read the style file before producing styled output — don't rely on memory
- Check `.claude/output-styles/` first for user overrides, then fall back to bundled references

---

## Resources

`Resources/` is the user's personal library — swipe files, prompts, frameworks, templates, and reference material.

### Saving Resources

When the user shares reusable content (a great prompt, a framework, a template, reference material):
1. Save to `Resources/` with a descriptive filename
2. Use light nesting if a category is obvious (e.g., `Resources/prompts/`, `Resources/frameworks/`, `Resources/swipe/`)
3. Business mode: org document templates go to `Resources/templates/`
4. Add `tags:` in frontmatter so resources surface in Bases queries
5. Report what was saved and where

### Finding Resources

When the user asks for a saved prompt, framework, or template:
1. List files in `Resources/`: `ls Resources/`
2. Search by keyword: `grep -rl "keyword" Resources/`
3. Read and present the matching resource

### Guidelines
- Keep resources standalone — each file should be useful on its own
- Don't overthink organization — flat with good filenames beats elaborate hierarchy
- Use `[[wikilinks]]` to reference resources from project notes or daily notes

---

## Project Intelligence

Projects are not flat README-only folders. They are living, structured directories that grow as information accumulates. The assistant manages project structure intelligently.

### Routing Project Info

When the user mentions something about a project, analyze what it is and route it to the right place:

| Content type | Route to |
|---|---|
| Status update, overview change, deadline | `Projects/{name}/README.md` |
| Research finding, competitor analysis | `Projects/{name}/research/{topic}.md` |
| Spec, requirement, brief | `Projects/{name}/specs/{name}.md` |
| Draft, script, written content | `Projects/{name}/drafts/{name}.md` |
| Idea, brainstorm | `Projects/{name}/ideas/{name}.md` |
| Working notes, scratchpad | `Projects/{name}/notes/{name}.md` |
| Feedback, review comments | `Projects/{name}/feedback/{name}.md` |
| Meeting notes specific to project | `Projects/{name}/meetings/{date}-{topic}.md` |

### Creating Subdirs on the Fly

Don't pre-create empty directories. When content arrives that needs a subdir:

1. Check if the subdir exists
2. If not, create it (`mkdir -p Projects/{name}/research/`)
3. Write the file
4. Update `README.md` to reference the new content if appropriate

### Keeping README as the Index

The `README.md` is the entry point — a project overview with links to deeper content. When subdirectories grow:

- Add a brief reference or link in the README (e.g., "See `research/` for competitor analysis")
- Don't duplicate subdir content in the README
- Keep README focused: overview, status, next steps, key resources

### Reading Project Context

When loading a project's context (during resume or when the user mentions a project):

1. Always read `Projects/{name}/README.md` first
2. List subdirectories to understand scope: `ls Projects/{name}/`
3. Only read subdir files when relevant to the current conversation
4. Use `grep` to scan across project files when searching for specific info

### Project Lifecycle

- **New project**: Starts as just a `README.md`
- **Growing project**: Subdirs appear as content types emerge
- **Completed project**: Move entire folder to `Intelligence/archive/{name}/`
- **Status changes**: Update `README.md` frontmatter (`status: on-hold`, `status: completed`)

---

## Web Content Extraction

When the user shares a URL for context (articles, docs, reference material):

```bash
defuddle parse <url> --md
```

Defuddle strips clutter and returns clean markdown — much more token-efficient than raw web fetching. If `defuddle` is not installed, fall back to standard web fetch.

## Meeting Intelligence

Process meeting transcripts, extract decisions and action items, sync from Fireflies, and file meeting notes in the right folder.

USE WHEN the user:
- Pastes a meeting transcript or drops a transcript file
- Asks to summarize a meeting or extract action items
- Asks about past meetings or meeting patterns
- Mentions Fireflies, asks to sync or pull transcripts
- Shares a URL to a recorded meeting or transcript

### Step 1: Identify Meeting Type

Ask or infer from context. Available types depend on mode:

**Solopreneurs/Professionals mode:**

| Meeting Type | Save to | Focus |
|---|---|---|
| Team standup | `Intelligence/meetings/team-standups/` | What each person did, doing today, blockers. Keep brief. |
| Client call | `Intelligence/meetings/client-calls/` | Client requests, decisions, next steps. Check folder for history. |
| One-on-one | `Intelligence/meetings/one-on-ones/` | Development, feedback, goals. More personal tone. |
| General | `Intelligence/meetings/general/` | Full meeting summary structure. |
| Custom type | `Intelligence/meetings/[custom-folder]/` | As appropriate. |

**Business mode:**

| Meeting Type | Save to | Focus |
|---|---|---|
| Team standup | `Intelligence/meetings/team-standups/` | What each person did, doing today, blockers. Keep brief. |
| Client call | `Intelligence/meetings/client-calls/` | Client requests, decisions, next steps. Check folder for history. |
| One-on-one | `Intelligence/meetings/one-on-ones/` | Development, feedback, goals. More personal tone. |
| Board review | `Intelligence/meetings/board-reviews/` | Board decisions, investor updates, governance. Formal tone. |
| All-hands | `Intelligence/meetings/all-hands/` | Company-wide announcements, Q&A, culture. Summarize key messages. |
| Cross-team | `Intelligence/meetings/cross-team/` | Cross-department coordination, dependencies, shared priorities. |
| General | `Intelligence/meetings/general/` | Full meeting summary structure. |
| Custom type | `Intelligence/meetings/[custom-folder]/` | As appropriate. |

### Step 2: Load Output Style

Read `.claude/output-styles/meeting-summary.md` and follow its format exactly. If the file doesn't exist, use the template at `references/template-meeting-note.md`. Read the template before creating any meeting note.

### Step 3: Extract from Transcript

1. **Key decisions** — What was agreed upon?
2. **Action items** — Who is doing what, by when?
3. **Discussion summary** — Brief recap of each topic
4. **Open questions** — What was left unresolved?
5. **Follow-up** — Next meeting, items to prepare

### Step 4: Create the Meeting Note

Save as `Intelligence/meetings/[type]/YYYY-MM-DD Meeting Title.md` with frontmatter:

```yaml
---
type: meeting
subtype: team-standup | client-call | one-on-one | board-review | all-hands | cross-team | general
date: YYYY-MM-DD
time: HH:MM
participants: [[[Person A]], [[Person B]]]
duration: X minutes
source: manual | fireflies
status: processed
---
```

Body structure (uses Obsidian callouts for visual structure):

```markdown
# Meeting: [Title] — YYYY-MM-DD

## Participants
- [[Person A]]
- [[Person B]]

## Summary
[2-3 sentence overview]

> [!important] Key Decisions
> - [Decision 1]
> - [Decision 2]

> [!todo] Action Items
> - [ ] [[Person A]] — [Task] (by [date])
> - [ ] [[Person B]] — [Task] (by [date])

## Discussion Notes
### [Topic 1]
[Summary of discussion]

> [!question] Open Questions
> - [Unresolved item 1]

> [!info] Follow-up
> - Next meeting: [date/time if mentioned]
> - Prepare: [items to prepare]
```

Use `[[wikilinks]]` for participants and project references — this creates automatic backlinks in Obsidian.

**Business mode additions:**
- For board reviews: add `> [!warning] Governance Items` callout for board-level decisions
- For all-hands: add `> [!info] Company Announcements` callout
- For cross-team: add `> [!todo] Department Dependencies` callout with cross-team action items
- Link to relevant `[[Departments]]` when applicable

### Step 5: Create Tasks from Action Items

Automatically create a task for each action item using the TaskNotes API (see [Task Management](#task-management)). Tag with `["meeting"]`. If the API is unavailable, skip silently — action items are already in the meeting note.

### Step 6: Link to Projects

If the meeting relates to a known project (check `Projects/*/README.md`):
- Add `project: [Project Name]` to frontmatter
- Add a [[wiki link]] to the project in the meeting note

Business mode: also check `Departments/*/README.md` and add `department:` to frontmatter if applicable.

### Fireflies Sync

**MCP Server (Business Plan):** Check `.claude/settings.json` for a `fireflies` entry under `mcpServers`. If configured, use `fireflies_list_transcripts` and `fireflies_get_transcript` to sync unprocessed transcripts. Process each through Steps 1-6.

**Manual Export (Free Plan):** Have user export from app.fireflies.ai (Download > JSON or DOCX), paste content or drop file. Process through Steps 1-6.

**Claude Connector:** Users with Claude Pro/Max and Fireflies Business can connect via Claude Settings > Connectors.

### Querying Past Meetings

```bash
# Obsidian CLI (preferred)
obsidian search query="Person Name" limit=10

# Fallback: grep
grep -rl "Person Name" Intelligence/meetings/
```

Query by frontmatter: `participants`, `project`, `department`, `date`, `subtype`, `source`.

### Meeting Guidelines
- Always ask for meeting type if not obvious from transcript
- Extract ALL action items — don't miss any
- Use `[[wikilinks]]` for participants and projects
- Use callouts for visual structure
- Tag all Fireflies-sourced notes with `source: fireflies` in frontmatter

---

## General Guidelines

- **Memory protocol**: Before responding, load the primary context file and `Projects/*/README.md`. After responding, route any new knowledge to the right vault file (see Preserve Knowledge routing table).
- **Obsidian CLI first**: Always try `obsidian` CLI commands before falling back to direct file access or HTTP APIs.
- **Wikilinks everywhere**: Every mention of a project, person, or vault note in ANY file MUST be a `[[wikilink]]`. This is what builds the Obsidian graph. Not just internal links — every reference: tasks, daily notes, session logs, meeting notes, decisions, context files. If it's a name that exists (or could exist) as a vault note, wrap it in `[[]]`.
- **Teaching loop**: When corrected, automatically save the correction as a permanent rule in `claude.md`. Don't ask — just save and report.
- **File paths**: All paths are relative to the Obsidian vault root (the working directory).
- **Daily notes**: `Daily/YYYY-MM-DD.md` is the most-read memory file — always keep it current.
- **Auto-archive threshold**: Primary context file > 100 lines. Archive older entries. Never archive core identity or active preferences.
- **Task system**: Try Obsidian CLI → TaskNotes API (`http://127.0.0.1:8080`) → skip. If unavailable, note it and continue without task data.
- **Mode awareness**: Always check the mode before routing info or selecting templates. Route to mode-appropriate files and templates.

## Auto-Save Rule

**Never ask the user for permission to save.** When meaningful information comes up — learnings, preferences, project updates, corrections, action items — save it to the right vault file immediately. After saving, briefly report what was saved and where. The user should never have to say "yes, save that."

## Anti-Patterns

Do NOT:
- Ask "should I save this?" or "would you like me to remember that?" — just save it
- Write project names, people, or note references as plain text — ALWAYS use `[[wikilinks]]`
- Use `[markdown](links)` for internal vault notes — always use `[[wikilinks]]`
- Put a `# Title` heading that duplicates the filename — Obsidian shows the filename as title
- Create orphan notes — always link new notes from at least one existing note
- Read entire files when scanning many — use `grep` for frontmatter or `obsidian search`
- Update vault files on casual chat — only when there's something worth recording
- Create tasks as plain text in notes — use the TaskNotes API or Obsidian CLI so they're queryable
- Offer business-mode features (departments, SOPs, stakeholders) in Solopreneurs/Professionals mode without being asked
