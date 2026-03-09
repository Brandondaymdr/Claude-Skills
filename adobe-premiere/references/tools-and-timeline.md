# Tools & Timeline Reference

## Tools Panel — Complete Reference

The Tools panel is the main toolbar for clip editing and timeline manipulation. Tools can be selected
by clicking or by pressing their keyboard shortcut. The pointer changes shape to reflect the active tool.

### Selection Tool (V) — Default
The standard multipurpose tool. Use it for:
- Selecting clips, transitions, and keyframes
- Moving clips by dragging (hold Shift to constrain to track)
- Resizing clips by dragging edges (basic trim, not ripple)
- Selecting multiple clips with marquee (drag an empty area) or Shift-click
- Moving keyframes in the Effect Controls panel

**Pro tip**: Always return to V after using a specialized tool. If Premiere isn't responding the way
you expect, press V — you're probably still in another tool.

### Track Select Forward Tool (A)
Selects a clip and all clips to the right of it on the same track. Useful for sliding an entire
section of the timeline forward or backward.
- **A** = Single track (just the clicked track)
- **Shift+A** = All tracks (selects forward on every track)
- Great for making room when you need to insert a section

### Ripple Edit Tool (B)
Trims the In or Out point of a clip while automatically closing or opening gaps in the timeline.
Everything after the edit shifts to compensate.
- Drag the left edge = trim the In point (start of clip)
- Drag the right edge = trim the Out point (end of clip)
- The timeline gets shorter or longer by exactly the amount you trim
- **When to use**: You want to shorten a clip and have everything close up automatically

**Keyboard alternative**: Position playhead near a cut, then press **Q** (ripple trim to playhead
from the left) or **W** (ripple trim to playhead from the right). These are extremely fast.

### Rolling Edit Tool (N)
Moves the cut point between two adjacent clips. One clip gets shorter while the other gets longer
by the exact same amount. Total timeline duration doesn't change.
- Drag the edit point left = clip on left gets shorter, clip on right gets longer
- Drag the edit point right = clip on left gets longer, clip on right gets shorter
- **When to use**: The total timing is right but the cut happens at the wrong moment

### Razor Tool (C)
Splits a clip at the exact point you click. Creates a through-edit (cut) that divides the clip
into two independent segments.
- Click on a clip = cut that clip only
- **Shift+click** = cut all clips on all tracks at that point
- **When to use**: Creating cuts at specific visual moments

**Keyboard alternative**: **Cmd/Ctrl+K** cuts at the playhead position on targeted/selected tracks.
This is faster than the Razor tool for most situations — position the playhead with J/K/L, then cut.

### Slip Tool (Y)
Changes which frames are shown in a clip without moving it or changing its duration. Think of it
as sliding the footage underneath a fixed window.
- The clip stays in the same position on the timeline
- The clip keeps the same duration
- The In and Out points shift together
- **When to use**: You've got a 3-second gap and the clip fills it perfectly, but you want to show
  a different 3-second portion of the source footage

The Program Monitor shows four frames during a slip: the Out of the previous clip, the new In,
the new Out, and the In of the next clip.

### Slide Tool (U)
Moves a clip along the timeline while adjusting the neighboring clips to compensate. The sliding
clip's content doesn't change — it keeps the same In/Out points — but its position shifts.
- The clip on the left gets shorter or longer
- The clip on the right gets shorter or longer (inversely)
- The moved clip's content stays identical
- **When to use**: A clip is in the right spot creatively but needs to shift slightly earlier or later

### Pen Tool (P)
Creates and adjusts keyframes on clip rubber bands (opacity, volume, effect parameters displayed in timeline).
- Click on a rubber band = add a keyframe
- Cmd/Ctrl+click = add a keyframe
- Drag a keyframe up/down = adjust value
- Click between keyframes on the line = adjust the level for that segment
- Shift+click = select non-contiguous keyframes
- **When to use**: Adjusting audio levels, opacity fades, or any effect directly on the timeline

### Hand Tool (H)
Pans the timeline view left/right without moving any clips. Drag to scroll.
- **When to use**: Navigating a long timeline
- **Pro tip**: Hold spacebar to temporarily switch to Hand tool from any other tool

