<div align="center">

  <!-- Logo/Title -->
  <h1>
    <pre>
    ____  __  ________   ____  __    ________
   / __ \/  |/  / ___/  / __ \/ /   /  _/ __ \
  / /_/ / /|_/ /\__ \  / /_/ / /    / // / / /
 / ____/ /  / /___/ / / ____/ /____/ // /_/ /
/_/   /_/  /_//____/ /_/   /_____/___/_____/
    </pre>
  </h1>

  <!-- Subtitle -->
  <h3>✨ Y2K 复古风图床 · AI 智能打标 · 现代化架构</h3>

  <!-- Badges -->
  <p>
    <a href="https://github.com/poboll/snaply/stargazers">
      <img src="https://img.shields.io/github/stars/poboll/snaply?style=flat-square" alt="Stars">
    </a>
    <a href="https://github.com/poboll/snaply/network/members">
      <img src="https://img.shields.io/github/forks/poboll/snaply?style=flat-square" alt="Forks">
    </a>
    <a href="https://github.com/poboll/snaply/issues">
      <img src="https://img.shields.io/github/issues/poboll/snaply?style=flat-square" alt="Issues">
    </a>
    <a href="./LICENSE">
      <img src="https://img.shields.io/github/license/poboll/snaply?style=flat-square" alt="License">
    </a>
    <img src="https://img.shields.io/badge/types-TypeScript-5.9-blue?style=flat-square&logo=typescript" alt="TypeScript">
    <img src="https://img.shields.io/badge/vue-3.5-42b883?style=flat-square&logo=vue.js&logoColor=white" alt="Vue 3">
  </p>

  <!-- Description -->
  <p>
    <strong>Snaply</strong> 是一款受 Windows 98/2000 启发的现代化图床服务，结合 Y2K 复古美学与前沿 AI 技术。
    <br>支持本地存储、S3/MinIO 对象存储，并提供 AI 自动打标、WebP 转换等企业级功能。
  </p>

  <!-- Links -->
  <p>
    <a href="#-特性"><strong>特性</strong></a> ·
    <a href="#-技术栈"><strong>技术栈</strong></a> ·
    <a href="#-快速开始"><strong>快速开始</strong></a> ·
    <a href="#-配置指南"><strong>配置</strong></a> ·
    <a href="#-ai-功能"><strong>AI 功能</strong></a> ·
    <a href="#-部署"><strong>部署</strong></a> ·
    <a href="#-api-文档"><strong>API</strong></a>
  </p>

  <!-- Demo Screenshot placeholder -->
  <p>
    <img src="https://via.placeholder.com/800x450/1a1a1a/42b883?text=Snaply+Demo" alt="Snaply Demo" width="800">
  </p>

</div>

---

## 📖 目录

