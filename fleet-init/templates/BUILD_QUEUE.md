# Build Queue — {{PROJECT_NAME}}

The dispatcher reads this file every cron run, picks the first slice with status `ready` whose dependencies are all `done`, marks it `claimed`, and spawns a builder. The validator reads `in_review` rows.

**This file is the dashboard.** Slice specs themselves live in `slices/{{SLICE_PREFIX}}-NNNN-*.md`.

## Status legend

| Status      | Meaning                                                          |
|-------------|------------------------------------------------------------------|
| `ready`     | Picked next when dependencies clear                              |
| `claimed`   | Dispatcher claimed it; builder is running                        |
| `in_review` | Builder finished, draft PR open, validator hasn't run yet        |
| `validated` | Validator passed; ready for human review and merge               |
| `flagged`   | Validator found gaps; needs human attention before merge         |
| `merged`    | PR merged to {{BASE_BRANCH}}                                     |
| `done`      | Verified working in production (you mark this manually)          |
| `failed`    | Builder/validator gave up; moved to graveyard                    |

## Slices

<!-- Add slice rows below. Format:
| {{SLICE_PREFIX}}-NNNN | <title> | <status> | <depends_on> | <pr_url> | <notes> |

Example:
| {{SLICE_PREFIX}}-0001 | Tests for src/lib/foo.ts                          | ready  | —          | —  | small ~10k, no risk             |
-->

| ID                  | Title                                                  | Status | Depends on | PR | Notes                              |
|---------------------|--------------------------------------------------------|--------|------------|----|------------------------------------|

## Updating this table

- **Adding a slice**: append a row with status `ready`. Make sure the spec file `slices/{{SLICE_PREFIX}}-NNNN-*.md` exists.
- **Manually re-running a failed slice**: change status from `failed` to `ready`. Add a note about what changed.
- **Permanently retiring a slice**: change status to `done` or remove the row entirely (and move spec to `slices/archive/`).

## Operator workflow

Operator-driven changes to this file (manual status fixes, refilling the queue with new `ready` slices, retiring obsolete rows) happen via the standard operator-commit workflow:

1. `{{WORKDIR}}/.fleet/bin/fleet-control.sh pause` — stop the LaunchAgents so cron-tick doesn't race for the index lock
2. Edit this file
3. `git add .fleet/BUILD_QUEUE.md && git commit && git push`
4. `{{WORKDIR}}/.fleet/bin/fleet-control.sh resume`

See `docs/decisions/ADR-013-*.md` in the source project for the rationale (operator-owned `.fleet/*` files).
