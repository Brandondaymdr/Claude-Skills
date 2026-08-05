---
name: mac-mini-cleanup
description: >
  Disk space audit and safe cleanup procedure for Brandon's Mac mini (228 GiB Data
  volume, user brandonday). Use this skill whenever the user says the Mac mini is full,
  low on space, maxed out, mentions "System Data" being huge, wants to free up space,
  clean up the disk, or asks what's eating storage. Also trigger for "storage is full
  again", "clean my mac", "disk cleanup", or when the macOS Storage settings pane shows
  large System Data or Documents categories. Contains machine-specific hot spots,
  Fleet-safety exclusions, and verified safe-delete commands from the 2026 cleanups
  (7/4: ~26 GB recovered; 7/28: ~14 GB; 8/5: ~30 GB).
---

# Mac Mini Disk Cleanup

A verified audit + cleanup procedure for Brandon's Mac mini. Works from Claude Code
(direct shell — preferred) or Cowork (see the Cowork appendix; it has mount
restrictions).

**Canonical copy of this skill lives in the `claude-skills` git repo**
(`~/Projects/claude-skills`, symlinked as `~/.claude/skills`, pushed to
`github.com/Brandondaymdr/Claude-Skills`). The claude.ai Skills library copy (used by
Claude Desktop/Cowork) is a manually-uploaded mirror — after editing here, re-upload
there or the two will drift.

## Key insights (why the Settings numbers mislead)

- macOS "Documents" in Settings is a *category by file type across the whole disk*, not
  the ~/Documents folder. On this machine ~/Documents is tiny; the category is mostly
  `~/Projects` — and most of THAT is regenerable build artifacts, not source.
- "System Data" is everything uncategorized — dominated here by package-manager caches,
  app caches, and Claude/Cowork session data.
- `df -h /` shows the sealed system volume; use `df -h /System/Volumes/Data` for real
  free space.

## ⚠️ Fleet safety — read before deleting anything in ~/Projects

Fleet LaunchAgents tick against **`crowded-barrel/barrel-tracking`** and
**`DaysLLC/shorestack-books`**. Never delete their `node_modules`, never `git checkout`
or move them, without unloading the two Fleet plists first (`fleet-control.sh pause`
has false-alarmed before — unload the plists directly).

## Step 1: Audit (Claude Code)

```bash
df -h /System/Volumes/Data
du -xsh ~/Projects/* ~/Library ~/.npm ~/Library/pnpm 2>/dev/null | sort -rh
du -xsh ~/Library/Application\ Support/* 2>/dev/null | sort -rh | head -15
du -xsh ~/Library/Caches/* 2>/dev/null | sort -rh | head -10
find ~/Projects -type d \( -name target -o -name node_modules \) -prune -exec du -sh {} + 2>/dev/null | sort -rh | head -15
```

Deep `du` over home is slow (minutes) — raise the Bash timeout, don't assume a hang.

## Step 2: Known hot spots on this machine

Safe to delete — all rebuild automatically:

| Location | Typical size | Command / notes |
|---|---|---|
| shorestack monorepo `.turbo/cache` | up to 19 GB | `rm -rf ~/Projects/DaysLLC/shorestack/.turbo/cache` — Turborepo local build cache, the biggest regrower on the machine (8/5: 19 GB, 1,569 entries). If a shorestack session is active, keep its warm cache: `find .turbo/cache -type f -mtime +1 -delete` (recovered 13 of the 19 GB). |
| shorestack monorepo `apps/*/.next` | 3–4 GB | `rm -rf apps/*/.next` (six apps, ~0.5 GB each) — only when no dev server is running; rebuilds on next `dev`/`build`. |
| Tauri `src-tauri/target/debug` (reel, books) | 8–12 GB | `rm -rf .../target/debug`. **KEEP `target/release`** — it keeps dmg release builds incremental. Next dev build recompiles ~500 crates (~3–5 min); that is normal, not a broken toolchain. |
| `~/Library/pnpm` (pnpm store) | 5–7 GB | `pnpm store prune` (keeps packages active projects use — partial shrink is correct) |
| `~/.npm` (npm cache) | 2–8 GB | `npm cache clean --force` |
| `node_modules` in dormant projects | 1–5 GB | see Step 3 |
| `~/Library/Caches/{Google,pnpm,node-gyp}` | ~1.5 GB | `rm -rf` directly |
| Adobe caches (`~/Library/Caches/com.adobe.*`, Premiere media cache in App Support) | 0.5–1 GB | `pgrep -lif premiere` first — only when Adobe apps are closed |

