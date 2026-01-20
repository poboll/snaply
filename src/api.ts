/**
 * API Service Layer
 * Handles all HTTP requests to the backend
 */

const BASE_URL = '/api'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface ImageMeta {
  id: string
  name: string
  url: string
  size: string
  date: string
  dimensions: string
  tags: string[]
}

export const api = {
  // Images
  async getImages(): Promise<ImageMeta[]> {
    const res = await fetch(`${BASE_URL}/images`)
    const json: ApiResponse<ImageMeta[]> = await res.json()
    return json.data || []
  },

  async uploadImages(files: File[], tags: string[] = []): Promise<ImageMeta[]> {
    const formData = new FormData()

    // ✅ 关键修复：使用相同的 key 'files' 多次 append
    // 这样后端才能接收到所有文件作为数组
    files.forEach(file => {
      formData.append('files', file)
      console.log(`[API] Appending file: ${file.name}`)
    })

    if (tags.length > 0) {
      formData.append('tags', tags.join(','))
    }

    console.log(`[API] Uploading ${files.length} files...`)

    const res = await fetch(`${BASE_URL}/images/upload`, {
      method: 'POST',
      body: formData
    })
    const json: ApiResponse<ImageMeta[]> = await res.json()

    console.log(`[API] Upload response:`, json)

    return json.data || []
  },

  async deleteImage(id: string): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/images/${id}`, {
      method: 'DELETE'
    })
    const json: ApiResponse<null> = await res.json()
    return json.success
  },

  async addTag(imageId: string, tag: string): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/images/${imageId}/tags`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag })
    })
    const json: ApiResponse<null> = await res.json()
    return json.success
  },

  async removeTag(imageId: string, tag: string): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/images/${imageId}/tags/${encodeURIComponent(tag)}`, {
      method: 'DELETE'
    })
    const json: ApiResponse<null> = await res.json()
    return json.success
  },

  // Config
  async getConfig(): Promise<Record<string, unknown>> {
    const res = await fetch(`${BASE_URL}/config`)
    const json: ApiResponse<Record<string, unknown>> = await res.json()
    return json.data || {}
  },

  async updateConfig(config: Record<string, unknown>): Promise<boolean> {
    const res = await fetch(`${BASE_URL}/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    const json: ApiResponse<null> = await res.json()
    return json.success
  }
}
