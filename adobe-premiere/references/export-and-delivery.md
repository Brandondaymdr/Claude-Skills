# Export & Delivery Reference

## Export Basics

### Export Media Dialog (Cmd/Ctrl+M)
This is the main export interface. Key sections:

**Format**: The container/codec combination.
- **H.264** — The universal standard. Works everywhere. Best for web, social media, general delivery.
- **H.265 (HEVC)** — Better compression than H.264 at same quality. Slower to encode. Good for 4K.
- **ProRes** — Apple's professional codec. Large files, excellent quality, fast to encode/decode. Best for archival, delivery to other editors, or as source for platforms that re-encode.
- **DNxHR/DNxHD** — Avid's professional codec. Similar use case to ProRes, but cross-platform.
- **QuickTime** — Container format that can hold various codecs (ProRes, etc.)
- **MXF OP1a** — Broadcast delivery format.

**Preset**: Pre-configured settings for common use cases. Start here, then customize.

**Output Name**: Click to change filename and destination.

**Source Range**: What to export.
- **Entire Sequence**: Exports everything from first clip to last clip
- **In to Out**: Only exports between your In/Out points on the timeline
- **Work Area**: Exports the work area bar range
- **Custom**: Set specific start/end times

### Video Settings

**Resolution**: Match your sequence settings unless you need a specific output size.
- Downscaling 4K to 1080p: Check "Scale to Fill" or "Scale to Fit"
- Upscaling: Avoid if possible. 1080p footage exported at 4K doesn't gain quality.

**Frame Rate**: Match source. Changing frame rate causes stuttering or interpolation artifacts.

**Bitrate Settings**:
| Encoding | What it means | When to use |
|----------|-------------|-------------|
| CBR (Constant Bitrate) | Same data rate throughout | Predictable file sizes, streaming |
| VBR 1 Pass | Variable rate, single analysis pass | Fast export, acceptable quality |
| VBR 2 Pass | Variable rate, analyzes twice | Best quality, slower export |

**Bitrate recommendations**:
| Content | Resolution | Target Bitrate | Max Bitrate |
|---------|-----------|----------------|-------------|
| Social media (general) | 1080p | 10-15 Mbps | 15-20 Mbps |
| High quality web | 1080p | 15-20 Mbps | 25 Mbps |
| YouTube upload | 1080p | 15-20 Mbps | 25 Mbps |
| YouTube upload | 4K | 35-45 Mbps | 55 Mbps |
| Professional delivery | 1080p | 35-50 Mbps (ProRes) | N/A |
| Archival | 4K | 100+ Mbps (ProRes 422 HQ) | N/A |

### Audio Settings
- **Codec**: AAC for H.264/HEVC, PCM/Uncompressed for ProRes/professional delivery
- **Sample Rate**: 48kHz (standard for video production — never use 44.1kHz for video)
- **Channels**: Stereo for most delivery, Mono for single-speaker shorts
- **Bitrate**: 320kbps for AAC (maximum quality), 256kbps acceptable

### Render at Maximum Depth
Check this box when:
- You have effects that benefit from higher bit-depth processing (color corrections, gradients)
- You're going from a high-bit-depth source (10-bit, 12-bit, LOG, RAW) to 8-bit output
- Quality matters more than export speed

### Use Maximum Render Quality
Check this box when:
- Scaling footage (4K down to 1080p, or any resize)
- Improves resampling quality for resized clips
- Adds export time but produces visibly sharper results when scaling is involved

### Hardware Encoding
- **Software Encoding**: Higher quality, slower. Uses CPU.
- **Hardware Encoding** (Intel QSV, NVIDIA NVENC, Apple VideoToolbox): Much faster, slightly lower quality at same bitrate. Uses GPU.
- For social media delivery, hardware encoding is perfectly acceptable.
- For master/archival exports, prefer software encoding or ProRes.

---

## Platform-Specific Export Settings

### YouTube
**Standard Upload:**
- Format: H.264
- Resolution: Match source (1080p, 1440p, or 4K)
- Frame Rate: Match source
- Bitrate: VBR 2 Pass, 15 Mbps target (1080p) / 40 Mbps (4K)
- Audio: AAC, 320kbps, 48kHz, Stereo

