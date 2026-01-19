<script setup lang="ts">
import { ref } from 'vue'
import { useClipboard } from '@vueuse/core'

const { copy, copied } = useClipboard()
const apiKey = ref('sk-live-29384728347283472834')
const showKey = ref(false)

const regenerateKey = () => {
  apiKey.value = 'sk-live-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
</script>

<template>
  <div class="h-full w-full bg-win-gray-light p-4 overflow-y-auto font-sans">
    <div class="max-w-2xl mx-auto space-y-6">
      
      <!-- API Key Section -->
      <div class="bg-win-gray border shadow-win-outset p-4">
        <h3 class="font-bold mb-2">API 访问密钥</h3>
        <div class="flex gap-2 mb-2">
          <input 
            :type="showKey ? 'text' : 'password'" 
            v-model="apiKey"
            readonly
            class="flex-1 px-2 py-1 border shadow-win-inset bg-white text-gray-600 font-mono text-sm outline-none"
          >
          <button 
            @click="showKey = !showKey"
            class="px-3 py-1 bg-win-gray shadow-win-button active:shadow-win-button-pressed text-xs min-w-[60px]"
          >
            {{ showKey ? '隐藏' : '显示' }}
          </button>
        </div>
        <div class="flex gap-2">
          <button 
            @click="copy(apiKey)"
            class="px-3 py-1 bg-win-gray shadow-win-button active:shadow-win-button-pressed text-xs"
          >
            {{ copied ? '已复制' : '复制密钥' }}
          </button>
          <button 
            @click="regenerateKey"
            class="px-3 py-1 bg-win-gray shadow-win-button active:shadow-win-button-pressed text-xs"
          >
            重新生成
          </button>
        </div>
      </div>

      <!-- Documentation Section -->
      <div class="bg-white border shadow-win-inset p-4">
        <h3 class="font-bold mb-4 border-b border-gray-300 pb-2">API 文档</h3>
        
        <div class="space-y-4 text-sm">
          <div>
            <div class="font-bold text-win-blue mb-1">POST /api/upload</div>
            <p class="text-gray-600 mb-2">上传图片文件。支持 jpg, png, gif 格式。</p>
            <div class="bg-gray-800 text-green-400 p-3 font-mono text-xs overflow-x-auto shadow-inner">
              curl -X POST https://snaply.dev/api/upload \<br>
              &nbsp;&nbsp;-H "Authorization: Bearer {{ apiKey.substring(0, 8) }}..." \<br>
              &nbsp;&nbsp;-F "file=@image.jpg"
            </div>
          </div>

          <div>
            <div class="font-bold text-win-blue mb-1">响应示例</div>
            <div class="bg-gray-100 text-gray-800 p-3 font-mono text-xs border border-gray-300 shadow-inner">
{
  "success": true,
  "data": {
    "url": "https://snaply.dev/i/abc12345.jpg",
    "size": "1.2 MB",
    "width": 1920,
    "height": 1080
  }
}
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
