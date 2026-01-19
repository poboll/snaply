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

export interface AppConfig {
  storageType: StorageType
  site: SiteConfig
  advanced: AdvancedConfig
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

  // Note: Call loadConfig() from the component that uses this store

  return {
    config,
    isLoading,
    isOnline,
    lastError,
    loadConfig,
    saveConfig,
    testConnection
  }
})
