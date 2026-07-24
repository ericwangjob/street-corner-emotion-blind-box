# 街角情绪盲盒 · MasterGo 兼容导出说明

> 导出包位置：`front-end/mastergo/`
> 配套文件：`index.html` `pickup.html` `release.html` `footprint.html` `me.html` `settings.html`
> 设计规范来源：`DESIGN.md`（项目根目录）

---

## 0. 当前导出状态 & 如何使用

### 0.1 画布推送状态：⚠️ 未连接（Network Error）
- 本会话中 `design_page` 与 `submit_page_to_canvas` 均返回 `Network Error`，MasterGo 桌面端桥接未就绪（连接器状态：disconnected）。
- 6 个 HTML 文件**已按 MasterGo 原生 page-generate 逆向转译协议生成完毕**，可直接作为设计源导入，无需重推。
- 待 MasterGo 桌面端就绪后，可让我重新执行 `design_page` → `submit_page_to_canvas(code=内联HTML)` 一键推送到画布。

### 0.2 导入方式 A（推荐，连接后自动推送）
1. 打开 **MasterGo 桌面端**，登录与 WorkBuddy 同一账号；
2. 新建或打开目标设计文件，保持文件在前台、桌面端不最小化；
3. 在 WorkBuddy 端 **MCP 服务管理** → 找到 `MasterGo（莫高设计）` → 点击「信任 / 连接」；
4. 回到对话，让我执行：每个页面分别 `design_page(free-draw)` → `submit_page_to_canvas(code=该页HTML)`，逐页推送。

### 0.3 导入方式 B（手动复制）
直接将 `front-end/mastergo/` 下任一 `.html` 的完整根节点（`<main>…</main>`）粘贴进 MasterGo 的「D2C / 导入 HTML」入口即可，所有 `data-name` 节点会还原为独立可编辑图层。

---

## 1. 输出格式为何兼容 MasterGo 原生

6 个文件严格遵循 **MasterGo 逆向转译协议（page-generate）**：

| 协议红线 | 本包遵守情况 |
|---|---|
| 根节点 `<main data-name="页面名">` | ✅ 每个文件唯一根节点，命名即页面标识 |
| Tailwind Arbitrary Values（`w-[375px]` `bg-[#hex]`） | ✅ 全部尺寸/颜色用任意值显式声明，无 `w-1/2`、`bg-red-500` 等主题默认 |
| 每个标签含语义化 `data-name` | ✅ 容器、文本、图标、图片均带 `data-name` → 还原为独立图层 |
| 图标用 FontAwesome | ✅ `<i class="fas/far fa-xxx text-[size] text-[#hex]">` |
| 图片用 `{{keyword}}` 占位 | ✅ 3 处图片位均用 `{{语义关键词}}`，系统按词联网取图或本地替换 |
| 文本默认 `<span>`、段落用 `<p>` | ✅ 控件/标签/数值用 `<span>`；仅说明性长文用 `<p>` |
| 文本显式声明 `text-[size] leading-[font] font-[weight] text-[#hex]` | ✅ 每个承载文字的标签都带完整样式 |
| 字体逐字写在实际文字标签 `style="font-family:…"` | ✅ 每处文字显式声明 `Inter / PingFang SC` 栈 |
| 禁用原生表单 `input/select/textarea/button` | ✅ 全部用静态 `div` 模拟（开关、输入框、按钮） |
| 无 margin / 无 grid / 无相对单位 | ✅ 纯 Flex；绝对定位仅用内联 `style="right/bottom"` 做悬浮元素 |
| 8pt 间距网格 | ✅ 间距/内边距仅取 8 / 12 / 16 / 20 / 24 / 32 / 40 |
| 多层弥散光影 | ✅ 见 §2.5，均为 `rgba` 柔影 |

**图层原子化保证**：本包**未做任何合并/栅格化**，每个视觉元素都是独立 DOM 节点 + `data-name`，在 MasterGo 中打开后**每一层均可单独选中、改色、改字、改间距**。

---

## 2. 设计元数据保留对照

### 2.1 色彩系统（Color Tokens）

