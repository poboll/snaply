#!/bin/bash

# Snaply 一键打包脚本
# 生成跨平台二进制可执行文件

set -e

echo "🚀 开始打包 Snaply..."

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 清理旧文件
echo -e "${BLUE}📦 清理旧的构建文件...${NC}"
rm -rf release
mkdir -p release

# 2. 构建前端
echo -e "${BLUE}🎨 构建前端...${NC}"
pnpm build:client

# 复制前端构建产物到 release
cp -r dist release/dist

# 3. 构建后端
echo -e "${BLUE}🔧 构建后端...${NC}"
cd server
pnpm build

# 4. 打包二进制文件
echo -e "${BLUE}📦 打包二进制文件...${NC}"
echo -e "${YELLOW}   这可能需要几分钟...${NC}"

# 使用 pkg 打包
npx pkg dist/index.js \
  --targets node20-linux-x64,node20-macos-x64,node20-win-x64 \
  --output ../release/snaply \
  --compress GZip

cd ..

# 5. 创建必要的目录
echo -e "${BLUE}📁 创建数据目录...${NC}"
mkdir -p release/data
mkdir -p release/uploads

# 6. 复制配置文件模板
echo -e "${BLUE}📝 复制配置文件...${NC}"
cat > release/data/config.json << 'EOF'
{
  "storageType": "local",
  "site": {
    "name": "Snaply",
    "baseUrl": ""
  },
  "advanced": {
    "enableWebP": false,
    "keepEXIF": false,
    "generateThumbnail": false,
    "maxFileSize": 10
  },
  "local": {
    "uploadDir": "./uploads",
    "publicUrl": ""
  },
  "s3": {
    "bucket": "",
    "region": "us-east-1",
    "endpoint": "https://s3.amazonaws.com",
    "accessKey": "",
    "secretKey": "",
    "publicUrl": ""
  },
  "minio": {
    "bucket": "",
    "region": "us-east-1",
    "endpoint": "http://localhost:9000",
    "accessKey": "minioadmin",
    "secretKey": "minioadmin",
    "publicUrl": ""
  },
  "ai": {
    "enabled": false,
    "provider": "ollama",
    "apiKey": "",
    "baseUrl": "http://localhost:11434",
    "model": "llava"
  }
}
EOF

# 创建空的 images.json
echo "[]" > release/data/images.json

# 7. 创建启动脚本
echo -e "${BLUE}📜 创建启动脚本...${NC}"

# Linux/macOS 启动脚本
cat > release/start.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"

# 检查操作系统
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    BINARY="./snaply-linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    BINARY="./snaply-macos"
else
    echo "不支持的操作系统: $OSTYPE"
    exit 1
fi

# 检查二进制文件是否存在
if [ ! -f "$BINARY" ]; then
    echo "错误: 找不到可执行文件 $BINARY"
    exit 1
fi

# 添加执行权限
chmod +x "$BINARY"

# 启动服务
echo "🚀 启动 Snaply..."
echo "访问地址: http://localhost:3000"
"$BINARY"
EOF

# Windows 启动脚本
cat > release/start.bat << 'EOF'
@echo off
cd /d %~dp0

echo 🚀 启动 Snaply...
echo 访问地址: http://localhost:3000

snaply-win.exe

pause
EOF

# 添加执行权限
chmod +x release/start.sh

# 8. 创建 README
cat > release/README.md << 'EOF'
# Snaply 独立运行版

无需 Node.js 环境，开箱即用的图床服务！

## 🚀 快速启动

### Linux / macOS

```bash
# 添加执行权限
chmod +x start.sh

# 启动服务
./start.sh
```

### Windows

双击 `start.bat` 或在命令行运行：

```cmd
start.bat
```

### 访问服务

打开浏览器访问：http://localhost:3000

## 📁 目录结构

```
snaply/
├── snaply-linux       # Linux 可执行文件
├── snaply-macos       # macOS 可执行文件
├── snaply-win.exe     # Windows 可执行文件
├── start.sh           # Linux/macOS 启动脚本
├── start.bat          # Windows 启动脚本
├── dist/              # 前端静态文件
├── data/              # 配置文件
│   ├── config.json    # 系统配置
│   └── images.json    # 图片数据库
└── uploads/           # 上传的图片
```

## ⚙️ 配置

编辑 `data/config.json` 文件：

