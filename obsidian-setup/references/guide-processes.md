---
type: guide
folder: Intelligence/processes
---

# Processes

Organization-wide standard operating procedures, runbooks, and workflows.

## What Goes Here

| Type | Example |
|------|---------|
| SOPs | Step-by-step procedures for recurring tasks |
| Runbooks | Incident response, deployment, escalation |
| Workflows | Cross-department processes, approval chains |
| Playbooks | Sales playbooks, support scripts, onboarding flows |

## Naming Convention

Use descriptive, action-oriented names:
- `incident-response-runbook.md`
- `new-hire-onboarding-sop.md`
- `quarterly-planning-process.md`

## SOP Template

```yaml
---
type: process
tags: [sop]
owner: [[Person Name]]
department: [department]
last_reviewed: YYYY-MM-DD
---

## Purpose
Why this process exists.

## When to Use
Trigger conditions or schedule.

## Steps
1. [Step with enough detail to follow]
2. [Step]
3. [Step]

## Escalation
Who to contact if something goes wrong.

## Review Cadence
How often this should be reviewed and by whom.
```

## Tips
- Every SOP should be actionable by someone unfamiliar with it
- Link to relevant [[Departments]] and [[Projects]]
- Review quarterly — stale SOPs are worse than no SOPs
