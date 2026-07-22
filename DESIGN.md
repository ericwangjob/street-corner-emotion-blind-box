# DESIGN.md — 街角情绪盲盒（Street-Corner Emotion Blind Box）

> **版本**：v1.0
> **日期**：2026-07-21
> **风格参考**：Apple（玻璃质感 / 系统字体 / 留白）+ Lovable（暖调 parchment / 柔和渐变 / pill 形交互）+ 上传 Wellness UI（薰衣草/桃粉/天蓝 pastel 情绪渐变）
> **适用平台**：微信小程序（iOS / Android）
> **文档目标**：为 AI 编程代理与设计团队提供可直接消费的结构化设计系统

---

## 1. Visual Theme & Atmosphere

### 1.1 品牌设计哲学
「街角情绪盲盒」是一个把城市散步变成情绪疗愈的轻量化 LBS 产品。其视觉系统需要同时满足三种感受：**安静（不打扰）、温暖（有善意）、当下（脚踏实地）**。因此界面不追求高效信息密度，而是让色彩和动效像呼吸一样缓慢起伏，让用户在打开的瞬间就感到"可以慢一点"。

### 1.2 视觉基调
- **关键词**：柔和疗愈、 pastel 情绪渐变、玻璃拟态、有机抽象、呼吸感、低信息噪音。
- **氛围描述**：像清晨窗边的光、傍晚散步时的微风、水彩在纸上自然晕开的边缘。
- **质感倾向**：以多层半透明表面（glassmorphism）和柔和的弥散阴影为主，避免纯扁平；背景使用大面积柔和渐变，前景使用高斯模糊让内容悬浮于情绪色之上。

### 1.3 核心视觉特征
1. **Pastel 情绪光谱**：薰衣草紫、桃粉、暖橙、天蓝、薄荷绿等高亮度低饱和度色彩作为功能色与背景色。
2. **玻璃拟态卡片**：白色/奶油色半透明表面 + `backdrop-filter: blur()`，营造"浮在情绪色上"的层次。
3. **超大圆角**：卡片 24–32px，按钮 pill/capsule，整体语言圆润、无攻击性。
4. **有机抽象插画**：无硬边的花朵、叶片、光斑、水波纹，使用径向/线性渐变与动态呼吸缩放。
5. **呼吸感动效**：光点、渐变背景、加载状态均以 1.5–3s 的缓动循环，强调"不催促"。

### 1.4 光影与质感
- 光源：从屏幕顶部偏左洒下的柔和漫射光（模拟自然天光）。
- 阴影：大面积、低对比、高模糊的弥散阴影，避免硬投影。
- 反射：玻璃卡片顶部常带 1px 半透明白边高光，模拟表面反光。

---

## 2. Color Palette & Roles

### 2.1 CSS Variables Root
```css
:root {
  /* Primary & Brand */
  --color-primary: #B8A9E8;
  --color-primary-hover: #A895E0;
  --color-primary-active: #9A85D8;
  --color-primary-subtle: rgba(184, 169, 232, 0.16);

  /* Secondary & Accent */
  --color-secondary: #F8C9B0;
  --color-secondary-hover: #F5B89A;
  --color-accent-pink: #F5C8D8;
  --color-accent-blue: #B8D4F0;
  --color-accent-mint: #B8E5D8;

  /* Brand Dark */
  --color-brand-dark: #5A4A8A;

  /* Neutral / Gray Scale */
  --color-ink: #2C2C2E;
  --color-ink-secondary: rgba(44, 44, 46, 0.72);
  --color-ink-muted: rgba(44, 44, 46, 0.48);
  --color-ink-subtle: rgba(44, 44, 46, 0.24);

  /* Surface & Borders */
  --color-background: #F8F6FC;
  --color-background-warm: #FCFAF7;
  --color-surface: rgba(255, 255, 255, 0.72);
  --color-surface-solid: #FFFFFF;
  --color-surface-elevated: rgba(255, 255, 255, 0.88);
  --color-border: rgba(120, 108, 160, 0.14);
  --color-border-strong: rgba(120, 108, 160, 0.28);
  --color-divider: rgba(120, 108, 160, 0.10);

  /* Semantic */
  --color-success: #7ECCB8;
  --color-success-bg: rgba(126, 204, 184, 0.14);
  --color-warning: #F2C68A;
  --color-warning-bg: rgba(242, 198, 138, 0.14);
  --color-error: #E09A9A;
  --color-error-bg: rgba(224, 154, 154, 0.14);
  --color-info: #8BBCE8;
  --color-info-bg: rgba(139, 188, 232, 0.14);

  /* Shadow Colors */
  --shadow-color-primary: rgba(120, 104, 168, 0.12);
  --shadow-color-deep: rgba(90, 74, 138, 0.16);
  --shadow-color-glow: rgba(184, 169, 232, 0.28);
}
```