**For YouTube HDR:**
- Export as ProRes 4444 or H.265 with HDR metadata
- Include HDR10 or HLG metadata
- Upload to YouTube — it processes HDR automatically

### Instagram (Feed, Reels, Stories)
- Format: H.264
- Resolution: 1080×1920 (Reels/Stories), 1080×1080 (Feed square), 1080×1350 (Feed portrait)
- Frame Rate: 30fps
- Bitrate: VBR 2 Pass, 10-15 Mbps (Instagram re-encodes heavily — higher source = better result)
- Audio: AAC, 256-320kbps, 48kHz
- Max file size: 4GB (Reels), 250MB (Stories)

### TikTok
- Format: H.264
- Resolution: 1080×1920
- Frame Rate: 30fps or 60fps
- Bitrate: VBR 2 Pass, 15-20 Mbps
- Audio: AAC, 256-320kbps, 48kHz
- Max file size: 287MB (mobile), 500MB (desktop)

### Twitter/X
- Format: H.264
- Resolution: 1920×1080 (landscape) or 1080×1920 (portrait)
- Frame Rate: 30 or 60fps
- Bitrate: VBR 2 Pass, 10-15 Mbps
- Audio: AAC, 256kbps
- Max duration: 2 min 20 sec (unless Twitter Blue: 60 min)

### Facebook
- Format: H.264
- Resolution: 1920×1080 (feed), 1080×1920 (Reels)
- Frame Rate: 30fps
- Bitrate: VBR 2 Pass, 10-15 Mbps
- Audio: AAC, 256kbps, 48kHz

### Broadcast/TV Delivery
- Format varies by broadcaster — always ask for their spec sheet
- Common: ProRes 422 HQ or DNxHR HQ in MXF or QuickTime container
- Must meet loudness standards: -24 LUFS (US ATSC) / -23 LUFS (EU EBU R128)
- Must meet video levels: 0-100 IRE (no super-whites or super-blacks)

---

## Adobe Media Encoder

Media Encoder is a separate application that handles rendering in the background while you
continue editing in Premiere.

### Workflow
1. In Premiere: File > Export Media (Cmd/Ctrl+M)
2. Configure your settings
3. Click **Queue** (not Export) — this sends the job to Media Encoder
4. Repeat for additional sequences
5. Media Encoder opens and shows the queue
6. Click the green play button to start rendering all queued exports
7. Continue editing in Premiere while exports render

### Watch Folders
Set up a folder that Media Encoder monitors. Drop files in, and they're automatically
encoded with your specified settings. Useful for automated workflows.

### Ingest Presets
Configure Media Encoder to automatically transcode media on import — useful for converting
camera-native formats to editing-friendly codecs.

---

## Proxy Workflow

### Why Use Proxies
4K+ footage is demanding on systems. Proxies are low-resolution copies you edit with,
then switch back to full-resolution for export.

### Creating Proxies
**On Ingest:**
1. In Project panel, click the wrench icon > Ingest Settings
2. Check "Ingest" and select "Create Proxies"
3. Choose a proxy preset (ProRes Proxy, GoPro CineForm, H.264 1024×540)
4. Set proxy destination folder
5. All imported media automatically generates proxies

**After Import:**
1. Select clips in Project panel
2. Right-click > Proxy > Create Proxies
3. Choose preset and destination

### Toggling Proxy/Full-Res
Add the **Toggle Proxies** button to the Program Monitor toolbar:
1. Click the + button below the Program Monitor
2. Drag "Toggle Proxies" to the button bar
3. Click to switch between proxy and full-res playback

**Always export with proxies OFF** (full resolution). Premiere does this automatically,
but verify before final export.

---

## Smart Rendering
If your sequence codec matches your export codec, Premiere can "smart render" — copying
sections that haven't changed without re-encoding them. This dramatically speeds up export.

Requirements:
- Same codec and settings in sequence and export
- Sections with no effects or transitions are copied directly
- Most effective with ProRes or DNxHR workflows

---

## Export Presets — Save and Reuse
After configuring export settings:
1. Click the **Save Preset** icon (disk icon) next to the Preset dropdown
2. Name it descriptively (e.g., "YouTube 1080p Best Quality", "IG Reel 9x16")
3. Reuse by selecting from the Preset dropdown in future exports

Create presets for all your common delivery formats to save time and ensure consistency.
