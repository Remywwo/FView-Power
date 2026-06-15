# FView Power · 官网

纯静态站点，无构建步骤。直接打开 `index.html` 或丢到任何静态托管（GitHub Pages、Netlify、Vercel、Cloudflare Pages）即可。

## 本地预览

```bash
# 方式 1：直接打开
open index.html

# 方式 2：起一个本地 HTTP server（推荐，避免 file:// 下的某些限制）
python3 -m http.server 8000
# → 访问 http://localhost:8000
```

## 目录结构

```
docs/
├── index.html        # 入口
├── css/style.css     # 样式（黑白红 + 留白 + 动效）
├── js/i18n.js        # 中英双语字典
└── assets/
    └── logo.svg      # FVP monogram
```

## 部署

### GitHub Pages
1. 推送到 `main` 分支
2. Settings → Pages → Source: `main` / Root
3. 访问 `https://<user>.github.io/<repo>/`

### Vercel / Netlify
直接拖拽 `docs/` 目录到控制台，或连接 git 仓库（构建命令留空，输出目录设 `docs`）。

## 设计原则

- **极简**：黑白主色 + 红色作为唯一强调色
- **动效克制**：仅 fade-up 入场 + 按钮微动
- **响应式**：≥720px 三栏，<720px 单栏堆叠
- **可访问**：键盘可达、对比度 ≥4.5:1
- **零依赖**：没有 npm、没有 webpack、一个 CSS 一个 JS