### 2.2 颜色角色说明

| 角色 | 变量名 | 色值 | 使用场景 |
|------|--------|------|----------|
| 主色 | `--color-primary` | `#B8A9E8` | 主按钮、选中态、重点图标、焦点环 |
| 主色悬停 | `--color-primary-hover` | `#A895E0` | 按钮 hover |
| 主色按下 | `--color-primary-active` | `#9A85D8` | 按钮 active |
| 品牌深色 | `--color-brand-dark` | `#5A4A8A` | 深色模式主文字、强调标题 |
| 辅助色 | `--color-secondary` | `#F8C9B0` | 次要按钮、标签、暖色卡片 |
| 强调粉 | `--color-accent-pink` | `#F5C8D8` | 情绪标签"微甜"、女性化/温柔场景 |
| 强调蓝 | `--color-accent-blue` | `#B8D4F0` | 情绪标签"发呆"、夜晚/水/天空 |
| 强调薄荷 | `--color-accent-mint` | `#B8E5D8` | 成功态、情绪标签"松弛"、自然 |
| 主文字 | `--color-ink` | `#2C2C2E` | 标题、正文、按钮文字 |
| 次要文字 | `--color-ink-secondary` | `rgba(44,44,46,0.72)` | 副标题、说明文字 |
| 弱化文字 | `--color-ink-muted` | `rgba(44,44,46,0.48)` | 占位符、时间、辅助信息 |
| 页面背景 | `--color-background` | `#F8F6FC` | 默认页面底色（薰衣草白） |
| 暖色背景 | `--color-background-warm` | `#FCFAF7` | 个人空间、温暖场景 |
| 玻璃表面 | `--color-surface` | `rgba(255,255,255,0.72)` | 卡片、浮层、Tab 栏 |
| 抬高表面 | `--color-surface-elevated` | `rgba(255,255,255,0.88)` | 模态、下拉菜单 |
| 边框 | `--color-border` | `rgba(120,108,160,0.14)` | 卡片边框、分割线 |
| 成功 | `--color-success` | `#7ECCB8` | 完成、接收成功 |
| 警告 | `--color-warning` | `#F2C68A` | 弱提醒、草稿未保存 |
| 错误 | `--color-error` | `#E09A9A` | 发布失败、权限拒绝 |
| 信息 | `--color-info` | `#8BBCE8` | 提示、引导 |

### 2.3 情绪色谱（Mood Palette）
用于地图光点、发布色系、AIGC 图卷色彩偏好。

| 情绪标签 | 变量 | 色值 | 场景 |
|----------|------|------|------|
| 松弛 | `--mood-relaxed` | `#D8E2DC` | 公园、树荫、风声 |
| 微甜 | `--mood-sweet` | `#FFE5D9` | 甜品店、花店、可爱事物 |
| 发呆 | `--mood-daydream` | `#D8E1E9` | 天桥、座椅、晚霞、河流 |
| 暖意 | `--mood-warm` | `#FECEB6` | 街角咖啡馆、烘焙香气 |

### 2.4 渐变规范
- **英雄背景渐变**：`linear-gradient(180deg, #E8E0F7 0%, #FADADD 45%, #FCE8DE 100%)`
- **情绪罗盘水波纹**：`radial-gradient(circle at center, rgba(184,169,232,0.28) 0%, rgba(184,169,232,0.06) 60%, transparent 100%)`
- **卡片彩色背景（粉）**：`linear-gradient(135deg, #FADADD 0%, #FCE5D9 100%)`
- **卡片彩色背景（蓝）**：`linear-gradient(135deg, #D8E1E9 0%, #D6EAF8 100%)`
- **卡片彩色背景（橙）**：`linear-gradient(135deg, #FECEB6 0%, #F9D8C4 100%)`

