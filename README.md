<div align="center">
  <img src="img/logo.svg" alt="QingBlog Logo" width="120" height="120">
  <h1>QingBlog</h1>
  <p>一个基于 GitHub Issues 的自动化博客框架</p>

![License](https://img.shields.io/github/license/QingXuan2000/QingBlog?style=for-the-badge)
![GitHub stars](https://img.shields.io/github/stars/QingXuan2000/QingBlog?style=for-the-badge)
![GitHub issues](https://img.shields.io/github/issues/QingXuan2000/QingBlog?style=for-the-badge)
![GitHub Workflow](https://img.shields.io/github/actions/workflow/status/QingXuan2000/QingBlog/qingblog-build.yml?style=for-the-badge)

🌐 **在线演示**: [https://qingxuan2000.github.io/](https://qingxuan2000.github.io/)

</div>

## 📖 项目简介

QingBlog 是一个创新的博客框架，它将 GitHub Issues 作为内容管理系统，通过 GitHub Actions 自动将 Issue 转换为精美的博客文章页面。无需服务器、无需数据库，只需创建 Issue 即可发布博客。

## ✨ 核心特性

- 🚀 **零成本部署**：利用 GitHub Pages 免费托管
- 📝 **Issue 即文章**：在 GitHub Issues 中写作，自动同步到博客
- 🔄 **自动化流程**：创建/编辑 Issue 后自动构建部署
- 🎨 **现代化设计**：渐变背景、毛玻璃效果、卡片式布局
- 🌓 **深色/浅色主题**：支持一键切换主题
- 📱 **响应式设计**：适配桌面和移动设备
- 🏷️ **标签支持**：自动提取并显示 Issue 标签
- 💻 **代码高亮**：支持代码块语法高亮和复制功能
- 🔒 **作者验证**：仅指定作者的 Issue 才会被发布
- ✨ **动态标题**：页面动态切换标题

## 🛠️ 技术栈

### 前端

- **HTML5** - 语义化页面结构
- **CSS3** - 渐变、动画、毛玻璃效果
- **JavaScript** - 交互功能
- **Font Awesome** - 矢量图标库

### 自动化

- **Python 3.11+** - 核心处理脚本
- **GitHub Actions** - CI/CD 工作流
- **Python-Markdown** - Markdown 渲染（含扩展）
- **GitHub Pages** - 静态站点托管

## 📁 项目结构

```
QingBlog/
├── .github/
│   ├── workflows/
│   │   └── qingblog-build.yml    # GitHub Actions 工作流配置
│   └── scripts/
│       ├── check_issue.py        # 核心处理脚本
│       └── requirements.txt      # Python 依赖
│
├── css/
│   ├── QBLOG.css                 # 主样式文件（主题变量、布局）
│   ├── blogArticle.css           # 文章页样式
│   ├── font-awesome.css          # Font Awesome 图标
│   └── font-awesome.min.css      # Font Awesome 压缩版
│
├── js/
│   └── QBLOG.js                  # 前端交互脚本
│
├── pages/
│   └── blogArticle.html          # 文章页模板
│
├── fonts/                        # 字体文件
│   ├── FirstShine.otf
│   ├── This-July.ttf
│   └── FontAwesome.otf
│
├── img/                          # 图片资源
│   ├── Avatar.png
│   └── logo.svg                  # 项目 Logo
│
├── index.html                    # 首页
├── pages.html                    # 文章列表页
├── favicon.ico                   # 网站图标
├── LICENSE                       # GPL v3 许可证
└── README.md                     # 项目说明
```

## 🚀 快速开始

### 1. Fork 项目

Fork 本仓库到你的 GitHub 账号下。

### 2. 配置 GitHub Pages

1. 进入仓库 **Settings** → **Pages**
2. **Source** 选择 **Deploy from a branch**
3. **Branch** 选择 **main** 分支，文件夹选择 **/(root)**
4. 点击 **Save**

### 3. 配置工作流权限

1. 进入仓库 **Settings** → **Actions** → **General**
2. 找到 **Workflow permissions**
3. 选择 **Read and write permissions**
4. 点击 **Save**

### 4. 修改作者配置

编辑 [`.github/workflows/qingblog-build.yml`](.github/workflows/qingblog-build.yml) 中的 `TARGET_AUTHOR`：

```yaml
env:
  TARGET_AUTHOR: "你的GitHub用户名"
```

### 5. 发布第一篇文章

1. 打开你 Fork 的仓库
2. 进入 **Issues** 标签页
3. 点击 **New issue**
4. 填写标题和内容（支持 Markdown）
5. 添加标签（可选，最多显示3个）
6. 点击 **Submit new issue**

等待几秒后，GitHub Actions 会自动构建并部署，你的文章就会出现在博客中了！

## 🔧 工作原理

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  创建 Issue  │────▶│  GitHub Actions │────▶│ check_issue.py  │
│  或编辑     │     │  触发工作流      │     │   执行脚本       │
└─────────────┘     └─────────────────┘     └────────┬────────┘
                                                      │
            ┌────────────────────────────────────────┘
            ▼
   ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
   │  验证作者身份    │────▶│ Markdown 转 HTML │────▶│ 生成文章页面    │
   │ (TARGET_AUTHOR) │     │  (含代码高亮)    │     │ pages/{id}.html │
   └─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                             │
   ┌─────────────────────────────────────────────────────────┘
   ▼
   ┌─────────────────┐     ┌─────────────────┐
   │  更新首页卡片    │────▶│  自动提交更改   │────▶ GitHub Pages 部署
   │  更新列表页     │     │  git-auto-commit│
   └─────────────────┘     └─────────────────┘
```

### 详细流程

1. **触发**：当 Issue 被创建或编辑时，GitHub Actions 自动触发
2. **验证**：脚本检查 Issue 作者是否匹配 `TARGET_AUTHOR`
3. **转换**：使用 Python-Markdown 将 Markdown 转换为 HTML，支持：
   - 表格、脚注、目录
   - 代码高亮（带复制按钮）
   - 自动换行
4. **生成**：创建文章页面 `pages/{issue_id}.html`
5. **更新**：在 `index.html` 和 `pages.html` 中添加/更新文章卡片
6. **部署**：自动提交更改，GitHub Pages 自动部署

## 📝 Markdown 支持

QingBlog 支持丰富的 Markdown 语法：

- ✅ 标准 Markdown 语法（标题、列表、链接、图片等）
- ✅ 代码块（支持复制按钮）
- ✅ 表格
- ✅ 任务列表
- ✅ 脚注
- ✅ 目录（TOC）

## 🎨 自定义主题

主题配置位于 [`js/QBLOG.js`](js/QBLOG.js) 中的 `themes` 对象：

```javascript
const themes = {
  dark: {
    '--primary-color': '#388bff',
    '--text-color': 'rgba(255, 255, 255, 1)',
    '--bg-color': 'linear-gradient(180deg, rgba(10, 18, 28, 1), ...)',
    '--hero-bg-color': 'rgba(8, 16, 24, 1)',
    // ... 更多变量
  },
  light: {
    '--primary-color': '#388bff',
    '--text-color': 'rgba(44, 44, 44, 1)',
    '--bg-color': 'linear-gradient(180deg, rgba(233, 233, 237, 1), ...)',
    '--hero-bg-color': 'rgba(217, 218, 220, 1)',
    // ... 更多变量
  }
}
```

用户可以通过页面右上角的按钮切换深色/浅色主题。

## 🛡️ 安全说明

- 只有 `TARGET_AUTHOR` 指定的用户创建的 Issue 才会被发布
- 这防止了他人在你的博客上发表文章
- 建议将仓库设置为需要审核的 Fork 工作流

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 [GNU General Public License v3.0](LICENSE) 许可证。

## 👨‍💻 作者

- **QingXuanJun** - [GitHub](https://github.com/QingXuan2000)

## 🌟 致谢

- [Font Awesome](https://fontawesome.com/) - 图标库
- [GitHub](https://github.com/) - 托管和 CI/CD 服务
- [Python Markdown](https://python-markdown.github.io/) - Markdown 转换库

<div align="center" style="margin-top: 5rem;">
  <span style="color: #a1a1a1; font-size: 0.8em;">本README使用了AI进行文本润色😉</span>
</div>

