---
name: xcode-cleanup
description: >
  Xcode developer data audit and cleanup skill that scans DerivedData, simulators, archives,
  caches, and platform SDKs to identify what's safe to delete and reclaim disk space. Use this
  skill whenever the user mentions Xcode storage, Xcode taking up space, DerivedData cleanup,
  simulator cleanup, freeing disk space on a Mac used for development, Xcode cache, Xcode archives,
  "my Mac is running out of space" in a development context, or any variation of managing Xcode's
  disk footprint. Also trigger when the user asks about what Xcode data is safe to delete, how to
  reduce Xcode storage usage, or wants to understand what's eating their disk. Even if the user
  just says "clean up Xcode" or "Xcode is huge" — use this skill.
---

# Xcode Developer Data Cleanup

This skill helps Mac users who develop with Xcode keep their disk space under control. Xcode
silently accumulates gigabytes of build caches, simulator runtimes, old archives, and downloaded
device support files. Most of this data is safe to delete because Xcode rebuilds it on demand,
but knowing *what* is safe vs. what you'd regret losing isn't obvious. This skill handles that
judgment call.

## Philosophy

Be conservative. Always show the user what you found and what you recommend deleting before
touching anything. The user's source code and git repos are never touched — this skill only
operates on Xcode's generated/cached data in `~/Library/Developer/` and related system paths.

## What to scan

These are the locations to check, in priority order (biggest space savings first):

| # | Location | What it contains | Safe to delete? |
|---|----------|-----------------|-----------------|
| 1 | `~/Library/Developer/Xcode/DerivedData/` | Build caches, indexes, intermediate build products for every project | **Yes** — Xcode rebuilds automatically on next open. Show per-project breakdown so user can keep active ones if they want faster rebuilds. |
| 2 | `~/Library/Developer/CoreSimulator/` | iOS/watchOS/tvOS/visionOS simulator runtimes and device data | **Yes** — simulators can be re-downloaded from Xcode > Settings > Platforms. Check for "unavailable" simulators (runtimes no longer installed) which are pure waste. |
| 3 | `~/Library/Developer/Xcode/iOS DeviceSupport/` | Files downloaded when connecting physical iPhones/iPads. One folder per iOS version. | **Review** — old iOS versions the user no longer has devices running are safe to remove. Current device versions should stay. |
| 4 | `~/Library/Developer/Xcode/watchOS DeviceSupport/` | Same as above for Apple Watch | Same logic as iOS DeviceSupport. |
| 5 | `~/Library/Developer/Xcode/Archives/` | .xcarchive builds from App Store submissions and ad-hoc distributions | **Review** — these contain dSYMs needed for crash symbolication of released builds. Archives older than 90 days are usually safe. Warn the user before deleting. |
| 6 | `~/Library/Developer/DVTDownloads/` | Downloaded documentation and components | **Yes** — re-downloaded on demand. |
| 7 | `~/Library/Caches/com.apple.dt.Xcode/` | Xcode's general cache | **Yes** — rebuilt automatically. |
| 8 | `~/Library/Developer/XCTestDevices/` | Test device data | **Yes** — rebuilt when tests run. |
| 9 | `/Applications/Xcode.app` | Xcode itself + bundled platform SDKs | **Report only** — never delete Xcode.app. But identify extra platform SDKs (visionOS, tvOS, watchOS) that could be removed via Xcode > Settings > Platforms if the user doesn't target those platforms. |

## How to perform the audit

### Preferred method: Finder with computer-use

In Cowork or when Terminal typing is restricted, use Finder to audit each location:

1. **Open Finder** and use Go > Go to Folder (Cmd+Shift+G)
2. Navigate to `~/Library/Developer/` to start
3. For each folder in the table above:
   - Right-click the folder > **Get Info**
   - Wait a few seconds for "Calculating Size" to finish
   - Record the size shown
   - Close the Get Info window before checking the next folder
4. For subfolders (like individual projects in DerivedData, or iOS versions in DeviceSupport), open the parent folder and check sizes of children the same way

