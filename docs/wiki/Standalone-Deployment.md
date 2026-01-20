# 独立运行版部署指南

Snaply 支持打包成**独立可执行文件**，无需安装 Node.js 环境，开箱即用！

## 🎯 优势

相比传统部署方式：

| 特性 | 传统部署 | 独立运行版 |
|-----|---------|-----------|
| **Node.js** | ✅ 需要安装 | ❌ 无需安装 |
| **依赖安装** | ✅ 需要 pnpm install | ❌ 无需安装 |
| **部署速度** | 5-10 分钟 | **30 秒** |
| **文件大小** | ~200MB | ~80MB |
| **运行速度** | 正常 | 正常 |

---

## 📦 构建独立版本

### 第一步：安装打包工具

```bash
cd /Users/Apple/Downloads/图床/snaply

# 安装 pkg
cd server
pnpm add -D pkg
cd ..
```

### 第二步：执行打包脚本

```bash
# 添加执行权限
chmod +x build-standalone.sh

# 开始打包（需要 3-5 分钟）
./build-standalone.sh
```

打包过程会：
1. ✅ 构建前端（Vue + Vite）
2. ✅ 构建后端（TypeScript）
3. ✅ 打包三个平台的二进制文件
   - `snaply-linux` - Linux x64
   - `snaply-macos` - macOS x64
   - `snaply-win.exe` - Windows x64
4. ✅ 复制前端静态文件
5. ✅ 创建配置文件模板
6. ✅ 生成启动脚本

### 第三步：查看构建产物

```bash
ls -lh release/

# 输出示例：
# snaply-linux       (~60MB) - Linux 可执行文件
# snaply-macos       (~60MB) - macOS 可执行文件
# snaply-win.exe     (~60MB) - Windows 可执行文件
# start.sh           - Linux/macOS 启动脚本
# start.bat          - Windows 启动脚本
# deploy.sh          - 服务器一键部署脚本
# dist/              - 前端静态文件
# data/              - 配置文件目录
# uploads/           - 上传目录
# README.md          - 使用说明
```

---

## 🚀 部署到服务器

### 方法 1: 一键部署（推荐）

```bash
# 1. 打包发布版本
tar -czf snaply-standalone.tar.gz release/

# 2. 上传到服务器
scp snaply-standalone.tar.gz root@your_server_ip:~/

# 3. SSH 登录服务器
ssh root@your_server_ip

# 4. 解压
tar -xzf snaply-standalone.tar.gz

# 5. 运行一键部署脚本
cd release
sudo ./deploy.sh
```

**部署脚本会自动**：
- ✅ 安装系统依赖（libvips）
- ✅ 创建 snaply 用户
- ✅ 安装文件到 `/opt/snaply`
- ✅ 创建 systemd 服务
- ✅ 启动服务并设置开机自启

### 方法 2: 手动部署

```bash
# 1. 上传并解压（同上）

# 2. 安装依赖
# Ubuntu/Debian
sudo apt-get install -y libvips-dev

# CentOS/RHEL
sudo yum install -y vips-devel

# 3. 手动启动
cd release
chmod +x snaply-linux
./start.sh
```

---

## 🎮 本地测试

### macOS

```bash
cd release
chmod +x snaply-macos
./start.sh
```

### Windows

双击 `start.bat` 或：

```cmd
cd release
start.bat
```

### Linux

```bash
cd release
chmod +x snaply-linux
./start.sh
```

访问：http://localhost:3000

---

## ⚙️ 使用 systemd 管理

部署脚本会自动创建 systemd 服务，也可以手动创建：

```bash
# 1. 创建服务文件
sudo nano /etc/systemd/system/snaply.service
```

内容：

```ini
[Unit]
Description=Snaply Image Hosting Service
After=network.target

[Service]
Type=simple
User=snaply
Group=snaply
WorkingDirectory=/opt/snaply
ExecStart=/opt/snaply/snaply-linux
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

```bash
# 2. 重载 systemd
sudo systemctl daemon-reload

# 3. 启动服务
sudo systemctl start snaply

# 4. 开机自启
sudo systemctl enable snaply

# 5. 查看状态
sudo systemctl status snaply

