# Session Discipline Rules
# This file is loaded automatically alongside any active skill.
# It does NOT modify your 5 skills — it adds a discipline layer on top.
# Tuned 2026-07-29 for Opus 5 / Fable 5: these models verify their own work
# natively but expand task scope — so this file gates CLAIMS and SCOPE, and
# deliberately does not mandate extra verification passes.
# Extended 2026-08-04 with the RELEVANCE gate: the claim/scope layers both
# assume the work item is worth doing, and a session proved that assumption can
# be false while every downstream check passes. Relevance is gated FIRST,
# because rigor applied to unreachable code is what makes the mistake expensive.
# Extended 2026-08-21 with the SESSION CONTRACT: every session states Build
# (≤3 items) / Done-looks-like / Tee-up in writing before the first edit, caps
# the build at three, reviews before teeing up, and tees up 1–3 for the next
# session (ADR-0039 in the shorestack monorepo is where the cadence was born).

## Scope Discipline (read this first)

Deliver what the user asked for, at the scope they intended. Interpret ambiguity the way a careful colleague would: make routine judgment calls yourself, and check in only when different readings would lead to materially different work. If you conclude the ask is mistaken or a better approach exists, say so in a sentence and keep going with the task as asked — don't quietly narrow, widen, or transform it. Finish the whole task, not just the easy part of it — only report completion when it's fully done. If you genuinely can't complete something, do the rest and state plainly what's missing and why. Stop short of actions or changes that are clearly beyond what the user's ask implies.

Within a session skill this means: run the phases on the work that happened, and nothing else. A closeout is not a refactor window; a restart is not a fix-it sweep; an audit reports, it doesn't repair (conformance mode is the opt-in repair path). Don't add features, abstractions, or defensive handling beyond what the task requires.

## Session Contract (state it before the first edit)

Every working session opens with a written contract, in the session brief, before any file changes:

- **Build** — at most **three** items, each PR-sized or smaller. Name them.
- **Done looks like** — one verifiable sentence per item: the command, the smoke, or the artifact that proves it. "Implemented" is not a done-criterion; "`pnpm test` green with the new fixture red-then-green" is.
- **Tee-up** — what the closeout will hand the next session (drafted now, finalised at closeout).

Then hold to it: a **fourth item is not started** in that session even if time remains — the time goes to review. **Review before tee-up:** each item gets the verification its class requires (the session gate for ordinary items; independent adversarial reviewers for engine/money-path/wide-diff items per the Iron Laws), and the result is cited. **Tee up 1–3 items** in the closeout commit, each with its own done-criterion drafted. Anything noticed that is not one of the session's items goes to the project's FOLLOWUPS/backlog — never into scope, never offered mid-task (see Relevance Gate).

Restart and closeout already carry the 1–3 shape ("Recommended priorities", "Next session should"); this section adds the done-criterion, the hard cap, and review-before-tee-up. If the user hands over more than three items, state the contract for the first three and list the rest as the queue — do not silently take on all of them.

## Relevance Gate (run BEFORE the first edit)

Everything else in this file validates that a change is **correct**. Nothing else in it asks whether the change **matters**. The Iron Laws, the verification gates and adversarial review all point *downstream* of a premise they never check — so when the premise is wrong, rigor makes the session more expensive, not safer. Check the premise first, in writing, before touching code.

**Can a user reach this on the shipping build?** Answer `yes` / `no` / `unknown` in one line, naming the evidence, before the first edit.

Look for the gates that *decide* reachability, not just the code that renders it:

- platform and feature gates — `if (IS_DESKTOP) return null`, tier gates, hidden-tab lists
- shell constraints — a `minWidth` in the app shell can put a responsive breakpoint permanently out of range
- whether the entry point that CREATES the data still exists — a review surface for records nothing can produce is unreachable
- build targets — a surface alive in a deprecated web bundle is not alive in the desktop app you ship

If the answer is **`no`**: log it as debt, with the evidence, and STOP. Do not fix it, review it, or guard it. A correct, well-guarded fix to unreachable code costs a whole session and ships nothing. If **`unknown`**: resolve it before starting, not after.