Review before touching:

- **Claude app data** (`~/Library/Application Support/Claude`, ~12 GB): the bulk is
  `vm_bundles/claudevm.bundle` (~9 GB) — the LIVE Cowork VM image, actively mtime-updated
  while the Claude app runs; never delete it. The rest is Cowork local-agent sessions AND
  the local mirror of the claude.ai Skills library
  (`.../local-agent-mode-sessions/skills-plugin/...`). Clear old sessions via the
  Claude app UI, never blanket `rm`.
- **Rust toolchain** (`~/.rustup`, `~/.cargo`): Brandon USES Rust — keep.
- **Xcode** (`~/Library/Developer`, ~7 GB): DerivedData is safe; keep `UserData`, keep
  iOS DeviceSupport for the current iPhone iOS version, Archives only >90 days with
  confirmation.
- **`~/Projects`**: active business projects. Never delete source; strip artifacts.

## Step 3: node_modules in dormant projects

Determine dormancy from evidence, not memory — last commit >30 days ago:

```bash
for d in ~/Projects/DaysLLC/*/ ~/Projects/crowded-barrel/*/; do
  [ -d "$d/.git" ] && echo "$(git -C "$d" log -1 --format=%cs)  $d"
done | sort -r
```

Then delete `node_modules` only in the dormant ones, ALWAYS excluding the Fleet-watched
repos (barrel-tracking, shorestack-books) and anything worked cross-machine (e.g.
index-system). `npm install` / `pnpm install` restores them identically.

## Step 4: Archiving projects off the machine (usually unnecessary)

Source trees are small once artifacts are stripped; everything is on GitHub. If Brandon
still wants folders off the machine:

- Verify first: `git status` clean, all branches pushed, no stashes.
- **External HD**: fine — move the folder wholesale.
- **Google Drive**: zip the folder first, upload one archive. Never sync a live `.git`
  directory to Drive (thousands of small files, corruption risk mid-sync).
- Never archive Fleet-watched repos or repos with unmerged local branches.

## Step 5: Verify

```bash
df -h /System/Volumes/Data | tail -1
du -xsh ~/.npm ~/Library/pnpm 2>/dev/null
```

Report the before/after delta with actual command output. Settings > Storage lags a few
minutes. First builds after cache deletion are slower once.

## Cleanup history

| Date | Result | Notes |
|---|---|---|
| 2026-07-04 | 4.6 GB → 31 GB free (~26 GB) | Cowork session; npm 7.6G, pnpm, caches, Android SDK removed |
| 2026-07-28 | 18 GiB → 32 GiB free (~14 GB) | Claude Code; reel target/debug 8.9G, npm 1.9G, pnpm prune 1.4G, dormant node_modules ~1.5G, caches ~1.9G |
| 2026-08-05 | 6.4 GiB → 37 GiB free (~30 GB) | Claude Code; shorestack monorepo `.turbo/cache` 19G (new #1 hot spot), books target/debug 4.2G, `apps/*/.next` 3.3G, npm + Caches ~1.5G. `pnpm store prune` removed 0 packages (all in use — correct). Identified `vm_bundles/claudevm.bundle` 9.2G as live/untouchable. |

## Ground rules

- Measure first, delete second; show findings and get approval before deletion.
- Only delete rebuildable data (caches, stores, build products). Never source code,
  media, git repos, or anything user-created.
- These caches regrow (~15–25 GB per quarter); repeat quarterly.

## Appendix: Cowork constraints (Desktop app only)

Cowork cannot mount `~`, `~/Library`, `~/Documents`, or `~/Library/Application
Support`. It CAN mount `~/Library/Developer`, `~/Library/Caches`, `~/Library/
Containers`/`Group Containers`, `~/Library/CloudStorage`, and `~/Desktop` via
`request_cowork_directory`. For everything else, have Brandon run report commands in
Terminal writing to `~/Desktop/disk_report.txt`, then mount Desktop and read it. Use
`mcp__cowork__allow_cowork_file_delete` before rm on mounted folders. zsh-safe globs
only (no `.[!.]*`). Terminal typing via computer-use is blocked.
