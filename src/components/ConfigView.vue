<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useConfigStore } from '../stores/configStore'
import { useImageStore } from '../stores/imageStore'

const configStore = useConfigStore()
const imageStore = useImageStore()
const activeTab = ref<'general' | 'advanced' | 'ai'>('general')
const statusMsg = ref('')
const statusType = ref<'success' | 'error' | ''>('')
const isTesting = ref(false)
const isTestingAI = ref(false)
const aiTestMsg = ref('')
const aiTestType = ref<'success' | 'error' | ''>('')
const isRetagging = ref(false)
const retagMsg = ref('')
const retagType = ref<'success' | 'error' | ''>('')

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

const getModelPlaceholder = () => {
  const provider = configStore.config.ai.provider
  switch (provider) {
    case 'ollama': return 'llava 或 moondream'
    case 'gemini': return 'gemini-1.5-flash'
    case 'qwen': return 'qwen-vl-max'
    case 'zhipu': return 'glm-4v'
    case 'siliconflow': return 'THUDM/GLM-4.1V-9B-Thinking'
    default: return ''
  }
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

const testAIConnection = async () => {
  if (!configStore.config.ai.enabled) {
    aiTestMsg.value = '请先启用 AI 功能'
    aiTestType.value = 'error'
    setTimeout(() => {
      aiTestMsg.value = ''
      aiTestType.value = ''
    }, 3000)
    return
  }

  if (configStore.config.ai.provider !== 'ollama' && !configStore.config.ai.apiKey) {
    aiTestMsg.value = '请先填写 API Key'
    aiTestType.value = 'error'
    setTimeout(() => {
      aiTestMsg.value = ''
      aiTestType.value = ''
    }, 3000)
    return
  }

  isTestingAI.value = true
  aiTestMsg.value = '测试中...'
  aiTestType.value = ''

  const result = await configStore.testAIConnection()
  if (result.success) {
    aiTestMsg.value = result.message
    aiTestType.value = 'success'
  } else {
    aiTestMsg.value = result.message
    aiTestType.value = 'error'
  }
  isTestingAI.value = false
  setTimeout(() => {
    aiTestMsg.value = ''
    aiTestType.value = ''
  }, 5000)
}

const retagUntaggedImages = async () => {
  if (!configStore.config.ai.enabled) {
    retagMsg.value = '请先启用 AI 功能'
    retagType.value = 'error'
    setTimeout(() => {
      retagMsg.value = ''
      retagType.value = ''
    }, 3000)
    return
  }

  isRetagging.value = true
  retagMsg.value = '正在检查无标签图片...'
  retagType.value = ''

  try {
    const res = await fetch('/api/images/retag-untagged', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    const json = await res.json()

    if (json.success) {
      retagMsg.value = json.message
      retagType.value = 'success'
      // 3秒后刷新图片列表
      setTimeout(() => {
        imageStore.loadImages()
      }, 3000)
    } else {
      retagMsg.value = json.error || '处理失败'
      retagType.value = 'error'
    }
  } catch (e) {
    retagMsg.value = '无法连接到服务器'
    retagType.value = 'error'
  }

  isRetagging.value = false
  setTimeout(() => {
    retagMsg.value = ''
    retagType.value = ''
  }, 8000)
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
        <button
          @click="activeTab = 'ai'"
          :class="[
            'px-3 py-1 text-sm border-t-2 border-l-2 border-r-2 rounded-t',
            activeTab === 'ai'
              ? 'bg-win-gray border-white border-b-win-gray relative z-10 -mb-[2px] pb-2'
              : 'bg-gray-300 border-white text-gray-600'
          ]"
        >
          AI
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

        <!-- AI Settings Tab -->
        <div v-else-if="activeTab === 'ai'" class="text-sm space-y-4">
          <fieldset class="border border-win-gray-dark border-b-white border-r-white p-2">
            <legend class="text-xs px-1 text-blue-800 font-bold">智能分类</legend>
            <div class="space-y-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="configStore.config.ai.enabled">
                <span>启用 AI 自动打标</span>
              </label>

              <!-- Provider Selection -->
              <div class="space-y-1">
                <label class="block mb-1 text-xs">AI 提供商</label>
                <select
                  v-model="configStore.config.ai.provider"
                  class="w-full px-2 py-1 border shadow-win-inset text-sm"
                  :disabled="!configStore.config.ai.enabled"
                >
                  <option value="ollama">Ollama (本地免费 - 推荐)</option>
                  <option value="siliconflow">硅基流动 (免费额度)</option>
                  <option value="qwen">通义千问 (阿里云)</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="zhipu">智谱 AI</option>
                </select>
              </div>

              <!-- Ollama Base URL -->
              <div v-if="configStore.config.ai.provider === 'ollama'" class="space-y-1">
                <label class="block mb-1 text-xs">Ollama 地址</label>
                <input
                  v-model="configStore.config.ai.baseUrl"
                  placeholder="http://localhost:11434"
                  class="w-full px-2 py-1 border shadow-win-inset text-sm"
                  :disabled="!configStore.config.ai.enabled"
                />
                <p class="text-xs text-gray-500">
                  本地运行，完全免费无需 API Key。
                  <a href="https://ollama.com/" target="_blank" class="text-blue-600 hover:underline">安装 Ollama</a>
                  后运行: <code class="bg-gray-100 px-1">ollama pull llava</code>
                </p>
              </div>

              <!-- API Key for Cloud Providers -->
              <div v-if="configStore.config.ai.provider !== 'ollama'" class="space-y-1">
                <label class="block mb-1 text-xs">API Key</label>
                <input
                  v-model="configStore.config.ai.apiKey"
                  type="password"
                  placeholder="输入 API Key..."
                  class="w-full px-2 py-1 border shadow-win-inset text-sm"
                  :disabled="!configStore.config.ai.enabled"
                />
                <p class="text-xs text-gray-500" v-if="configStore.config.ai.provider === 'gemini'">
                  使用 Google Gemini API 进行图片内容分析。
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" class="text-blue-600 hover:underline">获取 API Key</a>
                </p>
                <p class="text-xs text-gray-500" v-else-if="configStore.config.ai.provider === 'qwen'">
                  使用阿里云通义千问多模态大模型。
                  <a href="https://dashscope.console.aliyun.com/" target="_blank" class="text-blue-600 hover:underline">获取 API Key</a>
                  (提供免费额度)
                </p>
                <p class="text-xs text-gray-500" v-else-if="configStore.config.ai.provider === 'zhipu'">
                  使用智谱 AI GLM-4V 模型。
                  <a href="https://open.bigmodel.cn/" target="_blank" class="text-blue-600 hover:underline">获取 API Key</a>
                </p>
                <p class="text-xs text-gray-500" v-else-if="configStore.config.ai.provider === 'siliconflow'">
                  使用硅基流动多模态 API，新用户赠送免费额度。
                  <a href="https://cloud.siliconflow.cn/" target="_blank" class="text-blue-600 hover:underline">获取 API Key</a>
                  (免费额度充足)
                </p>
              </div>

              <!-- Model Override (Optional) -->
              <div class="space-y-1">
                <label class="block mb-1 text-xs">模型</label>
                <input
                  v-model="configStore.config.ai.model"
                  :placeholder="getModelPlaceholder()"
                  class="w-full px-2 py-1 border shadow-win-inset text-sm"
                  :disabled="!configStore.config.ai.enabled"
                />
                <p class="text-xs text-gray-500">
                  当前: {{ configStore.config.ai.model || getModelPlaceholder() }}
                </p>
              </div>

              <!-- AI Test Button -->
              <div class="pt-2 border-t border-gray-300 space-y-2">
                <button
                  @click="testAIConnection"
                  :disabled="isTestingAI || !configStore.config.ai.enabled"
                  class="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold border shadow-win-button active:shadow-win-button-pressed disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isTestingAI ? '测试中...' : '🧪 测试 AI 连接' }}
                </button>
                <p
                  v-if="aiTestMsg"
                  class="text-xs font-bold text-center"
                  :class="aiTestType === 'success' ? 'text-green-700' : aiTestType === 'error' ? 'text-red-700' : 'text-gray-600'"
                >
                  {{ aiTestMsg }}
                </p>

                <!-- Batch Retag Button -->
                <button
                  @click="retagUntaggedImages"
                  :disabled="isRetagging || !configStore.config.ai.enabled"
                  class="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold border shadow-win-button active:shadow-win-button-pressed disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isRetagging ? '处理中...' : '🔄 重新打标无标签图片' }}
                </button>
                <p
                  v-if="retagMsg"
                  class="text-xs font-bold text-center"
                  :class="retagType === 'success' ? 'text-green-700' : retagType === 'error' ? 'text-red-700' : 'text-gray-600'"
                >
                  {{ retagMsg }}
                </p>
              </div>
            </div>
          </fieldset>
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
