import { useEffect, useRef } from "react";
import type { EditorView } from "@codemirror/view";

const LOCK_MS = 80;

function findTopmostSourceLine(container: HTMLElement): number | null {
  const containerRect = container.getBoundingClientRect();
  const visibleY = containerRect.top + 1;
  const elements = container.querySelectorAll<HTMLElement>("[data-source-line]");
  let best: { line: number; dist: number } | null = null;
  for (const el of elements) {
    const rect = el.getBoundingClientRect();
    if (rect.bottom <= visibleY) continue;
    if (rect.top >= containerRect.bottom) break;
    const dist = Math.abs(rect.top - visibleY);
    const line = parseInt(el.dataset.sourceLine || "0", 10);
    if (line > 0 && (best === null || dist < best.dist)) {
      best = { line, dist };
    }
  }
  return best?.line ?? null;
}

function findFirstElementAtOrAfter(container: HTMLElement, targetLine: number): HTMLElement | null {
  const elements = container.querySelectorAll<HTMLElement>("[data-source-line]");
  for (const el of elements) {
    const line = parseInt(el.dataset.sourceLine || "0", 10);
    if (line >= targetLine) return el;
  }
  return null;
}

export function useScrollSync(
  editorView: EditorView | null,
  previewScroll: HTMLElement | null,
  enabled: boolean,
) {
  const lockUntilRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !editorView || !previewScroll) return;

    const editorScroll = editorView.scrollDOM;

    const isLocked = () => performance.now() < lockUntilRef.current;

    const cancelPending = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const onEditorScroll = () => {
      if (isLocked()) return;
      cancelPending();
      rafRef.current = requestAnimationFrame(() => {
        const scrollTop = editorScroll.scrollTop;
        const lineHeight = editorView.defaultLineHeight || 20;
        if (lineHeight <= 0) return;
        const topLine = Math.floor(scrollTop / lineHeight) + 1;
        const target = findFirstElementAtOrAfter(previewScroll, topLine);
        if (target) {
          lockUntilRef.current = performance.now() + LOCK_MS;
          const containerRect = previewScroll.getBoundingClientRect();
          const elRect = target.getBoundingClientRect();
          const offsetInContainer = elRect.top - containerRect.top + previewScroll.scrollTop;
          previewScroll.scrollTop = Math.max(0, offsetInContainer);
        }
      });
    };

    const onPreviewScroll = () => {
      if (isLocked()) return;
      cancelPending();
      rafRef.current = requestAnimationFrame(() => {
        const topLine = findTopmostSourceLine(previewScroll);
        if (topLine === null) return;
        const lineHeight = editorView.defaultLineHeight || 20;
        if (lineHeight <= 0) return;
        const targetScrollTop = (topLine - 1) * lineHeight;
        lockUntilRef.current = performance.now() + LOCK_MS;
        editorScroll.scrollTop = targetScrollTop;
      });
    };

    editorScroll.addEventListener("scroll", onEditorScroll, { passive: true });
    previewScroll.addEventListener("scroll", onPreviewScroll, { passive: true });

    return () => {
      editorScroll.removeEventListener("scroll", onEditorScroll);
      previewScroll.removeEventListener("scroll", onPreviewScroll);
      cancelPending();
    };
  }, [editorView, previewScroll, enabled]);
}
