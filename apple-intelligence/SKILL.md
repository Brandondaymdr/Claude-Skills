---
name: apple-intelligence
description: Verified facts and gates for putting Brandon's apps into Siri, Spotlight and Apple Intelligence on iOS 27 / macOS 27 — App Intents, IndexedEntity Spotlight indexing, Foundation Models (on-device + Private Cloud Compute + the SpotlightSearchTool), plus which repo can actually reach each surface and how. Use this skill whenever the user mentions Siri, Spotlight, App Intents, AppEntity, AppShortcutsProvider, Foundation Models, Apple Intelligence, "Siri AI", Shortcuts, Visual Intelligence, Writing Tools, iOS 27 / macOS 27 / Xcode 27 migration, or wants any ShoreStack / Crowded Barrel / SAI app to show up in Siri or Spotlight. Trigger even if they just say "make it work with Siri" or "add it to Spotlight". Read this BEFORE opening Xcode or proposing an intent — the reachability table decides whether the work is worth doing at all.
---

# Apple Intelligence (iOS 27 / macOS 27)

**Pass one (2026-09-15): verified facts and gates only.** Everything here comes
from Apple's own iOS 27, macOS 27 and Xcode 27 release notes (read in full the
day after release) or from the repos themselves. Nothing in this pass has been
compiled against a project yet. Pass two adds the code patterns that actually
build and pass the App Intents Testing framework — do not write code patterns
into this file from docs alone. Docs are claims; a passing test is evidence.

## The one-paragraph model

Every third-party Apple Intelligence surface runs through **App Intents in
compiled Swift**: `AppIntent` (a verb), `AppEntity` (a noun), `EntityQuery`
(how the system finds nouns), `AppShortcutsProvider` (what Siri/Shortcuts can
call), and `IndexedEntity` + `indexAppEntities()` (what Spotlight and Siri's
personal context can see). SiriKit was deprecated at WWDC 2026 with a two-to-
three-year removal window; App Intents is the only forward path. Siri and
Spotlight are **the same code** — one entity, one query, one deep link serve
both. Foundation Models is a separate Swift API (on-device model, Private Cloud
Compute, or any provider behind the `LanguageModel` protocol) that can *call*
your intents and *search* Spotlight via `SpotlightSearchTool`.

Device gates: Siri AI needs iPhone 15 Pro+ or an M1+ Mac. Plain App Intents
and Spotlight reach every iOS 27 device back to iPhone 11.

## Relevance gate — answer this before the first edit

A user must be able to reach the surface on the shipping build (see
`rules/discipline.md`). Answers as of 2026-09-15:

| Repo | Shell | Reach? | Why / how |
|---|---|---|---|
| `DaysLLC/shorestack-dashboard` | SwiftUI, macOS 26.0 target, shipping 0.6.x | **YES — first home** | Fully native. Mail/calendar/comms map straight onto Apple's schema domains and the Spotlight semantic index. BYOK LLM can take the on-device model as a keyless provider. |
| `crowded-barrel/alchemy-timeclock` | Capacitor 8, App Store 1.1 live | **YES, with a bridge** | `ios/App` is a real Xcode project (gitignored — Mac mini only). ASC already holds a parked **1.2** shell = the vehicle. Read-only first: a `Shift` entity ("when's my next shift"), "clock in" as a deep link to the PIN screen. |
| `crowded-barrel/b-roll` | Capacitor, App Store live (unlisted) | YES technically, low value | Same bridge pattern. Nothing queued. |
| `DaysLLC/shorestack-time` | Capacitor 7, iOS 14 target | **Best Siri fit, but PARKED** | "Clock me in" with real staff auth. Track parked 2026-09-12 by Brandon — backlog only until unparked. |
| `DaysLLC/harper-timeclock` | Capacitor 8 | NO | Engagement ended. Don't. |
| `DaysLLC/shorestack-books` | Tauri 2, macOS | **NO for now** | cargo builds can't run Xcode's `appintentsmetadataprocessor`, so intents in the main binary are never discovered. Only path = an App Intents Extension (.appex) built in Xcode, embedded under `Contents/PlugIns` by a bundle hook, reading the SQLite company file for Spotlight and deep-linking back. Real value (customers/invoices in Spotlight), high cost. Needs a new decision + ADR. |
| SAI (`sai-portal`, `sai-visas`, `sai-portal-intake`) | Next.js web / PWA | **NONE** | Siri and Spotlight do not index web apps. Only relevant if SAI ever chooses a native student app (new Q28+ question, not asked). |

