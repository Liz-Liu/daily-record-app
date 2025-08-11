import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { GoogleSheetsAPI } from '@/services/GoogleSheetsAPI'
import { logout as oauthLogout } from '@/services/oauth'

const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === 'true'

export function useAuth() {
  const authStore = useAuthStore()
  const router = useRouter()

  const isAuthenticated = computed(() => {
 
    if (!AUTH_ENABLED) return true
   
    return authStore.isAuthenticated
  })
  
  const profile = computed(() => authStore.profile)
  const idToken = computed(() => authStore.idToken)

  const initAuth = () => {
    if (AUTH_ENABLED && authStore.idToken) {
      GoogleSheetsAPI.setAuthToken(authStore.idToken)
    } else if (!AUTH_ENABLED) {
     
      GoogleSheetsAPI.setAuthToken(null)
    }
  }


  const logout = () => {
    if (AUTH_ENABLED) {
      authStore.logout()
      GoogleSheetsAPI.setAuthToken(null)
      oauthLogout()
      router.push('/login')
    }
    
  }


  const requireAuth = () => {

    if (!AUTH_ENABLED) return true
    

    if (!authStore.isAuthenticated) {
      router.push('/login')
      return false
    }
    return true
  }


  const getMode = () => ({
    isPrivate: AUTH_ENABLED,
    isPublic: !AUTH_ENABLED
  })

  onMounted(() => {
    initAuth()
  })

  return {
    isAuthenticated,
    profile,
    idToken,
    logout,
    requireAuth,
    initAuth,
    getMode,
    AUTH_ENABLED
  }
}