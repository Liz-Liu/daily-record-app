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
      requiresAuth: AUTH_ENABLED,
    },
  },
  {
    path: "/record/:date?",
    name: "RecordForm",
    component: RecordForm,
    props: true, // 把 :date 傳入元件作為 prop
  },
  {
    path: "/login",
    name: "Login",
    component: LoginView,
    meta: {
      requiresGuest: true,
    },
  },
  {
    path: "/callback",
    name: "OAuthCallback",
    component: OAuthCallback,
    meta: {
      onlyPrivate: true,
    },
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

router.beforeEach((to, from, next) => {
  console.log("路由導航:", {
    from: from.path,
    to: to.path,
    AUTH_ENABLED,
    meta: to.meta,
  })

  const authStore = useAuthStore()

  console.log("認證狀態:", {
    isAuthenticated: authStore.isAuthenticated,
    hasToken: !!authStore.idToken,
    profile: authStore.profile,
  })

  if (AUTH_ENABLED) {
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      console.log("需要認證但未登錄，重定向到登入頁")
      next("/login")
      return
    }

    if (to.meta.requiresGuest && authStore.isAuthenticated) {
      console.log("已登入使用者存取登入頁，重新導向至首頁")
      next("/")
      return
    }

    if (to.path === "/callback") {
      console.log("造訪 callback 頁面")
      next()
      return
    }
  } else {
    if (to.path === "/login" || to.path === "/callback") {
      console.log("公開版本，重定向認證頁面到首頁")
      next("/")
      return
    }
  }

  console.log("路由守衛通過，繼續導航")
  next()
})

router.afterEach((to, from) => {
  console.log("路由導航完成:", {
    from: from.path,
    to: to.path,
  })
})

export default router
