import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Lazy loading：只在需要時才載入，減少初始包大小
const HomeView = () => import('@/views/HomeView.vue')
const RecordForm = () => import('@/views/RecordForm.vue')
const NotFound = () => import('@/views/NotFound.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/record/:date?',
    name: 'RecordForm',
    component: RecordForm,
    props: true, // 把 :date 傳入元件作為 prop
  },
  {
    path: '/:pathMatch(.*)*', // fallback 404 route
    name: 'NotFound',
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

export default router
