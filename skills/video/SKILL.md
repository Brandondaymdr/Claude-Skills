# Video Editing Skill

> Video editing with FFmpeg and Remotion - stitching, transitions, captions, teasers, transcription, title cards, graphics generation

## Activation

This skill activates when users mention:
- Video editing, stitching, or combining clips
- Adding captions, subtitles, or text overlays
- Creating teasers or trailers
- Transcription or speech-to-text
- FFmpeg or Remotion
- TikTok-style content
- Video transitions or effects

## Intelligent Workflow

Follow this process for all video projects:

1. **Analyze** - Review source videos (duration, format, content)
2. **Transcribe** - Extract audio and generate transcripts
3. **Clarify** - Confirm objectives and style preferences
4. **Plan** - Design edit sequence and effects
5. **Execute** - Implement with QA tests
6. **Preview** - Show results before final render
7. **Iterate** - Refine based on feedback

## Tool Selection Guide

### When to Use FFmpeg

Best for:
- Fast CLI operations
- Batch processing
- Format conversion
- Simple concatenation
- Audio extraction
- Quick cuts and trims

```bash
# Example: Concatenate videos
ffmpeg -f concat -safe 0 -i list.txt -c copy output.mp4
```

### When to Use Remotion

Best for:
- Styled content with animations
- TikTok-style dynamic captions
- Complex transitions
- Preview capabilities
- React-based rendering
- Branded graphics

```bash
# Example: Preview in Remotion Studio
npx remotion studio
```

## Quick Start Commands

### Setup Transcription

```bash
# Install whisper.cpp
npm install @remotion/install-whisper-cpp

# Download model
npx @remotion/install-whisper-cpp --model base.en
```

### Basic FFmpeg Operations

```bash
# Extract audio
ffmpeg -i input.mp4 -vn -acodec pcm_s16le -ar 16000 -ac 1 audio.wav

# Trim video
ffmpeg -i input.mp4 -ss 00:00:10 -t 00:00:30 -c copy output.mp4

# Add subtitles
ffmpeg -i input.mp4 -vf "subtitles=subs.srt" output.mp4
```

### Remotion Preview/Render

```bash
# Start preview
npx remotion studio

# Render video
npx remotion render src/index.tsx MyComposition output.mp4
```

## Transcription

### Recommended: whisper.cpp

> **Do NOT use Python `whisper`** - it's 10x slower. Always use `@remotion/install-whisper-cpp`

### Performance Comparison

| Tool | 8.5min Video | GPU Support |
|------|--------------|-------------|
| Python whisper | 15+ minutes | Limited |
| whisper.cpp | ~85 seconds | Metal/CUDA |

### Model Selection

| Model | Size | Speed | Quality |
|-------|------|-------|---------|
| tiny.en | 75MB | Fastest | Basic |
| base.en | 142MB | Fast | Good |
| small.en | 466MB | Medium | Better |
| medium.en | 1.5GB | Slow | Great |
| large-v3-turbo | ~3GB | Slowest | Best |

**Recommendation:** Use `base.en` for development, larger models for final output.

### Transcription Script

```javascript
import { transcribe } from '@remotion/install-whisper-cpp';

const result = await transcribe({
  inputPath: 'audio.wav',
  whisperPath: './whisper.cpp',
  model: 'base.en',
  tokenLevelTimestamps: true,  // Required for word-level captions
});
```

## Captions Best Practices

### Font Recommendations

| Font | Rating | Notes |
|------|--------|-------|
| Roboto | 9.5/10 | Modern, highly readable |
| Helvetica Neue | 9.3/10 | Clean, professional |
| Open Sans | 9.0/10 | Versatile, accessible |

### Color Guidelines

- **Standard text:** White `#FFFFFF`
- **Active word highlight:** Yellow `#FFD700`
- **Outline/stroke:** Black for visibility on any background

### Positioning

- **Horizontal video:** Bottom 20-25%
- **Vertical video:** Centered
- **Safe zones:** Keep away from edges

### Timing

- Display duration: 1.5-3 seconds
- Reading speed: 180-200 words per minute
- Transitions: 0.2 second fade recommended

### FFmpeg Subtitles

```bash
ffmpeg -i input.mp4 -vf "subtitles=subs.srt:force_style='FontSize=24,OutlineColour=&H40000000,BorderStyle=3'" output.mp4
```

### Remotion Captions

```jsx
import { Caption } from '@remotion/captions';

<Caption
  text={word}
  style={{
    color: isActive ? '#FFD700' : '#FFFFFF',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
  }}
/>
```

## Teaser Guidelines

### Content Rules

1. **Avoid pronouns at clip start** - Each clip must have an explicit subject
2. **Hook in first 3 seconds** - Capture attention immediately
3. **Playback speed:** 1.3x recommended for energy
4. **Transitions:** 0.4 seconds, smooth crossfades

### Structure

```
[Hook - 3s] → [Highlight 1 - 5s] → [Highlight 2 - 5s] → [CTA - 3s]
```

## Important Gotchas

### Filenames

```bash
# ❌ WRONG - spaces cause issues
"My Video File.mp4"

# ✅ CORRECT - no spaces
"my-video-file.mp4"
```

### Codec Compatibility

Always check codecs before concatenating:

```bash
ffprobe -v quiet -show_entries stream=codec_name input.mp4
```

### Word-Level Timestamps

For dynamic caption highlighting, you MUST have word-level timestamps:

```bash
# whisper.cpp flag
-ml 1  # Maximum segment length = 1 word
```

Or in code:

```javascript
tokenLevelTimestamps: true
```

### Preview Before Render

Always use Remotion Studio to preview before final render:

```bash
npx remotion studio
```

## Reference Structure

```
skills/video/
├── SKILL.md (this file)
└── references/
    ├── captions.md      # Detailed caption styling
    ├── transcription.md # Whisper setup and usage
    ├── ffmpeg.md        # FFmpeg command reference
    └── remotion.md      # Remotion patterns
```

## Completion Checklist

Before delivering:
- [ ] Source videos analyzed
- [ ] Transcription completed (if needed)
- [ ] Preview shown to user
- [ ] Final render quality verified
- [ ] Output file delivered
