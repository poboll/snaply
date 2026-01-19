import fs from 'fs/promises'
import path from 'path'
import type { ImageMeta } from './storage/types.js'

const DATA_FILE = path.join(process.cwd(), 'data', 'images.json')

/**
 * Simple JSON-based database for image metadata
 * Lightweight alternative to SQLite for small-scale usage
 */
export class Database {
  private images: ImageMeta[] = []
  private loaded = false

  async load() {
    if (this.loaded) return
    
    try {
      const dir = path.dirname(DATA_FILE)
      await fs.mkdir(dir, { recursive: true })
      
      const data = await fs.readFile(DATA_FILE, 'utf-8')
      this.images = JSON.parse(data)
    } catch {
      this.images = []
    }
    this.loaded = true
  }

  async save() {
    const dir = path.dirname(DATA_FILE)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(DATA_FILE, JSON.stringify(this.images, null, 2))
  }

  async getAll(): Promise<ImageMeta[]> {
    await this.load()
    return this.images
  }

  async getById(id: string): Promise<ImageMeta | undefined> {
    await this.load()
    return this.images.find(img => img.id === id)
  }

  async add(image: ImageMeta): Promise<void> {
    await this.load()
    this.images.unshift(image)
    await this.save()
  }

  async delete(id: string): Promise<boolean> {
    await this.load()
    const index = this.images.findIndex(img => img.id === id)
    if (index > -1) {
      this.images.splice(index, 1)
      await this.save()
      return true
    }
    return false
  }

  async update(id: string, updates: Partial<ImageMeta>): Promise<boolean> {
    await this.load()
    const image = this.images.find(img => img.id === id)
    if (image) {
      Object.assign(image, updates)
      await this.save()
      return true
    }
    return false
  }

  async addTag(id: string, tag: string): Promise<boolean> {
    await this.load()
    const image = this.images.find(img => img.id === id)
    if (image && !image.tags.includes(tag)) {
      image.tags.push(tag)
      await this.save()
      return true
    }
    return false
  }

  async removeTag(id: string, tag: string): Promise<boolean> {
    await this.load()
    const image = this.images.find(img => img.id === id)
    if (image) {
      image.tags = image.tags.filter(t => t !== tag)
      await this.save()
      return true
    }
    return false
  }
}

export const db = new Database()
