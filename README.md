# 街角情绪盲盒 · Street Corner Emotion Blind Box

> 把「15 分钟步行圈」变成有温度的情绪空间 —— 一个微信小程序 H5 原型。

## 项目简介

「街角情绪盲盒」是一款围绕城市散步场景的情绪陪伴产品原型。用户在散步时，可以
**拾取**附近陌生人留下的温柔片段、**种下**自己的温柔盲盒，并在 **温柔足迹** 中
回顾情绪图卷。本仓库为其 **前端 H5 原型**，纯静态、零构建，可直接部署到任意静态
托管（已配置 GitHub Pages）。

## 技术栈

- **纯静态前端**：原生 HTML / CSS / JavaScript（无框架、无打包步骤）
- **设计系统**：统一 Design Tokens（色彩 / 字体 / 间距 / 阴影 / 动效曲线）
- **动效**：CSS `@keyframes` + `prefers-reduced-motion` 无障碍降级
- **主题**：`themes.js` 按时间段动态切换配色，每次刷新色调略有变化

## 页面结构（`front-end/`）

| 页面 | 说明 |
| --- | --- |
| `index.html` | 首页 / 英雄区 |
| `pickup.html` | 拾取附近的「温柔」（含卡片切换动画） |
| `release.html` | 种下一个温柔盲盒 |
| `footprint.html` | 温柔足迹（情绪图卷导出） |
| `me.html` | 我的 |
| `settings.html` | 设置 |

所有页面标题统一为 **双语呈现**（上方英文 / 下方中文）。

## 本地预览

```bash
cd front-end
python3 -m http.server 8080
# 浏览器打开 http://localhost:8080
```

## 在线访问

- **仓库**：https://github.com/Invionary/street-corner-emotion-blind-box
- **在线演示（GitHub Pages）**：https://invionary.github.io/street-corner-emotion-blind-box/

## 目录说明

- `front-end/` —— 可部署的 H5 原型（GitHub Pages 站点根）
- `docs/` —— 产品文档（页面配置、全局配置）
- `DESIGN.md` / `DESIGN.html` —— 设计规范
- `街角情绪盲盒PRD_完整版.md` / `.html` —— 产品需求文档

## 部署说明

GitHub Pages 由 **`gh-pages`** 分支提供，内容即 `front-end/` 目录；
`main` 分支存放完整项目（含设计 / PRD 文档、源码）。

> 注：本仓库不含任何密钥、环境变量或个人隐私信息；本地工作记忆（`.workbuddy/`）、
> 缓存（`.cache/`、`.cloudstudio`）与陈旧脚手架（`frontend/`）均已通过 `.gitignore` 排除。
