---
name: setup
description: Bootstrap the BenAI Obsidian Plugin vault structure and run personalized onboarding. Creates all directories, system files, Obsidian config, memory system, hooks, and output styles, then interviews the user to personalize everything. Two modes — Solopreneurs/Professionals (default), Business/Teams. Use when user says "set up", "bootstrap", "initialize", "onboarding", or runs /setup.
---

# BenAI Obsidian Plugin — Setup + Onboarding

USE WHEN the user runs `/setup` or asks to set up their vault, bootstrap the assistant, initialize the system, or configure the BenAI Obsidian Plugin.

This is a three-phase process:
- **Phase 0**: Mode Selection — Ask which OS variant to create
- **Phase A**: Bootstrap — Create the directory structure and system files for the selected mode
- **Phase B**: Onboarding — Interview the user and personalize everything

## Pre-flight Check

Check if `claude.md` or `CLAUDE.md` exists **only** in the current working directory (do NOT search subdirectories or parent directories — check only the exact CWD path).

- **If it exists**: The vault is already set up. Ask the user:
  - "This vault is already set up. Would you like to:"
  - **Re-run the interview** — Keep existing structure, update memory files based on new answers
  - **Full reset** — Delete everything and start fresh (confirm twice before proceeding)
  - **Cancel** — Do nothing
- **If it does NOT exist**: Proceed with full setup (Phase 0 + Phase A + Phase B)

---

## Phase 0: Mode Selection

Ask the user to pick a mode using AskUserQuestion with these exact `label` and `description` values:

- Question: `What type of vault do you want?`
- Option 1 label: `Solopreneurs/Professionals` — description: `Blends work and personal. Best for solo founders, freelancers, consultants.`
- Option 2 label: `Business/Teams` — description: `Org structure with departments, processes, stakeholders. Best for teams and companies.`

**CRITICAL**: You MUST pass both `label` AND `description` for each option in AskUserQuestion. The `description` field is what explains each mode to the user. Never leave `description` empty.

Mode mapping:
- Solopreneurs/Professionals → `os-mode: professional`
- Business/Teams → `os-mode: business`

Accept any clear signal: "solo", "professional", "freelancer", "business", "org", "team", etc.

If the user skips or says "I don't know", use **Solopreneurs/Professionals** (professional mode).

Store the selected mode. It will be written to `claude.md` frontmatter as `os-mode: professional | business`.

---

## Phase A: Bootstrap

Create the directory structure and write all system files for the selected mode.

### Step A.1: Create Directory Structure

**All modes** share this base:

```bash
mkdir -p .claude
mkdir -p Context
mkdir -p Projects
mkdir -p Daily
mkdir -p Resources
mkdir -p Skills
```

**Solopreneurs/Professionals mode** adds:

```bash
mkdir -p Intelligence/meetings/team-standups
mkdir -p Intelligence/meetings/client-calls
mkdir -p Intelligence/meetings/one-on-ones
mkdir -p Intelligence/meetings/general
mkdir -p Intelligence/competitors
mkdir -p Intelligence/market
mkdir -p Intelligence/decisions
mkdir -p Intelligence/archive
```

**Business mode** adds:

```bash
mkdir -p Intelligence/meetings/team-standups
mkdir -p Intelligence/meetings/client-calls
mkdir -p Intelligence/meetings/one-on-ones
mkdir -p Intelligence/meetings/board-reviews
mkdir -p Intelligence/meetings/all-hands
mkdir -p Intelligence/meetings/cross-team
mkdir -p Intelligence/meetings/general
mkdir -p Intelligence/competitors
mkdir -p Intelligence/market
mkdir -p Intelligence/decisions
mkdir -p Intelligence/processes
mkdir -p Intelligence/archive
mkdir -p Departments
mkdir -p Teams
mkdir -p Onboarding
mkdir -p Resources/templates
```

### Step A.2: Write System Files from References

Read each reference file and write it to the corresponding local path. The reference files contain the complete content for each system file.

**All modes** — shared system files:

| Reference File | Creates at Local Path |
|---|---|
| `references/settings-json-template.md` | `./.claude/settings.json` |
| `references/claudeignore-template.md` | `./.claudeignore` |
| `references/gitignore-template.md` | `./.gitignore` |

**Mode-specific claude.md template:**

| Mode | Reference File | Creates at Local Path |
|---|---|---|
| Solopreneurs/Professionals | `references/claude-md-template.md` | `./claude.md` |
| Business | `references/claude-md-template-business.md` | `./claude.md` |

**Mode-specific folder guides:**

