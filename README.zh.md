# FView Power

> [English](./README.md) | 中文

一个极简的跨平台桌面文件预览器与编辑器，支持 macOS、Windows 和 Linux。

- **可编辑**：Markdown、TXT、HTML、源代码（20+ 种语言）
- **只读预览**：PDF、图片
- **文件夹浏览**：树形侧边栏，文件类型彩色图标
- **设置**：明暗主题、字体/字号/行高、English/中文

## 支持的文件类型

| 类型 | 可编辑 | 预览方式 |
|---|---|---|
| Markdown | 是 | CodeMirror 编辑器 + 渲染预览（GFM、表格、任务列表、代码高亮） |
| 代码（JS/TS/Python/Rust/Go/Java/C/C++/JSON/CSS/YAML/Shell/SQL 等） | 是 | CodeMirror 编辑器，自动识别语言并高亮 |
| HTML | 是 | CodeMirror 编辑器 + iframe 沙箱实时预览 |
| TXT / Log | 是 | 可调节排版样式 |
| PDF | 否 | pdfjs-dist canvas 渲染，支持缩放、翻页、目录浮动面板 |
| 图片（PNG/JPG/GIF/WebP/SVG/AVIF/BMP/TIFF/ICO） | 否 | 缩放、重置、适应 |

### 视图模式（Markdown & HTML）
- **分屏** — 编辑器 + 预览并排（可拖拽调整宽度）
- **仅编辑** — 全宽 CodeMirror
- **仅预览** — 全宽渲染输出
- `⌘P` 循环切换

## 快捷键

### 全局
| 按键 | 操作 |
|---|---|
| `⌘O` | 打开文件 |
| `⇧⌘O` | 打开文件夹 |
| `⌘S` | 保存 |
| `⇧⌘S` | 另存为 |
| `⌘W` | 关闭当前文件 |
| `⌘.` | 切换明暗主题 |
| `Esc` | 关闭弹窗 / 菜单 |

### Markdown
| 按键 | 操作 |
|---|---|
| `⌘P` | 切换分屏 / 编辑 / 预览模式 |

### PDF
| 按键 | 操作 |
|---|---|
| `⌘G` | 聚焦"跳转到指定页"输入框 |
| `←` / `→` | 上一页 / 下一页 |
| `PageUp` / `PageDown` | 上一页 / 下一页 |
| `↑` / `↓` | 滚动当前焦点区域（画布或目录） |
| `Shift+↑` / `↓` | 按一屏滚动 |
| `Home` / `End` | 首页 / 末页 |

> 在 Windows / Linux 上，将 `⌘` 替换为 `Ctrl`。

## 功能特性

- **拖拽打开** — 将文件或文件夹拖入窗口任意位置即可打开
- **命令行支持** — `fview path/to/file.md` 启动时直接打开文件
- **Markdown**：分屏/编辑/预览三种视图，滚动同步，浮动目录自动高亮
- **PDF**：翻页导航，缩放（0.5x–4x），浮动目录面板自动高亮
- **文件夹浏览**：左侧侧边栏（260px），自动展开父目录，跳过 `node_modules`/`.git`/`target`/`dist` 等
- **脏标记**：Markdown 编辑未保存时显示指示
- **设置** 持久化到 `localStorage`：语言（en/zh）、主题、字体、字号（8–72px）、行高
- **外部链接** 在 Markdown 预览中点击会在系统浏览器中打开

## 技术栈

- **Tauri v2**（Rust）— 桌面外壳
- **React 18 + TypeScript** — UI
- **Tailwind CSS** + `@tailwindcss/typography` — 样式
- **Vite** — 构建工具
- **CodeMirror 6** + `@uiw/react-codemirror` — 代码编辑器
- **react-markdown** + `remark-gfm` + `rehype-highlight` — Markdown 渲染
- **pdfjs-dist** — PDF 渲染
- **tiny_http**（Rust）— HTML 预览沙箱服务器

## 开发

环境要求：Node.js 18+ 和 Rust stable（1.77+）。

```bash
npm install
npm run tauri:dev
```

## 打包

```bash
npm run tauri:build
```
