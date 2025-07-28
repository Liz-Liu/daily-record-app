import type { RecordItem } from "@/types/record"

const BASE_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL
const MAX_RETRIES = 3
const BASE_DELAY = 500 // 毫秒

export class GoogleSheetsAPI {
  // ✅ 通用請求處理函式，加上 retry/backoff
  private static async makeRequest<T>(url: string, options?: RequestInit): Promise<T> {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await fetch(url, options)
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
        const data = await res.json()
        return data
      } catch (err) {
        if (attempt === MAX_RETRIES) {
          console.error("API 請求失敗（已達最大重試次數）：", err)
          throw err
        }
        const delay = BASE_DELAY * Math.pow(2, attempt)
        console.warn(`API 請求失敗，嘗試第 ${attempt + 1} 次，${delay}ms 後重試...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
    throw new Error("未知錯誤")
  }

  // ✅ 取得全部的紀錄清單
  static async getRecords(): Promise<RecordItem[]> {
    const url = `${BASE_URL}?action=getRecords`
    return await this.makeRequest<RecordItem[]>(url)
  }

  // ✅ 取得某一天的紀錄
  static async getRecordByDate(date: string): Promise<RecordItem | null> {
    const url = `${BASE_URL}?action=getRecordByDate&date=${date}`
    const data = await this.makeRequest<RecordItem | null>(url)
    return data ?? null
  }

  // ✅ 儲存日記
  static async saveRecord(record: RecordItem): Promise<boolean> {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "saveRecord",
        data: record,
      }),
    })
    if (!res.ok) throw new Error("儲存失敗！！！")
    return true
  }
}

// ✅ 開發測試用
console.log(
  "%cAPI URL",
  "color: pink; font-size: 40px",
  import.meta.env.VITE_GOOGLE_SCRIPT_URL
)
