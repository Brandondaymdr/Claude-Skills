---
type: guide
folder: Daily
---

# Daily

Daily journals, morning check-ins, evening reflections, and weekly reviews.

## How to Use

Run `/assistant` and ask for a daily review. Claude will:
1. Check your TaskNotes and recent activity
2. Ask you a few questions
3. Create a daily note here

## File Types

| Type | Naming | When |
|------|--------|------|
| Morning check-in | `YYYY-MM-DD Morning.md` | Start of day |
| Evening reflection | `YYYY-MM-DD Evening.md` | End of day |
| Weekly review | `YYYY-MM-DD Weekly Review.md` | End of week |

## Frontmatter
```yaml
---
type: daily-note
subtype: morning | evening | weekly-review
date: YYYY-MM-DD
mood: [your mood]
energy: [1-10]
focus: [main focus]
---
```

## Tips
- Consistency matters more than depth — a 2-minute check-in is better than nothing
- Use [[wiki links]] to connect daily notes to projects and tasks
- Claude reviews your daily notes during routines to spot patterns
