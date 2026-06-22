import { useState } from "react";
import { trackLabel } from "../../shared/timeline";
import { useEditor } from "../editorStore";

function fmtDuration(s: number): string {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function MediaPanel() {
  const ed = useEditor();
  const [dragOver, setDragOver] = useState(false);

  const importViaPicker = async () => {
    const paths = await window.palmier.pickFiles();
    if (paths.length) await ed.importPaths(paths);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const paths = Array.from(e.dataTransfer.files)
      .map((f) => (f as File & { path?: string }).path)
      .filter((p): p is string => Boolean(p));
    if (!paths.length) return;
    await window.palmier.registerPaths(paths);
    await ed.importPaths(paths);
  };

  return (
    <div
      className={`media-panel ${dragOver ? "drag" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 10 }}>
        <b>Media</b>
        <button className="ghost" onClick={importViaPicker}>
          Import…
        </button>
      </div>

      {ed.assets.length === 0 ? (
        <p className="muted">Drop files here or click Import. Video, image, and audio supported.</p>
      ) : (
        <div className="asset-grid">
          {ed.assets.map((a) => (
            <div
              key={a.id}
              className={`asset ${ed.selectedAssetId === a.id ? "sel" : ""}`}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("application/x-asset-id", a.id)}
              onClick={() => ed.selectAsset(a.id)}
              onDoubleClick={() => ed.addAssetToTimeline(a.id, ed.playhead)}
              title="Double-click to add at the playhead"
            >
              <div className="asset-thumb">
                {a.thumbnailDataUrl ? (
                  <img src={a.thumbnailDataUrl} alt="" />
                ) : (
                  <span className="asset-icon">{trackLabel(a.type)[0]}</span>
                )}
              </div>
              <div className="asset-name" title={a.name}>
                {a.name}
              </div>
              <div className="asset-meta">
                {trackLabel(a.type)} · {fmtDuration(a.durationSeconds)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