**The Capacitor bridge decision** (make it once per app, record it in that
repo's CLAUDE.md): the WebView owns the Supabase session, Swift does not.
Either (a) the intent sets `openAppWhenRun = true` and deep-links into JS —
simple, always opens the app, fine for "clock in"; or (b) a tiny Capacitor
plugin mirrors the session token into Keychain so `perform()` can call an RPC
headless — required for "what's my next shift" to answer without opening.
Start with (a) unless the intent is read-only and worth answering inline.

## Hard constraints from Apple's 27 release notes

Verbatim sources in `references/release-notes-27.md`. These are the ones that
change designs:

- **`AppEntity` instances have a cumulative 10 MB size cap** including child
  properties; exceeding it crashes. Index mail/records as subject, sender, date
  and a snippet — never full bodies as entity properties.
- **Entity images must be SF Symbols.** Custom images may not appear in Siri
  results for third-party apps (iOS and macOS, still a Known Issue).
- **Provide an `EntityQuery` by id, not only an `EntityStringQuery`** — Siri
  may fail to resolve entity types that offer only a string query.
- **`SpotlightSearchTool` with the on-device model needs a focused guide** —
  `.focused(.communications)`, `.calendar`, `.documents`, `.visualMedia` or
  `.audio`. The default schema alone overflows the on-device context window.
  Sessions on a larger-context model can keep the default.
- **Private Cloud Compute does not work in the simulator.** Test on hardware
  (the mini).
- **Schema domains now include calendar** (`calendar.deleteEvents` → renamed
  `calendar.deleteEvent`), notes (`AttributedString` names), reminders, photos,
  maps, phone, audio. Prefer a schema over a custom intent when one fits.
- **Every iOS app built with the 27 SDK must include a launch screen**
  (`UILaunchScreen`, `UILaunchStoryboardName`, or the plural forms) or the App
  Store rejects it. Check each Capacitor shell's `Info.plist` before the next
  archive — the shells' `ios/` folders live only on the mini.
- **Background Neural Engine access needs the entitlement**
  `com.apple.developer.background-tasks.continued-processing.inference`.
- **No WebKit / WKWebView changes are listed** in iOS 27 — the Capacitor
  shells and the SAI PWA are unaffected by the OS update itself.
- Siri may run the wrong `OpenIntent` when several target different entity
  types (fixed in 27.0 — but keep one `OpenIntent` per entity type anyway).

## Xcode 27 / SwiftUI 27 migration items (dashboard first)

Do these as their own contract item before any intent work; they are compile
and crash risks, not features:

- `@State` is now a Swift macro. Initial-value-plus-initializer patterns and
  synthesized private inits stop compiling; composing `@State` with other
  wrappers is unsupported. Back-deploys to iOS 17-aligned OSes.
- `TabView` crashes if its selection is set to a hidden/unavailable tab.
- macOS 27 hides menu item symbol images by default (menu bar + context menus).
  Use `labelStyle(.titleAndIcon)` where an item represents an object.
- `.roundedBorder` / `.squareBorder` text field styles are soft-deprecated for
  `.bordered` (`textInputBorderShape(_:)` for shape).
- `FileDocument` / `ReferenceFileDocument` deprecated for `Document`
  (`ReadableDocument` + `WritableDocument`).
- Xcode 27 = Swift 6.4, Apple-silicon only, host must be macOS 26.6+. A
  **macOS 27.0 minimum target drops x86_64** from `ARCHS_STANDARD`; the
  dashboard's 26.0 target is unaffected, Books already ships `aarch64` only.
- Xcode 27 ships an MCP server (`sudo xcrun mcp-server enable`) and Agent
  Client Protocol support — Claude Code can drive builds, simulators and the
  debugger directly. Separate from this skill; wire it up when the first native
  session starts.

## Reading Apple docs

`developer.apple.com/documentation/...` pages are JS-rendered — WebFetch
returns only the title. Read the data endpoint instead:
`https://developer.apple.com/tutorials/data/documentation/<same path>.json`,
then walk `primaryContentSections` (headings, paragraphs, lists). Render with
`node`; on the MacBook `python3` is an Xcode shim that fails until
`sudo xcodebuild -license accept` has been run.

## Proposed first contract (dashboard) — for restart to pick up

Not yet scheduled. Written 2026-09-15 so a restart doesn't re-derive it:

1. **Xcode 27 compile pass.** Done when the existing suite is green under
   Xcode 27 with the `@State`, `TabView` and menu-image changes applied and a
   build ships from the mini.
2. **Spotlight entities for mail + calendar** — SF Symbol images, id-based
   queries, snippet-only properties under the size cap. Done when a real
   thread appears in Spotlight on macOS 27 and opens, and the App Intents
   Testing framework resolves it by id.
3. **On-device model + `SpotlightSearchTool(.focused(.communications))`**
   behind the BYOK switch. Done when "summarize what Michael sent this week"
   answers from indexed mail with no key configured, and the Anthropic path
   still passes its tests.

Queue after: open-thread / search-mail / reply intents; Alchemy Clock 1.2 with
the `Shift` entity + clock-in deep link; Books appex as a design ADR.

## What pass two must add (and only after it has run)

- `references/native-swiftui.md` — the entity/query/intent/shortcuts shape
  that compiled in the dashboard, with the test that proved it.
- `references/capacitor-bridge.md` — the Swift-in-`ios/App` + deep-link (or
  Keychain token) pattern once Alchemy Clock 1.2 proves it, including the
  archive checklist (launch screen, `TARGETED_DEVICE_FAMILY = "1"`, version
  bump).
- Gotchas with dates, added only when they bit.
