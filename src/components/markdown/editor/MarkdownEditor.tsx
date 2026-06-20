import { useEffect, useRef, useState } from "react";
import { useMilkdownEditor } from "./useMilkdownEditor";
import type { EditorView } from "@milkdown/kit/prose/view";
import "@milkdown/crepe/theme/common/style.css";
import "@milkdown/crepe/theme/frame.css";

export interface MarkdownEditorProps {
  content: string;
  onContentChange: (markdown: string) => void;
  viewRef?: React.MutableRefObject<EditorView | null>;
  onViewReady?: (view: EditorView) => void;
}

export function MarkdownEditor({ content, onContentChange, viewRef, onViewReady }: MarkdownEditorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [rootEl, setRootEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => setRootEl(rootRef.current), []);

  useMilkdownEditor({ root: rootEl, content, onChange: onContentChange, viewRef, onViewReady });

  return (
    <div
      ref={rootRef}
      data-md-preview=""
      data-md-editor=""
      style={{ height: "100%", overflow: "auto" }}
    />
  );
}
