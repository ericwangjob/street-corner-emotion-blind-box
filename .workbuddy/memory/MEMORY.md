# 街角情绪盲盒 — 项目长期记忆

## 部署（GitHub + GitHub Pages）
- GitHub 仓库（公开）：https://github.com/Invionary/street-corner-emotion-blind-box
- GitHub Pages 在线演示：https://invionary.github.io/street-corner-emotion-blind-box/
- 分支策略：
  - `main` = 完整项目（front-end/ 原型 + docs/ + DESIGN.* + PRD 完整版）
  - `gh-pages` = 仅 front-end/ 内容（已剔除 mastergo/、editor.html 与设计/PRD 文档），作为 Pages 源
- 推送凭据取自 macOS keychain（用户 Invionary，free 计划），不写死 token；推送用 `git -c url."https://user:pass@github.com/".insteadOf=...` 内联凭据，推送后 `git remote set-url` 剥离 token。
- `.gitignore` 排除：.workbuddy/、.cache/、.cloudstudio、node_modules/、frontend/（陈旧 Vite 脚手架）、ardot/、根目录临时截图。
- 仓库名为 ASCII slug `street-corner-emotion-blind-box`（GitHub 仓库名不建议中文，URL 更整洁）；中文项目名在 README 与站点内呈现。

## 前端原型（front-end/）
- 纯静态 H5：原生 HTML/CSS/JS，无构建步骤。
- 本地预览：`cd front-end && python3 -m http.server 8080`
- 页面：index / pickup / release / footprint / me / settings；统一双语标题（英文上 / 中文下）。
- 设计系统 design-system.css；动态主题 themes.js；卡片切换动画 card-exit（缩放+淡出+旋转）+ card-rise（弹性入场）。
