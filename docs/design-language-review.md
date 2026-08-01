# 设计语言现状分析与实施记录

> 日期：2026-07-31 · 分析对象：Personal Site Studio（bio-blocks-studio 深度定制）
> 参照规范：project-standards/design（visual-style / paper-ink 主题配方 / ui-design / motion-and-performance）

## 当前设计语言更新（2026-08-01）

公开页已从单页技术作品集调整为独立欢迎页与个人主页。整体采用个人札记式编辑风，内容模型、语言切换、后台编辑和模块行为保持不变。

- 旋钮：`DESIGN_VARIANCE 7 / MOTION_INTENSITY 6 / VISUAL_DENSITY 5`
- 配色：冷银灰、石墨黑与单一朱橙强调；浅色、深色、跟随系统三模式
- 构图：非对称欢迎封面、7/5/12 不等宽项目编排、两列能力矩阵、离散分页片单、非等列照片画廊
- 材质：面板 8px、控件 6px、常规内容无悬浮阴影，以细线、低对比洗色、纸胶带和扁平错位色块建立层级
- 动效：IntersectionObserver 驱动揭示、章节落笔线和导航状态，禁止逐帧 scroll listener，完整支持 reduced motion
- 主视觉：`public/images/hero/qa-workbench-v2.webp`，生成式摄影资产，无人物、文字、Logo 或伪造界面

以下内容保留为上一阶段审计和决策记录。

---

## 一、现状设计语言：纸墨编辑风（Paper-Ink Editorial）

### 1. 配色

| 角色 | 值 | 用途 |
| --- | --- | --- |
| `--paper` | `#f8f7f4` | 页面背景（暖白纸色） |
| `--paper-2` | `#f1eee8` | 次级背景 |
| `--card` | `#ffffff` | 卡片与输入表面 |
| `--ink` | `#1f2328` | 标题正文（非纯黑） |
| `--ink-2` | `#62605b` | 次要文本（对比度约 5.5:1，过 WCAG AA） |
| `--rule` / `--rule-strong` | `#e7e2d9` / `#74716b` | 细线边框 / 强分隔 |
| `--seal` / `--seal-deep` / `--seal-tint` | `#e45435` / `#c0452a` / `#fff0eb` | 印章红强调体系 |

派生机制：用户自定义 `--site-primary` 等 6 个基础值（`constants/theme.ts`），`color-mix(in srgb, ...)` 自动派生全部语义色。后台可实时换主题色，全站组件零改动。

### 2. 字体

- **UI 与标题**：Plus Jakarta Sans（next/font 加载，`--font-display`），标题负字距 -0.025em ~ -0.04em
- **中文回退**：PingFang SC / Microsoft YaHei
- **中文衬线**：`--font-serif`（Songti SC / Noto Serif SC）——**仅声明 3 处，几乎未实际使用**，编辑感大标题的设计意图未兑现
- **等宽**：JetBrains Mono（`--font-label`），技术标签
- **风格化标签**：0.42–0.64rem 极小字号 + 0.1–0.18em 字距 + 600 字重（9px 以下有可读性风险）

### 3. 形状、阴影与表面

- 圆角：面板 16 / 卡片 12 / 控件 10px（比 paper-ink 规范的 8/6/4 圆润一档）；状态徽章用 999px 胶囊
- 阴影：负扩散克制三级（card `-20px` / card-hover `-28px` / pop `-36px`）
- 表面：1px 细边框为主；sticky nav 与浮动工具已用 `backdrop-filter: blur(12–18px)` 毛玻璃
- 纹理：背景印章色径向洗色 + 48px 网格线（opacity 0.6）

### 4. 间距与布局

- 12 列容器查询网格（`container-type: inline-size`），`grid-auto-rows` 按列宽计算
- `clamp()` 流体间距：页面横向 `clamp(1.25rem, 4vw, 3rem)`，hero 纵向 `clamp(4.5rem, 11vh, 8rem)`
- profile-hero 双栏 `1.15fr / 0.85fr`，sticky nav 高 4.5rem

### 5. 动效

- 统一缓动 `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`
- 时长 token：fast 180ms / state 280ms / reveal 500ms；错峰 52ms；位移 10px
- `data-reveal` 滚动揭示体系（IntersectionObserver 驱动，分类 delay），`prefers-reduced-motion` 有降级

### 6. 架构亮点

前后台（`.admin-studio` / `.public-site`）共享同一套语义 token；组件只消费语义角色。**换设计语言 = 改一处 token 定义**——这是本项目最大的设计资产。

---

## 二、优势与风险

**优势**
1. 语义 token 分层 + color-mix 派生，主题可插拔，达到设计系统教科书级实践
2. 动效全 token 化且有降级，性能纪律好（transform/opacity 优先）
3. 前后台视觉一致，后台没有退回"另一套默认蓝色控件"
4. 对比度、focus-visible、::selection 等无障碍细节到位

