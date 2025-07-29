import { onMounted, ref, watch } from "vue"
import { LocalStorageService } from "@/services/LocalStorageService"
import type { RecordFormData } from "@/types/record"
import { getCurrentDate } from "@/utils/dateUtils"

export function useDrafts(formData: RecordFormData, date: string) {
  const hasRestoredDraft = ref(false)

  onMounted(() => {
    const draft = LocalStorageService.getDraft(date)
    if (draft) {
      const shouldRestore = window.confirm("發現尚未儲存的草稿，是否要還原？")
      if (shouldRestore) {
        formData.date = draft.date
        formData.content = draft.content
        formData.tags = draft.tags
        formData.createdAt = draft.createdAt
        formData.updatedAt = draft.updatedAt
        formData.isDraft = true
        hasRestoredDraft.value = true
      }
    }

    LocalStorageService.cleanupExpiredDrafts()
  })

  let timeout: number
  watch(
    () => [formData.content, formData.tags],
    () => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        if (formData.content || formData.tags.length > 0) {
          
          const now = getCurrentDate()
          LocalStorageService.saveDraft(
            formData.date,
            formData.content,
            formData.tags,
            now
          )
        }
      }, 2000)
    },
    { deep: true }
  )

  function clearDraftAfterSave() {
    LocalStorageService.clearDraft(date)
  }

  return {
    hasRestoredDraft,
    clearDraftAfterSave,
  }
}
