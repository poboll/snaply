<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useConfigStore } from '../stores/configStore'
import { useImageStore } from '../stores/imageStore'

const configStore = useConfigStore()
const imageStore = useImageStore()
const activeTab = ref<'general' | 'advanced'>('general')
const statusMsg = ref('')
const statusType = ref<'success' | 'error' | ''>('')
const isTesting = ref(false)

onMounted(() => {
  configStore.loadConfig()
})

const saveSettings = async () => {
  const success = await configStore.saveConfig()
  if (success) {
    statusMsg.value = 'Settings saved successfully!'
    statusType.value = 'success'
    // Reload images to apply new URL configuration
    await imageStore.loadImages()
  } else {
    statusMsg.value = configStore.lastError || 'Failed to save'
    statusType.value = 'error'
  }
  setTimeout(() => {
    statusMsg.value = ''
    statusType.value = ''
  }, 3000)
}

const testConnection = async () => {
  isTesting.value = true
  const result = await configStore.testConnection()
  if (result.success) {
    statusMsg.value = result.message
    statusType.value = 'success'
  } else {
    statusMsg.value = result.message
    statusType.value = 'error'
  }
  isTesting.value = false
  setTimeout(() => {
    statusMsg.value = ''
    statusType.value = ''
  }, 3000)
}
</script>