**风险与拉扯**
1. 圆角 16/12/10 与 paper-ink 规范 8/6/4 不一致——要么认领圆润风写回规范，要么回归
2. `--font-serif` 衬线角色形同虚设，最有辨识度的设计意图没有落地
3. 极小标签（<9px）可读性风险，建议下限 10px、常规 11–12px
4. 仅浅色单主题，缺深色模式
5. 999px 胶囊徽章与规范"禁止随意胶囊"冲突，需在规范中认领为状态角色专用
6. `.admin-studio` 与 `.public-site` 的 token 块几乎重复定义两遍，可抽公共层

---

## 三、四个候选视觉方向

### 方向 A · 深色墨玉（Dark Ink）— 推荐

**视觉主张**：深色优先的工程感个人站，印章红提亮为暖橙红，在一片冷蓝紫的 AI 产品里形成差异化。

**参考**：Linear、Raycast、Vercel、Claude/ChatGPT 深色界面

```css
.theme-dark-ink {
  --paper: #0e0e11;          /* 暖调深灰，非纯黑 */
  --paper-2: #141418;
  --card: #17171c;
  --ink: #ece9e2;            /* 暖白，呼应纸墨血统 */
  --ink-2: #8f8b82;
  --rule: rgba(236, 233, 226, 0.10);
  --rule-strong: rgba(236, 233, 226, 0.22);
  --seal: #ff5c38;           /* 印章红提亮 */
  --seal-deep: #ff8a6e;      /* 深色下深浅关系反转 */
  --seal-tint: rgba(255, 92, 56, 0.12);
  --shadow-card: 0 8px 24px -20px rgba(0, 0, 0, 0.6);
  /* hover 发光：0 0 0 1px color-mix(seal 40%, transparent)
     + 0 8px 32px -12px color-mix(seal 25%, transparent) */
}
```

**关键动作**：nav 毛玻璃改深色半透明；背景网格线改 4% 白；JetBrains Mono 角色升级（数据、编号、标签全面等宽化）；卡片 hover 加 seal 色微发光。

**落地成本**：低。新增深色 token 覆盖层 + `prefers-color-scheme` 或手动切换，组件不动。

### 方向 B · 冷灰极简（Precision）

**视觉主张**：抽掉暖色，用纯灰阶 + 唯一强调色，靠对齐、留白、微交互取胜。

**参考**：Notion、Stripe、Linear 官网（浅色侧）

```css
.theme-precise {
  --paper: #fafafa; --card: #ffffff;
  --ink: #111113; --ink-2: #6e6e73;
  --rule: rgba(17, 17, 19, 0.09);
  --rule-strong: rgba(17, 17, 19, 0.20);
  --seal: #e45435;           /* 强调色保留，成为唯一色彩 */
  --radius-panel: 12px; --radius-card: 10px; --radius-control: 10px;
  --shadow-card: 0 1px 2px rgba(0, 0, 0, 0.04);
}
```

**关键动作**：圆角统一收敛到 10–12px 单档；阴影极扁；按钮/卡片增加 `active: scale(0.98)` 按压反馈；hover 只改边框与 1–2px 位移。

**落地成本**：低，且可作为方向 A 的浅色配套主题。

### 方向 C · 极光玻璃（Aurora Glass）

**视觉主张**：浅色基底上浮三色极光光斑（seal 橙 + 紫 #7c6cf0 + 青 #2fb8a6），卡片半透明毛玻璃，是当下 AI 产品首页的主流"高级感"手法。

**参考**：v0.dev、Perplexity、Apple visionOS

```css
.theme-aurora {
  --paper: #f7f7f9;
  --card: rgba(255, 255, 255, 0.64);   /* 配合 backdrop-filter: blur(20px) saturate(1.4) */
  --ink: #16161a; --ink-2: #63636b;
  --rule: rgba(255, 255, 255, 0.55);   /* 玻璃描边 + inset 0 1px 0 rgba(255,255,255,.6) 高光 */
  --seal: #e45435;
}
/* 背景光斑：三个 radial-gradient，blur 80px，饱和度压低到 12–18% */
```

**关键动作**：光斑只放 hero 与章节过渡，不全页铺；移动端和 `prefers-reduced-motion` 下退化为静态渐变；引入第三、第四色需先扩展语义角色（aura-1 / aura-2），不得让组件直接消费裸色值。

**落地成本**：中高。大面积 blur 有性能开销，需性能与降级验证；与"克制编辑风"气质冲突最大，建议只做 hero 局部试点。

### 方向 D · 编辑风深化（Editorial+）

**视觉主张**：不换轨，把纸墨风做到极致——回归规范原始配方，兑现未完成的设计意图。

**参考**：paper-ink 主题配方默认值、杂志式个人站

