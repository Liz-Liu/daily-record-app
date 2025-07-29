<!-- src/components/RecordCard.vue -->
<template>
  <div
    class="bg-white shadow rounded-xl p-4 space-y-2 hover:bg-gray-50 cursor-pointer transition-all"
    @click="$emit('click', record.date)"
  >
    <div class="text-sm text-gray-500">{{ displayDate }}</div>
    <div class="text-base text-gray-800 truncate">{{ previewContent }}</div>
    <div class="flex flex-wrap gap-2">
      <span
        v-for="(tag, index) in displayTags"
        :key="index"
        class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
      >
        #{{ tag }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RecordItem } from '@/types/record';
import { formatDateForDisplay } from '@/utils/dateUtils';

const { record } = defineProps<{
  record: RecordItem
}>()

const emit = defineEmits(['click'])

const displayDate = formatDateForDisplay(record.date)

/** 最多顯示 50 字 */
const previewContent = record.content.slice(0, 50)

/** 最多顯示 3 個 tag */
const displayTags = record.tags.slice(0, 3)
</script>
