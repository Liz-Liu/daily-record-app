import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LocalStorageService } from '@/services/LocalStorageService'

interface TagHistoryStorage {
  [tag: string]: number  // tag: lastUsed timestamp
}

export const useTagStore = defineStore('tags', () => {
  // State
  const tagHistory = ref<TagHistoryStorage>({})

  // Load from localStorage on init
  const loadFromLocalStorage = () => {
    tagHistory.value = LocalStorageService.getTagHistory()
  }

  // Save to localStorage
  const saveToLocalStorage = () => {
    LocalStorageService.saveTagHistory(tagHistory.value)
  }

  // Computed: Get all historical tags sorted by last used
  // 重要：依賴 tagHistory.value 來觸發響應式更新
  const allHistoricalTags = computed(() => {
    return Object.keys(tagHistory.value).sort((a, b) => {
      return tagHistory.value[b] - tagHistory.value[a]
    })
  })

  // Actions
  const addTagToHistory = (tag: string) => {
    const trimmedTag = tag.trim()
    if (!trimmedTag) return

    // 直接更新 ref，觸發響應式
    tagHistory.value[trimmedTag] = Date.now()
    
    // 同步到 localStorage
    saveToLocalStorage()
  }

  const removeTagFromHistory = (tag: string) => {
    // 直接更新 ref，觸發響應式
    delete tagHistory.value[tag]
    
    // 同步到 localStorage
    saveToLocalStorage()
  }

  const addTagsToHistory = (tags: string[]) => {
    const now = Date.now()
    
    // 批次更新 ref
    tags.forEach(tag => {
      const trimmedTag = tag.trim()
      if (trimmedTag) {
        tagHistory.value[trimmedTag] = now
      }
    })
    
    // 同步到 localStorage
    saveToLocalStorage()
  }

  const clearAllHistory = () => {
    tagHistory.value = {}
    saveToLocalStorage()
  }

  // Initialize on store creation
  loadFromLocalStorage()

  return {
    // State
    tagHistory,
    
    // Computed
    allHistoricalTags,
    
    // Actions
    addTagToHistory,
    removeTagFromHistory,
    addTagsToHistory,
    clearAllHistory,
    loadFromLocalStorage,
    saveToLocalStorage
  }
})