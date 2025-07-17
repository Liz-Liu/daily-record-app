export function isContentValid(content: string, limit = 200): boolean {
  return content.length <= limit
}

export function getContentError(content: string, limit = 200): string | null {
  return content.length > limit ? `內容不能超過 ${limit} 字，目前 ${content.length} 字` : null
}
