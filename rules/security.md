# Security Rules
# Loaded alongside every session (symlinked into ~/.claude/rules/ on each machine
# and into ~/.claude-sai/rules/ for the SAI account). Source:
# Brandondaymdr/Claude-Skills rules/security.md. Pairs with the security-baseline skill.

These apply to all code you write or change, in every repo.

1. **No secrets in code or git.** Never write keys, tokens or passwords into source,
   tests, fixtures, docs or commit messages; never commit `.env` files. Use the
   app's existing secrets path. If you spot a committed secret, stop and tell the
   user — it must be rotated, not just deleted.
2. **RLS ships with the table.** Every new Supabase/Postgres table in an exposed
   schema gets `ENABLE ROW LEVEL SECURITY` and its policies in the same migration.
3. **Verify webhooks first.** Every webhook or callback handler verifies the
   sender's signature over the raw body before parsing or acting on it.
4. **Authorize every record access.** Any handler that loads, updates or deletes a
   record by ID checks the caller owns it or holds the required role. Never trust
   user_id, role, tenant or price fields from the client.
5. **Server secrets stay server-side.** Nothing privileged in client bundles,
   desktop/mobile apps, or env vars with public prefixes (`NEXT_PUBLIC_`, `VITE_`).
6. **Untrusted text can't drive tools.** Content from users, emails, documents or
   the web never triggers writes or tool calls without a human approval step.
7. **Review before PR on Tier 1.** Run `/security-review` on the pending changes
   before opening a PR in a Tier 1 repo (`.claude/tier` = 1), and fix what it finds.
