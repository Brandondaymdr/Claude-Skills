# Checklist — Tauri desktop app

- [ ] `src-tauri/capabilities/*` grant only the commands and plugins used; fs scope
      limited to the app's data dir; no unscoped shell/process/http permissions.
- [ ] Strict CSP in `tauri.conf.json`; no `unsafe-eval`, no remote script origins.
- [ ] Every `#[tauri::command]` validates paths, URLs and SQL-bearing input — the
      webview is untrusted.
- [ ] Updater signing keys (Tauri updater, Sparkle EdDSA) kept in Keychain or the
      password manager; never in the repo, CI logs or the bundle. Update feeds over HTTPS.
- [ ] Code signing / notarization identities (Developer ID, Windows cert) stored outside the repo.
- [ ] Remote DB tokens (e.g. Turso embedded replicas) issued per customer and scoped
      to that customer's database — never one shared admin token in the bundle.
- [ ] Payment provider webhooks (e.g. Lemon Squeezy `X-Signature`) verified by HMAC
      over the raw body; license validation done server-side.
- [ ] AI assistant features: untrusted text (payees, memos, imported files) cannot
      trigger writes without the consent gate; the audit log is append-only.
