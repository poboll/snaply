import fs from 'fs/promises'
import path from 'path'
import type { StorageAdapter } from './types.js'

/**
 * Local File System Storage Adapter
 * Stores files directly on disk - perfect for VPS deployment
 */
export class LocalStorage implements StorageAdapter {
  private uploadDir: string
  private publicUrl: string

  constructor(uploadDir: string, publicUrl: string) {
    this.uploadDir = uploadDir
    this.publicUrl = publicUrl
    this.ensureDir()
  }

  private async ensureDir() {
    try {
      await fs.access(this.uploadDir)
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true })
    }
  }

  async save(file: Buffer, filename: string, _mimetype: string): Promise<string> {
    const filePath = path.join(this.uploadDir, filename)
    await fs.writeFile(filePath, file)
    return this.getUrl(filename)
  }

  async delete(id: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadDir, id)
      await fs.unlink(filePath)
      return true
    } catch {
      return false
    }
  }

  getUrl(id: string): string {
    return `${this.publicUrl}/${id}`
  }

  async exists(id: string): Promise<boolean> {
    try {
      await fs.access(path.join(this.uploadDir, id))
      return true
    } catch {
      return false
    }
  }

  async get(filename: string): Promise<Buffer | null> {
    try {
      const filePath = path.join(this.uploadDir, filename)
      const buffer = await fs.readFile(filePath)
      return buffer
    } catch {
      return null
    }
  }
}
