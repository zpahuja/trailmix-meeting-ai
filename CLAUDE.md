# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Trailmix is an Electron-based desktop application that records meetings (Zoom, Google Meet, Microsoft Teams, Slack) using the Recall.ai SDK. It captures real-time transcripts, participant information, video frames, and automatically generates AI-powered meeting summaries using OpenRouter API.

## Architecture

### Core Components

**Electron Multi-Process Architecture:**
- **Main Process** (`src/main.js`): Manages Recall.ai SDK integration, meeting detection, recording lifecycle, transcript processing, AI summary generation, and IPC communication
- **Renderer Process** (`src/renderer.js`): Handles UI for home view (meeting list) and editor view (note editing with debug panel)
- **Preload Script** (`src/preload.js`): Exposes secure IPC APIs via `contextBridge` for main-renderer communication
- **Backend Server** (`src/server.js`): Express server on port 13373 that creates Recall.ai upload tokens for recordings

### Key Data Flow

1. **Meeting Detection**: RecallAI SDK detects active meeting windows → fires `meeting-detected` event → shows notification
2. **Recording Start**: User joins meeting → creates meeting note with unique ID → calls `startRecording` with upload token → SDK begins capturing
3. **Real-Time Events**: SDK fires `realtime-event` for transcript data, participant joins, video frames → stored in meeting object
4. **Recording End**: SDK fires `recording-ended` → uploads recording → triggers AI summary generation (streaming) → updates note content
5. **Data Persistence**: All meeting data stored in `meetings.json` in user's Application Support directory

### File Operation Manager

The app uses a custom `fileOperationManager` (src/main.js:223) to prevent race conditions when reading/writing `meetings.json`:
- Implements operation queue with sequential processing
- Caches reads for 500ms to reduce I/O
- All file operations must use `scheduleOperation()` or `readMeetingsData()` methods

### Global State Tracking

Two critical global objects track recording state:
- `global.activeMeetingIds`: Maps SDK windowId → {platformName, noteId} for associating events with notes
- `activeRecordings`: Tracks all active recordings with state management (recording/paused/stopping)

### AI Summary Generation

Uses OpenRouter API with Claude 3.7 Sonnet (configurable in MODELS constant):
- Supports both streaming and non-streaming modes
- Streaming updates sent to renderer via `summary-update` IPC events
- Formats transcript into structured summary with Participants, Summary, and Action Items sections
- Automatically triggered when recording ends (if transcript exists)

## Development Commands

### Setup
```bash
# Install dependencies
npm install
npm ci

# Configure environment
cp .env.example .env
# Edit .env to set RECALLAI_API_URL, RECALLAI_API_KEY, and optionally OPENROUTER_KEY
```

### Running the Application
```bash
# Start both server and Electron app
npm start

# Start server only (for debugging)
npm run start:server

# Start Electron only (for debugging)
npm run start:electron
```

### Building & Packaging
```bash
# Package the app (creates distributable)
npm run package

# Create platform-specific installers (DMG for macOS)
npm run make

# Publish the app
npm run publish
```

### Linting
```bash
npm run lint
# Note: Currently returns "No linting configured"
```

## Important Technical Details

### Recall.ai SDK Integration

**Initialization** (src/main.js:353):
- SDK requires `recording_path` config pointing to recordings directory
- Must call `init()` before any SDK operations
- Set `api_url` to match your Recall.ai region (us-west-2, us-east-1, etc.)

**Critical SDK Events:**
- `meeting-detected`: Meeting window detected, provides platform and windowId
- `meeting-updated`: Fires when meeting title/URL becomes available (often after detection)
- `meeting-closed`: Meeting window closed, cleanup required
- `recording-ended`: Recording stopped, trigger upload and processing
- `realtime-event`: Real-time data stream (transcript, participants, video frames)
- `sdk-state-change`: Recording state transitions (idle → recording → paused)
- `upload-progress`: Track upload completion percentage

**Starting Recordings:**
- Always get upload token from server first (`createDesktopSdkUpload()`)
- For meeting recordings: use `windowId` from detected meeting
- For manual recordings: call `prepareDesktopAudioRecording()` first to get key
- Upload token includes transcript config for AssemblyAI streaming

### IPC Communication Patterns

**Main → Renderer Events:**
- `open-meeting-note`: Triggered when meeting created, tells renderer to open note
- `transcript-updated`: New transcript data available for meeting
- `participants-updated`: New participant joined
- `summary-update`: Streaming summary token received
- `summary-generated`: Complete summary generated
- `recording-state-change`: Recording state changed
- `meeting-title-updated`: Meeting title updated retroactively

**Renderer → Main Invocations:**
- `saveMeetingsData`: Save meetings.json
- `loadMeetingsData`: Load meetings.json
- `startManualRecording`: Start desktop recording
- `stopManualRecording`: Stop recording
- `generateMeetingSummaryStreaming`: Trigger AI summary

### Meeting Note Structure

```javascript
{
  id: 'meeting-TIMESTAMP',
  type: 'document',  // or 'calendar' (filtered out in UI)
  title: 'Meeting Title',
  subtitle: 'HH:MM',
  date: 'ISO 8601 timestamp',
  content: 'Markdown content',
  recordingId: 'SDK window ID',
  platform: 'Zoom/Google Meet/etc',
  transcript: [
    {
      text: 'spoken words',
      speaker: 'Speaker Name',
      timestamp: 'ISO 8601'
    }
  ],
  participants: [
    {
      id: 'participant_id',
      name: 'Participant Name',
      isHost: true/false,
      platform: 'zoom',
      joinTime: 'ISO 8601',
      status: 'active'
    }
  ],
  videoPath: '/path/to/recording.mp4',  // Set after recording completes
  hasSummary: true/false,
  recordingComplete: true/false
}
```

### Common Pitfalls

1. **Race Conditions**: Always use `fileOperationManager` for meetings.json access
2. **Meeting Title Timing**: `meeting-detected` doesn't guarantee title is available. Listen for `meeting-updated` and update retroactively
3. **Recording ID Tracking**: Must set `global.activeMeetingIds[windowId].noteId` before processing real-time events
4. **Participant Filtering**: Skip generic names like "Host", "Guest", or names with >3 words
5. **Upload Token**: Always create upload token before starting recording for proper transcript capture
6. **File Paths**: Recording files may have different prefixes (`macos-desktop-`, `desktop-`, none) - check multiple patterns

### Entitlements (macOS)

The app requires specific entitlements (Entitlements.plist) for:
- Microphone access (for recording)
- Screen recording (for desktop SDK)
- Camera access (for video frames)
- User notifications

## Key Files Reference

- `src/main.js`: Main process, SDK integration, recording lifecycle (1870 lines)
- `src/renderer.js`: UI logic, editor management, debug panel (2026 lines)
- `src/preload.js`: IPC bridge definitions
- `src/server.js`: Express server for upload token creation
- `src/sdk-logger.js`: SDK logging utility
- `forge.config.js`: Electron Forge build configuration
- `webpack.*.config.js`: Webpack configurations for main/renderer

## Environment Variables

Required in `.env`:
- `RECALLAI_API_URL`: Recall.ai API endpoint (e.g., https://us-west-2.recall.ai)
- `RECALLAI_API_KEY`: Your Recall.ai API key

Optional:
- `OPENROUTER_KEY`: For AI summary generation (falls back to no summaries if not set)

## Data Storage

- Meeting notes: `~/Library/Application Support/Trailmix/meetings.json` (macOS)
- Recordings: `~/Library/Application Support/Trailmix/recordings/`
- Video files: `[windowId].mp4` or `macos-desktop-[windowId].mp4`