| Mode | Reference File | Creates at Local Path |
|---|---|---|
| Solopreneurs/Professionals | `references/guide-projects.md` | `./Projects/_guide.md` |
| Solopreneurs/Professionals | `references/guide-daily.md` | `./Daily/_guide.md` |
| Solopreneurs/Professionals | `references/guide-intelligence.md` | `./Intelligence/_guide.md` |
| Solopreneurs/Professionals | `references/guide-skills.md` | `./Resources/_guide.md` |
| Business | `references/guide-projects.md` | `./Projects/_guide.md` |
| Business | `references/guide-daily.md` | `./Daily/_guide.md` |
| Business | `references/guide-intelligence.md` | `./Intelligence/_guide.md` |
| Business | `references/guide-skills.md` | `./Resources/_guide.md` |
| Business | `references/guide-departments.md` | `./Departments/_guide.md` |
| Business | `references/guide-teams.md` | `./Teams/_guide.md` |
| Business | `references/guide-onboarding.md` | `./Onboarding/_guide.md` |
| Business | `references/guide-processes.md` | `./Intelligence/processes/_guide.md` |
| Solopreneurs/Professionals | `references/guide-skills-vault.md` | `./Skills/_guide.md` |
| Business | `references/guide-skills-vault.md` | `./Skills/_guide.md` |

For each row applicable to the selected mode: read the reference file, then write its content to the local path.

### Step A.3: Initialize Starter Context Files

**All modes** — create placeholder skill folders:

```bash
mkdir -p Skills/linkedin-writer/references
mkdir -p Skills/newsletter-writer/references
```

Then write placeholder files from references:
- Read `references/skills-placeholder-linkedin-notes.md` → write to `./Skills/linkedin-writer/notes.md`
- Read `references/skills-placeholder-linkedin-example.md` → write to `./Skills/linkedin-writer/references/example-post.md`
- Read `references/skills-placeholder-newsletter-strategy.md` → write to `./Skills/newsletter-writer/strategy.md`
- Read `references/skills-placeholder-newsletter-example.md` → write to `./Skills/newsletter-writer/references/example-edition.md`

**Solopreneurs/Professionals mode:**
- Read `references/context-me.md` → write to `./Context/me.md`

**Business mode:**
- Read `references/context-operator.md` → write to `./Context/operator.md`
- Read `references/context-organization.md` → write to `./Context/organization.md`
- Read `references/context-team.md` → write to `./Context/team.md`
- Read `references/context-strategy-business.md` → write to `./Context/strategy.md`

**Business mode — placeholder teams:**

```bash
mkdir -p Teams/engineering
mkdir -p Teams/marketing
mkdir -p Teams/leadership
```

Then write placeholder files from references:
- Read `references/teams-placeholder-engineering-readme.md` → write to `./Teams/engineering/README.md`
- Read `references/teams-placeholder-person.md` → write to `./Teams/engineering/alice-smith.md`
- Read `references/teams-placeholder-person.md` → write to `./Teams/engineering/bob-jones.md`
- Read `references/teams-placeholder-engineering-readme.md` → write to `./Teams/marketing/README.md`
- Read `references/teams-placeholder-person.md` → write to `./Teams/marketing/carol-white.md`
- Read `references/teams-placeholder-engineering-readme.md` → write to `./Teams/leadership/README.md`
- Read `references/teams-placeholder-person.md` → write to `./Teams/leadership/dave-chen.md`

### Step A.4: Make Hooks Executable

```bash
chmod +x .claude/hooks/*.sh
```

### Step A.5: Confirm Bootstrap

Tell the user:
- "Vault structure created successfully in **[mode]** mode."
- List the main folders created (varies by mode), including `Skills/`
- Recommend opening this folder as a vault in Obsidian
- Recommend installing **TaskNotes** community plugin if they want task management features
- Note that **Bases** (native database views) are built into Obsidian — no plugin needed for queries
- Mention `Resources/` for storing prompts, frameworks, swipe files, and templates
- "Now let's personalize it for you."

Then proceed to Phase B.

---

## Phase B: Onboarding

Two questions. That's it. The questions differ by mode.

### Mode-specific Questions

**Solopreneurs/Professionals mode:**

Question 1:
> **Tell me about yourself (and your business, if you have one).**
> Paste anything — bio, LinkedIn, company about page, team info, whatever you have. You can also upload files. Or skip this.

Question 2:
> **What are you currently working on?**
> List your active projects, or paste project briefs, docs, whatever. Skip if you'd rather add these later.

**Business mode:**

Question 1:
> **Tell me about your organization** — company info, team wiki, org chart, product info. Paste, upload, or skip.

Question 2:
> **What are the active projects or initiatives?** Roadmaps, OKRs, briefs — whatever you have. Or skip.

