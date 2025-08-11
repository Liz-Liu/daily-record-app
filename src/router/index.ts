import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router"
import { useAuthStore } from "@/stores/auth"

const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === "true"
// Lazy loading：只在需要時才載入，減少初始包大小
const HomeView = () => import("@/views/HomeView.vue")
const RecordForm = () => import("@/views/RecordForm.vue")
const LoginView = () => import("@/views/LoginView.vue")
const OAuthCallback = () => import("@/views/OAuthCallback.vue")
const NotFound = () => import("@/views/NotFound.vue")

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
    meta: { 
      requiresAuth: AUTH_ENABLED 
    }
  },
  {
    path: "/record/:date?",
    name: "RecordForm",
    component: RecordForm,
    props: true, // 把 :date 傳入元件作為 prop
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { 
      requiresGuest: true 
    }
  },
   {
    path: '/callback',
    name: 'OAuthCallback',
    component: OAuthCallback,
    meta: { 
      onlyPrivate: true 
    }
  },
  {
    path: "/:pathMatch(.*)*", // fallback 404 route
    name: "NotFound",
    component: NotFound,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 } // 每次切換頁面時回到頂部（提升 UX）
  },
})

// ✅ 私有站才做登入檢查；Demo 站完全略過
router.beforeEach((to) => {
  if (!AUTH_ENABLED) return true
  const auth = useAuthStore()
  if (!auth.isAuthenticated && to.name !== "Login") {
    return { name: "Login" }
  }
  return true
})

export default router
