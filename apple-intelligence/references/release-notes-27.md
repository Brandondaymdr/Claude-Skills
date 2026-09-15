# Apple 27-series release notes — verbatim extracts relevant to third-party App Intents / Spotlight / Foundation Models

Read 2026-09-15 from Apple's data endpoints (see SKILL.md "Reading Apple docs"). Numbers in parentheses are Apple's issue ids. Only the sections that bear on Brandon's apps are kept; the full renders were ~700 lines each.

## iOS & iPadOS 27 — https://developer.apple.com/documentation/ios-ipados-release-notes/ios-ipados-27-release-notes

### App Intents

#### New Features
- You can now pass a name parameter of type `AttributedString` to the `notes.createNote` and `notes.updateNote` schemas. (173431080)

#### Resolved Issues
- Fixed: Non-SF Symbol custom images for app entities might not always appear in Siri. (175031314)
- Fixed: Default values from schemas might not be applied for parameters that are of “Set” type. (175534195)
- Fixed: Entities you register using `RelevantEntities` for the workout audio context might not appear as suggestions in Fitness media picker. (177996973)
- Fixed: Requests that should result in an app’s `reminders.updateReminder`-conforming intent to be called might fail with “ cannot be used for this action right now.” (181212609) (FB23526663)
- Fixed: AppEntity instances have a cumulative size limit of 10MB, including all child properties and their values. Your app might crash if an entity exceeds this limit, and the exception is logged. (181763422)
- Fixed: The notes.appendText schema erroneously disappeared from the SDK. (182532125)

#### Known Issues
- Existing entities that conformed to @AppEntity(schema: .photos.asset) in prior releases might no longer compile in the 27 SDKs because new properties were added to the schema in this release. (181800016) (FB23652582)
 To continue conforming to the schema, adopt the additional properties and move the code behind an availability check.

#### Deprecations
- The `calendar.deleteEvents` schema has been renamed to `calendar.deleteEvent`. (176751155)


### Core AI

#### New Features
- iOS 27 includes Neural Engine improvements for Apple Intelligence capable devices. The system now restricts background access to the Neural Engine, similar to GPU usage restrictions. Large model loading (over 1 GB) performance is improved on the Neural Engine. Neural Engine memory usage is now attributed to your app process instead of the system, and appears in the Allocations instrument. (174796039)
- Access to the Neural engine when your app is in the background requires the new entitlement: “com.apple.developer.background-tasks.continued-processing.inference”. (179282606)


### Core Spotlight

#### Known Issues
- Creating a SpotlightSearchTool without a configuration and using it with a LanguageModelSession backed by the on-device system language model fails with an error reporting that the number of tokens provided exceeds the maximum allowed. The tool’s default configuration is sized for models with large context windows, so the tool’s description and parameter schema alone exceed the on-device model’s context window before any prompt is added. (183770678)
 Configure the tool with a focused guide, which uses a compact schema sized for the on-device model:
To search a specific kind of content, pass a domain: `.focused(.communications)`, `.focused(.calendar)`, `.focused(.documents)`, `.focused(.visualMedia)`, or `.focused(.audio)`. A focused guide exposes a smaller set of search capabilities than the default configuration. Sessions backed by a model with a larger context window can continue to use the default configuration.


### Foundation Models

#### Resolved Issues
- Fixed: Private Cloud Compute might not work when you use simulators. (177684296)
- Fixed: When using the on-device Apple Foundation Model for both tool calling and guided generation, some prompts might cause the model to call tools excessively. (177748926)
- Fixed: `@Generable` on an `enum` produces a deprecation warning about `GenerationError` that cannot be silenced. (177899620)
- Fixed: Truncating transcript history in the `onPrompt` modifier might cause an unexpected runtime error. (177901494)
- Fixed: `onPrompt` might not be called when applied to a `Profile` without instructions. (177902488)
- Fixed: `PrivateCloudComputeLanguageModel` always uses greedy decoding. (178181782)


### Shortcuts

