import { Hono } from 'hono'
import { nanoid } from 'nanoid'
import { db } from '../database.js'
import type { StorageAdapter, ImageMeta } from '../storage/types.js'
import { loadConfig, buildImageUrl, type AIConfig } from './config.js'
import sharp from 'sharp'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { logger } from '../utils/logger.js'

/**
 * Generate AI tags using configured provider
 */
async function generateAITags(aiConfig: AIConfig, imageBuffer: Buffer, mimeType: string): Promise<string[]> {
  const provider = aiConfig.provider || 'ollama'

  // 大图片压缩（>2MB 压缩到合适大小）
  let processedBuffer = imageBuffer
  const MAX_SIZE = 2 * 1024 * 1024 // 2MB

  if (imageBuffer.length > MAX_SIZE) {
    logger.debug(`[AI] 图片过大 (${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB)，开始压缩...`)
    try {
      // 使用 sharp 压缩图片
      processedBuffer = await sharp(imageBuffer)
        .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer()
      logger.debug(`[AI] 压缩完成 (${(processedBuffer.length / 1024 / 1024).toFixed(2)}MB)`)
    } catch (e) {
      logger.error('[AI] 图片压缩失败，使用原图:', e)
    }
  }

  switch (provider) {
    case 'ollama':
      return await generateOllamaTags(aiConfig, processedBuffer, mimeType)
    case 'gemini':
      return await generateGeminiTags(aiConfig, processedBuffer, mimeType)
    case 'qwen':
      return await generateQwenTags(aiConfig, processedBuffer, mimeType)
    case 'zhipu':
      return await generateZhipuTags(aiConfig, processedBuffer, mimeType)
    case 'siliconflow':
      return await generateSiliconFlowTags(aiConfig, processedBuffer, mimeType)
    default:
      throw new Error(`Unknown AI provider: ${provider}`)
  }
}

/**
 * Ollama Provider (Local, no API key required)
 */