---

## 3. Typography Rules

### 3.1 Font Family
```css
--font-family-primary: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "PingFang SC", "Microsoft YaHei", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-family-mono: "SF Mono", "Menlo", "Monaco", "Courier New", monospace;
```
> 中文优先使用系统 PingFang SC / Microsoft YaHei，保证小程序内无需额外加载字体；英文使用 SF Pro 风格系统字体栈。

### 3.2 Type Scale

| 层级 | 变量 | 字号 (px/rem) | 字重 | 行高 | 字距 | 用途 |
|------|------|---------------|------|------|------|------|
| Display Hero | `--type-hero` | 40px / 2.5rem | 700 | 1.10 | -0.8px | 英雄页大标题（如"Morning Awakening"） |
| Display | `--type-display` | 32px / 2rem | 700 | 1.15 | -0.5px | 页面主标题（如"Your Body's Wisdom"） |
| H1 | `--type-h1` | 28px / 1.75rem | 700 | 1.20 | -0.3px | 模块标题 |
| H2 | `--type-h2` | 22px / 1.375rem | 600 | 1.25 | -0.2px | 卡片标题 |
| H3 | `--type-h3` | 18px / 1.125rem | 600 | 1.30 | 0 | 小标题、列表标题 |
| Body Large | `--type-body-lg` | 17px / 1.0625rem | 400 | 1.55 | 0 | 导语、重要正文 |
| Body | `--type-body` | 15px / 0.9375rem | 400 | 1.60 | 0 | 默认正文 |
| Caption | `--type-caption` | 13px / 0.8125rem | 400 | 1.40 | 0 | 辅助说明、时间 |
| Nano / Label | `--type-nano` | 11px / 0.6875rem | 500 | 1.30 | 0.5px | 大写标签（如"SERENITY""CALMING"） |

### 3.3 排版哲学
- **压缩与舒展并用**：Display 标题使用负字距获得编辑感；正文保持正常字距确保可读性。
- **字重克制**：仅用 400 / 500 / 600 / 700 四级，避免过细字重（小于 400）在 Android 上发虚。
- **行高偏舒适**：正文行高 1.55–1.60，标题行高 1.10–1.30，整体留白靠行高而非额外 margin。
- **全大写标签**：Nano 层级用于功能分类标签，字距放宽，颜色使用 `--color-ink-muted`。

---

## 4. Component Stylings

### 4.1 Buttons

#### Primary Pill（主按钮）
```css
.button-primary {
  background: var(--color-primary);
  color: #FFFFFF;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  padding: 14px 28px;
  border-radius: 9999px;
  border: none;
  box-shadow: 0 4px 16px var(--shadow-color-primary);
  transition: transform 180ms var(--ease-soft), box-shadow 180ms var(--ease-soft);
}
.button-primary:hover { background: var(--color-primary-hover); }
.button-primary:active { transform: scale(0.98); background: var(--color-primary-active); }
```

#### Secondary Pill（次按钮 / 玻璃按钮）
```css
.button-secondary {
  background: var(--color-surface);
  color: var(--color-ink);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--color-border);
  padding: 12px 24px;
  border-radius: 9999px;
  box-shadow: 0 2px 8px rgba(120, 104, 168, 0.05);
}
.button-secondary:hover { background: var(--color-surface-elevated); }
```

#### Ghost Button
```css
.button-ghost {
  background: transparent;
  color: var(--color-ink-secondary);
  padding: 10px 18px;
  border-radius: 9999px;
}
.button-ghost:hover { background: var(--color-primary-subtle); color: var(--color-brand-dark); }
```

#### Icon Button（圆形）
```css
.button-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--color-surface);
  backdrop-filter: blur(12px);
  border: 1px solid var(--color-border);
  display: grid;
  place-items: center;
  box-shadow: 0 2px 8px rgba(120, 104, 168, 0.06);
}
```

### 4.2 Cards

#### Glass Card（玻璃卡片）
```css
.card-glass {
  background: var(--color-surface);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  padding: 20px;
  box-shadow:
    0 8px 32px var(--shadow-color-primary),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}
```

