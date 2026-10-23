# Checklist — Supabase / Postgres

- [ ] RLS on every table in every API-exposed schema. Find gaps:
      `select schemaname, tablename from pg_tables where not rowsecurity and schemaname not in ('pg_catalog','information_schema');`
- [ ] Every RLS-enabled table has at least one policy, and no policy is `using (true)`
      on data that isn't public.
- [ ] Materialized views (can't have RLS) live outside exposed schemas, or are read
      only through a function that checks the caller.
- [ ] Views set `security_invoker = true`.
- [ ] API settings expose only the schemas clients need; key/secret stores are not exposed.
- [ ] `SECURITY DEFINER` functions `SET search_path = ''` (or a fixed path) and
      `REVOKE EXECUTE ... FROM anon` unless deliberately public.
- [ ] service_role key only in server code / edge functions — grep bundles and
      `VITE_` / `NEXT_PUBLIC_` env vars.
- [ ] Text-to-SQL / dynamic SQL runs as a read-only role that RLS applies to, with
      a statement timeout and no DDL.
- [ ] Storage buckets holding private files are private; policies scope by owner.
- [ ] Supabase Security Advisor: zero errors.
