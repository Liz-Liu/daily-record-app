<script setup lang="ts">
import { ref, computed } from 'vue'

// Props and emits
const props = defineProps<{
  modelValue: string[]
  recentTags?: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'addRecentTag': [tag: string]
  'removeRecentTag': [tag: string]
}>()

// Local state
const inputValue = ref('')
const inputRef = ref<HTMLInputElement>()

// Computed
const tags = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const recentTags = computed(() => props.recentTags ?? [])

// Methods
const addTag = () => {
  const newTag = inputValue.value.trim()
  if (newTag && !tags.value.includes(newTag)) {
    tags.value = [...tags.value, newTag]
    emit('addRecentTag', newTag)
    inputValue.value = ''
  }
}

const addTagFromRecent = (tag: string) => {
  if (!tags.value.includes(tag)) {
    tags.value = [...tags.value, tag]
    emit('addRecentTag', tag)
  }
}

const removeTag = (index: number) => {
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
        <div class="flex flex-wrap gap-1 items-center">
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
            placeholder="輸入標籤後按 Enter"
            @keydown="handleKeydown"
          />
        </div>
      </div>

  
    </div>

    <!-- 最近使用標籤 -->
    <div v-if="recentTags.length" class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">
        最近使用
      </label>
      
      <div class="flex flex-wrap gap-1">
        <span
          v-for="(tag, index) in recentTags"
          :key="'recent-' + index"
          class="inline-flex items-center pl-4 pr-2 py-1 rounded-full text-sm font-medium group"
          :class="[
            tags.includes(tag)
              ? 'bg-gray-100 text-gray-400 opacity-50'
              : 'bg-white border border-gray-300 text-gray-600 hover:border-gray-500 cursor-pointer',
          ]"
        >
          <button
            type="button"
            @click="addTagFromRecent(tag)"
            :disabled="tags.includes(tag)"
            class="focus:outline-none"
          >
            {{ tag }}
          </button>

          <button
            type="button"
            @click="emit('removeRecentTag', tag)"
            class="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-gray-200 focus:outline-none focus:bg-gray-200 text-gray-400 hover:text-red-500"
            aria-label="刪除最近標籤"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Remove default input styling */
input:focus {
  outline: none;
  box-shadow: none;
}
</style>