# AI 功能配置指南

Snaply 支持 **5 个主流 AI 提供商**实现自动图片打标功能。本文档详细介绍各提供商的配置方法。

## 📋 目录

- [功能概览](#功能概览)
- [Ollama（本地免费）](#ollama本地免费推荐)
- [硅基流动](#硅基流动推荐免费额度)
- [通义千问](#通义千问)
- [Google Gemini](#google-gemini)
- [智谱 ai](#智谱-ai)
- [常见问题](#常见问题)

---

## 功能概览

### 🎯 AI 自动打标功能

上传图片时，Snaply 会自动：
1. 📤 识别图片内容
2. 🏷️ 生成 2-5 个中文标签
3. 💾 自动保存到数据库
4. ⚡ 不阻塞上传流程

### 📊 提供商对比

| 提供商 | 类型 | 费用 | 速度 | 准确度 | 难度 |
|-------|------|------|------|--------|------|
| **Ollama** | 本地 | ✅ 免费 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ 简单 |
| **硅基流动** | 云 API | ⚡ 免费额度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐ 简单 |
| **通义千问** | 云 API | 💰 按量 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ 中等 |
| **Gemini** | 云 API | 💰 按量 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ 简单 |
| **智谱 AI** | 云 API | 💰 按量 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ 中等 |

---

## Ollama（本地免费-推荐）

### ✨ 特点
- ✅ **完全免费** - 无需 API Key
- 🔒 **隐私安全** - 数据不出本地
- 🚀 **简单易用** - 一键启动

### 💻 硬件要求

| 配置 | 最低 | 推荐 |
|-----|------|------|
| **CPU** | 4 核 | 8 核+ |
| **内存** | 8GB | 16GB+ |
| **磁盘** | 10GB | 20GB+ |
| **系统** | macOS/Linux/Windows(WSL2) | - |

### 📥 安装步骤

#### 1. 安装 Ollama

**macOS**:
```bash
brew install ollama
```

**Linux**:
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows**:
- 访问 [ollama.com](https://ollama.com/download)
- 下载 Windows 安装程序
- 运行安装

#### 2. 启动 Ollama 服务

```bash
# macOS/Linux
ollama serve &

# Windows
# Ollama 会自动作为服务启动
```

验证服务是否运行：
```bash
curl http://localhost:11434/api/tags
```

#### 3. 下载视觉模型

**LLaVA（推荐，平衡性能）**:
```bash
ollama pull llava
```

**Moondream（更轻量）**:
```bash
ollama pull moondream
```

**BakLLaVA（更准确）**:
```bash
ollama pull bakllava
```

#### 4. 在 Snaply 中配置

1. 打开 Snaply
2. 点击 "Config" → "AI" 标签
3. 填写配置：

| 字段 | 值 |
|-----|---|
| **启用 AI** | ✅ 勾选 |
| **AI 提供商** | `Ollama` |
| **Base URL** | `http://localhost:11434` |
| **模型** | `llava`（或其他下载的模型） |

4. 点击 "🧪 测试 AI 连接"
5. 测试通过后，点击 "保存设置"

### 🔧 高级配置

**使用自定义模型**:
```bash
# 列出已下载的模型
ollama list

# 使用其他模型
# 在 Snaply 配置中修改 "模型" 字段
```

**调整模型参数**:
```bash
# 创建 Modelfile
echo "FROM llava
PARAMETER temperature 0.7
PARAMETER num_ctx 4096" > Modelfile

# 创建自定义模型
ollama create my-llava -f Modelfile
```

---

## 硅基流动（推荐-免费额度）

### ✨ 特点
- 💰 **新用户赠送大量免费额度**
- 🚀 **响应速度快**
- 🇨🇳 **国产服务，稳定性高**
- 🎯 **专为中文优化**

### 📦 免费额度

- 新用户注册赠送 **100 元额度**
- 按模型计费，约 **0.001 元/张图片**
- 足够处理 **10 万张图片**

### 📝 注册步骤

1. **访问官网**
   - 打开 [https://cloud.siliconflow.cn](https://cloud.siliconflow.cn)

2. **注册账号**
   - 手机号注册
   - 实名认证（可选，但送更多额度）

3. **创建 API Key**
   - 进入「API 密钥」页面
   - 点击「新建密钥」
   - 复制 API Key（格式：`sk-xxxxxx`）

### ⚙️ Snaply 配置

1. 打开 Snaply → Config → AI
2. 填写配置：

| 字段 | 值 |
|-----|---|
| **启用 AI** | ✅ 勾选 |
| **AI 提供商** | `硅基流动` |
| **API Key** | `sk-xxxxxxxxxxxx` |
| **模型** | `THUDM/GLM-4.1V-9B-Thinking`（默认） |

3. 点击 "🧪 测试 AI 连接"
4. 点击 "保存设置"

### 🔧 推荐模型

| 模型 | 特点 | 价格 |
|-----|------|------|
| **THUDM/GLM-4.1V-9B-Thinking** | 默认，平衡 | ⭐⭐⭐ |
| **Qwen/Qwen2-VL-7B-Instruct** | 准确度高 | ⭐⭐⭐⭐ |
| **OpenGVLab/InternVL2-Llama3-76B** | 最准确 | ⭐⭐⭐⭐⭐ |

---

## 通义千问

### ✨ 特点
- 🏢 **阿里云出品，稳定性高**
- 🌍 **全球加速**
- 🎯 **中文理解优秀**
- 💰 **提供免费试用额度**

### 📝 注册步骤

1. **访问阿里云百炼**
   - 打开 [https://dashscope.console.aliyun.com/](https://dashscope.console.aliyun.com/)

2. **开通服务**
   - 阿里云账号登录
   - 开通「通义千问」服务
   - 实名认证（企业认证送更多额度）

3. **创建 API Key**
   - 进入「API-KEY 管理」
   - 创建新的 API-Key
   - 复制 Key（格式：`sk-xxxxxx`）

### ⚙️ Snaply 配置

| 字段 | 值 |
|-----|---|
| **启用 AI** | ✅ 勾选 |
| **AI 提供商** | `通义千问` |
| **API Key** | `sk-xxxxxxxxxxxx` |
| **模型** | `qwen-vl-max`（默认） |

### 🔧 推荐模型

| 模型 | 特点 | 价格 |
|-----|------|------|
| **qwen-vl-max** | 最新最强，推荐 | ¥0.005/张 |
| **qwen-vl-plus** | 性价比高 | ¥0.003/张 |
| **qwen-vl-v1** | 基础版 | ¥0.001/张 |

---

## Google Gemini

### ✨ 特点
- 🌐 **Google 最新视觉模型**
- 🚀 **全球 CDN 加速**
- 🎯 **多语言支持优秀**
- 💰 **提供免费层**

### 📝 注册步骤

1. **访问 Google AI Studio**
   - 打开 [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

2. **创建项目**
   - Google 账号登录
   - 创建新项目

3. **生成 API Key**
   - 点击「Create API Key」
   - 选择现有项目或创建新项目
   - 复制 API Key（格式：`AIzaSyxxxxxxxx`）

### ⚙️ Snaply 配置

| 字段 | 值 |
|-----|---|
| **启用 AI** | ✅ 勾选 |
| **AI 提供商** | `Google Gemini` |
| **API Key** | `AIzaSyxxxxxxxxxxxx` |
| **模型** | `gemini-1.5-flash`（默认） |

### 🔧 推荐模型

| 模型 | 特点 | 价格 |
|-----|------|------|
| **gemini-1.5-flash** | 速度快，推荐 | 免费/便宜 |
| **gemini-1.5-pro** | 更准确 | 按量计费 |
| **gemini-pro-vision** | 旧版，稳定 | 免费 |

### 📊 免费额度

- **gemini-1.5-flash**: 每天 1,500 次免费
- **gemini-1.5-pro**: 每天 15 次免费

---

## 智谱 AI

### ✨ 特点
- 🇨🇳 **国产 GLM-4V 模型**
- 🎯 **中文理解优秀**
- 🏢 **企业级稳定性**
- 💰 **新用户有免费额度**

### 📝 注册步骤

1. **访问智谱开放平台**
   - 打开 [https://open.bigmodel.cn/](https://open.bigmodel.cn/)

2. **注册账号**
   - 手机号注册
   - 实名认证

3. **获取 API Key**
   - 进入「API Keys」页面
   - 创建新的 API Key
   - 复制 Key

### ⚙️ Snaply 配置

| 字段 | 值 |
|-----|---|
| **启用 AI** | ✅ 勾选 |
| **AI 提供商** | `智谱 AI` |
| **API Key** | `xxxxxxxxxxxxxxxx` |
| **模型** | `glm-4v`（默认） |

### 🔧 推荐模型

| 模型 | 特点 | 价格 |
|-----|------|------|
| **glm-4v** | 最新版本，推荐 | ¥0.005/张 |
| **glm-4v-plus** | 增强版 | ¥0.01/张 |

---

## 批量重新打标

对历史无标签图片进行批量打标：

### 📋 步骤

1. **进入配置界面**
   - 打开 Snaply
   - 点击 "Config" → "AI"

2. **检查 AI 配置**
   - 确保 AI 已启用
   - 点击 "🧪 测试 AI 连接" 确认正常

3. **开始批量打标**
   - 点击 "🔄 重新打标无标签图片"
   - 系统会异步处理所有无标签图片
   - 显示处理进度

4. **查看结果**
   - 等待处理完成（约 3-5 秒/张）
   - 刷新画廊查看结果
   - 筛选 "无标签" 验证

### ⚠️ 注意事项

- 处理时间取决于图片数量和 AI 响应速度
- 不要重复点击按钮
- 处理过程中可以正常使用其他功能
- 建议在低峰期处理大量图片

---

## 常见问题

### Q1: AI 打标失败怎么办？

**A:** 按以下步骤排查：

1. **检查网络连接**
   ```bash
   # 云 API 需要访问外网
   ping api.siliconflow.cn
   ```

2. **验证 API Key**
   - 确认 Key 正确复制，没有多余空格
   - 检查 Key 是否过期或被禁用

3. **查看余额**
   - 登录提供商控制台查看余额
   - 充值或使用其他提供商

4. **测试连接**
   - 使用 Snaply 内置的测试功能
   - 查看详细错误信息

5. **检查后端日志**
   ```bash
   # 开发环境
   pnpm dev:server

   # 生产环境
   pm2 logs snaply
   ```

---

### Q2: Ollama 很慢怎么办？

**A:** 优化建议：

1. **换用更小的模型**
   ```bash
   ollama pull moondream  # 比 llava 更快
   ```

2. **增加系统资源**
   - 升级内存到 16GB+
   - 使用 SSD 存储

3. **调整模型参数**
   ```bash
   # 降低上下文长度
   PARAMETER num_ctx 2048
   ```

4. **使用云 API 替代**
   - 硅基流动：免费额度多
   - Gemini：有免费层

---

### Q3: AI 生成的标签不准确？

**A:** 改进方法：

1. **切换模型**
   - 更强的模型通常更准确
   - 尝试 `qwen-vl-max` 或 `glm-4v`

2. **优化提示词**（需修改源码）
   ```typescript
   // server/src/routes/images.ts
   const prompt = `请仔细分析图片，生成准确的中文标签...`
   ```

3. **手动补充标签**
   - AI 标签作为参考
   - 手动添加重要标签

4. **使用多个提供商**
   - 组合多个 AI 的结果
   - 取交集或并集

---

### Q4: 如何禁用 AI 自动打标？

**A:** 两种方式：

**方式 1: 通过界面**
1. Config → AI
2. 取消勾选 "启用 AI 自动打标"
3. 保存设置

**方式 2: 编辑配置文件**
```json
// server/data/config.json
{
  "ai": {
    "enabled": false
  }
}
```

---

### Q5: AI 打标会增加上传时间吗？

**A:** 不会！

Snaply 使用**异步处理**：
- 图片立即上传并显示
- AI 在后台打标
- 完成后自动更新标签

用户体验：上传 → 立即看到图片 → 几秒后标签出现

---

## 📚 相关文档

- [FAQ - 更多问题](FAQ)
- [API 文档](Image-API)
- [故障排查](Troubleshooting)

---

**最后更新**: 2026-01-20
