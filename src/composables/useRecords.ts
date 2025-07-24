// src/composables/useRecords.ts
import { ref, computed } from 'vue'
import { GoogleSheetsAPI } from '@/services/GoogleSheetsAPI'
import type { RecordItem } from '@/types/record'


const records = ref<RecordItem[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const fetchRecords = async () => {
  isLoading.value = true
  try {
    const response = await GoogleSheetsAPI.getRecords()
    records.value = response ?? []
    error.value = null
  } catch (err) {
    error.value = '無法載入資料，將顯示示範資料。'
    records.value = await import('@/mock/mockRecords.json').then(m => m.default as RecordItem[])
  } finally {
    isLoading.value = false
  }
}

const getRecordByDate = (date: string) => {
  return records.value.find((r: { date: string }) => r.date === date) ?? null
}

const sortedRecords = computed(() =>
  [...records.value].sort((a, b) => b.date.localeCompare(a.date))
)

export function useRecords() {
  return {
    records,
    sortedRecords,
    isLoading,
    error,
    fetchRecords,
    getRecordByDate,
  }
}
