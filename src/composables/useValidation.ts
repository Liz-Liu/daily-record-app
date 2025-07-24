// src/composables/useValidation.ts
import { ref, computed, watchEffect } from 'vue'

const content = ref('')
const contentLimit = 200
const contentError = ref<string | null>(null)

watchEffect(() => {
  if (content.value.length > contentLimit) {
    contentError.value = `內容不可超過 ${contentLimit} 字`
  } else {
    contentError.value = null
  }
})

export function useValidation() {
  return {
    content,
    contentLimit,
    contentError,
    isValid: computed(() => !contentError.value),
  }
}
