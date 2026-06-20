import { useEffect, useRef } from "react";

interface Props {
  term: string;
  onTermChange: (v: string) => void;
  total: number;
  activeIdx: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export function SearchBar({ term, onTermChange, total, activeIdx, onNext, onPrev, onClose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div
      style={{
        position: "fixed",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        background: "var(--md-bg)",
        border: "1px solid var(--md-border)",
        borderRadius: 10,
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
        minWidth: 320,
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={term}
        placeholder="Find…"
        onChange={(e) => onTermChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); e.shiftKey ? onPrev() : onNext(); }
          if (e.key === "Escape") { e.preventDefault(); onClose(); }
        }}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          background: "transparent",
          color: "var(--md-fg)",
          fontSize: 14,
          fontFamily: "inherit",
          padding: "2px 4px",
        }}
      />
      <span style={{ color: "var(--md-muted)", fontSize: 12, minWidth: 40, textAlign: "center", userSelect: "none" }}>
        {total > 0 ? `${activeIdx + 1}/${total}` : term ? "0" : ""}
      </span>
      <button type="button" title="Previous (⇧Enter)" onClick={onPrev}
        style={btnStyle}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m18 15-6-6-6 6"/></svg>
      </button>
      <button type="button" title="Next (Enter)" onClick={onNext}
        style={btnStyle}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      <button type="button" title="Close (Esc)" onClick={onClose}
        style={{ ...btnStyle, fontSize: 16 }}>
        ×
      </button>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  width: 26, height: 26, padding: 0, border: "none", borderRadius: 4,
  background: "transparent", color: "var(--md-muted)", cursor: "pointer", fontSize: 14,
};
