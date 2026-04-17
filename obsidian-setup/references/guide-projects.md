---
type: guide
folder: Projects
---

# Projects

Active project folders. Each project gets its own subfolder with a structure that matches the project's needs.

## How It Works

Projects are **intelligently structured** — not every project gets the same flat README. The assistant analyzes what a project involves and creates the right subdirectories and files automatically.

## Example Structures

A software project:
```
Projects/my-app/
├── README.md              # Overview, status, architecture decisions
├── specs/                 # Feature specs, requirements
├── research/              # Competitor analysis, tech evaluations
└── notes/                 # Working notes, meeting takeaways
```

A content project:
```
Projects/youtube-channel/
├── README.md              # Channel strategy, audience, metrics
├── ideas/                 # Video ideas and briefs
├── scripts/               # Draft scripts
└── assets/                # Thumbnails, descriptions, metadata
```

A client project:
```
Projects/acme-redesign/
├── README.md              # Scope, timeline, contacts, deliverables
├── briefs/                # Client briefs and requirements
├── deliverables/          # Work product
├── feedback/              # Client feedback rounds
└── meetings/              # Project-specific meeting notes
```

A simple project:
```
Projects/home-renovation/
├── README.md              # What, when, budget, contractor info
```

## README.md Template
```yaml
---
type: project
name: Project Name
status: active | planning | on-hold | completed
priority: high | medium | low
deadline: YYYY-MM-DD
---

## Overview
What is this project and why does it matter?

## Current Status
What's happening now?

## Key Resources
- Links, tools, contacts

## Next Steps
What needs to happen next?
```

## How the Assistant Manages Projects

- **Creates subdirs on the fly** — when research comes in, a `research/` folder appears. When specs are written, `specs/` appears. No empty folders created upfront.
- **Routes info to the right file** — a research finding goes to `research/topic.md`, not crammed into the README. A decision goes to a decision note or the README's status section, depending on scope.
- **Keeps README as the index** — the README always has the current status, overview, and links to subdirectory contents. It's the entry point, not the dumping ground.
- **Grows with the project** — a new project starts as just a README. As information accumulates, the structure evolves.

## Tips
- Move completed projects to `Intelligence/archive/`
- Link project notes to your TaskNotes tasks
- Reference projects from daily reviews using [[wiki links]]
