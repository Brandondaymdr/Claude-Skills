# Audio Editing Reference

## Essential Sound Panel

The Essential Sound panel is the fastest way to mix and repair audio in Premiere. It provides
one-click solutions organized by audio type, so you don't need to know which individual audio
effect to use — just tag your clip and adjust sliders.

### Audio Type Tags

Select a clip (or multiple clips) and assign one of these types:

**Dialogue** — Spoken words, interviews, narration, voiceover
- Repair: Reduce Noise, Reduce Reverb, Enhance Speech, DeHum, DeEss
- Clarity: EQ presets (Vocal Presence, Podcast Voice, etc.)
- Volume: Auto Match loudness target

**Music** — Background music, songs, scores
- Ducking: Automatically lowers music volume when dialogue plays
- Duration: Remix to fit a duration (AI-powered music length adjustment)
- Loudness: Target level control

**SFX** — Sound effects, foley, stingers
- Creative: Pan, Reverb, Stereo Width adjustments
- Loudness: Target level control

**Ambience** — Room tone, background atmosphere, nature sounds
- Creative: Reverb and Stereo Width
- Loudness: Target level control

### Dialogue Repair Tools (in detail)

**Reduce Noise** — Removes consistent background noise (fans, AC, hiss, hum).
- Start at 4-6 on the slider and increase gradually
- Too much noise reduction makes voice sound "underwater" or robotic
- Works best on consistent, steady noise (not intermittent sounds)

**Reduce Reverb** — Reduces room echo/reverb in recordings.
- Most effective on mild to moderate reverb
- Heavy reverb (like a gymnasium) is harder to fix
- Start at 4-5 and listen carefully

**Enhance Speech** — AI-powered tool that isolates the human voice from everything else.
- Extraordinarily powerful — can separate speech from music, noise, and ambience
- Works best on clips where speech is the primary content
- Can sometimes affect voice quality at extreme settings

**DeHum** — Removes electrical hum (50Hz or 60Hz depending on region).
- Targets specific frequencies caused by electrical interference
- Select your region's frequency standard (60Hz Americas, 50Hz Europe/Asia)

**DeEss** — Reduces harsh sibilance ("s" and "sh" sounds).
- Particularly useful for close-mic recordings and voiceovers
- Adjust threshold and amount to taste — too much DeEss makes speech sound lispy

### Auto Ducking

Ducking automatically lowers background music when dialogue plays. This is huge for shorts and
social content where you have music under talking-head content.

1. Tag your dialogue clip(s) as **Dialogue**
2. Tag your music clip(s) as **Music**
3. On the music clip, expand the Essential Sound panel and enable **Ducking**
4. Check "Duck Against" and select the dialogue clips/tracks
5. Adjust:
   - **Duck Amount**: How much the music volume drops (typically -15 to -20 dB)
   - **Sensitivity**: How aggressively it detects dialogue
   - **Fade Duration**: How quickly music volume transitions (longer = smoother)
6. Click **Generate Keyframes** to create the ducking automation

The generated keyframes appear on the clip's volume rubber band — you can manually fine-tune
them afterward.

### Audio Loudness Targets

Different platforms have different loudness standards:

| Platform | Target (LUFS) | Peak Limit |
|----------|--------------|------------|
| YouTube | -14 LUFS | -1 dB True Peak |
| Instagram/Reels | -14 LUFS | -1 dB True Peak |
| TikTok | -14 LUFS | -1 dB True Peak |
| Broadcast TV | -24 LUFS (US) / -23 LUFS (EU) | -2 dB True Peak |
| Podcast | -16 LUFS (mono) / -19 LUFS (stereo) | -1 dB True Peak |
| Streaming (Netflix) | -27 LUFS (dialogue normalized) | -2 dB True Peak |

Use the **Loudness Meter** effect on your master track to monitor real-time loudness.
Or use Window > Audio Meters to see levels during playback.

---

## Audio Track Mixer

The Audio Track Mixer (Window > Audio Track Mixer) provides a traditional mixing console view:

