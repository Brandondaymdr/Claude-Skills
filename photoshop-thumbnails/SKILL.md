---
name: photoshop-thumbnails
description: >
  Expert guide for creating YouTube thumbnails in Adobe Photoshop for Carla Gentile Yoga's channel.
  Use this skill whenever the user wants to create, design, edit, or batch-produce YouTube thumbnails,
  needs Photoshop setup instructions for thumbnails, wants a thumbnail template, asks about thumbnail
  sizing or specs, wants to know best practices for yoga/wellness thumbnail design, or asks how to
  export thumbnails for YouTube. Also trigger when the user mentions "thumbnail", "Photoshop", "PSD",
  "YouTube art", "video cover image", or wants to brand their YouTube channel visually. Even if the
  user just says "make thumbnails" without specifying a tool, use this skill.
---

# Photoshop YouTube Thumbnail Skill — Carla Gentile Yoga

Expert guide for creating on-brand, high-performing YouTube thumbnails in Adobe Photoshop.

## YouTube Thumbnail Specs

| Property | Value |
|----------|-------|
| **Dimensions** | 1280 × 720 px |
| **Aspect Ratio** | 16:9 |
| **Resolution** | 72 PPI (screen) |
| **Color Mode** | RGB |
| **Max File Size** | 2 MB |
| **Formats** | JPG, PNG, GIF, WebP |
| **Recommended Export** | JPG at 85% quality |

---

## Brand Guidelines

### Typography
- **Primary Font:** Gill Sans Light
  - Use for all main title text on thumbnails
  - Pair with Gill Sans Regular or Gill Sans Bold for emphasis/contrast
  - Avoid decorative or script fonts — keep it clean and minimal

### Design Aesthetic for Carla Gentile Yoga
- **Tone:** Calm, premium, approachable — not aggressive or gym-style
- **Style:** Clean layouts, generous white space, natural textures
- **Photography:** Natural light, studio or outdoor settings, genuine expression
- **Text:** Short (2–5 words max), large enough to read at mobile size (~80px+ at 1280px wide)

> For full brand color palette and extended style references, see:
> `references/brand-style.md`

---

## Photoshop Setup

### Creating the Canvas
1. **File → New Document**
2. Set **Width: 1280 px**, **Height: 720 px**
3. **Resolution:** 72 PPI
4. **Color Mode:** RGB Color, 8 bit
5. **Background:** White or transparent

### Recommended Layer Structure
Organize your PSD with these layer groups (top to bottom):

```
📁 Text
   └── Main Title (Gill Sans Light, ~80-100px)
   └── Subtitle / Class Type (Gill Sans Light, ~50px)
📁 Graphic Elements
   └── Color overlays / shapes
   └── Logo / watermark
📁 Photo
   └── Carla photo (masked)
   └── Background image
📁 Background
   └── Solid color or gradient fill
```

### Smart Objects
- Place Carla's photo as a **Smart Object** (File → Place Embedded) so it stays non-destructive
- Save your base layout as a template PSD — swap only the photo and title text per video

---

## Thumbnail Design Patterns

### Pattern 1: Face + Title (Best Performer)
- Large close-up of Carla's face (left or right half of canvas)
- Bold title text on the opposing side
- Simple solid or gradient background

### Pattern 2: Action Shot + Overlay
- Full-bleed yoga pose photo
- Semi-transparent dark or color overlay (30–50% opacity)
- Title text centered or bottom-anchored

### Pattern 3: Split Layout
- Left half: photo of Carla
- Right half: colored background block with title text
- Clean dividing line or shape

### Tips for Yoga Content
- **Show emotion** — smiling or serene expressions outperform neutral faces
- **Include class type** in text: "Vinyasa", "Yin", "Meditation", "Morning Flow"
- **Include duration** when relevant: "30 Min", "20 Minute"
- **Consistent layout** across a series builds visual recognition
- **Mobile first** — zoom out to 25% in Photoshop and check readability at thumbnail size

---

## Exporting Thumbnails

### Single Export
1. **File → Export → Export As**
2. Format: **JPG**
3. Quality: **85%** (balances file size and sharpness)
4. Check file size is under 2 MB
5. Save with a descriptive name: `thumbnail-morning-vinyasa-flow.jpg`

### Batch Export (Multiple Thumbnails)
Use **File → Scripts → Image Processor**:
1. Select source folder of PSDs
2. Choose output folder
3. Select **Save as JPEG**, quality **9** (= ~85%)
4. Check **Resize to Fit** only if needed (keep at 1280×720)
5. Run

### Naming Convention
```
[date]-[class-type]-[duration]-thumbnail.jpg
Example: 2025-03-vinyasa-30min-thumbnail.jpg
```

---

## Uploading to YouTube

1. Go to **YouTube Studio** → select the video
2. Click **Details** → scroll to **Thumbnail**
3. Click **Upload thumbnail**
4. Select your exported JPG/PNG

> **Note:** Channel must be phone-verified to upload custom thumbnails.
> See the youtube-channel skill for full upload workflow via API.

---

## Template PSD Checklist

When building a reusable template, verify:

- [ ] Canvas is 1280 × 720 px at 72 PPI, RGB
- [ ] Photo layer is a Smart Object
- [ ] Text is set in Gill Sans Light and is still editable (not rasterized)
- [ ] All layers are named and grouped
- [ ] Logo/watermark layer is on top and locked
- [ ] Saved as `.psd` (not flattened)
- [ ] Test export under 2 MB

---

## Reference Files

- `references/brand-style.md` — Extended brand colors, mood board notes, photo style guide
- `references/series-templates.md` — Per-series thumbnail templates (Vinyasa, Yin, Meditation, etc.)
