<!-- src/views/HomeView.vue -->
<template>
  <main class="px-4 py-6 max-w-md mx-auto">
    <h1 class="text-xl font-bold mb-4">歷史紀錄</h1>

    <!-- Loading Spinner -->
    <div v-if="loading" class="text-center py-8">載入中...</div>

     <!-- Record Cards -->
    <div v-else class="space-y-4">
      <RecordCard
        v-for="record in visibleRecords"
        :key="record.date"
        :record="record"
        @click="goToRecord(record.date)"
      />
    </div>

     <!-- Load More -->
    <div v-if="hasMore" class="text-center mt-6">
      <button
        @click="loadMore"
        class="text-sm text-blue-600 hover:underline"
      >
        載入更多
      </button>
    </div>

     <!-- Floating "+" Button -->
    <button
      @click="goToNew"
      class="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white text-3xl rounded-full shadow-lg flex items-center justify-center"
    >
      +
    </button>

  </main>
</template>

<script setup lang="ts">
import RecordCard from "@/components/RecordCard.vue";
import type { RecordItem } from "@/types/record";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

const mockRecords = ref<RecordItem[]>([
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
   {
    date: "2025-07-16",
    content: "做了很多事，這是第3筆資料。",
    tags: ["life", "routine"],
  },
   {
    date: "2025-07-16",
    content: "做了很多事，這是第4筆資料。",
    tags: ["life", "routine"],
  },
   {
    date: "2025-07-16",
    content: "做了很多事，這是第5筆資料。",
    tags: ["life", "routine"],
  },
   {
    date: "2025-07-16",
    content: "做了很多事，這是第6筆資料。",
    tags: ["life", "routine"],
  },
   {
    date: "2025-07-16",
    content: "做了很多事，這是第7筆資料。",
    tags: ["life", "routine"],
  },
   {
    date: "2025-07-16",
    content: "做了很多事，這是第8筆資料。",
    tags: ["life", "routine"],
  },
   {
    date: "2025-07-16",
    content: "做了很多事，這是第筆資料。",
    tags: ["life", "routine"],
  },
   {
    date: "2025-07-16",
    content: "做了很多事，這是第9筆資料。",
    tags: ["life", "routine"],
  },
   {
    date: "2025-07-16",
    content: "做了很多事，這是第10筆資料。",
    tags: ["life", "routine"],
  },
   {
    date: "2025-07-16",
    content: "做了很多事，這是第11筆資料。",
    tags: ["life", "routine"],
  },
   {
    date: "2025-07-16",
    content: "做了很多事，這是第12筆資料。",
    tags: ["life", "routine"],
  },
   {
    date: "2025-07-16",
    content: "做了很多事，這是第13筆資料。",
    tags: ["life", "routine"],
  },
   {
    date: "2025-07-16",
    content: "做了很多事，這是第14筆資料。",
    tags: ["life", "routine"],
  },
   {
    date: "2025-07-16",
    content: "做了很多事，這是第15筆資料。",
    tags: ["life", "routine"],
  },
   {
    date: "2025-07-16",
    content: "做了很多事，這是第16筆資料。",
    tags: ["life", "routine"],
  }
]);

const visibleCount = ref(10)
const loading = ref(false)

const visibleRecords = computed(() =>
  mockRecords.value.slice(0, visibleCount.value)
)

const hasMore = computed(() =>
  visibleCount.value < mockRecords.value.length
)

const loadMore = () => {
  visibleCount.value += 5
}

const router = useRouter()

const goToRecord = (date: string) => {
  router.push(`/edit/${date}`)
}

const goToNew = () => {
  router.push('/new')
}

</script>
