// stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed, nextTick } from 'vue'
import { getIdToken, getStoredTokens } from '@/services/oauth'

const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === 'true'

interface UserProfile {
  email: string
  name?: string
  picture?: string
}

export const useAuthStore = defineStore('auth', () => {
  const profile = ref<UserProfile | null>(null)
  
  const isAuthenticated = computed(() => {
    if (!AUTH_ENABLED) return true
    
    // 檢查用戶資料和 token 是否都存在
    const hasProfile = !!profile.value
    const idToken = getIdToken()
    const hasValidToken = !!idToken
    
    console.log('認證狀態檢查:', {
      hasProfile,
      hasValidToken,
      profileEmail: profile.value?.email,
      tokenExists: !!idToken
    })
    
    return hasProfile && hasValidToken
  })

  const isPrivateMode = computed(() => AUTH_ENABLED)
  const isPublicMode = computed(() => !AUTH_ENABLED)

  // 從 OAuth tokens 中設定認證資訊
  function setAuth(idToken: string, userProfile: UserProfile) {
    if (AUTH_ENABLED) {

      console.log('設定認證資訊開始:', userProfile)
      profile.value = userProfile
      
      // 儲存用戶資料到 localStorage（作為備份）
      localStorage.setItem('user_profile', JSON.stringify(userProfile))
      
      nextTick(() => {
        console.log('認證資訊已設定:', userProfile)
        console.log('ID Token 已接收，長度:', idToken.length)
        console.log('認證狀態更新完成:', isAuthenticated.value)
        
        // 如果狀態仍然是 false，強制檢查原因
        if (!isAuthenticated.value) {
          console.warn('認證狀態異常，進行診斷:')
          console.warn('Profile:', profile.value)
          console.warn('ID Token from storage:', getIdToken())
          console.warn('Stored tokens:', getStoredTokens())
        }
      })
    }
  }

  function logout() {
    if (AUTH_ENABLED) {
      profile.value = null
      localStorage.removeItem('user_profile')
      console.log('用戶資料已清除')
    }
  }

  function initAuth() {
    if (AUTH_ENABLED) {
      console.log('初始化認證狀態...')
      
      // 檢查是否有有效的 tokens
      const tokens = getStoredTokens()
      
      if (tokens?.id_token) {
        try {
          // 解析 ID token 獲取用戶資訊
          const userInfo = parseJWT(tokens.id_token)
          
          profile.value = {
            email: userInfo.email,
            name: userInfo.name || userInfo.given_name || userInfo.email,
            picture: userInfo.picture
          }
          
          console.log('從 token 恢復用戶資訊:', profile.value)
        } catch (error) {
          console.error('解析 ID token 失敗:', error)
          
          // 嘗試從 localStorage 恢復
          const savedProfile = localStorage.getItem('user_profile')
          if (savedProfile) {
            try {
              profile.value = JSON.parse(savedProfile)
              console.log('從 localStorage 恢復用戶資訊:', profile.value)
            } catch (parseError) {
              console.error('恢復使用者資訊失敗:', parseError)
              logout()
            }
          }
        }
      } else {
        console.log('沒有有效 tokens，清理所有資料')
        logout()
      }
    }
  }

  // 解析 JWT token
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

  // 獲取當前的 ID Token
  const idToken = computed(() => {
    if (!AUTH_ENABLED) return null
    return getIdToken()
  })

   // 強制檢查認證狀態（用於診斷）
  function forceCheckAuth() {
    console.log('強制檢查認證狀態:')
    console.log('Profile:', profile.value)
    console.log('ID Token:', getIdToken())
    console.log('Stored Tokens:', getStoredTokens())
    console.log('Is Authenticated:', isAuthenticated.value)
    return isAuthenticated.value
  }

  // 初始化
  initAuth()

  return { 
    profile, 
    isAuthenticated, 
    isPrivateMode,
    isPublicMode,
    idToken,
    setAuth, 
    logout,
    initAuth,
    forceCheckAuth
  }
})