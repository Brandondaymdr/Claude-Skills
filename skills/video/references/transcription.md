# Video Transcription Reference

> Fast local video transcription using whisper.cpp with GPU acceleration

## Core Recommendation

> **Do NOT use Python `whisper`** - it's 10x slower. Always use `@remotion/install-whisper-cpp` which leverages C++ implementation with GPU support.

## Performance Comparison

| Tool | 8.5min Video | GPU Support | Setup Complexity |
|------|--------------|-------------|------------------|
| Python whisper | 15+ minutes | Limited | Easy |
| whisper.cpp | ~85 seconds | Metal/CUDA | Moderate |

## Setup

### Install Package

```bash
npm install @remotion/install-whisper-cpp
```

### Download Model and whisper.cpp

```javascript
import { installWhisperCpp, downloadWhisperModel } from '@remotion/install-whisper-cpp';

// Install whisper.cpp (v1.5.5 is required)
await installWhisperCpp({
  to: './whisper.cpp',
  version: '1.5.5',  // REQUIRED parameter
});

// Download model
await downloadWhisperModel({
  model: 'base.en',
  folder: './whisper.cpp',
});
```

### CLI Setup

```bash
# One-liner setup
npx @remotion/install-whisper-cpp --model base.en
```

## Model Selection

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| tiny.en | 75MB | Fastest | Basic | Testing |
| base.en | 142MB | Fast | Good | Development |
| small.en | 466MB | Medium | Better | Production draft |
| medium.en | 1.5GB | Slow | Great | Final output |
| large-v3-turbo | ~3GB | Slowest | Best | Maximum quality |

**Recommendation:**
- Development: `base.en`
- Final output: `medium.en` or `large-v3-turbo`

## Audio Extraction

### FFmpeg Command

```bash
# Extract audio at 16kHz mono WAV (required format)
ffmpeg -i input.mp4 -vn -acodec pcm_s16le -ar 16000 -ac 1 audio.wav
```

### Parameters Explained

| Flag | Meaning |
|------|---------|
| `-vn` | No video output |
| `-acodec pcm_s16le` | 16-bit PCM audio |
| `-ar 16000` | 16kHz sample rate |
| `-ac 1` | Mono channel |

## Transcription

### Basic Usage

```javascript
import { transcribe } from '@remotion/install-whisper-cpp';

const result = await transcribe({
  inputPath: 'audio.wav',
  whisperPath: './whisper.cpp',
  model: 'base.en',
  tokenLevelTimestamps: true,  // Required for word-level captions
});

console.log(result.transcription);
```

### Full Options

```javascript
const result = await transcribe({
  inputPath: 'audio.wav',
  whisperPath: './whisper.cpp',
  model: 'base.en',
  tokenLevelTimestamps: true,
  language: 'en',           // Language code
  translateToEnglish: false, // Keep original language
  threads: 4,               // CPU threads
});
```

## Output Format

### Transcription Result

```json
{
  "transcription": [
    {
      "text": "Hello",
      "startMs": 0,
      "endMs": 500,
      "timestamp": "[00:00:00.000 --> 00:00:00.500]",
      "confidence": 0.95
    },
    {
      "text": "world",
      "startMs": 550,
      "endMs": 1000,
      "timestamp": "[00:00:00.550 --> 00:00:01.000]",
      "confidence": 0.92
    }
  ]
}
```

### Converting to SRT

```javascript
function toSRT(transcription) {
  return transcription.map((item, index) => {
    const start = formatSRTTime(item.startMs);
    const end = formatSRTTime(item.endMs);
    return `${index + 1}\n${start} --> ${end}\n${item.text}\n`;
  }).join('\n');
}

function formatSRTTime(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(milliseconds, 3)}`;
}

function pad(num, size = 2) {
  return String(num).padStart(size, '0');
}
```

## Complete Pipeline

### End-to-End Script

```javascript
import { execSync } from 'child_process';
import { transcribe } from '@remotion/install-whisper-cpp';
import { writeFileSync } from 'fs';

async function transcribeVideo(videoPath) {
  // 1. Extract audio
  const audioPath = 'temp_audio.wav';
  execSync(`ffmpeg -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioPath}" -y`);

  // 2. Transcribe
  const result = await transcribe({
    inputPath: audioPath,
    whisperPath: './whisper.cpp',
    model: 'base.en',
    tokenLevelTimestamps: true,
  });

  // 3. Save results
  writeFileSync('transcription.json', JSON.stringify(result.transcription, null, 2));

  // 4. Optional: Convert to SRT
  const srt = toSRT(result.transcription);
  writeFileSync('captions.srt', srt);

  return result.transcription;
}
```

## GPU Acceleration

### macOS (Metal)

whisper.cpp automatically uses Metal GPU on macOS. No additional configuration needed.

### Linux/Windows (CUDA)

```bash
# Build with CUDA support
cd whisper.cpp
make clean
WHISPER_CUDA=1 make
```

## Troubleshooting

### Version Mismatch Error

Always specify version `1.5.5`:
```javascript
await installWhisperCpp({
  version: '1.5.5',  // Required!
});
```

### Audio Format Issues

Ensure audio is:
- WAV format
- 16kHz sample rate
- Mono channel
- 16-bit PCM

### Memory Issues

For large files, use smaller models or split audio:
```bash
# Split into 10-minute chunks
ffmpeg -i audio.wav -f segment -segment_time 600 chunk_%03d.wav
```

### Missing Dependencies

```bash
# macOS
brew install ffmpeg

# Ubuntu
sudo apt install ffmpeg
```
