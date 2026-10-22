# Layer 3 — deep audit (Cloudflare security-audit skill)

Use before every launch and quarterly on Tier 1. It is slow and token-heavy by
design: isolated agents map the architecture, hunt by attack class, and a fresh
agent tries to disprove each candidate before it is reported.

## Install (once per Claude config dir)

```bash
npx skills add https://github.com/cloudflare/security-audit-skill --skill security-audit --global
```

For the SAI account see `sai-account.md` (the install may land only in `~/.claude`).

## Run

1. Open Claude Code in the repo with the sandbox on and network access off. The
   skill only executes target code (builds, tests) inside an OS-enforced sandbox;
   without one it keeps those leads as `needs_validation` instead of confirming them.
2. Prompt: `security audit this codebase`. Output goes to
   `~/security-audit-skill/<repo>/run-N` — outside the repo. Never point it at a
   tracked folder.
3. Run it 2–3 times. Runs are additive (later runs target gaps from earlier
   ledgers), and one run typically finds about half of what repeated runs find.

## Triage

- `confirmed` → one GitHub issue each, labelled `security`; fix before launch.
  Every fix gets a regression test per the golden path.
- `needs_validation` → check the named unresolved fact by hand; promote or reject.
- `rejected` → nothing to do; kept so later runs don't re-hunt it.
- Hardening notes ("defense-in-depth gaps") are not vulnerabilities; batch them
  into the repo's backlog.

## Order for the first pass

Highest-risk first: the paid desktop app, the shared production database monorepo,
student/visa data, payroll, then e-commerce integrations.
