import { useEffect, useMemo, useRef, useState } from "react";
import {
  clipEndFrame,
  framesToSeconds,
  isVisual,
  timelineTotalFrames,
  type Clip,
  type Track
} from "../../shared/timeline";
import { mediaUrl } from "../../shared/types";
import { useEditor } from "../editorStore";

interface ActiveLayer {
  track: Track;
  clip: Clip;
}

function activeClip(track: Track, playhead: number): Clip | undefined {
  return track.clips.find((c) => playhead >= c.startFrame && playhead < clipEndFrame(c));
}

function fmtTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toFixed(2).padStart(5, "0")}`;
}

export function Preview() {
  const ed = useEditor();
  const [playing, setPlaying] = useState(false);
  const fps = ed.timeline.fps;
  const total = timelineTotalFrames(ed.timeline);

  // Visual layers, bottom track first so later tracks stack on top — matching
  // the export overlay order.
  const visualLayers = useMemo<ActiveLayer[]>(() => {
    const out: ActiveLayer[] = [];
    for (const track of ed.timeline.tracks) {
      if (track.hidden || !isVisual(track.type)) continue;
      const clip = activeClip(track, ed.playhead);
      if (clip) out.push({ track, clip });
    }
    return out;
  }, [ed.timeline, ed.playhead]);

  // Audio-only tracks (video audio rides along with its visual layer).
  const audioLayers = useMemo<ActiveLayer[]>(() => {
    const out: ActiveLayer[] = [];
    for (const track of ed.timeline.tracks) {
      if (track.muted || track.type !== "audio") continue;
      const clip = activeClip(track, ed.playhead);
      if (clip) out.push({ track, clip });
    }
    return out;
  }, [ed.timeline, ed.playhead]);

  // Real-time transport clock. Seeds from the current playhead when play begins
  // and advances it in wall-clock time; media layers chase the playhead.
  useEffect(() => {
    if (!playing) return;
    if (total <= 0) {
      setPlaying(false);
      return;
    }
    let head = ed.playhead >= total ? 0 : ed.playhead;
    let raf = 0;
    let last = performance.now();
    const tick = (ts: number) => {
      const dt = (ts - last) / 1000;
      last = ts;
      head += dt * fps;
      if (head >= total) {
        ed.setPlayhead(total);
        setPlaying(false);
        return;
      }
      ed.setPlayhead(head);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  const fallbackAsset = useMemo(() => {
    if (visualLayers.length > 0) return undefined;
    const id = ed.selectedAssetId;
    return id ? ed.assetById(id) : undefined;
  }, [visualLayers, ed]);

  const aspect = ed.timeline.width / ed.timeline.height;
  const canPlay = total > 0;

  return (
    <div className="preview">
      <div className="preview-stage" style={{ aspectRatio: String(aspect) }}>
        {visualLayers.length === 0 && !fallbackAsset && (
          <div className="preview-empty">No clip under the playhead</div>
        )}
        {visualLayers.map((l) => (
          <VisualLayer key={l.clip.id} layer={l} playhead={ed.playhead} playing={playing} fps={fps} />
        ))}
        {fallbackAsset?.type === "video" && (
          <video className="preview-layer" src={mediaUrl(fallbackAsset.filePath)} controls />
        )}
        {fallbackAsset?.type === "image" && (
          <img className="preview-layer" src={mediaUrl(fallbackAsset.filePath)} alt="" />
        )}
        {fallbackAsset && fallbackAsset.type !== "video" && fallbackAsset.type !== "image" && (
          <div className="preview-empty">{fallbackAsset.name}</div>
        )}
      </div>

      {audioLayers.map((l) => (
        <AudioLayer key={l.clip.id} layer={l} playhead={ed.playhead} playing={playing} fps={fps} />
      ))}

      <div className="preview-transport">
        <button
          className="primary play"
          disabled={!canPlay}
          onClick={() => setPlaying((p) => !p)}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <button
          className="ghost"
          onClick={() => {
            setPlaying(false);
            ed.setPlayhead(0);
          }}
          title="Back to start"
        >
          ⏮
        </button>
        <span className="muted">
          {fmtTime(framesToSeconds(ed.playhead, fps))} / {fmtTime(framesToSeconds(total, fps))}
        </span>
      </div>

      <div className="muted" style={{ marginTop: 6 }}>
        {ed.timeline.width}×{ed.timeline.height} · {fps} fps · frame {ed.playhead}
      </div>
    </div>
  );
}

function sourceSeconds(clip: Clip, playhead: number, fps: number): number {
  const speed = clip.speed || 1;
  return (clip.trimStartFrame + (playhead - clip.startFrame) * speed) / fps;
}

function VisualLayer({
  layer,
  playhead,
  playing,
  fps
}: {
  layer: ActiveLayer;
  playhead: number;
  playing: boolean;
  fps: number;
}) {
  const ed = useEditor();
  const { clip, track } = layer;
  const asset = ed.assetById(clip.mediaRef);
  const ref = useRef<HTMLVideoElement>(null);
  const srcSec = sourceSeconds(clip, playhead, fps);
  const muted = track.muted || clip.volume <= 0;
  const speed = clip.speed || 1;

  useEffect(() => {
    const v = ref.current;
    if (!v || asset?.type !== "video") return;
    v.muted = muted;
    v.volume = Math.min(1, Math.max(0, clip.volume));
    try {
      v.playbackRate = Math.min(4, Math.max(0.25, speed));
    } catch {
      /* playbackRate out of range */
    }
    if (playing) {
      if (Math.abs(v.currentTime - srcSec) > 0.3) v.currentTime = srcSec;
      if (v.paused) void v.play().catch(() => {});
    } else {
      if (!v.paused) v.pause();
      if (Math.abs(v.currentTime - srcSec) > 0.02) v.currentTime = srcSec;
    }
  });

  if (!asset) return null;
  if (asset.type === "image") {
    return <img className="preview-layer" src={mediaUrl(asset.filePath)} alt="" />;
  }
  if (asset.type === "video") {
    return <video className="preview-layer" ref={ref} src={mediaUrl(asset.filePath)} playsInline />;
  }
  return null;
}

function AudioLayer({
  layer,
  playhead,
  playing,
  fps
}: {
  layer: ActiveLayer;
  playhead: number;
  playing: boolean;
  fps: number;
}) {
  const ed = useEditor();
  const { clip, track } = layer;
  const asset = ed.assetById(clip.mediaRef);
  const ref = useRef<HTMLAudioElement>(null);
  const srcSec = sourceSeconds(clip, playhead, fps);
  const speed = clip.speed || 1;

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    a.muted = track.muted;
    a.volume = Math.min(1, Math.max(0, clip.volume));
    try {
      a.playbackRate = Math.min(4, Math.max(0.25, speed));
    } catch {
      /* playbackRate out of range */
    }
    if (playing) {
      if (Math.abs(a.currentTime - srcSec) > 0.3) a.currentTime = srcSec;
      if (a.paused) void a.play().catch(() => {});
    } else {
      if (!a.paused) a.pause();
      if (Math.abs(a.currentTime - srcSec) > 0.02) a.currentTime = srcSec;
    }
  });

  if (!asset) return null;
  return <audio ref={ref} src={mediaUrl(asset.filePath)} />;
}
