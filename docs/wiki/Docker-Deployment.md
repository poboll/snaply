# Docker 部署指南

本文档详细介绍如何使用 Docker 和 Docker Compose 部署 Snaply。

## 🎯 为什么选择 Docker？

- ✅ **环境一致** - 开发、测试、生产环境完全相同
- ✅ **快速部署** - 一条命令启动服务
- ✅ **易于管理** - 容器化管理，方便升级和回滚
- ✅ **资源隔离** - 不影响宿主机其他服务

---

## 📋 前置要求

### 安装 Docker

**macOS**:
```bash
brew install --cask docker
# 启动 Docker Desktop
```

**Ubuntu/Debian**:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
# 重新登录使权限生效
```

**Windows**:
- 访问 [docker.com](https://www.docker.com/products/docker-desktop/)
- 下载并安装 Docker Desktop
- 启动 Docker Desktop

### 验证安装

```bash
docker --version
docker-compose --version
```

---

## 🚀 快速部署

### 方法 1: 使用 Docker Compose（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/poboll/snaply.git
cd snaply

# 2. 启动服务
docker-compose up -d

# 3. 查看日志
docker-compose logs -f

# 4. 访问服务
open http://localhost:3000
```

### 方法 2: 手动构建

```bash
# 1. 构建镜像
docker build -t snaply:latest .

# 2. 运行容器
docker run -d \
  --name snaply \
  -p 3000:3000 \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/data:/app/data \
  --restart unless-stopped \
  snaply:latest

# 3. 查看日志
docker logs -f snaply
```

---

## 📝 docker-compose.yml 配置

完整配置文件：

```yaml
version: '3.8'

services:
  snaply:
    build: .
    container_name: snaply
    ports:
      - "3000:3000"
    volumes:
      # 上传的图片
      - ./uploads:/app/uploads
      # 配置和数据库
      - ./data:/app/data
    environment:
      # Node.js 环境变量
      - NODE_ENV=production
      # 端口配置
      - PORT=3000
    restart: unless-stopped
    # 资源限制
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

## 🔧 高级配置

### 配置环境变量

创建 `.env` 文件：

```bash
# 服务端口
PORT=3000

# Node.js 环境
NODE_ENV=production

# 内存限制
NODE_OPTIONS=--max-old-space-size=2048

# AI 配置（可选）
AI_PROVIDER=ollama
AI_BASE_URL=http://ollama:11434
```

更新 `docker-compose.yml`：

```yaml
services:
  snaply:
    env_file:
      - .env
```

---

### 使用外部数据库

如果需要 PostgreSQL/MySQL（未来版本）：

```yaml
version: '3.8'

services:
  snaply:
    build: .
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/snaply

  postgres:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=snaply

volumes:
  postgres_data:
```

---

### 配合 Ollama 使用

将 Ollama 和 Snaply 放在同一网络：

```yaml
version: '3.8'

services:
  snaply:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./uploads:/app/uploads
      - ./data:/app/data
    environment:
      - AI_PROVIDER=ollama
      - AI_BASE_URL=http://ollama:11434
    depends_on:
      - ollama
    networks:
      - snaply-network

  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    networks:
      - snaply-network
    # 如果有 GPU
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

networks:
  snaply-network:
    driver: bridge

volumes:
  ollama_data:
```

启动并下载模型：

```bash
# 启动服务
docker-compose up -d

# 进入 Ollama 容器下载模型
docker exec -it ollama ollama pull llava

# 验证
docker exec -it ollama ollama list
```

---

## 🔄 日常管理

### 启动/停止服务

```bash
# 启动
docker-compose up -d

# 停止
docker-compose stop

# 重启
docker-compose restart

# 停止并删除容器
docker-compose down

# 停止并删除容器、网络、卷
docker-compose down -v
```

### 查看日志

```bash
# 实时查看所有日志
docker-compose logs -f

# 只看 snaply 服务
docker-compose logs -f snaply

# 查看最后 100 行
docker-compose logs --tail=100 snaply
```

### 进入容器

```bash
# 进入容器 Shell
docker-compose exec snaply sh

# 查看文件
docker-compose exec snaply ls -la /app

# 查看进程
docker-compose exec snaply ps aux
```

---

## 📊 监控和维护

### 查看资源使用

```bash
# 查看容器状态
docker stats snaply

# 查看磁盘使用
docker system df
```

### 备份数据

```bash
# 备份数据目录
tar -czf snaply-backup-$(date +%Y%m%d).tar.gz \
  ./data \
  ./uploads \
  ./docker-compose.yml

# 恢复备份
tar -xzf snaply-backup-20260120.tar.gz
docker-compose up -d
```

### 清理空间

```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的容器
docker container prune

# 清理未使用的卷
docker volume prune

# 清理所有未使用资源
docker system prune -a --volumes
```

---

## 🔄 更新升级

### 更新到最新版本

```bash
# 1. 停止当前服务
docker-compose down

# 2. 拉取最新代码
git pull origin main

# 3. 重新构建镜像
docker-compose build --no-cache

# 4. 启动服务
docker-compose up -d

# 5. 验证
docker-compose logs -f snaply
```

### 回滚到之前版本

```bash
# 1. 查看可用标签
git tag

# 2. 切换到指定版本
git checkout v0.0.1

# 3. 重新构建并启动
docker-compose down
docker-compose up -d --build
```

---

## 🌐 反向代理

### Nginx 配置

创建 `nginx/nginx.conf`：

```nginx
upstream snaply_backend {
    server snaply:3000;
}

server {
    listen 80;
    server_name img.example.com;

    client_max_body_size 50M;

    location / {
        proxy_pass http://snaply_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://snaply_backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

更新 `docker-compose.yml`：

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - snaply
    networks:
      - snaply-network

  snaply:
    # ... 之前的配置
    expose:
      - "3000"  # 不直接暴露端口
    networks:
      - snaply-network
```

---

## 🔒 HTTPS 配置

### 使用 Let's Encrypt

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/conf.d/default.conf
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - snaply

  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
```

获取证书：

```bash
# 首次获取证书
docker-compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d img.example.com

# 重启 Nginx
docker-compose restart nginx
```

---

## 🐛 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker-compose logs snaply

# 检查配置文件
docker-compose config

# 验证端口是否被占用
lsof -i :3000
```

### 数据无法持久化

```bash
# 检查卷挂载
docker inspect snaply | grep Mounts -A 10

# 检查文件权限
ls -la ./data ./uploads

# 修复权限
sudo chown -R 1000:1000 ./data ./uploads
```

### 内存不足

```bash
# 增加内存限制
# 编辑 docker-compose.yml
deploy:
  resources:
    limits:
      memory: 4G
```

---

## 📚 相关资源

- [Docker 官方文档](https://docs.docker.com/)
- [Docker Compose 文档](https://docs.docker.com/compose/)
- [生产环境部署](Production)

---

**最后更新**: 2026-01-20