**关键动作**：
1. 中文大标题真正启用宋体衬线（`--font-serif` 接到 hero 标题与章节标题）
2. 印章红回归更深的朱砂 `#b23c22`（现值 `#e45435` 偏亮偏橙）
3. 圆角回归 8/6/4 克制层级
4. 增加杂志元素：章节编号（01 / 02 / 03）、细线分栏、竖排点缀

**落地成本**：最低，基本是"回归规范默认值 + 补齐衬线"。

---

## 四、推荐路线

**主推 A（深色墨玉）+ B（冷灰极简）作为双主题**：两者共享同一 token 覆盖机制，一次架构投入得到明暗两套主题；深色契合 AI/工具气质与自托管 geek 属性，浅色保持内容可读性。印章红（`#e45435` → 深色下 `#ff5c38`）贯穿两套主题，保住品牌连续性。

**D 作为低成本备选**：如果不想推翻现有气质，只做 D——把衬线标题和朱砂色落地，个性立刻强一档。

**C 只做局部试点**：极光光斑可以单独加在 hero 背景（替换现有 48px 网格洗色），验证效果与性能后再决定去留，不建议全站玻璃化。

## 五、不动结构的快速改进清单（无论选哪个方向都该做）

1. **最小字号下限**：0.42–0.56rem 标签抬到 ≥0.625rem（10px），常规 11–12px
2. **衬线落地或删除**：`--font-serif` 要么接到大标题，要么从 token 中移除，不留死角色
3. **圆角角色对齐规范**：16/12/10 与 8/6/4 二选一，写回 theme 配方文档
4. **胶囊徽章正名**：在规范中把 999px 胶囊认领为"状态徽章专用角色"
5. **active 按压反馈**：按钮与可点卡片补 `scale(0.98)` / 120ms 微交互（现有 hover 抬升已好，缺按压闭环）
6. **token 去重**：`.admin-studio` 与 `.public-site` 重复的 token 块抽成共享基类，两处只留差异覆盖

---

## 六、实施记录（2026-07-31，已落地）

按「A 深色墨玉 + B 冷灰极简」双主题路线完成实施，验证全绿（vitest 80/80、tsc、eslint、e2e 14/14）。

### 主题架构
- `ThemeConfig` 新增可选 `colorScheme: "light" | "dark"`；zod schema 默认 `"light"`，旧配置零迁移成本
- `normalizeThemeConfig` 对可选字段做 `?? ""` 防御；历史纸墨/蓝色配置仍自动迁移到新默认主题
- 前台 `.public-site` 与后台预览画布 `.admin-studio__canvas` 挂载 `data-color-scheme`，后台「外观」面板新增「外观模式」切换（浅色/深色），实时预览
- 后台工作台外壳暂保持浅色（内部有散落硬编码色值，深色化列为后续项），预览画布忠实还原所选主题

### B 冷灰极简（浅色默认主题）
- 默认主题去暖色：`#fafafa / #ffffff / #111113 / #6e6e73 / #e8e8ea`，印章红 `#e45435` 保留为唯一强调色
- `soft` 阴影扁平化（双层：贴地 5% + 12px/30px/-26px）；`--radius-panel` 16 → 12px，全站圆角收敛为 12/12/10
- globals.css 三处 token 块（admin-studio / 预览画布 / public-site）+ :root HSL + body + 登录页全部同步冷灰

### A 深色墨玉（深色主题）
- 新增 `[data-color-scheme="dark"]` token 覆盖层：`#0e0e11 / #17171c / #ece9e2`，强调色由 `color-mix(site-primary 74%, white)` 自动提亮、保留用户主题色色相
- 深色阴影体系（纯黑高透明度）、暗色网格 wash（ink 5% 线条）、`body:has()` 同步防 overscroll 露白边

### 快速改进
- 字号下限：约 30 处 <10px 标签统一抬到 0.625rem（intro 微缩视觉稿内的装饰文字除外）
- 全站按钮 `:active` 按压 scale(0.98)
- 衬线角色保留给签名文字（e2e 契约明确标题无衬线，不落地到标题）
- token 去重：`.admin-studio, .public-site` 共享基类（text-subtle / font-serif / radius-panel / radius-control / ease-out）

### 契约测试
- 新增 `tests/e2e/dark-scheme.spec.ts`：验证 data-color-scheme 切换后深色 token 在真实浏览器生效
- 既有设计契约断言同步更新（#fafafa、radius 12px）；标题无衬线、签名衬线契约不变

### 已知边界
- 若手工把配置 JSON 改回「历史纸墨九字段完全一致 + colorScheme: dark」，迁移逻辑会忽略 colorScheme 并重置为浅色默认主题；通过后台保存的配置不受影响（保存的是迁移后的新值）
- 深色下面包屑 sonner Toast 仍为浅色主题（瞬态元素，未处理）
