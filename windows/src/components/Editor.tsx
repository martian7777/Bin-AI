import { useEffect } from "react";
import { useEditor } from "../editorStore";
import { MediaPanel } from "./MediaPanel";
import { Preview } from "./Preview";
import { Timeline } from "./Timeline";

export function Editor() {
  const ed = useEditor();

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

  return (
    <div className="editor">
      <div className="editor-top">
        <MediaPanel />
        <Preview />
      </div>
      <Timeline />
    </div>
  );
}
