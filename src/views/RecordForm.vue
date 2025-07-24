<template>
  <!-- 整體進場動畫 -->
  <div
    class="p-4 max-w-xl mx-auto space-y-4 opacity-0 translate-y-4 transition-all duration-500 ease-out"
    :class="{ 'opacity-100 translate-y-0': true }"
  >
    <h1 class="text-xl font-bold">
      {{ isEditMode ? (isViewing ? '檢視紀錄' : '編輯紀錄') : '新增紀錄' }}
    </h1>

    <DatePicker v-model="formData.date" :disabled="isEditMode" />

    <!-- 切換動畫區塊 -->
    <Transition name="fade-slide" mode="out-in">
      <div :key="isViewing ? 'view' : 'edit'">
        <!-- 檢視模式 -->
        <div v-if="isViewing">
          <p class="whitespace-pre-line">{{ formData.content }}</p>
          <div class="flex flex-wrap gap-2 mt-2">
            <span
              v-for="tag in formData.tags"
              :key="tag"
              class="px-2 py-1 bg-gray-200 rounded"
            >
              #{{ tag }}
            </span>
          </div>
          <div class="flex gap-2 mt-4">
            <button @click="goBack" class="flex-1 border rounded py-2">返回</button>
            <button @click="enterEditMode" class="flex-1 bg-blue-600 text-white rounded py-2">
              編輯
            </button>
          </div>
        </div>

        <!-- 編輯模式 -->
        <div v-else>
          <textarea
            v-model="formData.content"
            placeholder="輸入內容（最多 200 字）"
            maxlength="200"
            rows="6"
            class="w-full border p-2 rounded resize-none"
          />
          <TagEditor v-model="formData.tags" />

          <div class="flex gap-2 mt-4">
            <button @click="cancelEdit" class="flex-1 border rounded py-2">取消</button>
            <button @click="handleSave" class="flex-1 bg-blue-600 text-white rounded py-2">
              儲存
            </button>
          </div>

          <button
            v-if="isEditMode"
            @click="handleDelete"
            class="mt-2 w-full text-red-600 text-sm underline"
          >
            刪除紀錄
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* 切換動畫：滑動 + 淡入 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { RecordFormData } from '@/types/record'
import { useDrafts } from '@/composables/useDrafts'
import { GoogleSheetsAPI } from '@/services/GoogleSheetsAPI'
import DatePicker from '@/components/DatePicker.vue'
import TagEditor from '@/components/TagEditor.vue'

const route = useRoute()
const router = useRouter()

const isEditMode = computed(() => !!route.params.date)
const isViewing = ref(isEditMode.value)

const rawDate = route.params.date
const date = typeof rawDate === 'string' ? rawDate : new Date().toISOString().slice(0, 10)

const formData = reactive<RecordFormData>({
  date,
  content: '',
  tags: [],
  isDraft: true
})

const { clearDraftAfterSave } = useDrafts(formData, date)

onMounted(() => {
  if (isEditMode.value) {
    formData.date
    formData.content = 'This is 原本內容'
    formData.tags = ['Ozone', 'FEnix']
    formData.isDraft = false
  }
})

function enterEditMode() {
  isViewing.value = false
}

function cancelEdit() {
  isViewing.value = true
}

function goBack() {
  router.push('/')
}

function handleDelete() {
  const confirmDelete = window.confirm('確定刪除這筆紀錄？')
  if (confirmDelete) {
    console.log('🗑 已刪除資料：', formData)
    router.push('/')
  }
}

async function handleSave() {
  if (!formData.content.trim()) {
    alert('請輸入內容')
    return
  }

  try {
    // ✅ 只挑出要傳給 Google API 的欄位
    const recordToSave = {
      date: formData.date,
      content: formData.content,
      tags: formData.tags
    }

    await GoogleSheetsAPI.saveRecord(recordToSave)

    // ✅ 儲存成功後清除本地草稿（包含 isDraft, createdAt 等）
    clearDraftAfterSave()

    router.push('/')
  } catch (err) {
    console.error('❌ 儲存失敗', err)
    alert('儲存失敗，請稍後再試')
  }
}
</script>