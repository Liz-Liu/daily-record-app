<script setup lang="ts">
import { computed, ref } from "vue"
import { useTagStore } from "@/stores/tagStore"

interface Props {
  selectedTags: string[]
  maxDisplay?: number
}

interface Emits {
  (e: "tagSelect", tag: string): void
  (e: "tagRemove", tag: string): void
}

const props = withDefaults(defineProps<Props>(), {
  maxDisplay: 12,
})

const emit = defineEmits<Emits>()

// Use Pinia tag store
const tagStore = useTagStore()

// Show all tags toggle
const showAllTags = ref(false)

// Get historical tags
const historicalTags = computed(() => {
  const allTags = tagStore.allHistoricalTags
  return showAllTags.value ? allTags : allTags.slice(0, props.maxDisplay)
})

// Check if tag is already selected
const isTagSelected = (tag: string): boolean => {
  return props.selectedTags.includes(tag)
}

// Handle tag selection
const handleTagSelect = (tag: string) => {
  if (!isTagSelected(tag)) {
    emit("tagSelect", tag)
  }
}

// Handle tag removal from history (永久從 localStorage 移除)
const handleTagRemove = (tag: string, event?: Event) => {
  if (event) {
    event.stopPropagation()
  }

  // 確認是否要刪除
  if (confirm(`確定要從歷史記錄中永久移除標籤「${tag}」嗎？`)) {
    emit("tagRemove", tag)
  }
}

// Check if there are more tags to show
const hasMoreTags = computed(() => {
  return tagStore.allHistoricalTags.length > props.maxDisplay
})

// Get total tags count
const totalTagsCount = computed(() => {
  return tagStore.allHistoricalTags.length
})
</script>

<template>
  <div v-if="historicalTags.length > 0" class="space-y-3">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h4 class="text-sm font-medium text-gray-700">
        標籤歷史記錄
        <span class="text-xs text-gray-500 font-normal ml-1"
          >({{ totalTagsCount }} 個)</span
        >
      </h4>
    </div>

    <!-- Tag History Grid -->
    <div class="flex flex-wrap gap-2 items-center">
      <div
        v-for="tag in historicalTags"
        :key="tag"
        @click="!isTagSelected(tag) && handleTagSelect(tag)"
        role="button"
        :aria-disabled="isTagSelected(tag)"
        :tabindex="isTagSelected(tag) ? -1 : 0"
        :class="[
          'group inline-flex items-center rounded-full text-sm font-medium transition-all duration-200 border',
          isTagSelected(tag)
            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed pl-4 pr-4 py-1'
            : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-300 cursor-pointer active:bg-blue-100 active:border-blue-400 pl-4 pr-2 py-1',
        ]"
        :title="isTagSelected(tag) ? '已選擇此標籤' : '點擊選擇標籤'"
      >
        <span :class="{ 'line-through': isTagSelected(tag) }">
          {{ tag }}
        </span>

        <button
          type="button"
          v-if="!isTagSelected(tag)"
          @click.stop="handleTagRemove(tag, $event)"
          class="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 focus:outline-none focus:bg-blue-200"
          :title="`永久從歷史記錄中移除「${tag}」`"
        >
          <svg
            class="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Show more/less toggle -->
    <div v-if="hasMoreTags" class="text-center">
      <button
        @click="showAllTags = !showAllTags"
        class="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
      >
        {{ showAllTags ? "顯示較少" : `顯示全部 (${totalTagsCount} 個)` }}
      </button>
    </div>
  </div>

  <!-- Empty state (when no historical tags) -->
  <div
    v-else
    class="text-center py-6 border border-dashed border-gray-300 rounded-lg"
  >
    <svg
      class="mx-auto h-12 w-12 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      ></path>
    </svg>
    <p class="mt-2 text-sm text-gray-500">還沒有使用過的標籤</p>
    <p class="mt-1 text-xs text-gray-400">輸入並新增標籤後，會自動記錄在這裡</p>
  </div>
</template>

<style scoped>
/* Ensure remove button is accessible */
.group:hover .opacity-0 {
  opacity: 1;
}

/* Better visual feedback on mobile */
@media (hover: none) {
  .group .opacity-0 {
    opacity: 0.5;
  }
}
</style>
