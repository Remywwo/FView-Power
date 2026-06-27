import { useEffect, useRef, useCallback } from "react";
import { Crepe } from "@milkdown/crepe";
import { editorViewCtx } from "@milkdown/kit/core";
import { replaceAll } from "@milkdown/kit/utils";
import { $prose } from "@milkdown/kit/utils";
import type { EditorView } from "@milkdown/kit/prose/view";
import { Plugin, PluginKey } from "prosemirror-state";
import { DecorationSet } from "prosemirror-view";

/** Plugin key used by useSearch to push highlight decorations. */
export const searchPluginKey = new PluginKey("searchHighlight");
const searchPlugin = $prose(() => new Plugin({
  key: searchPluginKey,
  state: {
    init: () => DecorationSet.empty,
    apply(tr, old) {
      const meta = tr.getMeta("searchDeco") as DecorationSet | undefined;
      if (meta !== undefined) return meta;
      return old.map(tr.mapping, tr.doc);
    },
  },
  props: {
    decorations(state) {
      return searchPluginKey.getState(state) ?? DecorationSet.empty;
    },
  },
}));

/**
 * Disambiguation of external file drops vs internal ProseMirror drags is
 * handled by DropZone.tsx: when a Tauri `onDragDropEvent` lands on a
 * `[data-md-editor]` element the drop is NOT forwarded to `handleDropPath`,
 * so ProseMirror's built-in handlers (image insertion etc.) can process
 * the drop without the app opening the file.
 */
export interface MilkdownHandle {
  setContent: (markdown: string) => void;
  setReadonly: (v: boolean) => void;
  getMarkdown: () => string;
  getView: () => EditorView | null;
}

interface Options {
  root: HTMLElement | null;
  content: string;
  onChange: (markdown: string) => void;
  viewRef?: React.MutableRefObject<EditorView | null>;
  /** Called when the ProseMirror view is ready. Triggers a re-render. */
  onViewReady?: (view: EditorView) => void;
}

export function useMilkdownEditor(opts: Options) {
  const crepeRef = useRef<Crepe | null>(null);
  const onChangeRef = useRef(opts.onChange);
  onChangeRef.current = opts.onChange;

  const getView = useCallback((): EditorView | null => {
    let v: EditorView | null = null;
    try {
      crepeRef.current?.editor.action((ctx: { get: (slice: typeof editorViewCtx) => EditorView }) => {
        v = ctx.get(editorViewCtx);
      });
    } catch { /* not ready yet */ }
    return v;
  }, []);

  const setContent = useCallback((md: string) => {
    const crepe = crepeRef.current;
    if (!crepe) return;
    const cur = crepe.getMarkdown();
    if (cur === md) return;
    crepe.editor.action(replaceAll(md));
  }, []);

  const setReadonly = useCallback((v: boolean) => {
    crepeRef.current?.setReadonly(v);
  }, []);

  const getMarkdown = useCallback(() => {
    return crepeRef.current?.getMarkdown() ?? "";
  }, []);

  const handleRef = useRef<MilkdownHandle>({ setContent, setReadonly, getMarkdown, getView });
  handleRef.current = { setContent, setReadonly, getMarkdown, getView };

  useEffect(() => {
    const root = opts.root;
    console.log("[milkdown] effect root=", root ? "YES" : "NULL");
    if (!root) return;
    let cancelled = false;

    const crepe = new Crepe({
      root,
      defaultValue: opts.content,
      features: {
        [Crepe.Feature.TopBar]: false,
        [Crepe.Feature.AI]: false,
      },
    });

    // Register the search highlight plugin before creating the editor.
    crepe.editor.use([searchPlugin]);

    crepe.create().then(() => {
      if (cancelled) { crepe.destroy(); return; }
      console.log("[milkdown] editor created");
      crepe.on((listener) => {
        listener.markdownUpdated((_ctx, markdown) => {
          onChangeRef.current(markdown);
        });
      });
      crepeRef.current = crepe;
      const view = getView();
      console.log("[milkdown] view from ctx:", view ? "YES" : "NULL");
      if (view && opts.viewRef) opts.viewRef.current = view;
      if (view && opts.onViewReady) opts.onViewReady(view);
    }).catch((err) => {
      if (!cancelled) console.error("[milkdown] init failed:", err);
    });

    return () => {
      cancelled = true;
      crepe.destroy();
      crepeRef.current = null;
      if (opts.viewRef) opts.viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.root]);

  // Sync external content changes.
  useEffect(() => {
    setContent(opts.content);
  }, [opts.content, setContent]);

  return handleRef;
}
