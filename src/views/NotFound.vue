<template>
  <div class="p-8 text-center">
    <h1 class="text-3xl font-bold text-gray-800">404 - 找不到頁面</h1>
    <p class="mt-2 text-gray-500">你造訪的頁面不存在或已被移除。</p>
    <button
      @click="goHome"
      class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      回首頁
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
function goHome() {
  router.push('/')
}
</script>
