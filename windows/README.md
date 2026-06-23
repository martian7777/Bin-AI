# Bin AI

A cross-platform (Windows-first) AI video editor, using **your own** provider API keys instead of
a hosted backend. No subscription, no credits — you pay each provider directly for what you generate.

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
- ✅ Metadata + thumbnails extracted in-renderer
- ✅ Frame-based timeline ported from the Swift model: tracks, draggable clips, ruler/playhead, zoom, add/delete

Phase 3 — export & persistence:
- ✅ FFmpeg-backed export (bundled `ffmpeg-static`) — composites tracks onto a canvas via an overlay/`setpts` filtergraph with audio `amix`; honors per-clip trim/speed
- ✅ Project save/load (`.binai.json`) with media paths re-authorized on open
- ✅ "Add to timeline" from the Generate tab — generated images/videos drop straight onto the timeline

Phase 4 — editing & playback:
- ✅ Clip **trim** (drag either edge), **split** (at playhead, or `S`), and **speed** (0.1×–8×) + per-clip volume — wired through to export
- ✅ Real-time **multi-track composited preview** with transport (Play/Pause), playhead clock, and per-track show/mute toggles

Later:
- ⬜ Ported ripple-edit logic from the Swift `Editor` code
- ⬜ Canvas-based compositing (current preview stacks `<video>`/`<img>` layers; good enough for review, but no blend modes/transforms yet)

## Packaging (.exe installer)

`npm run package` runs `electron-vite build` then `electron-builder --win`, producing
`dist/Bin-AI-Setup-<version>.exe` (NSIS, user-selectable install dir).

`ffmpeg-static` resolves to a path inside `node_modules`, so it is listed under electron-builder
`asarUnpack` (see `build` in `package.json`). At runtime the resolved path is rewritten from
`app.asar` → `app.asar.unpacked` so the FFmpeg binary is reachable from the packaged app.

To add an app icon, drop a 256×256+ `icon.ico` in `windows/build/` — electron-builder picks it up
automatically. Without it the build uses the default Electron icon.

## Run

```bash
cd windows
npm install
npm run dev
```

Then open the **API Keys** tab and paste a key for any provider. Generated files are written to
`Videos/Bin AI`.

## Where your keys go

Keys are encrypted at rest with the OS keychain and are sent **only** to the provider whose
endpoint you call. Nothing is routed through any hosted Bin AI server.

## Adding models

Each provider lives in `electron/providers/`. Model lists are static arrays on each `ProviderImpl`
— add an entry to `models` to expose a new model in the UI.
