import type { RecordItem } from "@/types/record"

const DRAFT_KEY = "daily-record-drafts"
const TAG_HISTORY_KEY = "daily-record-tag-history"

interface DraftStorage {
  [date: string]: RecordItem
}

interface TagHistoryStorage {
  [tag: string]: number  // tag: lastUsed timestamp
}


export class LocalStorageService {

  // ==================== 草稿相關 ====================
  
  // 儲存單筆草稿
  static saveDraft(
    date: string,
    content: string,
    tags: string[],
    updatedAt: string
  ): void {
    const drafts: DraftStorage = this.getDrafts()
    const existing = drafts[date]
    const createdAt = existing?.createdAt ?? updatedAt

    drafts[date] = {
      date,
      content,
      tags,
      createdAt,
      updatedAt,
      isDraft: true,
    }

    this.safeSetItem(DRAFT_KEY, drafts)
  }

  // 取得指定日期草稿
  static getDraft(date: string): RecordItem | null {
    const drafts: DraftStorage = this.getDrafts()
    return drafts[date] ?? null
  }

  // 清除指定日期草稿
  static clearDraft(date: string) {
    const drafts: DraftStorage = this.getDrafts()
    delete drafts[date]
    this.safeSetItem(DRAFT_KEY, drafts)
  }

  // 清除所有過期（超過 7 天）草稿
  static cleanupExpiredDrafts() {
    const drafts: DraftStorage = this.getDrafts()
    const now = Date.now()
    
    for (const [date, draft] of Object.entries(drafts)) {
      const time = new Date(draft.updatedAt ?? draft.createdAt ?? "").getTime()
      const diffDays = (now - time) / (1000 * 60 * 60 * 24)
      if (diffDays > 7) {
        delete drafts[date]
      }
    }
    this.safeSetItem(DRAFT_KEY, drafts)
  }


  // ==================== 標籤歷史記錄 ====================
  
  // 取得所有標籤歷史
  static getTagHistory(): TagHistoryStorage {
    return this.safeGetItem<TagHistoryStorage>(TAG_HISTORY_KEY, {})
  }

  // 儲存標籤歷史
  static saveTagHistory(tagHistory: TagHistoryStorage): void {
    this.safeSetItem(TAG_HISTORY_KEY, tagHistory)
  }

  // 新增或更新單個標籤到歷史（只記錄最後使用時間，不計數）
  static addTagToHistory(tag: string): void {
    const trimmedTag = tag.trim()
    if (!trimmedTag) return

    const history = this.getTagHistory()
    
    // 只更新最後使用時間，不計數
    history[trimmedTag] = Date.now()

    this.saveTagHistory(history)
  }

  // 從歷史中移除標籤
  static removeTagFromHistory(tag: string): void {
    const history = this.getTagHistory()
    delete history[tag]
    this.saveTagHistory(history)
  }

  // 批次新增標籤到歷史（通常在送出表單時使用）
  static addTagsToHistory(tags: string[]): void {
    const history = this.getTagHistory()
    const now = Date.now()
    
    tags.forEach(tag => {
      const trimmedTag = tag.trim()
      if (trimmedTag) {
        history[trimmedTag] = now
      }
    })

    this.saveTagHistory(history)
  }

  // 取得所有歷史標籤（按最近使用排序）
  static getAllHistoricalTags(): string[] {
    const history = this.getTagHistory()
    return Object.keys(history).sort((a, b) => {
      return history[b] - history[a]
    })
  }

  // 清除所有標籤歷史
  static clearTagHistory(): void {
    this.safeSetItem(TAG_HISTORY_KEY, {})
  }


  // ==================== 私有工具方法 ====================
  private static getDrafts(): DraftStorage {
    return this.safeGetItem<DraftStorage>(DRAFT_KEY, {})
  }


  private static safeGetItem<T>(key: string, fallback: T): T {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback

    try {
      return JSON.parse(raw) as T
    } catch (error) {
      console.error(`⚠️ localStorage 解析失敗: ${key}`, error)
      return fallback
    }
  }

  private static safeSetItem(key: string, value: any) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(
        `%c⚠️ localStorage 儲存失敗: ${key}`,
        error,
        "font-size: 30px;"
      )
    }
  }
}
