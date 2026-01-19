import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, type ImageMeta } from '../api'

export interface ImageFile extends ImageMeta {}

export const useImageStore = defineStore('images', () => {
  // View state
  const currentView = ref<'upload' | 'gallery' | 'api' | 'config'>('gallery')
  const currentTag = ref<string>('all')
  const isLoading = ref(false)
  const isOnline = ref(true) // Track if backend is available
  
  // Image data
  const images = ref<ImageFile[]>([])

  // Selection state
  const selectedId = ref<string | null>(null)

  const selectedImage = computed(() => 
    images.value.find(img => img.id === selectedId.value)
  )

  const filteredImages = computed(() => {
    if (currentTag.value === 'all') return images.value
    return images.value.filter(img => img.tags.includes(currentTag.value))
  })

  const allTags = computed(() => {
    const tags = new Set<string>()
    images.value.forEach(img => img.tags.forEach(t => tags.add(t)))
    return Array.from(tags).sort()
  })

  // Load images from backend
  async function loadImages() {
    isLoading.value = true
    try {
      const data = await api.getImages()
      images.value = data
      isOnline.value = true
      if (data.length > 0 && !selectedId.value) {
        selectedId.value = data[0].id
      }
    } catch (e) {
      console.warn('Backend not available, using offline mode')
      isOnline.value = false
    } finally {
      isLoading.value = false
    }
  }

  // Actions
  function switchView(view: 'upload' | 'gallery' | 'api' | 'config') {
    currentView.value = view
  }

  function selectImage(id: string) {
    selectedId.value = id
  }

  function setTagFilter(tag: string) {
    currentTag.value = tag
  }

  async function uploadFiles(files: File[], tags: string[] = []): Promise<ImageFile[]> {
    if (!isOnline.value) {
      // Offline fallback: process locally
      const results: ImageFile[] = []
      for (const file of files) {
        const url = await readFileAsDataURL(file)
        const img: ImageFile = {
          id: Date.now().toString() + Math.random().toString().slice(2, 6),
          name: file.name,
          url,
          size: formatSize(file.size),
          date: new Date().toLocaleDateString(),
          dimensions: 'Unknown',
          tags: tags.length > 0 ? tags : ['upload', 'offline']
        }
        images.value.unshift(img)
        results.push(img)
      }
      selectedId.value = results[0]?.id || null
      return results
    }

    try {
      const results = await api.uploadImages(files, tags)
      // Reload all images to stay in sync
      await loadImages()
      return results
    } catch (e) {
      console.error('Upload failed:', e)
      throw e
    }
  }

  async function addTag(imageId: string, tag: string) {
    const img = images.value.find(i => i.id === imageId)
    if (!img) return

    // Optimistic update
    if (!img.tags.includes(tag)) {
      img.tags.push(tag)
    }

    if (isOnline.value) {
      try {
        await api.addTag(imageId, tag)
      } catch (e) {
        // Rollback on error
        img.tags = img.tags.filter(t => t !== tag)
        console.error('Failed to add tag:', e)
      }
    }
  }

  async function removeTag(imageId: string, tag: string) {
    const img = images.value.find(i => i.id === imageId)
    if (!img) return

    // Optimistic update
    const originalTags = [...img.tags]
    img.tags = img.tags.filter(t => t !== tag)

    if (isOnline.value) {
      try {
        await api.removeTag(imageId, tag)
      } catch (e) {
        // Rollback on error
        img.tags = originalTags
        console.error('Failed to remove tag:', e)
      }
    }
  }

  async function deleteSelected() {
    if (!selectedId.value) return
    
    const id = selectedId.value
    const index = images.value.findIndex(img => img.id === id)
    
    if (index > -1) {
      // Optimistic update
      const deleted = images.value.splice(index, 1)[0]
      selectedId.value = filteredImages.value[0]?.id || null

      if (isOnline.value) {
        try {
          await api.deleteImage(id)
        } catch (e) {
          // Rollback on error
          images.value.splice(index, 0, deleted)
          selectedId.value = id
          console.error('Failed to delete:', e)
        }
      }
    }
  }

  // Helper functions
  function readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Note: Call loadImages() from the component that uses this store

  return {
    currentView,
    images,
    filteredImages,
    allTags,
    currentTag,
    selectedId,
    selectedImage,
    isLoading,
    isOnline,
    switchView,
    selectImage,
    setTagFilter,
    loadImages,
    uploadFiles,
    addTag,
    removeTag,
    deleteSelected
  }
})
