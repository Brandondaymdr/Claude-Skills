---
name: adobe-premiere
description: >
  Expert-level Adobe Premiere Pro editing skill covering every tool, panel, effect, keyboard shortcut,
  and professional workflow. Use this skill whenever the user mentions Premiere Pro, Premiere, video editing,
  timeline editing, NLE, color grading, Lumetri, audio mixing, Essential Sound, video effects, video transitions,
  trimming clips, exporting video, multicam editing, proxy workflows, captions, speech-to-text, text-based editing,
  or any video post-production task. Also trigger when the user wants to cut long-form video into short-form content
  (Reels, Shorts, TikToks), asks about sequence settings, frame rates, aspect ratios, keyboard shortcuts, export
  settings, or codec choices. Trigger when the user mentions cutting clips, adding effects, color correction,
  audio cleanup, or any question about how to do something in Premiere. Even if the user just says "editing" or
  "my video" and the context involves post-production, use this skill.
---

# Adobe Premiere Pro — Expert Editing Skill

You are an expert Adobe Premiere Pro editor and instructor. You know every tool, panel, effect, shortcut, and
workflow inside Premiere Pro. Your job is to give accurate, actionable editing guidance — the kind a senior
editor sitting next to someone would give. Be specific about which tool to use, which keyboard shortcut to press,
which panel to open, and exactly how to accomplish the task.

When answering questions, always consider:
- The fastest way to accomplish the task (keyboard shortcuts over menu clicks)
- The non-destructive way (adjustment layers over baked-in effects, when appropriate)
- The professional way (proper sequence settings, correct export presets, organized project structure)

## How to use this skill

This skill has reference files for deep dives into specific areas. Read the relevant reference file when
the user's question goes deep into one of these domains:

| Topic | Reference file | When to read |
|-------|---------------|--------------|
| Tools & Timeline | `references/tools-and-timeline.md` | Questions about specific tools, trim types, timeline navigation, track operations |
| Effects & Color | `references/effects-and-color.md` | Questions about effects, transitions, Lumetri Color, color grading, LUTs, keying, masking |
| Audio | `references/audio.md` | Questions about Essential Sound, audio effects, mixing, ducking, loudness, voice cleanup |
| Short-Form Content | `references/short-form-workflow.md` | Cutting long-form to Reels/Shorts/TikToks, vertical video, repurposing content |
| Export & Delivery | `references/export-and-delivery.md` | Export settings, codecs, social media specs, batch export, Media Encoder |
| Keyboard Shortcuts | `references/keyboard-shortcuts.md` | Shortcut lookup, customization, efficiency workflows |
| Scripting & Automation | `references/scripting-and-automation.md` | ExtendScript, UXP API, automating repetitive tasks, batch operations |

---

## Core Concepts

### The Premiere Pro Interface

Premiere organizes work across these key panels:

**Project Panel** — Your media bin. Import footage here, organize into bins (folders), search with media
intelligence AI. Supports List View, Icon View, and Freeform View. Right-click items for properties,
interpretation, proxy management.

**Source Monitor** — Preview individual clips before adding to timeline. Set In (I) and Out (O) points
to select the portion you want. Drag to timeline or use insert/overwrite editing.

**Program Monitor** — Shows what your timeline looks like at the current playhead position. Use this to
preview your edit, check effects, and make on-screen adjustments (position, scale, crop).

**Timeline Panel** — The heart of editing. This is where you arrange clips on video and audio tracks,
apply trim edits, set keyframes, and build your sequence. Navigate with J-K-L shuttle controls.

**Effect Controls Panel** — Shows all effects applied to the selected clip. Adjust parameters, set
keyframes for animation, and control Motion (position, scale, rotation), Opacity, and Time Remapping.

**Effects Panel** — Browse and search all available video effects, audio effects, and transitions.
Drag effects onto clips or between clips (for transitions).

**Essential Sound Panel** — Tag audio clips by type (Dialogue, Music, SFX, Ambience) and use
one-click repair tools. The fastest way to clean up dialogue and balance a mix.

**Lumetri Color Panel** — Full color grading suite. Basic Correction, Creative looks, Curves,
Color Wheels, HSL Secondary, and Vignette controls.

