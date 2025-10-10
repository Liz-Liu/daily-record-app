<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-6 max-w-2xl">
      <!-- Header -->
      <header class="mb-6 flex items-center">
        <button
          @click="goBack"
          class="mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-gray-700">
            {{
              isEditMode && isViewing
                ? "檢視紀錄"
                : isEditMode
                ? "編輯紀錄"
                : "新增紀錄"
            }}
          </h1>
          <!-- <p class="text-gray-600 text-sm">
            {{
              isEditMode && isViewing
                ? "View Record"
                : isEditMode
                ? "Edit Record"
                : "Add New Record"
            }}
          </p> -->
        </div>
      </header>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <div class="animate-pulse space-y-4">
          <div class="h-4 bg-gray-200 rounded w-1/4"></div>
          <div class="h-10 bg-gray-200 rounded"></div>
          <div class="h-4 bg-gray-200 rounded w-1/4"></div>
          <div class="h-32 bg-gray-200 rounded"></div>
          <div class="h-4 bg-gray-200 rounded w-1/4"></div>
          <div class="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>

      <!-- View Mode (for existing records) -->
      <div
        v-if="!isLoading && isEditMode && isViewing"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6"
      >
        <!-- Date Display -->
        <div>
          <!-- <label class="block text-sm font-medium text-gray-700 mb-3"
            >日期</label
          > -->
          <div class="text-2xl font-serif text-gray-900 mb-1">
            {{ formatDateForDisplay(formData.date) }}
          </div>
        </div>

        <!-- Content Display -->
        <div>
          <!-- <label class="block text-sm font-medium text-gray-700 mb-3"
            >內容</label
          > -->
          <div
            class="text-base text-gray-600 leading-relaxed whitespace-pre-wrap min-h-[120px]"
          >
            {{ formData.content || "無內容" }}
          </div>
        </div>

        <!-- Tags Display -->
        <div>
          <!-- <label class="block text-sm font-medium text-gray-700 mb-3"
            >標籤</label
          > -->
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in formData.tags"
              :key="tag"
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
              #{{ tag }}
            </span>
            <span
              v-if="formData.tags.length === 0"
              class="text-base text-gray-400"
              >無標籤</span
            >
          </div>
        </div>

        <!-- Timestamp info -->
        <div class="mt-3 pt-2 border-t border-gray-100">
          <div class="flex flex-col text-xs space-y-1 text-gray-400">
            <span
              >建立: {{ formatTimestampForDisplay(formData.createdAt) }}</span
            >
            <span v-if="formData.updatedAt !== formData.createdAt">
              更新: {{ formatTimestampForDisplay(formData.updatedAt) }}
            </span>
          </div>
        </div>

        <!-- View Mode Action Buttons -->
        <div class="flex gap-3 pt-4">
          <button
            type="button"
            @click="goBack"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            返回
          </button>
          <button
            type="button"
            @click="enterEditMode"
            class="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            編輯
          </button>
        </div>
      </div>

      <!-- Edit Form (for new records or when editing existing records) -->
      <form
        v-else-if="!isLoading"
        @submit.prevent="handleSave"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6"
      >
        <!-- Date Picker -->
        <DatePicker v-model="formData.date" :disabled="isEditMode" />

        <!-- Content Input -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            內容
          </label>
          <textarea
            v-model="formData.content"
            rows="6"
            maxlength="200"
            class="w-full px-3 py-2 border text-sm placeholder-gray-400 border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
            placeholder="記錄今天發生的 Highlight✨"
          ></textarea>
          <div class="flex justify-between items-center mt-1">
            <span class="text-xs text-gray-400"
              >{{ formData.content.length }}/200</span
            >
          </div>
        </div>

         <!-- Tag Editor -->
        <TagEditor v-model="formData.tags" />


        <!-- Edit Form Action Buttons -->
        <div class="flex gap-3 pt-4">
          <!-- Delete Button (only for edit mode) -->
          <button
            v-if="isEditMode"
            type="button"
            @click="handleDelete"
            class="flex-1 px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 transition-colors"
          >
            刪除
          </button>


          <button
            type="button"
            @click="handleSaveDraft"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          >
            儲存草稿
          </button>

          <!-- Save Button -->
          <button
            type="submit"
            :disabled="isSaving"
            class="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="isSaving" class="flex items-center justify-center">
              <svg
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              儲存中...
            </span>
            <span v-else>{{ isEditMode ? "更新" : "儲存" }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import type { RecordFormData } from "@/types/record"
import { useDrafts } from "@/composables/useDrafts"
import { GoogleSheetsAPI } from "@/services/GoogleSheetsAPI"
import DatePicker from "@/components/DatePicker.vue"
import TagEditor from "@/components/TagEditor.vue"
import { LocalStorageService } from "@/services/LocalStorageService"
import { useTagStore } from "@/stores/tagStore"
import {
  getCurrentDate,
  formatDateForDisplay,
  formatTimestampForDisplay,
} from "@/utils/dateUtils"

const route = useRoute()
const router = useRouter()
const tagStore = useTagStore()

const isEditMode = computed(() => !!route.params.date)
const isViewing = ref(route.params.date ? true : false)
const isLoading = ref(false)
const isSaving = ref(false)

const rawDate = route.params.date
const date =
  typeof rawDate === "string" ? rawDate.slice(0, 10) : getCurrentDate()

const formData = reactive<RecordFormData>({
  date: isEditMode.value ? date : getCurrentDate(), // 編輯模式用 URL 的日期，新增模式用今天
  content: "",
  tags: [],
  isDraft: true,
})

const { clearDraftAfterSave } = useDrafts(formData)

watch(
  () => formData.date,
  (newDate) => {
    const draft = LocalStorageService.getDraft(newDate)
    if (draft) {
      const confirmLoad = window.confirm("這天已有草稿，要載入嗎？")
      if (confirmLoad) {
        formData.content = draft.content
        formData.tags = draft.tags
        formData.isDraft = true
      }
    }
  }
)

onMounted(async () => {
  isLoading.value = true

  try {
    if (!formData.date) {
      formData.date = getCurrentDate()
    }

    const localDraft = formData.date
      ? LocalStorageService.getDraft(formData.date)
      : null

    // 先檢查本地草稿（不分編輯或新增模式
    if (localDraft) {
      formData.content = localDraft.content
      formData.tags = localDraft.tags
      formData.isDraft = true
      formData.createdAt = localDraft.createdAt
      formData.updatedAt = localDraft.updatedAt
      return
    }

    if (isEditMode.value) {
      // 編輯模式：載入遠端資料
      try {
        const record = await GoogleSheetsAPI.getRecordByDate(date)
        if (record) {
          formData.content = record.content
          formData.tags = record.tags
          formData.isDraft = false
          formData.createdAt = record.createdAt
          formData.updatedAt = record.updatedAt
        } else {
          alert("找不到該筆資料")
          router.push("/")
        }
      } catch (err) {
        console.error("❌ 載入失敗", err)
        alert("載入失敗，請稍後再試")
      }
    } else {
      isViewing.value = false
    }
  } finally {
    isLoading.value = false
  }
})

function enterEditMode() {
  isViewing.value = false
}

function goBack() {
  router.push("/")
}

async function handleDelete() {
  const confirmDelete = window.confirm("確定刪除這筆紀錄？")
  if (!confirmDelete) return

  try {
    await GoogleSheetsAPI.deleteRecord(formData.date)
    alert("已刪除")
    router.push("/")
  } catch (err) {
    console.error("❌ 刪除失敗", err)
    alert("刪除失敗，請稍後再試")
  }
}

async function handleSave() {
  
  if (!formData.date || formData.date.trim() === "") {
    formData.date = getCurrentDate()
  }

  isSaving.value = true

  try {
    const recordToSave = {
      date: formData.date,
      content: formData.content,
      tags: formData.tags,
    }

    if (isEditMode.value) {
      // 編輯模式：直接更新
      await GoogleSheetsAPI.updateRecord(
        formData.date,
        formData.content,
        formData.tags
      )
    } else {
      // 新增模式：檢查是否已有記錄
      const existing = await GoogleSheetsAPI.getRecordByDate(formData.date)

      if (existing) {
        // 當天已有紀錄，詢問是否覆蓋
        const confirmOverwrite = window.confirm("當天已有紀錄，確定要覆蓋嗎？")
        if (confirmOverwrite) {
          await GoogleSheetsAPI.updateRecord(
            formData.date,
            formData.content,
            formData.tags
          )
        } else {
          return
        }
      } else {
        // 當天無紀錄，建立新記錄
        await GoogleSheetsAPI.saveRecord(recordToSave)
      }
    }

     // ✅ 將標籤加入歷史記錄（使用 tagStore）
    tagStore.addTagsToHistory(formData.tags)
    // ✅ 儲存成功後清除草稿
    clearDraftAfterSave()

    router.push("/")
  } catch (err) {
    console.error("❌ 儲存失敗", err)
    alert("儲存失敗，請稍後再試")
  } finally {
    isSaving.value = false
  }
}

function handleSaveDraft() {
  const now = new Date().toISOString()

  LocalStorageService.saveDraft(
    formData.date,
    formData.content,
    formData.tags,
    now
  )

  alert("草稿已儲存")
}

</script>
