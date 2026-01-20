<script setup lang="ts">
import { useImageStore } from '../stores/imageStore'
import { useClipboard } from '@vueuse/core'
import { ref } from 'vue'

const store = useImageStore()
const { copy } = useClipboard()

const copyFeedback = ref<{ [key: string]: boolean }>({})
const newTagInput = ref('')

const copyToClipboard = async (text: string, type: 'direct' | 'markdown') => {
  await copy(text)
  copyFeedback.value[type] = true
  setTimeout(() => {
    copyFeedback.value[type] = false
  }, 2000)
}

const copyBase64 = async () => {
  if (!store.selectedImage) return

  try {
    const response = await fetch(store.selectedImage.url)
    const blob = await response.blob()
    const reader = new FileReader()

    reader.onloadend = async () => {
      const base64data = reader.result as string
      await copy(base64data)
      copyFeedback.value['base64'] = true
      setTimeout(() => {
        copyFeedback.value['base64'] = false
      }, 2000)
    }

    reader.readAsDataURL(blob)
  } catch (e) {
    console.error('Failed to convert to base64', e)
  }
}

const handleAddTag = () => {
  if (!store.selectedId || !newTagInput.value.trim()) return
  store.addTag(store.selectedId, newTagInput.value.trim())
  newTagInput.value = ''
}
</script>

