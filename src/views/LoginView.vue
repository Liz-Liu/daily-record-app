<template>
  <!-- 私人版本 -->
  <div v-if="AUTH_ENABLED" class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div class="bg-white rounded-2xl shadow p-8 w-full max-w-sm text-center">
      <h1 class="text-2xl font-semibold mb-4">登入以使用私人站</h1>
      
      <button
        @click="handleLogin"
        :disabled="isLoading"
        class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3"
      >
        <svg v-if="!isLoading" class="w-5 h-5" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        
        <div v-if="isLoading" class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        
        {{ isLoading ? '登入中...' : '使用 Google 帳號登入' }}
      </button>
      
      <p class="text-xs text-gray-500 mt-4">僅限允許的 Google 帳號</p>
    </div>
  </div>

  <!-- 公開版本 -->
  <div v-else class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div class="bg-white rounded-2xl shadow p-8 w-full max-w-sm text-center">
      <div class="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <h2 class="text-xl font-medium mb-2">載入中...</h2>
      <p class="text-gray-600">正在進入應用</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { startLoginRedirect } from '@/services/oauth'

const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === 'true'
const router = useRouter()
const isLoading = ref(false)

const handleLogin = async () => {
  try {
    isLoading.value = true
    await startLoginRedirect()
  } catch (error) {
    console.error('登入失败:', error)
    isLoading.value = false
  }
}


onMounted(() => {
  if (!AUTH_ENABLED) {
    router.push('/')
  }
})
</script>