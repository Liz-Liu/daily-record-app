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
          <h1 class="text-2xl font-bold text-gray-800">
            {{
              isEditMode ? (isViewing ? "檢視紀錄" : "編輯紀錄") : "新增紀錄"
            }}
          </h1>
          <p class="text-gray-600 text-sm">
            {{
              isEditMode
                ? isViewing
                  ? "View Record"
                  : "Edit Record"
                : "Add New Record"
            }}
          </p>
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

      <!-- 整體進場動畫容器 -->
      <div
        v-else
        class="opacity-0 translate-y-4 transition-all duration-500 ease-out"
        :class="{ 'opacity-100 translate-y-0': !isLoading }"
      >
        <!-- DatePicker (總是顯示) -->
        <div class="mb-4">
          <DatePicker v-model="formData.date" :disabled="isEditMode" />
        </div>

        <!-- 切換動畫區塊 -->
        <Transition name="fade-slide" mode="out-in">
          <div :key="isViewing ? 'view' : 'edit'">
            <!-- View Mode (檢視模式) -->
            <div
              v-if="isViewing"
              class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6"
            >
              <!-- Content Display -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3"
                  >內容</label
                >
                <div
                  class="text-base text-gray-900 leading-relaxed whitespace-pre-wrap min-h-[120px]"
                >
                  {{ formData.content || "無內容" }}
                </div>
              </div>

              <!-- Tags Display -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3"
                  >標籤</label
                >
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

            <!-- Edit Form (編輯模式) -->
            <form
              v-else
              @submit.prevent="handleSave"
              class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6"
            >
              <!-- Content Input -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  內容
                </label>
                <textarea
                  v-model="formData.content"
                  rows="6"
                  maxlength="200"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="記錄今天發生的事情..."
                ></textarea>
                <div class="flex justify-between items-center mt-1">
                  <p class="text-xs text-gray-500">記錄你的想法和感受</p>
                  <span class="text-xs text-gray-400"
                    >{{ formData.content.length }}/200</span
                  >
                </div>
              </div>

              <!-- Tag Editor -->
              <TagEditor v-model="formData.tags" />

              <!-- Edit Form Action Buttons -->
              <div class="flex gap-3 pt-4">
                <button
                  type="button"
                  @click="cancelEdit"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  {{ isEditMode ? "取消" : "返回" }}
                </button>
                <button
                  type="submit"
                  :disabled="isSaving || !formData.content.trim()"
                  class="flex-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span
                    v-if="isSaving"
                    class="flex items-center justify-center"
                  >
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

              <!-- Delete Button (僅編輯模式顯示) -->
              <button
                v-if="isEditMode"
                type="button"
                @click="handleDelete"
                class="w-full mt-2 text-red-600 text-sm underline hover:text-red-800 transition-colors"
              >
                刪除紀錄
              </button>
            </form>
          </div>
        </Transition>
      </div>
    </div>
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
import { ref, reactive, computed, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import type { RecordFormData } from "@/types/record"
import { useDrafts } from "@/composables/useDrafts"
import { GoogleSheetsAPI } from "@/services/GoogleSheetsAPI"
import DatePicker from "@/components/DatePicker.vue"
import TagEditor from "@/components/TagEditor.vue"
import { LocalStorageService } from "@/services/LocalStorageService"
import { getCurrentDate } from "@/utils/dateUtils"


const route = useRoute()
const router = useRouter()

const isEditMode = computed(() => !!route.params.date)
const isViewing = ref(route.params.date ? true : false)
const isLoading = ref(false)
const isSaving = ref(false)

const rawDate = route.params.date
const date =
typeof rawDate === "string" ? rawDate.slice(0, 10) : getCurrentDate()

const formData = reactive<RecordFormData>({
  date,
  content: "",
  tags: [],
  isDraft: true,
})

const { clearDraftAfterSave } = useDrafts(formData, date)

onMounted(async () => {
  isLoading.value = true

  try {
    if (!formData.date) {
      const today = getCurrentDate()
      formData.date = today
    }

    const localDraft = LocalStorageService.getDraft(formData.date)

    if (localDraft) {
      formData.date = localDraft.date
      formData.content = localDraft.content
      formData.tags = localDraft.tags
      formData.isDraft = true
      return
    }

    if (isEditMode.value) {
      try {
        const record = await GoogleSheetsAPI.getRecordByDate(date)
        if (record) {
          formData.date = record.date
          formData.content = record.content
          formData.tags = record.tags
          formData.isDraft = false
        } else {
          alert("找不到該筆資料")
          router.push("/")
        }
      } catch (err) {
        console.error("❌ 載入失敗", err)
        alert("載入失敗，請稍後再試")
      }
    } else {
      formData.date = date
      formData.content = ""
      formData.tags = LocalStorageService.getLastUsedTags()
      formData.isDraft = true
      isViewing.value = false // 新增模式直接進入編輯
    }
  } finally {
    isLoading.value = false
  }
})

function enterEditMode() {
  isViewing.value = false
}

function cancelEdit() {
  if (isEditMode.value) {
    isViewing.value = true
  } else {
    goBack()
  }
}

function goBack() {
  router.push("/")
}

function handleDelete() {
  const confirmDelete = window.confirm("確定刪除這筆紀錄？")
  if (confirmDelete) {
    router.push("/")
  }
}

async function handleSave() {
  if (!formData.content.trim()) {
    alert("請輸入內容")
    return
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
      console.log("✅ 編輯模式 - 更新現有紀錄")
      await GoogleSheetsAPI.updateRecord(
        formData.date,
        formData.content,
        formData.tags
      )
    } else {
      // 新增模式：檢查是否已有記錄
      console.log("🆕 新增模式 - 檢查是否已有記錄")
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
        console.log("✅ 當天無紀錄 - 建立新記錄")
        await GoogleSheetsAPI.saveRecord(recordToSave)
      }
    }

    clearDraftAfterSave()
    
    router.push("/")
  } catch (err) {
    console.error("❌ 儲存失敗", err)
    alert("儲存失敗，請稍後再試")
  } finally {
    isSaving.value = false
  }
}
</script>
