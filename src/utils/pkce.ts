export async function sha256(data: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data))
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
export function randomString(len = 64) {
  const arr = new Uint8Array(len)
  crypto.getRandomValues(arr)
  return Array.from(arr).map(b => ('0' + b.toString(16)).slice(-2)).join('')
}
