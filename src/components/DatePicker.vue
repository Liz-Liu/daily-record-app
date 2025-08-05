<script setup lang="ts">
import { computed } from 'vue'
import { getCurrentDate } from '@/utils/dateUtils'

// Props and emits
const props = defineProps<{
  modelValue: string
  label?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Computed
const selectedDate = computed({
  get: () => props.modelValue || getCurrentDate(),
  set: (value) => emit('update:modelValue', value)
})

// Get today's date for max attribute
const today = getCurrentDate()
</script>

<template>
  <div class="w-full">
    <label class="block text-sm font-medium text-gray-700 mb-2">
      {{ label || '日期' }}
    </label>

    <div class="relative">
      <input
        v-model="selectedDate"
        type="date"
        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
        :class="{ 'bg-gray-50 cursor-not-allowed': disabled }"
        :max="today"
        :disabled="disabled"
      />

      <!-- Calendar icon -->
      <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom styling for date input on mobile */
input[type="date"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>