- **Faders**: Adjust track volume levels
- **Pan knobs**: Control stereo placement
- **Mute/Solo**: Isolate or silence individual tracks
- **Input/Output routing**: Configure audio routing
- **Effects rack**: Apply track-level effects (EQ, compression, reverb)
- **Submixes**: Route multiple tracks to a submix for group processing

### Submixes
Create submix tracks to group audio:
- Route all dialogue tracks to a "Dialogue Submix"
- Route all music tracks to a "Music Submix"
- Route all SFX to an "SFX Submix"
- Adjust the overall mix by riding the submix faders

This is the professional approach for any project with more than a few audio tracks.

---

## Key Audio Effects

### EQ (Parametric Equalizer)
Adjust the frequency balance of audio. In the Effects panel under Audio Effects > Filter and EQ.
- **Low Cut/High Pass**: Remove rumble below ~80Hz (wind, handling noise, room vibration)
- **Presence Boost**: Boost 2-5kHz to make voice cut through a mix
- **High Shelf Reduction**: Reduce harsh high frequencies above 8-10kHz

### Dynamics (Compressor/Limiter)
Evens out the volume — makes quiet parts louder and loud parts quieter.
- **Compressor**: Reduces dynamic range. Use ratio 3:1 to 4:1 for dialogue, 2:1 for music.
- **Limiter**: Hard ceiling that prevents clipping. Set threshold just below 0dB.
- **Hard Limiter effect**: Apply to the master track as a safety net against clipping.

### Reverb
Adds room ambience. Useful for matching ADR or voiceover to on-location sound.
- Use sparingly — too much reverb makes audio sound muddy
- For shorts/social content, you almost never want to add reverb

### Audio Transitions
- **Constant Power**: Smooth crossfade (default). Good for most situations.
- **Constant Gain**: Linear crossfade. Can sound abrupt.
- **Exponential Fade**: Very smooth, cinema-style fade.
- Apply with **Cmd/Ctrl+Shift+D** at a cut between audio clips.

---

## Audio Editing Techniques

### Cleaning Up Dialogue

The recommended order for dialogue cleanup:
1. **Low-cut filter** at 80Hz (removes rumble)
2. **DeHum** if there's electrical hum
3. **Reduce Noise** (Essential Sound) for steady background noise
4. **Reduce Reverb** if the room is echoey
5. **Enhance Speech** for heavy cleanup needs
6. **DeEss** for sibilance
7. **EQ** for tone shaping (presence boost, remove muddiness)
8. **Compression** to even out volume
9. **Loudness normalization** to hit target LUFS

### Recording Voiceover in Premiere
1. Set up your microphone in Preferences > Audio Hardware
2. On the timeline, target the audio track you want to record to
3. In the Audio Track Mixer, click the microphone icon (R) on the target track
4. Click the record button in the transport controls
5. Press play — Premiere records to the track in real-time

### Working with Multiple Audio Channels
Some cameras record dual-channel audio (e.g., lav mic on channel 1, shotgun on channel 2).
- Right-click the clip in Project panel > Modify > Audio Channels
- Change from Stereo to Mono, and select which channel(s) to use
- Or: In the Source Monitor, drag just the audio channel you want to the timeline

### Syncing Audio and Video
When using separate audio (e.g., external recorder):
1. Select the video clip and audio clip in the Project panel or Timeline
2. Right-click > Synchronize (or Merge Clips)
3. Choose sync method: **Audio** analysis is usually most accurate
4. Premiere analyzes the waveforms and aligns them

Alternatively, use **PluralEyes** (third-party) or sync by timecode if your devices support it.

### J-Cuts and L-Cuts
These are essential for professional-sounding edits:

**J-Cut**: Audio from the next clip starts before the video transition.
- Viewer hears the next scene before seeing it
- Creates anticipation and smooth flow
- Unlink audio, extend the audio of clip B to the left under clip A's video

**L-Cut**: Audio from the current clip continues after the video has cut to the next clip.
- Viewer sees the next scene while still hearing the previous one
- Great for reaction shots and conversational edits
- Unlink audio, extend the audio of clip A to the right under clip B's video

**Quick workflow**: Hold **Alt/Option** to select just the audio, then drag the edge to extend
it past the video edit point.
