# Layer 0 — accounts

Code checks are worthless if someone can sign in as you. Do this once, then
re-check quarterly.

- [ ] Passkey (preferred) or authenticator-app 2FA — never SMS — on: GitHub,
      Supabase, Anthropic Console, Apple Developer, Lemon Squeezy, Shopify, n8n,
      Google Workspace, Slack, domain registrar, DNS provider, Vercel/Netlify or
      wherever apps deploy.
- [ ] Recovery codes stored in the password manager, not on the Mac's desktop.
- [ ] GitHub: Settings → Developer settings. Delete unused tokens; replace classic
      tokens with fine-grained ones scoped to named repos, with an expiry.
- [ ] GitHub: Settings → Applications. Revoke OAuth apps and GitHub Apps no longer used.
- [ ] Anthropic: one API key per business for CI (Days LLC, Crowded Barrel, SAI),
      each with a monthly spend limit, so a leaked key has a ceiling and a clear owner.
- [ ] Supabase: dashboard MFA enforced for the org; leaked-password protection on.
- [ ] Note each long-lived key's rotation date in the password manager.
