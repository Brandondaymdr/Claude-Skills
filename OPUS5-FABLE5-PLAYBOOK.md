# Opus 5 / Fable 5 Session Playbook

How to run the five session/project skills with the Claude 5-family models
(Opus 5, Fable 5). Written 2026-07-29 against Anthropic's Opus 5 and Fable 5
migration guidance; the skill edits from the same date implement it.

## What changed about the models (the why)

1. **They verify their own work natively.** Instructions that mandate extra
   verification passes ("double-check", "re-verify", "use a subagent to
   verify") now cause over-verification loops — the rabbit-hole failure mode.
   Anthropic's guidance: deleting that language reduces over-verification
   with **no capability regression**. What stays is claim-gating: never say
   "tests pass" without having seen the run.
2. **They expand task scope** more than prior models. The counter is an
   explicit scope-discipline instruction (now at the top of
   `~/.claude/rules/discipline.md`), which in Anthropic's testing cut
   unrequested scope changes to nearly zero.
3. **They delegate to subagents readily** (opposite of Opus 4.8). Uncapped,
   reviews and audits multiply into agent swarms. Delegation caps are now in
   discipline.md and folder-forensic-audit.
4. **They do their best work from one complete spec given up front**, run at
   high effort, rather than instructions drip-fed across turns.
5. **Long turns are normal.** A single Fable 5 request on a hard task can run
   many minutes. Don't interrupt a working session because it looks quiet.

## The session loop

**Restart → (brief) → work → checkpoint(s) → closeout.** Kickoff and audit
are occasional.

### session-restart
- Run it every time you return to shorestack / barrel-tracker / any project.
- Let it finish its briefing, then **give the whole task in one message**:
  goal, constraints, files/areas in play, and what "done" looks like. The
  skill now ends by helping compose exactly that brief.
- Don't ask for the health suite to be re-run after a clean previous-evening
  closeout — the skill now cites the closeout's recorded gate instead.

### During work
- State intent, not procedure. "Add X; done means tests pass and a PR is
  open" beats a numbered step list — over-prescription measurably *reduces*
  output quality on these models.
- If you're describing a problem or thinking out loud, say so ("just
  assessing, don't fix yet") — otherwise a fix may ship.
- Don't ask for "double-checks." If you want confidence in a claim, ask
  *"what evidence do you have for that?"* — it forces citation of an actual
  run instead of triggering a re-verification loop.
- Adversarial review still applies, but only to its named cases: engine
  changes, money paths, wide/mechanical diffs. Routine changes get none.

### session-checkpoint
- Every 30–60 min or before anything risky. It's now explicitly a save, not
  a review — no gates, no diff audit, under 60 seconds.

### session-closeout
- Every session, full 7 phases (unchanged habit) — but phase *depth* scales
  to what the session touched, and closeout now records newly-found issues
  as next-session priorities instead of fixing them at wind-down.
- The summary is written for a cold reader; it's the next restart's input.

### project-kickoff
- New projects now scaffold a CLAUDE.md with "Gate Commands" (run once, cite
  results) and a "Working Style" block (scope discipline, no gold-plating,
  no ritual re-verification) — the model-tuning propagates automatically.

### folder-forensic-audit
- Single-agent by default; the five-auditor team only for large repos and
  only with explicit opt-in. No verifier agents on top of auditors.
- Expect full coverage with severity + confidence tags; you prioritize.

## The artifact chain (added 2026-09-02, ADR 0002)

Anthropic's AI-Native SDLC playbook (2026-08-21) adds persisted artifacts to the
loop: `intent.md` → `plan.md` → diff. Scaled to solo work:

- **Restart** reads `intent/` (Status Open) and `docs/plans/` before composing
  the contract, and commits `docs/plans/<slug>.md` *before the first edit* —
  but only for items that already earn adversarial review (engine, money path,
  wide diff). Ordinary items keep the brief in conversation.
- **Closeout** writes `intent/NNNN-slug.md` for anything that outlives the next
  session, flips intent/plan statuses, and runs the mistake-twice scan.
- **Kickoff** scaffolds `intent/` (Tier 1/2) and the `/intent` command.

Nothing about verification, review, or the 1–3 item contract changed.

## Choosing Opus 5 vs Fable 5

- **Opus 5** — the daily driver for shorestack/CB feature work, reviews,
  audits. Strongest on multi-file features and refactors; run big work at
  high effort with the full spec up front.
- **Fable 5** — the hardest, longest-horizon work: gnarly cross-package
  migrations, deep debugging that has resisted prior sessions, overnight
  autonomous runs. Give it the reason behind the ask ("this is for X, they
  need Y — with that in mind: Z") and expect minutes-long turns.
- Either way: hardest problems first, complete spec, then let it run.
  Interactive drip-feeding is the low-quality path on both.
