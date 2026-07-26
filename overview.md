# 游客身份点受限 Tab → 强制登录页

## 本次新增改动

### `front-end/auth.html`
- 新增 CSS：`body[data-required-login="true"]` 模式下：
  - `#guestBtn`（"以游客身份体验"）隐藏
  - `#wechatBtn` 升级为暖橙渐变主按钮（与 `#guestBtn` 同款样式但保留微信 icon）
  - `.need-login-tip` 显示一条提示卡：「该功能仅向登录用户开放 — 正在请求访问 [目标名]」
  - `.auth-back-link` 显示「← 返回上一页」次按钮
- 新增 DOM：
  - `.need-login-tip` 提示卡 + 内部 `#needLoginTarget` 占位符
  - `.auth-back-link` 返回按钮
  - `#wechatBtnLabel` 文本占位
- 新增脚本（紧跟 dark-mode bootstrap）：
  ```js
  var from = new URLSearchParams(location.search).get('from');
  if (from) { /* 切到强制登录模式 */ }
  ```
  - 设置 `body[data-required-login="true"]`
  - 文案切换：🔓 游客模式 → 🔒 需要登录；准备好了吗？→ 请使用微信登录继续；先不登录也能逛逛街角的温柔 → 先用微信账号解锁「足迹 · 我的」等高级功能
  - 把"微信登录（解锁发布）" → "微信一键登录（解锁访问）"
  - 目标名映射：`footprint.html → 温柔足迹`、`me.html → 我的主页`、`release.html → 发布盲盒`、`settings.html → 设置`
  - 「返回上一页」按钮：在浏览器历史里回退（避免回到被守卫拦截的足迹/我的），兜底跳 `index.html`

## 验证
- `http://localhost:8080/auth.html?from=footprint.html` 返回 200，DOM 中包含新的 `data-required-login` / `need-login-tip` / `wechatBtnLabel` 等标识。
- 节点脚本未涉及（纯静态切换）；CSS 通过 `body[data-required-login="true"]` 选择器整体接管。
- 本地预览 `http://localhost:8080/auth.html`（HTTP 200）已就绪。

## 备注
- 配合已存在的 `XJAuth.guardGuest()`（app.js 在 `initTabBar()` 调用）完成端到端闭环：游客点「足迹/我的」→ 跳 `auth.html?from=足迹/我的` → 落地页切换为强制登录模式。
- 暗色主题兼容：CSS 变量（`--color-brand-dark`、`--color-ink-secondary`）已覆盖亮/暗两态，无需额外 dark-mode 补丁。
- 文案仍属可配置项；如有运营文案变更，仅修改 `auth.html` 的 from-detection IIFE 内的几个 `textContent` 赋值即可。
