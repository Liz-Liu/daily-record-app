<template>
  <div class="flex flex-wrap gap-2">
    <!-- 已有的 tags -->
    <span
      v-for="(tag, index) in tags"
      :key="index"
      class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center"
    >
      {{ tag }}
      <button
        type="button"
        @click="removeTag(index)"
        class="ml-2 text-blue-500 hover:text-blue-700"
        aria-label="移除標籤"
      >
        ×
      </button>
    </span>

    <!-- 新增 tag 的 input -->
    <input
      v-model="inputValue"
      @keydown.enter.prevent="addTag"
      @keydown.backspace="handleBackspace"
      type="text"
      placeholder="新增標籤"
      class="px-3 py-1 rounded border border-gray-300 text-sm w-28 focus:outline-none focus:ring focus:border-blue-400"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

/** 接收 props（父層的標籤列表） */
const props = defineProps<{
  modelValue: string[]
}>()

/** 回傳事件給父層 */
const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

/** 當前輸入中的 tag */
const inputValue = ref('')

/** tags 使用 computed 保持同步 */
const tags = computed(() => props.modelValue)

/** 新增標籤邏輯 */
function addTag() {
  const newTag = inputValue.value.trim()
  if (newTag && !tags.value.includes(newTag)) {
    emit('update:modelValue', [...tags.value, newTag])
  }
  inputValue.value = ''
}

/** 移除標籤 */
function removeTag(index: number) {
  const updated = [...tags.value]
  updated.splice(index, 1)
  emit('update:modelValue', updated)
}

/** 按 backspace 且輸入為空時，刪除最後一個 tag */
function handleBackspace() {
  if (inputValue.value === '' && tags.value.length > 0) {
    removeTag(tags.value.length - 1)
  }
}
</script>
