# Claude-Skills

A personal collection of [Claude Code](https://claude.com/claude-code) skills — one directory per skill, installed live by symlinking the repo as `~/.claude/skills`.

## Layout

```
<skill-name>/
├── SKILL.md          # The skill: frontmatter description (triggers) + instructions
├── references/       # Optional quick-reference docs the skill reads on demand
├── templates/        # Optional file templates the skill renders (e.g. fleet-init)
└── agents/           # Optional subagent definitions (e.g. folder-forensic-audit)
```

Root docs: `CLAUDE.md` (instructions for Claude working in this repo), `DEFAULTS-ADR-0001.md` (foundational tooling/workflow defaults), `WORKFLOW-GOLDEN-PATH.md` (the canonical end-to-end feature workflow), `SESSION-SUMMARY*.md` (session closeout artifacts).

## Highlights

| Skill | What it does |
|---|---|
| `session-restart` / `session-checkpoint` / `session-closeout` | Session lifecycle: full context recovery on return, quick mid-session saves, structured end-of-session closeout. Designed as a matched set. |
| `project-kickoff` | Scaffold a new project with production-grade structure, CLAUDE.md, verification stack, and workflow rules from day one. |
| `folder-forensic-audit` | Deep project health audit (structure, docs, git hygiene, testing, evals) with a 100-point scorecard, plus opt-in Conformance Mode that applies template defaults via a reviewed PR. |
| `fleet-init` | Bootstrap a Fleet autonomous-build pipeline: queue-driven builder/validator agents on an always-on host, rendered from `templates/` via the `PARAMETERS.md` substitution contract. |

The rest are domain skills for specific products and clients (Shopify/Cheersworthy, beehiiv/WhiskeyTribe, Circle.so, Toast POS, Obsidian vault management, video editing, and more).

## Installation

```bash
git clone git@github.com:Brandondaymdr/Claude-Skills.git ~/Projects/claude-skills
mv ~/.claude/skills ~/.claude/skills.backup   # if one exists
ln -s ~/Projects/claude-skills ~/.claude/skills
```

Because the symlink points at the working tree, edits (and pulls) take effect in new Claude Code sessions immediately — no install step. The flip side: keep the tree committed and pulled, since whatever state it's in *is* what runs.

## Contributing changes

All changes go through the workflow in `WORKFLOW-GOLDEN-PATH.md`: typed branch → Conventional Commit → PR → 10-minute cool-down re-read → squash-merge. See `CLAUDE.md` for repo-specific conventions.

## Writing a new skill

1. Create `<skill-name>/SKILL.md` with YAML frontmatter — `name` and a `description` written as trigger phrases (the description is what makes Claude invoke it).
2. Put operational detail the skill only sometimes needs into `references/`.
3. Keep project-specific literals out of reusable skills; genericize lessons learned.
