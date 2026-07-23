# 街角情绪盲盒 → Ardot 转换蓝图（Ardot-Compatible Conversion Blueprint）

> **状态**：⚠️ Ardot 连接器当前未连接（`fetch_file_info` 持续返回 `NO_ADAPTER`，已重试 3 次）。
> 本文件是「可直接载入 Ardot 的源数据 + 逐层构建蓝图」。一旦在连接器面板中 **信任（Trust）Ardot 连接器** 并确认已登录，即可由我执行 `apply_variables` + `batch_edit` 将全部内容实例化为真正的 `.ardot` 可编辑文档（真实图层、文本、形状、变量，非扁平图片）。

---

## 0. 如何在 Ardot 中恢复为可编辑文档（操作步骤）

1. 打开连接器管理面板，找到 **Ardot** 连接器，点击 **Trust / 信任**。
2. 确认 Ardot 账号已登录（若需鉴权，使用 `save_tokens` 写入 authToken）。
3. 回到对话，告诉我「已连接」——我将：
   - `create_design("街角情绪盲盒-DesignSystem")` 新建文件；
   - `apply_variables` 载入 `design-tokens.ardot.json`（颜色 / 间距 / 圆角 / 字体变量）；
   - 按第 3 章逐页 `batch_edit` 构建真实图层树（每页 ≤25 操作/批）；
   - `upload_images` 把占位矩形替换为 `assets/image/*.png`；
   - `capture_layout` 校验布局，无重叠/裁切问题后交付。

---

## 1. 需求对照表（你的每条要求 → Ardot 机制）

| # | 你的要求 | Ardot 实现方式 |
|---|----------|----------------|
| 1 | 兼容 Ardot 文档编辑器 | 经 MCP 在 `.ardot` 文件中以真实节点创建（非图片导入） |
| 2 | 支持图层 / 文本 / 形状 / 颜色 / 间距 | FRAME + TEXT + RECTANGLE/ELLIPSE 节点；颜色/间距/圆角用 `apply_variables` 变量绑定 |
| 3 | 保持原始布局结构、组件层级、对齐、约束、响应式断点 | 每页一个 FRAME，内部用 AUTO-LAYOUT（垂直/水平）保留层级与对齐；`constraints` 设 `left-right / top-bottom`；断点用 3 个 FRAME 变体（见 §5） |
| 4 | 保留文本字体样式（字号/字重/行高/字距）、颜色 HEX/RGBA、渐变、阴影 | 逐 TEXT 节点写 fontSize/fontWeight/lineHeight/letterSpacing/填充色；渐变与阴影作为节点 fills/effects（见 §4） |
| 5 | 图标/图片以可替换占位符嵌入，标注原始资源路径 | 图片 → RECTANGLE 占位 + 注释 `replace: assets/image/card-img.png`；图标 → 线性描边 SVG/组件，标注 24×24 / 2px / round；后续 `upload_images` 替换 |
| 6 | 逐层可编辑，非扁平静态图片 | 全部为结构化节点树，可在 Ardot 图层面板逐层选中编辑 |
| 7 | 保留交互原型链接 / 组件状态变体 | 用「组件变体（Component Variants）」表达状态（见 §6），交互原型连接以 `prototype` 注释标注 |

---

## 2. 设计令牌（已生成：`design-tokens.ardot.json`）

直接喂给 `apply_variables`。已含 6 个变量集：

- **Color**（31 个 COLOR 变量）：primary / primary-hover / primary-active / primary-subtle / secondary / accent-pink/blue/mint / brand-dark / ink(+secondary/muted/subtle) / background / background-warm / surface / surface-solid / surface-elevated / border / border-strong / divider / success / warning / error / info / shadow-primary / shadow-deep / shadow-glow
- **Mood**（4 个 COLOR）：mood-relaxed / mood-sweet / mood-daydream / mood-warm
- **GradientStops**（9 个 COLOR）：英雄渐变 3 段 + 3 套情绪渐变起止色
- **Spacing**（8 个 FLOAT）：space-xxs 4 → space-3xl 64
- **Radius**（6 个 FLOAT）：radius-pill 9999 / radius-card 24 / radius-card-sm 20 / radius-card-lg 28 / radius-sheet 32 / radius-input 9999
- **Typography**（2 个 STRING）：font-sans / font-mono

> 注：Ardot 变量类型仅支持 COLOR / FLOAT / STRING / BOOLEAN。**阴影**与**字体尺寸/字重/行高**非变量类型——将在 `batch_edit` 建节点时作为 effects / 文本属性逐节点写入（见 §4）。

---

## 3. 字体与排版（逐节点写入，来源 DESIGN.md §3）

字体族变量：`font-sans = -apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Microsoft YaHei", sans-serif`。