- [✨ 特性](#-特性)
- [🛠 技术栈](#-技术栈)
- [🚀 快速开始](#-快速开始)
- [⚙️ 配置指南](#️-配置指南)
- [🤖 AI 功能](#-ai-功能)
- [📦 部署](#-部署)
- [🔌 API 文档](#-api-文档)
- [🤝 贡献](#-贡献)
- [📄 许可证](#-许可证)
- [🙏 致谢](#-致谢)

---

## ✨ 特性

### 🎨 Y2K 复古 UI
- **像素级还原** - 真实的 Windows 98/2000 视觉风格
- **经典交互** - 窗口拖拽、经典按钮、斜面边框效果
- **复古体验** - DOS 风格进度指示器、经典配色方案

### 📤 智能上传
- **拖拽上传** - 支持单文件/批量文件拖拽上传
- **多格式支持** - JPG、PNG、GIF、WebP 等主流格式
- **进度显示** - 实时上传进度与状态反馈
- **自动优化** - 可选 WebP 转换与缩略图生成

### 🗄️ 多存储后端
| 存储类型 | 说明 | 推荐场景 |
|---------|------|---------|
| **本地存储** | 文件系统存储，开箱即用 | 个人使用、轻量部署 |
| **Amazon S3** | AWS S3 云对象存储 | 生产环境、高可用需求 |
| **MinIO** | 自托管 S3 兼容存储 | 私有云、数据主权要求 |

### 🏷️ 智能管理
- **可视化画廊** - 网格视图展示所有图片
- **标签系统** - 手动打标 + AI 自动打标
- **快速复制** - 一键复制直链 / Markdown / Base64
- **批量操作** - 批量删除、批量重新打标

### 🤖 AI 自动打标
- **多提供商支持** - Ollama、硅基流动、通义千问、Gemini、智谱 AI
- **智能识别** - 自动识别图片内容并生成中文标签
- **批量处理** - 支持对历史无标签图片批量打标
- **灵活配置** - 支持自定义模型和参数

### ⚙️ 高级配置
- **自定义域名** - 支持配置 CDN 或自定义域名前缀
- **WebP 转换** - 自动转换为 WebP 格式以节省空间
- **图片压缩** - 上传时自动压缩，优化存储成本
- **访问控制** - 可配置 API Key 等安全策略

---

## 🛠 技术栈

### 前端技术
```yaml
框架:      Vue 3.5 (Composition API)
构建工具:   Vite 7.2
语言:      TypeScript 5.9
状态管理:    Pinia 3.0
样式方案:    Tailwind CSS 3.4
工具库:     @vueuse/core
```

### 后端技术
```yaml
运行时:     Node.js 18+
框架:      Hono 4.0 (轻量级 Web 框架)
语言:      TypeScript 5.3
图像处理:    Sharp 0.33
对象存储:    @aws-sdk/client-s3
环境变量:    dotenv
```

### 开发工具
```yaml
包管理器:     pnpm
 monorepo:   pnpm workspace
进程管理:     concurrently
类型检查:     vue-tsc
```

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **Git**

### 安装步骤

<details>
<summary><b>1. 克隆项目</b></summary>

```bash
git clone https://github.com/poboll/snaply.git
cd snaply
```

</details>

<details>
<summary><b>2. 安装依赖</b></summary>

```bash
# 安装所有依赖（前端 + 后端）
pnpm install

# 或分别安装
pnpm install           # 根目录
cd src && pnpm install # 前端
cd ../server && pnpm install # 后端
```

</details>

<details>
<summary><b>3. 启动开发服务器</b></summary>

```bash
pnpm dev
```

这将同时启动：
- **前端**: http://localhost:5173
- **后端**: http://localhost:3000

</details>

<details>
<summary><b>4. 构建生产版本</b></summary>

```bash
pnpm build
```

构建产物将输出到 `dist/` 目录。

</details>

### 目录结构

```
snaply/
├── src/                    # 前端源码
│   ├── components/         # Vue 组件
│   │   ├── ConfigView.vue  # 配置界面
│   │   ├── GalleryView.vue # 图片画廊
│   │   └── UploadView.vue  # 上传界面
│   ├── stores/             # Pinia 状态管理
│   ├── api.ts              # API 客户端
│   └── main.ts             # 入口文件
├── server/                 # 后端源码
│   ├── src/
│   │   ├── routes/         # API 路由
│   │   ├── storage/        # 存储适配器
│   │   └── utils/          # 工具函数
│   ├── data/               # 数据目录（运行时生成）
│   ├── uploads/            # 本地存储目录
│   └── package.json
├── public/                 # 静态资源
├── Dockerfile              # Docker 镜像
├── docker-compose.yml      # Docker Compose 配置
└── README.md
```

---

## ⚙️ 配置指南

### 基础配置

在应用界面点击 **"Config"** 按钮，打开配置面板：

#### 存储设置

| 字段 | 说明 | 默认值 |
|-----|------|-------|
| 存储类型 | `local` / `s3` / `minio` | `local` |
| 上传目录 | 本地存储路径 | `./uploads` |
| 公开 URL | CDN 或自定义域名前缀 | 空 |

#### S3/MinIO 配置

```yaml
存储桶名称:     my-bucket
区域:          us-east-1
访问密钥:      AKIAIOSFODNN7EXAMPLE
秘密密钥:      wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
端点 URL:      https://s3.amazonaws.com (S3) 或 http://localhost:9000 (MinIO)
公开 URL:      https://cdn.example.com
```

#### 高级设置

| 选项 | 说明 | 默认值 |
|-----|------|-------|
| WebP 转换 | 自动转换为 WebP 格式 | 关闭 |
| 保留 EXIF | 保留图片元数据 | 关闭 |
| 最大文件大小 | 单文件大小限制（MB） | 10 |

---

## 🤖 AI 功能

### 支持的 AI 提供商

| 提供商 | 类型 | 特点 | 费用 |
|-------|------|------|------|
| **Ollama** | 本地部署 | 完全免费、隐私安全 | 免费 |
| **硅基流动** | 云 API | 新用户免费额度充足 | 按量计费 |
| **通义千问** | 云 API | 阿里云出品、稳定性高 | 按量计费 |
| **Google Gemini** | 云 API | Google 最新视觉模型 | 按量计费 |
| **智谱 AI** | 云 API | 国产 GLM-4V 模型 | 按量计费 |

### 配置 AI 功能

<details>
<summary><b>Ollama（推荐 - 本地免费）</b></summary>

1. **安装 Ollama**

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh
```

2. **下载视觉模型**

```bash
ollama pull llava
# 或
ollama pull moondream
```

3. **配置 Snaply**

- 提供商: `Ollama`
- Base URL: `http://localhost:11434`
- 模型: `llava`（默认）

</details>

<details>
<summary><b>硅基流动</b></summary>

1. **获取 API Key**

访问 [硅基流动控制台](https://cloud.siliconflow.cn/) 注册并获取 API Key

2. **配置 Snaply**

- 提供商: `硅基流动`
- API Key: `sk-xxxxxxxx`
- 模型: `THUDM/GLM-4.1V-9B-Thinking`（默认）

</details>

<details>
<summary><b>通义千问</b></summary>

1. **获取 API Key**

访问 [阿里云百炼平台](https://dashscope.console.aliyun.com/) 开通服务

2. **配置 Snaply**

- 提供商: `通义千问`
- API Key: `sk-xxxxxxxx`
- 模型: `qwen-vl-max`（默认）

</details>

<details>
<summary><b>Google Gemini</b></summary>

1. **获取 API Key**

访问 [Google AI Studio](https://aistudio.google.com/app/apikey) 创建 API Key

2. **配置 Snaply**

- 提供商: `Google Gemini`
- API Key: `AIzaSyXXXXXXXX`
- 模型: `gemini-1.5-flash`（默认）

</details>

<details>
<summary><b>智谱 AI</b></summary>

1. **获取 API Key**

访问 [智谱开放平台](https://open.bigmodel.cn/) 注册并获取 API Key

2. **配置 Snaply**

- 提供商: `智谱 AI`
- API Key: `xxxxxxxx`
- 模型: `glm-4v`（默认）

</details>

### 批量重新打标

对历史无标签图片进行批量打标：

1. 进入 **Config** → **AI** 标签
2. 点击 **"🔄 重新打标无标签图片"** 按钮
3. 系统将异步处理所有无标签图片
4. 处理完成后刷新画廊查看结果

---

## 📦 部署

### Docker 部署（推荐）

<details>
<summary><b>使用 Docker Compose</b></summary>

```bash
# 克隆项目
git clone https://github.com/poboll/snaply.git
cd snaply

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

访问 http://localhost:3000

</details>

<details>
<summary><b>手动构建</b></summary>

```bash
# 构建镜像
docker build -t snaply:latest .

# 运行容器
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/data:/app/data \
  --name snaply \
  snaply:latest
```

</details>

### Vercel / Railway 部署

<details>
<summary><b>Railway</b></summary>

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/snaply)

1. 点击上方链接
2. Fork 本仓库到您的 GitHub
3. 在 Railway 中导入项目
4. 配置环境变量（如需）
5. 部署完成！

</details>

### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name img.example.com;

    # 前端静态文件
    location / {
        proxy_pass http://localhost:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API 接口
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 上传的图片
    location /uploads/ {
        proxy_pass http://localhost:3000/uploads/;
        proxy_set_header Host $host;
    }
}
```

---

## 🔌 API 文档

### 基础信息

- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json` 或 `multipart/form-data`

### 端点列表

#### 图片管理

| 方法 | 端点 | 说明 |
|-----|------|------|
| GET | `/images` | 获取所有图片 |
| POST | `/images/upload` | 上传图片 |
| DELETE | `/images/:id` | 删除图片 |
| POST | `/images/:id/tags` | 添加标签 |
| DELETE | `/images/:id/tags/:tag` | 删除标签 |
| POST | `/images/retag-untagged` | 批量重新打标 |

#### 配置管理

| 方法 | 端点 | 说明 |
|-----|------|------|
| GET | `/config` | 获取配置 |
| PUT | `/config` | 更新配置 |
| POST | `/config/test` | 测试存储连接 |
| POST | `/config/test-ai` | 测试 AI 连接 |

### 请求示例

<details>
<summary><b>上传图片</b></summary>

```bash
curl -X POST http://localhost:3000/api/images/upload \
  -F "files=@/path/to/image.jpg" \
  -F "tags=screenshot,work"
```

响应：

```json
{
  "success": true,
  "data": [
    {
      "id": "a1B2c3D4e5",
      "name": "image.jpg",
      "url": "https://img.example.com/uploads/a1B2c3D4e5.jpg",
      "size": "1.2 MB",
      "date": "2026/01/20",
      "dimensions": "1920x1080",
      "tags": ["screenshot", "work"]
    }
  ]
}
```

</details>

<details>
<summary><b>获取所有图片</b></summary>

```bash
curl http://localhost:3000/api/images
```

响应：

```json
{
  "success": true,
  "data": [
    {
      "id": "a1B2c3D4e5",
      "name": "image.jpg",
      "url": "/uploads/a1B2c3D4e5.jpg",
      "size": "1.2 MB",
      "date": "2026/01/20",
      "dimensions": "1920x1080",
      "tags": ["screenshot"]
    }
  ]
}
```

</details>

---

## 🤝 贡献

我们欢迎所有形式的贡献！

### 开发流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: 某个很酷的功能'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 提交规范

我们遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```bash
feat: 新功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具链更新
```

### 代码风格

- 使用 **TypeScript** 编写所有代码
- 遵循 **ESLint** 规则
- 组件使用 **Vue 3 Composition API**
- 后端使用 **Hono** 框架规范

---

## 📄 许可证

本项目采用 [MIT](./LICENSE) 许可证。

```
MIT License

Copyright (c) 2025 在虎 (poboll)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 🙏 致谢

感谢以下开源项目：

- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Hono](https://hono.dev/) - 轻量级 Web 框架
- [Sharp](https://sharp.pixelplumbing.com/) - 高性能图像处理库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Pinia](https://pinia.vuejs.org/) - Vue 状态管理库

---

<div align="center">

  **如果这个项目对您有帮助，请给一个 ⭐ Star 支持一下！**

  [⬆ 返回顶部](#-snaply-在虎图床)

</div>
