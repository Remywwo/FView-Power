import { useEffect, useRef } from "react";
import { useI18n } from "@/hooks/useI18n";
import type { SearchResult } from "@/hooks/useSearch";

interface Props {
  visible: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  results: SearchResult[];
  loading: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
}

export function SearchBar({ visible, query, onQueryChange, results, loading, onClose, onSelect }: Props) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-panel" onClick={(e) => e.stopPropagation()}>
        <div className="search-header">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            className="search-input"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={t("search.placeholder")}
            onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
          />
          <button className="search-close" onClick={onClose}>×</button>
        </div>

        <div className="search-body">
          {loading && <div className="search-hint">{t("search.searching")}</div>}
          {!loading && results.length === 0 && query.trim() && (
            <div className="search-hint">{t("search.noResults")}</div>
          )}
          {!loading && !query.trim() && (
            <div className="search-hint">{t("search.startTyping")}</div>
          )}

          <ul className="search-results">
            {results.map((r, i) => (
              <li key={`${r.path}:${r.line}:${i}`} className="search-result" onClick={() => onSelect(r.path)}>
                <div className="search-result-header">
                  <span className="search-result-file">{r.name}</span>
                  <span className="search-result-line">:{r.line}</span>
                </div>
                <div className="search-result-snippet">{r.content}</div>
                <div className="search-result-path">{r.path}</div>
              </li>
            ))}
          </ul>
        </div>

        {results.length > 0 && (
          <div className="search-footer">
            {t("search.results").replace("{n}", String(results.length))}
          </div>
        )}
      </div>
    </div>
  );
}
