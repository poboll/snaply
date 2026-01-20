# Snaply - 腾讯云轻量应用服务器部署指南

本文档详细介绍如何在腾讯云轻量应用服务器上部署 Snaply。

## 📋 目录

- [准备工作](#准备工作)
- [服务器配置](#服务器配置)
- [部署步骤](#部署步骤)
- [域名配置](#域名配置)
- [SSL 证书](#ssl-证书)
- [日常维护](#日常维护)
- [故障排查](#故障排查)

---

## 准备工作

### 1. 服务器要求

| 配置 | 最低 | 推荐 |
|-----|------|------|
| **CPU** | 1 核 | 2 核+ |
| **内存** | 1GB | 2GB+ |
| **磁盘** | 20GB | 40GB+ |
| **带宽** | 1Mbps | 3Mbps+ |
| **系统** | Ubuntu 20.04+ | Ubuntu 22.04 LTS |

### 2. 推荐服务器套餐

**腾讯云轻量应用服务器**：
- 套餐：**2核2G** 或 **2核4G**
- 系统：**Ubuntu 22.04 LTS**
- 带宽：**3Mbps** 或 **5Mbps**
- 价格：约 ¥60-100/月

**购买链接**：[腾讯云轻量应用服务器](https://cloud.tencent.com/product/lighthouse)

---

## 服务器配置

### 第一步：登录服务器

**方式 1: 使用 SSH 密钥（推荐）**

```bash
# 本地生成 SSH 密钥（如果还没有）
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 复制公钥到服务器
ssh-copy-id root@your_server_ip

# 登录
ssh root@your_server_ip
```

**方式 2: 使用密码**

```bash
# 腾讯云控制台获取密码后登录
ssh root@your_server_ip
```

### 第二步：更新系统

```bash
# 更新软件包列表
apt update

# 升级已安装的软件包
apt upgrade -y

# 安装基础工具
apt install -y curl wget git vim ufw
```

### 第三步：安装 Node.js

```bash
# 安装 Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 验证安装
node --version  # 应该是 v20.x.x
npm --version
```

### 第四步：安装 pnpm

```bash
npm install -g pnpm

# 验证安装
pnpm --version
```

### 第五步：安装 PM2（进程管理器）

```bash
npm install -g pm2

# 验证安装
pm2 --version
```

### 第六步：配置防火墙

```bash
# 允许 SSH
ufw allow 22/tcp

# 允许 HTTP
ufw allow 80/tcp

# 允许 HTTPS
ufw allow 443/tcp

# 启用防火墙
ufw enable

# 查看状态
ufw status
```

---

## 部署步骤

### 第一步：克隆项目

```bash
# 切换到 /var/www 目录
cd /var/www

# 克隆项目
git clone https://github.com/poboll/snaply.git

# 进入项目目录
cd snaply
```

### 第二步：安装依赖

```bash
# 安装所有依赖
pnpm install

# 安装后端依赖
cd server
pnpm install

# 返回根目录
cd ..
```

### 第三步：构建项目

```bash
# 构建前端和后端
pnpm build
```

### 第四步：创建必要目录

```bash
# 创建数据目录
mkdir -p data uploads

# 设置权限
chmod 755 data uploads
```

### 第五步：配置环境变量（可选）

```bash
# 创建 .env 文件
cat > server/.env << 'EOF'
NODE_ENV=production
PORT=3000
EOF
```

### 第六步：使用 PM2 启动服务

```bash
# 创建 PM2 配置文件
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'snaply',
    script: './server/dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# 启动服务
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup
# 执行输出的命令
```

### 第七步：验证服务

```bash
# 查看 PM2 状态
pm2 status

# 查看日志
pm2 logs snaply

# 测试服务
curl http://localhost:3000/health
```

---

## 域名配置

### 第一步：配置域名解析

1. 登录腾讯云控制台
2. 进入「DNSPod DNS 解析」
3. 添加记录：

| 类型 | 主机记录 | 记录值 | TTL |
|-----|---------|--------|-----|
| A | www | 您的服务器 IP | 600 |
| A | @ | 您的服务器 IP | 600 |

### 第二步：安装 Nginx

```bash
# 安装 Nginx
apt install -y nginx

# 启动 Nginx
systemctl start nginx

# 设置开机自启
systemctl enable nginx
```

### 第三步：配置 Nginx

```bash
# 创建 Snaply 配置文件
cat > /etc/nginx/sites-available/snaply << 'EOF'
server {
    listen 80;
    server_name img.example.com www.img.example.com;

    # 日志
    access_log /var/log/nginx/snaply_access.log;
    error_log /var/log/nginx/snaply_error.log;

    # 客户端最大请求体大小
    client_max_body_size 50M;

    # 前端静态文件
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API 接口
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时设置
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # 上传的图片
    location /uploads/ {
        proxy_pass http://localhost:3000/uploads/;
        proxy_set_header Host $host;

        # 缓存设置
        expires 30d;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;
    }

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json application/javascript;
}
EOF

# 替换域名
sed -i 's/img.example.com/您的域名/g' /etc/nginx/sites-available/snaply

# 启用配置
ln -s /etc/nginx/sites-available/snaply /etc/nginx/sites-enabled/

# 删除默认配置（可选）
rm -f /etc/nginx/sites-enabled/default

# 测试配置
nginx -t

# 重载 Nginx
systemctl reload nginx
```

---

## SSL 证书

### 方式 1: 使用 Certbot（免费）

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 获取证书（自动配置 Nginx）
certbot --nginx -d img.example.com -d www.img.example.com

# 测试自动续期
certbot renew --dry-run
```

### 方式 2: 使用腾讯云 SSL 证书

1. 登录腾讯云控制台
2. 申请免费 SSL 证书
3. 下载证书文件
4. 上传到服务器

```bash
# 创建证书目录
mkdir -p /etc/nginx/ssl

# 上传证书文件（使用 scp 或手动上传）
# scp 你的证书.crt root@your_server:/etc/nginx/ssl/
# scp 你的私钥.key root@your_server:/etc/nginx/ssl/

# 修改 Nginx 配置
cat > /etc/nginx/sites-available/snaply-ssl << 'EOF'
server {
    listen 443 ssl http2;
    server_name img.example.com www.img.example.com;

    # SSL 证书
    ssl_certificate /etc/nginx/ssl/你的证书.crt;
    ssl_certificate_key /etc/nginx/ssl/你的私钥.key;

    # SSL 配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 其他配置同 HTTP
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

    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /uploads/ {
        proxy_pass http://localhost:3000/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name img.example.com www.img.example.com;
    return 301 https://$server_name$request_uri;
}
EOF

# 重载 Nginx
nginx -t
systemctl reload nginx
```

---

## 日常维护

### 更新项目

```bash
cd /var/www/snaply

# 拉取最新代码
git pull origin main

# 安装新依赖
pnpm install
cd server && pnpm install && cd ..

# 重新构建
pnpm build

# 重启 PM2 服务
pm2 restart snaply

# 查看状态
pm2 status
```

### 备份数据

```bash
# 创建备份脚本
cat > /root/backup-snaply.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/backups/snaply"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份数据和上传的文件
tar -czf $BACKUP_DIR/snaply_$DATE.tar.gz \
    /var/www/snaply/data \
    /var/www/snaply/uploads \
    /root/.pm2

# 删除 7 天前的备份
find $BACKUP_DIR -name "snaply_*.tar.gz" -mtime +7 -delete

echo "Backup completed: snaply_$DATE.tar.gz"
EOF

# 添加执行权限
chmod +x /root/backup-snaply.sh

# 添加到 crontab（每天凌晨 2 点备份）
crontab -e
# 添加以下行：
# 0 2 * * * /root/backup-snaply.sh
```

### 监控日志

```bash
# PM2 日志
pm2 logs snaply

# Nginx 访问日志
tail -f /var/log/nginx/snaply_access.log

# Nginx 错误日志
tail -f /var/log/nginx/snaply_error.log
```

### 查看资源使用

```bash
# PM2 监控
pm2 monit

# 系统资源
htop
# 或
top

# 磁盘使用
df -h

# 内存使用
free -h
```

---

## 故障排查

### 问题 1: 服务无法启动

```bash
# 查看 PM2 日志
pm2 logs snaply --lines 100

# 检查端口占用
lsof -i :3000

# 检查防火墙
ufw status
```

### 问题 2: 无法上传图片

```bash
# 检查 uploads 目录权限
ls -la /var/www/snaply/uploads

# 修复权限
chown -R www-data:www-data /var/www/snaply/uploads
chmod -R 755 /var/www/snaply/uploads

# 检查磁盘空间
df -h
```

### 问题 3: Nginx 502 错误

```bash
# 检查 PM2 服务状态
pm2 status

# 重启服务
pm2 restart snaply

# 检查 Nginx 配置
nginx -t
```

### 问题 4: 域名无法访问

```bash
# 检查 DNS 解析
nslookup img.example.com

# 检查 Nginx 配置
nginx -t

# 检查防火墙
ufw status

# 检查域名绑定
cat /etc/nginx/sites-available/snaply | grep server_name
```

---

## 性能优化

### 1. 启用 PM2 集群模式

```bash
# 根据 CPU 核心数启动多个实例
pm2 delete snaply
pm2 start ecosystem.config.js -i max

# 保存配置
pm2 save
```

### 2. 配置 Nginx 缓存

```nginx
# 在 http 块添加
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=snaply_cache:10m max_size=1g inactive=60m;

# 在 server 块的 location /uploads/ 添加
location /uploads/ {
    proxy_pass http://localhost:3000/uploads/;
    proxy_cache snaply_cache;
    proxy_cache_valid 200 30d;
    proxy_cache_use_stale error timeout invalid_header updating;
    expires 30d;
    add_header X-Cache-Status $upstream_cache_status;
}
```

### 3. 开启 HTTP/2

```nginx
listen 443 ssl http2;  # 在 SSL 配置中已启用
```

---

## 📊 费用估算

### 腾讯云轻量应用服务器

| 套餐 | 配置 | 带宽 | 价格 |
|-----|------|------|------|
| **入门型** | 1核2G | 3Mbps | ¥50/月 |
| **推荐** | 2核2G | 3Mbps | ¥70/月 |
| **高配** | 2核4G | 5Mbps | ¥100/月 |

### 域名费用

- **.com**: 约 ¥60/年
- **.cn**: 约 ¥30/年
- **免费域名**: Freenom (.tk, .ml 等)

### 总成本

- **服务器**: ¥70/月
- **域名**: ¥5/月
- **总计**: 约 **¥75/月**（¥900/年）

---

## 📚 相关文档

- [Docker 部署](Docker-Deployment)
- [FAQ - 常见问题](FAQ)
- [AI 配置指南](AI-Setup)

---

**最后更新**: 2026-01-20
