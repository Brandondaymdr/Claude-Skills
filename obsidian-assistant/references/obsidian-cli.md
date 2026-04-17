# Obsidian CLI Reference

The Obsidian CLI (`obsidian` command) provides direct interaction with a running Obsidian instance. It is available when Obsidian is open and the CLI is enabled.

## Check Availability

```bash
which obsidian && echo "CLI available" || echo "CLI not installed"
```

If unavailable, fall back to direct file operations.

## Core Commands

### Read & Write Notes

```bash
obsidian read file="Note Name"              # Read by wikilink name
obsidian read path="Projects/my-project/README.md"  # Read by path
obsidian create name="Note Name" content="..." # Create new note
obsidian append file="Note Name" content="..." # Append to existing note
```

### Daily Notes

```bash
obsidian daily:read                          # Read today's daily note
obsidian daily:append content="- [ ] New task"  # Append to today's daily note
```

### Search

```bash
obsidian search query="search term" limit=10   # Search vault
```

### Tasks

```bash
obsidian tasks                                 # List all tasks
```

### Properties (Frontmatter)

```bash
obsidian property:set file="Note" key="status" value="done"
```

### Vault Info

```bash
obsidian eval code="app.vault.getFiles().length"  # Count files
```

## Targeting

- `file="Note Name"` — Wikilink-style resolution (searches vault)
- `path="Folder/file.md"` — Exact vault-relative path
- `vault="My Vault"` — Target specific vault (defaults to most recently focused)

## When to Use CLI vs Direct File Access

| Scenario | Use |
|----------|-----|
| Obsidian is open | Prefer CLI — triggers Obsidian events, updates UI |
| Obsidian is closed | Use direct file read/write |
| Daily notes | CLI `daily:read`/`daily:append` — respects daily note settings |
| Searching | CLI `search` — uses Obsidian's index, faster than grep |
| Properties | CLI `property:set` — validates types |
| Bulk operations | Direct file access — CLI is per-note |
