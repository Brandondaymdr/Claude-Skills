# Skill Creation & Installation Workflow
## The Permanent Fix — Never Lose Time on This Again

### Your Setup

| Location | Purpose |
|----------|---------|
| `~/Desktop/Storage/Claude/skills/` | **Source of truth** — all skill folders live here |
| `github.com/Brandondaymdr/Claude-Skills` | **Backup & sharing** — push skills here for version control |
| Cowork `.skills/skills/` (read-only) | **Cowork's internal registry** — installed via `.skill` packages |
| Claude Code `CLAUDE.md` | **Claude Code's skill loader** — reads skills from project root |

### Creating a New Skill (Full Workflow)

#### Step 1: Build it locally
```bash
mkdir -p ~/Desktop/Storage/Claude/skills/my-new-skill/references
# Create SKILL.md and reference files
```

#### Step 2: Install in Cowork
In a Cowork session, ask Claude to:
```
Package ~/Desktop/Storage/Claude/skills/my-new-skill as a .skill file and install it
```
Or do it yourself:
```bash
cd ~/Desktop/Storage/Claude/skills
zip -r my-new-skill.skill my-new-skill/
```
Then present the `.skill` file in Cowork — click "Copy to your skills" to install.

#### Step 3: Push to GitHub
```bash
cd ~/path/to/Claude-Skills    # your local clone
cp -r ~/Desktop/Storage/Claude/skills/my-new-skill ./my-new-skill/
git add my-new-skill/
git commit -m "Add my-new-skill"
git push origin main
```

#### Step 4: Update CLAUDE.md
Add the new skill to the "Available Skills" and "Skill Directory Structure" sections in CLAUDE.md.

### Why Cowork Doesn't Read Your Local Folder Directly

Cowork runs in a sandboxed Linux VM. The `.skills/skills/` directory is a **read-only mount**
managed by the Cowork app's internal skill registry. It's not a direct mapping of any folder
on your Mac. Skills get into this registry when you install them via the `.skill` package flow.

Your "selected folder" in Cowork (the folder picker) is mounted at a different location and
is for **working files** — not skill registration.

### Quick Reference: Where Each Tool Reads Skills From

**Cowork:** Internal registry at `.skills/skills/` → installed via `.skill` zip packages
**Claude Code:** Reads `CLAUDE.md` at project root → follows skill paths referenced there
**Both:** The actual skill content (SKILL.md + references/) is identical regardless of platform

### Troubleshooting

**Skill not showing in Cowork?**
→ You need to install it via a `.skill` package. Just having the folder isn't enough.

**Skill not working in Claude Code?**
→ Make sure your project's `CLAUDE.md` references the skill and its path.

**Skill changes not reflected in Cowork?**
→ Reinstall the `.skill` package. Cowork caches from the registry, not your filesystem.

**Skill changes not reflected in Claude Code?**
→ Claude Code reads files live, so changes should be immediate. Make sure you saved the file.
