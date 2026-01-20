# 安装指南

本文档将指导您完成 Snaply 的安装过程，包括环境准备、依赖安装和项目配置。

## 📋 环境要求

### 必需软件

| 软件 | 最低版本 | 推荐版本 | 说明 |
|-----|---------|---------|------|
| **Node.js** | 18.0.0 | 20.x LTS | JavaScript 运行时 |
| **pnpm** | 8.0.0 | 9.x | 快速、节省磁盘空间的包管理器 |
| **Git** | 2.0 | 最新版 | 版本控制系统 |

### 可选软件（AI 功能）

| 软件 | 用途 | 说明 |
|-----|------|------|
| **Ollama** | 本地 AI 推理 | 免费本地部署，无需 API Key |
| **Docker** | 容器化部署 | 一键部署，环境隔离 |

---

## 🔧 安装步骤

### 步骤 1: 安装 Node.js

#### macOS

```bash
# 使用 Homebrew 安装
brew install node@20

# 验证安装
node --version
npm --version
```

#### Linux (Ubuntu/Debian)

```bash
# 使用 NodeSource 仓库安装
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

#### Windows

1. 访问 [nodejs.org](https://nodejs.org/)
2. 下载 LTS 版本安装程序
3. 运行安装程序，按提示完成安装
4. 重启命令行窗口
5. 验证安装：
   ```cmd
   node --version
   npm --version
   ```

---

### 步骤 2: 安装 pnpm

```bash
# 使用 npm 安装 pnpm
npm install -g pnpm

# 验证安装
pnpm --version
```

**或使用 Corepack（Node.js 16.10+）**：

```bash
corepack enable
corepack prepare pnpm --activate
```

---

### 步骤 3: 克隆项目

```bash
# 使用 Git 克隆仓库
git clone https://github.com/poboll/snaply.git
cd snaply

# 或下载 ZIP 压缩包
# 访问 https://github.com/poboll/snaply/archive/refs/heads/main.zip
# 解压后进入目录
```

---

### 步骤 4: 安装依赖

Snaply 使用 **pnpm workspace** 管理多包依赖。

#### 方法 1: 一键安装（推荐）

```bash
# 在项目根目录执行
pnpm install
```

这将自动安装：
- ✅ 根目录依赖（前端）
- ✅ server 目录依赖（后端）

#### 方法 2: 分别安装

```bash
# 安装前端依赖
pnpm install

# 安装后端依赖
cd server
pnpm install

# 返回根目录
cd ..
```

---

### 步骤 5: 验证安装

```bash
# 检查 node_modules 是否生成
ls -la node_modules/
ls -la server/node_modules/

# 尝试启动开发服务器
pnpm dev
```

如果看到以下输出，说明安装成功：

```
  VITE v7.2.4  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🐳 Docker 安装（可选）

如果您 prefer 使用 Docker：

### 安装 Docker

#### macOS

```bash
brew install --cask docker
# 启动 Docker Desktop
```

#### Linux

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

#### Windows

访问 [docker.com](https://www.docker.com/products/docker-desktop/) 下载安装。

---

### 使用 Docker 启动 Snaply

```bash
# 克隆项目
git clone https://github.com/poboll/snaply.git
cd snaply

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f snaply
```

访问 http://localhost:3000

---

## 🔍 故障排查

### 问题 1: pnpm install 失败

**症状**：
```
ERR_PNPM_REGISTRIES_  Invalid registry URL
```

**解决方案**：

```bash
# 清除缓存
pnpm store prune

# 使用淘宝镜像
pnpm config set registry https://registry.npmmirror.com

# 重新安装
pnpm install
```

---

### 问题 2: Sharp 安装失败

**症状**：
```
npm ERR! sharp: Installation failed
```

**解决方案**：

```bash
# 安装 Sharp 依赖
# macOS
brew install vips

# Ubuntu/Debian
sudo apt-get install libvips-dev

# Windows
# 下载预编译的二进制文件，Sharp 会自动处理
```

---

### 问题 3: 端口被占用

**症状**：
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案**：

```bash
# 查找占用端口的进程
# macOS/Linux
lsof -i :3000
kill -9 <PID>

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

或修改端口：

```bash
# 编辑 server/src/index.ts
const port = process.env.PORT || 3001  # 修改为其他端口
```

---

## ✅ 下一步

安装完成后，继续阅读：
- 📖 [快速上手指南](Getting-Started)
- ⚙️ [基础配置](Basic-Configuration)
- 🤖 [AI 功能配置](AI-Setup)

---

## 📞 获取帮助

如果安装过程中遇到问题：

1. 查看 [故障排查](Troubleshooting) 文档
2. 搜索 [Issues](https://github.com/poboll/snaply/issues)
3. 提交新的 Issue，包含：
   - 操作系统版本
   - Node.js 版本 (`node --version`)
   - pnpm 版本 (`pnpm --version`)
   - 完整的错误信息

---

**最后更新**: 2026-01-20
