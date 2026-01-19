<script setup lang="ts">
import { useImageStore } from '../stores/imageStore'
import GalleryView from './GalleryView.vue'
import UploadView from './UploadView.vue'
import ApiView from './ApiView.vue'
import ConfigView from './ConfigView.vue'

const store = useImageStore()

const toggleMaximize = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {})
  } else {
    document.exitFullscreen()
  }
}
</script>

<template>
  <div class="flex flex-col w-full h-full max-w-6xl md:max-h-[80vh] bg-win-gray shadow-win-outset p-1 select-none text-win-text border-2 border-win-gray-light border-r-win-gray-dark border-b-win-gray-dark">
    <!-- Title Bar -->
    <div class="flex items-center justify-between px-1 py-0.5 bg-win-blue mb-1 h-8 select-none shrink-0">
      <div class="flex items-center gap-2 pl-1">
        <!-- App Icon -->
        <div class="w-4 h-4 bg-white border border-gray-500 relative flex items-center justify-center overflow-hidden">
           <div class="w-2 h-2 bg-win-blue transform rotate-45"></div>
        </div>
        <span class="text-white font-bold tracking-wide font-sans text-sm">Y2K_图床 - 资源管理器</span>
      </div>
      <div class="flex gap-1">
        <button class="w-5 h-5 flex items-center justify-center bg-win-gray shadow-win-button active:shadow-win-button-pressed text-xs font-bold leading-none pb-1 font-sans">_</button>
        <button @click="toggleMaximize" class="w-5 h-5 flex items-center justify-center bg-win-gray shadow-win-button active:shadow-win-button-pressed text-xs font-bold leading-none pb-1 font-sans">□</button>
        <button class="w-5 h-5 flex items-center justify-center bg-win-gray shadow-win-button active:shadow-win-button-pressed text-xs font-bold leading-none pb-1 ml-0.5 font-sans">×</button>
      </div>
    </div>

    <!-- Menu Bar -->
    <div class="flex items-center gap-2 px-1 py-1 text-sm mb-1 bg-win-gray overflow-x-auto shrink-0 whitespace-nowrap">
      <button 
        @click="store.switchView('upload')"
        :class="['px-2 py-0.5 border border-transparent hover:shadow-win-button focus:outline-none', store.currentView === 'upload' ? 'shadow-win-button-pressed bg-win-gray-light' : '']"
      >
        <span class="underline">文</span>件 > 新建上传
      </button>
      <button 
        @click="store.switchView('gallery')"
         :class="['px-2 py-0.5 border border-transparent hover:shadow-win-button focus:outline-none', store.currentView === 'gallery' ? 'shadow-win-button-pressed bg-win-gray-light' : '']"
      >
        <span class="underline">视</span>图 > 图库
      </button>
      <button 
        @click="store.switchView('api')"
         :class="['px-2 py-0.5 border border-transparent hover:shadow-win-button focus:outline-none', store.currentView === 'api' ? 'shadow-win-button-pressed bg-win-gray-light' : '']"
      >
        <span class="underline">工</span>具 > API
      </button>
      <button 
        @click="store.switchView('config')"
         :class="['px-2 py-0.5 border border-transparent hover:shadow-win-button focus:outline-none', store.currentView === 'config' ? 'shadow-win-button-pressed bg-win-gray-light' : '']"
      >
        系统配置
      </button>
      <div class="flex-1"></div>
      <div class="border-l-2 border-l-win-gray-dark border-r-2 border-r-win-gray-light h-5 mx-2 hidden sm:block"></div>
      <span class="text-win-text-disabled text-xs mr-2 hidden sm:block">{{ store.images.length }} 个对象</span>
    </div>

    <!-- Address Bar -->
    <div class="flex items-center gap-2 px-2 py-1 mb-2 shrink-0">
      <span class="text-xs text-win-text-disabled hidden sm:inline">地址:</span>
      <div class="flex-1 bg-white shadow-win-inset px-2 py-1 text-sm font-sans flex items-center h-6 overflow-hidden">
        <span class="font-mono text-xs pt-0.5" v-if="store.currentView === 'gallery'">C:\Y2K\图片\图库</span>
        <span class="font-mono text-xs pt-0.5" v-else-if="store.currentView === 'upload'">C:\Y2K\图片\上传</span>
        <span class="font-mono text-xs pt-0.5" v-else-if="store.currentView === 'api'">C:\Y2K\系统\API_CONFIG</span>
        <span class="font-mono text-xs pt-0.5" v-else>C:\WINDOWS\SYSTEM32\CONFIG</span>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 bg-white shadow-win-inset m-0 p-1 overflow-hidden relative">
      <Transition name="fade" mode="out-in">
        <component :is="
          store.currentView === 'gallery' ? GalleryView : 
          (store.currentView === 'upload' ? UploadView : 
          (store.currentView === 'api' ? ApiView : ConfigView))
        " />
      </Transition>
    </div>

    <!-- Status Bar -->
    <div class="flex items-center justify-between px-2 py-0.5 text-xs border-t border-win-gray-light shadow-win-inset mt-1 bg-win-gray h-6 shrink-0">
      <span>就绪</span>
      <span>内存: 正常</span>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
