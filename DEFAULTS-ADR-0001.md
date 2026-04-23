# ADR 0001: Foundational Defaults for project-template

Date: 2026-04-23
Status: Accepted
Scope: `Brandondaymdr/project-template` and all projects scaffolded from it

## Context

The developer-transition plan calls for a template repo with three variants (web-next-supabase, desktop-tauri, node-lib). Before building the template, the open questions from Phase 2 of that plan need locked answers so every variant inherits the same defaults and future projects don't relitigate them.

This ADR resolves those defaults. It's ADR 0001 of `project-template` itself, and it's the reference doc that the updated session skills (`/project-kickoff`, `/folder-forensic-audit`, etc.) enforce downstream.

## Decisions

### 1. Package manager: **pnpm**

Reasoning: faster than npm, deterministic, content-addressed store (disk-efficient across 25+ projects), first-class monorepo support via workspaces. npm works but is slower and has worse hoisting behavior. Bun is tempting but ecosystem still catching up — not worth the sharp edges for Tier 1 money-touching code.

**All three template variants use pnpm.** Lock `"packageManager"` in `package.json`. CI installs via `pnpm install --frozen-lockfile`.

### 2. Test runner: **Vitest**

Reasoning: native ESM, fast, Jest-compatible API (so copy/paste from Jest tutorials works), first-class TypeScript support with zero config, works identically in Node and browser modes. Jest is fine but slower and requires `ts-jest` or Babel shenanigans. For Tauri + React, Vitest is the clear winner.

**All three variants use Vitest.** Common config in `vitest.config.ts`, extended per variant.

### 3. Eval framework: **Roll your own, code-graded**

Reasoning: Harper's gross-to-net calc must be exact to the penny — that's code-graded (deterministic), not LLM-graded. promptfoo is fine for LLM-graded rubrics but adds a dependency and opinionates the workflow. For this use case: JSONL dataset → TS runner → compare against expected → score + threshold JSON.

**Pattern:**
```
evals/
├── datasets/           # JSONL files with inputs + expected outputs
├── runners/            # TS files that execute the agent and score
├── rubrics/            # LLM-graded checks (optional, for UX/tone only)
├── history/            # Committed eval run JSON results
├── threshold.json      # { "score": 0.95 } — CI fails below this
└── README.md
```

LLM-graded rubrics are only for subjective checks (tone, coherence). Never for money math. Never for anything with a ground-truth answer.

### 4. Commit tooling: **Husky + lint-staged + commitlint (all three)**

Reasoning: local enforcement is faster feedback than CI. If a bad commit ships to CI, you've already wasted 2–5 minutes. Husky runs the hooks, lint-staged formats only changed files (fast), commitlint rejects bad commit messages *before* the commit lands.

**Stack:**
- Husky — git hook runner
- lint-staged — runs Prettier + ESLint on staged files
- commitlint (with `@commitlint/config-conventional`) — validates commit message format
- `.husky/pre-commit` → `lint-staged`
- `.husky/commit-msg` → `commitlint --edit $1`

CI also runs the same checks as a belt-and-suspenders backstop.

### 5. ADR numbering: **Zero-padded (0001, 0002, ...)**

Reasoning: sorts correctly in `ls`, file tree views, and GitHub. Standard community convention. Four digits gives headroom for 9999 decisions which is more than enough.

**Format:** `docs/decisions/0001-short-kebab-slug.md`

### 6. Branch naming: **Matches commit types**

Reasoning: consistency — if you know conventional commits, you know branch prefixes.

**Prefixes:**
- `feat/` — new feature
- `fix/` — bug fix
- `chore/` — tooling/maintenance
- `docs/` — docs-only change
- `refactor/` — restructuring without behavior change
- `test/` — tests only
- `perf/` — performance improvement
- `experiment/` — throwaway work, never merged

**Format:** `feat/short-kebab-description` (e.g., `feat/gross-to-net-agent`).

### 7. Release strategy: **Context-dependent**

- **Libraries (node-lib variant):** SemVer (`1.2.3`). Published, consumed by others, so backward-compat signals matter.
- **Internal tools and automations:** CalVer (`2026.04.23`). Dates are more informative than arbitrary numbers when you're the only consumer.
- **Private apps (Harper, Shorestack Books, etc.):** No formal versioning. Use git SHA + deploy date. Tagged releases only for production deploys.

Each project's ADR 0002 records which scheme it uses.

