---
name: days-design-system
description: Brandon's house design standards across every Days LLC project — the cross-project rules for colour, typography, shape, interaction honesty, contrast, and how to verify a visual change actually worked. Use this skill whenever designing, styling, restyling, or reviewing ANY user interface in any repo — web app, mobile app, desktop app, admin panel, marketing page, or email. Trigger on "design", "style", "restyle", "make it look better", "UI pass", "design system", "brand consistency", "colours", "typography", "spacing", "buttons", "contrast", "accessibility", "does this look right", or any request to build or change a screen. Also use before writing the first line of CSS in a new project, and when auditing an existing UI for consistency. This is the HOUSE layer — a project with its own design doc or brand skill (ShoreStack, Cheersworthy, WhiskeySomm) overrides it on specifics; this still governs method and the non-negotiables.
---

# Days LLC — house design system

The standards that hold across every project Brandon builds, and the method for
proving a visual change actually worked. Written 2026-07-31 from the ShoreStack
design pass; the specifics that were ShoreStack's own stayed in that repo, and
what survived is here because it applies everywhere.

## Precedence — read this first

1. **What Brandon says in the conversation.** Always wins.
2. **The project's own design source.** A per-project doc or brand skill is the
   authority on that project's palette, type and voice:

   | Project | Design source |
   | --- | --- |
   | ShoreStack (shell, CRM, Projects, Comms, Inventory, Safe) | `docs/DESIGN-SYSTEM.md` in the monorepo + `@shorestack/ui` tokens |
   | Cheersworthy | `cheersworthy-content`, `cheersworthy-wireframe`, `cheersworthy-dawn`, `cheersworthy-shopify` skills |
   | WhiskeySomm | `whiskeysomm-brand` skill |
   | SAI Student Portal | `sai-process-sketch` skill (stakeholder flows) |
   | Barrel Tracker, Harper, Alchemy, HDYW, Reel, B-Roll, payroll apps | none yet — this skill is the default |

3. **This skill.** Method, non-negotiables, and the default aesthetic when a
   project has no design source of its own.

If a project has no design source and the work is more than a tweak, the output
of that work should *become* one — a `docs/DESIGN-SYSTEM.md` in that repo,
following the shape ShoreStack's uses.

**Greenfield and want a distinctive look?** Load `frontend-design` for the
creative direction, then come back here for the non-negotiables in §4–§7. They
are not in tension: that skill decides what the thing feels like, this one
keeps it honest and verifiable.

---

## 1. The house aesthetic (the default, not a straitjacket)

Applies when a project hasn't decided otherwise. Brandon's built work leans one
way consistently, so start here and deviate on purpose:

- **Flat.** Borders, not shadows. A 1px hairline at ~10–15% of the ink colour
  is how you separate things; `box-shadow` is a last resort, not a default.
- **Sharp.** 0–4px radii. Never `rounded-lg` everywhere as a reflex.
- **One accent.** A single colour carries interactive intent. Not three.
- **Roomy.** Generous whitespace and a clear type hierarchy beat borders and
  boxes for structure.
- **Quiet until it points.** Motion is functional: 0.12–0.2s on colour, border,
  and small transforms. No page-load choreography, no parallax.

---

## 2. The token contract

Every project defines these slots with **its own** values, in one file, and
consumes them as variables. What the slots are is house-standard; what's in
them is per-project.

```
ink          the dominant text/border colour
accent       the one interactive colour
ground       page background
surface      panel/card background
danger       destructive + errors
warning      cautions
success      confirmations
+ 2-3 shades of ink and accent (light/dark) for hover and secondary text
```

**Rules:**

- **Never write a raw hex in a component.** If you're typing `#` outside the
  token file, stop — that's the drift every one of these systems eventually
  suffers.
- **Tints instead of new tokens.** Hairlines, hover washes and secondary text
  are the ink colour at low alpha (`0.06–0.12` for surfaces, `0.5–0.7` for
  text), not a separate grey ramp. This is what keeps a palette at ~10 values.
- **Never redeclare a token downstream.** In a monorepo especially: a
  re-declared token drifts **silently**, because no gate can see it (§7).

---

## 3. Typography

Two faces: one sans for everything, one mono. Both through tokens.

**Mono is a rule, not a texture.** Anything a person might copy, paste, compare
digit-by-digit, or read aloud to someone gets mono: ids, API keys, currency,
quantities in a table, shell commands, code, timestamps in a log. Use
`font-variant-numeric: tabular-nums` wherever digits stack in columns.

Keep one type scale and stay on it. Body copy caps at **65–70ch**. Headings get
`text-wrap: balance`. An uppercase tracked micro-label ("eyebrow") above a
section is the cheapest way to build hierarchy without more boxes — use it to
name a region, don't sprinkle it.

