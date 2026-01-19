# Snaply (在虎图床)

<div align="center">
  <h3>Y2K Retro Aesthetic Image Hosting Solution</h3>
  <p>A Windows 98/2000 inspired image hosting platform built with modern web technologies.</p>
</div>

## ✨ Features

- **Retro UI**: Authentic Windows 98/2000 aesthetic with pixel-perfect details
- **Drag & Drop Upload**: DOS-style terminal progress indicators
- **Multi-Storage Support**: 
  - Local Storage (default)
  - Amazon S3 / Compatible
  - Self-hosted MinIO
- **Smart Management**: 
  - Gallery view with tag filtering
  - Batch operations
  - Instant copy (Direct Link / Markdown)
- **Advanced Configuration**:
  - WebP conversion (auto-optimization)
  - Thumbnail generation
  - Custom domain/URL prefix support

## 🛠 Tech Stack

- **Frontend**: Vue 3, TypeScript, Vite, Tailwind CSS, Pinia
- **Backend**: Hono, Node.js, TypeScript
- **Storage**: File System, S3 SDK

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/poboll/snaply.git
   cd snaply
   ```

2. Install dependencies:
   ```bash
   # Root
   pnpm install
   
   # Frontend
   cd src && pnpm install
   
   # Backend
   cd server && pnpm install
   ```

3. Start development server:
   ```bash
   # Runs both frontend and backend
   pnpm dev
   ```

4. Open `http://localhost:5173` in your browser.

## 🐳 Docker Deployment

```yaml
version: '3'
services:
  snaply:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./uploads:/app/uploads
      - ./data:/app/data
    restart: always
```

## 📝 Configuration

Configure your storage backend in the "Config" window:
- **Local**: Simple file storage
- **S3/MinIO**: Enterprise-grade object storage
- **Advanced**: WebP conversion, EXIF retention, custom domain mapping

## 📄 License

MIT License - Copyright (c) 2025 在虎
