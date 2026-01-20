import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { api } from '../api'

export type StorageType = 'local' | 's3' | 'minio'

export interface SiteConfig {
  baseUrl: string      // e.g., https://img.example.com
  urlPrefix: string    // e.g., /images or empty
}

export interface AdvancedConfig {
  convertToWebp: boolean
  webpQuality: number
  preserveExif: boolean
  generateThumbnail: boolean
  thumbnailSize: number
  maxFileSize: number  // in MB
}

export interface S3Config {
  endpoint: string
  region: string
  bucket: string
  accessKey: string
  secretKey: string
  publicUrl: string
}

export interface LocalConfig {
  uploadDir: string
  publicUrl: string
}

export interface AIConfig {
  enabled: boolean
  provider: 'ollama' | 'gemini' | 'qwen' | 'zhipu' | 'siliconflow'
  apiKey: string
  baseUrl?: string  // For Ollama
  model?: string    // Optional model override
}

export interface AppConfig {
  storageType: StorageType
  site: SiteConfig
  advanced: AdvancedConfig
  ai: AIConfig
  local: LocalConfig
  s3: S3Config
  minio: S3Config
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

export const useConfigStore = defineStore('config', () => {
  const config = reactive<AppConfig>({ ...defaultConfig })
  const isLoading = ref(false)
  const isOnline = ref(true)
  const lastError = ref('')

  // Load config from backend
  async function loadConfig() {
    isLoading.value = true
    try {
      const data = await api.getConfig() as Partial<AppConfig>
      if (data.storageType) config.storageType = data.storageType
      if (data.site) Object.assign(config.site, data.site)
      if (data.advanced) Object.assign(config.advanced, data.advanced)
      if (data.local) Object.assign(config.local, data.local)
      if (data.s3) Object.assign(config.s3, data.s3)
      if (data.minio) Object.assign(config.minio, data.minio)
      if (data.ai) Object.assign(config.ai, data.ai)
      isOnline.value = true
      lastError.value = ''
    } catch (e) {
      console.warn('Failed to load config from backend, using defaults')
      isOnline.value = false
      lastError.value = 'Cannot connect to server'
    } finally {
      isLoading.value = false
    }
  }

  // Save config to backend
  async function saveConfig(): Promise<boolean> {
    isLoading.value = true
    try {
      const success = await api.updateConfig(config as unknown as Record<string, unknown>)
      if (success) {
        lastError.value = ''
        return true
      } else {
        lastError.value = 'Failed to save'
        return false
      }
    } catch (e) {
      console.error('Failed to save config:', e)
      lastError.value = 'Server error'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Test connection to storage backend
  async function testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/config/test', { method: 'POST' })
      const json = await res.json()
      return { success: json.success, message: json.message || 'Connection successful' }
    } catch (e) {
      return { success: false, message: 'Connection failed' }
    }
  }

  // Test AI provider connection
  async function testAIConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/config/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config.ai)
      })
      const json = await res.json()

      // 显示完整的后端响应信息
      if (!json.success) {
        // 如果失败，显示详细错误（包括 HTTP 状态码）
        const statusInfo = res.ok ? '' : `\n\nHTTP ${res.status} ${res.statusText}`
        return {
          success: false,
          message: json.message + statusInfo
        }
      }

      return {
        success: json.success,
        message: json.message || 'AI 连接成功'
      }
    } catch (e: any) {
      return {
        success: false,
        message: `AI 连接测试失败: 无法连接到服务器\n\n错误详情: ${e.message}`
      }
    }
  }

  // Note: Call loadConfig() from the component that uses this store

  return {
    config,
    isLoading,
    isOnline,
    lastError,
    loadConfig,
    saveConfig,
    testConnection,
    testAIConnection
  }
})