### 8. Self-review discipline: **10-minute cool-down + re-read**

Reasoning: the review muscle needs training. Solo developers who self-merge instantly never develop it. A mechanical delay forces fresh eyes.

**Mechanics:**
- After opening a PR, wait 10 minutes before self-merging.
- During the wait: context-switch (walk, water, another task — not the same PR).
- Re-read the diff from top to bottom before merging.
- CI job `pr-age-check` enforces it: compares PR opened-at to merge attempt time, fails if <10 minutes.

**Exception:** `chore(deps):` PRs from Dependabot and `docs:` PRs can merge immediately if CI is green. Those are low-risk.

### 9. Pre-commit hooks: **Husky + lint-staged + commitlint** (same as Decision 4)

Already covered. Listed separately because the plan called it out as an extra.

### 10. Dependency updates: **Dependabot** (GitHub-native)

Reasoning: zero-config alternative to Renovate. PRs grouped by ecosystem. Runs weekly. CI validates the update. `chore(deps):` commits are exempted from the 10-min cool-down so you can merge them fast.

**Config (`.github/dependabot.yml`):**
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    groups:
      dev-dependencies:
        dependency-type: "development"
      production-dependencies:
        dependency-type: "production"
        update-types: ["minor", "patch"]
```

Major version bumps are NOT grouped — each requires its own ADR (breaking-change implications).

### 11. Secret scanning: **gitleaks in CI + pre-commit**

Reasoning: one leaked secret in git history ruins your week. gitleaks runs in CI on every PR and as a Husky pre-commit hook locally.

**CI step** (`.github/workflows/ci.yml`):
```yaml
- name: Scan for secrets
  uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Pre-commit** (`.husky/pre-commit`):
```bash
gitleaks protect --staged --verbose --redact
```

### 12. Observability: **Sentry for errors + PostHog for product** (Tier 1 only)

Reasoning: money-touching code needs error visibility. Sentry for stack traces and alerting. PostHog for product events and feature flags (doubles as a light analytics tool so you don't need separate GA/Mixpanel).

**Not required for Tier 2/3.** Tier 2 can add Sentry later if incidents happen.

Each Tier 1 project gets ADR 0003 titled `0003-observability-stack.md` documenting the integration.

### 13. `DECISIONS.md` index

Reasoning: once you have 20 ADRs, finding the one you need is painful. The index is a scannable one-line-per-ADR list kept at `docs/decisions/DECISIONS.md`.

**Format:**
```markdown
# Decision Index

| # | Title | Status | Date |
|---|---|---|---|
| 0001 | Foundational defaults | Accepted | 2026-04-23 |
| 0002 | Tauri v2 over Electron | Accepted | 2026-04-24 |
| 0003 | Sentry + PostHog observability | Accepted | 2026-04-25 |
```

Updated in the same PR as the ADR itself. `/session-closeout` prompts you to update it when a new ADR lands.

### 14. `WORKFLOW.md` golden path

Reasoning: every template includes a one-page doc that shows concretely what "work on a feature" looks like end-to-end. Lives at `docs/WORKFLOW.md`. This is the doc you re-read when you forget the workflow six months in.

Content covered in a separate file.

## Consequences

**Easier:**
- Every new project starts with identical, decided defaults — zero decision fatigue per project.
- Retrofits have a clear target: "match the template."
- `/project-kickoff` can just clone and go.
- Self-review cool-down catches bugs that would ship otherwise.
- gitleaks prevents the nightmare scenario (committed API keys).

**Harder:**
- Any future divergence from these defaults requires its own ADR explaining why. Good — forces deliberate reasoning.
- Dependabot noise (weekly PRs). Mitigated by grouping + auto-merge on dev-deps once CI green.
- The 10-min cool-down feels slow at first. That's the point.

**Gave up:**
- Per-project flexibility on tooling choices. This is actually a win for a solo developer with 25+ projects — consistency beats local optimization.
- Bun, Deno, and other shinier ecosystems. Revisit in 12 months.

## Revisit triggers

Supersede this ADR if:
- pnpm tooling ecosystem significantly regresses or a dramatically better alternative emerges.
- Vitest gets deprecated or Jest fully catches up on TS/ESM DX.
- A project's needs genuinely require LLM-graded evals for ground-truth cases (they shouldn't, but check).
- Dependabot stops working for a use case (monorepo edge cases).

Otherwise, leave it alone. Stability is the feature.
