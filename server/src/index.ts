import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { cors } from 'hono/cors'
import { logger as honoLogger } from 'hono/logger'
import { serveStatic } from '@hono/node-server/serve-static'
import path from 'path'

import { createImageRoutes } from './routes/images.js'
import { createConfigRoutes, loadConfig } from './routes/config.js'
import { LocalStorage, S3Storage, type StorageAdapter } from './storage/index.js'
import { logger } from './utils/logger.js'

const app = new Hono()

// Middleware
app.use('*', cors())
app.use('*', honoLogger())

// Health check
app.get('/health', (c) => c.json({ status: 'ok', timestamp: Date.now() }))

// Initialize storage adapter based on config
async function getStorageAdapter(): Promise<StorageAdapter> {
  const config = await loadConfig()
  
  switch (config.storageType) {
    case 's3':
      return new S3Storage({
        endpoint: config.s3.endpoint,
        region: config.s3.region,
        bucket: config.s3.bucket,
        accessKey: config.s3.accessKey,
        secretKey: config.s3.secretKey,
        publicUrl: config.s3.publicUrl
      })
    
    case 'minio':
      return new S3Storage({
        endpoint: config.minio.endpoint,
        region: config.minio.region,
        bucket: config.minio.bucket,
        accessKey: config.minio.accessKey,
        secretKey: config.minio.secretKey,
        publicUrl: config.minio.publicUrl
      })
    
    case 'local':
    default:
      const uploadDir = path.resolve(process.cwd(), config.local.uploadDir)
      return new LocalStorage(uploadDir, config.local.publicUrl)
  }
}

// Setup routes
async function setupRoutes() {
  const storage = await getStorageAdapter()

  // API routes
  app.route('/api/images', createImageRoutes(storage))
  app.route('/api/config', createConfigRoutes())

  // Serve uploaded files (for local storage)
  // ✅ 修复：使用正确的路径配置
  const config = await loadConfig()
  const uploadDir = path.resolve(process.cwd(), config.local.uploadDir)

  app.use('/uploads/*', serveStatic({
    root: uploadDir,
    rewriteRequestPath: (path) => path.replace(/^\/uploads/, '')
  }))

  logger.info(`Static files served from: ${uploadDir}`)
}

// Start server
const PORT = parseInt(process.env.PORT || '3001')

setupRoutes().then(() => {
  console.log(`
╔════════════════════════════════════════════╗
║                                            ║
║   🖼️  Snaply Server v1.0.0                 ║
║                                            ║
║   Server running at:                       ║
║   http://localhost:${PORT}                     ║
║                                            ║
║   API Endpoints:                           ║
║   GET  /api/images      - List images      ║
║   POST /api/images/upload - Upload         ║
║   DELETE /api/images/:id - Delete          ║
║   GET  /api/config      - Get config       ║
║   PUT  /api/config      - Update config    ║
║                                            ║
╚════════════════════════════════════════════╝
  `)

  serve({
    fetch: app.fetch,
    port: PORT
  })
})

export default app