| 语义槽 | 值（HEX / rgba） | MasterGo 填充类型 | 用途 |
|---|---|---|---|
| 主色 · 薰衣草紫 | `#B8A9E8` | 纯色填充 | 主按钮、选中态边框、图标点缀、Tab 选中背景 |
| 品牌深色 | `#5A4A8A` | 纯色填充 | Tab 选中文字/图标、强调文字、徽章文字 |
| 文字主色 | `#2C2C2E` | 纯色填充 | 标题、正文、控件文字 |
| 文字次色 | `#54545A` | 纯色填充 | 副标题、说明、芯片文字 |
| 文字弱色 | `#8A8A90` | 纯色填充 | 占位、nano 标签、未选中 Tab |
| 玻璃表面 | `rgba(255,255,255,0.72)` | 半透明填充 + `backdrop-filter:blur` | 卡片 / 导航 / 弹层背景 |
| 玻璃描边 | `rgba(120,108,160,0.16)` | 描边 1px | 卡片、按钮、芯片边框 |
| 危险 / 退出 | `#E09A9A` + `rgba(224,154,154,0.40)` | 描边 + 文字 | 退出登录按钮 |
| 情绪·松弛 | `#D8E2DC` | 纯色填充 | 情绪色卡-松弛 |
| 情绪·微甜 | `#FFE5D9` | 纯色填充 | 情绪色卡-微甜 |
| 情绪·发呆 | `#D8E1E9` | 纯色填充 | 情绪色卡-发呆 |
| 情绪·暖意 | `#FECEB6` | 纯色填充 | 情绪色卡-暖意 / 暖意徽章 |
| 暖意徽章底 | `rgba(254,206,182,0.72)` | 半透明填充 | 暖意 badge 背景 |
| 渐变·主背景 | `linear-gradient(180deg,#E8E0F7 0%,#FADADD 45%,#FCE8DE 100%)` | 线性渐变填充 | Home / Pickup 页面背景 |
| 渐变·浅背景 | `linear-gradient(180deg,#FCFAF7 0%,#F9F1EC 100%)` | 线性渐变填充 | Release / Me / Settings / Footprint 背景 |
| 渐变·本周卡 | `linear-gradient(135deg,#FADADD 0%,#FCE5D9 55%,#D8E1E9 100%)` | 线性渐变填充 | Footprint weekly-card |
| 渐变·头像 | `linear-gradient(135deg,#B8A9E8 0%,#F8C9B0 100%)` | 线性渐变填充 | Me 头像 |
| 渐变·罗盘中心 | `linear-gradient(135deg,#FFFFFF 0%,#F5F1FA 100%)` | 线性渐变填充 | 中心定位点 |
| 罗盘光晕 | `radial-gradient(circle_at_center,rgba(184,169,232,0.28) 0%,rgba(184,169,232,0.06) 60%,transparent 100%)` | 径向渐变填充 | 情绪罗盘背景光 |

### 2.2 排版系统（Typography）

字体栈（每处文字显式声明）：`Inter` → `PingFang SC` → `Microsoft YaHei` → `sans-serif`

| 角色 | 字号 | 行高 | 字重 | 字距 | 载体 |
|---|---|---|---|---|---|
| Hero 标题 | 36px | 40px | 700 | 0 | `<h1>` |
| 本周卡大标题 | 32px | 36px | 700 | 0 | `<h2>` |
| 区块主标题 | 24px | 30px | 700 | 0 | `<h2>` |
| 顶部页标题 | 20px | 24px | 700 | 0 | `<h1>` |
| 功能 / 区块标题 | 18px | 24px | 600 | 0 | `<h2>` |
| 正文 / 按钮文字 | 15px | 20px | 400 / 500 / 600 | 0 | `<span>` / `<p>` |
| 说明 / 次级文字 | 12px | 16–18px | 400 / 500 | 0 | `<span>` |
| nano 标签（大写） | 11px | 14px | 500 | 0.5px · uppercase | `<span>` |
| 统计数值 | 24px | 30px | 700 | 0 | `<span>` |
| 段落说明 | 15px | 24px | 400 | 0（text-center/left） | `<p>` |

### 2.3 间距与栅格（8pt Grid）

- 容器左右内边距 `p-[24px]`；卡片内边距 `p-[16px]` / `p-[24px]`。
- 纵向 / 组件间距 `gap-[8px]` `gap-[12px]` `gap-[16px]` `gap-[24px]` `gap-[32px]`。
- 卡片组区块间距 `mt-[24px]`（仅用于纵向区块分隔，非 margin 布局）。
- 基准画板 `w-[375px] min-h-[812px]`（iPhone 标准移动端）。

### 2.4 圆角（Radius）

| 取值 | 用途 |
|---|---|
| 12 / 13 / 14px | 图标方形容块、小芯片 |
| 16px | 统计小卡、徽章内卡 |
| 20px | 内容卡、时间线项、媒体框 |
| 24 / 28px | 主卡、用户卡、设置卡（玻璃大卡） |
| 32px | 底部 Tab 栏 |
| 44 / 56 / 72px | 圆形按钮 / 头像 / 罗盘中心 |
| 280px | 情绪罗盘整圆 |
| 9999px | 胶囊、Tab、FAB、开关轨道 |

### 2.5 阴影系统（Shadows）