#### Resolved Issues
- Fixed: Focus automations migrated from iOS 26 to iOS 27 do not work. (179514725)
- Fixed: Writing Tools actions are unavailable in Shortcuts. (179846468)
- Fixed: The Use Model action might fail to run when using the On-Device option for some output types. (181071784)
- Fixed: Shortcuts containing the Send Message action might fail to import or share. (182745894)

#### Known Issues
- If an app intent uses Duration or `LPLinkMetadata`, creating a shortcut with that intent and then attempting to edit it with “Describe a change” might fail. (166068090)
 If the model discards the action, press “Undo” to recover the unsupported intent.
- When an app intent defines a `UnionValue` parameter with two number-related types (for example, both Int and Double), the number option appears twice in the parameter picker menu and shows as double-selected. (168315587)
 Define only one number-related type in the `UnionValue` parameter (for example, use only Int or only Double, not both).


### Siri (third-party-relevant entries only)

#### Resolved Issues
- Fixed: App Intents with `@UnionValue` types that accept a `PlaceDescriptorEntity` and a `String` always receive `String` values instead of `PlaceDescriptorEntity` entities. (176844035)
- Fixed: Starting a call with Siri might fail with an error in apps that adopt CallKit and the `phone.startCall` AppSchema. (177190637)
- Fixed: Siri might not resolve some entity types when your app has provided only an `EntityStringQuery` for the entity type. (177464215)
- Fixed: Search results from third-party apps may not be tappable. (177593534)
- Fixed: Siri might not find app-specific contacts that are only indexed in Spotlight and do not appear in the Contacts app. (177679168)
- Fixed: Siri might run the incorrect `OpenIntent` or `system.open` intent when multiple intents targeting different entity types are available in your app. (177992979)
- Fixed: You might encounter build failures when attempting to implement a Transferable `IntentValueRepresentation` for `PHAsset`. (178276448)

#### Known Issues
- Non-SF Symbol custom images for entities might not appear in Siri results for third-party apps. (177984074)

### UIKit (entries that gate the Capacitor shells)

- iOS and iPadOS apps built with the 27.0 SDK or later are required to include a launch screen. Your app’s `Info.plist` must contain one of the following keys: `UILaunchStoryboardName`, `UILaunchStoryboards`, `UILaunchScreen`, or `UILaunchScreens`. Apps that don’t include a launch screen are rejected when the App Store begins accepting apps built with the 27.0 SDK. (168247372)
- On iOS 27.0 and iPadOS 27.0, Siri can load resources from drag interactions installed in your app’s interface. For example, when Apple Intelligence is invoked from a context menu, the system calls `UIDragInteractionDelegate` methods to load the content. Because drag sessions might begin without a user-initiated drag gesture, avoid performing animations or presenting modal UI for the drag in `dragInteraction(_:sessionWillBegin:)`. Instead, perform those actions in `dragInteraction(_:sessionDidMove:)`. (168884200)

### SwiftUI — New Features (migration-relevant subset)