| 层级 | fontSize | fontWeight | lineHeight | letterSpacing | 填充色 |
|------|----------|------------|-----------|--------------|--------|
| Display Hero | 40 | 700 | 1.10 | -0.8px | ink / brand-dark |
| Display | 32 | 700 | 1.15 | -0.5px | ink |
| H1 | 28 | 700 | 1.20 | -0.3px | ink |
| H2 | 22 | 600 | 1.25 | -0.2px | ink |
| H3 | 18 | 600 | 1.30 | 0 | ink |
| Body Large | 17 | 400 | 1.55 | 0 | ink-secondary |
| Body | 15 | 400 | 1.60 | 0 | ink |
| Caption | 13 | 400 | 1.40 | 0 | ink-muted |
| Nano/Label | 11 | 500 | 1.30 | 0.5px | ink-muted（全大写） |

---

## 4. 渐变与阴影配方（逐节点写入）

### 渐变（作为 FRAME / CARD 的 gradient fill）
- **英雄背景**：`linear-gradient(180deg, #E8E0F7 0%, #FADADD 45%, #FCE8DE 100%)`
- **情绪罗盘水波纹**：`radial-gradient(circle at center, rgba(184,169,232,0.28) 0%, rgba(184,169,232,0.06) 60%, transparent 100%)`
- **情绪卡片（粉）**：`linear-gradient(135deg, #FADADD 0%, #FCE5D9 100%)`
- **情绪卡片（蓝）**：`linear-gradient(135deg, #D8E1E9 0%, #D6EAF8 100%)`
- **情绪卡片（橙）**：`linear-gradient(135deg, #FECEB6 0%, #F9D8C4 100%)`

### 阴影（作为 drop-shadow effect，color 取自 shadow-* 变量）
| Token | box-shadow | 用途 |
|-------|-----------|------|
| shadow-xs | `0 1px 2px rgba(120,104,168,0.05)` | 微标签 |
| shadow-sm | `0 2px 8px rgba(120,104,168,0.06)` | 小按钮 / 输入框 |
| shadow-md | `0 4px 16px rgba(120,104,168,0.08)` | 标准卡片 |
| shadow-lg | `0 8px 32px rgba(120,104,168,0.10)` | 玻璃卡片 / Tab 栏 |
| shadow-xl | `0 16px 48px rgba(120,104,168,0.12)` | 模态 |
| shadow-2xl | `0 24px 64px rgba(90,74,138,0.16)` | 全屏弹窗 |
| shadow-glow | `0 0 24px rgba(184,169,232,0.28)` | 呼吸光点 |

---

## 5. 响应式断点（每页 3 个 FRAME 变体）

| 断点 | 画板尺寸 | 布局策略（来自 DESIGN.md §8.3） |
|------|----------|--------------------------------|
| Mobile | 375 × 812 | 单列；底部浮动 Tab 栏；安全边距 16px |
| Tablet | 768 × 1024 | 卡片 2 列；情绪罗盘左 40% 摘要 + 右 60% 地图 |
| Desktop | 1280 × 832 | 12 栅格；最大宽 1200 居中；Tab 栏可折叠为左侧图标导航 |

每层用 `constraints: { horizontal: "LEFT_RIGHT", vertical: "TOP_BOTTOM" }` 或 auto-layout 固定，保证缩放时不破版。

---

## 6. 组件状态变体（Component Variants）与原型交互

| 组件 | 状态变体 | Ardot 表达 |
|------|----------|-----------|
| 底部 Tab 栏 | `state=active / inactive` | 变体：active 项 fill=`primary`，inactive fill=`ink-muted` |
| 微光卡片（近场解卡） | `state=resting / expanded` | 变体：resting 收起；expanded 底部 sheet 上滑（`slideUp 280ms`） |
| 情绪卡片 | `mood=relaxed / sweet / daydream / warm` | 变体：4 套渐变背景 |
| 发布浮层 | `state=closed / open` | 变体：closed 隐藏；open 居中 480px 模态 / 底部 sheet |
| 呼吸光点 | `state=default / near` | 变体：default opacity 0.4；near opacity 1 + shadow-glow |

**原型链接（prototype 注释）**：
- 首页「+」→ 打开「发布浮层 open」
- 首页 Tab「足迹」→ 跳转 footprint 页
- 微光卡片「接收此温柔」→ 触发柔光粒子 + 关闭 expanded
- 发布浮层「留在此时此地」→ 关闭浮层回首页

---

## 7. 逐页图层树（6 页，组件级；实例化时展开为完整节点）

### 7.1 index.html · 情绪罗盘首页
```
Frame[375×812, fill=hero-gradient]
 ├─ DecoLayer[ellipse blob, blur, z=-1]
 ├─ TopPill["GOOD MORNING", glass, radius-pill]  (constraints: top-center)
 ├─ Text-Hero["Morning Awakening", 40/700/-0.8px, ink]
 ├─ Frame[RippleCanvas 15min, radial-gradient water]
 │   └─ Ellipse[breathing-dot, mood color, shadow-glow, variant default/near]
 ├─ Card-Glass[Relax Mode, radius-card, shadow-lg]
 │   ├─ Text-H2["Relax Mode"]
 │   └─ Text-Body[引导文案]
 ├─ Button-Primary-FAB["+", 56×56 circle, shadow-glow]  →prototype→ release.open
 └─ TabBar[floating, 5 items, variant active/inactive]
```

