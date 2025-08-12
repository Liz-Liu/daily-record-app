<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div class="bg-white rounded-2xl shadow p-8 w-full max-w-sm text-center">
      <div v-if="isProcessing" class="text-center">
        <div class="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 class="text-xl font-medium mb-2">處理登入中...</h2>
        <p class="text-gray-600">請稍候</p>
      </div>
      
      <div v-else-if="error" class="text-center">
        <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <h2 class="text-xl font-medium mb-2 text-red-600">登入失敗</h2>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <button 
          @click="goBack"
          class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          返回登入頁面
        </button>
      </div>

      <div v-else class="text-center">
        <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 class="text-xl font-medium mb-2 text-green-600">登入成功</h2>
        <p class="text-gray-600">正在跳轉...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { handleOAuthCallback } from '@/services/oauth'
import { useAuthStore } from '@/stores/auth'
import { GoogleSheetsAPI } from '@/services/GoogleSheetsAPI'

const router = useRouter()
const authStore = useAuthStore()

const isProcessing = ref(true)
const error = ref<string | null>(null)

const goBack = () => {
  router.push('/login')
}

onMounted(async () => {
  try {
    console.log('開始處理 OAuth callback...')
    

    const query = new URLSearchParams(window.location.search)
    
    console.log('URL 參數:', Object.fromEntries(query.entries()))
    
   
    if (query.has('error')) {
      const errorMsg = query.get('error_description') || query.get('error') || '認證失敗'
      throw new Error(errorMsg)
    }
    
   
    const code = query.get('code')
    if (!code) {
      throw new Error('未收到授權碼')
    }
    
    console.log('收到授權碼，開始交換 token...')
    
  
    const tokens = await handleOAuthCallback(query)
    
    console.log('Token 交换成功:', tokens)
    
   
    if (tokens.id_token) {
      const payload = parseJWT(tokens.id_token)
      console.log('用戶資訊:', payload)
      
    
      authStore.setAuth(tokens.id_token, {
        email: payload.email,
        name: payload.name || payload.given_name || payload.email
      })
      
    
      GoogleSheetsAPI.setAuthToken(tokens.id_token)
      
      console.log('認證訊息已保存，準備跳轉至首頁')
      
     
      setTimeout(() => {
        console.log('跳轉至首頁')
        router.replace('/') 
      }, 1000)
    } else {
      throw new Error('未收到 ID Token')
    }
    
  } catch (err) {
    console.error('OAuth callback error:', err)
    error.value = err instanceof Error ? err.message : '未知錯誤'
  } finally {
    isProcessing.value = false
  }
})


function parseJWT(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error('解析 JWT 失敗:', e)
    throw new Error('無效的 ID Token')
  }
}
</script>