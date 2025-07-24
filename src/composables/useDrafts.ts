// src/composables/useDrafts.ts
import { onMounted, ref, watch } from "vue"
import { LocalStorageService } from "@/services/LocalStorageService"
import type { RecordFormData } from "@/types/record"

const draftContent = ref("")
const draftTags = ref<string[]>([])
const draftDate = ref("")
let saveTimeout: ReturnType<typeof setTimeout> | null = null

const autoSaveDraft = () => {
  if (!draftDate.value) return
  LocalStorageService.saveDraft(
    draftDate.value,
    draftContent.value,
    draftTags.value,
    new Date().toISOString()
  )
}

const scheduleAutoSave = () => {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(autoSaveDraft, 2000)
}

watch([draftContent, draftTags], scheduleAutoSave)


export function useDrafts(formData: RecordFormData, date: string) {
  const hasRestoredDraft = ref(false)

  // 嘗試還原草稿
  onMounted(() => {
    const draft = LocalStorageService.getDraft(date)
    if (draft) {
      const shouldRestore = window.confirm("發現尚未儲存的草稿，是否要還原？")
      if (shouldRestore) {
        formData.content = draft.content
        formData.tags = draft.tags
        hasRestoredDraft.value = true
      }
    }

    // 清除超過 7 天的草稿
    LocalStorageService.cleanupExpiredDrafts()
  })

  // 2 秒內無輸入則儲存草稿
  let timeout: number
  watch(
    () => [formData.content, formData.tags],
    () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        if (formData.content || formData.tags.length > 0) {
          LocalStorageService.saveDraft(
            date,
            formData.content,
            formData.tags,
            new Date().toISOString()
          )
        }
      }, 2000)
    },
    { deep: true }
  )

  // 儲存成功後清除草稿
  function clearDraftAfterSave() {
    LocalStorageService.clearDraft(date)
  }

  return {
    hasRestoredDraft,
    clearDraftAfterSave,
  }
}
