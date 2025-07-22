import type { RecordItem } from "@/types/record";

const BASE_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

export class GoogleSheetsService {
  //取得全部的紀錄清單
  static async getRecords(): Promise<RecordItem[]> {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getRecords" }),
    });
    if (!res.ok) throw new Error("抓取資料失敗！！！");
    return await res.json();
  }

  //取得某一天的紀錄
  static async getRecordByDate(date: string): Promise<RecordItem | null> {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getRecordByDate",
        date,
      }),
    });
    if (!res.ok) throw new Error("抓取資料失敗！！！");
    const data = await res.json();
    return data ?? null;
  }

  //儲存日記
  static async saveRecord(record: RecordItem): Promise<boolean> {
    const res = await fetch(BASE_URL, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "saveRecord",
        data: record,
      }),
    });
    if (!res.ok) throw new Error("儲存失敗！！！");
    return true;
  }
}

console.log(
  "%cAPI URL",
  "color: pink; font-size: 40px",
  import.meta.env.VITE_GOOGLE_SCRIPT_URL
);

//GoogleSheetsService.ts：完整程式碼
