import { useCallback, useEffect, useState, useMemo } from "react";
import type { EditorView } from "@milkdown/kit/prose/view";
import type { Node as PMNode } from "@milkdown/kit/prose/model";
import { TextSelection } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

const DEBUG = true;
const log = (...args: unknown[]) => DEBUG && console.log("[search]", ...args);

interface Match {
  from: number;
  to: number;
}

function findMatches(view: EditorView, term: string): Match[] {
  const results: Match[] = [];
  if (!term) return results;

  const lower = term.toLowerCase();
  const { doc } = view.state;

  doc.descendants((node, pos) => {
    if (!node.isText) return;
    const text = node.text ?? "";
    let idx = text.toLowerCase().indexOf(lower);
    while (idx !== -1) {
      results.push({ from: pos + idx, to: pos + idx + term.length });
      idx = text.toLowerCase().indexOf(lower, idx + 1);
    }
  });

  log(`findMatches: term="${term}" matches=${results.length}`);
  return results;
}

/** Build decorations for all matches, with active match in a distinct color. */
function buildDecorations(
  matches: Match[],
  activeIdx: number,
  doc: PMNode,
): DecorationSet {
  if (matches.length === 0) return DecorationSet.empty;

  const decos: Decoration[] = [];
  // Only decorate if the matches are still within the document range.
  const docSize = doc.content.size;
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    if (m.from >= docSize || m.to > docSize) continue;
    const isActive = i === activeIdx;
    decos.push(
      Decoration.inline(m.from, m.to, {
        nodeName: "span",
        class: isActive ? "search-match search-match-active" : "search-match",
      }),
    );
  }

  return DecorationSet.create(doc, decos);
}

export function useSearch(viewRef: React.MutableRefObject<EditorView | null>) {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const view = viewRef.current;

  // Inject search highlight CSS once.
  useEffect(() => {
    const id = "search-highlight-css";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      .search-match { background: #ffeb3b; border-radius: 2px; }
      .dark .search-match { background: #b09b00; }
      .search-match-active { background: #ff9800; border-radius: 2px; }
      .dark .search-match-active { background: #e65100; }
    `;
    document.head.appendChild(style);
  }, []);

  log(`render: view=${view ? "YES" : "NULL"} open=${open} term="${term}"`);

  const matches = useMemo<Match[]>(() => {
    if (!open) { log("matches: not open"); return []; }
    if (!view) { log("matches: view is null"); return []; }
    return findMatches(view, term);
  }, [view, term, open]);

  useEffect(() => { setActiveIdx(0); }, [term]);

  // Apply highlight decorations + selection navigation.
  useEffect(() => {
    if (!view) return;
    if (matches.length === 0) {
      // Clear decorations.
      view.dispatch(
        view.state.tr.setMeta("searchDeco", DecorationSet.empty),
      );
      return;
    }

    const m = matches[activeIdx] ?? matches[0];
    const decos = buildDecorations(matches, activeIdx, view.state.doc);

    log(`navigate: idx=${activeIdx} from=${m.from} to=${m.to}`);
    view.dispatch(
      view.state.tr
        .setSelection(TextSelection.create(view.state.doc, m.from, m.to))
        .setMeta("searchDeco", decos),
    );

    // Scroll using ProseMirror's coordinate API (synchronous, no RAF needed).
    const scrollEl = (view.dom.closest("[data-md-preview]") as HTMLElement | null)
      ?? view.dom.parentElement;
    if (!scrollEl) return;

    const coords = view.coordsAtPos(m.from);
    const containerTop = scrollEl.getBoundingClientRect().top;
    const targetY = coords.top - containerTop + scrollEl.scrollTop - 120;
    scrollEl.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
  }, [view, matches, activeIdx]);

  const next = useCallback(() => {
    if (matches.length === 0) return;
    setActiveIdx((n) => (n + 1) % matches.length);
  }, [matches]);

  const prev = useCallback(() => {
    if (matches.length === 0) return;
    setActiveIdx((n) => (n - 1 + matches.length) % matches.length);
  }, [matches]);

  const toggle = useCallback(() => {
    log("toggle");
    setOpen((o) => {
      if (o) setTerm("");
      return !o;
    });
  }, []);

  const close = useCallback(() => {
    log("close");
    setOpen(false);
    setTerm("");
  }, []);

  return { open, term, setTerm, activeIdx, total: matches.length, next, prev, toggle, close };
}
