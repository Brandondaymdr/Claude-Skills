# Fleet Init — Parameter Substitution Contract

Every template under `templates/` contains placeholders in `{{DOUBLE_BRACE}}` form. To render a usable Fleet setup for a new project, every placeholder below must be replaced with a concrete value. This document is the single source of truth for the parameter set.

Placeholders are case-sensitive and intentionally chosen to never collide with bash variables, YAML keys, Markdown syntax, or Liquid/Jinja escapes. The `{{...}}` form is also visually distinct so missed substitutions are obvious during review.

## Parameter table

| Placeholder | Purpose | Example (barrel-tracking) | Example (sibling: Cheersworthy) | Notes |
|---|---|---|---|---|
| `{{PROJECT_NAME}}` | Short project identifier; appears in CONFIG, plist labels, log lines. | `barrel-tracking` | `cheersworthy` | Lowercase, kebab-case, no spaces. Often equals `{{GITHUB_REPO}}` but kept separate so a project can be renamed without changing its GitHub identity. |
| `{{GITHUB_OWNER}}` | GitHub user or org that owns the repo. | `Crowded-Barrel` | `daysllc` | Used in PR URLs and `gh` CLI commands. |
| `{{GITHUB_REPO}}` | GitHub repository slug. | `barrel-tracking` | `cheersworthy` | The part after `/` in the GitHub URL. |
| `{{WORKDIR}}` | Absolute filesystem path to the project's local clone on the host running Fleet. | `~/Projects/crowded-barrel/barrel-tracking` | `~/Projects/cheersworthy` | Use tilde-expanded paths. The LaunchAgent invokes scripts from here. |
| `{{BASE_BRANCH}}` | The trunk branch Fleet PRs target. | `main` | `main` | Almost always `main` but configurable for repos that still use `master` or `trunk`. |
| `{{BRANCH_PREFIX}}` | Prefix applied to Fleet-created branches. | `fleet/` | `fleet/` | Include the trailing slash. Differentiates Fleet branches from human branches. |
| `{{SLICE_PREFIX}}` | Slice ID namespace. Each project picks one at bootstrap; never collides across projects. | `FLEET` | `CW` | Short uppercase token. Becomes the literal prefix in `BUILD_QUEUE.md` rows, slice spec filenames (`slices/{{SLICE_PREFIX}}-NNNN-*.md`), and PR titles (`[FLEET]` / `[CW]`). |
| `{{ORG_TAG}}` | Reverse-domain organization tag used in macOS LaunchAgent plist labels. | `daysllc` | `daysllc` | Combines with project / slice prefix to form `com.{{ORG_TAG}}.fleet.{{SLICE_PREFIX}}.dispatcher`. Doesn't have to match any real domain; just be globally-unique-ish so plists don't collide on a multi-project host. |
| `{{OPERATOR_NAME}}` | Human operator's first name, used in prose docs (optional). | `Brandon` | `Brandon` | Omit / leave generic if you'd rather not bake a name into the skill output. |
| `{{PACKAGE_MANAGER}}` | The project's package manager binary name. | `pnpm` | `pnpm` | Used in prose docs; the actual command placeholders below let you override per-command. |
| `{{INSTALL_CMD}}` | Install dependencies. | `pnpm install` | `pnpm install` | Used by the builder prompt when describing how to verify the project builds. |
| `{{TEST_CMD}}` | Run the test suite. | `pnpm test` | `pnpm test` | |
| `{{LINT_CMD}}` | Lint the project. | `pnpm lint` | `pnpm lint` | |
| `{{TYPECHECK_CMD}}` | Run type checks (if applicable). | `pnpm typecheck` | `pnpm typecheck` | For non-typed projects, set to a no-op like `true`. |
| `{{CHECK_CMD}}` | Combined pre-commit verification (typically lint + typecheck + test). | `pnpm check` | `pnpm check` | The single command builders run before opening a PR. If the project doesn't have one, set to `{{LINT_CMD}} && {{TYPECHECK_CMD}} && {{TEST_CMD}}`. |
| `{{BUILD_CMD}}` | Production build. | `pnpm build` | `pnpm build` | |
| `{{FORMAT_CMD}}` | Format code in-place. | `pnpm format` | `pnpm format` | |
| `{{FORMAT_CHECK_CMD}}` | Verify formatting without writing. | `pnpm format:check` | `pnpm format:check` | |
| `{{TIMEZONE_LABEL}}` | Human-readable timezone label used in operational log timestamps and closeout filenames. | `America/Chicago (CT)` | `America/Chicago (CT)` | The host's local timezone where Fleet runs. |
| `{{HOME}}` | The operator's macOS home directory (used in LaunchAgent plists' `HOME` env var). | `/Users/brandonday` | `/Users/brandonday` | DERIVED — set automatically by the render procedure via `echo $HOME` on the host where Fleet will run. Do NOT prompt the operator for this; it's whatever shell `$HOME` resolves to on the target machine. |

## Rendering procedure

To render templates into a usable `.fleet/` directory for a new project, the operator runs (manually or via the `fleet-init` skill's procedure):

1. Collect concrete values for every placeholder above by interviewing the operator about the target project.
2. Walk every file under `templates/` and substitute. A simple bash loop using `sed` works for most cases:
   ```bash
   for f in "$@"; do
     sed -i.bak \
       -e "s|{{PROJECT_NAME}}|$PROJECT_NAME|g" \
       -e "s|{{GITHUB_OWNER}}|$GITHUB_OWNER|g" \
       -e "s|{{GITHUB_REPO}}|$GITHUB_REPO|g" \
       ... \
       "$f"
   done
   ```
3. After substitution, `rg '\{\{[A-Z_]+\}\}'` against the rendered tree MUST return zero matches. Any remaining `{{...}}` token is a missed substitution and the bootstrap should abort.

## Forbidden-path defaults

`CONFIG.yaml.template` ships with a placeholder forbidden-paths list that callers should review and adjust for their stack. The barrel-tracking values (`supabase/migrations/`, `.github/workflows/`, `.env*`, `CLAUDE.md`) work as sane defaults for most TypeScript + Supabase projects, but a sibling project's stack may differ — e.g. a Shopify Dawn theme should add `assets/` and `sections/*.liquid` to its forbidden list if those are human-curated.

## Adding new parameters

When a new placeholder is needed:
1. Add a row to the table above with all four columns (placeholder, purpose, two examples, notes).
2. Use it in at least one template file (a placeholder no template references is dead code).
3. Update the `fleet-init` SKILL.md's "collect parameters" interview step to prompt for it.
4. If it has a sensible default, document the default in the Notes column and explicitly use that default in the substitution loop.

## Validation

Before declaring a render successful, the `fleet-init` skill runs these checks:
- `rg '\{\{[A-Z_]+\}\}' .fleet/` returns zero matches (no unsubstituted placeholders).
- `.fleet/CONFIG.yaml` is valid YAML (`yq . .fleet/CONFIG.yaml` exits 0).
- `.fleet/bin/*.sh` are executable (`test -x` for each).
- LaunchAgent plists are valid plist XML (`plutil -lint` exits 0 for each).
- The two prompt files contain no `barrel-tracking` / `Crowded-Barrel` / `daysllc` literals (a regex grep for those tokens MUST return empty — they would indicate a leak from the source project).
