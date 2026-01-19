<script setup lang="ts">
import { onMounted } from 'vue'
import WindowFrame from './components/WindowFrame.vue'
import { useImageStore } from './stores/imageStore'
import { useConfigStore } from './stores/configStore'

const imageStore = useImageStore()
const configStore = useConfigStore()

// Initialize stores on app mount
onMounted(async () => {
  await Promise.all([
    imageStore.loadImages(),
    configStore.loadConfig()
  ])
})
</script>

<template>
  <div class="w-screen h-screen flex items-center justify-center bg-pattern bg-gray-700 p-2 md:p-0 relative overflow-hidden">
    <WindowFrame />
    
    <!-- Y2K Footer -->
    <div class="absolute bottom-4 w-full text-center pointer-events-none z-50">
      <div class="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-1.5 rounded-full border border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.1)] pointer-events-auto hover:bg-white/20 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300">
        <span class="text-white/80 text-[10px] tracking-[0.2em] font-mono font-bold drop-shadow-sm">@2025 在虎</span>
        <span class="text-white/20">|</span>
        <a
          href="https://github.com/poboll/snaply"
          target="_blank"
          class="text-win-blue-light hover:text-white text-[10px] font-mono hover:underline flex items-center gap-1.5 group"
        >
          <svg class="w-3.5 h-3.5 opacity-80 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          poboll/snaply
        </a>
      </div>
    </div>
  </div>
</template>