| 名称 | box-shadow 值 |
|---|---|
| 卡片柔影 | `0 8px 32px rgba(120,104,168,0.10)` |
| 发光晕 | `0 0 24px rgba(184,169,232,0.28)` |
| 按钮影 | `0 4px 16px rgba(120,104,168,0.12)` |
| 弹层上滑影 | `0 -12px 40px rgba(120,104,168,0.12)` |
| 本周卡影 | `0 12px 40px rgba(245,200,216,0.22)` |
| 行内小影 | `0 2px 8px rgba(120,104,168,0.06)` |
| 开关拇指影 | `0 2px 8px rgba(120,104,168,0.06)` |

---

## 3. 图标与图片占位 → 原始资源映射

### 3.1 图片占位（3 处）

| 文件 | 图层 `data-name` | 占位 `{{keyword}}` | 原始资源 / 来源 | 说明 |
|---|---|---|---|---|
| `pickup.html` | `mood-image` | `{{晚霞橘猫 街角路沿 情绪卡片封面}}` | `front-end/assets/image/card-img.jpg` | **唯一真实位图资源**；原稿为街角橘猫插画（源为内联 SVG），导入时可替换为真实照片 |
| `release.html` | `capture-preview` | `{{上传的情绪照片 街角瞬间}}` | （用户拍摄，无源文件） | 占位，待拍照 / 录音后填充；默认 `opacity-0` 隐藏 |
| `footprint.html` | `chart-image` | `{{本周情绪图卷 柱状折线 暖意橙主色}}` | （AIGC 动态生成） | 情绪图卷，AI 生成的柱状 + 折线图，无静态源 |

### 3.2 图标（全部 FontAwesome 矢量，可独立改色 / 换形）

原 `front-end/` 源稿图标为内联 SVG，导出时统一映射为最接近的可编辑 FA 类，便于在 MasterGo 中作为矢量图标单独编辑：

`fa-map-marker-alt` `fa-cog` `fa-shield-alt` `fa-plus` `fa-book` `fa-user` `fa-arrow-left` `fa-heart`（fas/far）`fa-camera` `fa-microphone` `fa-bell` `fa-share-alt` `fa-chevron-right` `fa-pen` `fa-lock` `fa-comment-dots` `fa-moon` `fa-wave-square` `fa-volume-up` `fa-globe` `fa-download` `fa-file-alt` `fa-info-circle` `fa-th-large` `fa-keyboard` `fa-file-export` `fa-envelope` `fa-clock` `fa-image`

> 若需还原为原始 SVG 路径，可在 MasterGo 中将对应 FA 图标替换为 `front-end/` 源文件里的内联 `<svg>`。

---

## 4. 交互原型跳转（Prototype Jumps）

| 来源页面 | 来源图层 `data-name` | 触发 | 目标页面 | 备注 |
|---|---|---|---|---|
| index | `btn-settings` | 点击齿轮 | settings.html | 进入设置 |
| index | `btn-pickup`（去拾取温柔） | 点击 | pickup.html | 近场解锁流程 |
| index | `fab-release`（+） | 点击 | release.html | 发布盲盒 |
| index | `tab-footprint` | 点击 | footprint.html | Tab 切换 |
| index | `tab-me` | 点击 | me.html | Tab 切换 |
| pickup | `btn-back`（←） | 点击 | index.html | 返回罗盘 |
| pickup | `btn-receive`（接收此温柔） | 点击 | （标记已接收 → 回 index / 写入 footprint） | 状态变更 |
| release | `btn-close`（×） | 点击 | index.html | 取消发布 |
| release | `mood-relaxed-selected` 等 4 项 | 选择情绪 | （本地状态：地图光点变色） | 见 §5.1 |
| release | `btn-submit`（留在此时此地） | 点击 | （发布成功 → index.html） | — |
| footprint | `btn-share` | 点击 | （分享面板） | 系统分享 |
| footprint | `btn-view-all` | 点击 | （完整时间线） | — |
| footprint | `btn-generate`（生成本周情绪图卷） | 点击 | （展开 `chart-card`） | 见 §5.4 |
| footprint | `tab-compass` / `tab-me` | 点击 | index.html / me.html | Tab 切换 |
| me | `func-row-5`（设置） | 点击 | settings.html | 进入设置 |
| me | `func-row-1~4` | 点击 | （资料 / 安全 / 通知 / 订单） | 各自下钻 |
| me | `tab-compass` / `tab-footprint` | 点击 | index.html / footprint.html | Tab 切换 |
| settings | `btn-back`（←） | 点击 | me.html | 返回个人页 |
| settings | `row-profile` / `row-privacy` / `row-security` | 点击 | （对应设置子页 / 面板） | — |
| settings | `toggle-on-*` / `toggle-off-*` | 切换 | （本地开关状态） | 见 §5.2 |
| settings | `row-theme` / `row-language` / `row-storage` / `row-feedback` / `row-about` / `row-default` / `row-shortcut` / `row-export` | 点击 | （各自面板 / 确认框） | — |

---

## 5. 组件变体状态（Component Variants）

