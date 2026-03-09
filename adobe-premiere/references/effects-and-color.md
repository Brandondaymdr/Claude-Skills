# Effects & Color Grading Reference

## Applying Effects

### The Effects Panel
Open with Window > Effects, or switch to the Effects workspace. Effects are organized in folders:

**Video Effects Categories:**
- **Blur and Sharpen** — Gaussian Blur, Directional Blur, Sharpen, Unsharp Mask, Camera Blur
- **Channel** — Arithmetic, Blend, Channel Mixer, Invert, Set Matte
- **Color Correction** — Lumetri Color (the main one), Brightness & Contrast, Three-Way Color Corrector (legacy), RGB Curves
- **Distort** — Corner Pin, Lens Distortion, Mirror, Spherize, Turbulent Displace, Warp
- **Generate** — 4-Color Gradient, Cell Pattern, Circle, Grid, Lens Flare, Lightning
- **Image Control** — Black & White, Color Balance, Color Pass, Gamma Correction
- **Immersive Video** — VR effects for 360 content
- **Keying** — Ultra Key (the primary chroma keyer), Color Key, Luma Key, Difference Matte, Track Matte Key
- **Noise and Grain** — Median, Noise, Dust & Scratches
- **Perspective** — Basic 3D, Drop Shadow, Bevel Edges
- **Stylize** — Emboss, Find Edges, Mosaic, Posterize, Roughen Edges, Strobe Light
- **Time** — Echo, Posterize Time
- **Transform** — Crop, Edge Feather, Horizontal/Vertical Flip, Camera Distortion Correction
- **Transition** — Block Dissolve, Gradient Wipe, Linear Wipe
- **Utility** — Cineon Converter, Color Space Converter

**Video Transitions Categories (between clips):**
- **Dissolve** — Cross Dissolve (most common), Dip to Black, Dip to White, Film Dissolve, Additive Dissolve
- **Iris** — Iris Box, Iris Cross, Iris Diamond, Iris Round
- **Page Peel** — Page Peel, Page Turn
- **Slide** — Center Split, Push, Slide, Split, Swap Wipe
- **Wipe** — Band Wipe, Barn Doors, Checkerboard Wipe, Clock Wipe, Gradient Wipe, Inset, Paint Splatter, Random Blocks, Venetian Blinds, Wedge Wipe, Wipe, Zig-Zag Blocks
- **3D Motion** — Cube Spin, Flip Over
- **Immersive Video** — VR-specific transitions

**Modern Transitions & Animations (2025+):**
90+ new built-in effects including cinematic transitions, dynamic text animations, and polished
motion graphics. Every new effect includes a "Surprise Me" button for instant randomized variations.
All GPU-accelerated for real-time performance.

### How to Apply Effects
1. **Drag and drop**: Find effect in Effects panel, drag onto clip in timeline
2. **Double-click**: Select clip first, then double-click the effect
3. **Paste Attributes**: Copy a clip with effects (Cmd/Ctrl+C), select target clips, right-click > Paste Attributes, choose which effects to paste

### Transitions
- Drag a transition to the cut point between two clips
- **Default transition**: Press **Cmd/Ctrl+D** (video) or **Cmd/Ctrl+Shift+D** (audio) to apply the default transition at the selected cut
- Default video transition is Cross Dissolve; default audio is Constant Power Crossfade
- Transitions need **handles** — extra frames beyond the In/Out points. If clips are trimmed to the very edge of the source, you'll get a "media insufficient" warning
- Adjust transition duration by dragging its edges, or set a default duration in Preferences > Timeline

### Effect Controls Panel
Select a clip to see all applied effects. Every clip has these built-in:
- **Motion**: Position, Scale, Scale Width, Rotation, Anchor Point, Anti-flicker Filter
- **Opacity**: Clip opacity and Blend Mode
- **Time Remapping**: Speed control via keyframes

For each effect parameter, you can:
- Adjust the value directly
- Toggle the stopwatch icon to enable keyframes (animation)
- Set keyframe interpolation (Linear, Bezier, Hold, Ease In/Out)
- Use the mini-timeline in Effect Controls to set precise keyframe timing

### FX Badges
Small "fx" indicators appear on clips in the timeline showing which effects are applied.
Click the badge to disable/enable effects. Useful for A/B comparison.

### Adjustment Layers
**File > New > Adjustment Layer** (or right-click in Project panel > New Item > Adjustment Layer)

An adjustment layer is a transparent clip that applies its effects to everything below it on the
timeline. Essential for:
- Applying a color grade across many clips at once
- Adding letterboxing/cinematic bars
- Global effects (vignettes, film grain, overall look)
- Easy A/B comparison — just toggle the adjustment layer's visibility

---

## Color Grading with Lumetri Color

### The Lumetri Color Panel Sections

#### 1. Basic Correction
The starting point for every color grade. Get the image technically correct before getting creative.

- **Input LUT**: Apply a technical LUT (e.g., converting LOG footage to Rec.709)
- **White Balance**: Temperature (warm/cool) and Tint (green/magenta). Use the eyedropper to click something that should be white or neutral gray.
- **Tone**: Exposure, Contrast, Highlights, Shadows, Whites, Blacks
  - **Exposure** shifts the entire tonal range
  - **Contrast** pushes highlights brighter and shadows darker
  - **Highlights/Shadows** target just the bright/dark areas
  - **Whites/Blacks** set the absolute brightest and darkest points

**The proper order**: White Balance first, then Exposure, then Contrast, then Highlights/Shadows/Whites/Blacks.

#### 2. Creative
- **Look**: Drop-down with built-in LUT presets
- **Adjustments**: Faded Film, Sharpen, Vibrance, Saturation
- **Shadow Tint / Highlight Tint**: Color the shadows and highlights (e.g., teal shadows, orange highlights for "cinematic" look)