- In apps built with the iOS 27.0 and iPadOS 27.0 SDKs, a `Text` view with `.textSelection(.enabled)` applied now supports user-interactive selection using the system text selection UI. Previously, selectable `Text` views on iOS and iPadOS offered selection functionality through a callout menu. When building with the iOS 27.0 and iPadOS 27.0 SDKs, selectable `Text` views might include additional gestures for system text selection interactions. Consider using `.highPriorityGesture()` for custom gestures applied to `Text` views that should supersede system text selection gestures. (79770704) (FB9208920)
- A `@State` declared with an expression as its initial value used to evaluate the expression each time the view struct re-instantiates. In the case of `@State private var model = Model()`, this means `Model.init()` gets called many times throughout the view’s lifetime. Xcode 27 introduces a new `@State` implementation that avoids this repeated evaluation. This new behavior back-deploys to iOS 17 aligned OSes. The new `@State` is implemented with a Swift macro. It is largely source compatible with the property wrapper version, with a few exceptions.
- In apps built with the 27.0 SDKs, the new `ReadableDocument` and `WritableDocument` protocols support asynchronous reading and writing, progress reporting, and direct access to document URLs. New `DocumentGroup` initializers that adopt these protocols let you disable document creation for editing-only apps and present custom UI before any document is opened. The initializers expose an `Observable` `URLDocumentConfiguration` and integrate with Swift concurrency and the `Observation` framework. New applications should prefer `ReadableDocument` and `WritableDocument` over `ReferenceFileDocument`, which remains available. (158441552)
- In apps built with the iOS 27.0 and iPadOS 27.0 SDKs, a `TabView` enforces that its selection is set to a visible tab. `TabView` might crash when its selection is set to a hidden or otherwise unavailable tab. (164516837)
- The menu bar on iPadOS 27.0 and macOS 27.0, as well as context menus on macOS 27.0, present a reduced set of menu item images. By default, SwiftUI now hides all menu item symbol images in most contexts, while non-symbol images remain visible. Review the updated Human Interface Guidelines to determine which menu items in your app should still display images. Use the `labelStyle(_:)` view modifier with the `.titleAndIcon` style to indicate that a menu item `Label`’s icon should always be shown — such as when the menu item represents an object or a concept rather than an action. SwiftUI continues to automatically provide default visible menu item images for certain common system-wide menu items, such as Settings, Share, and Print. (170480710)
- You can now use the `TextInputBorderShape` type to customize the border shape of text input controls like `TextField` with the `textInputBorderShape(_:)` view modifier. The `.squareBorder` and `.roundedBorder` text field styles are soft deprecated — use the new `.bordered` text field style instead. (173362083)
- You can now use the `Document` protocol for representing documents in `DocumentGroup`. This protocol combines `ReadableDocument` and `WritableDocument` for common read-and-write cases. Use `Document` instead of `ReferenceFileDocument` and `FileDocument`, which are now deprecated. (177458781)

## macOS 27 — https://developer.apple.com/documentation/macos-release-notes/macos-27-release-notes

### App Intents

#### New Features
- You can now pass a name parameter of type `AttributedString` to the `notes.createNote` and `notes.updateNote` schemas. (173431080)

#### Resolved Issues
- Fixed: Default values from schemas might not be applied for parameters that are of “Set” type. (175534195)
- Fixed: Requests that should result in an app’s `reminders.updateReminder`-conforming intent to be called might fail with “ cannot be used for this action right now.” (181212609) (FB23526663)
- Fixed: AppEntity instances have a cumulative size limit of 10MB, including all child properties and their values. Your app might crash if an entity exceeds this limit, and the exception is logged. (181763422)
- Fixed: The notes.appendText schema erroneously disappeared from the SDK. (182532125)

#### Known Issues
- If you adopt the Audio App Schema domain, you might have trouble playing your content using Siri. (177198033)
 Adopt an IntentValueQuery that takes the AudioSearch input, or index your entities in Spotlight.
- Existing entities that conformed to @AppEntity(schema: .photos.asset) in prior releases might no longer compile in the 27 SDKs because new properties were added to the schema in this release. (181800016) (FB23652582)
 To continue conforming to the schema, adopt the additional properties and move the code behind an availability check.

#### Deprecations
- The `calendar.deleteEvents` schema has been renamed to `calendar.deleteEvent`. (176751155)

### Siri (third-party-relevant entries only)

#### Resolved Issues
- Fixed: App Intents with `@UnionValue` types that accept a `PlaceDescriptorEntity` and a `String` always receive `String` values instead of `PlaceDescriptorEntity` entities. (176844035)

#### Known Issues
- “Ask Siri” might appear in context menus on macOS even when Siri is disabled in System Settings or the system is in a region that does not currently support Siri. (176299524)
- Non-SF Symbol custom images for entities might not appear in Siri results for third-party apps. (177984074)