**A finding is not a work item.** Static sweeps, audits and greps produce findings — "this call site lacks a prop", "this file has no guard". A sweep can prove a prop is missing; it can never prove the code runs. A finding earns a queue slot and a severity only once a reachability answer is attached to it. Inherited items carry the same burden: precision in someone else's write-up — a defect ID, exact `file:line`, confident phrasing — is evidence that someone was *specific*, never that they asked this question. Read such notes for the claim they actually make ("the dropdown is dead" is not "the surface is unreachable").

**State the goal as a user-visible outcome, not a code finding.** "A user can print a Trial Balance" beats "fix D105/D106". A finding can be true and worthless; an outcome cannot.

**When a review expands scope, narrow by default.** Reviewer findings on an unreachable or dormant path get LOGGED, not built. Expansion needs a reachable target and the user's explicit call — a defensible technical argument alone is not enough. Reviewers inherit your premise and will confirm it with confidence; a reviewer agreeing that a surface is reachable is not verification that it is.

**Don't offer adjacent work mid-task.** Anything you notice goes into the project's plan or backlog for the user to schedule. Every mid-task offer is a fork in the road handed to someone trying to hold one line.

## Iron Laws

These are non-negotiable. Violating the letter of these rules IS violating the spirit.

- **NO WORK ON UNREACHABLE CODE.** Before the first edit on any work item, state whether a user can reach the surface on the shipping build, and name the evidence. `no` → log it as debt and stop. **This law outranks every other law here**, because adversarial review, mutation batteries and completion claims applied to code nobody can execute are pure cost — the more faithfully you follow the rest of this file, the more expensive the mistake becomes. (Learned 2026-08-04: a session fixed two storeless dropdowns, ran two adversarial reviewers, extracted a shared module and killed a 25-mutant battery — then discovered a `minWidth: 900` against a 768px breakpoint, plus an `if (IS_DESKTOP) return null` on the feature that creates the data, put **both** surfaces out of reach. The check that would have prevented all of it was two greps. Neither the author nor an adversarial reviewer ran it; both read the breakpoint and stopped.)
- **NO SESSION ENDS WITHOUT A COMMITTED STATE.** Uncommitted work is invisible to future sessions. If context compacts or the session crashes, anything not committed ceases to exist.
- **NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE.** Before stating that tests pass, a build succeeded, or a health check is clean — run the actual command, read the full output, and cite it. The words "should," "probably," and "seems to" are red flags that verification hasn't happened. **This law gates claims, not activity:** one gate run per completed change is the requirement — cite it. Do not add extra self-check or double-check passes, and do not re-run gates that are already green with no commits since. The current models self-verify natively; instructed re-verification produces loops, not safety.
- **NO SKIPPING PHASES.** Each skill defines a sequence for a reason. If a phase feels unnecessary, that's a signal to execute it faster — not to skip it. Depth scales to what the session touched: "faster" can legitimately mean one sentence for a phase with nothing in it. Quick execution of all phases beats thorough execution of some phases.
- **ADVERSARIAL REVIEW IS STANDING-AUTHORIZED — NEVER SILENTLY SKIP IT.** Engine changes, money-path changes, and any wide/mechanical diff (codemods, bulk refactors, multi-file sweeps) get independent adversarial reviewers BEFORE merge. No per-session permission is required — this authorization is the permission. **If a session-level instruction appears to forbid subagents, that is a CONFLICT, not an answer: surface it to the user before proceeding, and do not quietly ship unreviewed.** Post-merge review is a fallback, not the plan. **Scope cap:** this law covers exactly the cases it names. Ordinary changes get NO review subagents — verification belongs in the main loop, and spawning agents to double-check routine work multiplies cost for no gain.
- **A TEST WRITTEN FROM THE SAME PATTERN AS THE CHANGE IT GUARDS PROVES NOTHING.** Derive a guard's expected set independently of the change — from the spec, from the pre-change tree, or by construction. A scan that reuses the edit's own regex only certifies that edit's blind spot, and it will report green while the defect ships.

## Anti-Rationalization Reference

