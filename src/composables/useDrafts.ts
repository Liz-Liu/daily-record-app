import { onMounted } from "vue"
import { LocalStorageService } from "@/services/LocalStorageService"
import type { RecordFormData } from "@/types/record"

export function useDrafts(formData: RecordFormData) {

  onMounted(() => {
    const draft = LocalStorageService.getDraft(formData.date)
    if (draft) {

      const shouldRestore = window.confirm("發現尚未儲存的草稿，是否要還原？")
      if (shouldRestore) {
        formData.content = draft.content
        formData.tags = draft.tags
        formData.createdAt = draft.createdAt
        formData.updatedAt = draft.updatedAt
        formData.isDraft = true
      }
    }

    LocalStorageService.cleanupExpiredDrafts()
  })

  // ✅ 儲存成功後清除草稿
  function clearDraftAfterSave() {
    LocalStorageService.clearDraft(formData.date)
  }


  return {
    clearDraftAfterSave,
  }
}
