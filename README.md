# FView Power

一个极简的文件预览 & 编辑器，跨 macOS / Windows / Linux。

- **可编辑**：Markdown、TXT、HTML、源代码
- **只读预览**：PDF、图片
- **文件夹浏览**：左侧目录树 + 浮动 TOC / 目录
- **设置**：明暗主题、字体、字号、行高，中英文切换

## 功能

### 文件类型
- **Markdown** — CodeMirror 编辑器 + 实时预览（分屏 / 仅编辑 / 仅预览 三种模式，⌘P 切换）。支持 GitHub Flavored Markdown、表格、任务列表、代码块语法高亮。**编辑器与预览同步滚动**。
- **TXT / 代码** — CodeMirror 编辑器，自动识别语言（JS/TS、Python、Rust、JSON、CSS、HTML、YAML、SQL 等 20+ 种）并高亮，支持编辑。
- **HTML** — CodeMirror 编辑器 + 实时 iframe 预览（沙箱模式 + 本地 HTTP 服务器），支持编辑。
- **PDF** — 基于 `pdfjs-dist` canvas 渲染，支持翻页、缩放、"跳转到指定页"输入框、键盘导航、**PDF 书签/目录浮动面板**。
- **图片** — PNG / JPG / GIF / WebP / SVG / AVIF / BMP / TIFF / ICO，支持缩放、重置、适应。

### 交互
- **打开文件** — 工具栏 `Open` 菜单的第一项 / ⌘O
- **打开文件夹** — 同菜单第二项 / ⇧⌘O / 拖入窗口；左侧出现目录树，**当前文件高亮、祖先目录自动展开**。
- **拖拽** — 把文件或文件夹拖到窗口任意位置即可打开。
- **保存** — ⌘S 保存到原路径，⇧⌘S 另存为。Markdown 编辑自动标记 dirty。
- **命令行参数** — `fview path/to/file.md` 启动时直接打开文件。
- **明暗主题** — ⌘. 切换，默认跟随系统，状态持久化。
- **语言切换** — 设置里支持 English / 中文 切换，**整个应用 + 使用说明文档** 都跟随。
- **使用说明** — 工具栏 ❓ 按钮打开内置 User Guide（双语）。

### Markdown 增强
- **分屏 / 编辑 / 预览** 三种视图，⌘P 循环切换
- **编辑与预览同步滚动**（块级对齐）
- **浮动目录** — 鼠标移到预览区右边缘，自动浮出当前文档的标题列表，点击跳转

### PDF 增强
- **页码工具栏** — `‹ Prev` / `Next ›` + 当前页 / 总数 + 缩放
- **跳转到指定页** — `Go to` 输入框，⌘G 聚焦，Enter 提交
- **键盘导航** — `←` / `→` 翻页、`↑` / `↓` 滚动当前焦点区域（Shift+ 单屏）、`PageUp` / `PageDown` 翻页、`Home` / `End` 跳首页/末页
- **浮动目录** — 鼠标移到预览区右边缘，浮出 PDF 书签/目录，**当前章节自动高亮**

### 文件夹浏览
- 左侧目录树（260px 宽，可关闭）
- 跳过隐藏文件 / `node_modules` / `.git` / `target` / `dist` / `__pycache__` 等 16 类常见构建/依赖目录
- 不跟符号链接
- 工具栏 ↻ 刷新 / × 关闭

### 设置（⚙ 按钮）
- **Language** — English / 中文
- **Theme** — Light / Dark
- **Font** — System / Sans / Serif / Monospace
- **Size** — 8 – 72 px，输入框边输边预览
- **Line height** — Compact (1.35) / Default (1.5) / Comfortable (1.6) / Relaxed (1.8) / Loose (2.0)
- 实时预览区显示当前 font + size + line-height 效果
- **作用域**：以上设置仅作用于 Markdown / Text 预览。Code、PDF、Image、HTML 预览用各自默认样式。
- 状态持久化到 `localStorage["fview:settings"]`

## 快捷键

### 全局
| 快捷键 | 动作 |
|---|---|
| `⌘O` | 打开文件 |
| `⇧⌘O` | 打开文件夹 |
| `⌘S` | 保存 |
| `⇧⌘S` | 另存为 |
| `⌘W` | 关闭当前文件 |
| `⌘.` | 切换明暗主题 |
| `Esc` | 关闭任何弹窗 / 菜单 |

### Markdown
| 快捷键 | 动作 |
|---|---|
| `⌘P` | 切换分屏 / 预览 / 编辑模式 |

