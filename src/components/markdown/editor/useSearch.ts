import { useCallback, useEffect, useMemo, useState } from "react";
import type { LexicalEditor } from "lexical";

interface Match {
  node: Text;
  start: number;
  end: number;
}

interface HighlightLike {
  add: (range: Range) => void;
}

interface HighlightRegistryLike {
  set: (name: string, highlight: HighlightLike) => void;
  delete: (name: string) => void;
}

const HIGHLIGHT_NAME = "fview-markdown-search";
const ACTIVE_HIGHLIGHT_NAME = "fview-markdown-search-active";

function getHighlightCtor(): (new () => HighlightLike) | null {
  return (window as unknown as { Highlight?: new () => HighlightLike }).Highlight ?? null;
}

function getHighlightRegistry(): HighlightRegistryLike | null {
  return (CSS as unknown as { highlights?: HighlightRegistryLike }).highlights ?? null;
}

function getEditorRoot(editor: LexicalEditor | null): HTMLElement | null {
  return editor?.getRootElement() ?? null;
}

function isVisibleTextNode(node: Text): boolean {
  const parent = node.parentElement;
  if (!parent) return false;
  const style = window.getComputedStyle(parent);
  return style.display !== "none" && style.visibility !== "hidden";
}

function findMatches(root: HTMLElement, term: string): Match[] {
  const matches: Match[] = [];
  const normalizedTerm = term.toLowerCase();
  if (!normalizedTerm) return matches;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      return isVisibleTextNode(node as Text)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT;
    },
  });

  let current = walker.nextNode() as Text | null;
  while (current) {
    const text = current.nodeValue ?? "";
    const lower = text.toLowerCase();
    let index = lower.indexOf(normalizedTerm);
    while (index !== -1) {
      matches.push({ node: current, start: index, end: index + term.length });
      index = lower.indexOf(normalizedTerm, index + 1);
    }
    current = walker.nextNode() as Text | null;
  }

  return matches;
}

function createRange(match: Match): Range {
  const range = document.createRange();
  range.setStart(match.node, match.start);
  range.setEnd(match.node, match.end);
  return range;
}

function clearHighlights() {
  const registry = getHighlightRegistry();
  registry?.delete(HIGHLIGHT_NAME);
  registry?.delete(ACTIVE_HIGHLIGHT_NAME);
}

function applyHighlights(matches: Match[], activeIdx: number) {
  const HighlightCtor = getHighlightCtor();
  const registry = getHighlightRegistry();
  if (!HighlightCtor || !registry) return;

  const highlights = new HighlightCtor();
  const activeHighlight = new HighlightCtor();

  matches.forEach((match, index) => {
    const range = createRange(match);
    if (index === activeIdx) {
      activeHighlight.add(range);
    } else {
      highlights.add(range);
    }
  });

  registry.set(HIGHLIGHT_NAME, highlights);
  registry.set(ACTIVE_HIGHLIGHT_NAME, activeHighlight);
}

function selectMatch(match: Match, root: HTMLElement) {
  const range = createRange(match);
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);

  const rect = range.getBoundingClientRect();
  const scrollEl = root.closest("[data-md-preview]") as HTMLElement | null;
  if (!scrollEl) return;
  const containerTop = scrollEl.getBoundingClientRect().top;
  const targetY = rect.top - containerTop + scrollEl.scrollTop - 120;
  scrollEl.scrollTo({ top: Math.max(0, targetY), behavior: "smooth" });
}

export function useSearch(editorRef: React.MutableRefObject<LexicalEditor | null>) {
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const editor = editorRef.current;
  const root = getEditorRoot(editor);

  useEffect(() => {
    const id = "search-highlight-css";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      ::highlight(${HIGHLIGHT_NAME}) { background: #ffeb3b; color: inherit; }
      ::highlight(${ACTIVE_HIGHLIGHT_NAME}) { background: #ff9800; color: inherit; }
      .dark ::highlight(${HIGHLIGHT_NAME}) { background: #b09b00; color: inherit; }
      .dark ::highlight(${ACTIVE_HIGHLIGHT_NAME}) { background: #e65100; color: inherit; }
    `;
    document.head.appendChild(style);
  }, []);

  const matches = useMemo<Match[]>(() => {
    if (!open || !root || !term) return [];
    return findMatches(root, term);
  }, [open, root, term]);

  useEffect(() => { setActiveIdx(0); }, [term]);

  useEffect(() => {
    if (!open || !root || matches.length === 0) {
      clearHighlights();
      return;
    }

    const boundedIdx = Math.min(activeIdx, matches.length - 1);
    applyHighlights(matches, boundedIdx);
    selectMatch(matches[boundedIdx], root);

    return clearHighlights;
  }, [activeIdx, matches, open, root]);

  useEffect(() => clearHighlights, []);

  const next = useCallback(() => {
    if (matches.length === 0) return;
    setActiveIdx((n) => (n + 1) % matches.length);
  }, [matches]);

  const prev = useCallback(() => {
    if (matches.length === 0) return;
    setActiveIdx((n) => (n - 1 + matches.length) % matches.length);
  }, [matches]);

  const toggle = useCallback(() => {
    setOpen((isOpen) => {
      if (isOpen) setTerm("");
      return !isOpen;
    });
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setTerm("");
  }, []);

  return { open, term, setTerm, activeIdx, total: matches.length, next, prev, toggle, close };
}