#### 3. Curves
- **RGB Curves**: Master (luminance) and individual R, G, B channels. S-curve for contrast, lift shadows/lower highlights for a flat look.
- **Hue vs Saturation**: Target specific hues and boost or reduce their saturation
- **Hue vs Hue**: Shift specific colors to other colors (e.g., make greens more teal)
- **Hue vs Luma**: Adjust brightness of specific hue ranges
- **Luma vs Saturation**: Desaturate shadows or highlights independently
- **Saturation vs Saturation**: Boost or reduce saturation in already-saturated or unsaturated areas

#### 4. Color Wheels & Match
- **Shadow / Midtone / Highlight** color wheels for precise color pushing
- **Color Match**: Click "Comparison View" to put a reference frame next to your current frame, then click "Apply Match" to automatically match the look

#### 5. HSL Secondary
Target a specific color range and adjust it independently:
1. Use the eyedropper or the H/S/L sliders to isolate a color (e.g., skin tones, sky blue)
2. Click the color/gray toggle to see your mask (white = selected, black = not selected)
3. Refine with Denoise and Blur sliders
4. Apply corrections only to the selected range

**Classic uses**: Enhancing sky blue, warming skin tones, making grass greener.

#### 6. Vignette
Darken or lighten the edges of the frame. Useful for drawing attention to the center of the frame.
Adjust Amount, Midpoint, Roundness, and Feather.

### Color Grading Workflow

**Step 1: Normalize** — Use Basic Correction on every clip to get proper exposure and white balance.
Make clips look "correct" before they look "creative."

**Step 2: Match** — Ensure adjacent clips look consistent. Use the Color Match feature or manually
compare using the Comparison View (side-by-side or split).

**Step 3: Grade** — Apply your creative look. This is where you add mood — warm tones, desaturated
shadows, teal-and-orange, etc. Apply on an **adjustment layer** for consistency.

**Step 4: Targeted adjustments** — Use HSL Secondary or masks to adjust specific elements
(brighten a face, darken a distracting background area).

### Scopes
Enable scopes in the Lumetri Scopes panel (Window > Lumetri Scopes). Essential for accurate color work:
- **Waveform (Luma)**: Shows brightness from bottom (black) to top (white). Aim for 0-100 IRE for broadcast.
- **Waveform (RGB)**: Shows each color channel separately.
- **Vectorscope**: Shows color saturation and hue. Skin tones should fall along the skin tone line.
- **Histogram**: Shows distribution of brightness values.

**Always grade with scopes, not just by eye.** Monitors lie (different brightness, different color gamut).
Scopes show the truth.

### LUTs (Look-Up Tables)
- **Technical LUTs** convert LOG or RAW footage to standard color spaces (apply in Basic Correction > Input LUT)
- **Creative LUTs** apply a color look/grade (apply in Creative > Look, or use the Lumetri Color effect's Creative section)
- Install custom LUTs: Copy .cube files to `/Library/Application Support/Adobe/Common/LUTs/Creative/` (Mac) or the equivalent Windows path
- Don't rely solely on LUTs — they're a starting point, not a complete grade

---

## Masking

### Shape Masks
- In Effect Controls, click the rectangle, ellipse, or pen tool icons under any effect
- Draw the mask shape in the Program Monitor
- Adjust Mask Path, Mask Feather, Mask Opacity, Mask Expansion
- Invert the mask to affect everything outside the shape

### Object Masking (2025+)
AI-powered masking that tracks objects automatically:
- Select a clip, go to Effect Controls
- Use the Object Masking tools
- Premiere identifies and tracks objects in the frame
- Refine masks at clip or frame level

### Track Matte Key
Apply the Track Matte Key effect to a clip, then reference another track's clip as the matte.
The matte clip's luminance or alpha determines what's visible.

---

## Keying (Green Screen / Chroma Key)

### Ultra Key Effect (Primary Method)
1. Apply **Ultra Key** effect to the green screen clip
2. Use the eyedropper to click the green/blue screen color
3. Set the **Output** to "Alpha Channel" to see the matte quality
4. Fine-tune with:
   - **Matte Generation**: Transparency, Highlight, Shadow, Tolerance, Pedestal
   - **Matte Cleanup**: Choke, Soften, Contrast, Mid Point
   - **Spill Suppression**: Desaturate, Range, Spill, Luma
5. Switch Output back to "Composite" to see the final result

**Tips for clean keys**:
- Use the **Setting** dropdown: Start with "Default", then try "Relaxed" or "Aggressive"
- Check edges at 100% zoom
- Apply a subtle Gaussian Blur to the matte edges to soften them
- Add a light spill suppression pass
- Match the keyed subject's color temperature to the background plate

---

## Keyframe Animation

### Setting Keyframes
1. Select clip, open Effect Controls
2. Click the **stopwatch** icon next to any parameter to enable keyframes
3. Move the playhead to the start position, set the value
4. Move the playhead to the end position, change the value
5. Premiere interpolates between them

### Keyframe Types
- **Linear**: Constant rate of change (robotic)
- **Bezier**: Smooth acceleration/deceleration (natural). Right-click keyframe > Temporal Interpolation > Bezier
- **Ease In/Out**: Preset curves. Right-click keyframe > Ease In or Ease Out
- **Hold**: Jumps to the next value instantly (no in-between)

### Common Animations
- **Scale up/down**: Animate Scale in Motion for zoom effects
- **Position**: Animate Position for pan/slide effects
- **Opacity**: Animate for fade in/out
- **Crop**: Animate Crop values for reveal effects
- **Speed ramp**: Use Time Remapping keyframes for dramatic speed changes
