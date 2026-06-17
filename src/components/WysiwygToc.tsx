import { useEffect, useRef, useState } from "react";

interface Heading {
  depth: number;
  text: string;
  id: string;
}

export function WysiwygToc({ container, markdown }: { container: HTMLElement | null; markdown: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [open, setOpen] = useState(false);
  const hideTimer = useRef<number | null>(null);

  // Scan headings from DOM (works in preview/split); fall back to markdown parsing (write mode)
  useEffect(() => {
    if (!container) return;
    const scan = () => {
      // Try full-container scan (works for both preview and hidden-by-display-none elements)
      const hs = container.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6");
      if (hs.length > 0) {
        setHeadings(
          Array.from(hs).map((el) => ({
            depth: parseInt(el.tagName[1]),
            text: el.textContent || "",
            id: el.id,
          }))
        );
      } else {
        // Fallback: parse from markdown source
        const re = /^(#{1,6})\s+(.+)$/gm;
        const result: Heading[] = [];
        let m: RegExpExecArray | null;
        while ((m = re.exec(markdown)) !== null) {
          const text = m[2].trim();
          result.push({
            depth: m[1].length,
            text,
            id: text.toLowerCase().replace(/\s+/g, "-"),
          });
        }
        setHeadings(result);
      }
    };
    scan();
    const obs = new MutationObserver(scan);
    obs.observe(container, { childList: true, subtree: true });
    return () => obs.disconnect();
  }, [container, markdown]);

  const show = () => {
    if (hideTimer.current !== null) { clearTimeout(hideTimer.current); hideTimer.current = null; }
    setOpen(true);
  };
  const scheduleHide = () => {
    if (hideTimer.current !== null) clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setOpen(false), 300);
  };

  const scrollTo = (id: string) => {
    if (!container) return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (headings.length === 0) return null;

  return (
    <>
      <div
        className={`toc-handle${open ? " open" : ""}`}
        style={{ position: "absolute", top: 0, right: 0, height: "100%", width: 18, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--md-muted)", cursor: "pointer", background: "transparent", borderLeft: "1px solid transparent", opacity: 0, transition: "opacity 0.15s", zIndex: 9 }}
        onMouseEnter={show}
        onMouseLeave={scheduleHide}
        title="Table of Contents"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
          <circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>
        </svg>
      </div>

      <aside
        className={`toc-drawer${open ? " open" : ""}`}
        onMouseEnter={show}
        onMouseLeave={scheduleHide}
        style={{ position: "absolute", top: 0, right: 0, height: "100%", width: 240, background: "var(--md-bg)", borderLeft: "1px solid var(--md-border)", boxShadow: "-4px 0 18px rgba(0,0,0,0.06)", transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)", zIndex: 10, pointerEvents: open ? "auto" : "none" }}
      >
        <div style={{ height: "100%", overflow: "auto", padding: "0.9rem 0.4rem 0.9rem 0.6rem", fontSize: 13, lineHeight: 1.4 }}>
          <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--md-muted)", padding: "0 0.5rem", marginBottom: "0.5rem", fontWeight: 600 }}>TOC</div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {headings.map((h) => (
              <li key={h.id || h.text} style={{ margin: 0 }}>
                <button
                  onClick={() => scrollTo(h.id)}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "0.3rem 0.5rem", paddingLeft: `${0.5 + (h.depth - 1) * 0.85}rem`,
                    color: "var(--md-muted)", textDecoration: "none",
                    border: "none", background: "transparent",
                    borderLeft: "2px solid transparent", borderRadius: "0 4px 4px 0",
                    cursor: "pointer", fontSize: 13, lineHeight: 1.4,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    transition: "color 0.1s, background 0.1s, border-color 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.color = "var(--md-fg)";
                    (e.target as HTMLElement).style.background = "var(--md-code-bg)";
                    (e.target as HTMLElement).style.borderColor = "var(--md-link)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.color = "var(--md-muted)";
                    (e.target as HTMLElement).style.background = "transparent";
                    (e.target as HTMLElement).style.borderColor = "transparent";
                  }}
                >
                  {h.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}