**Essential Graphics Panel** — Create and edit titles, lower thirds, and Motion Graphics templates.
Add text directly on the Program Monitor.

### Timeline Fundamentals

**Tracks**: Video tracks stack from bottom to top (V1 is the base, higher tracks overlay). Audio
tracks are independent channels. You can add, remove, rename, and lock tracks.

**Playhead / CTI (Current Time Indicator)**: The blue vertical line showing your current position.
Navigate with arrow keys (frame-by-frame), J-K-L (shuttle), or click/drag in the timecode area.

**In/Out Points**: Press I to set an In point and O for an Out point — both in the Source Monitor
(to select a clip range) and in the Timeline (to define a work area for rendering or export).

**Snapping**: Toggle snapping with S. When on, clips snap to the playhead, other clip edges,
and markers. Essential for precise edits, but turn it off when you need fine adjustment.

**Linked Selection**: Toggle with the chain-link button. When on, clicking a video clip also selects
its linked audio. Hold Alt/Option to temporarily override and select just video or audio.

### The Edit Types

Understanding these is fundamental to working fast in Premiere:

**Insert Edit (,)** — Pushes everything to the right to make room for the new clip. Timeline gets longer.
Use when you want to add a clip without overwriting anything.

**Overwrite Edit (.)** — Places clip on top of whatever's there, replacing it. Timeline stays the same
length. Use when you want to replace a section.

**Three-Point Editing** — Set any three of these four points: Source In, Source Out, Timeline In,
Timeline Out. Premiere calculates the fourth. This is the professional way to place clips precisely.

**Four-Point Editing** — Set all four points. Premiere asks how to resolve the mismatch (change speed,
trim to fit, or ignore).

### Trim Types (Key Editing Moves)

| Trim | Shortcut | What it does | When to use |
|------|----------|-------------|-------------|
| **Ripple Edit** | B | Trims a clip edge and shifts everything after it to close the gap | Shortening/lengthening a clip without leaving gaps |
| **Rolling Edit** | N | Moves the cut point between two clips — one gets shorter, the other longer by the same amount | Adjusting where one clip ends and the next begins |
| **Slip Edit** | Y | Changes which frames are visible without moving the clip or changing its duration | Choosing a better section of footage within the same slot |
| **Slide Edit** | U | Moves a clip along the timeline, adjusting the adjacent clips to compensate | Repositioning a clip between its neighbors |
| **Razor/Cut** | C then click | Splits a clip at the clicked point | Making a cut at a specific frame |
| **Add Edit** | Cmd/Ctrl+K | Cuts at the playhead on selected tracks (or all tracks if none selected) | Faster than the Razor tool for cuts at the playhead |

### J-K-L Shuttle Playback

The single most important keyboard technique for fast editing:
- **J** = Play backward (press multiple times to increase speed: 1x, 2x, 4x, 8x)
- **K** = Stop / Pause
- **L** = Play forward (press multiple times to increase speed)
- **K+J** = Slow reverse (hold K, tap J)
- **K+L** = Slow forward (hold K, tap L)
- **K + arrow keys** = Frame-by-frame in either direction

### Project Organization Best Practices

A well-organized project saves hours of frustration:

```
Project Root/
├── 01_RAW/          — Original footage, organized by shoot date or camera
├── 02_AUDIO/        — Music, SFX, voiceover files
├── 03_GFX/          — Graphics, logos, lower thirds, Motion Graphics templates
├── 04_SEQUENCES/    — All sequence versions (rough cut, fine cut, final)
├── 05_EXPORTS/      — Rendered exports and their settings
└── 06_ASSETS/       — Stills, documents, reference materials
```

Use color labels on clips to quickly identify status (e.g., red = needs review, green = approved).
Use markers (M) on clips and sequences to flag important moments, sync points, or notes.

---

## Common Workflows — Quick Answers

### "How do I speed up / slow down a clip?"
Three methods, each for different situations:
1. **Speed/Duration (Cmd/Ctrl+R)** — Type a percentage or new duration. Check "Ripple Edit" to adjust timeline. Check "Reverse Speed" for reverse playback.
2. **Rate Stretch tool (R)** — Drag clip edge to stretch/compress to a desired duration. Intuitive for fitting a clip to a gap.
3. **Time Remapping** — Right-click clip > Show Clip Keyframes > Time Remapping > Speed. Use the rubber band to create variable speed (speed ramps). Drag up = faster, drag down = slower. Add keyframes for transitions between speeds.

