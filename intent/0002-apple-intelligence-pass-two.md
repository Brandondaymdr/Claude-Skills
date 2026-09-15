# 0002. Turn the apple-intelligence skill from facts into working code patterns (pass two)

Status: Open
Date: 2026-09-15
Originator: Brandon ("how can I implement these new AI features, especially Siri and Spotlight, into my ShoreStack, Crowded Barrel and SAI apps?", the day after iOS 27 shipped)

## Problem
`apple-intelligence` (PR #40) is pass one: a reachability table, the hard constraints from Apple's iOS 27 / macOS 27 / Xcode 27 release notes, and a proposed first dashboard contract. It contains no code on purpose, because nothing had been compiled against a project. A skill that only says what is true is not yet a skill that makes the next session faster at building; the first session that adds Spotlight entities to the dashboard will still derive the `AppEntity` / `EntityQuery` / `IndexedEntity` / `AppShortcutsProvider` shape from Apple docs, and the first Capacitor intent will still have to invent the Swift-in-`ios/App` bridge.

## Proposed outcome
A session that opens `shorestack-dashboard` or `alchemy-timeclock` and says "add X to Siri" gets a compiled, tested pattern to copy: `references/native-swiftui.md` (the entity, query, intent and shortcuts shape that built in the dashboard, with the App Intents Testing framework test that proved it) and `references/capacitor-bridge.md` (the Swift intent in `ios/App` plus the deep-link or Keychain-token choice, once Alchemy Clock 1.2 proves it, with the archive checklist). Gotchas get added with dates only when they bit.

## Affected users and systems
Brandon, on the Mac mini (Xcode 27, signing). Repos: `DaysLLC/shorestack-dashboard` (first, native SwiftUI, macOS 26.0 target), `crowded-barrel/alchemy-timeclock` (second, Capacitor 8, the parked 1.2 shell in App Store Connect). `shorestack-time` stays parked; `shorestack-books` and SAI are out of scope per the skill's reachability table. The claude.ai Skills library copy must be re-uploaded after each pass.

## Constraints
- Pass two is written only from code that compiled and passed a test on a real project; no pattern goes in from docs alone (docs are claims).
- The dashboard's Xcode 27 compile pass (`@State` macro, `TabView` hidden-tab crash, hidden menu images) lands before any intent work, as its own contract item.
- Entities stay under the 10 MB cumulative cap, use SF Symbol images, and provide an id-based `EntityQuery`. The on-device `SpotlightSearchTool` uses a focused guide.
- Any iOS shell archived with the 27 SDK must carry a launch screen key in `Info.plist`.
- Skill edits go through an isolated worktree and a PR; never a checkout in `~/Projects/claude-skills`.

## Open questions
- Capacitor bridge: deep link with `openAppWhenRun` (simple) versus a Keychain-mirrored Supabase token (headless answers). Decide per app on the first real intent and record it in that repo's CLAUDE.md.
- Whether the dashboard swaps its hand-rolled Anthropic provider for Anthropic's `LanguageModel`-conforming Swift package, or keeps both.
- Whether the Xcode 27 MCP server (`sudo xcrun mcp-server enable`) becomes part of the dashboard's session setup, and where that recipe lives.
