// src/composables/useDrafts.ts
import { ref, watch } from "vue"
import { LocalStorageService } from "@/services/LocalStorageService"

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

const loadDraft = (date: string) => {
  const draft = LocalStorageService.getDraft(date)
  if (draft) {
    draftContent.value = draft.content
    draftTags.value = draft.tags
  }
}

const clearDraft = (date: string) => {
  LocalStorageService.clearDraft(date)
}

export function useDrafts() {
  return {
    draftContent,
    draftTags,
    draftDate,
    loadDraft,
    clearDraft,
  }
}
