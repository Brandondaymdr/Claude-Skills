# Video Captions Reference

> Comprehensive guide for adding subtitles and captions to videos

## Caption Design Best Practices

### Font Recommendations

| Font | Rating | Best For |
|------|--------|----------|
| Roboto | 9.5/10 | Modern content, YouTube |
| Helvetica Neue | 9.3/10 | Professional, corporate |
| Open Sans | 9.0/10 | General purpose |
| Montserrat | 8.8/10 | Bold statements |
| Lato | 8.5/10 | Subtle, elegant |

### Color Guidelines

| Element | Color | Hex Code |
|---------|-------|----------|
| Standard text | White | `#FFFFFF` |
| Active word | Yellow | `#FFD700` |
| Outline/stroke | Black | `#000000` |
| Shadow | Black 50% | `rgba(0,0,0,0.5)` |

### Text Shadow for Readability

```css
/* Multi-directional shadow for any background */
text-shadow:
  -1px -1px 0 #000,
   1px -1px 0 #000,
  -1px  1px 0 #000,
   1px  1px 0 #000,
   2px  2px 4px rgba(0,0,0,0.8);
```

### Positioning

| Video Format | Caption Position |
|--------------|------------------|
| Horizontal (16:9) | Bottom 20-25% |
| Vertical (9:16) | Centered |
| Square (1:1) | Bottom 25-30% |

### Timing Parameters

- **Display duration:** 1.5-3 seconds per caption
- **Reading speed:** 180-200 words per minute
- **Fade transition:** 0.2 seconds recommended
- **Gap between captions:** Minimum 0.1 seconds

## FFmpeg Method

### Basic SRT Burn-In

```bash
ffmpeg -i input.mp4 -vf "subtitles=subs.srt" output.mp4
```

### Styled SRT Burn-In

```bash
ffmpeg -i input.mp4 -vf "subtitles=subs.srt:force_style='FontName=Roboto,FontSize=24,PrimaryColour=&HFFFFFF,OutlineColour=&H40000000,BorderStyle=3,Outline=2,Shadow=1,Alignment=2'" output.mp4
```

### Force Style Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| FontName | Font family | `FontName=Roboto` |
| FontSize | Text size | `FontSize=24` |
| PrimaryColour | Text color (AABBGGRR) | `PrimaryColour=&HFFFFFF` |
| OutlineColour | Stroke color | `OutlineColour=&H40000000` |
| BorderStyle | 1=outline, 3=box | `BorderStyle=3` |
| Outline | Stroke width | `Outline=2` |
| Shadow | Shadow offset | `Shadow=1` |
| Alignment | Numpad position | `Alignment=2` |

### Color Format: &HAABBGGRR

```
&H00FFFFFF = White (AA=00 for opaque)
&H000000FF = Red
&H0000FF00 = Green
&H00FF0000 = Blue
&H80000000 = 50% transparent black
```

### Alignment (Numpad Layout)

```
7 8 9  (Top: left, center, right)
4 5 6  (Middle: left, center, right)
1 2 3  (Bottom: left, center, right)
```

Default: `2` (bottom center)

## SRT File Format

```srt
1
00:00:01,000 --> 00:00:04,000
First subtitle line

2
00:00:04,500 --> 00:00:08,000
Second subtitle line

3
00:00:08,500 --> 00:00:12,000
Third subtitle line
```

### Timestamp Format

```
HH:MM:SS,mmm --> HH:MM:SS,mmm
```

- Hours: 00-99
- Minutes: 00-59
- Seconds: 00-59
- Milliseconds: 000-999

## Remotion Method

### Basic Caption Component

```jsx
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const Caption = ({ text, startFrame, endFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < startFrame || frame > endFrame) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: '20%',
      width: '100%',
      textAlign: 'center',
      color: 'white',
      fontSize: 48,
      fontFamily: 'Roboto',
      textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    }}>
      {text}
    </div>
  );
};
```

### TikTok-Style Word Highlighting

```jsx
import { createTikTokStyleCaptions } from '@remotion/captions';

const captions = createTikTokStyleCaptions({
  transcription: words,
  combineTokensWithinMilliseconds: 1000,
});

export const DynamicCaption = ({ words, currentTime }) => {
  return (
    <div style={captionContainerStyle}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            color: word.startMs <= currentTime && currentTime < word.endMs
              ? '#FFD700'  // Active: yellow
              : '#FFFFFF', // Inactive: white
            transition: 'color 0.2s ease',
          }}
        >
          {word.text}{' '}
        </span>
      ))}
    </div>
  );
};
```

### Page-Based Captions

```jsx
import { createTikTokStyleCaptions } from '@remotion/captions';

const pages = createTikTokStyleCaptions({
  transcription: words,
  combineTokensWithinMilliseconds: 3000, // Group into ~3 second pages
});

// Each page contains multiple words shown together
pages.forEach(page => {
  console.log(`Page: ${page.startMs} - ${page.endMs}`);
  console.log(`Words: ${page.tokens.map(t => t.text).join(' ')}`);
});
```

## Critical Requirements

### Word-Level Timestamps

For dynamic caption highlighting, you MUST have word-level timestamps from transcription.

**whisper.cpp:**
```bash
# Use -ml 1 flag for word-level
whisper -ml 1 audio.wav
```

**In code:**
```javascript
const result = await transcribe({
  tokenLevelTimestamps: true,  // Required!
});
```

### Output Format for Remotion

```json
[
  {
    "text": "Hello",
    "startMs": 0,
    "endMs": 500,
    "confidence": 0.95
  },
  {
    "text": "world",
    "startMs": 550,
    "endMs": 1000,
    "confidence": 0.92
  }
]
```

## Troubleshooting

### Font Not Found

```bash
# List available fonts
fc-list | grep -i "roboto"

# Install font (Ubuntu)
sudo apt install fonts-roboto
```

### Character Encoding Issues

Always use UTF-8 for SRT files:
```bash
file -i subs.srt  # Check encoding
iconv -f ISO-8859-1 -t UTF-8 subs.srt > subs_utf8.srt  # Convert
```

### Timing Offset

If captions are out of sync:
```bash
# Shift all captions by 2 seconds
ffmpeg -itsoffset 2 -i subs.srt -c copy subs_shifted.srt
```

## Batch Processing

```bash
#!/bin/bash
# Add captions to all videos in directory
for video in *.mp4; do
  name="${video%.mp4}"
  if [ -f "${name}.srt" ]; then
    ffmpeg -i "$video" -vf "subtitles=${name}.srt" "${name}_captioned.mp4"
  fi
done
```
