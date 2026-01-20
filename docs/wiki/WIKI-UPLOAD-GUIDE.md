# GitHub Wiki 上传指南

本文档介绍如何将创建的 Wiki 文档上传到 GitHub。

## 📚 已创建的 Wiki 页面

位置：`docs/wiki/` 目录

| 文件名 | 页面标题 | 说明 |
|-------|---------|------|
| `Home.md` | 首页 | Wiki 导航和目录 |
| `Installation.md` | 安装指南 | 环境配置和安装步骤 |
| `Getting-Started.md` | 快速上手 | 5 分钟快速入门教程 |
| `FAQ.md` | 常见问题 | 23 个常见问题解答 |
| `AI-Setup.md` | AI 功能配置 | 5 个 AI 提供商详细教程 |
| `Docker-Deployment.md` | Docker 部署 | Docker/Docker Compose 部署 |

---

## 🚀 方法 1: 通过 GitHub 网页上传（推荐）

### 步骤 1: 启用 Wiki

1. 访问仓库: https://github.com/poboll/snaply
2. 点击顶部 **"Settings"** 标签
3. 向下滚动到 **"Features"** 部分
4. 勾选 **"Wikis"**

### 步骤 2: 创建首页

1. 点击顶部 **"Wiki"** 标签
2. 点击 **"Create the first page"**
3. 标题填写: `Home`
4. 打开 `docs/wiki/Home.md`，复制全部内容
5. 粘贴到编辑器
6. 点击 **"Save Page"**

### 步骤 3: 创建其他页面

对每个 Wiki 页面重复以下步骤：

1. 在 Wiki 页面点击 **"New Page"**
2. 标题填写页面名（如 `Installation`）
3. 复制对应的 `.md` 文件内容
4. 粘贴到编辑器
5. 点击 **"Save Page"**

**需要创建的页面**:
- Installation
- Getting-Started
- FAQ
- AI-Setup
- Docker-Deployment

---

## 🔧 方法 2: 通过 Git 克隆上传（高级）

### 步骤 1: 克隆 Wiki 仓库

```bash
# GitHub Wiki 实际上是一个独立的 Git 仓库
git clone https://github.com/poboll/snaply.wiki.git
cd snaply.wiki
```

### 步骤 2: 复制文档

```bash
# 从项目目录复制 Wiki 文档
cp ../snaply/docs/wiki/*.md .

# 重命名文件（GitHub Wiki 不需要 .md 扩展名）
# 如果您的文件已经是 .md，可以保留
```

### 步骤 3: 提交并推送

```bash
# 添加所有文件
git add .

# 提交
git commit -m "docs: 创建完整的项目 Wiki 文档

- 添加首页导航
- 添加安装指南
- 添加快速上手教程
- 添加 FAQ（23个问题）
- 添加 AI 配置指南（5个提供商）
- 添加 Docker 部署指南
"

# 推送到 GitHub
git push origin master
```

---

## 🎨 方法 3: 使用 GitHub CLI（最快）

```bash
# 安装 GitHub CLI（如果未安装）
brew install gh

# 登录
gh auth login

# 为每个页面创建 Wiki 页面
cd docs/wiki

# 首页
gh wiki create Home < Home.md

# 其他页面
gh wiki create Installation < Installation.md
gh wiki create Getting-Started < Getting-Started.md
gh wiki create FAQ < FAQ.md
gh wiki create AI-Setup < AI-Setup.md
gh wiki create Docker-Deployment < Docker-Deployment.md
```

---

## ✅ 验证上传

访问 Wiki 页面验证：
https://github.com/poboll/snaply/wiki

您应该看到：
- ✅ 侧边栏导航
- ✅ 所有页面链接
- ✅ 页面内容正确显示
- ✅ 内部链接正常工作

---

## 🔗 内部链接说明

Wiki 页面之间的链接格式：

```markdown
[安装指南](Installation)
[快速上手](Getting-Started)
[常见问题](FAQ)
```

GitHub Wiki 会自动处理这些链接。

---

## 📝 后续维护

### 更新页面

1. **通过网页**: 点击页面右上角 "Edit" 按钮
2. **通过 Git**: 
   ```bash
   cd snaply.wiki
   git pull
   # 编辑文件
   git add .
   git commit -m "docs: 更新文档"
   git push
   ```

### 添加新页面

1. 在 `docs/wiki/` 创建新的 `.md` 文件
2. 使用上述方法上传

### 删除页面

1. **通过网页**: 点击页面右上角 "Delete Page"
2. **通过 Git**:
   ```bash
   cd snaply.wiki
   git rm PageName.md
   git commit -m "docs: 删除页面"
   git push
   ```

---

## 🎯 Wiki 首页优化

建议在首页添加：

1. **快速链接**
   ```markdown
   [🚀 快速开始](Getting-Started) | [📖 完整文档](Home) | [❓ 常见问题](FAQ)
   ```

2. **项目 Badges**
   ```markdown
   ![Stars](https://img.shields.io/github/stars/poboll/snaply)
   ![License](https://img.shields.io/github/license/poboll/snaply)
   ```

3. **目录导航**
   - 已在 `Home.md` 中包含

---

## 📚 Wiki 页面列表

完整的 Wiki 结构：

```
snaply.wiki/
├── Home.md                      # 📖 Wiki 首页
├── Installation.md              # 🔧 安装指南
├── Getting-Started.md           # 🚀 快速上手
├── FAQ.md                       # ❓ 常见问题（23个）
├── AI-Setup.md                  # 🤖 AI 功能配置
├── Docker-Deployment.md         # 🐳 Docker 部署
├── Basic-Configuration.md       # ⚙️ 基础配置（TODO）
├── Advanced-Configuration.md    # ⚙️ 高级配置（TODO）
├── Production.md                # 📦 生产环境部署（TODO）
├── API-Overview.md              # 🔌 API 总览（TODO）
├── Image-API.md                 # 📷 图片管理 API（TODO）
├── Troubleshooting.md           # 🔍 故障排查（TODO）
└── Contributing.md              # 🤝 贡献指南（TODO）
```

---

## 🎊 完成！

现在您的 GitHub Wiki 已经包含了完整的项目文档！

访问链接：
- **Wiki 首页**: https://github.com/poboll/snaply/wiki
- **直接分享**: https://github.com/poboll/snaply/wiki/Getting-Started

---

**提示**: 
- Wiki 支持 Markdown 语法
- 可以添加图片（上传到 Wiki 或使用外链）
- 支持代码高亮
- 自动生成侧边栏目录

**下一步**: 
- 在 README.md 中添加 Wiki 链接
- 定期更新文档
- 收集用户反馈改进文档