### AppKit — menu item images
- In macOS 27.0, menu bar and context menus present a reduced set of menu item images, similar to the behavior prior to macOS 26.0. By default, `NSMenu` hides all menu item symbol images — non-symbol images remain visible. For menu items created from a xib file, `NSMenu` also observes the value of the “macOS 26.0 only” checkbox in the menu item inspector. If this checkbox is unchecked, the menu item image remains visible; if checked, it is hidden. These changes in menu item image visibility apply to applications linked on macOS 26.0 and later. Review the updated Human Interface Guidelines to determine which menu items in your app should still display images. Use the new `preferredImageVisibility` property on `NSMenuItem` to customize the image visibility for your menu items. As in macOS 26.0, `NSMenu` automatically provides default visible menu item images for certain common system-wide menu items, such as Settings, Share, and Print. (170477566)
- Fixed: For applications linked on the macOS 27 SDK, both symbol and non-symbol menu item images are now automatically hidden. For applications linked on earlier SDKs, non-symbol images remain automatically visible, preserving compatibility with existing application behavior. This change allows applications to rely on system behavior for determining menu item image visibility, regardless of whether an image is a symbol image or a non-symbol image. If necessary, applications should use the `preferredImageVisibility` API to ensure that menu item images remain visible. (179374305) (FB23070183)
- Fixed: For applications linked on SDKs prior to macOS 27, NSMenu now automatically shows menu item images if the menu item title and attributed title are both empty. This preserves existing application behavior when the image is the only representation of the menu item content. When linking against the macOS 27 SDK, these images will automatically be hidden; a menu with this design should use the `preferredImageVisibility` API to ensure that the menu item images remain visible. (179936632)

## Xcode 27 — https://developer.apple.com/documentation/xcode-release-notes/xcode-27-release-notes

Xcode 27 includes Swift 6.4 and SDKs for iOS 27, iPadOS 27, tvOS 27, watchOS 27, macOS 27, and visionOS 27. Xcode 27 supports on-device debugging in iOS 17 and later, tvOS 17 and later, watchOS 10 and later, and visionOS. Xcode 27 requires a Mac running macOS Tahoe 26.6 or later.

### App Intents

#### Resolved Issues
- Fixed: Siri might generate unexpected responses when attempting to trigger an AppShortcut phrase with an App enum value. (174869053)

### Intel Deprecation
- Build targets with a min deployment target set to macOS 27.0 or DriverKit 27.0 will not build Universal by default. The `ARCHS_STANDARD` build setting will no longer include x86_64 when `MACOSX_DEPLOYMENT_TARGET` or `DRIVERKIT_DEPLOYMENT_TARGET` >= 27.0. The x86_64 architecture can be added to the `ARCHS` build setting if this is needed. (161837535)
- Xcode 27 will only install and run on Apple silicon Macs. The macOS 27 SDK supports back deploying Universal (Intel and Apple Silicon) apps to macOS 12 and later. Intel development is still possible with macOS versions that support Rosetta like macOS 27. (162138432)

### Coding Intelligence (agent hooks Claude Code can use)
- The Xcode MCP server has been updated with new tools that allow agents to debug projects by manipulating the active run state, interacting with and reading the contents of the debugger console; listing and switching between available schemes and run destinations and inspecting and modifying build settings, compiler flags, entitlements, and Info.plist keys. (176935844)
- Xcode adds support for the Agent Client protocol. (178294840)
- Xcode 27 Beta 5 adds a preview of a new MCP server experience that runs without requiring an open Xcode workspace. This new experience also allows you to grant code-signed agents permission to use projects within a directory tree for extended periods of time without being asked for additional permissions.
You can turn this experience on by using `sudo xcrun mcp-server enable`. Check its state afterward with `xcrun mcp-server status`.
Developers running agents in unattended environments can approve all permissions upfront with `sudo xcrun mcp-server enable --unsafe-always-allow-all-agents`. This is not a recommended configuration for at-desk use.
In this early preview, some aspects of the `xcrun mcp-server` command line utility may not work in all configurations, and some settings or permissions may occasionally require relaunching Xcode or rebooting your machine to apply. (181836944)