### Text Tool (T)
Click in the Program Monitor to create a text layer. Opens the Essential Graphics panel for styling.
- Click once = point text (doesn't wrap)
- Click and drag = area text (wraps within the box)

### Shape Tool
Creates rectangle, ellipse, and polygon shapes directly in the Program Monitor.
- Used for graphic elements, backgrounds behind text, simple animations
- Also used for creating masks on clips

### Generative Extend Tool
AI-powered tool (2025+) that extends video and audio clips by generating new frames using Adobe's
Firefly Video Model. Useful for extending a clip by a second or two for timing purposes.

---

## Timeline Operations

### Adding Clips to the Timeline
| Method | How | Best for |
|--------|-----|----------|
| Drag from Project panel | Drag clip to timeline | Quick rough cuts |
| Drag from Source Monitor | Set I/O in Source, drag to timeline | Precise clip placement |
| Insert (,) | Source Monitor I/O set, press comma | Adding without overwriting |
| Overwrite (.) | Source Monitor I/O set, press period | Replacing existing content |
| Source Patching | Set source patch indicators on tracks | Controlling which tracks receive the edit |
| Automate to Sequence | Project panel > select clips > Automate to Sequence | Building montages from multiple clips |

### Source Patching vs Track Targeting
**Source Patching** (left-side indicators on tracks): Controls where Insert and Overwrite edits land.
The blue V1/A1 etc. badges on the track headers can be dragged to different tracks.

**Track Targeting** (right-side indicators): Controls which tracks are affected by keyboard shortcuts
like Cmd/Ctrl+K (add edit), and which tracks paste operations land on.

### Track Management
- **Add Track**: Right-click in track header area > Add Track (or Add Tracks for multiple)
- **Delete Track**: Right-click track header > Delete Track
- **Lock Track**: Click the padlock icon on the track header. Locked tracks can't be edited
- **Sync Lock**: The toggle boxes next to track names. When enabled, clips on that track shift
  with insert/ripple edits on other tracks. Keep this ON for tracks you want to stay in sync.
- **Toggle Track Output**: The eye icon (video) or speaker icon (audio) enables/disables track playback

### Navigating the Timeline
| Action | Shortcut |
|--------|----------|
| Play/Pause | Space |
| Play forward | L |
| Play backward | J |
| Stop | K |
| Frame forward | Right Arrow |
| Frame backward | Left Arrow |
| Jump to next edit | Down Arrow |
| Jump to previous edit | Up Arrow |
| Jump to next marker | Shift+M (or Shift+Down on some configs) |
| Go to sequence start | Home |
| Go to sequence end | End |
| Zoom in on timeline | = (equals) |
| Zoom out on timeline | - (minus) |
| Zoom to fit entire sequence | \ (backslash) |
| Scroll timeline | Hold Space and drag, or use scroll wheel |

### Markers
- **M** = Add marker at playhead (on sequence or clip, depending on selection)
- **Double-click marker** = Edit marker properties (name, comments, color, duration)
- **Shift+M** = Go to next marker
- Markers can be used as chapter markers in exported files
- Color-code markers for different purposes (e.g., red = fix needed, green = approved, blue = b-roll here)

### Nesting Sequences
Select clips, right-click > Nest. This creates a new sequence containing those clips and replaces
them in the current timeline with a single nested clip.

**When to use nesting**:
- Applying an effect to a group of clips as one unit
- Simplifying a complex section of the timeline
- Creating a reusable section (the nested sequence appears in your Project panel)
- Speed changes on a group of clips
- Stabilization that needs to see the full frame (nest first, then apply Warp Stabilizer)

**Caution**: Over-nesting makes projects hard to navigate. Use it intentionally, not as a default.

### Multi-Camera Editing
1. Select synced clips in the Project panel
2. Right-click > Create Multi-Camera Source Sequence (sync by audio, timecode, or In points)
3. Create a new sequence from the multi-cam clip
4. Open the multi-cam view in the Program Monitor (wrench icon > Multi-Camera)
5. Play the sequence and click camera angles in real-time to make your cut
6. Fine-tune cuts afterward with the Rolling Edit tool

---

## Clip Operations

### Linking and Unlinking Audio/Video
- **Linked clips**: Video and audio move together. Default for imported A/V clips.
- **Unlink**: Right-click clip > Unlink, or select and press Cmd/Ctrl+L
- **Temporarily override**: Hold **Alt/Option** while clicking to select just video or just audio
- **Re-link**: Select both parts, right-click > Link

### Replace Edit
Replaces a clip in the timeline with a clip from the Source Monitor, maintaining the exact duration
and position. Set an In point in the Source Monitor, select the clip to replace, then:
- **Alt/Option+drag** from Source Monitor
- Or use the keyboard shortcut (assign one in Keyboard Shortcuts if not set)

### Match Frame
**F** = Loads the clip at the playhead into the Source Monitor, cued to the exact frame you're looking at.
Incredibly useful for finding the source clip when you need more footage from the same take.

**Reverse Match Frame (Shift+R)** = From the Source Monitor, finds where that frame appears in the timeline.
