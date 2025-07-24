import type { RecordFormData } from "@/types/record"

const DRAFT_KEY = "daily-record-drafts"
const SETTINGS_KEY = "daily-record-settings"

interface DraftStorage {
  [date: string]: {
    content: string
    tags: string[]
    createdAt: string
    updatedAt: string
  }
}

interface SettingsStorage {
  lastUsedTags: string[]
}

export class LocalStorageService {
  // 儲存單筆草稿
  static saveDraft(
    date: string,
    content: string,
    tags: string[],
    updatedAt: string
  ): void {
    const drafts: DraftStorage = this.getDrafts()

    const isNew = !drafts[date]
    const createdAt = isNew ? new Date().toISOString() : drafts[date].createdAt

    drafts[date] = {
      content,
      tags,
      createdAt,
      updatedAt,
    }

    this.safeSetItem(DRAFT_KEY, drafts)
  }

  // 取得指定日期草稿
  static getDraft(date: string): RecordFormData | null {
    const drafts: DraftStorage = this.getDrafts()
    const draft = drafts[date]
    if (!draft) return null
    return {
      date,
      content: draft.content,
      tags: draft.tags,
      isDraft: true,
      createdAt: draft.createdAt,
      updatedAt: draft.updatedAt
    }
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
    const now = new Date()
    for (const [date, draft] of Object.entries(drafts)) {
      console.log("%c日期：", date, "color: red; font-size: 30px")
      console.log("%c內容：", draft.content, "color: red; font-size: 30px")

      const savedTime = new Date(draft.updatedAt)
      const diffDays =
        (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60 * 24)
      if (diffDays > 7) {
        delete drafts[date]
      }
    }
    this.safeSetItem(DRAFT_KEY, drafts)
  }

  // 記錄最近使用的標籤（儲存整組）
  static saveLastUseTags(tags: string[]) {
    const settings: SettingsStorage = this.getSettings()
    settings.lastUsedTags = tags
    this.safeSetItem(SETTINGS_KEY, settings)
  }

  static getLastUsedTags(): string[] {
    const settings: SettingsStorage = this.getSettings()
    return settings.lastUsedTags || []
  }

  // --- 私有工具方法 ---
  private static getDrafts(): DraftStorage {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? JSON.parse(raw) : {}
  }

  private static getSettings(): SettingsStorage {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? JSON.parse(raw) : { lastUsedTags: [] }
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
