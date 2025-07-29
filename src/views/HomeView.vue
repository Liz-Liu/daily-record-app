<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-6 max-w-2xl">
      <!-- Header -->
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">每日紀錄</h1>
        <p class="text-gray-600">記錄生活的每一天</p>
      </header>

      <!-- Loading State -->
      <div v-if="loading" class="space-y-4">
        <div
          v-for="i in 3"
          :key="i"
          class="bg-white rounded-lg p-4 animate-pulse"
        >
          <div class="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
          <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div class="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div class="flex gap-2">
            <div class="h-6 bg-gray-200 rounded-full w-16"></div>
            <div class="h-6 bg-gray-200 rounded-full w-20"></div>
          </div>
        </div>
      </div>

      <!-- Records List -->
      <main v-else class="space-y-4 pb-20">
        <RecordCard
          v-for="record in visibleRecords"
          :key="record.date"
          :record="record"
          @click="goToRecord(record.date)"
        />

        <!-- Load More Button -->
        <div v-if="hasMore" class="text-center mt-6">
          <button
            @click="loadMore"
            class="px-6 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors text-sm font-medium border border-blue-200 hover:border-blue-300"
          >
            載入更多
          </button>
        </div>

        <!-- Empty State -->
        <div v-if="visibleRecords.length === 0" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg
              class="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          </div>
          <p class="text-gray-500 mb-2">還沒有任何記錄</p>
          <p class="text-sm text-gray-400">點擊右下角的 + 按鈕開始記錄</p>
        </div>
      </main>

      <!-- Floating Add Button -->
      <button
        @click="goToNew"
        class="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
        aria-label="新增記錄"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          ></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import RecordCard from "@/components/RecordCard.vue"
import { GoogleSheetsAPI } from "@/services/GoogleSheetsAPI"
import type { RecordItem } from "@/types/record"
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"
import mockRecordsRaw from "@/mock/mockRecords.json"

const mockRecords = mockRecordsRaw as RecordItem[]

const records = ref<RecordItem[]>([])
const loading = ref(true)
const error = ref(false)

const visibleCount = ref(10)
const visibleRecords = computed(() =>
  records.value.slice(0, visibleCount.value)
)
const hasMore = computed(() => visibleCount.value < records.value.length)

const loadMore = () => {
  visibleCount.value += 5
}

const router = useRouter()

const goToRecord = (date: string) => {
  const shortDate = date.slice(0, 10)
  router.push(`/record/${shortDate}`)
}

const goToNew = () => {
  router.push("/record")
}

onMounted(async () => {
  try {
    const apiData = await GoogleSheetsAPI.getRecords()
    records.value = apiData
  } catch (err) {
    console.warn("API 失敗，使用 mock 資料", err)
    try {
      records.value = mockRecords
    } catch (mockErr) {
      console.error("連 mock 資料也失敗", mockErr)
      error.value = true
    }
  } finally {
    loading.value = false
  }
})
</script>