# 6. 查看日志
sudo journalctl -u snaply -f
```

---

## 🔧 配置说明

### 配置文件位置

- **部署后**: `/opt/snaply/data/config.json`
- **本地测试**: `release/data/config.json`

### 基础配置

```json
{
  "storageType": "local",
  "site": {
    "name": "Snaply",
    "baseUrl": ""
  },
  "local": {
    "uploadDir": "./uploads",
    "publicUrl": "https://img.example.com"
  }
}
```

### AI 配置（可选）

```json
{
  "ai": {
    "enabled": true,
    "provider": "ollama",
    "baseUrl": "http://localhost:11434",
    "model": "llava"
  }
}
```

修改配置后重启服务：

```bash
sudo systemctl restart snaply
```

---

## 🌐 配置 Nginx 反向代理

```bash
# 1. 安装 Nginx
sudo apt install -y nginx

# 2. 创建配置文件
sudo nano /etc/nginx/sites-available/snaply
```

内容：

```nginx
server {
    listen 80;
    server_name img.example.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        proxy_pass http://localhost:3000/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# 3. 启用配置
sudo ln -s /etc/nginx/sites-available/snaply /etc/nginx/sites-enabled/

# 4. 测试配置
sudo nginx -t

# 5. 重载 Nginx
sudo systemctl reload nginx
```

---

## 📊 性能对比

### 内存占用

| 部署方式 | 内存占用 |
|---------|---------|
| Node.js + npm | ~300MB |
| Node.js + pnpm | ~250MB |
| **独立运行版** | **~150MB** |

### 启动速度

| 部署方式 | 启动时间 |
|---------|---------|
| Node.js + npm | ~5 秒 |
| **独立运行版** | **~1 秒** |

### 文件大小

```bash
# 完整项目（带 node_modules）
du -sh snaply/  # ~400MB

# 独立运行版
du -sh release/  # ~120MB
```

---

## 🐛 故障排查

### 问题 1: libvips 缺失

**症状**：
```
Error: Cannot find module 'sharp'
```

**解决方案**：

```bash
# Ubuntu/Debian
sudo apt-get install libvips-dev

# CentOS/RHEL
sudo yum install vips-devel

# macOS
brew install vips
```

### 问题 2: 权限错误

**症状**：
```
Error: EACCES: permission denied
```

**解决方案**：

```bash
# 给予执行权限
chmod +x snaply-linux

# 检查目录权限
ls -la /opt/snaply
sudo chown -R snaply:snaply /opt/snaply
```

### 问题 3: 端口被占用

**症状**：
```
Error: listen EADDRINUSE :::3000
```

**解决方案**：

```bash
# 查找占用进程
sudo lsof -i :3000

# 杀死进程
sudo kill -9 <PID>

# 或修改端口（需要重新编译）
export PORT=3001
```

---

## 📦 更新部署

```bash
# 1. 构建新版本
./build-standalone.sh

# 2. 打包
tar -czf snaply-standalone-v1.1.0.tar.gz release/

# 3. 上传到服务器
scp snaply-standalone-v1.1.0.tar.gz root@your_server:~/

# 4. 在服务器上
sudo systemctl stop snaply
tar -xzf snaply-standalone-v1.1.0.tar.gz
sudo cp release/snaply-linux /opt/snaply/
sudo cp -r release/dist /opt/snaply/
sudo systemctl start snaply
```

---

## 💰 成本估算

| 项目 | 传统部署 | 独立运行版 |
|-----|---------|-----------|
| **服务器要求** | 1核2G | **1核1G** |
| **带宽要求** | 3Mbps | 3Mbps |
| **月费用** | ¥70 | **¥40** |

---

## 📚 相关文档

- [云服务器部署](Cloud-Server-Deployment)
- [Docker 部署](Docker-Deployment)
- [部署方案对比](Deployment-Comparison)

---

## ✅ 优势总结

1. **极简部署** - 30 秒完成部署
2. **零依赖** - 无需 Node.js 环境
3. **低成本** - 最低 1核1G 即可
4. **易维护** - 单文件更新
5. **跨平台** - Linux/macOS/Windows

---

**最后更新**: 2026-01-20
