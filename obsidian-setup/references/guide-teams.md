---
type: guide
folder: Teams
---

# Teams

Structured directory for your teams and their members. Each team gets a folder, each person gets a profile.

## Structure

```
Teams/
├── _guide.md                     -- This file
├── engineering/
│   ├── README.md                 -- Team overview, goals, rituals, tools
│   ├── alice-smith.md            -- Person profile
│   └── bob-jones.md              -- Person profile
├── marketing/
│   ├── README.md                 -- Team overview
│   └── carol-white.md            -- Person profile
└── leadership/
    ├── README.md                 -- Team overview
    └── dave-chen.md              -- Person profile
```

## Team README

Each team's `README.md` is the overview:

- **Mission** — what this team does
- **Members** — `[[wikilinks]]` to person profiles
- **Goals / KPIs** — what they're measured on
- **Rituals** — standups, retros, planning cadence
- **Tools** — what they use day to day

## Person Profiles

Each person gets a markdown file with:

- **Role & title**
- **Responsibilities**
- **Working style** — how they prefer to communicate, their strengths
- **Reports to / manages**
- **Notes** — anything useful for working with them

## Tips

- Use `[[wikilinks]]` for every person mention — this builds the graph
- Link people from meeting notes, project READMEs, and daily notes
- Keep profiles updated as roles change
- This is NOT a replacement for `Context/team.md` — that file is a quick-reference roster. This folder has deep context per person.
