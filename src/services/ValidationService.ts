export function validateRecord(content: string, tags: string[]): string[] {
  const errors: string[] = []

  if (!content.trim()) {
    errors.push('內容不得為空')
  }

  if (content.length > 200) {
    errors.push(`內容長度超過限制（200 字）`)
  }

  if (tags.length > 10) {
    errors.push('標籤數量不能超過 10 個')
  }

  return errors
}