<template>
  <div class="flex flex-col md:flex-row h-full w-full">
    <!-- Left: Image Grid -->
    <div class="flex-1 bg-white overflow-y-auto p-2 border-r border-win-gray-light min-h-0">
      
      <!-- Toolbar/Selection info -->
      <div class="flex flex-wrap gap-2 justify-between items-center mb-2 px-1 text-xs text-gray-500">
        <div class="flex items-center gap-2">
           <span>过滤:</span>
           <select 
             :value="store.currentTag" 
             @change="(e) => store.setTagFilter((e.target as HTMLSelectElement).value)"
             class="bg-win-gray border border-gray-400 text-black px-1 py-0.5 outline-none shadow-win-button"
           >
             <option value="all">所有标签</option>
             <option v-for="tag in store.allTags" :key="tag" :value="tag">{{ tag }}</option>
           </select>
        </div>
        <div class="flex gap-2">
           <span>{{ store.filteredImages.length }} 项</span>
           <button class="hover:underline text-win-blue" @click="store.setTagFilter('all')">重置</button>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 auto-rows-min pb-4">
        <!-- Loading State -->
        <div v-if="store.isLoading" class="col-span-full py-10 text-center text-gray-400 text-sm">
          <span class="animate-pulse">Loading images...</span>
        </div>

        <div 
          v-else
          v-for="img in store.filteredImages" 
          :key="img.id"
          @click="store.selectImage(img.id)"
          class="flex flex-col items-center group cursor-pointer"
        >
          <div 
            :class="[
              'p-1 border-2 w-full aspect-square flex items-center justify-center bg-gray-50 overflow-hidden relative',
              store.selectedId === img.id ? 'border-dashed border-blue-700' : 'border-transparent hover:border-gray-200'
            ]"
          >
             <!-- Selection Checkbox -->
             <div v-if="store.selectedId === img.id" class="absolute top-1 left-1 w-3 h-3 border border-black bg-white z-10">
                <div class="w-full h-full bg-black transform scale-50"></div>
             </div>
             
             <!-- Tag Badge (Small) -->
             <div class="absolute bottom-1 right-1 bg-yellow-100 text-[10px] px-1 border border-gray-400 opacity-80 truncate max-w-[80%]" v-if="img.tags.length">
               {{ img.tags[0] }}{{ img.tags.length > 1 ? ` +${img.tags.length - 1}` : '' }}
             </div>

             <img :src="img.url" class="max-w-full max-h-full object-contain" draggable="false" />
          </div>
          <div class="text-[10px] text-center mt-1 w-full truncate px-1">{{ img.name }}</div>
        </div>
        
        <!-- Empty State -->
        <div v-if="!store.isLoading && store.filteredImages.length === 0" class="col-span-full py-10 text-center text-gray-400 text-sm">
          <div v-if="store.images.length === 0">
            <p>暂无图片</p>
            <button 
              @click="store.switchView('upload')" 
              class="mt-2 px-3 py-1 bg-win-gray shadow-win-button text-xs"
            >
              上传第一张
            </button>
          </div>
          <div v-else>
            没有找到符合条件的图片
          </div>
        </div>
      </div>
    </div>

    <!-- Right: Details Pane -->
    <div class="w-full md:w-72 bg-win-gray flex flex-col p-2 border-t md:border-t-0 md:border-l border-win-gray-dark shadow-win-outset z-10 shrink-0 h-72 md:h-auto overflow-y-auto" v-if="store.selectedImage">
      <div class="font-bold text-sm mb-2 truncate px-1 bg-win-gray-light border border-gray-400 text-black">
        {{ store.selectedImage.name }}
      </div>

      <!-- Preview Box -->
      <div class="bg-white border-2 border-win-gray-dark border-r-white border-b-white shadow-inner p-1 mb-2 flex items-center justify-center h-32 md:h-48 bg-opacity-50 shrink-0">
        <img :src="store.selectedImage.url" class="max-w-full max-h-full object-contain" />
      </div>

      <!-- Metadata -->
      <div class="border border-win-gray-dark border-b-white border-r-white p-2 text-xs text-gray-600 space-y-1 mb-4 bg-win-gray font-mono">
        <div class="flex justify-between">
          <span>尺寸:</span>
          <span>{{ store.selectedImage.dimensions }}</span>
        </div>
        <div class="flex justify-between">
          <span>大小:</span>
          <span>{{ store.selectedImage.size }}</span>
        </div>
        <div class="flex justify-between">
          <span>日期:</span>
          <span>{{ store.selectedImage.date }}</span>
        </div>
      </div>

      <!-- Tag Management -->
      <div class="mb-4">
        <label class="block text-xs mb-1">标签管理</label>
        <div class="flex flex-wrap gap-1 mb-2">
           <span 
             v-for="tag in store.selectedImage.tags" 
             :key="tag"
             class="inline-flex items-center px-1.5 py-0.5 bg-white border border-gray-400 text-[10px] shadow-sm"
           >
             {{ tag }}
             <button @click="store.removeTag(store.selectedImage!.id, tag)" class="ml-1 text-red-500 hover:text-red-700 font-bold leading-none">×</button>
           </span>
           <span v-if="store.selectedImage.tags.length === 0" class="text-xs text-gray-400 italic">无标签</span>
        </div>
        <div class="flex gap-1">
           <input 
             v-model="newTagInput"
             @keydown.enter="handleAddTag"
             placeholder="新标签..."
             class="flex-1 text-xs border border-gray-500 shadow-win-inset px-1 py-0.5 bg-white outline-none" 
           />
           <button 
              @click="handleAddTag"
              class="px-2 py-0.5 text-xs bg-win-gray shadow-win-button active:shadow-win-button-pressed min-w-[30px]"
           >
             +
           </button>
        </div>
      </div>

      <!-- Links -->
      <div class="space-y-3 flex-1">
        <div>
          <label class="block text-xs mb-1">直链</label>
          <div class="flex gap-1">
             <input readonly :value="store.selectedImage.url" class="flex-1 text-xs border border-gray-500 shadow-win-inset px-1 py-0.5 bg-white text-gray-600 outline-none" />
             <button 
                @click="copyToClipboard(store.selectedImage.url, 'direct')"
                class="px-2 py-0.5 text-xs bg-win-gray shadow-win-button active:shadow-win-button-pressed min-w-[40px]"
             >
               {{ copyFeedback['direct'] ? 'OK' : '复制' }}
             </button>
          </div>
        </div>

        <div>
          <label class="block text-xs mb-1">MARKDOWN</label>
          <div class="flex gap-1">
             <input readonly :value="`![${store.selectedImage.name}](${store.selectedImage.url})`" class="flex-1 text-xs border border-gray-500 shadow-win-inset px-1 py-0.5 bg-white text-gray-600 outline-none" />
             <button
                @click="copyToClipboard(`![${store.selectedImage.name}](${store.selectedImage.url})`, 'markdown')"
                class="px-2 py-0.5 text-xs bg-win-gray shadow-win-button active:shadow-win-button-pressed min-w-[40px]"
             >
               {{ copyFeedback['markdown'] ? 'OK' : '复制' }}
             </button>
          </div>
        </div>

        <!-- Base64 Copy -->
        <div>
          <label class="block text-xs mb-1">Base64</label>
          <button
            @click="copyBase64"
            class="w-full px-2 py-1 text-xs bg-win-gray shadow-win-button active:shadow-win-button-pressed flex justify-center items-center gap-1"
          >
            <span>{{ copyFeedback['base64'] ? '已复制 Base64!' : '复制 Base64 编码' }}</span>
          </button>
        </div>
      </div>

      <!-- Delete Button -->
      <button 
        @click="store.deleteSelected"
        class="mt-4 w-full py-1 text-xs bg-pink-100 text-red-800 border border-red-300 hover:bg-red-100 flex items-center justify-center gap-1 shadow-win-button active:shadow-win-button-pressed active:border-transparent"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        删除文件
      </button>
    </div>
    
    <!-- Empty Selection State -->
    <div v-else class="w-full md:w-72 bg-win-gray flex items-center justify-center text-xs text-gray-500 border-t md:border-t-0 md:border-l border-win-gray-light shrink-0 h-12 md:h-auto">
      未选择对象
    </div>
  </div>
</template>
