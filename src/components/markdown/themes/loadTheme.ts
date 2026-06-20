/**
 * GitHub theme is the only built-in theme.  Call `applyGithubTheme(isDark)`
 * once on mount and again whenever dark mode toggles.
 */
import { githubLight, githubDark } from "./theme-map";
import type { ThemePalette } from "./theme-map";

const LINK_ID = "md-theme-link";
const GITHUB_CSS = "/themes/github.min.css";

const VAR_MAP: [string, keyof ThemePalette][] = [
  ["--md-bg", "bg"],
  ["--md-fg", "fg"],
  ["--md-muted", "muted"],
  ["--md-border", "border"],
  ["--md-link", "link"],
  ["--md-code-bg", "codeBg"],
  ["--md-blockquote-border", "blockquoteBorder"],
  ["--md-accent", "accent"],
];

function applyPalette(p: ThemePalette): void {
  const root = document.documentElement;
  for (const [prop, key] of VAR_MAP) {
    root.style.setProperty(prop, p[key]);
  }
}

function injectStylesheet(): void {
  if (document.getElementById(LINK_ID)) return;
  const link = document.createElement("link");
  link.id = LINK_ID;
  link.rel = "stylesheet";
  link.href = GITHUB_CSS;
  document.head.appendChild(link);
}

export function applyGithubTheme(isDark: boolean): void {
  applyPalette(isDark ? githubDark : githubLight);
  injectStylesheet();
}
