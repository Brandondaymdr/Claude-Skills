# iOS / Apple release rhythm

For apps that ship a native iOS binary (Capacitor, React Native, or full
native) and/or an installable PWA. The goal: Apple's annual cycle should be
a series of planned, boring sessions — never a September surprise when
customer phones auto-update.

## Why hybrid shells make this easier

A Capacitor/WebView shell that loads the production URL means most changes
ship via the web with zero App Store involvement. The binary only matters
when iOS itself, the WebView (WKWebView), native plugins (camera, GPS,
push), or build tooling change. That reduces Apple work to one predictable
annual cycle plus occasional smoke tests. React Native sits in between; full
native apps need the whole cycle for every feature.

## The annual cycle

### June — WWDC / beta drops

- Apple announces the new major iOS; developer betas ship immediately.
- Install the beta on a spare device or the new Xcode's simulator.
- Smoke-test the **native-bridge paths specifically** — this is where iOS
  updates actually break hybrid apps: camera capture, GPS/geolocation
  permission flows, push notification registration, file pickers,
  `datetime-local` and other form inputs (Safari has repeatedly changed
  these), and the service-worker/PWA install path for non-native users.
- Watch the framework's compatibility notes (Capacitor blog / React Native
  releases) — they publish iOS-readiness guidance within weeks of the beta.

### September — public release

- Customer/employee phones auto-update whether you're ready or not. The
  June pass is what makes this a non-event.
- Re-run the smoke test on a real updated device within the first week.

### The annual rebuild (once a year, around the iOS release)

Ship one fresh binary per year even with zero feature changes:

1. **Update Xcode.** Apple raises the minimum SDK required for App Store
   submissions every spring (announced the prior fall) — a stale Xcode
   eventually gets uploads rejected outright.
2. **Bump the framework major if needed** (e.g.
   `npm i @capacitor/core@latest @capacitor/ios@latest && npx cap sync ios`).
   Framework majors track iOS majors; read the migration guide first.
3. **Watch for regenerated-project pitfalls**: if the native project folder
   is regenerated, privacy strings (camera/photos/location usage
   descriptions) must be re-added or the app crashes at permission time and
   review rejects it. Keep a list of these in the repo's native-app guide.
4. Archive, bump the build number, upload, submit. Icon-only or rebuild-only
   changes typically clear review in ~24h.

### Point releases (iOS x.1, x.2 …)

Usually harmless for WebView apps. One smoke test on one updated phone. If
something breaks it's almost always fixable web-side (deploy + service-worker
bump) without touching the binary.

## Distribution notes for internal/small-business apps

- **TestFlight** builds expire every 90 days — fine for validation, a
  perpetual re-upload chore for production. Graduate off it.
- **Unlisted App Store distribution** (link-only, not searchable) is the
  sweet spot for single-business apps: normal review, no expiry, installs
  update in place over TestFlight builds (same bundle ID). Request it via
  Apple's form — and expect review to reject a *public* submission of a
  clearly single-business app under Guideline 3.2 until the unlisted request
  is approved, so sequence the unlisted request first.
- **Review playbook**: provide working demo credentials in the review notes
  (e.g., a test PIN with an explanation). If the app has a geofence or
  similar physical-presence gate, disable it during review and re-enable
  after approval — a reviewer who can't get past the front door rejects.
- Apple Developer membership renews annually; a lapsed membership pulls the
  app from the store. Put it on the monthly store-check.

## PWA / service-worker corollary

If the app is installable as a PWA, the service-worker cache version must be
bumped on every meaningful UI change or installed users keep the stale
bundle indefinitely. Put "bump CACHE_NAME" in the deploy checklist, scoped
to whichever routes the SW actually caches. The matching gotcha: manifest
`theme_color`/`background_color` are read at install time by Android — keep
them in sync with the app's chrome when rebranding.

## Android (usually secondary for this app profile)

Direct-distribution APKs or Play Store follow the same logic on a looser
clock: annual rebuild with current SDK (Play has its own minimum-target-SDK
deadlines each year, typically August), icons/manifest regenerate from the
same source assets, and the WebView auto-updates via Play so point releases
rarely bite.
