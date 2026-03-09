# Short-Form Content Workflow — Cutting Long-Form to Shorts/Reels

This is the complete guide for taking long-form video and cutting it into 1-3 minute shorts
for Instagram Reels, YouTube Shorts, TikTok, and similar vertical platforms.

## Platform Specs (2025)

| Platform | Max Length | Aspect Ratio | Resolution | Frame Rate |
|----------|-----------|-------------|------------|------------|
| Instagram Reels | 15 min (but 60-90s performs best) | 9:16 | 1080×1920 | 30fps recommended |
| YouTube Shorts | 3 min max | 9:16 | 1080×1920 | 30fps or 60fps |
| TikTok | 10 min (but 60s-3min sweet spot) | 9:16 | 1080×1920 | 30fps or 60fps |
| Instagram Stories | 60s per story | 9:16 | 1080×1920 | 30fps |
| Facebook Reels | 90s recommended | 9:16 | 1080×1920 | 30fps |

**The engagement sweet spot**: 60 seconds to 90 seconds for most platforms. YouTube Shorts can
go up to 3 minutes, but front-load the hook in the first 2-3 seconds regardless of length.

## Step 1: Setting Up the Vertical Sequence

### Create a 9:16 Sequence
1. File > New > Sequence
2. Under **Settings** tab:
   - Frame Size: **1080 × 1920** (width × height)
   - Frame Rate: **29.97 fps** (or 23.976 if your source is 24fps)
   - Pixel Aspect Ratio: Square Pixels (1.0)
   - Fields: No Fields (Progressive)
3. Or use a preset: Under **Digital SLR** or **Custom**, look for 1080×1920 options

**Quick method**: Create one vertical sequence with your ideal settings, then right-click it in the
Project panel > New Sequence From Clip. Save it as a custom preset for future use.

### Template Sequence Approach (Recommended for Batch Work)
Create a master template sequence with:
- 1080×1920 resolution
- Your standard adjustment layers (color grade, letterboxing if needed)
- Text template positioned in the safe zone
- Background music on the music track at the right level

Duplicate this sequence for each new short: right-click > Duplicate. Rename with the short's topic.

## Step 2: Finding the Best Moments

### Text-Based Editing (The Secret Weapon)
This is the single fastest method for finding moments in long-form content:

1. Import your long-form video into the project
2. Select the clip in the Project panel
3. Go to **Captions** workspace or Window > Text
4. Click **Transcribe** (Premiere uses AI speech-to-text)
5. Once transcribed, browse the transcript — click any word to jump to that moment
6. Highlight a section of text and drag it to the timeline to create a clip of just that section
7. Use **Search** within the transcript to find specific topics or keywords

This lets you "read" your video instead of watching the whole thing. For a 1-hour video, you can
scan the transcript in minutes and identify the 5-10 best moments for shorts.

### Scene Edit Detection
If your long-form video is already edited (with cuts):
1. Right-click the clip in the Project panel > Scene Edit Detection
2. Premiere AI identifies every cut point
3. Creates markers or subclips at each cut
4. Useful for breaking down a finished video into individual segments

### Marker Workflow
Watch your long-form content at 1.5-2x speed (press L multiple times):
1. Press **M** to drop a marker whenever you hear a good moment
2. Double-click markers to add notes ("great quote about X", "funny moment", "key tip")
3. Color-code markers by content type:
   - **Green** = Strong standalone moment (will work as a short)
   - **Yellow** = Good but needs context (might need an intro added)
   - **Red** = Great quote but needs visual enhancement (b-roll, text overlay)

### Pancake Timeline for Extraction
1. Open your long-form sequence in the Timeline
2. Create your vertical short sequence
3. Stack them vertically (drag the divider between them)
4. Drag clips directly from the long-form sequence to the short sequence

## Step 3: Reframing Horizontal to Vertical

### Auto Reframe Effect (Fastest Method)
For clips where the subject moves around the frame:
1. Select the horizontal clip in your vertical sequence
2. Effects panel > search "Auto Reframe"
3. Apply the **Auto Reframe** effect
4. In Effect Controls, choose Motion Tracking:
   - **Slower Motion**: For talking heads, interviews
   - **Default**: Balanced
   - **Faster Motion**: For action, sports
