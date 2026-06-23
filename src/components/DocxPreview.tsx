import { useEffect, useRef, useState } from "react";
import type { LoadedFile } from "@/hooks/useFileLoader";
import { useI18n } from "@/hooks/useI18n";

type Status = "loading" | "ready" | "error";

export function DocxPreview({ file }: { file: LoadedFile }) {
  const { t } = useI18n();
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError(null);

    const container = containerRef.current;
    if (!container) return;
    // Clear stale DOM from a previous docx render before re-rendering.
    container.innerHTML = "";

    if (!file.binaryBytes) {
      setError("No DOCX data available");
      setStatus("error");
      return;
    }

    (async () => {
      try {
        // Dynamic import — Vite splits docx-preview into its own chunk.
        const { renderAsync } = await import("docx-preview");
        // .slice() so docx-preview's internal typed-array views never mutate
        // the loader-owned buffer.
        await renderAsync(
          file.binaryBytes!.slice(),
          container,
          undefined,
          {
            className: "docx",
            inWrapper: true,
            breakPages: true,
            ignoreWidth: false,
            ignoreHeight: false,
            ignoreFonts: false,
            useBase64URL: true,
            renderHeaders: true,
            renderFooters: true,
            renderFootnotes: true,
            renderEndnotes: true,
            renderChanges: false,
            renderComments: false,
          },
        );
        if (!cancelled) setStatus("ready");
      } catch (e: unknown) {
        if (cancelled) return;
        const message = e instanceof Error ? e.message : String(e);
        setError(message);
        setStatus("error");
        console.error("DOCX render error", e);
      }
    })();

    return () => {
      cancelled = true;
      // Release the rendered DOM on unmount / file switch.
      if (container) container.innerHTML = "";
    };
  }, [file.path, file.binaryBytes]);

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex-1 min-h-0 overflow-auto"
        style={{ background: "var(--md-code-bg)" }}
      >
        {status === "loading" && (
          <div className="empty-state">
            <div className="hint">{t("app.docxLoading")}</div>
          </div>
        )}
        {status === "error" && (
          <div className="empty-state">
            <div className="title" style={{ color: "#ef4444" }}>
              {t("app.docxError")}
            </div>
            <div className="hint">{error}</div>
          </div>
        )}
        <div
          ref={containerRef}
          className="docx-preview-container"
        />
      </div>
    </div>
  );
}
