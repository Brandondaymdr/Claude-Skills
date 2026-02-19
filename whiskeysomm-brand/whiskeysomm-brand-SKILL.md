# WhiskeySomm — Brand & UX Skill
## Design System, Voice, and Product Philosophy

---

## What This App Is

WhiskeySomm is a confident, mobile-first whiskey recommendation app. A user photographs their whiskey collection. The app tells them exactly what to drink right now — no questionnaires, no hedging, no optimization theater. It feels like getting a recommendation from a knowledgeable friend, not filling out a form.

---

## The One Rule That Overrides Everything

**The first recommendation is complete. It does not need refinement to be correct.**

Every design decision, copy choice, and interaction pattern must reinforce this. The app is not a wizard. It is not a quiz. It does not gather information — it makes a call.

---

## Voice & Tone

| Do | Don't |
|---|---|
| Warm, direct, slightly opinionated | Pretentious, clinical, over-explained |
| "Drink this tonight: Oban 14." | "Based on your collection profile, we suggest..." |
| "Tune it." | "Would you like to improve your recommendation?" |
| "Given that, pour the Lagavulin." | "We've updated your results based on your preferences." |
| Confident. Re-commits after refinement. | Apologetic. Never says it was wrong. |

**The app speaks like a sommelier who already knows your table — not like a chatbot collecting data.**

Copy must be:
- Short
- Decisive
- Warm but never fussy
- Specific to whiskey culture without being gatekeeping

---

## Color Palette

```css
--background:     #F5F0EA;  /* Warm off-white — main page background */
--text-primary:   #1A1008;  /* Near black, warm undertone — headlines, body */
--text-secondary: #7A6A55;  /* Muted warm brown — secondary copy, labels */
--amber:          #C17D2A;  /* Primary accent — CTA buttons, highlights */
--amber-light:    #E8A84C;  /* Hover states, active states */
--card-bg:        #FFFFFF;  /* White — recommendation cards */
--card-shadow:    rgba(26, 16, 8, 0.08); /* Subtle warm shadow */
--border:         rgba(193, 125, 42, 0.2); /* Faint amber border */
```

