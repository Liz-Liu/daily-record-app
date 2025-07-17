import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import RecordForm from '@/views/RecordForm.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/record/:date?', component: RecordForm },
]

export default createRouter({
  history: createWebHistory(),
  routes
})