5. Premiere AI tracks the subject and reframes automatically
6. Manually adjust keyframes if the AI tracking isn't perfect

### Auto Reframe Sequence (Batch Method)
For converting an entire sequence at once:
1. Right-click your horizontal sequence in the Project panel
2. Select **Auto Reframe Sequence**
3. Choose target aspect ratio (9:16 for vertical)
4. Choose motion tracking preset
5. Premiere creates a new sequence with all clips reframed

### Manual Reframe (Most Control)
For clips where you want precise creative control:
1. Place horizontal clip in vertical sequence
2. Select clip, go to Effect Controls > Motion
3. **Scale** the clip up until it fills the vertical frame (typically 175-225% for 16:9 to 9:16)
4. **Position** to frame the subject (move X value left/right)
5. Keyframe Position if the subject moves and you need to follow them

**Rule of thirds in vertical**: For talking-head content, position eyes at the upper third line.
Leave room at bottom for caption text overlays and platform UI elements.

### Crop + Scale Method
1. Apply the **Crop** effect
2. Crop left and right equally to create a vertical composition from the horizontal frame
3. Scale up to fill the frame
4. Useful when you want to maintain the exact vertical slice without any AI reframing

## Step 4: Editing the Short

### Structure for High-Performing Shorts

**The Hook (First 1-3 seconds)**: The most critical part. Options:
- Start with the most provocative/interesting statement (trim the buildup)
- Add a text overlay with the topic/question ("The #1 mistake in...")
- Use a pattern interrupt — a visual or audio element that grabs attention
- Start mid-sentence at the most compelling part

**The Body (Core content)**:
- Keep cuts tight — remove all dead air, "ums", long pauses
- Use jump cuts aggressively (this is expected in short-form content)
- Add b-roll over cuts to hide jump cuts when desired
- Maintain energy — if the pace drops, you'll lose viewers

**The End**: Avoid long outros. Options:
- End on the strongest statement (cut before they trail off)
- Add a call to action as a text overlay
- Loop-friendly endings (the last frame connects to the first for TikTok loops)

### Text Overlays for Shorts

Text overlays are practically mandatory for short-form content (many viewers watch without sound):

1. Use the **Text Tool (T)** or Essential Graphics panel
2. **Font**: Bold, sans-serif fonts work best (Montserrat Bold, Arial Black, Bebas Neue, Oswald)
3. **Size**: Large enough to read on mobile — minimum 60-80pt for headlines
4. **Position**: Center of frame or upper third. Keep text within the **Title Safe** zone
   (especially important — Instagram/TikTok UI covers the top and bottom edges)
5. **Style**: White text with a dark stroke/outline for readability over any background,
   or use a dark semi-transparent background box
6. **Animation**: Simple scale-up or pop-in animations. Don't overdo it.

**Safe Zones for Vertical Content**:
- **Top 15%**: Platform UI (username, follow button) — avoid placing text here
- **Bottom 20%**: Caption area, like/comment buttons — avoid placing text here
- **Center 65%**: Safe area for text overlays and key visual content

### Captions/Subtitles

Auto-generated captions are essential for short-form engagement:
1. In the Captions workspace, click **Transcribe Sequence**
2. Click **Create Captions** after transcription
3. Choose style: adjust font, size, position, background
4. Common styles for shorts:
   - **Word-by-word highlight**: Each word lights up as spoken (high engagement)
   - **One line centered**: Clean look, 1-2 lines max
   - **Large centered text**: 2-3 words at a time, large and bold

Position captions in the center-lower area of the safe zone, not at the very bottom where
platform UI will overlap them.

### Jump Cut Editing

Jump cuts are the standard editing style for short-form content:
1. Select the clip on the timeline
2. Use **Cmd/Ctrl+K** to cut at every pause, "um", dead space, or tangent
3. Select the unwanted segments and press **Shift+Delete** (Ripple Delete) to remove them
   and close the gaps automatically
