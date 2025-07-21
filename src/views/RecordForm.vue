<template>
  <div class="p-4 space-y-4">
    <!-- 返回按鈕 -->
    <button class="text-sm text-blue-500" @click="goBack">← 返回</button>

    <!-- 顯示日期 -->
    <DatePicker v-model="formData.date" :disabled="isViewing" />

    <!-- 內容輸入框 -->
    <textarea
      v-model="formData.content"
      :readonly="isViewing"
      maxlength="200"
      rows="5"
      class="w-full border rounded p-2 text-sm"
      placeholder="輸入今天的紀錄（最多 200 字）"
    ></textarea>

    <!-- 標籤編輯器 -->
    <TagEditor v-model="formData.tags" :disabled="isViewing" />

    <!-- 編輯模式下按鈕 -->
    <div v-if="isEditMode && !isViewing" class="flex gap-2">
      <button
        class="bg-blue-500 text-white px-4 py-2 rounded"
        @click="handleSave"
      >
        儲存
      </button>
      <button
        class="bg-gray-300 text-gray-700 px-4 py-2 rounded"
        @click="cancelEdit"
      >
        取消
      </button>
    </div>

    <!-- 檢視模式下顯示編輯按鈕 -->
    <div v-else-if="isEditMode && isViewing">
      <button
        class="bg-blue-500 text-white px-4 py-2 rounded"
        @click="isViewing = false">
        編輯
      </button>
      <button
        class="bg-red-500 text-white px-4 py-2 rounded"
        @click="handleDelete">
        刪除
      </button>
    </div>

    <!-- 新增模式直接顯示儲存 -->
    <div v-else class="flex">
      <button
        class="bg-blue-500 text-white px-4 py-2 rounded"
        @click="handleSave"
      >
        儲存
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import DatePicker from "@/components/DatePicker.vue";
import TagEditor from "@/components/TagEditor.vue";
import type { RecordItem } from "@/types/record";

const router = useRouter();
const route = useRoute();

// 預設今天日期（YYYY-MM-DD）
const today = new Date().toISOString().slice(0, 10);

const formData = ref<RecordItem>({
  date: today,
  content: "",
  tags: [],
});

// 是否為編輯模式
const isEditMode = computed(() => !!route.params.date);
// 預設：編輯模式就先顯示為檢視畫面
const isViewing = ref(isEditMode.value);

// 假資料模擬
onMounted(() => {
  if (isEditMode.value) {
    formData.value = {
      date: route.params.date as string,
      content: "This is 原本內容",
      tags: ["Ozone", "FEnix"],
      createdAt: "2025-07-16T10:30:00Z",
      updatedAt: "2025-07-16T15:45:00Z",
    };
  }
});

function handleSave() {
  console.log("儲存紀錄", formData.value);
  alert("已儲存！！！");
  isViewing.value = true;
  router.push("/");
}

function handleDelete(){
  const confirmDelete = window.confirm('確定刪除這筆紀錄？')
  if (confirmDelete){
    console.log('🗑 已刪除資料：', formData.value);
    router.push('/') // 返回首頁
  }
}

function cancelEdit() {
  isViewing.value = true;
}

function goBack() {
  router.push("/");
}
</script>
