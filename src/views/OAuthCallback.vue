<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-6">
    <div class="bg-white rounded-2xl shadow p-8 w-full max-w-sm text-center">
      <div v-if="isProcessing" class="text-center">
        <div
          class="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"
        ></div>
        <h2 class="text-xl font-medium mb-2">處理登入中...</h2>
        <p class="text-gray-600">請稍候</p>
      </div>

      <div v-else-if="error" class="text-center">
        <div
          class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg
            class="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
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
        <div
          class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg
            class="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <h2 class="text-xl font-medium mb-2 text-green-600">登入成功</h2>
        <p class="text-gray-600 mb-2">
          歡迎回來，{{ userInfo?.name || userInfo?.email }}
        </p>
        <p class="text-sm text-gray-500">正在跳轉...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import { handleOAuthCallback } from "@/services/oauth"
import { useAuthStore } from "@/stores/auth"
import { GoogleSheetsAPI } from "@/services/GoogleSheetsAPI"

const router = useRouter()
const authStore = useAuthStore()

const isProcessing = ref(true)
const error = ref<string | null>(null)
const userInfo = ref<{ email: string; name?: string } | null>(null)

const goBack = () => {
  router.push("/login")
}

onMounted(async () => {
  try {
    console.log("開始處理 OAuth callback...")

    const query = new URLSearchParams(window.location.search)
    console.log("URL 參數:", Object.fromEntries(query.entries()))

    // 檢查是否有錯誤
    if (query.has("error")) {
      const errorMsg =
        query.get("error_description") || query.get("error") || "認證失敗"
      throw new Error(errorMsg)
    }

    // 檢查授權碼
    const code = query.get("code")
    if (!code) {
      throw new Error("未收到授權碼")
    }

    console.log("收到授權碼，開始交換 token...")

    // 使用純 PKCE 流程交換 token
    const tokens = await handleOAuthCallback(query)
    console.log("Token 交換成功")

    // 處理 ID token
    if (tokens.id_token) {
      const payload = parseJWT(tokens.id_token)
      console.log("解析用戶資訊:", payload)

      const userProfile = {
        email: payload.email,
        name: payload.name || payload.given_name || payload.email,
        picture: payload.picture,
      }

      userInfo.value = userProfile

      // 設定認證資訊到 store
      authStore.setAuth(tokens.id_token, userProfile)

      // 等待一下讓狀態更新
      await nextTick()

      // 檢查認證狀態
      const authStatus = authStore.forceCheckAuth()
      console.log("設定後認證狀態:", authStatus)

      if (!authStatus) {
        console.warn("認證狀態設定失敗，嘗試重新初始化...")
        authStore.initAuth()

        // 再次檢查
        const retryStatus = authStore.forceCheckAuth()
        console.log("重試後認證狀態:", retryStatus)
      }

      // 設定 Google Sheets API token
      GoogleSheetsAPI.setAuthToken(tokens.id_token)

      console.log("認證資訊已儲存，準備跳轉至首頁")

      // 延遲跳轉，讓用戶看到成功訊息
      setTimeout(() => {
        console.log("跳轉至首頁")
        router.replace("/")
      }, 1500)
    } else {
      throw new Error("未收到 ID Token")
    }
  } catch (err) {
    console.error("OAuth callback 處理錯誤:", err)
    error.value = err instanceof Error ? err.message : "未知錯誤"
  } finally {
    isProcessing.value = false
  }
})

// 解析 JWT token
function parseJWT(token: string) {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    console.error("解析 JWT 失敗:", e)
    throw new Error("無效的 ID Token")
  }
}
</script>
