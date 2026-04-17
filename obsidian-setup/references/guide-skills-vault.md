---
type: guide
folder: Skills
---

# Skills

User-editable reference material for individual skills. Each skill gets its own subfolder where you store examples, strategy notes, voice preferences, and anything else the skill should know about your style.

## What Goes Here

| Type | Example |
|------|---------|
| References | Posts, emails, or content you liked — skills learn your taste from these |
| Strategy | Audience, tone, format preferences, cadence, goals for a specific skill |
| Voice notes | How you want to sound when this skill writes for you |
| Things to avoid | Patterns, phrases, or approaches you don't want |

## How It Works

Skills read from their subfolder at runtime. If `Skills/linkedin-writer/` has example posts, the linkedin-writer skill uses them to match your voice. If there's nothing here, the skill uses its defaults.

```
Skills/
├── linkedin-writer/
│   ├── notes.md                  -- Voice, tone, topics, formatting prefs
│   └── references/
│       ├── example-post.md       -- A post you liked + why
│       └── example-carousel.md   -- A carousel format you liked
├── newsletter-writer/
│   ├── strategy.md               -- Name, audience, format, cadence, tone
│   └── references/
│       └── example-edition.md    -- An edition you liked + why
├── email-sequence/
│   ├── notes.md                  -- Tone, CTA style, length prefs
│   └── references/
│       └── example-sequence.md   -- A sequence that worked well
└── _guide.md                     -- This file
```

## Tips

- Start with 1-2 examples per skill — that's enough to set the tone
- Explain **why** you like an example, not just paste it — "I like the hook" is more useful than the post alone
- Update these as your style evolves — skills always read the latest version
- You don't need a folder for every skill — only create one when you want to customize
- Shared context (ICP, brand voice, target audience) stays in `Context/` — don't duplicate it here