> 静态 HTML 中已用**不同 class 直接硬编码**各状态，使状态在 MasterGo 中同时可见、可改，不依赖 hover 伪类。

### 5.1 情绪色卡（release · 4 态）
| 变体 `data-name` | 选中态 | 边框 | 底色 | 圆点色 |
|---|---|---|---|---|
| `mood-relaxed-selected` | ✅ 选中 | `border-[2px] border-[#B8A9E8]` | `rgba(184,169,232,0.08)` | `#D8E2DC`（松弛） |
| `mood-sweet` | 未选 | `border-[2px] border-transparent` | `rgba(255,255,255,0.72)` | `#FFE5D9`（微甜） |
| `mood-daydream` | 未选 | 同上 | 同上 | `#D8E1E9`（发呆） |
| `mood-warm` | 未选 | 同上 | 同上 | `#FECEB6`（暖意） |

### 5.2 开关 Toggle（settings · on/off）
| 状态 | 轨道背景 | 拇指位置 |
|---|---|---|
| on（`toggle-on-1/2/3`） | `bg-[#B8A9E8]` | 右 `right:2px` |
| off（`toggle-off-1/2`） | `bg-[rgba(120,108,160,0.28)]` | 左 `left:2px` |

当前默认：接收温柔提醒(on) · 共鸣解锁通知(on) · 触感反馈(on) · 每周情绪回顾(off) · 环境音(off)。

### 5.3 底部 Tab 栏（active / inactive）
| 状态 | 图标 / 文字色 |
|---|---|
| active（如 index 的 `tab-compass-active`） | `#5A4A8A` |
| inactive（如 `tab-footprint` `tab-me`） | `#8A8A90` |

三页 Tab 栏结构一致，仅 active 项不同：index→罗盘 / footprint→足迹 / me→我的。

### 5.4 情绪图卷卡片（footprint · 收起 / 展开）
- **收起态**：仅显示 `btn-generate`（生成本周情绪图卷）。
- **展开态**（`chart-card`）：含 `chart-summary`（平均指数 82 / 主情绪 暖意）+ `chart-canvas-wrap`（`chart-image`）+ `chart-legend`（暖意/发呆/微甜）+ `chart-actions`（`btn-export` 保存为图片 / `btn-collapse` 收起图卷）。

### 5.5 按钮（3 类）
| 类型 | 背景 | 文字色 | 示例 |
|---|---|---|---|
| Primary | `bg-[#B8A9E8]` | `#FFFFFF` | 去拾取温柔 / 留在此时此地 / 接收此温柔 |
| Secondary | `rgba(255,255,255,0.72)` + 描边 | `#2C2C2E` | 拍照 / 录音 5s / 生成本周情绪图卷 |
| Danger / Ghost | 透明 + `rgba(224,154,154,0.40)` 描边 | `#E09A9A` | 退出登录 |

---

## 6. 布局体系保留说明

- **Flex 嵌套**：所有布局纯 Flex，主区 `flex-1` + 次区定宽（如图标 `w-[40px]`、按钮 `w-[279px]`），无 Grid、无比例小数。
- **对齐与约束**：容器统一 `justify-start items-center`，卡片内 `items-stretch` 保证满宽；图标 + 文字行用 `justify-start items-center gap-[16px]`。
- **悬浮元素**：FAB（`fab-release`）、近距离标签（`proximity-distance`）用内联 `style="right/bottom"` 绝对定位，不破坏 Flex 流。
- **响应式**：以 375px 为基准画板，所有尺寸为绝对 px；MasterGo 中可通过「适配 / 等比缩放」约束在更大画板下保持比例，组件内 `flex-1` 区域自动撑满。
- **图层层级（z-index）**：由 DOM 顺序 + `absolute` 实现（如罗盘涟漪环 `<` 中心定位点 `<` FAB），还原后保持相同堆叠。

---

## 7. 文件清单

| 文件 | 页面 | 关键图层数 | 变体 / 交互注释 |
|---|---|---|---|
| `index.html` | Home-Compass 情绪罗盘 | ~20 | Tab 选中 / 去拾取 / FAB 发布 / 设置入口 |
| `pickup.html` | Pickup-Proximity 近场解锁 | ~16 | 返回 / 接收温柔 / 图片占位 |
| `release.html` | Release-Blindbox 种温柔 | ~30 | 4 情绪色卡 / 拍照录音 / 提交 |
| `footprint.html` | Footprint-Timeline 温柔足迹 | ~28 | 图卷收起/展开 / 分享 / Tab |
| `me.html` | Me-Profile 我的 | ~24 | 头像编辑 / 5 功能入口 / Tab / 退出 |
| `settings.html` | Settings-Page 设置 | ~50 | 5 分组 / 5 开关态 / 多子页入口 |

— 导出完毕。连接 MasterGo 桌面端后，可让我一键推送到画布。
