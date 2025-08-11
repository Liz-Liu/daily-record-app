<script setup lang="ts">
import { onMounted } from 'vue'
import { handleOAuthCallback } from '@/services/oauth'
import { useRouter } from 'vue-router'

const router = useRouter()
onMounted(async () => {
  try {
    await handleOAuthCallback(new URLSearchParams(location.search))
    router.replace('/') // 登入完回首頁（或原本的 returnTo）
  } catch (e) {
    console.error(e)
    router.replace('/')
  }
})
</script>

<template>
  <div class="p-4 text-center">正在處理登入…</div>
</template>
