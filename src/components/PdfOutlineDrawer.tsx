import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { useI18n } from "@/hooks/useI18n";

export interface PdfOutlineNode {
  id: string;
  title: string;
  page: number | null;
  items: PdfOutlineNode[];
}

const HIDE_DELAY = 220;

interface Props {
  outline: PdfOutlineNode[] | null;
  currentPage: number;
  onJump: (page: number) => void;
  loading?: boolean;
  onHoverChange?: (hovered: boolean) => void;
}

export const PdfOutlineDrawer = forwardRef<HTMLDivElement, Props>(function PdfOutlineDrawer(
  { outline, currentPage, onJump, loading, onHoverChange },
  ref,
) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    if (!outline) return new Set();
    return new Set(outline.map((n) => n.id));
  });
  const hideTimerRef = useRef<number | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);

  useEffect(() => () => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (outline) {
      setExpanded(new Set(outline.map((n) => n.id)));
    }
  }, [outline]);

  const show = () => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setOpen(true);
  };

  const scheduleHide = () => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      hideTimerRef.current = null;
    }, HIDE_DELAY);
  };

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeId = findActiveOutlineId(outline, currentPage);

  const renderNodes = (nodes: PdfOutlineNode[], depth: number) => (
    <ul className="outline-list">
      {nodes.map((node) => {
        const isExpanded = expanded.has(node.id);
        const hasChildren = node.items.length > 0;
        const isActive = node.id === activeId;
        const hasPage = node.page !== null;
        return (
          <li key={node.id}>
            <div
              className={`outline-row${isActive ? " active" : ""}${!hasPage ? " disabled" : ""}`}
              style={{ paddingLeft: `${0.5 + depth * 0.7}rem` }}
            >
              {hasChildren ? (
                <button
                  className="outline-toggle"
                  onClick={() => toggle(node.id)}
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
                  >
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </button>
              ) : (
                <span className="outline-toggle-spacer" />
              )}
              {hasPage ? (
                <a
                  href={`#page=${node.page}`}
                  className="outline-link"
                  title={node.title}
                  onClick={(e) => {
                    e.preventDefault();
                    onJump(node.page!);
                  }}
                >
                  <span className="outline-title">{node.title}</span>
                  <span className="outline-page">{node.page}</span>
                </a>
              ) : (
                <span className="outline-link" title={node.title}>
                  <span className="outline-title">{node.title}</span>
                </span>
              )}
            </div>
            {hasChildren && isExpanded && renderNodes(node.items, depth + 1)}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <div
        className="toc-handle"
        onMouseEnter={() => { show(); onHoverChange?.(true); }}
        onMouseLeave={() => { scheduleHide(); onHoverChange?.(false); }}
        aria-label="Show PDF outline"
        role="button"
        tabIndex={-1}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
        </svg>
      </div>
      <aside
        className={`toc-drawer${open ? " open" : ""}`}
        onMouseEnter={() => { show(); onHoverChange?.(true); }}
        onMouseLeave={() => { scheduleHide(); onHoverChange?.(false); }}
        aria-hidden={!open}
      >
        <div className="toc-drawer-inner" ref={innerRef}>
          <div className="toc-title">{t("pdf.outline")}</div>
          {loading && <div className="toc-empty">{t("pdf.loadingOutline")}</div>}
          {!loading && (outline === null || outline.length === 0) && (
            <div className="toc-empty">{t("pdf.noOutline")}</div>
          )}
          {!loading && outline && outline.length > 0 && renderNodes(outline, 0)}
        </div>
      </aside>
    </>
  );
});

function findActiveOutlineId(outline: PdfOutlineNode[] | null, currentPage: number): string | null {
  if (!outline) return null;
  let result: string | null = null;
  const walk = (nodes: PdfOutlineNode[]) => {
    for (const node of nodes) {
      if (node.page !== null && node.page > currentPage) continue;
      if (node.page !== null) result = node.id;
      walk(node.items);
    }
  };
  walk(outline);
  return result;
}

export async function buildOutlineTree(
  rawOutline: Awaited<ReturnType<PDFDocumentProxy["getOutline"]>> | null,
  doc: PDFDocumentProxy,
): Promise<PdfOutlineNode[] | null> {
  if (!rawOutline || rawOutline.length === 0) return null;
  const counter = { i: 0 };
  const walk = async (items: typeof rawOutline): Promise<PdfOutlineNode[]> => {
    const result: PdfOutlineNode[] = [];
    for (const item of items) {
      const id = `n${counter.i++}`;
      const page = await resolvePage(item, doc);
      const children = item.items ? await walk(item.items) : [];
      result.push({ id, title: item.title || "(untitled)", page, items: children });
    }
    return result;
  };
  return walk(rawOutline);
}

async function resolvePage(
  item: { dest?: string | unknown[] | null },
  doc: PDFDocumentProxy,
): Promise<number | null> {
  let dest = item.dest;
  if (typeof dest === "string") {
    try {
      dest = await doc.getDestination(dest);
    } catch {
      return null;
    }
  }
  if (Array.isArray(dest) && dest[0]) {
    try {
      const pageIndex = await doc.getPageIndex(dest[0] as Parameters<typeof doc.getPageIndex>[0]);
      return pageIndex + 1;
    } catch {
      return null;
    }
  }
  return null;
}
