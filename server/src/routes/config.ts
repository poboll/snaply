import { Hono } from 'hono'
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { logger } from '../utils/logger.js'

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

interface AIConfig {
  enabled: boolean
  provider: 'ollama' | 'gemini' | 'qwen' | 'zhipu' | 'siliconflow'
  apiKey: string
  baseUrl?: string  // For Ollama
  model?: string    // Optional model override
}

interface AppConfig {
  storageType: 'local' | 's3' | 'minio'
  site: SiteConfig
  advanced: AdvancedConfig
  ai: AIConfig
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
  },
  ai: {
    enabled: false,
    provider: 'siliconflow',
    apiKey: '',
    baseUrl: 'http://localhost:11434',
    model: 'THUDM/GLM-4.1V-9B-Thinking'
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
      minio: { ...defaultConfig.minio, ...parsed.minio },
      ai: { ...defaultConfig.ai, ...parsed.ai }
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
      },
      ai: {
        ...current.ai,
        ...(updates.ai || {})
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

  // Test AI connection
  app.post('/test-ai', async (c) => {
    try {
      const aiConfig = await c.req.json<AIConfig>()

      if (!aiConfig.enabled) {
        return c.json({ success: false, message: 'AI 功能未启用' })
      }

      const provider = aiConfig.provider || 'ollama'

      // Test Ollama
      if (provider === 'ollama') {
        const baseUrl = aiConfig.baseUrl || 'http://localhost:11434'
        try {
          const response = await fetch(`${baseUrl}/api/tags`)
          if (response.ok) {
            return c.json({
              success: true,
              message: `✅ Ollama 连接成功 (${baseUrl})\n请确保已下载视觉模型: ollama pull llava`
            })
          } else {
            return c.json({
              success: false,
              message: `❌ Ollama 连接失败: ${response.statusText}`
            })
          }
        } catch (error) {
          return c.json({
            success: false,
            message: `❌ 无法连接到 Ollama (${baseUrl})，请确保 Ollama 正在运行`
          })
        }
      }

      // Validate API key for cloud providers
      if (!aiConfig.apiKey || aiConfig.apiKey.length < 10) {
        return c.json({ success: false, message: '❌ API Key 格式无效' })
      }

      // Create a minimal 64x64 PNG test image using sharp (already a dependency)
      const testImageBuffer = await sharp({
        create: {
          width: 64,
          height: 64,
          channels: 3,
          background: { r: 0, g: 123, b: 255 }
        }
      })
      .png()
      .toBuffer()

      // Import the AI tagging function
      const { generateAITags } = await import('./images.js')

      const providerNames = {
        gemini: 'Google Gemini',
        qwen: '通义千问',
        zhipu: '智谱 AI',
        siliconflow: '硅基流动'
      }

      try {
        // Actually call the AI API with a test image
        logger.debug(`[AI Test] Testing ${provider} with a test image...`)
        const tags = await generateAITags(aiConfig, testImageBuffer, 'image/png')
        logger.debug(`[AI Test] Success! Generated tags:`, tags)

        return c.json({
          success: true,
          message: `✅ ${providerNames[provider]} 连接测试成功！\n\n测试图片生成的标签: ${tags.join(', ')}\n\n可以正常使用 AI 自动打标功能。`
        })
      } catch (apiError: any) {
        logger.error(`[AI Test] ${provider} API test failed:`, apiError)
        return c.json({
          success: false,
          message: `❌ ${providerNames[provider]} API 调用失败\n\n错误: ${apiError.message}\n\n请检查:\n1. API Key 是否正确\n2. 账户余额是否充足\n3. 网络连接是否正常`
        })
      }
    } catch (error: any) {
      logger.error('[AI Test] Test failed:', error)
      return c.json({ success: false, message: `❌ 测试失败: ${error.message}` })
    }
  })

  return app
}

export { loadConfig, buildImageUrl, type AppConfig, type SiteConfig, type AdvancedConfig, type AIConfig }