### PDF
| 快捷键 | 动作 |
|---|---|
| `⌘G` | 聚焦"跳转到指定页"输入框 |
| `←` / `→` | 上一页 / 下一页 |
| `PageUp` / `PageDown` | 上一页 / 下一页 |
| `↑` / `↓` | 滚动当前焦点区域（画布或目录） |
| `Shift` + `↑` / `↓` | 按一屏滚动 |
| `Home` / `End` | 第一页 / 最后一页 |

> 在 Windows / Linux 上把 `⌘` 换成 `Ctrl`，其他键位相同。

## 技术栈

- **Tauri v2**（Rust）— 轻量、跨平台桌面外壳
- **React 18 + TypeScript** — UI
- **Tailwind CSS** + **@tailwindcss/typography**（`prose` 类）— 排版与原子化样式
- **Vite** — 开发与构建
- **CodeMirror 6** + **@uiw/react-codemirror** — 编辑器
- **react-markdown** + **remark-gfm** + **rehype-highlight** + **rehype-raw** — Markdown 渲染
- **pdfjs-dist** — PDF 渲染
- **highlight.js** — Markdown 中代码块的语法高亮
- **tiny_http**（Rust 端）— HTML 预览用的本地 sandbox HTTP 服务器

## 目录结构

```
FView/
├── src/                          # React + TS 前端
│   ├── components/
│   │   ├── App.tsx               # 主布局 + 工具栏 + 全局 Provider
│   │   ├── DropZone.tsx          # 全屏拖拽层
│   │   ├── FolderTree.tsx        # 左侧目录树
│   │   ├── MarkdownPreview.tsx   # MD 预览 + 浮动 TOC + 滚动同步
│   │   ├── CodePreview.tsx       # 代码编辑器
│   │   ├── HtmlPreview.tsx       # HTML 编辑 + iframe 实时预览
│   │   ├── PdfPreview.tsx        # PDF 预览 + 浮动目录
│   │   ├── ImagePreview.tsx
│   │   ├── TextPreview.tsx
│   │   ├── TocSidebar.tsx        # MD 浮动 TOC 抽屉
│   │   ├── PdfOutlineDrawer.tsx  # PDF 浮动目录抽屉
│   │   ├── SettingsModal.tsx     # 设置弹窗（含语言 / 主题 / 字体 / 字号 / 行高）
│   │   └── HelpModal.tsx         # 使用说明文档弹窗
│   ├── hooks/
│   │   ├── useFileLoader.ts      # 文件加载 / 保存 / 拖拽
│   │   ├── useFolder.ts          # 文件夹状态 + 扫描 + 关闭
│   │   ├── useSettings.tsx       # font / size / lineHeight + 持久化
│   │   ├── useTheme.tsx          # 主题 + 持久化
│   │   ├── useI18n.tsx           # 语言 + 持久化
│   │   └── useScrollSync.ts      # MD 编辑↔预览同步滚动
│   ├── i18n/
│   │   └── translations.ts       # 完整英中双语字典
│   ├── utils/
│   │   ├── fileDetector.ts       # 后缀名 → 文件类型
│   │   ├── scanFolder.ts         # 递归扫目录 + 跳过规则
│   │   ├── extractHeadings.ts    # 提取 MD 标题树（用于 TOC）
│   │   └── rehypeSourceLine.ts   # 自定义 rehype 插件：给块元素加 data-source-line
│   ├── styles/index.css          # Tailwind + 全部自定义 CSS
│   └── main.tsx                  # Providers: I18n → Theme → Settings → App
├── src-tauri/                    # Rust 后端
│   ├── src/
│   │   ├── lib.rs                # Tauri 构造 + tiny_http HTML 服务器 + CLI 参数
│   │   └── main.rs               # 二进制入口
│   ├── capabilities/default.json # fs 权限（$HOME/**, **）
│   ├── tauri.conf.json
│   ├── icons/                    # Tauri 全部尺寸图标
│   ├── vendor/brotli/            # 本地 patch 的 brotli 8.0.3
│   └── Cargo.toml
├── scripts/
│   ├── gen-icon.mjs              # 源 PNG 生成器
│   └── with-path.mjs             # 自动探测 cargo / rustc 路径
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

## 开发

环境要求：
- Node.js 18+ 与 npm
- Rust stable（1.77+）— 通过 [rustup](https://rustup.rs) 安装即可，无需手动把 `~/.cargo/bin` 加进 PATH。

> 如果遇到 `failed to run 'cargo metadata'` 错误，说明 shell 找不到 `cargo`。
> 原因是 rustup 安装时没有把 `~/.cargo/bin` 加入当前 shell 的 PATH。
> 本项目用 `scripts/with-path.mjs` 自动探测常见安装位置（`~/.cargo/bin`、`/opt/homebrew/bin`、`/usr/local/bin` 等），无需手动 export PATH。

```bash
npm install
npm run tauri:dev      # 启动开发模式（Vite + Tauri）
```

## 打包

```bash
npm run tauri:build    # 产出生产可分发包（.dmg / .msi / .AppImage / .deb）
```

## 国际化（i18n）

设置里切换 `Language`，整个应用 + 内置使用说明文档都会跟随：

- **English**（默认）/ **中文**
- 首次启动自动检测浏览器语言（`zh-*` → 中文，否则英文）
- 选择持久化到 `localStorage["fview:lang"]`
- 翻译文件：`src/i18n/translations.ts`（扁平命名空间，9 大节：`app` / `settings` / `pdf` / `md` / `code` / `html` / `image` / `text` / `folder` / `help`）
- 翻译查找走 `t("app.open")` 这种点号路径
- key 缺失会优雅降级到英文，再缺失就回显 key 本身（不会白屏）

## 主题

- CSS 变量方案：`--md-bg` / `--md-fg` / `--md-muted` / `--md-border` / `--md-link` / `--md-code-bg` / `--md-accent` 等
- 明 / 暗模式通过 `<html class="dark">` 切换，所有自定义 CSS 都引用这些变量
- 默认跟随系统 `prefers-color-scheme`，状态持久化到 `localStorage["fview:theme"]`

## CodeMirror 主题接入

编辑器（Code / HTML / MD）通过 CSS 变量注入样式，**不依赖 Tailwind class 顺序或主题 CSS 注入位置**：

```tsx
<CodeMirror style={{
  "--cm-font-family": stack,
  "--cm-font-size": `${settings.fontSize}px`,
  "--cm-line-height": String(settings.lineHeight),
} as CSSProperties} />
```

`index.css` 里：
```css
.cm-editor {
  font-family: var(--cm-font-family, "JetBrains Mono", ...);
  font-size: var(--cm-font-size, 13.5px);
  line-height: var(--cm-line-height, 1.55);
}
```

CSS 变量从 wrapper 继承到 `.cm-editor`，靠 CSS 自带继承机制保证优先级，**避免 CodeMirror theme 注入时机带来的覆盖问题**。

## 图标

`scripts/gen-icon.mjs` 会生成一个简单的"MD"字样源 PNG，再用 `npx tauri icon src-tauri/icons/source.png` 一次性产出全部尺寸的图标。

## 权限

`src-tauri/capabilities/default.json` 当前对 fs 权限开得比较宽（`$HOME/**` 与 `**`），方便用户预览任意路径的文件。如要收紧用于正式发布，请按需调整 `fs:scope`。

## 关于 brotli 8.0.3 的 patch

`src-tauri/vendor/brotli/` 是一份打过补丁的 `brotli 8.0.3`（通过 `[patch.crates-io]` 替换 crates.io 版本）。补丁改了 `Cargo.toml` 中的两处：

| 字段 | 上游值 | patch 值 |
|---|---|---|
| `alloc-no-stdlib` | `"2.0"` | `"3.0"` |
| `alloc-stdlib` | `"~0.2"` | `"0.3"` |

**为什么需要这个 patch？**

`brotli 8.0.3` 上游的 `Cargo.toml` 把 `alloc-no-stdlib` 锁在 2.x（`"2.0"` ⇒ `>=2.0, <3.0`）、`alloc-stdlib` 锁在 `~0.2`（即 `0.2.x`）。但同一依赖树里 `brotli-decompressor 5.0.x` / `alloc-stdlib 0.3.0` 都接受 3.x 系列的 `alloc-no-stdlib`。Cargo 解析器会装两份 `alloc-no-stdlib`（一份 2.0.4 给 brotli 自己、一份 3.0.0 给其他消费者），两套 `Allocator` trait 在图中并存，导致稳定版 Rust 上的 `E0277: StandardAlloc: alloc::Allocator<ZopfliNode> is not satisfied`。

把 `brotli` 的依赖统一到 3.0.0 / 0.3.0，trait 一致，问题解决。详见 `src-tauri/Cargo.toml` 的 `[patch.crates-io]` 段。

> 待上游 `brotli` 发布 8.0.4 / 9.x 在自身依赖中解决此问题后，删掉 `[patch.crates-io]` 块和 `src-tauri/vendor/brotli/` 即可恢复原状。
