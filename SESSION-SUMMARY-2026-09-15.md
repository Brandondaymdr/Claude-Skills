# Session Summary — 2026-09-15 (MacBook)

## What this session was

A `/session-restart` across the three project trees (`~/Projects/DaysLLC`, `~/Projects/crowded-barrel`, `~/Projects/SAI`) the day after iOS 27 shipped, driven by one question from Brandon: how to put Siri and Spotlight (Apple Intelligence) into the ShoreStack, Crowded Barrel and SAI apps. The Google Doc Brandon linked turned out to be his command cheat sheet, so the iOS 27 facts came from Apple's own release notes instead. The session produced an assessment, then, on Brandon's GO, one new skill.

## Findings

- **Reachability decides everything.** Apple Intelligence reaches third-party apps only through App Intents in compiled Swift. Of the 24 repos: `shorestack-dashboard` (native SwiftUI, shipping 0.6.4) is the first and best fit; the Capacitor shells (`alchemy-timeclock`, `b-roll`, `shorestack-time`, `harper-timeclock`) can host intents in `ios/App` but need a bridge decision because the WebView owns the session; `shorestack-books` (Tauri) cannot expose intents from its cargo-built binary and would need an Xcode-built App Intents extension; every SAI surface is web and unreachable.
- **Apple's release notes add hard constraints** that the third-party guides omitted: a 10 MB cumulative `AppEntity` cap, SF Symbol entity images, id-based `EntityQuery`, focused guides for `SpotlightSearchTool` on the on-device model, Private Cloud Compute absent from the simulator, a mandatory launch screen for 27-SDK iOS builds, calendar now a schema domain, and no WebKit changes.
- **`developer.apple.com` docs are JS-rendered.** WebFetch returns the title only; the content is at `/tutorials/data/documentation/<path>.json`. Rendered with `node` because `python3` on this MacBook is an Xcode shim that fails until `sudo xcodebuild -license accept` runs (Xcode 27.0 and macOS 27.0 are installed here, license unaccepted).
- **Stale memory corrected.** The dashboard memory said "docs only"; the repo was 218 commits ahead of that (0.6.4 released 2026-09-14, seventeen OTAs, Claude Code the only coding agent since 09-12). The ShoreStack time-and-payroll track was parked 2026-09-12. Both memories rewritten.
- **Repo sync.** `shorestack` (61 behind), `shorestack-dashboard` (218), `shorestack-time` (4) and `b-roll` (1) were fast-forwarded on this MacBook; all trees clean, nothing ahead.

## Shipped

| PR | What | Verification cited |
|---|---|---|
| #40 (squash `7b81d59`) | `apple-intelligence/` skill, pass one: reachability table, release-note constraints, Xcode 27 / SwiftUI 27 migration list, Apple docs endpoint recipe, proposed first dashboard contract; `references/release-notes-27.md` with verbatim entries and Apple issue ids; README row; CLAUDE.md domain-skills mention | Frontmatter three lines with `name` matching the directory; reference sections spot-read (one mis-sorted macOS Siri block fixed before commit); live checkout stayed clean on `main` throughout; skill appeared in the session's skill list after the fast-forward pull |

Deliberately absent from pass one: any code pattern. Nothing has compiled against a project yet.

## This closeout adds

- `intent/0002-apple-intelligence-pass-two.md` — the multi-session follow-on (native SwiftUI and Capacitor bridge references, written only from code that compiled).
- This file.
- `~/Downloads/apple-intelligence.zip` (built this session) is the claude.ai Skills library upload for Desktop and Cowork; Claude Code on both Macs reads the repo, not the library.

## Carried forward, not done

The 2026-09-02 tee-up (session-checkpoint same-commit plan rule; folder-forensic-audit artifact-chain checks; re-upload of the 09-02 skill zips) was not touched this session and stays in the tee-up.
