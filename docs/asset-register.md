# 素材清单

更新时间：2026-08-01
适用范围：公开主页、后台和分享元数据

| 素材 | 用途 | 规格与处理 | 回退 |
| --- | --- | --- | --- |
| `public/images/avatar/da21500f-a01a-42a4-b45c-1968e7f68336.png` | 当前个人头像 | 1200×1200 PNG，按头像容器裁切 | 可在后台上传替换 |
| `public/default-avatar.svg` | 默认头像 | 512×512 SVG | 头像地址为空时使用 |
| `assets/source/og.svg` | 社交分享图原稿 | 1200×630；运行 `npm run generate:og` 生成 PNG | 生成失败时保留现有 `public/og.png` |
| `public/og.png` | 默认 Open Graph / Twitter 图片 | 1200×630、调色 PNG | 自定义 SEO 图片优先 |
| `public/brand-seal.png` | 导航、欢迎页和后台品牌装饰 | 256×256 透明 PNG | 加载失败不影响文字身份和操作 |
| `public/images/hero/qa-workbench-v2.webp` | 欢迎页个人札记主视觉 | 1200×1500 WebP，约 200KB；内置 imagegen 生成后使用 Sharp 压缩，`next/image` 预载 | 后台自定义 `introImage` 优先 |
| Lucide 图标 | 界面操作图标 | SVG 组件 | 纯装饰图标使用 `aria-hidden` |
| Plus Jakarta Sans、JetBrains Mono | UI 与标签字体 | 通过 Next.js 字体流程加载 | `display: swap`，失败时回退系统字体 |
| 管理员上传图片 | 头像、卡片、照片和媒体封面 | 后台上传并按模块规则裁切 | 信息图片填写替代文本 |

## 已清理素材

- 删除 6 张未被代码或配置引用的 `public/images/core-skill-covers/*.png`，合计约 10.5MB；历史版本可从 Git 恢复。
- 旧 `public/og.png` 已由纸墨主题源文件重新生成，体积由约 1.2MB 降至约 40KB。

## 媒体交付规则

1. 图片和视频定义展示比例、裁切方式、响应式尺寸和加载失败回退。
2. 源文件放入明确的 source 目录，交付图按实际尺寸压缩。
3. 信息图片提供替代文本，装饰图片使用空替代文本。
4. 无引用导出、缓存和重复版本不进入仓库。
