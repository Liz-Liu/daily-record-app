// 📆 dateUtils.ts：處理日期的公用方法

// 取得今天日期（依照使用者本地時區），格式為 YYYY-MM-DD
export function getCurrentDate(): string {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// 將日期字符串轉為顯示用日期（支持 YYYY-MM-DD 和 ISO 格式）
export function formatDateForDisplay(dateString: string): string {
  if (!dateString) return ''
  
  let date: Date
  
  // 處理不同的日期格式
  if (dateString.includes('T')) {
    // ISO 格式：2025-07-27T23:00:00.000Z
    date = new Date(dateString)
  } else {
    // YYYY-MM-DD 格式
    const [year, month, day] = dateString.split("-")
    date = new Date(Number(year), Number(month) - 1, Number(day))
  }
  
  // 檢查日期是否有效
  if (isNaN(date.getTime())) {
    return 'Invalid Date'
  }

  const options: Intl.DateTimeFormatOptions = {
    month: "2-digit",
    day: "2-digit",
    weekday: "long",
  }

  const formatted = date.toLocaleDateString("fr-CA", options)
  const parts = formatted.split(/[\s,]+/).filter(part => part.length > 0)
  
  // 處理不同的日期格式輸出
  if (parts.length >= 3) {
    const [monthDisplay, dayDisplay, weekday] = parts
    return `${monthDisplay}/${dayDisplay} ${capitalizeFirstLetter(weekday)}`
  } else if (parts.length >= 2) {
    const [monthDisplay, dayDisplay] = parts
    return `${monthDisplay}/${dayDisplay}`
  } else {
    return formatted
  }
}

function capitalizeFirstLetter(text: string): string {
  if (!text || text.length === 0) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}