### 7.2 pickup.html · 近场解卡（微光卡片）
```
Frame[375×812, fill=background]
 ├─ TopPill["NEARBY", glass]
 ├─ Text-H1["微光闪烁"]
 ├─ ProximityCard[variant resting/expanded, top-radius 28, blur 24]
 │   ├─ Frame[media area, replace: assets/image/card-img.png]
 │   ├─ Text-Caption["周二 17:20 · 24°C 微风"]
 │   ├─ Text-Body[≤140 字温柔文案]
 │   └─ Button-Primary["接收此温柔", radius-pill] →prototype→ particle+close
 └─ TabBar
```

### 7.3 release.html · 种下温柔盲盒（发布浮层）
```
Frame[375×812, fill=background]
 ├─ Text-H1["种下一个温柔盲盒"]
 ├─ Frame[media: 拍照 / 录 5s 音, replace: assets/image/uploading image.png]
 ├─ MoodSelector[4 swatch, variant mood=*]  (relaxed/sweet/daydream/warm)
 ├─ Input[≤140 字, radius-input, focus=primary ring]
 ├─ Text-Caption["当前坐标 · 微气候自动关联"]
 ├─ Button-Primary["留在此时此地", radius-pill] →prototype→ close
 └─ TabBar
```

### 7.4 footprint.html · 温柔足迹（个人空间）
```
Frame[375×812, fill=background-warm]
 ├─ Text-H1["温柔足迹"]
 ├─ Frame[AIGC 水彩情绪图卷, replace: assets/image/card-img.png, radius-card-lg]
 ├─ Frame[Timeline list, auto-layout vertical, gap=space-md]
 │   ├─ Card-Glass[情绪时间线项 ×N, radius-card]
 │   │   ├─ Text-H3[日期/地点]
 │   │   ├─ Text-Body[片段文案]
 │   │   └─ Badge[mood-*, radius-pill]
 │   └─ …（无排行榜/点赞数）
 └─ TabBar
```

### 7.5 me.html · 我（个人入口）
```
Frame[375×812, fill=background]
 ├─ Avatar[circle, replace: assets/image/card-img.png]
 ├─ Text-H2[昵称] + Text-Caption[签名]
 ├─ Card-Glass[统计概览, radius-card] (仅温情指标，无竞赛数字)
 ├─ List[设置/收藏/关于, radius-card, dividers]
 └─ TabBar
```

### 7.6 settings.html · 设置
```
Frame[375×812, fill=background]
 ├─ Text-H1["设置"]
 ├─ Group[账号, radius-card]
 │   ├─ Row[头像/昵称/退出] ×N, dividers
 ├─ Group[偏好, radius-card]
 │   ├─ Row[Toggle: 呼吸提醒 / 微气候联动 / 主题色]
 ├─ Group[关于, radius-card]
 │   ├─ Row[版本 / 隐私 / 清空缓存]
 └─ TabBar
```

---

## 8. 图片 / 图标占位符与原始资源路径

| 占位节点 | 原始资源引用路径 | 替换方式 |
|----------|------------------|----------|
| pickup 媒体区 | `front-end/assets/image/card-img.png` | `upload_images` 设为 IMAGE fill |
| release 媒体区 | `front-end/assets/image/uploading image.png` | `upload_images` 设为 IMAGE fill |
| footprint 图卷 | `front-end/assets/image/card-img.png` | `upload_images` |
| me 头像 | `front-end/assets/image/card-img.png` | `upload_images` |
| 线性图标（首页/发布/足迹/播放/相机/麦克风…） | 内联 SVG（2px 描边 / round cap / 24×24） | 建为 Ardot 组件，标注可替换；不使用填充/多色图标 |

> 插画（花朵/光斑/水波纹）为 CSS 渐变 + 模糊生成，无独立图片文件；在 Ardot 中以 ELLIPSE + gradient fill + blur effect 重建，保持有机无硬边。

---

## 9. 校验清单（实例化后执行）

- [ ] 6 页均为真实 FRAME + 子节点树，非打平图片
- [ ] 颜色/间距/圆角绑定 `design-tokens.ardot.json` 变量
- [ ] 全部文本字号/字重/行高/字距/填充色与 §3 一致
- [ ] 渐变与阴影按 §4 配方落于对应节点
- [ ] 图片占位已 `upload_images` 替换为原始 assets 路径
- [ ] 3 个断点 FRAME 变体 + constraints 正确
- [ ] 组件状态变体 + prototype 链接按 §6 建立
- [ ] `capture_layout` 无重叠/裁切问题；点击区 ≥ 44×44px