<template>
  <div class="h-full w-full bg-win-gray-light p-2 sm:p-4 overflow-y-auto font-sans flex items-start justify-center">
    <div class="w-full max-w-lg bg-win-gray border-2 border-white border-b-gray-800 border-r-gray-800 p-1 shadow-win-outset">
      
      <!-- Connection Status Banner -->
      <div 
        v-if="!configStore.isOnline" 
        class="bg-yellow-100 border border-yellow-400 text-yellow-800 px-2 py-1 text-xs mb-2 flex items-center gap-2"
      >
        <span class="w-2 h-2 bg-yellow-500 rounded-full"></span>
        Offline Mode - Changes will not be saved to server
      </div>

      <!-- Tab Headers -->
      <div class="flex gap-1 px-1 pt-1 mb-1">
        <button 
          @click="activeTab = 'general'"
          :class="[
            'px-3 py-1 text-sm border-t-2 border-l-2 border-r-2 rounded-t',
            activeTab === 'general' 
              ? 'bg-win-gray border-white border-b-win-gray relative z-10 -mb-[2px] pb-2' 
              : 'bg-gray-300 border-white text-gray-600'
          ]"
        >
          常规设置
        </button>
        <button 
          @click="activeTab = 'advanced'"
          :class="[
            'px-3 py-1 text-sm border-t-2 border-l-2 border-r-2 rounded-t',
            activeTab === 'advanced' 
              ? 'bg-win-gray border-white border-b-win-gray relative z-10 -mb-[2px] pb-2' 
              : 'bg-gray-300 border-white text-gray-600'
          ]"
        >
          高级
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="border-2 border-white border-r-gray-600 border-b-gray-600 p-4 min-h-[300px]">
        
        <!-- Loading State -->
        <div v-if="configStore.isLoading" class="flex items-center justify-center h-full">
          <span class="animate-pulse">Loading...</span>
        </div>

        <!-- General Settings -->
        <div v-else-if="activeTab === 'general'" class="space-y-4">
          
          <!-- Backend Selector -->
          <fieldset class="border border-win-gray-dark border-b-white border-r-white p-2">
            <legend class="text-xs px-1 text-blue-800 font-bold">存储后端</legend>
            <div class="flex flex-col gap-2">
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" v-model="configStore.config.storageType" value="local" />
                <span>Local Storage (Server Disk)</span>
              </label>
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" v-model="configStore.config.storageType" value="s3" />
                <span>Amazon S3 / Compatible</span>
              </label>
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" v-model="configStore.config.storageType" value="minio" />
                <span>Self-hosted MinIO (Docker)</span>
              </label>
            </div>
          </fieldset>

          <!-- Domain Config -->
          <fieldset class="border border-win-gray-dark border-b-white border-r-white p-2">
            <legend class="text-xs px-1 text-blue-800 font-bold">域名配置</legend>
            <div class="space-y-2 text-sm">
              <div>
                <label class="block mb-1 text-xs">Base URL (留空使用相对路径)</label>
                <input 
                  v-model="configStore.config.site.baseUrl" 
                  placeholder="https://img.example.com"
                  class="w-full px-2 py-1 border shadow-win-inset text-sm" 
                />
              </div>
              <div>
                <label class="block mb-1 text-xs">URL Prefix</label>
                <input 
                  v-model="configStore.config.site.urlPrefix" 
                  placeholder="/uploads"
                  class="w-full px-2 py-1 border shadow-win-inset text-sm" 
                />
              </div>
              <p class="text-xs text-gray-500">
                预览: {{ configStore.config.site.baseUrl || '(相对路径)' }}{{ configStore.config.site.urlPrefix }}/example.jpg
              </p>
            </div>
          </fieldset>

          <!-- Configuration Forms -->
          
          <!-- Local Config -->
          <div v-if="configStore.config.storageType === 'local'" class="text-sm space-y-2">
            <div>
              <label class="block mb-1">Upload Directory:</label>
              <input v-model="configStore.config.local.uploadDir" class="w-full px-2 py-1 border shadow-win-inset text-sm" />
            </div>
            <div>
              <label class="block mb-1">Public URL Prefix:</label>
              <input v-model="configStore.config.local.publicUrl" class="w-full px-2 py-1 border shadow-win-inset text-sm" />
            </div>
            <p class="text-xs text-gray-500">Images will be stored in this directory on the host machine.</p>
          </div>

          <!-- S3 Config -->
          <div v-if="configStore.config.storageType === 's3'" class="space-y-2 text-sm">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block mb-1 text-xs">Endpoint</label>
                <input v-model="configStore.config.s3.endpoint" placeholder="s3.amazonaws.com" class="w-full px-2 py-1 border shadow-win-inset text-sm" />
              </div>
              <div>
                <label class="block mb-1 text-xs">Region</label>
                <input v-model="configStore.config.s3.region" class="w-full px-2 py-1 border shadow-win-inset text-sm" />
              </div>
            </div>
            <div>
              <label class="block mb-1 text-xs">Bucket Name</label>
              <input v-model="configStore.config.s3.bucket" class="w-full px-2 py-1 border shadow-win-inset text-sm" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block mb-1 text-xs">Access Key</label>
                <input v-model="configStore.config.s3.accessKey" type="password" class="w-full px-2 py-1 border shadow-win-inset text-sm" />
              </div>
              <div>
                <label class="block mb-1 text-xs">Secret Key</label>
                <input v-model="configStore.config.s3.secretKey" type="password" class="w-full px-2 py-1 border shadow-win-inset text-sm" />
              </div>
            </div>
            <div>
              <label class="block mb-1 text-xs">Public URL (Optional)</label>
              <input v-model="configStore.config.s3.publicUrl" placeholder="https://cdn.example.com" class="w-full px-2 py-1 border shadow-win-inset text-sm" />
            </div>
          </div>

          <!-- MinIO Config -->
          <div v-if="configStore.config.storageType === 'minio'" class="space-y-2 text-sm">
             <div class="p-2 bg-yellow-100 border border-yellow-300 text-xs mb-2">
               提示: 确保 Docker 容器已启动且端口 9000 可访问。
             </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block mb-1 text-xs">Endpoint</label>
                <input v-model="configStore.config.minio.endpoint" class="w-full px-2 py-1 border shadow-win-inset text-sm" />
              </div>
              <div>
                 <label class="block mb-1 text-xs">Bucket</label>
                 <input v-model="configStore.config.minio.bucket" class="w-full px-2 py-1 border shadow-win-inset text-sm" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block mb-1 text-xs">User</label>
                <input v-model="configStore.config.minio.accessKey" class="w-full px-2 py-1 border shadow-win-inset text-sm" />
              </div>
              <div>
                <label class="block mb-1 text-xs">Password</label>
                <input v-model="configStore.config.minio.secretKey" type="password" class="w-full px-2 py-1 border shadow-win-inset text-sm" />
              </div>
            </div>
            <div>
              <label class="block mb-1 text-xs">Public URL (Optional)</label>
              <input v-model="configStore.config.minio.publicUrl" placeholder="http://localhost:9000/snaply" class="w-full px-2 py-1 border shadow-win-inset text-sm" />
            </div>
          </div>

        </div>

        <!-- Advanced Tab -->
        <div v-else-if="activeTab === 'advanced'" class="text-sm space-y-4">
          
          <!-- Image Processing -->
          <fieldset class="border border-win-gray-dark border-b-white border-r-white p-2">
            <legend class="text-xs px-1 text-blue-800 font-bold">图片处理</legend>
            <div class="space-y-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="configStore.config.advanced.convertToWebp">
                <span>启用 WebP 自动转换</span>
              </label>
              <div v-if="configStore.config.advanced.convertToWebp" class="ml-5 flex items-center gap-2">
                <span class="text-xs text-gray-600">质量:</span>
                <input 
                  type="range" 
                  v-model.number="configStore.config.advanced.webpQuality" 
                  min="50" max="100" step="5"
                  class="w-24"
                />
                <span class="text-xs font-mono w-8">{{ configStore.config.advanced.webpQuality }}%</span>
              </div>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="configStore.config.advanced.preserveExif">
                <span>保留 EXIF 元数据</span>
              </label>
            </div>
          </fieldset>

          <!-- Thumbnails -->
          <fieldset class="border border-win-gray-dark border-b-white border-r-white p-2">
            <legend class="text-xs px-1 text-blue-800 font-bold">缩略图</legend>
            <div class="space-y-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="configStore.config.advanced.generateThumbnail">
                <span>生成缩略图</span>
              </label>
              <div v-if="configStore.config.advanced.generateThumbnail" class="ml-5 flex items-center gap-2">
                <span class="text-xs text-gray-600">尺寸:</span>
                <input 
                  type="number" 
                  v-model.number="configStore.config.advanced.thumbnailSize" 
                  min="50" max="500" step="50"
                  class="w-20 px-2 py-0.5 border shadow-win-inset text-sm"
                />
                <span class="text-xs text-gray-600">px</span>
              </div>
            </div>
          </fieldset>

          <!-- Upload Limits -->
          <fieldset class="border border-win-gray-dark border-b-white border-r-white p-2">
            <legend class="text-xs px-1 text-blue-800 font-bold">上传限制</legend>
            <div class="flex items-center gap-2">
              <span class="text-xs">最大文件大小:</span>
              <input 
                type="number" 
                v-model.number="configStore.config.advanced.maxFileSize" 
                min="1" max="100" step="1"
                class="w-16 px-2 py-0.5 border shadow-win-inset text-sm"
              />
              <span class="text-xs text-gray-600">MB</span>
            </div>
          </fieldset>

          <p class="text-xs text-gray-500">
            注意: WebP 转换和缩略图生成需要后端支持 Sharp 库。
          </p>
        </div>

      </div>

      <!-- Footer Actions -->
      <div class="flex justify-between items-center mt-2 px-1">
        <span 
          class="text-xs font-bold" 
          :class="statusType === 'success' ? 'text-green-700' : statusType === 'error' ? 'text-red-700' : ''"
          v-if="statusMsg"
        >
          {{ statusMsg }}
        </span>
        <span v-else class="text-xs text-gray-500">
          {{ configStore.isOnline ? 'Connected to server' : 'Offline' }}
        </span>
        <div class="flex gap-2">
           <button 
             @click="testConnection"
             :disabled="isTesting"
             class="px-4 py-1 bg-win-gray border shadow-win-button active:shadow-win-button-pressed text-sm min-w-[80px] disabled:opacity-50"
           >
             {{ isTesting ? 'Testing...' : 'Test' }}
           </button>
           <button 
             @click="saveSettings"
             :disabled="configStore.isLoading"
             class="px-4 py-1 bg-win-gray border shadow-win-button active:shadow-win-button-pressed text-sm min-w-[80px] font-bold disabled:opacity-50"
           >
             {{ configStore.isLoading ? 'Saving...' : 'Apply' }}
           </button>
        </div>
      </div>

    </div>
  </div>
</template>
