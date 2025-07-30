import type { RecordItem } from "@/types/record"

const BASE_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL

export class GoogleSheetsAPI {
  private static async makeRequest<T>(
    url: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const res = await fetch(url, { ...options, redirect: "follow" })

      if (res.status >= 400 && res.status !== 302) {
        const text = await res.text()
        throw new Error(`HTTP ${res.status}: ${text}`)
      }

      const data = (await res.json()) as T
      console.log("%cGAS回傳的Data", "color: pink; font-size: 30px;", data)
      return data
    } catch (err) {
      console.error("❌ 請求失敗", err)
      throw err
    }
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
    const { date, content, tags } = record

    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "saveRecord",
        data: {
          date,
          content,
          tags,
        },
      }),
      redirect: "follow", // 確保跟隨重定向
      credentials: "omit", // 避免不必要的認證
    })

    if (!res.ok) throw new Error("儲存失敗！！！")
    return true
  }

  // ✅ 更新日記（同一天已有紀錄時）
  static async updateRecord(
    date: string,
    content: string,
    tags: string[]
  ): Promise<boolean> {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        action: "updateRecord",
        data: { date, content, tags },
      }),
      redirect: "follow", // 確保跟隨重定向
      credentials: "omit", // 避免不必要的認證
    })

    if (!res.ok) throw new Error("更新失敗！！！")
    return true
  }
}
