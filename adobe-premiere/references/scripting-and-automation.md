# Scripting & Automation Reference

Adobe Premiere Pro supports two scripting engines for automation. The legacy ExtendScript API
(supported through September 2026) and the modern UXP API (the current standard going forward).

When to read this reference: The user wants to automate repetitive tasks in Premiere, build
custom tools/panels, batch-process clips, or programmatically control the application.

---

## Scripting Engines Overview

### ExtendScript (Legacy — CEP Panels)
- Based on ECMAScript 3 (older JavaScript)
- **Synchronous** — all calls block the UI while executing
- Runs via CEP (Common Extensibility Platform) panels
- Well-documented, large community knowledge base
- Extended support through September 2026
- Documentation: https://ppro-scripting.docsforadobe.dev

### UXP (Modern — Current Standard)
- Modern JavaScript engine with HTML/CSS/JavaScript
- **Asynchronous** — method calls are non-blocking (properties are synchronous)
- Better performance and user experience
- Access via: `const app = require('premierepro');`
- The official future direction for Premiere Pro extensions
- Documentation: https://developer.adobe.com/premiere-pro/uxp/ppro_reference/

### C++ SDK
- For low-level, high-performance plugin development
- Used for custom effects, importers, exporters, transmitters
- Not covered in detail here — see Adobe's SDK documentation

---

## Core Object Model

Both APIs share a similar object hierarchy:

```
Application (app)
├── Project
│   ├── rootItem (ProjectItem — the root bin)
│   │   ├── children[] (ProjectItems — clips, bins, sequences)
│   │   │   ├── ProjectItem (type: CLIP, BIN, FILE, ROOT)
│   │   │   │   ├── name, nodeId, treePath
│   │   │   │   ├── getMediaPath()
│   │   │   │   ├── getMarkers()
│   │   │   │   └── children[] (if BIN)
│   │   │   └── ...
│   ├── sequences[] (SequenceCollection)
│   │   ├── Sequence
│   │   │   ├── name, sequenceID, timebase
│   │   │   ├── videoTracks[] (TrackCollection)
│   │   │   │   ├── Track
│   │   │   │   │   └── clips[] (TrackItemCollection)
│   │   │   │   │       └── TrackItem (clip on timeline)
│   │   │   │   │           ├── start, end, duration, inPoint, outPoint
│   │   │   │   │           ├── name, type, mediaType
│   │   │   │   │           └── components[] (effects)
│   │   │   │   └── ...
│   │   │   ├── audioTracks[] (TrackCollection)
│   │   │   ├── markers (MarkerCollection)
│   │   │   └── end (sequence duration)
│   │   └── ...
│   └── activeSequence
├── sourceMonitor
├── projectManager
├── metadata
└── properties
```

---

## Common Automation Tasks

### Import Media into a Bin

**ExtendScript:**
```javascript
// Import files into the root bin
var filesToImport = ["/path/to/video1.mp4", "/path/to/video2.mp4"];
app.project.importFiles(filesToImport);

// Import into a specific bin
var targetBin = app.project.rootItem.children[0]; // first bin
app.project.importFiles(filesToImport, false, targetBin);

// Create a new bin
var newBin = app.project.rootItem.createBin("My New Bin");
app.project.importFiles(filesToImport, false, newBin);
```

**UXP:**
```javascript
const app = require('premierepro');
const project = await app.project.getActiveProject();

// Import files
const filePaths = ["/path/to/video1.mp4", "/path/to/video2.mp4"];
await project.importFiles(filePaths);
```

### Create a Sequence

**ExtendScript:**
```javascript
// Create sequence from a clip (inherits clip settings)
var clip = app.project.rootItem.children[0]; // first item in project
app.project.createNewSequenceFromClips("My Sequence", [clip]);

// Get the active sequence
var seq = app.project.activeSequence;
```

### Add Clips to the Timeline

**ExtendScript:**
```javascript
var seq = app.project.activeSequence;
var clip = app.project.rootItem.children[0];

// Insert at specific time (in seconds as string: "00;00;05;00" for 5 seconds)
var insertTime = new Time();
insertTime.seconds = 5.0;

// Insert clip at time on video track 0, audio track 0
seq.insertClip(clip, insertTime, 0, 0);

// Overwrite instead
seq.overwriteClip(clip, insertTime, 0, 0);
```

### Read Sequence Clip Information

**ExtendScript:**
```javascript
var seq = app.project.activeSequence;

// Iterate through video tracks
for (var t = 0; t < seq.videoTracks.numTracks; t++) {
    var track = seq.videoTracks[t];
    for (var c = 0; c < track.clips.numItems; c++) {
        var clip = track.clips[c];
        $.writeln("Clip: " + clip.name);
        $.writeln("  Start: " + clip.start.seconds);
        $.writeln("  End: " + clip.end.seconds);
        $.writeln("  Duration: " + clip.duration.seconds);
        $.writeln("  In Point: " + clip.inPoint.seconds);
        $.writeln("  Out Point: " + clip.outPoint.seconds);
    }
}
```

### Work with Markers

**ExtendScript:**
```javascript
var seq = app.project.activeSequence;
var markers = seq.markers;

// Add a marker
var newMarker = markers.createMarker(5.0); // at 5 seconds
newMarker.name = "Important Moment";
newMarker.comments = "This is where the key point is made";
newMarker.setColorByIndex(0); // 0=Green, 1=Red, 2=Purple, etc.

// Read existing markers
for (var i = markers.numMarkers - 1; i >= 0; i--) {
    var marker = markers[i]; // Note: marker iteration can be tricky
    $.writeln("Marker: " + marker.name + " at " + marker.start.seconds + "s");
}
```

