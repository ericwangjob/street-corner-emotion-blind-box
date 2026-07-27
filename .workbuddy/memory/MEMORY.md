# 街角情绪盲盒 — 项目长期记忆

## 部署（GitHub + GitHub Pages）
- 用户的**主账号**是 `ericwangjob`（日常使用），本项目仓库于 2026-07-24 从 `Invionary` transfer 过来。
  - 仓库地址：https://github.com/ericwangjob/street-corner-emotion-blind-box
  - 在线演示：https://ericwangjob.github.io/street-corner-emotion-blind-box/
  - GitHub Pages 状态：`built`，source = `gh-pages`，随 transfer 自动继承，**无需重新配置**。
  - transfer 由 `Invionary` 发起 → 接收方 `ericwangjob` 手动 accept 完成；`main`（`9e8f63f`）+ `gh-pages`（`36c5b98`）双分支已同步迁入。
  - 本地 `git remote set-url origin` 已切到 ericwangjob URL；`git ls-remote` 偶发 HTTP2 框架错误（GitHub 侧短暂问题，data 通过 API 已确认存在，重试即过）。
  - **待办**：把 `ericwangjob` 的 PAT 写进 keychain（替换或并存 Invionary 的），后续 push 才能从 ericwangjob 走。
  - 图片已处理并修正格式：2 张图先压缩（2.5MB/3.7MB → 205KB/155KB），后发现是 JPEG 内容误命名 .png；改为改名 `card-img.jpg` / `uploading image.jpg`（保留压缩、格式正确），更新 5 处 HTML/JS 引用 + 文档，main `df768ef`、gh-pages `02cfb78` 均已推送，线上核验 `content-type: image/jpeg`、旧 .png 404。
- 分支策略：
  - `main` = 完整项目（front-end/ 原型 + docs/ + DESIGN.* + PRD 完整版）
  - `gh-pages` = 仅 front-end/ 内容（已剔除 mastergo/、editor.html 与设计/PRD 文档），作为 Pages 源
- 推送凭据取自 macOS keychain（用户 Invionary，free 计划），不写死 token；推送用 `git -c url."https://user:pass@github.com/".insteadOf=...` 内联凭据，推送后 `git remote set-url` 剥离 token。
- gh-pages 自带 `.gitignore`（仅排除 dev/tooling 垃圾：.DS_Store、.cache/、.cloudstudio、.workbuddy/、ardot/、frontend/、front-end/、Remove_the_white_circular_play*.png），避免同步时把开发产物误提交进 Pages。
- 仓库名为 ASCII slug `street-corner-emotion-blind-box`（GitHub 仓库名不建议中文，URL 更整洁）；中文项目名在 README 与站点内呈现。

## 前端原型（front-end/）
- 纯静态 H5：原生 HTML/CSS/JS，无构建步骤。
- 本地预览：`cd front-end && python3 -m http.server 8080`
- 页面：index / pickup / release / footprint / me / settings；统一双语标题（英文上 / 中文下）。
- 设计系统 design-system.css；动态主题 themes.js；卡片切换动画 card-exit（缩放+淡出+旋转）+ card-rise（弹性入场）。

## 深色模式（Dark Mode）
- 三态切换（浅色 / 深色 / 跟随系统）：设置页 → 外观与体验 → 主题外观。
- 无闪烁 bootstrap（`<head>` 内联脚本读 localStorage `xj_theme_mode`）+ `js/theme-toggle.js` 统一管理（勿在 app.js 内重复处理主题）。
- `html.dark` 覆盖 `design-system.css` 中的 token，需用 `!important` 压过 themes.js 内联的时段主题变量（inline style 优先级高）。
- 画布图表 / 导出按 `document.documentElement.classList.contains('dark')` 分支配色，并监听 `xj:themechange` 重绘以保证切换无缝。
- 过渡由 `html.theme-anim` 门控（首次 rAF 后启用），遵循 `prefers-reduced-motion`。
