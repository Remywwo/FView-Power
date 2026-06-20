#!/usr/bin/env node
/**
 * Rewrite every `.markdown-body` selector inside the 33 markdown
 * theme stylesheets under `public/themes/*.min.css` so that the same
 * rules also apply to `.md-prose` (TipTap's rendered container).
 *
 * Run once after pulling a new theme or after this script's logic
 * changes:
 *
 *     node scripts/rewrite-theme-selectors.mjs
 *
 * The script is idempotent — re-running it has no effect on already
 * rewritten files (the `.md-prose` half of the selector is left in
 * place).
 *
 * Implementation notes
 * --------------------
 * 1. We use a regex because the theme files are pre-minified
 *    one-liners. A proper CSS parser would balloon the dependency
 *    surface for a build-time-only tool.
 * 2. The rewrite is intentionally narrow: we ONLY touch standalone
 *    `.markdown-body` selectors (with optional `>`/`+`/`~`/`,`/
 *    `:pseudo-class`/`::pseudo-element`/`[attr]` etc. after them) so
 *    we never accidentally touch unrelated class names that happen to
 *    contain the substring.
 * 3. We also rewrite `.markdown-body ` followed by a child combinator
 *    (` `, `>`, `+`, `~`) to keep selectors like
 *    `.markdown-body h1` working.
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = join(__dirname, "..");
const themesDir = join(repoRoot, "public", "themes");

// Matches `.markdown-body` (and its variants like
// `.markdown-body.classname`, `.markdown-body[attr]`, `.markdown-body:hover`)
// as a whole selector. Captures the trailing optional extras so we can
// emit `.markdown-body, .md-prose` followed by the same extras.
const SELECTOR_RE = /\.markdown-body((?:[.:][A-Za-z_-][\w-]*|\[[^\]]+\])*)/g;

function rewriteSelectors(css) {
  let count = 0;
  const next = css.replace(SELECTOR_RE, (match, trailing) => {
    count++;
    return `.markdown-body, .md-prose${trailing}`;
  });
  return { css: next, count };
}

function listThemeFiles() {
  let entries;
  try {
    entries = readdirSync(themesDir);
  } catch (err) {
    console.error(`[rewrite-theme-selectors] themes dir not found: ${themesDir}`);
    process.exit(1);
  }
  return entries
    .filter((name) => name.endsWith(".min.css"))
    .map((name) => join(themesDir, name));
}

function main() {
  const files = listThemeFiles();
  if (!files.length) {
    console.error("[rewrite-theme-selectors] no theme files found");
    process.exit(1);
  }

  let totalRewrites = 0;
  let changedFiles = 0;

  for (const file of files) {
    const original = readFileSync(file, "utf8");
    const { css, count } = rewriteSelectors(original);
    totalRewrites += count;
    if (count > 0 && css !== original) {
      writeFileSync(file, css);
      changedFiles++;
      console.log(`[rewrite-theme-selectors] ${file} (${count} selectors)`);
    } else if (count === 0) {
      console.warn(`[rewrite-theme-selectors] ${file}: no .markdown-body selectors`);
    }
  }

  console.log(
    `[rewrite-theme-selectors] done — ${totalRewrites} selectors across ${changedFiles} files`,
  );
}

try {
  const stat = statSync(themesDir);
  if (!stat.isDirectory()) throw new Error("not a directory");
  main();
} catch (err) {
  console.error(`[rewrite-theme-selectors] failed: ${err.message}`);
  process.exit(1);
}