The user might give you:
- A short sentence
- A wall of text (wiki, about page, LinkedIn profile)
- Uploaded files (PDFs, docs, screenshots)
- Nothing ("skip")

**Accept whatever they give.** Don't ask follow-ups. Extract what you can.

**If the user says "skip" to both** — proceed to build with defaults only.

---

## Phase B Build: Personalize the Vault

After the two questions (or skips), build everything you can from what the user gave you. Work silently — don't narrate each step.

### Build Step 1: Create Context Files

Behavior depends on selected mode.

**Solopreneurs/Professionals mode:**

- **`Context/me.md`** — Always created. Fill with identity info from Question 1.
- **`Context/business.md`** — Only if user mentioned a company/product/business. Read `references/context-business.md` as template.
- **`Context/team.md`** — Only if user mentioned team members. Read `references/context-team.md` as template.
- **`Context/brand.md`** — Only if user mentioned voice/tone/brand. Read `references/context-brand.md` as template.
- **`Context/strategy.md`** — Only if user mentioned goals/vision/priorities. Read `references/context-strategy.md` as template.

**Business mode:**

- **`Context/operator.md`** — Always created. Fill with the person's role, decision authority, responsibilities from Question 1. Read `references/context-operator.md` as template.
- **`Context/organization.md`** — Always created. Fill with company info, org structure, products from Question 1. Read `references/context-organization.md` as template.
- **`Context/team.md`** — Always created. Fill with any team members mentioned. Read `references/context-team.md` as template.
- **`Context/strategy.md`** — Always created. Fill with any goals, OKRs, targets mentioned. Read `references/context-strategy.md` as template. Focus template on OKRs, department goals, revenue targets.
- **`Context/brand.md`** — Only if user mentioned voice/tone/brand. Read `references/context-brand.md` as template.
- **`Context/stakeholders.md`** — Only if user mentioned vendors, partners, investors, board. Read `references/context-stakeholders.md` as template.

### Build Step 2: Create Project Folders

From Question 2, intelligently structure each project based on what the user gave you.

**Analyze the info and decide the right structure:**
- Simple mention ("working on a podcast") → just a `README.md`
- Moderate detail (scope, deadlines, people) → `README.md` + relevant subdirs
- Rich info (briefs, specs, research, multiple workstreams) → full structure with subdirs and files

**Create subdirectories only when the content justifies them:**

| Content type | Goes to |
|---|---|
| Overview, status, deadlines, contacts | `README.md` |
| Research, competitor analysis, references | `research/{topic}.md` |
| Specs, requirements, briefs | `specs/{name}.md` or `briefs/{name}.md` |
| Drafts, scripts, written content | `drafts/{name}.md` |
| Ideas, brainstorms | `ideas/{name}.md` |
| Notes, working docs | `notes/{name}.md` |

**README.md is always the index:**
```markdown
---
type: project
status: active
created: YYYY-MM-DD
---
## Overview
[What this project is]

## Current Status
[Where things stand]

## Key Resources
[Links, tools, contacts]

## Next Steps
[What needs to happen]
```

Don't create empty subdirs. Don't cram everything into the README. Distribute content into the right files based on what it actually is.

**Business mode only** — if user provided department info, also create `Departments/{name}/README.md` with department charter, KPIs, and team members.

### Build Step 3: Mode-specific Additional Setup

**Business mode only:**
- If user mentioned processes or SOPs, create them in `Intelligence/processes/`
- If user mentioned onboarding docs, create them in `Onboarding/`

### Build Step 4: Create First Daily Note

Create `Daily/YYYY-MM-DD.md` (today's date):
```markdown
---
type: daily-note
date: YYYY-MM-DD
---
# YYYY-MM-DD

## Session
- **Focus**: Initial vault setup and onboarding
- **Completed**: Full vault bootstrap + personalized onboarding
- **Next Steps**: [based on what was discussed]
```

### Build Step 5: Confirm Completion

Tell the user:
- Quick summary of what was created (which context files, how many projects, any departments)
- "Open this folder in Obsidian to see your vault"
- Key command: `/assistant` (sessions, daily reviews, tasks, meetings)
- "You can add more context anytime — just tell me and I'll update the right files."
- Suggest a next action based on what they told you

## Guidelines

- Phase 0 is one question — mode selection
- Phase A is fully automated — no user input needed
- Phase B is exactly 2 questions — no follow-ups, no drilling deeper
- Accept any format: text, pasted docs, uploaded files, or nothing
- Extract as much as you can from whatever the user provides
- Only create context files that have real content — don't create empty placeholder files
- Use the user's actual project names, not generic placeholders
- Don't narrate every file you're creating — just build it and summarize at the end
