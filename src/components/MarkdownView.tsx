import { useMemo } from "react";
import MarkdownIt from "markdown-it";
import type { Token, Renderer, Options } from "markdown-it/index.js";
// @ts-expect-error - no type definitions for markdown-it-task-lists
import taskLists from "markdown-it-task-lists";
import anchor from "markdown-it-anchor";
import hljs from "highlight.js";
import { open as openExternal } from "@tauri-apps/plugin-shell";
import { convertFileSrc } from "@tauri-apps/api/core";

interface Props {
  content: string;
  fileDir?: string;
}

interface MarkdownEnv {
  fileDir?: string;
}

const SOURCE_LINE_TAGS = new Set([
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "ul", "ol", "pre", "blockquote",
  "table", "hr", "li", "details",
]);

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
  highlight(str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      } catch {}
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  },
})
  .use(taskLists, { enabled: true, label: true, labelAfter: true })
  .use(anchor, { permalink: false, slugify: (s: string) => s.toLowerCase().replace(/\s+/g, "-") });

const defaultRender = md.renderer.render.bind(md.renderer);
md.renderer.render = (tokens: Token[], options: Options, env: MarkdownEnv) => {
  for (const t of tokens) {
    if (t.type.endsWith("_open") && t.tag && SOURCE_LINE_TAGS.has(t.tag) && t.map) {
      t.attrSet("data-source-line", String(t.map[0]));
    }
  }
  return defaultRender(tokens, options, env);
};

// Override image renderer to resolve local paths via convertFileSrc
const origImage = md.renderer.rules.image!;
md.renderer.rules.image = function (tokens: Token[], idx: number, options: Options, env: MarkdownEnv, self: Renderer): string {
  const token = tokens[idx];
  let src = token.attrGet("src") || "";

  if (
    !src.startsWith("http://") &&
    !src.startsWith("https://") &&
    !src.startsWith("data:") &&
    !src.startsWith("asset:") &&
    !src.startsWith("blob:") &&
    !src.startsWith("/") &&
    !src.startsWith("file:") &&
    env.fileDir
  ) {
    // URL-decode in case the markdown source already uses percent-encoding
    // (e.g. Chinese characters in file paths). Otherwise convertFileSrc
    // encodes again, producing double-encoded garbage.
    let decoded = src;
    try { decoded = decodeURIComponent(src); } catch {}
    const sep = env.fileDir.includes("\\") ? "\\" : "/";
    const base = env.fileDir.replace(/[\\/]+$/, "");
    const rel = decoded.startsWith("./") ? decoded.slice(2) : decoded;

    // Percent-encode each path segment so convertFileSrc only has to
    // handle slashes. Raw Unicode paths may fail convertFileSrc on macOS.
    const abs = `${base.split(/[\\/]/).map(encodeURIComponent).join(sep)}${sep}${rel.split(/[\\/]/).map(encodeURIComponent).join(sep)}`;
    token.attrSet("src", convertFileSrc(abs));
  }

  return origImage(tokens, idx, options, env, self);
};

function stripFrontmatter(s: string): string {
  return s.replace(/^---\n[\s\S]*?\n---\n?/, "");
}

export function MarkdownView({ content, fileDir }: Props) {
  const html = useMemo(() => {
    const stripped = stripFrontmatter(content);
    return md.render(stripped, { fileDir });
  }, [content, fileDir]);

  return (
    <div
      className="prose"
      onClick={(e) => {
        const a = (e.target as HTMLElement).closest("a");
        if (!(a instanceof HTMLAnchorElement)) return;
        const href = a.getAttribute("href") || "";
        if (href.startsWith("http://") || href.startsWith("https://")) {
          e.preventDefault();
          openExternal(href);
        }
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
