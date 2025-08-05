// 📆 dateUtils.ts：處理日期的公用方法

// 取得今天日期（依照使用者本地時區），格式為 YYYY-MM-DD
export function getCurrentDate(): string {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, "0")
  const dd = String(today.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

// 將日期字符串轉為顯示用日期（支持 YYYY-MM-DD 和 ISO 格式）
// 輸出格式為：07/21 Lundi
export function formatDateForDisplay(dateString: string): string {
  if (!dateString) return ""

  let date: Date

  // 處理不同的日期格式
  if (dateString.includes("T")) {
    // ISO 格式：2025-07-27T23:00:00.000Z
    date = new Date(dateString)
  } else {
    // YYYY-MM-DD 格式
    const [year, month, day] = dateString.split("-")
    date = new Date(Number(year), Number(month) - 1, Number(day))
  }

  // 檢查日期是否有效
  if (isNaN(date.getTime())) {
    return "Invalid Date"
  }

  // ✅ 格式化日期為 MM/DD
  const datePart = date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
  })

  const weekdayPart = date.toLocaleDateString("fr-FR", {
    weekday: "long",
  })

  return `${datePart} ${capitalizeFirstLetter(weekdayPart)}`
}


// 將 ISO 字串轉為「YYYY-MM-DD HH:mm:ss」格式（本地時間）
export function formatTimestampForDisplay(isoString?: string): string {
  if (!isoString) return ""

  const date = new Date(isoString)
  if (isNaN(date.getTime())) return "Invalid Date"

  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  const hh = String(date.getHours()).padStart(2, "0")
  const mi = String(date.getMinutes()).padStart(2, "0")
  const ss = String(date.getSeconds()).padStart(2, "0")

  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
}


// ✅ 首字大寫
function capitalizeFirstLetter(text: string): string {
  if (!text || text.length === 0) return ""
  return text.charAt(0).toUpperCase() + text.slice(1)
}