#### Colored Mood Card（情绪卡片）
```css
.card-mood {
  border-radius: 24px;
  padding: 20px;
  color: #FFFFFF;
  background: linear-gradient(135deg, #FADADD 0%, #FCE5D9 100%);
  box-shadow: 0 8px 28px rgba(245, 200, 216, 0.22);
  /* 或 #D8E1E9→#D6EAF8 / #FECEB6→#F9D8C4 等情绪变体 */
}
```

#### Metric Card（数据卡片，如 24°C / 66%）
```css
.card-metric {
  background: var(--color-surface);
  backdrop-filter: blur(16px);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 16px;
  min-width: 76px;
  text-align: left;
}
```

### 4.3 Inputs

```css
.input {
  background: rgba(245, 243, 250, 0.92);
  color: var(--color-ink);
  border: 1px solid var(--color-border);
  border-radius: 9999px;
  padding: 14px 20px;
  font-size: 15px;
  line-height: 1.4;
  transition: border-color 180ms var(--ease-soft), box-shadow 180ms var(--ease-soft);
}
.input::placeholder { color: var(--color-ink-muted); }
.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-primary-subtle);
}
```

### 4.4 Navigation

#### Floating Bottom Tab Bar
```css
.tab-bar {
  position: fixed;
  bottom: 24px;
  left: 16px;
  right: 16px;
  height: 64px;
  background: var(--color-surface);
  backdrop-filter: blur(24px);
  border: 1px solid var(--color-border);
  border-radius: 32px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 8px 32px var(--shadow-color-primary);
}
.tab-item { color: var(--color-ink-muted); }
.tab-item.active { color: var(--color-primary); }
```

#### Top Pill（如 GOOD MORNING / MEDITATION FOR TONIGHT）
```css
.top-pill {
  background: var(--color-surface);
  backdrop-filter: blur(12px);
  border: 1px solid var(--color-border);
  border-radius: 9999px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--color-ink-secondary);
}
```