### Export a Sequence

**ExtendScript:**
```javascript
var seq = app.project.activeSequence;
var outputPath = "/Users/username/Desktop/export.mp4";

// Use a preset file (.epr)
var presetPath = "/Applications/Adobe Premiere Pro 2025/MediaIO/systempresets/4028004F-4F00-6000-0000-000000000048/Match Source - High bitrate.epr";

// Export (0 = entire sequence, 1 = work area)
seq.exportAsMediaDirect(outputPath, presetPath, 0);
```

### Batch Operations — Process All Clips

**ExtendScript:**
```javascript
// Set a color label on all clips in the active sequence
function labelAllClips(colorIndex) {
    var seq = app.project.activeSequence;
    for (var t = 0; t < seq.videoTracks.numTracks; t++) {
        var track = seq.videoTracks[t];
        for (var c = 0; c < track.clips.numItems; c++) {
            var clip = track.clips[c];
            clip.projectItem.setColorLabel(colorIndex);
        }
    }
}
labelAllClips(4); // Set all to blue
```

### Navigate the Project Bin Hierarchy

**ExtendScript:**
```javascript
function listProjectItems(item, indent) {
    indent = indent || "";
    for (var i = 0; i < item.children.numItems; i++) {
        var child = item.children[i];
        $.writeln(indent + child.name + " (type: " + child.type + ")");
        if (child.type === ProjectItemType.BIN) {
            listProjectItems(child, indent + "  ");
        }
    }
}
listProjectItems(app.project.rootItem);
```

### Set Player Position (Move Playhead)

**ExtendScript:**
```javascript
var seq = app.project.activeSequence;
var newTime = new Time();
newTime.seconds = 10.0;
seq.setPlayerPosition(newTime.ticks);
```

---

## UXP API — Key Differences

The UXP API is asynchronous, so most methods return Promises:

```javascript
const app = require('premierepro');

// Getting project and sequence
const project = await app.project.getActiveProject();
const sequence = await project.getActiveSequence();

// Properties are synchronous (no await needed)
const seqName = sequence.name;
const seqId = sequence.sequenceID;

// Methods are asynchronous (await required)
const tracks = await sequence.getVideoTracks();
```

### UXP Plugin Structure
A UXP plugin for Premiere includes:
- `manifest.json` — Plugin metadata, permissions, entry points
- `index.html` — UI layout
- `index.js` — Plugin logic
- Optional: CSS files for styling

The plugin can create panels (persistent UI), commands (one-shot actions), or modal dialogs.

### UXP File System Access
```javascript
const fs = require('uxp').storage.localFileSystem;
const file = await fs.getFileForSaving("export.csv");
const writeStream = await file.createWriteStream();
// Write data...
```

---

## Automation Use Cases for Short-Form Content

### Auto-Create Vertical Sequences from Markers
```javascript
// Concept: Read markers from a long-form sequence, create individual
// vertical sequences for each marked segment
var seq = app.project.activeSequence;
var markers = seq.markers;
var markerList = [];

// Collect markers
var currentMarker = markers.getFirstMarker();
while (currentMarker) {
    markerList.push({
        name: currentMarker.name,
        start: currentMarker.start.seconds,
        end: currentMarker.end.seconds,
        comment: currentMarker.comments
    });
    currentMarker = markers.getNextMarker(currentMarker);
}

// For each marker pair, you could then programmatically:
// 1. Create a new sequence with vertical settings
// 2. Copy the relevant portion
// 3. Apply standard effects (auto-reframe, text templates)
$.writeln("Found " + markerList.length + " markers to process");
```

### Batch Export Sequences
```javascript
// Export all sequences in the project
var presetPath = "/path/to/export/preset.epr";
var outputFolder = "/Users/username/Desktop/exports/";

for (var i = 0; i < app.project.sequences.numSequences; i++) {
    var seq = app.project.sequences[i];
    var outputPath = outputFolder + seq.name + ".mp4";

    // Set active sequence
    app.project.activeSequence = seq;

    // Export
    seq.exportAsMediaDirect(outputPath, presetPath, 0);
    $.writeln("Exported: " + seq.name);
}
```

---

## Event System

Register for application events to create reactive automations:

**ExtendScript:**
```javascript
app.bind("sequenceActivated", function(seq) {
    $.writeln("Activated sequence: " + seq.name);
});

app.bind("activeSequenceChanged", function() {
    $.writeln("Sequence changed");
});
```

---

## Development Setup

### ExtendScript Development
1. Install Visual Studio Code
2. Install the **ExtendScript Debugger** extension by Adobe
3. Create a .jsx file with your script
4. Use the extension to connect to Premiere Pro and run scripts

### UXP Plugin Development
1. Install the **UXP Developer Tool** (UDT) from Adobe
2. Create a plugin folder with manifest.json, index.html, index.js
3. Use UDT to load the plugin into Premiere for testing
4. Debug with Chrome DevTools (UDT opens a debug connection)

### Resources
- ExtendScript API Docs: https://ppro-scripting.docsforadobe.dev
- UXP API Reference: https://developer.adobe.com/premiere-pro/uxp/ppro_reference/
- Adobe Developer Console: https://developer.adobe.com/premiere-pro/
- Sample scripts: https://github.com/AdobeDocs/premierepro-samples
