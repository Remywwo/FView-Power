import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LoadedFile } from "@/hooks/useFileLoader";
import { useI18n } from "@/hooks/useI18n";
import { mimeForImage } from "@/utils/fileDetector";

const MAX_SCALE = 9.99;
const SCALE_STEP = 0.05;

export function ImagePreview({ file }: { file: LoadedFile }) {
  const { t } = useI18n();
  const [scale, setScale] = useState(1);
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [viewSize, setViewSize] = useState({ w: 0, h: 0 });
  const [inputVal, setInputVal] = useState("");
  const [inputFocus, setInputFocus] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, startY: 0, scrollX: 0, scrollY: 0 });
  const userAdjustedRef = useRef(false);

  // Track preview area size via ResizeObserver
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setViewSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // fitRatio = scale needed to fit within the preview area (capped at 1)
  const fitRatio = useMemo(() => {
    if (!natural || viewSize.w <= 0 || viewSize.h <= 0) return null;
    return Math.min(1, viewSize.w / natural.w, viewSize.h / natural.h);
  }, [natural, viewSize]);

  // When fitRatio becomes available, set scale to it
  const prevFitRef = useRef<number | null>(null);
  useEffect(() => {
    if (fitRatio === null) return;
    if (prevFitRef.current === null) {
      setScale(fitRatio);
      userAdjustedRef.current = false;
    } else if (!userAdjustedRef.current && fitRatio !== prevFitRef.current) {
      setScale(fitRatio);
    }
    prevFitRef.current = fitRatio;
  }, [fitRatio]);

  // Reset on file change
  useEffect(() => {
    setNatural(null);
    setError(null);
    prevFitRef.current = null;
    userAdjustedRef.current = false;
  }, [file.path]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!file.binaryBytes) {
          setError("No image data");
          return;
        }
        const mime = mimeForImage(file.extension);
        const blob = new Blob([file.binaryBytes as BlobPart], { type: mime });
        const url = URL.createObjectURL(blob);
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
        setSrc(url);
      } catch (e: any) {
        setError(e?.message || String(e));
      }
    })();
    return () => { cancelled = true; };
  }, [file.path, file.binaryBytes]);

  useEffect(() => {
    return () => {
      if (src) URL.revokeObjectURL(src);
    };
  }, [src]);

  // Display dimensions: natural * scale
  const dims = useMemo(() => {
    if (!natural) return null;
    return {
      w: Math.round(natural.w * scale),
      h: Math.round(natural.h * scale),
    };
  }, [natural, scale]);

  const overflowing = dims && viewSize.w > 0
    ? dims.w > viewSize.w || dims.h > viewSize.h
    : false;

  const adjustScale = useCallback((fn: (prev: number) => number) => {
    userAdjustedRef.current = true;
    setScale(fn);
  }, []);

  const resetScale = useCallback(() => {
    if (fitRatio !== null) {
      setScale(fitRatio);
      userAdjustedRef.current = false;
    }
  }, [fitRatio]);

  const zoomIn = useCallback(() => adjustScale((s) => Math.min(MAX_SCALE, +(s + SCALE_STEP).toFixed(4))), [adjustScale]);
  const zoomOut = useCallback(() => adjustScale((s) => Math.max(0.01, +(s - SCALE_STEP).toFixed(4))), [adjustScale]);

  // Keyboard shortcuts: Ctrl+= / Ctrl++ zoom in, Ctrl+- zoom out, Ctrl+0 reset
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === "=" || e.key === "+") { e.preventDefault(); zoomIn(); }
      else if (e.key === "-") { e.preventDefault(); zoomOut(); }
      else if (e.key === "0") { e.preventDefault(); resetScale(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomIn, zoomOut, resetScale]);

  const commitScaleInput = useCallback(() => {
    const v = inputVal.replace("%", "").trim();
    if (v === "") { setInputVal(""); setInputFocus(false); return; }
    const n = parseFloat(v);
    if (isNaN(n)) { setInputVal(""); setInputFocus(false); return; }
    const pct = Math.min(999, Math.max(1, Math.round(n))) / 100;
    setScale(pct);
    userAdjustedRef.current = true;
    setInputVal("");
    setInputFocus(false);
  }, [inputVal]);

  const onScaleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === "Escape") {
      setInputVal("");
      setInputFocus(false);
    }
  }, []);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0 || !overflowing) return;
    const el = scrollRef.current;
    if (!el) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      scrollX: el.scrollLeft,
      scrollY: el.scrollTop,
    };
    setDragging(true);
    e.preventDefault();
  }, [overflowing]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current.active) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = dragRef.current.scrollX - (e.clientX - dragRef.current.startX);
    el.scrollTop = dragRef.current.scrollY - (e.clientY - dragRef.current.startY);
  }, []);

  const onMouseUp = useCallback(() => {
    dragRef.current.active = false;
    setDragging(false);
  }, []);

  return (
    <div ref={rootRef} className="h-full relative" style={{ background: "var(--md-code-bg)" }}>
      {/* Scroll container fills the entire preview area */}
      <div
        ref={scrollRef}
        style={{
          position: "absolute",
          inset: 0,
          overflow: "auto",
          paddingBottom: 72,
          cursor: overflowing ? (dragging ? "grabbing" : "grab") : "default",
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {error && (
          <div className="empty-state" style={{ height: "100%" }}>
            <div className="title" style={{ color: "#ef4444" }}>{t("image.error")}</div>
            <div className="hint">{error}</div>
          </div>
        )}
        {src && !error && (
          <div
            style={{
              minWidth: "100%",
              minHeight: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img
              src={src}
              alt={file.name}
              onLoad={(e) => {
                setNatural({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight });
              }}
              style={
                dims
                  ? {
                      width: dims.w,
                      height: dims.h,
                      maxWidth: "none",
                      maxHeight: "none",
                      display: "block",
                      flexShrink: 0,
                    }
                  : {
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      display: "block",
                    }
              }
              draggable={false}
            />
          </div>
        )}
      </div>

      {/* Floating toolbar at bottom */}
      <div
        className="toolbar"
        style={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          borderRadius: 8,
          boxShadow: "0 2px 16px rgba(0,0,0,0.35)",
          width: 220,
          background: "var(--md-bg)",
          padding: "0.5rem 1rem",
          height: "auto",
          minHeight: "unset",
          borderBottom: "none",
        }}
      >
        <button onClick={zoomOut} title="Ctrl+−">−</button>
        <span
          className="file-info"
          style={{
            display: "inline-flex",
            alignItems: "center",
            width: "3.8em",
            justifyContent: "center",
            cursor: "pointer",
            userSelect: "none",
          }}
          title={t("image.clickToEdit")}
          onClick={() => { setInputVal(String(Math.round(scale * 100))); setInputFocus(true); }}
        >
          {inputFocus ? (
            <input
              type="text"
              inputMode="numeric"
              autoFocus
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onBlur={commitScaleInput}
              onKeyDown={onScaleInputKeyDown}
              style={{
                width: "100%",
                height: "100%",
                textAlign: "center",
                border: "none",
                outline: "none",
                background: "transparent",
                color: "inherit",
                fontSize: "inherit",
                fontFamily: "inherit",
                fontWeight: "inherit",
                padding: 0,
              }}
            />
          ) : (
            Math.round(scale * 100) + "%"
          )}
        </span>
        <button onClick={zoomIn} title="Ctrl++">+</button>
        <button onClick={resetScale} title="Ctrl+0">{t("image.reset")}</button>
      </div>
    </div>
  );
}
