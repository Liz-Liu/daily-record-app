/**
 * 產生隨機字串用於 PKCE
 */
export function randomString(length: number = 128): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => charset[byte % charset.length]).join('')
}

/**
 * 使用 SHA256 生成 code_challenge
 */
export async function sha256(data: string): Promise<string> {
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  
  try {
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    
    // 轉換為 base64
    const base64String = btoa(String.fromCharCode(...hashArray))
    
    // 轉換為 base64url (RFC 4648 § 5)
    return base64String
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  } catch (error) {
    console.error('SHA256 計算失敗:', error)
    throw new Error('生成 code_challenge 失敗')
  }
}

/**
 * 驗證 PKCE 參數的有效性
 */
export function validatePKCE(codeVerifier: string, codeChallenge: string): boolean {
  // code_verifier 應該是 43-128 個字符
  if (codeVerifier.length < 43 || codeVerifier.length > 128) {
    console.error('code_verifier 长度不正确:', codeVerifier.length)
    return false
  }
  
  // code_challenge 應該是 43 個字符
  if (codeChallenge.length !== 43) {
    console.error('code_challenge 长度不正确:', codeChallenge.length)
    return false
  }
  
  // 驗證字元集
  const verifierRegex = /^[A-Za-z0-9\-._~]+$/
  if (!verifierRegex.test(codeVerifier)) {
    console.error('code_verifier 包含無效字符')
    return false
  }
  
  const challengeRegex = /^[A-Za-z0-9\-_]+$/
  if (!challengeRegex.test(codeChallenge)) {
    console.error('code_challenge 包含無效字符')
    return false
  }
  
  return true
}