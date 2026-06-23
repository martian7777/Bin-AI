# PalmierPro for Windows

A cross-platform (Windows-first) rebuild of PalmierPro's AI generation, using **your own**
provider API keys instead of the Palmier backend. No subscription, no credits — you pay each
provider directly for what you generate.

Built with Electron + Vite + React + TypeScript so it runs where the Swift/AppKit original cannot.

## Status

Phase 1 — AI generation (your own keys):
- ✅ Runs on Windows
- ✅ Encrypted local API-key storage (Windows credential store via Electron `safeStorage`)
- ✅ Text: OpenAI, Gemini, OpenRouter
- ✅ Image: OpenAI, Gemini, OpenRouter, fal.ai, Replicate
- ✅ Video: Gemini (Veo), fal.ai, Replicate — with inline playback + reveal-in-folder

Phase 2 — editor foundation:
- ✅ Media import (file picker + OS drag-and-drop), served over a sandboxed `media://` protocol
- ✅ Metadata + thumbnails extracted in-renderer (no FFmpeg dependency yet)
- ✅ Preview pane (scrubs video to the playhead)
- ✅ Frame-based timeline ported from the Swift model: tracks, draggable clips, ruler/playhead, zoom, add/delete

Phase 3 — export & persistence:
- ✅ FFmpeg-backed export (bundled `ffmpeg-static`) — composites tracks onto a canvas via an overlay/`setpts` filtergraph with audio `amix`; validated end-to-end
- ✅ Project save/load (`.palmier.json`) with media paths re-authorized on open
- ✅ "Add to timeline" from the Generate tab — generated images/videos drop straight onto the timeline

Later:
- ⬜ Clip trim/split/speed UI (model already supports it)
- ⬜ Ported ripple-edit logic from the Swift `Editor` code
- ⬜ Real-time multi-track composited playback (preview is currently single-clip)

### Packaging note
`ffmpeg-static` resolves to a path inside `node_modules`. For a packaged build, add it to
electron-builder `asarUnpack` so the binary is reachable at runtime.

## Run

```bash
cd windows
npm install
npm run dev
```

Then open the **API Keys** tab and paste a key for any provider. Generated files are written to
`Videos/PalmierPro`.

## Where your keys go

Keys are encrypted at rest with the OS keychain and are sent **only** to the provider whose
endpoint you call. Nothing is routed through any Palmier/Convex server.

## Adding models

Each provider lives in `electron/providers/`. Model lists are static arrays on each `ProviderImpl`
— add an entry to `models` to expose a new model in the UI.
