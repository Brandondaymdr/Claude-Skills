---
name: sai-process-sketch
description: The standard visual communication format for the SAI Student Portal project — annotated screen-by-screen process-flow sketches (single self-contained HTML). Use this skill whenever creating any process flow, screen sequence, user-journey walkthrough, wireframe, or stakeholder-facing sketch for the SAI portal project. Trigger on "sketch", "process flow", "walkthrough", "show SAI", "visual flow", "wireframe the flow", or any request to visualize how a part of the portal works — student side or staff side. Every SAI sketch must follow this format so the set stays consistent across the whole project.
---

# SAI Process Sketch Format

The SAI Student Portal project communicates flows to stakeholders through **annotated screen-by-screen sketches**: a single self-contained HTML page that walks through a sequence of moments, showing the screen on the left and what the system does behind it on the right.

Established 2026-07-24. The canonical reference implementations live in `/Users/brandonday/Projects/SAI/sai-portal/`:

- `invite-to-payment-sketch.html` — student view, terracotta, 6 screens
- `staff-view-sketch.html` — staff view, azure, 6 screens
- `package-config-sketch.html` — staff view, azure, 7 screens (the configuration surface everything else is downstream of)

**When in doubt, open one and match it.** Copy its `<style>` block wholesale rather than rewriting the visual system from this description.

## Why this format

- SAI stakeholders react to *screens*, not spec documents. The wireframes make abstract flows concrete.
- The "Behind the screen" column keeps the technical truth attached to every visual moment, so the sketch doubles as an engineering discussion doc.
- Every sketch deliberately **surfaces open questions** — placeholders are flagged, not hidden. Sketches are conversation tools, not promises.

## Document anatomy (in order)

1. **Header** — kicker line (`SAI Student Portal · Pre-Planning Sketch · [Topic] · Rev YYYY-MM-DD`), a Fraunces headline with one italic accent phrase in the flow's accent color, a lede naming the sample student and what the sketch covers, and a 3-item legend.
2. **Numbered steps** (typically 5–7). Each step is a two-column grid:
   - **Left:** step number (oversized Fraunces numeral in the margin), H2 title, one-paragraph sub, then the screen mock inside a browser/email **frame** (chrome bar with traffic lights + a realistic URL like `portal.saiprograms.com/...`).
   - **Right:** a "**Behind the screen**" notes column (see Annotation conventions).
3. **Footer** — "What this sketch surfaces": a grid of question cards, each with a WHO tag (`ASK SAI`, `VALIDATE`, `BRANDON`, `DECISION`), a Fraunces bold title, and 1–2 sentences.

## Visual system (do not deviate)

- **Fonts:** Fraunces (display/serif, headings + key numbers) · Archivo (body/UI) · JetBrains Mono (labels, event names, metadata). Loaded via Google Fonts `@import`.
- **Base palette:** paper `#f6f2ea` background with a subtle 26px radial-dot grid; deep paper `#efe9dd`; ink `#22252c`; soft ink `#5b5e66`; faint ink `#8e9098`; lines `#d9d1c0` / `#e6dfd2`; card `#fdfbf7`.
- **Accent = whose world it is:** terracotta `#c14f2c` for the **student** experience · azure `#2a5a9c` for the **staff/admin** experience. The accent drives the kicker, italic headline phrase, primary buttons, and note highlights. Sage `#5d7a5a` = success/complete. Amber `#b07f24` = pending/warning states.
- **Admin shell:** staff screens use the dark navy sidebar (`#20344f`) with the `SAI · Admin` brand mark; student screens use the light sidebar.
- **Wireframe primitives:** grayscale boxes and fields for anything undesigned; accent color only on the one primary action per screen. Locked fields show 🔒. Processor hosted card fields always appear as a dashed **azure** box tagged `PROCESSOR HOSTED FIELDS`.
- **Shadow/radius:** cards `border-radius:10px`, shadow `0 2px 6px rgba(34,37,44,.06), 0 18px 40px -18px rgba(34,37,44,.18)`.

## Annotation conventions ("Behind the screen" column)

- `note sys` (accent-colored left border) — what the system/integration actually does at this moment.
- `note warn` (terracotta left border) — an open question or decision, prefixed **Open:** / **Decision:** / **Ask SAI:** / **Gate:**. Cross-reference the journey-map question number when one exists (e.g. "SAI question #10").
- **Event chips** (`.evt`, dark pills, mono, dot.case): every meaningful moment names its events — `portal.invited`, `payment.succeeded`, `profile.flagged`. Keep event names consistent across sketches; they are becoming the project's real event vocabulary.
- **Pills** (`.pill`, outlined) for configuration/metadata notes.

## Content rules