Never use:
- Pure black (#000000) — use `--text-primary` instead
- Cool grays — everything should have a warm undertone
- Bright white backgrounds — use `--background` off-white

---

## Typography

```css
/* Headlines — editorial weight */
font-family: 'Playfair Display', Georgia, serif;
/* Used for: App name, "DRINK THIS TONIGHT", bottle names */

/* Body & UI — clean and readable */
font-family: 'DM Sans', 'Inter', system-ui, sans-serif;
/* Used for: Reasons, labels, buttons, secondary copy */
```

**Google Fonts import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

**Type scale (mobile-first):**
```css
App wordmark:         2rem     Playfair Display 900
Section headline:     1.5rem   Playfair Display 700
Bottle name:          1.75rem  Playfair Display 700
Recommendation label: 0.7rem   DM Sans 600, letter-spacing: 0.12em, uppercase
Body / reason text:   1rem     DM Sans 400, line-height: 1.6
Button text:          1rem     DM Sans 600
Subtle links:         0.875rem DM Sans 400, underline
```

---

## Component Patterns

### CTA Button (Primary)
```css
background: var(--amber);
color: var(--text-primary);
border-radius: 12px;
padding: 16px 24px;
font: DM Sans 600, 1rem;
width: 100%;
min-height: 56px;
border: none;
```
Hover: `background: var(--amber-light)`
Active: `transform: scale(0.98)`

### Recommendation Card
```css
background: var(--card-bg);
border-radius: 20px;
padding: 28px 24px;
box-shadow: 0 4px 24px var(--card-shadow);
border: 1px solid var(--border);
```

### "Tune it." Link
```css
font: DM Sans 400, 0.875rem;
color: var(--text-secondary);
text-decoration: underline;
text-underline-offset: 3px;
/* No button styling. No border. No background. Quiet. */
```

### Context Chips (Refinement Step)
```css
border: 1.5px solid var(--border);
border-radius: 100px;
padding: 10px 20px;
font: DM Sans 500, 0.9rem;
color: var(--text-primary);
background: transparent;

/* Selected state */
border-color: var(--amber);
background: rgba(193, 125, 42, 0.08);
color: var(--amber);
```

### Bottle Silhouette (Cheersworthy Panel)
- SVG silhouette, amber fill at 60% opacity
- On hover/tap: opacity goes to 100%, subtle glow
- 4 silhouettes in a row, equal width
- No names. No prices. Mystery is intentional.

---

## Layout Rules

- **Max content width:** 480px (centered on larger screens)
- **Side padding:** 20px
- **All tap targets:** minimum 48px height
- **Section spacing:** 32px between major sections
- **Card spacing:** 16px between stacked cards

---

## Animation & Motion

Keep motion subtle and purposeful:

```css
/* Loading shimmer */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Use for loading states */
background: linear-gradient(90deg, #F5F0EA 25%, #EDE5D8 50%, #F5F0EA 75%);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;
```

- Page transitions: fade only, 200ms
- Card appear: `opacity 0→1 + translateY(8px→0)`, 300ms ease-out
- Chip select: instant, no delay
- Never animate text content changes — swap cleanly

---

## Loading States Copy

| State | Copy |
|---|---|
| Photo submitted | `Reading your collection...` |
| Refinement submitted | `Tuning...` |
| Suggestions loading | (skeleton silhouettes, no copy needed) |
| Share link copied | `Copied.` (brief, then disappears) |

---

## Page Structure (Mobile)

```
[WhiskeySomm wordmark]
[Hero image — whiskey shelf, warm, moody]
[Headline: Don't guess.]
[Subhead: Discover the best whiskey for you, right now.]
[Body: Take a quick photo of your collection, and I'll make the call.]
[📷 Take a photo — full width amber button]
[Trust row: ⚡ 30 seconds · 👆 No signup · 🎯 Personal pick]
```

After photo + analysis:

```
[DRINK THIS TONIGHT — label, small caps]
[Bottle Name — large serif]
[Reason — 2-3 sentences]
─────────────────────
[Also consider:]
[Alternate name — reason]
─────────────────────
[Tune it.] ← quiet link
─────────────────────
[Share this pick — secondary button]
─────────────────────
[You might like these too.]
[🥃 🥃 🥃 🥃 — silhouettes]
```

---

## UX Rules — Never Break These

1. **Never show more than 2 bottle recommendations** at any stage
2. **Never ask more than 1 clarifying question** in refinement
3. **Never say the original recommendation was wrong**
4. **"Tune it." is the only refinement trigger** — no other entry point
5. **Cheersworthy panel never interrupts** the recommendation card
6. **Refinement disappears after first use** — no second tuning
7. **Loading states must have copy** — never show a blank spinner alone
8. **No modals** — use bottom sheets (drawers) on mobile
9. **No pagination** — everything on one scrollable page
10. **No star ratings, sliders, or tasting note grids** — ever

---

## Cheersworthy Panel Rules

- Appears below recommendation, always
- Heading: `You might like these too.`
- 4 bottle silhouettes — identical shape, no names
- On tap: bottom drawer opens with flavor cloud image + brief description
- CTA in drawer: `See this bottle on Cheersworthy →`
- Opens product page in new tab
- Always includes UTM: `?utm_source=whiskeysomm&utm_medium=app&utm_campaign=collection_match`
- Flavor cloud images come from Shopify product metafields — never generated dynamically

---

## Share Feature

- Button label: `Share this pick`
- Styled as secondary (outline) button, not primary amber fill
- On tap: Web Share API on mobile, fallback sheet on desktop
- Share options: Text · Email · Copy link
- Shared URL format: `https://whiskeysomm.com/result?r=[base64encoded_result]`
- Shared result page is read-only — shows recommendation card + Cheersworthy panel, no camera button

---

## What This App Is Not

- Not a whiskey education platform
- Not a catalog browser
- Not a quiz
- Not a matching algorithm with visible scoring
- Not a social platform
- Not an e-commerce store (Cheersworthy is — WhiskeySomm hands off to it)
