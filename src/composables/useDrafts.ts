import { onMounted, watch } from "vue"
import { LocalStorageService } from "@/services/LocalStorageService"
import type { RecordFormData } from "@/types/record"
import { getCurrentDate } from "@/utils/dateUtils"

export function useDrafts(formData: RecordFormData, date: string) {
  let timeout: number | null = null

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
      }
    }

    LocalStorageService.cleanupExpiredDrafts()
  })

  // ✅ 儲存成功後清除草稿
  function clearDraftAfterSave() {
    LocalStorageService.clearDraft(formData.date)
  }

  // ✅ 返回或取消時用：手動清除草稿
  function clearDraft() {
    LocalStorageService.clearDraft(formData.date)
  }

  // ✅ 返回或取消時用：取消 auto-save 計時器
  function cancelAutoSave() {
    if (timeout) clearTimeout(timeout)
  }

  return {
    clearDraftAfterSave,
    clearDraft,
    cancelAutoSave,
  }
}