### 4.5 Badges / Tags

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  background: var(--color-primary-subtle);
  color: var(--color-brand-dark);
}
.badge-mood-sweet { background: rgba(245, 200, 216, 0.22); color: #9A6B7D; }
.badge-mood-warm { background: rgba(254, 206, 182, 0.22); color: #9A6A50; }
```

### 4.6 Modals / Dialogs

```css
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(44, 34, 72, 0.32);
  backdrop-filter: blur(6px);
  z-index: 500;
}
.modal-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-surface-elevated);
  backdrop-filter: blur(28px);
  border-top-left-radius: 32px;
  border-top-right-radius: 32px;
  padding: 24px;
  box-shadow: 0 -8px 40px var(--shadow-color-deep);
  z-index: 600;
  animation: slideUp 280ms var(--ease-soft);
}
```

### 4.7 微光卡片（近场解卡特殊组件）
```css
.proximity-card {
  background: linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.78) 100%);
  backdrop-filter: blur(24px);
  border-top-left-radius: 28px;
  border-top-right-radius: 28px;
  padding: 24px 20px 32px;
  box-shadow: 0 -12px 40px rgba(120, 104, 168, 0.12);
}
```

---

## 5. Layout Principles

### 5.1 Spacing System
基础单位为 **4px**，所有间距均为此基数的整数倍。

| Token | 数值 | 使用场景 |
|-------|------|----------|
| `--space-xxs` | 4px | 图标与文字间距、紧凑内联 |
| `--space-xs` | 8px | 小标签内部、行内元素 |
| `--space-sm` | 12px | 卡片内小间距、列表项之间 |
| `--space-md` | 16px | 标准水平页边距、组件内部填充 |
| `--space-lg` | 24px | 卡片之间、模块内部上下间距 |
| `--space-xl` | 32px | 大模块之间 |
| `--space-2xl` | 48px | 页面级区块间距 |
| `--space-3xl` | 64px | 英雄区上下留白 |

### 5.2 Grid System
- **Mobile（默认）**：4 列栅格，列间距 `16px`，左右安全边距 `16px`。
- **Tablet（≥640px）**：8 列栅格，列间距 `20px`，左右边距 `24px`。
- **Desktop（≥1024px）**：12 列栅格，列间距 `24px`，左右边距 `32px`。
- **Wide（≥1440px）**：12 列栅格，最大内容宽度 `1200px`，居中。

### 5.3 Container
```css
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding-left: var(--space-md);  /* 16px */
  padding-right: var(--space-md);
}
```

### 5.4 Section Spacing
- 页面顶部到首屏标题：≥ 64px（含状态栏安全区）。
- 模块之间：32–48px。
- 卡片之间：16px（紧凑）/ 24px（舒展）。
- 底部 Tab 栏高度 + 安全区：≥ 96px 的底部留白。

### 5.5 留白哲学
- **让背景呼吸**：页面顶部 30–50% 区域常保留给渐变背景与插画，不堆叠信息。
- **卡片即内容**：信息主要通过悬浮卡片承载，卡片周围留出足够空间强化"轻"感。
- **拒绝紧凑**：避免 8px 以下的小间隙用于主要模块；最小主要间距为 16px。

---

## 6. Depth & Elevation

### 6.1 Shadow System

| Token | CSS Value | 用途 |
|-------|-----------|------|
| `--shadow-xs` | `0 1px 2px rgba(120, 104, 168, 0.05)` | 微标签、分割线阴影 |
| `--shadow-sm` | `0 2px 8px rgba(120, 104, 168, 0.06)` | 小按钮、输入框 |
| `--shadow-md` | `0 4px 16px rgba(120, 104, 168, 0.08)` | 标准卡片、气泡 |
| `--shadow-lg` | `0 8px 32px rgba(120, 104, 168, 0.10)` | 玻璃卡片、Tab 栏 |
| `--shadow-xl` | `0 16px 48px rgba(120, 104, 168, 0.12)` | 模态、浮层 |
| `--shadow-2xl` | `0 24px 64px rgba(90, 74, 138, 0.16)` | 全屏弹窗、引导层 |
| `--shadow-glow` | `0 0 24px rgba(184, 169, 232, 0.28)` | 呼吸光点 hover、接收按钮光晕 |

### 6.2 Surface Layers
| 层级 | 变量 | 特征 |
|------|------|------|
| Background | `--color-background` | 纯色或渐变，最底层 |
| Decorative | 渐变 blob / 插画 | 装饰层，不承载交互 |
| Surface | `--color-surface` + blur(20px) | 卡片、Tab 栏，半透明 |
| Elevated | `--color-surface-elevated` + blur(28px) | 模态、下拉、Snackbar |
| Overlay | `rgba(44,34,72,0.32)` + blur(6px) | 遮罩层 |

### 6.3 Z-index Scale
| 层级 | 数值 | 元素 |
|------|------|------|
| Background | -1 | 渐变装饰层 |
| Content | 0 / 1 | 常规内容 |
| Sticky Nav | 100 | 顶部 pill、底部 Tab 栏 |
| Dropdown | 200 | 下拉菜单 |
| Modal Backdrop | 500 | 遮罩 |
| Modal | 600 | 模态 / 底部卡片 |
| Toast | 700 | 全局提示 |
| Loading Overlay | 800 | 全屏加载 |

### 6.4 Backdrop Effects
```css
--backdrop-glass: blur(20px) saturate(180%);
--backdrop-glass-strong: blur(28px) saturate(200%);
--backdrop-overlay: blur(6px);
```
> 小程序中通过 `backdrop-filter` / `-webkit-backdrop-filter` 实现；不支持时降级为 `--color-surface-solid` 实色背景。

---

## 7. Do's and Don'ts

### 7.1 Do's（推荐实践）
1. **使用 pastel 渐变作为情绪背景**，但保持前景文字对比度 ≥ 4.5:1。
2. **卡片使用玻璃拟态**（半透明 + 模糊 + 顶部 1px 高光），增强"浮于情绪色上"的质感。
3. **按钮统一使用 pill 形大圆角**，呼应整体圆润、无攻击性的品牌调性。
4. **情绪标签严格使用 F-M5-01 四色**，确保用户心智一致。
5. **动效采用缓出曲线** `cubic-bezier(0.25, 1, 0.5, 1)`，时长 180–300ms，保持柔和。
6. **图片与插画使用大圆角（20–28px）**，与卡片圆角体系一致。
7. **状态变化使用透明度和缩放微动效**，避免生硬的透明度跳变。
8. **所有可点击元素尺寸 ≥ 44×44px**，满足移动无障碍要求。

### 7.2 Don'ts（设计禁忌）
1. **不要使用高饱和度纯色**（如正红、正蓝、荧光绿），破坏 pastel 疗愈氛围。
2. **不要使用尖锐直角或 4px 以下小圆角**，与品牌圆润语言冲突。
3. **不要使用硬投影**（小模糊 + 高透明度），应使用大面积弥散阴影。
4. **不要让背景渐变与前景卡片对比过低**，导致内容漂浮感消失。
5. **不要使用复杂装饰性图标或 3D 插画**，保持有机抽象、无硬边。
6. **不要同时展示多个弹窗或全屏广告**，违背"非入侵性"原则。
7. **不要使用点赞数、排行榜、步数竞赛等数字积累型 UI**。
8. **不要让文本直接压在复杂渐变上而无玻璃层/遮罩**，影响可读性。

---

## 8. Responsive Behavior

### 8.1 Breakpoints
| 断点 | 范围 | 策略 |
|------|------|------|
| Mobile | < 640px | 默认；单列布局；底部浮动 Tab 栏 |
| Tablet | 640px – 1024px | 双列卡片网格；Tab 栏可改为左侧或保持底部 |
| Desktop | 1024px – 1440px | 12 列栅格；侧边导航可选；最大宽度 1200px |
| Wide | > 1440px | 内容居中，两侧留白，保持 1200px 最大宽度 |

### 8.2 Touch Targets
- 最小点击区域：**44×44px**。
- 图标按钮至少 44px。
- 相邻可点击元素间距 ≥ 8px。

### 8.3 折叠策略
- **情绪罗盘页**：Mobile 全屏地图；Tablet/Desktop 左侧 40% 个人足迹摘要 + 右侧 60% 地图。
- **卡片列表**：Mobile 单列；Tablet 2 列；Desktop 3 列。
- **发布浮层**：Mobile 全屏底部 sheet；Desktop 居中 480px 宽模态。
- **底部 Tab**：Mobile 固定浮动；Desktop 可折叠为左侧图标导航。

### 8.4 Font Scaling
- Mobile：使用 Type Scale 基准字号。
- Tablet/Desktop：Display Hero 可放大至 48px，H1 放大至 32px，正文保持 15–17px。
- 用户开启系统大字体时，正文最大不超过 19px，避免破坏布局；标题允许折行。

---

## 9. Agent Prompt Guide

### 9.1 Quick Reference
- **形态**：微信小程序，移动优先，浅色 pastel 主题。
- **核心质感**：玻璃拟态卡片 + 柔和弥散阴影 + 有机渐变插画。
- **主色**：`#B8A9E8`；情绪色：晨雾青 `#D8E2DC`、暖阳粉 `#FFE5D9`、暮色蓝 `#D8E1E9`、焦糖橙 `#FECEB6`。
- **字体栈**：`-apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang SC", "Microsoft YaHei", sans-serif`。
- **圆角**：卡片 24px，按钮 pill（9999px），小标签/输入框 pill。
- **缓动**：`cubic-bezier(0.25, 1, 0.5, 1)`。

