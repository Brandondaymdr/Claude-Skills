---
type: guide
folder: Departments
---

# Departments

Organizational units with their own charters, KPIs, team members, and standard operating procedures.

## Structure

Each department gets its own folder:

```
Departments/
├── engineering/
│   ├── README.md          # Charter, KPIs, team
│   └── sops/              # Department SOPs
├── marketing/
│   ├── README.md
│   └── sops/
└── sales/
    ├── README.md
    └── sops/
```

## README.md Template

```yaml
---
type: department
name: Department Name
head: [[Person Name]]
headcount: X
status: active
---

## Charter
Why this department exists and what it owns.

## KPIs
| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| [metric] | [target] | [current] | on-track / at-risk / behind |

## Team
| Name | Role | Focus |
|------|------|-------|
| [[Person]] | [role] | [what they own] |

## Active Initiatives
- [[Project-Name]] — [status]

## SOPs
- [[SOP Name]] — [what it covers]
```

## Tips
- Keep READMEs current — they're the department dashboard
- SOPs should be standalone and actionable
- Use [[wikilinks]] to connect departments to projects and people
