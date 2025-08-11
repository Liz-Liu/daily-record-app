import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import './assets/tailwind.css'


const app = createApp(App)

app.use(createPinia())

app.use(router)


app.config.errorHandler = (err, _instance, info) => {
  console.error('Vue 全域錯誤：', err, info)
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('未處理的 promise 拒絕：', event.reason)
})


app.mount('#app')
