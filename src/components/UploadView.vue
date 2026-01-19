<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useDropZone } from '@vueuse/core'
import { useImageStore } from '../stores/imageStore'

const store = useImageStore()
const dropZoneRef = ref<HTMLElement>()
const fileInput = ref<HTMLInputElement>()
const logContainerRef = ref<HTMLElement>()

// State
const isUploading = ref(false)
const logs = ref<string[]>([])
const processedCount = ref(0)
const totalFiles = ref(0)
const customTags = ref('')

const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop: (files) => {
    if (files && files.length > 0) {
      handleFiles(Array.from(files))
    }
  },
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const onFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    handleFiles(Array.from(target.files))
  }
}

const addLog = (msg: string) => {
  const time = new Date().toLocaleTimeString('en-US', { hour12: false })
  logs.value.push(`[${time}] ${msg}`)
  nextTick(() => {
    if (logContainerRef.value) {
      logContainerRef.value.scrollTop = logContainerRef.value.scrollHeight
    }
  })
}

const handleFiles = async (files: File[]) => {
  const imageFiles = files.filter(f => f.type.startsWith('image/'))
  
  if (imageFiles.length === 0) {
    alert('请选择有效的图片文件！')
    return
  }

  isUploading.value = true
  logs.value = []
  processedCount.value = 0
  totalFiles.value = imageFiles.length
  
  const tagsToApply = customTags.value
    .split(' ')
    .map(t => t.trim())
    .filter(t => t.length > 0)
  
  addLog(`SYSTEM_INIT: Detected ${imageFiles.length} files.`)
  addLog(`MODE: ${store.isOnline ? 'ONLINE (Server Upload)' : 'OFFLINE (Local Only)'}`)
  if (tagsToApply.length > 0) {
    addLog(`CONFIG: Applying tags [${tagsToApply.join(', ')}]`)
  }
  addLog(`BATCH_PROCESS_STARTED...`)

  // Upload all files at once to the server
  try {
    const results = await store.uploadFiles(imageFiles, tagsToApply)
    processedCount.value = results.length
    
    for (const img of results) {
      addLog(`SUCCESS: ${img.name} uploaded.`)
    }
    
    addLog(`BATCH_COMPLETED: ${processedCount.value}/${totalFiles.value} files finished.`)
    addLog(`REDIRECTING to Gallery in 2s...`)
  } catch (e) {
    addLog(`ERROR: Upload failed - ${e}`)
  }

  setTimeout(() => {
    isUploading.value = false
    customTags.value = ''
    store.switchView('gallery')
  }, 2000)
}
</script>

<template>
  <div class="flex flex-col h-full w-full bg-win-gray-light p-4">
    <!-- Drop Zone / Terminal -->
    <div 
      ref="dropZoneRef"
      :class="[
        'flex-1 border-4 flex flex-col items-center justify-center transition-all duration-200 relative overflow-hidden',
        isUploading ? 'bg-black border-win-gray-dark border-inset shadow-inner items-start justify-start p-4 font-mono' : 
        (isOverDropZone ? 'border-dashed border-win-blue bg-blue-50' : 'border-dashed border-gray-400 bg-white')
      ]"
    >
      <!-- Normal Mode -->
      <div v-if="!isUploading" class="flex flex-col items-center gap-4 w-full h-full justify-center pointer-events-auto">
        <div class="pointer-events-none flex flex-col items-center">
          <svg class="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="square" stroke-linejoin="miter" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <div class="text-gray-500 font-mono tracking-widest text-sm mb-1">BATCH_UPLOAD.EXE</div>
          <div class="text-xs text-gray-400 mb-3">支持多文件批量拖拽</div>
        </div>
        
        <!-- Tag Input Section -->
        <div class="w-64 mb-2">
           <label class="text-xs text-gray-500 mb-1 block">预设标签 (空格分隔):</label>
           <input 
             v-model="customTags" 
             placeholder="例如: wallpaper 2024"
             class="w-full px-2 py-1 text-sm border shadow-win-inset outline-none focus:border-win-blue"
             @keydown.enter="triggerFileInput" 
           />
        </div>

        <button 
          @click="triggerFileInput"
          class="px-6 py-1 bg-win-gray shadow-win-button active:shadow-win-button-pressed hover:bg-gray-200 font-sans text-sm"
        >
          [ 选择文件... ]
        </button>
        <input type="file" ref="fileInput" class="hidden" accept="image/*" multiple @change="onFileSelect">
      </div>

      <!-- Terminal Mode (Batch Processing) -->
      <div v-else class="w-full h-full flex flex-col">
        <div class="text-green-500 text-xs mb-2 border-b border-green-800 pb-1 w-full">
           Running task: UPLOAD_QUEUE [{{ processedCount }}/{{ totalFiles }}]
        </div>
        <div ref="logContainerRef" class="flex-1 w-full overflow-y-auto font-mono text-xs space-y-1 pr-2">
          <div v-for="(log, idx) in logs" :key="idx" class="text-green-400 whitespace-pre-wrap font-bold animate-pulse-fast">
            {{ log }}
          </div>
        </div>
        <div class="mt-2 h-2 w-full bg-gray-800 border border-gray-600">
           <div class="h-full bg-green-600 transition-all duration-300" :style="{ width: `${(processedCount / totalFiles) * 100}%` }"></div>
        </div>
      </div>
    </div>

    <!-- Status Panel (Bottom) -->
    <div class="mt-4 border border-win-gray-dark shadow-win-inset bg-win-gray p-2 text-xs font-mono h-24 overflow-y-auto">
      <div class="flex items-center gap-2 mb-1 font-bold" :class="store.isOnline ? 'text-green-700' : 'text-yellow-700'">
        <span class="inline-block w-2 h-2 rounded-full animate-pulse" :class="store.isOnline ? 'bg-green-500' : 'bg-yellow-500'"></span>
        Server: {{ store.isOnline ? '在线' : '离线模式' }}
      </div>
      <div class="text-gray-600 pl-4 space-y-0.5">
        <p>> 后端: {{ store.isOnline ? 'Hono API Connected' : 'LocalStorage Fallback' }}</p>
        <p>> 标签: {{ customTags ? '用户输入: ' + customTags : '等待输入...' }}</p>
        <p>> 状态: 就绪</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse-fast {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