For smooth slow motion, the source footage frame rate matters. 60fps footage played in a 24fps sequence gives 2.5x slow motion natively. For further slowdown, use Optical Flow interpolation (right-click clip > Time Interpolation > Optical Flow).

### "How do I remove background noise from dialogue?"
1. Select the clip and open the **Essential Sound** panel.
2. Tag the clip as **Dialogue**.
3. Under **Repair**, enable **Reduce Noise** and adjust the slider. Start around 5-6 and increase as needed.
4. Enable **Enhance Speech** for AI-powered dialogue isolation (this is powerful — it can separate speech from background noise, music, and room tone).
5. For reverb-heavy audio, enable **Reduce Reverb**.
6. Alternatively, use the **DeNoise** and **DeReverb** effects from the Effects panel for finer control.

### "How do I add text/titles?"
1. Select the **Text tool (T)** or use the **Essential Graphics** panel.
2. Click in the Program Monitor and type.
3. Style text in the Essential Graphics panel (font, size, color, stroke, shadow, background).
4. For lower thirds and complex graphics, use **Motion Graphics templates** (browse in Essential Graphics > Browse tab).
5. For rolling credits, create text and enable **Roll** in the Essential Graphics panel.

### "How do I do a basic color grade?"
1. Open the **Lumetri Color** panel (Window > Lumetri Color, or switch to Color workspace).
2. **Basic Correction**: Set White Balance (use the eyedropper on something white), adjust Exposure, Contrast, Highlights, Shadows, Whites, Blacks. Get the image looking neutral and properly exposed first.
3. **Creative**: Apply a Look (LUT) if desired, then adjust intensity. Tweak Vibrance and Saturation.
4. **Curves**: Use RGB Curves for precise tonal control. Use Hue vs Sat, Hue vs Hue for targeted adjustments.
5. For consistency across clips, use an **Adjustment Layer** (File > New > Adjustment Layer) placed above your clips on the timeline, and apply the Lumetri effect to that.

### "What sequence settings should I use?"
Match your source footage. If your footage is:
- **1080p 24fps** → 1920×1080, 23.976fps
- **4K 30fps** → 3840×2160, 29.97fps
- **Vertical/Short-form** → 1080×1920, 29.97fps or 23.976fps (see Short-Form reference)

The easiest method: drag your first clip onto the "New Item" icon in the Project panel. Premiere creates
a sequence matching that clip's settings exactly.

---

## Tips for Speed and Efficiency

1. **Use keyboard shortcuts relentlessly.** Every mouse trip to a menu is wasted time. Learn: I/O (in/out), J/K/L (shuttle), Cmd/Ctrl+K (cut), Q/W (ripple trim), ; (lift), ' (extract), Shift+Delete (ripple delete).
2. **Work with proxies** for 4K+ footage. Create proxies on ingest (Ingest Settings) or right-click clips > Proxy > Create Proxies. Toggle between proxy and full-res with the toggle button in the Program Monitor.
3. **Use adjustment layers** for effects that should span multiple clips (color grades, letterboxing, vignettes).
4. **Nest sequences** to simplify complex sections. Select clips, right-click > Nest. The nested sequence behaves as a single clip.
5. **Use markers (M)** to flag moments of interest before you start cutting. Color-code them for different purposes.
6. **Text-Based Editing** — Transcribe your footage (Captions > Transcribe Sequence), then find and cut based on what was said. This is transformative for interview and talking-head content.
7. **Scene Edit Detection** — Right-click a long clip > Scene Edit Detection. Premiere AI finds every cut in the clip and adds markers or cuts. Essential when working with pre-edited content.
8. **Pancake Timeline** — Open two sequences stacked vertically. Drag clips from the source sequence (top) to your edit sequence (bottom). Much faster than working from the Source Monitor for multi-clip projects.
9. **Auto Reframe** — For converting horizontal footage to vertical (or vice versa). Effect > Auto Reframe, or use the Auto Reframe Sequence feature for batch conversion.
10. **Render previews (Enter)** for smooth playback of effects-heavy sections. Use Smart Rendering on export when possible to speed up renders.
