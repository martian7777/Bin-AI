import { useEffect, useState } from "react";
import { timelineTotalFrames } from "../../shared/timeline";
import { useEditor } from "../editorStore";
import { MediaPanel } from "./MediaPanel";
import { Preview } from "./Preview";
import { Timeline } from "./Timeline";

export function Editor() {
  const ed = useEditor();
  const [status, setStatus] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if ((e.key === "Delete" || e.key === "Backspace") && ed.selectedClipId) {
        e.preventDefault();
        ed.removeClip(ed.selectedClipId);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ed]);

  // Surface ffmpeg progress (frame=… time=…) while exporting.
  useEffect(() => {
    return window.palmierEvents.onExportProgress((line) => {
      const m = line.match(/time=(\S+)/);
      if (m) setStatus(`Exporting… ${m[1]}`);
    });
  }, []);

  const doExport = async () => {
    if (timelineTotalFrames(ed.timeline) === 0) {
      setStatus("Add at least one clip to the timeline first.");
      return;
    }
    setExporting(true);
    setStatus("Exporting…");
    try {
      const res = await window.palmier.exportTimeline(ed.serialize());
      if (!res) setStatus("Export cancelled.");
      else {
        setStatus(`Exported → ${res.outputPath}`);
        window.palmier.revealInFolder(res.outputPath);
      }
    } catch (e) {
      setStatus(`Export failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setExporting(false);
    }
  };

  const doSave = async () => {
    const path = await window.palmier.saveProject(ed.serialize());
    if (path) setStatus(`Saved → ${path}`);
  };

  const doOpen = async () => {
    const data = await window.palmier.loadProject();
    if (data) {
      ed.hydrate(data);
      setStatus("Project loaded.");
    }
  };

  return (
    <div className="editor">
      <div className="editor-bar">
        <button className="ghost" onClick={doOpen} disabled={exporting}>
          Open
        </button>
        <button className="ghost" onClick={doSave} disabled={exporting}>
          Save
        </button>
        <button className="primary" onClick={doExport} disabled={exporting}>
          {exporting ? "Exporting…" : "Export MP4"}
        </button>
        <span className="muted editor-status" title={status}>
          {status}
        </span>
      </div>
      <div className="editor-top">
        <MediaPanel />
        <Preview />
      </div>
      <Timeline />
    </div>
  );
}
