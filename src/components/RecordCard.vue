<!-- src/components/RecordCard.vue -->
<template>
  <div
    class="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-4 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200 active:scale-[0.98]"
    @click="$emit('click', record.date)"
  >
    <!-- Date Header -->
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-2xl font-serif font-medium text-gray-900">
        {{ displayDate }}
      </h3>
    </div>

    <!-- Content Preview -->
    <div class="mb-5">
      <p class="text-gray-700 text-base leading-relaxed">
        {{ previewContent }}
      </p>
    </div>

    <!-- Tags -->
    <div v-if="record.tags.length > 0" class="flex flex-wrap gap-2">
      <span
        v-for="tag in displayTags"
        :key="tag"
        class="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
      >
        #{{ tag }}
      </span>
      <span
        v-if="hasMoreTags"
        class="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600"
      >
        +{{ record.tags.length - 5 }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RecordItem } from '@/types/record'
import { formatDateForDisplay } from '@/utils/dateUtils'

const { record } = defineProps<{
  record: RecordItem
}>()

const emit = defineEmits(['click'])

const displayDate = computed(() => formatDateForDisplay(record.date))

/** 最多顯示 50 字 */
const previewContent = computed(() => record.content)

/** 最多顯示 5 個 tag */
const displayTags = computed(() => record.tags.slice(0, 5))
const hasMoreTags = computed(() => record.tags.length > 5)
</script>

<style scoped>
/* Mobile-optimized styles */
@media (max-width: 640px) {
  .cursor-pointer:active {
    transform: scale(0.98);
  }

  /* Larger touch targets on mobile */
  .cursor-pointer {
    min-height: 44px;
  }
}
</style>