- **Recurring cast (never invent new mains):** Emma Larson — University of Oregon → FUA Florence, Fall 2026, package `FLR-FA26-UO`, deposit $2,500, email `emma.larson@uoregon.edu`. Supporting: Marcus Webb (SDSU, the one whose Method write fails), Priya Nair (UT Austin), Jake Torres / Sofia Reyes (silent on invites), Dan Cole (opened, not paid). Reusing the cast makes the sketch set read as one continuous story.
- All copy, amounts, dates, and policies are **placeholders** unless confirmed — say so in the lede or footer. Never present a guess as fact; turn guesses into footer question cards.
- Every gated/sequenced behavior shown (e.g. "Housing opens after deposit") is a **hypothesis** until SAI confirms — label it in a warn note.
- Tone of in-screen microcopy: warm milestone language ("You're in, Emma"), human, never system-speak. This is itself a proposal to validate with SAI's brand voice.
- Staff-side philosophy to preserve in every admin sketch: **automation does the routine; staff see a short queue of exceptions.** Never sketch an admin screen that implies manual busywork.

## Mechanics

- One self-contained HTML file — all CSS inline, no external JS, no localStorage. Responsive (single column under 900px). CSS-only staggered reveal animation, respecting `prefers-reduced-motion` (add an `animation-delay` rule per step — the base sheet only covers the first two).
- **Always include an `@media print` block.** Sketches get exported to PDF for stakeholders who want something to forward or print, and without print rules the export is broken in two ways:
  1. **Blank pages.** The reveal animation starts at `opacity:0` and never completes in a headless print render, so every step exports invisible. The print block *must* neutralize it:
     ```css
     @media print{
       body{background:#fff;background-image:none;font-size:10pt;}
       .wrap{max-width:none;padding:0;}
       .step{opacity:1 !important;transform:none !important;animation:none !important;padding:22px 0;}
       .step h2{break-after:avoid;page-break-after:avoid;}
       .frame,.qcard,.notes,.tiles{page-break-inside:avoid;break-inside:avoid;}
       .frame{box-shadow:none;}
       .stepnum{position:static;transform:none;font-size:40px;margin-bottom:4px;}
       header{padding-top:0;} footer{padding-bottom:0;}
     }
     ```
  2. **Near-empty pages.** Do **not** put `page-break-inside:avoid` on `.step` (or on a full-height `section`) — a step is taller than a page, so the rule pushes it wholesale to the next one and leaves two-thirds of a page blank. Keep break-avoidance on the *small* blocks only: screen frames, note columns, question cards, tables.
- Render PDFs with Chrome's print engine — no extra dependency, and it honors the print block:
  ```bash
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu \
    --no-pdf-header-footer --virtual-time-budget=12000 \
    --print-to-pdf=out.pdf "file://$PWD/<topic>-sketch.html"
  ```
  Then confirm nothing exported blank — page count alone won't tell you:
  ```bash
  python3 -c "
  import re,zlib,sys
  d=open(sys.argv[1],'rb').read()
  s={int(m.group(1)):len(zlib.decompress(re.search(rb'stream\r?\n(.*?)endstream',m.group(2),re.S).group(1)))
     for m in re.finditer(rb'(\d+)\s+0\s+obj(.*?)endobj',d,re.S) if re.search(rb'stream',m.group(2))}
  c=[s.get(int(m.group(1)),0) for m in re.finditer(rb'/Type\s*/Page[^s].*?/Contents\s+(\d+)\s+0\s+R',d,re.S)]
  print('blank pages:',[i+1 for i,v in enumerate(c) if v<400] or 'none')" out.pdf
  ```
- **Naming:** `<topic>-sketch.html` (e.g. `housing-phase-sketch.html`, `package-config-sketch.html`).
- **Location:** save into `/Users/brandonday/Projects/SAI/sai-portal/` alongside the others.
- **Rev date** in the kicker; update it on every revision.
- Validate the markup before handing it over — one unbalanced tag silently wrecks the layout:
  ```bash
  python3 - <<'EOF'
  from html.parser import HTMLParser
  VOID={'area','base','br','col','embed','hr','img','input','link','meta','source','track','wbr'}
  class P(HTMLParser):
      def __init__(s): super().__init__(); s.stack=[]; s.err=[]
      def handle_starttag(s,t,a):
          if t not in VOID: s.stack.append((t,s.getpos()))
      def handle_endtag(s,t):
          if t in VOID: return
          if not s.stack: s.err.append(f"stray </{t}> at {s.getpos()}"); return
          top,pos=s.stack.pop()
          if top!=t: s.err.append(f"</{t}> at {s.getpos()} closes <{top}> opened {pos}")
  p=P(); p.feed(open('<topic>-sketch.html').read())
  print("errors:", p.err or "none", "| unclosed:", [t for t,_ in p.stack] or "none")
  EOF
  ```

## After creating a sketch (required)

1. Add every newly surfaced question to `journey-map.md` §6, taking **the next number in the Q-series** — that numbering is the project's shared vocabulary across the journey map, the meeting agenda, and the warn notes in every sketch. Never renumber existing questions.
2. Add any new Brandon-side decisions to `journey-map.md` §7.
3. List the sketch in `journey-map.md`'s companion-docs line and in `CLAUDE.md`'s key-docs list.
4. Bump `journey-map.md`'s **Last updated** date.
5. If the new questions belong in the next SAI conversation, add them to `sai-meeting-agenda.md` in the block whose answers they unblock.
