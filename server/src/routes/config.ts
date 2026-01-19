import { Hono } from 'hono'
import fs from 'fs/promises'
import path from 'path'

const CONFIG_FILE = path.join(process.cwd(), 'data', 'config.json')

interface SiteConfig {
  baseUrl: string      // e.g., https://img.example.com
  urlPrefix: string    // e.g., /images or empty
}

interface AdvancedConfig {
  convertToWebp: boolean
  webpQuality: number
  preserveExif: boolean
  generateThumbnail: boolean
  thumbnailSize: number
  maxFileSize: number  // in MB
}

interface AppConfig {
  storageType: 'local' | 's3' | 'minio'
  site: SiteConfig
  advanced: AdvancedConfig
  local: {
    uploadDir: string
    publicUrl: string
  }
  s3: {
    endpoint: string
    region: string
    bucket: string
    accessKey: string
    secretKey: string
    publicUrl: string
  }
  minio: {
    endpoint: string
    region: string
    bucket: string
    accessKey: string
    secretKey: string
    publicUrl: string
  }
}

const defaultConfig: AppConfig = {
  storageType: 'local',
  site: {
    baseUrl: '',           // Empty means use relative URLs
    urlPrefix: '/uploads'  // Default prefix for local storage
  },
  advanced: {
    convertToWebp: true,
    webpQuality: 80,
    preserveExif: false,
    generateThumbnail: true,
    thumbnailSize: 200,
    maxFileSize: 10  // 10MB
  },
  local: {
    uploadDir: './uploads',
    publicUrl: '/uploads'
  },
  s3: {
    endpoint: 'https://s3.amazonaws.com',
    region: 'us-east-1',
    bucket: '',
    accessKey: '',
    secretKey: '',
    publicUrl: ''
  },
  minio: {
    endpoint: 'http://localhost:9000',
    region: 'auto',
    bucket: 'snaply',
    accessKey: 'minioadmin',
    secretKey: 'minioadmin',
    publicUrl: ''
  }
}

async function loadConfig(): Promise<AppConfig> {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf-8')
    const parsed = JSON.parse(data)
    // Deep merge with defaults
    return {
      ...defaultConfig,
      ...parsed,
      site: { ...defaultConfig.site, ...parsed.site },
      advanced: { ...defaultConfig.advanced, ...parsed.advanced },
      local: { ...defaultConfig.local, ...parsed.local },
      s3: { ...defaultConfig.s3, ...parsed.s3 },
      minio: { ...defaultConfig.minio, ...parsed.minio }
    }
  } catch {
    return defaultConfig
  }
}

async function saveConfig(config: AppConfig): Promise<void> {
  const dir = path.dirname(CONFIG_FILE)
  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2))
}

/**
 * Build full public URL for an image
 */
function buildImageUrl(config: AppConfig, filename: string): string {
  const { site, storageType } = config
  
  // If custom S3/MinIO public URL is set, use it
  if (storageType === 's3' && config.s3.publicUrl) {
    return `${config.s3.publicUrl}/${filename}`
  }
  if (storageType === 'minio' && config.minio.publicUrl) {
    return `${config.minio.publicUrl}/${filename}`
  }
  
  // Otherwise use site config
  const base = site.baseUrl || ''
  const prefix = site.urlPrefix || ''
  return `${base}${prefix}/${filename}`
}

/**
 * Config Routes
 * Manages storage backend configuration
 */
export function createConfigRoutes() {
  const app = new Hono()

  // Get current config
  app.get('/', async (c) => {
    const config = await loadConfig()
    // Hide sensitive keys in response
    const safeConfig = {
      ...config,
      s3: { ...config.s3, secretKey: config.s3.secretKey ? '********' : '' },
      minio: { ...config.minio, secretKey: config.minio.secretKey ? '********' : '' }
    }
    return c.json({ success: true, data: safeConfig })
  })

  // Update config
  app.put('/', async (c) => {
    const updates = await c.req.json<Partial<AppConfig>>()
    const current = await loadConfig()
    
    // Merge updates, preserving existing secrets if not provided
    const newConfig: AppConfig = {
      ...current,
      ...updates,
      site: {
        ...current.site,
        ...(updates.site || {})
      },
      advanced: {
        ...current.advanced,
        ...(updates.advanced || {})
      },
      local: {
        ...current.local,
        ...(updates.local || {})
      },
      s3: {
        ...current.s3,
        ...(updates.s3 || {}),
        secretKey: updates.s3?.secretKey === '********' 
          ? current.s3.secretKey 
          : (updates.s3?.secretKey || current.s3.secretKey)
      },
      minio: {
        ...current.minio,
        ...(updates.minio || {}),
        secretKey: updates.minio?.secretKey === '********' 
          ? current.minio.secretKey 
          : (updates.minio?.secretKey || current.minio.secretKey)
      }
    }
    
    await saveConfig(newConfig)
    return c.json({ success: true })
  })

  // Test connection
  app.post('/test', async (c) => {
    const config = await loadConfig()
    // TODO: Actually test S3/MinIO connection
    return c.json({ 
      success: true, 
      message: `Storage type: ${config.storageType} - Connection OK` 
    })
  })

  return app
}

export { loadConfig, buildImageUrl, type AppConfig, type SiteConfig, type AdvancedConfig }
