import { useEffect, useRef, useState } from "react";
import type { Heading } from "@/utils/extractHeadings";
import { useI18n } from "@/hooks/useI18n";

interface Props {
  headings: Heading[];
}

const HIDE_DELAY = 220;

export function TocSidebar({ headings }: Props) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  useEffect(() => () => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
    }
  }, []);

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

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  if (headings.length === 0) return null;

  return (
    <>
      <div
        className="toc-handle"
        onMouseEnter={show}
        onMouseLeave={scheduleHide}
        aria-label="Show table of contents"
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
          <circle cx="4" cy="6" r="1" />
          <circle cx="4" cy="12" r="1" />
          <circle cx="4" cy="18" r="1" />
        </svg>
      </div>
      <aside
        className={`toc-drawer${open ? " open" : ""}`}
        onMouseEnter={show}
        onMouseLeave={scheduleHide}
        aria-hidden={!open}
      >
        <div className="toc-drawer-inner">
          <div className="toc-title">{t("md.toc")}</div>
          <ul className="toc-list">
            {headings.map((h) => (
              <li key={h.id}>
                <a
                  href={`#${h.id}`}
                  className={`toc-link toc-h${h.depth}${activeId === h.id ? " active" : ""}`}
                  onClick={(e) => handleClick(e, h.id)}
                  title={h.text}
                >
                  {h.text || "(untitled)"}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}