---

## 4. Interaction honesty (non-negotiable)

Brandon's standing call, established on Shorestack Books and applying
everywhere:

> **Looks like a link → acts like a link.**

- The hand cursor belongs on a real `<a href>` or a deliberately link-styled
  control — nothing else. A `<div onclick>` styled like a link is a bug.
- **Something not clickable must not look clickable.** Don't render a dimmed
  copy of an interactive element to mean "unavailable" — give it a different
  treatment and a state label. (ShoreStack's Books tile: a plain card with a
  `DESKTOP` badge, not a 55%-opacity fake button.)
- **Every interactive element needs a visible `:focus-visible`** — typically a
  2px accent outline with 2px offset. Keyboard users are not optional.
- A control says what happens: "Publish" → then a toast that says "Published".
- Errors say what went wrong **and** what to do. And they must distinguish
  *the user's input was wrong* from *we couldn't reach the thing* — collapsing
  those into one message is how a working key reads as invalid for a month.

---

## 5. Contrast — measure it, never eyeball it

**This is the rule most often broken, including by me.** A brand accent chosen
for how it looks on a swatch usually fails as a text background.

Target **WCAG AA: 4.5:1** for normal text, 3:1 for large text (≥24px, or ≥18.66px
bold) and for UI component boundaries.

Run the numbers before shipping a colour pair:

```bash
python3 references/contrast.py "#ffffff" "#5fa8a0"
```

Real example of why: ShoreStack's primary button is white on seafoam
`#5fa8a0` = **2.76:1**. It failed AA in six apps for months because it *looks*
fine. Worse, a later redesign of that app's danger button (solid → outline)
measured 2.99:1 against the 3.09:1 it replaced — a change that felt like an
improvement and was neutral-to-worse on contrast, because nobody measured
either version.

When an accent fails as a text background — the common case — fix it once at
the system level, not per-component: darken the accent for text-bearing
surfaces while keeping the bright value for fills and rules, or put dark text
on the accent fill.

---

## 6. Only define what you render

An app's stylesheet may only define utilities that app actually uses. Copying a
"shared" block between projects and letting it rot is how a 44-line stylesheet
becomes 464 lines of dead selectors.

ShoreStack's shell defined ~35 utility classes and rendered **10** — including a
full kanban and data-table block in an app with neither. Census before adding:

```bash
# every class name actually referenced in the source
grep -rhoE 'className=\{?[^}>]*' app components lib \
  | grep -oE '"[^"]*"' | tr -d '"' | tr ' ' '\n' | sort -u
```

Extract to a shared package only on **evidence** that two or more consumers use
the same thing the same way — not on the assumption that they will.

---

## 7. Verifying a visual change

**CSS changes are invisible to typecheck, lint, tests and build.** A green gate
says nothing about whether a colour, spacing or token change worked. Never
report a visual change as done on the strength of a passing suite.

Three techniques, in order of how often they catch something:

1. **Look at it.** Screenshot every state in a real browser — including the
   empty, error and loading states — and *open the images*. A wrong-proportion
   logo lockup and a sidebar overlap both survived a fully green suite.
2. **Diff the emitted stylesheet.** Build before and after, compare the emitted
   CSS. This catches what the eye won't: a dead utility the bundler synthesised
   from a string literal, or a token alias doing two opposite jobs (readable on
   light ground, invisible on dark).
3. **Measure contrast** on any pair you changed (§5).

**Keep the pairs.** Save before/after screenshots into the repo (`docs/design/`
with a dated folder per pass) with a README recording the capture convention —
same width, same theme, same data — so the next comparison is valid. Session
scratch directories are wiped; a design decision with no surviving evidence
gets re-litigated from scratch.

Precedence when they disagree: **the running app is the fact**, the doc is the
intent, the screenshot is history. If the app contradicts the doc, one of them
needs updating — decide which, don't ignore it.

---

## 8. Anti-patterns

- A raw hex in a component file.
- A dimmed interactive element used to mean "disabled" or "unavailable".
- `cursor: pointer` on something that isn't a link or a button.
- A new grey introduced because the existing ink tint "looked slightly off".
- Shipping a colour pair whose contrast was never measured.
- A shared stylesheet copied into a project "to start from", then never pruned.
- Reporting a design change as verified because the test suite is green.
- Rounding, shadowing and gradient-ing a thing to make it feel designed. If it
  needs hierarchy, use space and type.

---

## Reference

- `references/contrast.py` — WCAG contrast checker. Takes hex pairs, prints the
  ratio and AA/AAA pass for normal and large text.
