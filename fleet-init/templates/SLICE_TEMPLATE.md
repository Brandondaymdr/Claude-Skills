# {{SLICE_PREFIX}}-NNNN: <short imperative title>

<!-- Copy this file to slices/{{SLICE_PREFIX}}-NNNN-short-name.md and fill in.
     Then add an entry to BUILD_QUEUE.md with status: ready -->

## Status

`ready` <!-- ready | claimed | in_review | validated | flagged | merged | done | failed -->

## Why this slice exists

<!-- One paragraph. What problem does this solve? Why now?
     A builder agent reads this to ground its decisions when the spec leaves something open. -->

## Acceptance criteria

<!-- 3-5 specific, testable bullets. The validator answers "yes" or "no, here's the gap"
     for each one. Vague criteria = vague code. Be ruthless here.

PITFALLS LEARNED FROM PILOT EXPERIENCE (review before writing ACs):

* DELETION SLICES — If asked to remove/delete content (e.g., a list item from a
  Pending list, a deprecated function, etc.), AC must say "delete the line/file
  entirely; do not strikethrough, annotate as 'filed', or preserve via comments."
  Builders default to preserving information via strikethrough — be explicit if
  you want it gone.

* ERROR-HANDLING SLICES — If the AC mentions "on failure", enumerate each
  distinct failure mode (non-zero exit, zero-exit-with-empty-output, timeout,
  malformed input, etc.). Builders only handle the cases you spell out.

* TESTABILITY — Each AC must be answerable as pass/fail by reading the diff +
  running one specific command. "Code is well-structured" is not testable;
  "function X has a test that exercises path Y and asserts result Z" is.

* FACTUAL CLAIMS — If an AC requires the deliverable to state a fact about the
  codebase (e.g. "Decision section says component uses pattern X"), VERIFY THE
  FACT YOURSELF before writing the AC. The pilot lost a re-validation cycle
  because an AC required claiming a library that wasn't actually a dependency.

* COMMIT HASH REFERENCES — Never hardcode commit hashes inside AC bodies if
  you're not 100% certain they're correct. Builders treat the AC body as
  source of truth and will parrot whatever hash you wrote, even if the
  FACTUAL CLAIM rule above tells them to verify. Prefer "reference the commit
  that introduced X" or "the most recent commit touching Y" and let the
  builder run `git log --follow` to find it. A wrong hash in an AC made it
  all the way through builder + validator in the pilot and only got caught
  at human-review time.

* SCOPE — Builder uses git add . on completion. Tell them explicitly which
  paths to include and exclude. Never ask builder to modify .fleet/* files —
  those are managed by Fleet's dispatcher and validator.
-->


- [ ] AC1: <a behavior the user can observe, OR a specific test that must pass>
- [ ] AC2: ...
- [ ] AC3: ...

## Files in scope

<!-- List the files this slice is allowed to touch. The builder is told NOT to modify
     anything outside this list (except creating new files in adjacent locations).
     If you don't know yet, say "unknown — builder may discover" but expect higher
     validator rejection rates. -->

- `src/...`
- `src/...`
- New: `src/...`

## Files out of scope

<!-- Any file/dir Fleet must not touch beyond the global forbidden_paths in CONFIG.yaml.
     Useful for protecting in-flight work. -->

- _(none beyond forbidden_paths)_

## Test plan

<!-- How does the validator confirm this works?
     Should be runnable from a fresh checkout: `{{INSTALL_CMD}} && {{CHECK_CMD}}`. -->

- Unit test: `{{TEST_CMD}} src/path/to/test.ts` should pass
- Lint+typecheck: `{{CHECK_CMD}}` should pass
- Manual smoke (validator skips this; user does in PR review): _(if any)_

## Dependencies

<!-- Other slice IDs that must be `done` before this can start. Dispatcher honors. -->

- _(none)_

## Estimated effort

- Token budget: <small | medium | large>  <!-- small = ~10k, medium = ~25k, large = ~50k -->
- Wall clock estimate: <minutes>

## Notes / context

<!-- Any extra context: links to related ADRs, prior PRs, known gotchas from CLAUDE.md
     that apply here. The more concrete, the better the agent's output. -->
