<!-- src/views/HomeView.vue -->
<template>
  <div class="p-4 space-y-4">
    <RecordCard
      v-for="(record, index) in mockRecords"
      :key="index"
      :record="record"
      @click="handleClick(record)"
    />
  </div>
</template>

<script setup lang="ts">
import RecordCard from "@/components/RecordCard.vue";

const mockRecords = [
  {
    date: "2025-07-17",
    content:
      "今天完成了 Task 6，寫了一個漂亮的卡片元件，看起來很有成就感！希望 UI/UX 很棒。",
    tags: ["done", "coding", "vue", "longtagthatshouldnotshow"],
  },
  {
    date: "2025-07-16",
    content: "做了很多事，這是第二筆資料。",
    tags: ["life", "routine"],
  },
];

function handleClick(record: any) {
  alert(`點擊了紀錄：${record.date}`);
}
</script>
