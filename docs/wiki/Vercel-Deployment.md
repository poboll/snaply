# Vercel 部署指南

本文档详细介绍如何将 Snaply 部署到 Vercel 平台。

## ⚠️ 重要提示

**Snaply 需要持久化存储和文件上传功能**，Vercel 的 Serverless 环境有以下限制：

- ❌ 文件系统是**只读的**
- ❌ 无法持久化存储上传的图片
- ❌ 每个请求有 **10 秒**执行时间限制
- ❌ 内存限制（仅 1GB）

**推荐方案**：
- ✅ 使用 **S3/MinIO** 存储图片
- ✅ 使用 Vercel 托管前端
- ✅ API 服务部署到 **Railway** 或 **Render**

---

## 📋 部署架构

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Vercel    │     │  Railway    │     │  AWS S3    │
│  (前端)     │────▶│  (后端)     │────▶│  (存储)     │
│             │     │             │     │             │
│  静态文件   │     │  API 服务   │     │  图片存储   │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## 🚀 部署步骤

### 方案 1: 只部署前端到 Vercel（推荐）

#### 第一步：准备项目

```bash
# 克隆项目
git clone https://github.com/poboll/snaply.git
cd snaply
```

#### 第二步：配置 S3 存储

1. **创建 S3 存储桶**
   - 登录 AWS 控制台
   - 进入 S3 服务
   - 创建存储桶（如 `snaply-images`）
   - 设置权限为「公开读取」

2. **获取 AWS 凭证**
   - 进入 IAM 控制台
   - 创建访问密钥
   - 记录 `Access Key` 和 `Secret Key`

3. **配置 Snaply**
   - 将以下环境变量配置到后端服务

#### 第三步：构建前端

```bash
# 安装依赖
pnpm install

# 构建前端
pnpm build:client
```

#### 第四步：部署到 Vercel

**方式 1: 通过 Vercel CLI**

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

**方式 2: 通过 GitHub 集成**

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "New Project"
3. 导入您的 GitHub 仓库
4. 配置项目：
   - **Framework Preset**: Vite
   - **Build Command**: `pnpm build:client`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install`
5. 点击 "Deploy"

#### 第五步：配置环境变量

在 Vercel 项目设置中添加：

| 变量名 | 值 | 说明 |
|-------|---|------|
| `VITE_API_URL` | `https://your-backend.railway.app` | 后端 API 地址 |

#### 第六步：更新 API 配置

在前端代码中修改 API 地址：

```typescript
// src/api.ts
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
```

---

### 方案 2: 使用 Vercel Edge Functions

#### 第一步：创建 Vercel 配置

在项目根目录创建 `vercel.json`：

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/server/index.ts"
    }
  ]
}
```

#### 第二步：调整项目结构

将后端代码移动到 `api/` 目录：

```bash
# 创建 api 目录
mkdir -p api

# 复制后端代码
cp -r server/src api/
cp server/package.json api/
cp server/tsconfig.json api/
```

#### 第三步：更新 Vercel 配置

```json
{
  "builds": [
    {
      "src": "api/package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.ts"
    }
  ]
}
```

---

## 🔧 配置 Railway 后端

### 第一步：创建 Railway 项目

1. 访问 [railway.app](https://railway.app)
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择您的 Snaply 仓库

### 第二步：配置环境变量

在 Railway 项目中添加：

| 变量名 | 值 | 说明 |
|-------|---|------|
| `NODE_ENV` | `production` | 生产环境 |
| `PORT` | `3000` | 服务端口 |
| `AWS_ACCESS_KEY_ID` | `your-key` | AWS 访问密钥 |
| `AWS_SECRET_ACCESS_KEY` | `your-secret` | AWS 密钥 |
| `AWS_REGION` | `us-east-1` | AWS 区域 |
| `S3_BUCKET_NAME` | `snaply-images` | S3 存储桶名 |

### 第三步：配置持久化存储

Railway 提供持久化存储卷：

1. 在 Railway 项目中
2. 点击 "Volumes"
3. 创建新卷：`data`
4. 挂载到 `/app/data`

---

## 📝 完整部署流程

### 前端部署到 Vercel

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
cd /path/to/snaply
vercel --prod

# 4. 记录部署 URL
# 例如: https://snaply.vercel.app
```

### 后端部署到 Railway

