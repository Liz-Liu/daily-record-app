import type { RecordItem } from "@/types/record"

const BASE_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL
const AUTH_ENABLED = import.meta.env.VITE_AUTH_ENABLED === "true"

type HttpMethod = "GET" | "POST"

export class GoogleSheetsAPI {
  private static idToken: string | null = null
  static setAuthToken(token: string | null) {
    this.idToken = token
  }

  private static buildUrl(params: Record<string, string | number | undefined>) {
    const url = new URL(BASE_URL)
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
    }
    // 私有站才帶 token（GET）
    if (AUTH_ENABLED && this.idToken) {
      url.searchParams.set("idToken", this.idToken)
    }
    return url.toString()
  }

  private static async makeRequest<T>(
    method: HttpMethod,
    payload?: any
  ): Promise<T> {
    if (!BASE_URL) throw new Error("環境變數 VITE_GOOGLE_SCRIPT_URL 未設定")

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000) // 10s 防卡住

    try {
      const isGet = method === "GET"
      const url = isGet ? this.buildUrl(payload || {}) : BASE_URL

      // POST body：附上 action/data 與 idToken
      const body = !isGet
        ? JSON.stringify({
            ...(payload || {}),
            ...(AUTH_ENABLED && this.idToken ? { idToken: this.idToken } : {}),
          })
        : undefined

      const res = await fetch(url, {
        method,
        headers: isGet
          ? undefined
          : { "Content-Type": "text/plain;charset=utf-8" },
        body,
        redirect: "follow",
        credentials: "omit",
        cache: "no-store",
        signal: controller.signal,
      })

      if (res.status >= 400 && res.status !== 302) {
        const text = await res.text()
        throw new Error(`HTTP ${res.status}: ${text}`)
      }

      // 有些 GAS 回傳空字串或非 JSON，盡量安全 parse
      const text = await res.text()
      const data = text ? (JSON.parse(text) as T) : (null as T)
      return data
    } catch (err) {
      console.error("❌ 請求失敗", err)
      throw err
    } finally {
      clearTimeout(timeout)
    }
  }

  // ✅ 取得全部的紀錄清單
  static async getRecords(): Promise<RecordItem[]> {
    return await this.makeRequest<RecordItem[]>("GET", { action: "getRecords" })
  }

  // ✅ 取得某一天的紀錄
  static async getRecordByDate(date: string): Promise<RecordItem | null> {
    const data = await this.makeRequest<RecordItem | null>("GET", {
      action: "getRecordByDate",
      date,
    })
    return data ?? null
  }

  // ✅ 儲存日記
  static async saveRecord(record: RecordItem): Promise<boolean> {
    const { date, content, tags } = record

    await this.makeRequest<any>("POST", {
      action: "saveRecord",
      data: { date, content, tags },
    })

    return true
  }

  // ✅ 更新日記（同一天已有紀錄時）
  static async updateRecord(
    date: string,
    content: string,
    tags: string[]
  ): Promise<boolean> {
    await this.makeRequest<any>("POST", {
      action: "updateRecord",
      data: { date, content, tags },
    })

    return true
  }

  // ✅ 刪除
  static async deleteRecord(date: string): Promise<boolean> {
    await this.makeRequest<any>("POST", {
      action: "deleteRecord",
      data: { date },
    })

    return true
  }
}
