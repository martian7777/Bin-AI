import { useRef } from "react";
import {
  clipEndFrame,
  timelineTotalFrames,
  trackLabel,
  type Clip,
  type ClipType,
  type Track
} from "../../shared/timeline";
import { useEditor } from "../editorStore";

const RULER_H = 24;
const LANE_H = 56;

const CLIP_COLORS: Record<ClipType, string> = {
  video: "#3b82f6",
  audio: "#10b981",
  image: "#a855f7",
  text: "#f59e0b",
  lottie: "#ec4899"
};

export function Timeline() {
  const ed = useEditor();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fps = ed.timeline.fps;

  const totalFrames = Math.max(timelineTotalFrames(ed.timeline), fps * 10);
  const contentWidth = Math.max(800, (totalFrames + fps * 2) * ed.pxPerFrame);

  const frameAtClientX = (clientX: number): number => {
    const el = scrollRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    return (clientX - rect.left + el.scrollLeft) / ed.pxPerFrame;
  };

  const onRulerClick = (e: React.MouseEvent) => ed.setPlayhead(frameAtClientX(e.clientX));

  const onDropAsset = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("application/x-asset-id");
    if (id) ed.addAssetToTimeline(id, Math.round(frameAtClientX(e.clientX)));
  };

  // Ruler ticks once per second.
  const seconds = Math.ceil(totalFrames / fps) + 2;
  const ticks = Array.from({ length: seconds }, (_, s) => s);

  return (
    <div className="timeline">
      <div className="tl-toolbar">
        <button className="ghost" onClick={() => ed.setPxPerFrame(Math.max(1, ed.pxPerFrame - 1))}>
          −
        </button>
        <span className="muted">zoom</span>
        <button className="ghost" onClick={() => ed.setPxPerFrame(Math.min(40, ed.pxPerFrame + 1))}>
          +
        </button>
        <span className="muted" style={{ marginLeft: 12 }}>
          {(totalFrames / fps).toFixed(1)}s total
        </span>
        {ed.selectedClipId && (
          <button className="ghost" style={{ marginLeft: "auto" }} onClick={() => ed.removeClip(ed.selectedClipId!)}>
            Delete clip
          </button>
        )}
      </div>

      <div className="tl-body">
        <div className="tl-headers">
          <div style={{ height: RULER_H }} />
          {ed.timeline.tracks.map((t) => (
            <div className="tl-head" key={t.id} style={{ height: LANE_H }}>
              {trackLabel(t.type)}
            </div>
          ))}
        </div>

        <div
          className="tl-scroll"
          ref={scrollRef}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDropAsset}
        >
          <div className="tl-content" style={{ width: contentWidth }}>
            <div className="tl-ruler" style={{ height: RULER_H }} onClick={onRulerClick}>
              {ticks.map((s) => (
                <div key={s} className="tl-tick" style={{ left: s * fps * ed.pxPerFrame }}>
                  <span>{s}s</span>
                </div>
              ))}
            </div>

            {ed.timeline.tracks.map((track) => (
              <Lane key={track.id} track={track} />
            ))}

            {ed.timeline.tracks.length === 0 && (
              <div className="tl-empty">Drag a clip here, or double-click media to add it.</div>
            )}

            <div className="tl-playhead" style={{ left: ed.playhead * ed.pxPerFrame }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Lane({ track }: { track: Track }) {
  return (
    <div className="tl-lane" style={{ height: LANE_H }}>
      {track.clips.map((clip) => (
        <ClipBlock key={clip.id} clip={clip} />
      ))}
    </div>
  );
}

function ClipBlock({ clip }: { clip: Clip }) {
  const ed = useEditor();
  const drag = useRef<{ startX: number; origStart: number; moved: boolean } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    ed.selectClip(clip.id);
    drag.current = { startX: e.clientX, origStart: clip.startFrame, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dxFrames = (e.clientX - drag.current.startX) / ed.pxPerFrame;
    if (Math.abs(dxFrames) > 0.5) drag.current.moved = true;
    if (drag.current.moved) ed.moveClip(clip.id, drag.current.origStart + dxFrames);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    drag.current = null;
  };

  const selected = ed.selectedClipId === clip.id;
  const asset = ed.assetById(clip.mediaRef);

  return (
    <div
      className={`tl-clip ${selected ? "sel" : ""}`}
      style={{
        left: clip.startFrame * ed.pxPerFrame,
        width: Math.max(6, clip.durationFrames * ed.pxPerFrame),
        background: CLIP_COLORS[clip.mediaType]
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      title={`${asset?.name ?? clip.mediaRef} · ${clip.startFrame}–${clipEndFrame(clip)}f`}
    >
      <span className="tl-clip-label">{asset?.name ?? clip.mediaType}</span>
    </div>
  );
}
