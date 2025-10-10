import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import './assets/tailwind.css'
import { createPinia } from 'pinia'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)


app.config.errorHandler = (err, info) => {
  console.error('Vue 全域錯誤：', err, info)
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('未處理的 promise 拒絕：', event.reason)
})

app.mount('#app')
