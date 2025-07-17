export interface RecordItem {
  date: string
  content : string
  tags: string[]
  createdAt?: string // optional：建立時間（ISO 格式）
  updatedAt?: string  // optional：更新時間（ISO 格式）
}