import { useCallback, useEffect, useState } from "react";

export type RecentKind = "file" | "folder";

export interface RecentItem {
  path: string;
  kind: RecentKind;
  name: string;
  openedAt: number;
}

const STORAGE_KEY = "fview:recents";
const MAX_ITEMS = 5;

function isValidKind(v: unknown): v is RecentKind {
  return v === "file" || v === "folder";
}

function loadRecents(): RecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is RecentItem =>
          !!x &&
          typeof x.path === "string" &&
          isValidKind(x.kind) &&
          typeof x.name === "string" &&
          typeof x.openedAt === "number",
      )
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

function saveRecents(items: RecentItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Quota exceeded or storage disabled (e.g. private mode) — silently degrade.
  }
}

export function useRecents() {
  const [recents, setRecents] = useState<RecentItem[]>(loadRecents);

  useEffect(() => {
    saveRecents(recents);
  }, [recents]);

  const recordOpen = useCallback(
    (path: string, kind: RecentKind, name: string) => {
      setRecents((prev) => {
        const next: RecentItem = { path, kind, name, openedAt: Date.now() };
        // Dedupe by path; existing entry is moved to the top.
        const filtered = prev.filter((it) => it.path !== path);
        return [next, ...filtered].slice(0, MAX_ITEMS);
      });
    },
    [],
  );

  const removeRecent = useCallback((path: string) => {
    setRecents((prev) => prev.filter((it) => it.path !== path));
  }, []);

  const clearRecents = useCallback(() => {
    setRecents([]);
  }, []);

  return { recents, recordOpen, removeRecent, clearRecents };
}
