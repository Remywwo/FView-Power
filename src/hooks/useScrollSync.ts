import { useEffect, useRef } from "react";
import type { EditorView } from "@codemirror/view";

const LOCK_MS = 80;

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
        const eMax = editorScroll.scrollHeight - editorScroll.clientHeight;
        if (eMax <= 0) return;
        const pMax = previewScroll.scrollHeight - previewScroll.clientHeight;
        if (pMax <= 0) return;
        const progress = editorScroll.scrollTop / eMax;
        lockUntilRef.current = performance.now() + LOCK_MS;
        previewScroll.scrollTop = progress * pMax;
      });
    };

    const onPreviewScroll = () => {
      if (isLocked()) return;
      cancelPending();
      rafRef.current = requestAnimationFrame(() => {
        const pMax = previewScroll.scrollHeight - previewScroll.clientHeight;
        if (pMax <= 0) return;
        const eMax = editorScroll.scrollHeight - editorScroll.clientHeight;
        if (eMax <= 0) return;
        const progress = previewScroll.scrollTop / pMax;
        lockUntilRef.current = performance.now() + LOCK_MS;
        editorScroll.scrollTop = progress * eMax;
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
