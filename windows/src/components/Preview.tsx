import { useEffect, useMemo, useRef } from "react";
import { framesToSeconds, type Clip } from "../../shared/timeline";
import { mediaUrl } from "../../shared/types";
import { useEditor } from "../editorStore";

export function Preview() {
  const ed = useEditor();
  const videoRef = useRef<HTMLVideoElement>(null);

  const selectedClip: Clip | undefined = useMemo(() => {
    if (!ed.selectedClipId) return undefined;
    for (const t of ed.timeline.tracks) {
      const c = t.clips.find((c) => c.id === ed.selectedClipId);
      if (c) return c;
    }
    return undefined;
  }, [ed.selectedClipId, ed.timeline]);

  const asset = useMemo(() => {
    if (selectedClip) return ed.assetById(selectedClip.mediaRef);
    if (ed.selectedAssetId) return ed.assetById(ed.selectedAssetId);
    return undefined;
  }, [selectedClip, ed]);

  // Scrub the preview video to the playhead position within the selected clip.
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !selectedClip || asset?.type !== "video") return;
    const rel = ed.playhead - selectedClip.startFrame;
    if (rel < 0 || rel > selectedClip.durationFrames) return;
    const srcFrames = rel * selectedClip.speed + selectedClip.trimStartFrame;
    const t = framesToSeconds(srcFrames, ed.timeline.fps);
    if (Math.abs(v.currentTime - t) > 0.05) v.currentTime = t;
  }, [ed.playhead, selectedClip, asset, ed.timeline.fps]);

  const aspect = ed.timeline.width / ed.timeline.height;

  return (
    <div className="preview">
      <div className="preview-stage" style={{ aspectRatio: String(aspect) }}>
        {!asset && <div className="preview-empty">No clip selected</div>}
        {asset?.type === "video" && (
          <video ref={videoRef} src={mediaUrl(asset.filePath)} controls />
        )}
        {asset?.type === "image" && <img src={mediaUrl(asset.filePath)} alt="" />}
        {asset?.type === "audio" && (
          <div className="preview-audio">
            <audio src={mediaUrl(asset.filePath)} controls />
            <span className="muted">{asset.name}</span>
          </div>
        )}
        {asset && !["video", "image", "audio"].includes(asset.type) && (
          <div className="preview-empty">{asset.name}</div>
        )}
      </div>
      <div className="muted" style={{ marginTop: 8 }}>
        {ed.timeline.width}×{ed.timeline.height} · {ed.timeline.fps} fps · frame {ed.playhead}
      </div>
    </div>
  );
}