- **存储类型**: `local`, `s3`, `minio`
- **AI 功能**: 配置 Ollama 或云 AI 服务
- **域名**: 配置 CDN 或自定义域名

## 🔧 使用 PM2 管理（可选）

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start snaply-linux --name snaply

# 查看状态
pm2 status

# 开机自启
pm2 startup
pm2 save
```

## 📝 系统要求

- **Linux**: x64 架构，glibc 2.17+
- **macOS**: 10.13+ (High Sierra)
- **Windows**: Windows 10+

## 🐛 故障排查

### Linux: libvips 缺失

```bash
# Ubuntu/Debian
sudo apt-get install libvips-dev

# CentOS/RHEL
sudo yum install vips-devel
```

### macOS: 权限问题

```bash
# 允许运行未签名的应用
sudo spctl --master-disable
```

### Windows: 缺少 DLL

下载并安装 [Visual C++ Redistributable](https://aka.ms/vs/17/release/vc_redist.x64.exe)

## 📚 完整文档

访问：https://github.com/poboll/snaply/wiki

## 💬 获取帮助

- Issues: https://github.com/poboll/snaply/issues
- Wiki: https://github.com/poboll/snaply/wiki

---

**版本**: v1.0.0
**最后更新**: 2026-01-20
EOF

# 9. 创建部署脚本
cat > release/deploy.sh << 'EOF'
#!/bin/bash

# Snaply 一键部署脚本（适用于轻量应用服务器）

set -e

echo "🚀 Snaply 一键部署脚本"
echo "======================"
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
   echo "请使用 root 用户运行此脚本"
   echo "sudo ./deploy.sh"
   exit 1
fi

# 1. 安装必要依赖
echo "📦 安装系统依赖..."
if [ -f /etc/debian_version ]; then
    apt-get update
    apt-get install -y libvips-dev
elif [ -f /etc/redhat-release ]; then
    yum install -y vips-devel
fi

# 2. 创建服务用户
if ! id -u snaply > /dev/null 2>&1; then
    echo "👤 创建 snaply 用户..."
    useradd -r -s /bin/bash -d /opt/snaply -m snaply
fi

# 3. 复制文件
echo "📁 部署文件..."
INSTALL_DIR="/opt/snaply"

# 复制所有文件到安装目录
cp -r ./* $INSTALL_DIR/

# 设置权限
chown -R snaply:snaply $INSTALL_DIR
chmod +x $INSTALL_DIR/snaply-linux
chmod +x $INSTALL_DIR/start.sh

# 4. 创建 systemd 服务
echo "⚙️ 创建系统服务..."
cat > /etc/systemd/system/snaply.service << 'EOFS'
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

[Install]
WantedBy=multi-user.target
EOFS

# 5. 启动服务
echo "🚀 启动 Snaply 服务..."
systemctl daemon-reload
systemctl enable snaply
systemctl start snaply

# 6. 检查状态
sleep 2
if systemctl is-active --quiet snaply; then
    echo ""
    echo "✅ Snaply 部署成功！"
    echo ""
    echo "📊 服务状态: systemctl status snaply"
    echo "📜 查看日志: journalctl -u snaply -f"
    echo "🌐 访问地址: http://$(hostname -I | awk '{print $1}'):3000"
    echo ""
    echo "🔧 配置文件: /opt/snaply/data/config.json"
    echo "📁 上传目录: /opt/snaply/uploads"
else
    echo "❌ 服务启动失败，请查看日志："
    journalctl -u snaply -n 50
    exit 1
fi
EOF

chmod +x release/deploy.sh

# 10. 显示构建结果
echo ""
echo -e "${GREEN}✅ 打包完成！${NC}"
echo ""
echo "📦 生成的文件:"
ls -lh release/ | grep snaply

echo ""
echo -e "${BLUE}📊 文件大小统计:${NC}"
du -sh release/snaply-*

echo ""
echo -e "${GREEN}🎉 所有文件已生成到 release/ 目录${NC}"
echo ""
echo "📚 使用方法:"
echo "  1. 将 release/ 目录打包: tar -czf snaply-standalone.tar.gz release/"
echo "  2. 上传到服务器: scp snaply-standalone.tar.gz root@your_server:~/"
echo "  3. 在服务器解压: tar -xzf snaply-standalone.tar.gz"
echo "  4. 运行部署脚本: cd release && sudo ./deploy.sh"
echo ""
echo "或者手动启动:"
echo "  cd release && ./start.sh"
echo ""
