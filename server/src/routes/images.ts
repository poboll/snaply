import { Hono } from 'hono'
import { nanoid } from 'nanoid'
import { db } from '../database.js'
import type { StorageAdapter, ImageMeta } from '../storage/types.js'
import { loadConfig, buildImageUrl } from './config.js'

/**
 * Image Routes
 * Handles upload, list, get, delete operations
 */
export function createImageRoutes(storage: StorageAdapter) {
  const app = new Hono()

  // List all images
  app.get('/', async (c) => {
    const images = await db.getAll()
    const config = await loadConfig()
    
    // Dynamically rebuild URLs based on current config
    const imagesWithFullUrls = images.map(img => {
      // Extract filename from stored URL (works for local /uploads/foo.jpg and s3 URLs)
      const filename = img.url.split('/').pop() || img.id
      return {
        ...img,
        url: buildImageUrl(config, filename)
      }
    })

    return c.json({ success: true, data: imagesWithFullUrls })
  })

  // Get single image
  app.get('/:id', async (c) => {
    const id = c.req.param('id')
    const image = await db.getById(id)
    if (!image) {
      return c.json({ success: false, error: 'Image not found' }, 404)
    }

    const config = await loadConfig()
    const filename = image.url.split('/').pop() || image.id
    const imageWithFullUrl = {
      ...image,
      url: buildImageUrl(config, filename)
    }

    return c.json({ success: true, data: imageWithFullUrl })
  })

  // Upload image(s)
  app.post('/upload', async (c) => {
    const body = await c.req.parseBody()
    const files = body['files'] || body['file']
    
    if (!files) {
      return c.json({ success: false, error: 'No files uploaded' }, 400)
    }

    // Load config to build URLs
    const config = await loadConfig()

    const fileList = Array.isArray(files) ? files : [files]
    const results: ImageMeta[] = []

    for (const file of fileList) {
      if (!(file instanceof File)) continue
      
      const buffer = Buffer.from(await file.arrayBuffer())
      const ext = file.name.split('.').pop() || 'jpg'
      const id = nanoid(10)
      const filename = `${id}.${ext}`
      
      // Save to storage (returns relative path/filename)
      await storage.save(buffer, filename, file.type)
      
      // Build full public URL using config
      const url = buildImageUrl(config, filename)
      
      // Get image dimensions (simplified - would use sharp in production)
      const dimensions = 'Unknown'
      
      // Parse tags from form data
      const tagsRaw = body['tags']
      const tags = typeof tagsRaw === 'string' 
        ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
        : []
      
      const imageMeta: ImageMeta = {
        id,
        name: file.name,
        url,
        size: formatSize(file.size),
        date: new Date().toLocaleDateString(),
        dimensions,
        tags
      }
      
      await db.add(imageMeta)
      results.push(imageMeta)
    }

    return c.json({ success: true, data: results })
  })

  // Delete image
  app.delete('/:id', async (c) => {
    const id = c.req.param('id')
    const image = await db.getById(id)
    
    if (!image) {
      return c.json({ success: false, error: 'Image not found' }, 404)
    }
    
    // Extract filename from URL
    const urlParts = image.url.split('/')
    const filename = urlParts[urlParts.length - 1]
    
    await storage.delete(filename)
    await db.delete(id)
    
    return c.json({ success: true })
  })

  // Add tag
  app.post('/:id/tags', async (c) => {
    const id = c.req.param('id')
    const { tag } = await c.req.json<{ tag: string }>()
    
    const success = await db.addTag(id, tag)
    if (!success) {
      return c.json({ success: false, error: 'Failed to add tag' }, 400)
    }
    
    return c.json({ success: true })
  })

  // Remove tag
  app.delete('/:id/tags/:tag', async (c) => {
    const id = c.req.param('id')
    const tag = c.req.param('tag')
    
    const success = await db.removeTag(id, tag)
    if (!success) {
      return c.json({ success: false, error: 'Failed to remove tag' }, 400)
    }
    
    return c.json({ success: true })
  })

  return app
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
