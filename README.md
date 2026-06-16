# FView Power

> English | [中文](./README.zh.md)

A minimal cross-platform desktop file previewer & editor for macOS, Windows, and Linux.

- **Editable**: Markdown, TXT, HTML, source code (20+ languages)
- **Read-only preview**: PDF, images
- **Folder browsing**: tree sidebar with file type icons
- **Settings**: light/dark theme, font family/size/line-height, English/中文

## Supported File Types

| Type | Edit | Preview |
|---|---|---|
| Markdown | Yes | CodeMirror editor + rendered preview (GFM, tables, task lists, code highlighting) |
| Code (JS/TS/Python/Rust/Go/Java/C/C++/JSON/CSS/YAML/Shell/SQL/etc.) | Yes | CodeMirror with language-specific syntax highlighting |
| HTML | Yes | CodeMirror editor + sandbox iframe live preview |
| TXT / Log | Yes | Configurable typography |
| PDF | No | pdfjs-dist canvas rendering with zoom, pagination, outline drawer |
| Images (PNG/JPG/GIF/WebP/SVG/AVIF/BMP/TIFF/ICO) | No | Zoom, reset, fit |

### View Modes (Markdown & HTML)
- **Split** — editor + preview side-by-side (resizable panels)
- **Editor-only** — full-width CodeMirror
- **Preview-only** — full-width rendered output
- Cycle with `⌘P`

## Keyboard Shortcuts

### Global
| Key | Action |
|---|---|
| `⌘O` | Open file |
| `⇧⌘O` | Open folder |
| `⌘S` | Save |
| `⇧⌘S` | Save As |
| `⌘W` | Close current file |
| `⌘.` | Toggle light/dark theme |
| `Esc` | Close popup / menu |

### Markdown
| Key | Action |
|---|---|
| `⌘P` | Cycle split/editor/preview mode |

### PDF
| Key | Action |
|---|---|
| `⌘G` | Focus "Go to page" input |
| `←` / `→` | Previous / next page |
| `PageUp` / `PageDown` | Previous / next page |
| `↑` / `↓` | Scroll focused area (canvas or outline) |
| `Shift+↑` / `↓` | Scroll by one screen |
| `Home` / `End` | First / last page |

> On Windows/Linux, replace `⌘` with `Ctrl`.

## Features

- **Drag & drop** — drop a file or folder anywhere on the window to open it
- **CLI support** — `fview path/to/file.md` opens the file directly
- **Markdown**: split/editor/preview views, scroll sync, floating TOC sidebar with auto-highlight
- **PDF**: page navigation, zoom (0.5x–4x), floating outline drawer with auto-highlight
- **Folder browsing**: left sidebar (260px), auto-expand ancestors, skip `node_modules`/`.git`/`target`/`dist` etc.
- **Dirty tracking**: unsaved indicator for Markdown edits
- **Settings** persisted to `localStorage`: language (en/zh), theme, font family, font size (8–72px), line height
- **External links** in Markdown open in the system browser

## Tech Stack

- **Tauri v2** (Rust) — desktop shell
- **React 18 + TypeScript** — UI
- **Tailwind CSS** + `@tailwindcss/typography` — styling
- **Vite** — build tool
- **CodeMirror 6** + `@uiw/react-codemirror` — code editor
- **react-markdown** + `remark-gfm` + `rehype-highlight` — Markdown rendering
- **pdfjs-dist** — PDF rendering
- **tiny_http** (Rust) — HTML preview sandbox server

## Development

Requirements: Node.js 18+ and Rust stable (1.77+).

```bash
npm install
npm run tauri:dev
```

## Build

```bash
npm run tauri:build
```

## Cleaning Build Cache

Rust / Tauri build output can grow to several GB. Clean it when:

- Build errors mention stale or corrupted artifacts
- Disk space is running low
- Switching Rust toolchain or Tauri version

```bash
# Project-level artifacts (safe to delete — will rebuild)
rm -rf src-tauri/target dist node_modules/.tauri

# Cargo global dependency cache (slower to rebuild — usually keep)
cargo clean

# npm cache
npm cache clean --force
```

Typical savings: `src-tauri/target` is **~2.5 GB** after a debug build.
