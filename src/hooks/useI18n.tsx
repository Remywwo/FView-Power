import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { translations, type Lang } from "@/i18n/translations";

export { type Lang } from "@/i18n/translations";

export type TranslationDict = {
  readonly [section: string]: { readonly [key: string]: string | { readonly [k: string]: string | TranslationDict } };
};

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "fview:lang";
const DEFAULT_LANG: Lang = "en";

function loadInitial(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "zh") return stored;
  } catch {
    // ignore
  }
  const browser = (navigator.language || "").toLowerCase();
  if (browser.startsWith("zh")) return "zh";
  return DEFAULT_LANG;
}

function lookup(dict: TranslationDict, key: string): string | undefined {
  const segments = key.split(".");
  let cur: unknown = dict;
  for (const seg of segments) {
    if (cur && typeof cur === "object" && seg in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[seg];
    } else {
      return undefined;
    }
  }
  return typeof cur === "string" ? cur : undefined;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadInitial);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      const fromLang = lookup(translations[lang] as TranslationDict, key);
      if (fromLang !== undefined) return fromLang;
      const fromEn = lookup(translations.en as TranslationDict, key);
      if (fromEn !== undefined) return fromEn;
      return key;
    },
    [lang],
  );

  const value = useMemo<I18nContextValue>(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
