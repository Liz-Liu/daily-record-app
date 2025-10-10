<script setup lang="ts">
import { ref, computed } from 'vue'
import TagHistorySelector from './TagHistorySelector.vue'
import { useTagStore } from '@/stores/tagStore'

// Props and emits
const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

// Use Pinia tag store
const tagStore = useTagStore()

// Local state
const inputValue = ref('')
const inputRef = ref<HTMLInputElement>()

// Computed
const tags = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Methods
const addTag = () => {
  const newTag = inputValue.value.trim()
  if (newTag && !tags.value.includes(newTag)) {
    // 立即將標籤加入歷史記錄
    tagStore.addTagToHistory(newTag)
    
    tags.value = [...tags.value, newTag]
    inputValue.value = ''
  }
}

const removeTag = (index: number) => {
  // 只從當前選中的標籤中移除，不影響歷史記錄
  tags.value = tags.value.filter((_, i) => i !== index)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    addTag()
  } 
}

const focusInput = () => {
  inputRef.value?.focus()
}

// Handle tag selection from history
const handleTagSelect = (tag: string) => {
  if (!tags.value.includes(tag)) {
    // 從歷史中選擇標籤時，更新使用時間
    tagStore.addTagToHistory(tag)
    tags.value = [...tags.value, tag]
  }
}

// Handle tag removal from history (從 localStorage 中永久移除)
const handleTagRemoveFromHistory = (tag: string) => {
  // 從歷史記錄中移除
  tagStore.removeTagFromHistory(tag)
  
  // 如果當前選中的標籤中有這個標籤，也一併移除
  if (tags.value.includes(tag)) {
    tags.value = tags.value.filter(t => t !== tag)
  }
}
</script>

<template>
  <div class="w-full space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-2">
        標籤
      </label>

      <div
        class="min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 cursor-text"
        @click="focusInput"
      >
        <div class="flex flex-wrap gap-2 items-center">
          <!-- Existing tags -->
          <span
            v-for="(tag, index) in tags"
            :key="index"
            class="inline-flex items-center pl-4 pr-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 group"
          >
            #{{ tag }}
            <button
              type="button"
              class="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 focus:outline-none focus:bg-blue-200"
              @click.stop="removeTag(index)"
              title="從當前選擇中移除（保留在歷史中）"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </span>

          <!-- Input field -->
          <input
            ref="inputRef"
            v-model="inputValue"
            type="text"
            class="flex-1 min-w-[120px] border-none outline-none bg-transparent text-sm placeholder-gray-400"
            placeholder="輸入後按 Enter 新增標籤"
            @keydown="handleKeydown"
          />
        </div>
      </div>

    </div>

    <!-- Tag History Selector -->
    <TagHistorySelector
      :selected-tags="tags"
      :max-display="12"
      @tag-select="handleTagSelect"
      @tag-remove="handleTagRemoveFromHistory"
    />
  </div>
</template>

<style scoped>
/* Remove default input styling */
input:focus {
  outline: none;
  box-shadow: none;
}
</style>