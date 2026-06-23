import { useMemo } from "react";
import { clipEndFrame, framesToSeconds, type Clip } from "../../shared/timeline";
import { useEditor } from "../editorStore";

const SPEED_PRESETS = [0.5, 1, 2];

export function ClipInspector() {
  const ed = useEditor();
  const fps = ed.timeline.fps;

  const clip: Clip | undefined = useMemo(() => {
    if (!ed.selectedClipId) return undefined;
    for (const t of ed.timeline.tracks) {
      const c = t.clips.find((c) => c.id === ed.selectedClipId);
      if (c) return c;
    }
    return undefined;
  }, [ed.selectedClipId, ed.timeline]);

  if (!clip) return null;

  const asset = ed.assetById(clip.mediaRef);
  const speed = clip.speed || 1;
  const end = clipEndFrame(clip);
  const hasAudio = clip.mediaType === "video" || clip.mediaType === "audio";
  const canSpeed = clip.mediaType === "video" || clip.mediaType === "audio";
  const splittable = ed.playhead > clip.startFrame && ed.playhead < end;

  return (
    <div className="clip-inspector">
      <span className="clip-inspector-name" title={asset?.name}>
        {asset?.name ?? clip.mediaType}
      </span>
      <span className="muted">{framesToSeconds(clip.durationFrames, fps).toFixed(2)}s</span>

      <button
        className="ghost"
        disabled={!splittable}
        title={splittable ? "Split at playhead (S)" : "Move the playhead over the clip to split"}
        onClick={() => ed.splitClip(clip.id, ed.playhead)}
      >
        Split
      </button>

      {canSpeed && (
        <div className="clip-speed">
          <span className="muted">speed</span>
          {SPEED_PRESETS.map((s) => (
            <button
              key={s}
              className={`chip ${Math.abs(speed - s) < 0.001 ? "on" : ""}`}
              onClick={() => ed.setClipSpeed(clip.id, s)}
            >
              {s}×
            </button>
          ))}
          <input
            type="number"
            className="clip-speed-input"
            min={0.1}
            max={8}
            step={0.25}
            value={Number(speed.toFixed(2))}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!Number.isNaN(v)) ed.setClipSpeed(clip.id, v);
            }}
          />
        </div>
      )}

      {hasAudio && (
        <div className="clip-volume">
          <span className="muted">vol</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={clip.volume}
            onChange={(e) => ed.setClipVolume(clip.id, parseFloat(e.target.value))}
          />
        </div>
      )}

      <button className="ghost" onClick={() => ed.removeClip(clip.id)}>
        Delete
      </button>
    </div>
  );
}