### 9.2 Component Prompts（可直接复制）

**P1｜生成情绪罗盘首页**
> 用 HTML/Tailwind 写一个移动优先的小程序首页：顶部是"GOOD MORNING"玻璃 pill，下面是 Display 标题"Morning Awakening"，中央是 15 分钟水波纹画布，上面有呼吸光点，底部是"Relax Mode"玻璃卡片与浮动"+"发布按钮。使用 pastel 薰衣草/桃粉渐变背景，玻璃拟态卡片，圆角 24px，柔和阴影。

**P2｜生成微光卡片组件**
> 生成一个底部滑出的玻璃卡片组件：顶部 28px 圆角，背景 `rgba(255,255,255,0.88)` + `backdrop-filter: blur(24px)`，内部有媒体区、微气候上下文"周二 17:20 · 24°C 微风"、140 字文本、一个【接收此温柔】pill 主按钮。点击按钮时向周围扩散柔光粒子。

**P3｜生成情绪打包浮层**
> 生成一个半屏模态浮层"种下一个温柔盲盒"：包含拍照/录 5s 音媒体区、四色情绪色谱选择、≤140 字文字输入、当前坐标与微气候自动关联信息、底部【留在此时此地】主按钮。全部使用 pastel 配色与 pill 按钮。

**P4｜生成温柔足迹页**
> 生成个人空间页面：顶部展示本周 AIGC 水彩情绪图卷，下面是情绪时间线卡片列表。使用奶油色背景、玻璃卡片、柔和阴影，避免任何数字排行榜。

