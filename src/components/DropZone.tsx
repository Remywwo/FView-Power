import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { useI18n } from "@/hooks/useI18n";

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
            setActive(true);
          } else if (type === "leave") {
            setActive(false);
          } else if (type === "drop") {
            setActive(false);
            const paths = event.payload?.paths;
            if (paths && paths.length > 0) {
              onDropPathRef.current(paths[0]);
            }
          }
        });
      } catch {
        // not in Tauri context
      }
    })();
    return () => { unlisten?.(); };
  }, []);

  // DOM-level: preventDefault on dragover so the browser treats this as a drop target.
  // Do NOT add an onDrop DOM handler — it would call preventDefault and block
  // the native event chain from reaching Tauri.
  const onDragOver = useCallback((e: React.DragEvent) => {
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
