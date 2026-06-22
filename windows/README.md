# PalmierPro for Windows

A cross-platform (Windows-first) rebuild of PalmierPro's AI generation, using **your own**
provider API keys instead of the Palmier backend. No subscription, no credits — you pay each
provider directly for what you generate.

Built with Electron + Vite + React + TypeScript so it runs where the Swift/AppKit original cannot.

## Status — Phase 1

- ✅ Runs on Windows
- ✅ Encrypted local API-key storage (Windows credential store via Electron `safeStorage`)
- ✅ Text generation: OpenAI, Gemini, OpenRouter
- ✅ Image generation: OpenAI, Gemini, fal.ai, Replicate
- ✅ Video generation: fal.ai, Replicate
- ⬜ Media import, preview, timeline (Phase 2)
- ⬜ FFmpeg export + ported ripple/timeline logic (Phase 3)

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
