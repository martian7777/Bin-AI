import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  clipEndFrame,
  newTimeline,
  secondsToFrames,
  trackEndFrame,
  uid,
  type Clip,
  type ClipType,
  type MediaAsset,
  type Timeline,
  type Track
} from "../shared/timeline";
import { PROJECT_FILE_VERSION, type ProjectFile } from "../shared/types";
import { buildAsset } from "./lib/metadata";

interface EditorStore {
  assets: MediaAsset[];
  timeline: Timeline;
  selectedAssetId: string | null;
  selectedClipId: string | null;
  playhead: number;
  pxPerFrame: number;

  assetById(id: string): MediaAsset | undefined;
  importPaths(paths: string[]): Promise<MediaAsset[]>;
  addGeneratedAsset(asset: MediaAsset): void;
  serialize(): ProjectFile;
  hydrate(data: ProjectFile): void;
  selectAsset(id: string | null): void;
  selectClip(id: string | null): void;
  addAssetToTimeline(assetId: string, atFrame?: number): void;
  moveClip(clipId: string, newStartFrame: number, newTrackId?: string): void;
  removeClip(clipId: string): void;
  trimClip(clipId: string, edge: "start" | "end", deltaFrames: number): void;
  splitClip(clipId: string, atFrame: number): void;
  setClipSpeed(clipId: string, speed: number): void;
  setClipVolume(clipId: string, volume: number): void;
  toggleTrackMuted(trackId: string): void;
  toggleTrackHidden(trackId: string): void;
  setPlayhead(frame: number): void;
  setPxPerFrame(v: number): void;
}

const Ctx = createContext<EditorStore | null>(null);

export function useEditor(): EditorStore {
  const v = useContext(Ctx);
  if (!v) throw new Error("useEditor must be used within EditorProvider");
  return v;
}

