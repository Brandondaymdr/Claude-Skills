# Checklist — Next.js

- [ ] Next.js on a release patched for CVE-2025-29927; auth never enforced only in middleware.
- [ ] Every route handler and server action authenticates and authorizes on its own.
- [ ] No secrets in `"use client"` files or `NEXT_PUBLIC_` env vars.
- [ ] `dangerouslySetInnerHTML` only with sanitized content.
- [ ] Redirect targets restricted to same-origin paths.
- [ ] Security headers set (CSP, HSTS, frame-ancestors); check with Mozilla Observatory.