```bash
# 1. 安装 Railway CLI
npm i -g @railway/cli

# 2. 登录
railway login

# 3. 初始化项目
railway init

# 4. 设置环境变量
railway variables set NODE_ENV production
railway variables set PORT 3000
railway variables set AWS_ACCESS_KEY_ID your-key
railway variables set AWS_SECRET_ACCESS_KEY your-secret
railway variables set S3_BUCKET_NAME snaply-images

# 5. 部署
railway up

# 6. 记录部署 URL
# 例如: https://snaply-backend.railway.app
```

---

## 🔗 连接前端和后端

### 更新前端配置

```typescript
// src/api.ts
const BASE_URL = 'https://snaply-backend.railway.app'
```

或在 Vercel 环境变量中设置：

```
VITE_API_URL=https://snaply-backend.railway.app
```

### 验证部署

```bash
# 测试后端
curl https://snaply-backend.railway.app/health

# 测试前端
# 访问 https://snaply.vercel.app
```

---

## 💰 成本估算

### Vercel（Hobby 免费计划）

- ✅ **免费额度**
  - 100GB 带宽/月
  - 无限项目
  - 自动 HTTPS
  - 全球 CDN

- 💰 **Pro 计划**：$20/月
  - 1TB 带宽
  - 无限部署
  - 团队协作

### Railway（免费试用）

- ✅ **免费额度**
  - $5 免费额度/月
  - 512MB RAM
  - 0.5vCPU

- 💰 **付费计划**：按使用量计费
  - $0.000238/GB 内存秒
  - 约 $5-20/月（小流量）

### AWS S3 存储

- 💰 **存储成本**：$0.023/GB/月
- 💰 **请求成本**：
  - PUT: $0.005/1000 次
  - GET: $0.0004/1000 次
- **估算**：1000 张图片约 $1-5/月

---

## 📊 性能对比

| 平台 | 优势 | 劣势 |
|-----|------|------|
| **Vercel** | 极速部署、全球 CDN、免费额度 | 10秒超时、无持久化 |
| **Railway** | 支持持久化、灵活配置 | 价格较高 |
| **Docker/自建** | 完全控制、无限定制 | 需要运维、成本高 |

---

## ✅ 最佳实践

### 1. 使用 CDN 加速

```javascript
// 在 S3 配置中启用 CloudFront
const config = {
  s3: {
    publicUrl: 'https://cdn.example.com'  // CloudFront URL
  }
}
```

### 2. 启用缓存

```nginx
# Vercel 自动缓存静态资源
# 在 vercel.json 中配置
{
  "headers": [
    {
      "source": "/uploads/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 3. 监控和日志

- **Vercel Analytics**: 内置分析
- **Railway Metrics**: 实时监控
- **Sentry**: 错误追踪

---

## 🐛 故障排查

### 问题 1: Vercel 部署失败

```bash
# 查看构建日志
vercel logs

# 常见问题
- 依赖安装失败 → 检查 package.json
- 构建超时 → 优化构建脚本
- 内存不足 → 升级到 Pro 计划
```

### 问题 2: API 请求失败

```bash
# 检查 CORS 配置
# server/src/index.ts
app.use('*', cors({
  origin: 'https://snaply.vercel.app',
  credentials: true
}))
```

### 问题 3: 图片上传失败

```bash
# 检查 S3 权限
aws s3 ls s3://snaply-images

# 检查环境变量
railway variables list
```

---

## 📚 相关资源

- [Vercel 文档](https://vercel.com/docs)
- [Railway 文档](https://docs.railway.app)
- [AWS S3 教程](https://docs.aws.amazon.com/s3/)
- [云服务器部署](Cloud-Server-Deployment)

---

## 🎯 推荐方案对比

| 方案 | 难度 | 成本 | 推荐度 |
|-----|------|------|--------|
| **Vercel + Railway + S3** | ⭐⭐⭐ | $10-30/月 | ⭐⭐⭐⭐⭐ |
| **Vercel (仅前端) + Railway** | ⭐⭐ | $5-20/月 | ⭐⭐⭐⭐ |
| **云服务器 (单机)** | ⭐⭐⭐ | $70/月 | ⭐⭐⭐ |
| **Docker 自建** | ⭐⭐⭐⭐ | $50-100/月 | ⭐⭐ |

---

**最后更新**: 2026-01-20
