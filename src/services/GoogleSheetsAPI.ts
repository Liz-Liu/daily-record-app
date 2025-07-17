// src/services/GoogleSheetsAPI.ts
const baseURL = import.meta.env.VITE_GOOGLE_SCRIPT_URL

export async function getRecords() {
  const res = await fetch(`${baseURL}?action=getRecords`)
  return res.json()
}

export async function saveRecord(date: string, content: string, tags: string[]) {
  const res = await fetch(baseURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, content, tags })
  })
  return res.json()
}