export function EditorProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [timeline, setTimeline] = useState<Timeline>(newTimeline);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [playhead, setPlayheadState] = useState(0);
  const [pxPerFrame, setPxPerFrame] = useState(4);

  const assetById = useCallback((id: string) => assets.find((a) => a.id === id), [assets]);

  const importPaths = useCallback(async (paths: string[]) => {
    const built = (await Promise.all(paths.map(buildAsset))).filter(
      (a): a is MediaAsset => a !== null
    );
    if (built.length === 0) return [];
    setAssets((prev) => [...prev, ...built]);
    setSelectedAssetId((cur) => cur ?? built[0].id);
    return built;
  }, []);

  const addGeneratedAsset = useCallback((asset: MediaAsset) => {
    setAssets((prev) => (prev.some((a) => a.id === asset.id) ? prev : [...prev, asset]));
  }, []);

  const addAssetToTimeline = useCallback(
    (assetId: string, atFrame?: number) => {
      const asset = assets.find((a) => a.id === assetId);
      if (!asset) return;
      setTimeline((tl) => {
        const fps = tl.fps;
        const durationFrames = Math.max(1, secondsToFrames(asset.durationSeconds, fps));

        let tracks = tl.tracks;
        let track = tracks.find((t) => t.type === asset.type);
        if (!track) {
          track = { id: uid("track"), type: asset.type, muted: false, hidden: false, clips: [] };
          tracks = [...tracks, track];
        }
        const start = atFrame ?? trackEndFrame(track);
        const clip: Clip = {
          id: uid("clip"),
          mediaRef: asset.id,
          mediaType: asset.type,
          startFrame: Math.max(0, start),
          durationFrames,
          trimStartFrame: 0,
          trimEndFrame: 0,
          speed: 1,
          volume: 1
        };
        const trackId = track.id;
        return {
          ...tl,
          tracks: tracks.map((t) =>
            t.id === trackId ? { ...t, clips: [...t.clips, clip] } : t
          )
        };
      });
    },
    [assets]
  );

  const moveClip = useCallback((clipId: string, newStartFrame: number, newTrackId?: string) => {
    setTimeline((tl) => {
      let moved: Clip | undefined;
      const stripped = tl.tracks.map((t) => {
        const found = t.clips.find((c) => c.id === clipId);
        if (found) moved = found;
        return { ...t, clips: t.clips.filter((c) => c.id !== clipId) };
      });
      if (!moved) return tl;
      const target = newTrackId
        ? stripped.find((t) => t.id === newTrackId && t.type === moved!.mediaType)
        : stripped.find((t) => t.clips !== undefined && t.type === moved!.mediaType);
      const home =
        target ?? stripped.find((t) => t.type === moved!.mediaType) ?? stripped[0];
      const updated = { ...moved, startFrame: Math.max(0, Math.round(newStartFrame)) };
      return {
        ...tl,
        tracks: stripped.map((t) =>
          t.id === home.id ? { ...t, clips: [...t.clips, updated] } : t
        )
      };
    });
  }, []);

  const removeClip = useCallback((clipId: string) => {
    setTimeline((tl) => ({
      ...tl,
      tracks: tl.tracks.map((t) => ({ ...t, clips: t.clips.filter((c) => c.id !== clipId) }))
    }));
    setSelectedClipId((cur) => (cur === clipId ? null : cur));
  }, []);

  // Source frames available for a clip's media (∞ for stills, which loop).
  const sourceFramesFor = useCallback(
    (clip: Clip, fps: number): number => {
      const asset = assets.find((a) => a.id === clip.mediaRef);
      if (!asset || (asset.type !== "video" && asset.type !== "audio")) return Infinity;
      return Math.max(1, secondsToFrames(asset.durationSeconds, fps));
    },
    [assets]
  );

  const mapClip = useCallback((clipId: string, fn: (c: Clip) => Clip) => {
    setTimeline((tl) => ({
      ...tl,
      tracks: tl.tracks.map((t) => ({
        ...t,
        clips: t.clips.map((c) => (c.id === clipId ? fn(c) : c))
      }))
    }));
  }, []);

  // Drag a clip edge. `edge:"start"` moves the in-point (and timeline position);
  // `edge:"end"` moves the out-point. Trim is clamped to ≥1 frame, ≥0 source
  // offset, and (for video/audio) the available source length.
  const trimClip = useCallback(
    (clipId: string, edge: "start" | "end", deltaFrames: number) => {
      mapClip(clipId, (clip) => {
        const fps = timeline.fps;
        const speed = clip.speed || 1;
        const sourceFrames = sourceFramesFor(clip, fps);
        let delta = Math.round(deltaFrames);
        if (edge === "start") {
          const min = Math.max(-clip.startFrame, Math.ceil(-clip.trimStartFrame / speed));
          const max = clip.durationFrames - 1;
          delta = Math.min(max, Math.max(min, delta));
          const trimStartFrame = Math.max(0, Math.round(clip.trimStartFrame + delta * speed));
          const durationFrames = clip.durationFrames - delta;
          return {
            ...clip,
            startFrame: clip.startFrame + delta,
            durationFrames,
            trimStartFrame,
            trimEndFrame: Math.round(trimStartFrame + durationFrames * speed)
          };
        }
        const min = 1 - clip.durationFrames;
        const max = Number.isFinite(sourceFrames)
          ? Math.floor((sourceFrames - clip.trimStartFrame) / speed) - clip.durationFrames
          : Number.MAX_SAFE_INTEGER;
        delta = Math.min(max, Math.max(min, delta));
        const durationFrames = clip.durationFrames + delta;
        return {
          ...clip,
          durationFrames,
          trimEndFrame: Math.round(clip.trimStartFrame + durationFrames * speed)
        };
      });
    },
    [mapClip, sourceFramesFor, timeline.fps]
  );

  const splitClip = useCallback((clipId: string, atFrame: number) => {
    const at = Math.round(atFrame);
    setTimeline((tl) => ({
      ...tl,
      tracks: tl.tracks.map((t) => {
        if (!t.clips.some((c) => c.id === clipId)) return t;
        const clips: Clip[] = [];
        for (const c of t.clips) {
          const end = c.startFrame + c.durationFrames;
          if (c.id !== clipId || at <= c.startFrame || at >= end) {
            clips.push(c);
            continue;
          }
          const speed = c.speed || 1;
          const leftDur = at - c.startFrame;
          const cut = Math.round(c.trimStartFrame + leftDur * speed);
          clips.push({ ...c, durationFrames: leftDur, trimEndFrame: cut });
          clips.push({
            ...c,
            id: uid("clip"),
            startFrame: at,
            durationFrames: end - at,
            trimStartFrame: cut
          });
        }
        return { ...t, clips };
      })
    }));
  }, []);

  // Re-time a clip: keep its source in/out fixed, recompute timeline length.
  const setClipSpeed = useCallback((clipId: string, speed: number) => {
    const s = Math.min(8, Math.max(0.1, speed));
    mapClip(clipId, (clip) => {
      const oldSpeed = clip.speed || 1;
      const sourceConsumed = clip.durationFrames * oldSpeed;
      const durationFrames = Math.max(1, Math.round(sourceConsumed / s));
      return {
        ...clip,
        speed: s,
        durationFrames,
        trimEndFrame: Math.round(clip.trimStartFrame + sourceConsumed)
      };
    });
  }, [mapClip]);

  const setClipVolume = useCallback((clipId: string, volume: number) => {
    mapClip(clipId, (clip) => ({ ...clip, volume: Math.min(1, Math.max(0, volume)) }));
  }, [mapClip]);

  const toggleTrackMuted = useCallback((trackId: string) => {
    setTimeline((tl) => ({
      ...tl,
      tracks: tl.tracks.map((t) => (t.id === trackId ? { ...t, muted: !t.muted } : t))
    }));
  }, []);

  const toggleTrackHidden = useCallback((trackId: string) => {
    setTimeline((tl) => ({
      ...tl,
      tracks: tl.tracks.map((t) => (t.id === trackId ? { ...t, hidden: !t.hidden } : t))
    }));
  }, []);

  const setPlayhead = useCallback((frame: number) => setPlayheadState(Math.max(0, Math.round(frame))), []);

  const serialize = useCallback(
    (): ProjectFile => ({ version: PROJECT_FILE_VERSION, timeline, assets }),
    [timeline, assets]
  );

  const hydrate = useCallback((data: ProjectFile) => {
    setAssets(data.assets);
    setTimeline(data.timeline);
    setSelectedAssetId(null);
    setSelectedClipId(null);
    setPlayheadState(0);
  }, []);

  const store = useMemo<EditorStore>(
    () => ({
      assets,
      timeline,
      selectedAssetId,
      selectedClipId,
      playhead,
      pxPerFrame,
      assetById,
      importPaths,
      addGeneratedAsset,
      serialize,
      hydrate,
      selectAsset: (id) => {
        setSelectedAssetId(id);
        setSelectedClipId(null);
      },
      selectClip: setSelectedClipId,
      addAssetToTimeline,
      moveClip,
      removeClip,
      trimClip,
      splitClip,
      setClipSpeed,
      setClipVolume,
      toggleTrackMuted,
      toggleTrackHidden,
      setPlayhead,
      setPxPerFrame
    }),
    [
      assets,
      timeline,
      selectedAssetId,
      selectedClipId,
      playhead,
      pxPerFrame,
      assetById,
      importPaths,
      addGeneratedAsset,
      serialize,
      hydrate,
      addAssetToTimeline,
      moveClip,
      removeClip,
      trimClip,
      splitClip,
      setClipSpeed,
      setClipVolume,
      toggleTrackMuted,
      toggleTrackHidden,
      setPlayhead
    ]
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

// Re-exported helpers used by editor views.
export { clipEndFrame };
export type { Clip, ClipType, MediaAsset, Track };
