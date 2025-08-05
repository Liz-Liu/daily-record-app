<template>
  <div class="space-y-2">
    <!-- 已有的 tags -->
    <div class="flex flex-wrap gap-2">
      <span
        v-for="(tag, index) in tags"
        :key="'tag-' + index"
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

      <!-- 輸入框 -->
      <input
        v-model="inputValue"
        @keydown.enter.prevent="addTag"
        type="text"
        placeholder="新增標籤"
        class="px-3 py-1 rounded border border-gray-300 text-sm w-28 focus:outline-none focus:ring focus:border-blue-400"
      />
    </div>

    <!-- 最近使用標籤 -->
    <div v-if="recentTags.length" class="flex flex-wrap gap-2 mt-2">
      <span class="text-sm text-gray-500 w-full">最近使用：</span>

      <div
        v-for="(tag, index) in recentTags"
        :key="'recent-' + index"
        class="flex items-center px-3 py-1 rounded-full border text-sm"
        :class="[
          tags.includes(tag)
            ? 'bg-gray-100 text-gray-400 opacity-50'
            : 'border-gray-300 text-gray-600 hover:bg-blue-100 hover:border-blue-300',
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
          class="ml-2 text-gray-400 hover:text-red-500"
          aria-label="刪除最近標籤"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue"

const props = defineProps<{
  modelValue: string[]
  recentTags?: string[]
}>()

const emit = defineEmits<{
  (e: "update:modelValue", value: string[]): void
  (e: "addRecentTag", tag: string): void
  (e: "removeRecentTag", tag: string): void
}>()

const inputValue = ref("")
const tags = computed(() => props.modelValue)
const recentTags = computed(() => props.recentTags ?? [])

function addTag() {
  const newTag = inputValue.value.trim()
  if (newTag && !tags.value.includes(newTag)) {
    emit("update:modelValue", [...tags.value, newTag])
    emit("addRecentTag", newTag) // ✅ 通知父層
  }
  inputValue.value = ""
}

function addTagFromRecent(tag: string) {
  if (!tags.value.includes(tag)) {
    emit("update:modelValue", [...tags.value, tag])
    emit("addRecentTag", tag) // ✅ 即使來自 recent 也記錄一下
  }
}

function removeTag(index: number) {
  const updated = [...tags.value]
  updated.splice(index, 1)
  emit("update:modelValue", updated)
}
</script>