**P5｜生成浮动底部 Tab 栏**
> 生成一个固定在屏幕底部的浮动 Tab 栏：高度 64px，距左右各 16px、底部 24px，玻璃拟态背景 + 32px 大圆角，5 个图标项，选中项使用主色 `#B8A9E8`，未选中为灰色。

**P6｜生成呼吸光点动画**
> 用 CSS/SVG 实现一个 1.5s 周期的呼吸光点：默认透明度 40%，靠近用户时渐变至 100%，按情绪色系着色（#D8E2DC / #FFE5D9 / #D8E1E9 / #FECEB6），带柔和发光阴影。

### 9.3 Iteration Guide
1. **先定背景再叠卡片**：任何页面先确认渐变/插画背景层，再放置玻璃卡片，避免"白底贴卡片"的平淡感。
2. **颜色先查规范**：使用情绪色或主色时，先回到第 2 章确认变量，不要临时取色。
3. **保持圆角体系**：卡片 24px、按钮 pill、小标签 pill；不要混用直角。
4. **阴影必须柔和**：使用第 6 章定义的 `shadow-*` 变量，禁用 sharp shadow。
5. **文案遵循 Nano 规范**：小标签全大写、字距 0.5px，颜色 `--color-ink-muted`。
6. **动效时长保守**：180–300ms，缓动 `cubic-bezier(0.25,1,0.5,1)`；循环动画 1.5–3s。
7. **移动端优先验证**：先在 375px 视口检查，再适配大屏。
8. **无障碍检查**：文字对比度 ≥ 4.5:1，所有点击区 ≥ 44×44px。
9. **避免数字竞赛 UI**：不展示点赞数、步数、排行榜。
10. **降级测试**：验证无 `backdrop-filter` 时的实色背景 fallback 是否仍可用。

---

## 10. Icon & Illustration Style

### 10.1 图标风格
- **风格**：线性（Line）为主，2px 描边，圆头端点（round cap/join），24×24px 默认画布。
- **色彩**：默认 `--color-ink-secondary`，激活态 `--color-primary`，禁用态 `--color-ink-muted`。
- **常用图标**：首页（指南针/光点）、发布（加号/种子）、足迹（脚印/日历）、播放、暂停、音量、心形（空心）、定位、相机、麦克风。
- **禁忌**：不使用填充面性图标、不用尖锐几何图标、不用多色渐变图标。

### 10.2 插画风格
- **主题**：抽象自然元素（花朵、叶片、光斑、水波纹、晚霞、猫咪剪影、咖啡蒸汽）。
- **技法**：径向/线性渐变填充，无描边，高斯模糊边缘，多层透明度叠加。
- **配色**：严格使用 pastel 情绪色谱，允许相邻色自然融合。
- **动态**：可循环的缓慢缩放、漂移、旋转（周期 3–6s），营造"活着但安静"的感觉。
- **AIGC 图卷**：每周生成的专属水彩画，应延续上述有机渐变与情绪色系，避免写实照片或卡通线条。

---

## 11. Motion & Sound（补充规范）

### 11.1 动效
- **全局缓动**：`--ease-soft: cubic-bezier(0.25, 1, 0.5, 1)`。
- **页面转场**：250ms，opacity + translateY(12px → 0)。
- **卡片弹出**：280ms，translateY(100% → 0)。
- **按钮按下**：scale 0.98，180ms。
- **呼吸动画**：scale 1 → 1.08 → 1，opacity 0.4 → 1，周期 1.5s。

### 11.2 声效
- **格式**：AAC 44.1kHz / 128kbps，最大 5s。
- **淡入淡出**：200ms。
- **触觉**：进入围栏时短震 2 次（80ms，间隔 300ms）。

---

> **设计原则总结**：所有视觉决策服务于"不催促、不打扰、有温度"。当某个设计选择让你犹豫时，选择更柔和、更慢、更圆润的那个。