4. Result: tight, punchy cuts that keep energy high

**Speed tip**: Use Text-Based Editing to do this from the transcript:
1. Transcribe the clip
2. In the transcript, select the filler words/pauses
3. Delete them — Premiere removes those portions from the timeline

### Adding Music

Background music under dialogue is standard for shorts:
1. Import your music file and place on an audio track below dialogue
2. Tag as **Music** in Essential Sound
3. Enable **Ducking** — set to duck against your dialogue track
4. Set duck amount to -15 to -20 dB
5. Generate keyframes
6. Adjust music start/end to match your clip — fade in 0.5s, fade out 1-2s

**Music volume relative to dialogue**: Music should sit at roughly -20 to -25 dB below dialogue
level. Dialogue is king — music should enhance mood without competing.

## Step 5: Export Settings for Short-Form

### Instagram Reels / YouTube Shorts / TikTok

**Quick Export**: File > Export Media (Cmd/Ctrl+M)
- Format: **H.264**
- Preset: **Match Source - High Bitrate** (then customize below)
- Resolution: **1080 × 1920**
- Frame Rate: **29.97** (or match source)
- Bitrate Encoding: **VBR, 2 Pass** for best quality
- Target Bitrate: **15-20 Mbps** (platforms will re-encode anyway, give them good source material)
- Maximum Bitrate: **25 Mbps**
- Audio: **AAC, 320 kbps, Stereo, 48kHz**

**For maximum quality on YouTube**:
- Consider exporting in **H.265 (HEVC)** if you have hardware encoding support
- Or export **ProRes 422** and let YouTube process the high-quality source

### Batch Exporting Multiple Shorts
When you've created multiple short sequences from one long-form video:
1. **Adobe Media Encoder** is your friend — queue up all sequences
2. In Premiere: File > Export Media, then click **Queue** (instead of Export) to send to Media Encoder
3. Repeat for each sequence
4. Media Encoder processes them all in the background while you continue editing

Alternatively, use **Export presets** — create one preset for "Instagram Reel" and apply it to
all sequences in the queue.

## Workflow Summary: Long-Form to Shorts Pipeline

```
1. Import long-form video
2. Transcribe (Captions > Transcribe)
3. Scan transcript for best moments (or use markers while watching)
4. Create vertical template sequence (1080×1920)
5. Duplicate template for each short
6. Extract moments: drag from transcript or source sequence
7. Reframe: Auto Reframe effect or manual scale+position
8. Trim tight: remove dead air, filler, slow parts
9. Add hook text overlay (first 1-3 seconds)
10. Add captions (Transcribe > Create Captions)
11. Add background music + auto-ducking
12. Color grade (match the long-form grade or apply fresh)
13. Export H.264 1080×1920 at 15-20 Mbps
14. Queue batch exports in Media Encoder
```

## Pro Tips for Short-Form Content

1. **Hook test**: Watch your first 3 seconds with fresh eyes. Would YOU stop scrolling?
   If not, find a more compelling opening.

2. **The 3-second rule**: Platforms measure "retention" from the first frame. If viewers
   scroll past in 3 seconds, the algorithm buries your content.

3. **Pacing**: For short-form, cut every 2-5 seconds. Long static shots kill retention
   unless the content is incredibly compelling.

4. **Visual variety**: Alternate between wide, medium, and close-up angles. If you only
   have one camera angle, use scale keyframes to create artificial "cuts" (zoom in to
   115-120% for the "close-up").

5. **End screen**: Don't waste the last 3-5 seconds on a static end card. End on strong
   content and use the platform's built-in end screen tools.

6. **Batch workflow**: Develop 5-10 shorts at once, not one at a time. It's much more
   efficient to do all transcription, then all rough cuts, then all reframing, etc.

7. **Save your settings**: Create custom presets for sequence settings and export settings.
   Never manually configure the same thing twice.

8. **Preview on your phone**: Before finalizing, export a test version and watch it on your
   phone in the actual app. Desktop monitors can be deceiving for vertical content.