This method is slower than a script but works reliably in all environments.

### Alternative method: Shell script

If you have shell access on the user's Mac (Claude Code, or Terminal with full tier access), run the bundled audit script:

```bash
bash <skill-path>/scripts/xcode_audit.sh
```

This produces a structured report covering all locations above, with per-project breakdowns, simulator runtime listings, archive age calculations, and a summary.

### Alternative method: Xcode Settings

Some information is also available directly in Xcode:
- **Xcode > Settings > Locations** — shows DerivedData path and lets you open it
- **Xcode > Settings > Platforms** — shows installed simulator runtimes and their sizes, with delete buttons

## Presenting the report

After gathering sizes, present findings organized into three categories:

```
Xcode Storage Audit
===================
Total Xcode footprint: XX.X GB

SAFE TO DELETE (XX.X GB reclaimable):
  DerivedData (N projects)           X.X GB
  Stale simulators                   X.X GB
  Xcode caches                       X.X GB
  DVTDownloads                        X.X GB
  XCTestDevices                       X.X GB

REVIEW BEFORE DELETING (X.X GB):
  Archives older than 90 days (N)     X.X GB
  Old device support (iOS XX, XX)     X.X GB

REPORT ONLY:
  Xcode.app                          XX.X GB
    - includes [platform] SDK (X.X GB, removable if unused)
```

Skip any categories that are empty or where the folder doesn't exist — not every Mac will have all of these.

## Asking what to delete

After presenting the report, offer these options:

1. **Delete all safe items** — everything in the "safe to delete" category
2. **Delete safe + reviewed items** — everything including archives and old device support
3. **Let me pick** — user chooses specific categories
4. **Just the report** — audit only, don't delete anything

## Executing cleanup

Once the user confirms, delete using the appropriate method:

**Via Finder (Cowork):** For each item, right-click > Move to Trash. Then remind the user to empty Trash to actually free the space.

**Via shell (Claude Code):** Use `rm -rf` on specific paths. Example:
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ~/Library/Caches/com.apple.dt.Xcode/
```

For simulators, prefer: `xcrun simctl delete unavailable` (removes simulators whose runtimes are no longer installed).

### Safety rules — these are non-negotiable

- **Never delete** `~/Library/Developer/Xcode/UserData/` — contains preferences, code snippets, themes, keybindings
- **Never delete** anything inside a git repository or project source folder
- **Never delete** Xcode.app itself — only report its size
- **Never use broad wildcards** — always target specific subfolders
- **Always confirm** with the user before deleting anything in the "Review" category
- If a path doesn't exist, skip it silently

## Post-cleanup advice

After cleanup, mention:
- DerivedData rebuilds automatically when you open a project — first build will be a bit slower, that's normal
- Deleted simulators can be re-added from Xcode > Settings > Platforms
- Archives cannot be recovered once deleted (but you confirmed this)
- Consider running this cleanup monthly, or whenever you notice disk space getting tight
- The biggest repeat offenders are DerivedData and CoreSimulator — those grow back the fastest

## Edge cases

- **No Xcode installed**: If `~/Library/Developer/` doesn't exist, tell the user Xcode doesn't appear to be installed or hasn't generated any data yet.
- **Multiple Xcode versions**: Some users have Xcode and Xcode-beta. Both generate DerivedData and share the same Library/Developer paths. The audit catches both.
- **iCloud sync**: Xcode data in ~/Library/ is not synced to iCloud (Library is excluded). But if the user's project source folders are on iCloud Drive, warn that DerivedData rebuilds after cleanup won't trigger iCloud issues — DerivedData is always local.
- **Empty DerivedData**: If DerivedData exists but is empty (0 bytes), the user either just installed Xcode or recently cleaned it. Note this and move on.
- **Xcode currently running**: If Xcode is open, DerivedData for the active project is in use. Warn the user to close Xcode before deleting DerivedData, or at minimum skip the active project's folder.