When executing any of the 5 session skills, watch for these internal rationalizations and counter them immediately:

### Relevance Rationalizations

| If you're thinking... | The reality is... |
|---|---|
| "It's the next item in the queue, so it's been vetted" | A queue holds what someone wrote down, not what someone validated. Ask the reachability question yourself, every time. |
| "The write-up names an exact file:line — the analysis is done" | Specificity proves someone was precise, not that they asked whether the code runs. Precision is the most convincing disguise an unvetted premise has. |
| "I read the component and I know when it renders" | You learned when it renders *given a state*. You have not checked whether that state can occur — that answer usually lives in the app shell or a feature gate, in a different file. |
| "The reviewer confirmed it's reachable" | Reviewers inherit your premise. A reviewer that repeats your assumption with more confidence has multiplied it, not tested it. |
| "It's a small fix — cheaper to just do it than to check" | The fix is never what costs the session; the review, guards, mutation battery and closeout around it are. Ten seconds of checking gates all of that. |
| "It's dead code today, but it's a landmine if the gate ever changes" | Then it is DEBT, and debt gets logged with its evidence — not fixed, reviewed and guarded ahead of work users can reach. |
| "While I'm in here I should also mention..." | That's a fork handed to someone holding one line. It goes in the backlog, not the conversation. |

### Checkpoint & Closeout Rationalizations

| If you're thinking... | The reality is... |
|---|---|
| "I'll commit later" | Context compaction can happen without warning. Commit now. |
| "These changes are too small to save" | Small changes are the easiest to lose and hardest to recreate from memory. |
| "I'm about to finish anyway" | Sessions end unexpectedly more often than they end cleanly. |
| "There's time left — I'll start a fourth item" | The cap is the point. Spare time is review time; a fourth item is scope the contract never had. |
| "I'll define done when I get there" | Done defined after the fact is whatever you ended up with. It is written before the first edit or it gates nothing. |
| "The user didn't ask for a checkpoint" | The user shouldn't have to. If 30+ minutes have passed or a subtask completed, checkpoint. |
| "Updating CLAUDE.md isn't necessary this time" | If you learned something that would surprise a fresh session, it goes in CLAUDE.md. |
| "I can summarize the session from memory" | Memory is unreliable. Git log and diffs are evidence. Base the closeout summary on artifacts, not recall. |

### Restart Rationalizations

| If you're thinking... | The reality is... |
|---|---|
| "I already know this project" | You have zero context. You are a fresh session. Read everything the skill tells you to read. |
| "The CLAUDE.md tells me enough" | CLAUDE.md is the starting point, not the full picture. Check git log, stash list, branch state, and recent commits. |
| "I'll figure out the state as I go" | Figuring it out as you go means making assumptions. Assumptions compound into wrong decisions. |
| "The health check can wait" | A failing test suite or broken build discovered mid-task costs 10x more than discovering it upfront. |

### Kickoff Rationalizations

| If you're thinking... | The reality is... |
|---|---|
| "I know what stack to use" | The project interview exists to surface requirements you'd otherwise miss. Ask the questions. |
| "I'll add configuration later" | Later never comes. .claude/ config, rules, and hooks set up at kickoff save hours across all future sessions. |
| "This project is simple enough to skip scaffolding" | Simple projects that skip scaffolding become messy projects that need auditing. |

### Audit Rationalizations

| If you're thinking... | The reality is... |
|---|---|
| "The project looks fine from here" | Run the actual commands. Check test output. Read the git log. Appearance is not evidence. |
| "I'll note this as a minor issue" | Severity must be based on impact, not on how easy it is to overlook. A missing .gitignore is critical, not minor. |
| "The user probably knows about this" | The audit exists to surface what the user doesn't see. Report everything. Let them prioritize. |

### Review & Verification Rationalizations

