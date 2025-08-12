// composables/useAuth.ts
import { computed, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "@/stores/auth"
import { GoogleSheetsAPI } from "@/services/GoogleSheetsAPI"
import {
  logout as oauthLogout,
  getIdToken,
  tryAutoLogin,
} from "@/services/oauth"

const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === "true"

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const isAuthenticated = computed(() => {
    if (!AUTH_ENABLED) return true
    return authStore.isAuthenticated
  })

  const profile = computed(() => authStore.profile)
  const idToken = computed(() => authStore.idToken)

  const initAuth = async () => {
    if (AUTH_ENABLED) {
      console.log("初始化認證狀態...")
      authStore.initAuth()

      // 如果沒有認證狀態，嘗試自動登入
      if (!authStore.isAuthenticated) {
        console.log("嘗試自動登入...")
        const autoLoginSuccess = await tryAutoLogin()

        if (autoLoginSuccess) {
          // 自動登入成功後，重新初始化 auth store
          authStore.initAuth()
          console.log("自動登入成功，狀態已更新")
        }
      }

      const token = getIdToken()
      if (token) {
        GoogleSheetsAPI.setAuthToken(token)
        console.log("Google Sheets API token 已設定")
      } else {
        GoogleSheetsAPI.setAuthToken(null)
        console.log("無有效 token，清除 Google Sheets API token")
      }
    } else {
      // 公開模式
      GoogleSheetsAPI.setAuthToken(null)
      console.log("公開模式：Google Sheets API 無需 token")
    }
  }

    // 監聽認證狀態變化，自動更新 API token
  watch(() => authStore.isAuthenticated, (newValue) => {
    if (AUTH_ENABLED) {
      const token = newValue ? getIdToken() : null
      GoogleSheetsAPI.setAuthToken(token)
      console.log('認證狀態變化，API token 已更新:', !!token)
    }
  })

  const logout = () => {
    if (AUTH_ENABLED) {
      // 清理 auth store
      authStore.logout()

      // 清理 Google Sheets API token
      GoogleSheetsAPI.setAuthToken(null)

      // 清理 OAuth tokens
      oauthLogout()

      console.log("完整登出完成")

      // 跳轉到登入頁面
      router.push("/login")
    }
  }

  const requireAuth = () => {
    if (!AUTH_ENABLED) return true

    if (!authStore.isAuthenticated) {
      console.log("需要認證，跳轉到登入頁面")
      router.push("/login")
      return false
    }
    return true
  }

  const getMode = () => ({
    isPrivate: AUTH_ENABLED,
    isPublic: !AUTH_ENABLED,
  })

  // 檢查認證狀態並自動登出過期用戶
  const checkAuthStatus = () => {
    if (AUTH_ENABLED) {
      const token = getIdToken()
      if (!token && authStore.profile) {
        console.log("Token 已過期但用戶資料仍存在，自動登出")
        logout()
      }
    }
  }

  onMounted(() => {
    initAuth()
    checkAuthStatus()
  })

  return {
    isAuthenticated,
    profile,
    idToken,
    logout,
    requireAuth,
    initAuth,
    getMode,
    checkAuthStatus,
    AUTH_ENABLED,
  }
}