async function generateOllamaTags(aiConfig: AIConfig, imageBuffer: Buffer, mimeType: string): Promise<string[]> {
  const baseUrl = aiConfig.baseUrl || 'http://localhost:11434'
  const model = aiConfig.model || 'llava'

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: 'Generate 3-5 tags for this image in English. Output ONLY the tags separated by commas, no other text.',
      images: [imageBuffer.toString('base64')],
      stream: false
    })
  })

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`)
  }

  const data = await response.json()
  const text = data.response || ''

  return text.split(',').map((t: string) => t.trim()).filter(Boolean)
}

/**
 * Google Gemini Provider
 */
async function generateGeminiTags(aiConfig: AIConfig, imageBuffer: Buffer, mimeType: string): Promise<string[]> {
  if (!aiConfig.apiKey) {
    throw new Error('Gemini API key is required')
  }

  const genAI = new GoogleGenerativeAI(aiConfig.apiKey)
  const model = genAI.getGenerativeModel({ model: aiConfig.model || "gemini-1.5-flash" })

  const prompt = "Analyze this image and provide 3-5 relevant, concise tags (keywords) describing the content. Output ONLY the tags separated by commas, no other text."

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType
      }
    }
  ])

  const response = await result.response
  const text = response.text()

  return text.split(',').map(t => t.trim()).filter(Boolean)
}

/**
 * Alibaba Qwen (通义千问) Provider
 */
async function generateQwenTags(aiConfig: AIConfig, imageBuffer: Buffer, mimeType: string): Promise<string[]> {
  if (!aiConfig.apiKey) {
    throw new Error('Qwen API key is required')
  }

  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${aiConfig.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: aiConfig.model || 'qwen-vl-max',
      input: {
        messages: [
          {
            role: 'user',
            content: [
              {
                image: `data:${mimeType};base64,${imageBuffer.toString('base64')}`
              },
              {
                text: 'Generate 3-5 tags for this image in English. Output ONLY the tags separated by commas, no other text.'
              }
            ]
          }
        ]
      }
    })
  })

  if (!response.ok) {
    throw new Error(`Qwen API error: ${response.statusText}`)
  }

  const data = await response.json()
  const text = data.output?.choices?.[0]?.message?.content?.[0]?.text || ''

  return text.split(',').map((t: string) => t.trim()).filter(Boolean)
}

/**
 * Zhipu AI (智谱) Provider
 */
async function generateZhipuTags(aiConfig: AIConfig, imageBuffer: Buffer, mimeType: string): Promise<string[]> {
  if (!aiConfig.apiKey) {
    throw new Error('Zhipu API key is required')
  }

  const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${aiConfig.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: aiConfig.model || 'glm-4v',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBuffer.toString('base64')}`
              }
            },
            {
              type: 'text',
              text: 'Generate 3-5 tags for this image in English. Output ONLY the tags separated by commas, no other text.'
            }
          ]
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    logger.error(`[AI] Zhipu API 错误响应:`, errorText)
    throw new Error(`Zhipu API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content || ''

  return text.split(',').map((t: string) => t.trim()).filter(Boolean)
}

/**
 * SiliconFlow (硅基流动) Provider
 */
async function generateSiliconFlowTags(aiConfig: AIConfig, imageBuffer: Buffer, mimeType: string): Promise<string[]> {
  if (!aiConfig.apiKey) {
    throw new Error('SiliconFlow API key is required')
  }

  // 优化后的中文提示词
  const prompt = `Role: AI Visual Tagger for Personal Cloud Storage.
Task: Analyze the image and provide exactly two tags in Simplified Chinese.

Format: [Main_Category], [Sub_Tag]

Rules:
1. Output Language: MUST be Simplified Chinese (简体中文).
2. Main_Category: Choose ONE from this fixed list: [工作, 生活, 风景, 文档, 证件, 截图, 其它].
3. Sub_Tag: A specific object or scene (max 4 characters).
4. CRITICAL CONSTRAINT: Output PURE TEXT only. Do NOT use "<|begin_of_box|>", "<|end_of_box|>", or any XML/HTML tags. Do not use bounding box coordinates.

Example Output:
风景, 雪山
文档, 发票
生活, 合照`

  const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${aiConfig.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: aiConfig.model || 'THUDM/GLM-4.1V-9B-Thinking',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBuffer.toString('base64')}`
              }
            },
            {
              type: 'text',
              text: prompt
            }
          ]
        }
      ],
      max_tokens: 100,
      temperature: 0.7,
      top_p: 0.9
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    logger.error(`[AI] SiliconFlow API 错误响应:`, errorText)
    throw new Error(`SiliconFlow API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  const text = data.choices?.[0]?.message?.content || ''

  // 解析返回的标签（格式: "风景, 雪山" -> ["风景", "雪山"]）
  return text.split(',').map((t: string) => t.trim()).filter(Boolean)
}

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
    // ✅ 修复：手动解析 FormData 以支持多文件上传
    const formData = await c.req.formData()

    // 获取所有 'files' 字段的文件
    const fileList: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key === 'files' && value instanceof File) {
        fileList.push(value)
      }
    }

    // 获取标签
    const tagsRaw = formData.get('tags')
    const tags = typeof tagsRaw === 'string'
      ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
      : []

    logger.info(`[Upload] Received ${fileList.length} files`)

    if (fileList.length === 0) {
      return c.json({ success: false, error: 'No files uploaded' }, 400)
    }

    // Load config to build URLs
    const config = await loadConfig()
    const results: ImageMeta[] = []

    for (const file of fileList) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const ext = file.name.split('.').pop() || 'jpg'
      const id = nanoid(10)
      const filename = `${id}.${ext}`

      // Save to storage (returns relative path/filename)
      await storage.save(buffer, filename, file.type)

      // Build full public URL using config
      const url = buildImageUrl(config, filename)

      // Get image dimensions using sharp
      let dimensions = 'Unknown'
      try {
        const metadata = await sharp(buffer).metadata()
        if (metadata.width && metadata.height) {
          dimensions = `${metadata.width}x${metadata.height}`
        }
      } catch (e) {
        logger.warn(`Failed to get dimensions for ${filename}:`, e)
      }

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

      logger.info(`[Upload] ✅ Saved ${file.name} (${id})`)

      // AI Auto-Tagging (异步后台处理，不阻塞上传)
      if (config.ai && config.ai.enabled) {
        logger.debug(`[AI] 开始异步自动打标 - Provider: ${config.ai.provider}`)
        // 不等待 AI 结果，直接在后台处理
        generateAITags(config.ai, buffer, file.type || 'image/jpeg')
          .then(async aiTags => {
            logger.debug(`[AI] 成功生成标签 (${id}):`, aiTags)

            // 从数据库获取当前图片的最新标签
            const currentImage = await db.getById(id)
            if (!currentImage) {
              logger.error(`[AI] 图片 ${id} 不存在，无法更新标签`)
              return
            }

            const currentTags = currentImage.tags || []

            // 过滤出新标签（不重复的）
            const newTags = aiTags
              .filter(t => t.length > 0 && !currentTags.includes(t))
              .slice(0, 5)

            if (newTags.length > 0) {
              // 合并标签：现有标签 + AI 新标签
              const updatedTags = [...currentTags, ...newTags]
              await db.update(id, { tags: updatedTags })
              logger.debug(`[AI] ✅ 标签已更新 (${id}):`, updatedTags)
            } else {
              logger.debug(`[AI] ⚠️ 没有新标签需要添加 (${id})`)
            }
          })
          .catch(e => {
            logger.error(`[AI] 自动打标失败 (${config.ai.provider}):`, e)
          })
      }
    }

    logger.info(`[Upload] 🎉 Successfully uploaded ${results.length} files`)
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

  // Batch re-tag images without tags
  app.post('/retag-untagged', async (c) => {
    const config = await loadConfig()

    // 检查 AI 是否启用
    if (!config.ai || !config.ai.enabled) {
      return c.json({ success: false, error: 'AI 功能未启用' }, 400)
    }

    // 获取所有图片
    const allImages = await db.getAll()

    // 筛选出没有标签或标签为空的图片
    const untaggedImages = allImages.filter(img => !img.tags || img.tags.length === 0)

    if (untaggedImages.length === 0) {
      return c.json({ success: true, message: '所有图片都已有标签', processed: 0, total: 0 })
    }

    logger.info(`[Batch Retag] 开始批量打标，共 ${untaggedImages.length} 张无标签图片`)

    // 异步处理，立即返回
    processUntaggedImages(untaggedImages, config.ai, storage)

    return c.json({
      success: true,
      message: `已开始处理 ${untaggedImages.length} 张图片，请稍后刷新查看结果`,
      total: untaggedImages.length
    })
  })

  return app
}

// 异步批量处理无标签图片
async function processUntaggedImages(images: any[], aiConfig: AIConfig, storage: any) {
  let processed = 0

  for (const image of images) {
    try {
      logger.debug(`[Batch Retag] 处理中 ${processed + 1}/${images.length}: ${image.name}`)

      // 从 URL 提取文件名
      const urlParts = image.url.split('/')
      const filename = urlParts[urlParts.length - 1]

      // 从存储读取图片数据
      const imageBuffer = await storage.get(filename)

      if (!imageBuffer) {
        logger.error(`[Batch Retag] 无法读取图片: ${filename}`)
        processed++
        continue
      }

      // 调用 AI 生成标签
      const aiTags = await generateAITags(aiConfig, imageBuffer, 'image/jpeg')

      if (aiTags && aiTags.length > 0) {
        // 更新数据库
        await db.update(image.id, { tags: aiTags })
        logger.info(`[Batch Retag] ✅ ${image.name} - 标签: ${aiTags.join(', ')}`)
      }

      processed++
    } catch (e) {
      logger.error(`[Batch Retag] ❌ 处理失败 ${image.name}:`, e)
      processed++
    }
  }

  logger.info(`[Batch Retag] 完成！已处理 ${processed}/${images.length} 张图片`)
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Export the AI tagging function so config.ts can use it for testing
export { generateAITags }
