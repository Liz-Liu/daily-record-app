import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === 'true'

export const useAuthStore = defineStore('auth', () => {
  const idToken = ref<string | null>(null)
  const profile = ref<{ email: string; name?: string } | null>(null)
  
  const isAuthenticated = computed(() => {
  
    if (!AUTH_ENABLED) return true
  
    return !!idToken.value
  })

  const isPrivateMode = computed(() => AUTH_ENABLED)
  const isPublicMode = computed(() => !AUTH_ENABLED)

  function setAuth(token: string, payload: { email: string; name?: string }) {
 
    if (AUTH_ENABLED) {
      idToken.value = token
      profile.value = payload
      localStorage.setItem('idToken', token)
      localStorage.setItem('profile', JSON.stringify(payload))
    }
  }

  function logout() {
 
    if (AUTH_ENABLED) {
      idToken.value = null
      profile.value = null
      localStorage.removeItem('idToken')
      localStorage.removeItem('profile')
    }
  }


  function initAuth() {
    
    if (AUTH_ENABLED) {
      const t = localStorage.getItem('idToken')
      const p = localStorage.getItem('profile')
      if (t && p) {
        try {
          idToken.value = t
          profile.value = JSON.parse(p)
        } catch (error) {
          console.error('恢复用户信息失败:', error)
          logout()
        }
      }
    }
  }

  initAuth()

  return { 
    idToken, 
    profile, 
    isAuthenticated, 
    isPrivateMode,
    isPublicMode,
    setAuth, 
    logout,
    initAuth
  }
})