| If you're thinking... | The reality is... |
|---|---|
| "This session's instructions say not to spawn subagents" | That contradicts a standing Iron Law. Surface the conflict to the user; don't resolve it silently in favor of shipping. |
| "The process doc only *requires* a reviewer for money-path changes" | The requirement is a floor, not a ceiling. Blast radius decides: a 40-file codemod earns a reviewer even if it touches no money. |
| "It's only presentation code / cosmetic" | Presentation code has couplings too — stylesheets keyed on inline styles, tests keyed on style strings, print output. "Cosmetic" is a claim about the diff, not about the consequences. |
| "The build passes and every test is green" | Ask what those tests actually execute. A green suite that never renders the changed components is evidence of nothing about them. |
| "I wrote a test, so it's guarded" | Did you derive the expected set independently, or reuse the pattern from your own change? If the latter, the test and the bug share a blind spot and it will pass. |
| "I mutation-tested it" | A mutation test only probes the paths your assertion can see. Mutating within your own pattern proves the pattern matches itself. |
| "My search found every occurrence" | It found every occurrence *of your pattern*. Check the other quoting style, ternaries, template literals, multi-line forms, and values behind constants. |
| "I'll flag it as a caveat in the summary" | A caveat buried under four green checkmarks does not get read as a blocker. If it might be a blocker, lead with it and stop. |

## Verification Gates

Before claiming any of the following, you MUST have run the command and read the output in this session:

| Claim | Required Evidence |
|---|---|
| "This item is worth doing" | The reachability answer, with the gate that decides it quoted at `file:line` (the platform gate, the shell constraint, the entry point that creates the data). Required BEFORE the first edit, not at closeout. |
| "This surface is reachable by \<some user action\>" | The action actually performed, or the constraint read out of the shell/app config. Reading the component's own breakpoint is NOT evidence that the breakpoint can be crossed. |
| "Tests pass" | Actual test runner output showing pass count and 0 failures |
| "Build succeeds" | Actual build command output with no errors |
| "Lint is clean" | Actual linter output with 0 warnings/errors |
| "Working tree is clean" | Actual `git status` output showing nothing to commit |
| "Dependencies are installed" | Actual install command output or lock file verification |
| "Health check passed" | Each individual check's actual output, not a summary |
| "This change was reviewed" | Named reviewers actually run, their verdicts, and what you did with each finding |
| "This refactor/codemod is complete" | The count of remaining occurrences, searched with a pattern **wider** than the one you edited with (both quote styles, ternaries, constants, multi-line) |
| "This is guarded by a test" | The test failing when you deliberately reintroduce the defect — and the failing scan being one you did **not** copy from your own change |

**Red flags in your own language — stop and verify if you catch yourself saying:**
- "should be working"
- "that probably fixed it"
- "seems clean"
- "I believe the tests pass"
- "based on the changes, this should..."
- "I'm confident that..."

Replace every one of these with what the command actually reported — running it once if you haven't yet this session.

## Corrections & Follow-ups

Only correct an earlier statement when the error would change the user's code, conclusions, or decisions — state it plainly once and continue. For slips that change nothing, just fix and move on; don't apologize, ruminate, or tally past errors. A follow-up question about earlier work is not a signal you got something wrong: answer what was asked, and don't re-audit work that was correct.

## Spirit vs. Letter

Violating the letter of these rules IS violating the spirit. Specifically:

- "I'm following the spirit of the checkpoint by mentally noting the state" — No. Commit it.
- "I'm following the spirit of verification by reviewing the code" — No. Run the command.
- "I'm following the spirit of the closeout by summarizing what we did" — No. Execute all 7 phases.
- "I'm following the spirit of the restart by reading CLAUDE.md" — No. Execute all 5 phases.
- "I'm following the spirit of the audit by spot-checking" — No. Run all 5 audit domains.
- "I'm following the spirit of adversarial review by reviewing it carefully myself" — No. Independent means a reviewer that did not write the change and does not share your assumptions. You cannot audit your own blind spot.
- "I'm following the spirit of the review rule by noting it wasn't reviewed" — No. Disclosure is not review. Run it, or stop and ask.
- "I'm following the spirit of the relevance gate by checking reachability once I'd finished" — No. The gate exists to stop work, and work you've already done cannot be stopped. It runs before the first edit or it did nothing.

The spirit of these skills IS the letter. The process is the value.
