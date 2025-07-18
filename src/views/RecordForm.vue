<template>
  <DatePicker v-model="selectedDate" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DatePicker from '@/components/DatePicker.vue'

const selectedDate = ref(new Date().toISOString().slice(0, 10)) // 預設今天
</script>


