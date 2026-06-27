import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { useI18n } from "@/hooks/useI18n";

/**
 * Returns true when the physical-pixel position maps to a DOM element
 * inside the Markdown editor (`[data-md-editor]`). Drops that land on
 * the editor are deliberately NOT forwarded to `handleDropPath` so
 * ProseMirror can handle them naturally (image insertion, etc.).
 */
function isOverMarkdownEditor(pos: { x: number; y: number }): boolean {
  const dpr = window.devicePixelRatio || 1;
  const el = document.elementFromPoint(pos.x / dpr, pos.y / dpr);
  return !!el?.closest("[data-md-editor]");
}

export function DropZone({ onDropPath }: { onDropPath: (path: string) => void }) {
  const { t } = useI18n();
  const [active, setActive] = useState(false);
  const onDropPathRef = useRef(onDropPath);
  onDropPathRef.current = onDropPath;

  // Tauri drag-drop: register once, keep callback fresh via ref
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    (async () => {
      try {
        const webview = getCurrentWebview();
        unlisten = await webview.onDragDropEvent((event) => {
          const type = event.payload?.type;
          if (type === "enter") {
            const pos = "position" in event.payload ? event.payload.position : null;
            if (!pos || isOverMarkdownEditor(pos)) return;
            setActive(true);
          } else if (type === "over") {
            const pos = "position" in event.payload ? event.payload.position : null;
            if (!pos) return;
            setActive(!isOverMarkdownEditor(pos));
          } else if (type === "leave") {
            setActive(false);
          } else if (type === "drop") {
            setActive(false);
            const paths = event.payload?.paths;
            if (!paths || paths.length === 0) return;
            const pos = "position" in event.payload ? event.payload.position : null;
            if (pos && isOverMarkdownEditor(pos)) return;
            onDropPathRef.current(paths[0]);
          }
        });
      } catch {
        // not in Tauri context
      }
    })();
    return () => { unlisten?.(); };
  }, []);

  // DOM-level: preventDefault on dragover so the browser treats this as a
  // drop target — BUT skip it when the target is inside the Markdown editor
  // so ProseMirror's own drag-drop handlers (internal block/text moves and
  // external file/image drops onto the editor) receive the events.
  const onDragOver = useCallback((e: React.DragEvent) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest("[data-md-editor]")) return;
    e.preventDefault();
  }, []);

  return (
    <div
      className={`drop-overlay${active ? " active" : ""}`}
      onDragOver={onDragOver}
    >
      <div className="drop-overlay-content">
        {t("app.dropFile")}
      </div>
    </div>
  );
}
