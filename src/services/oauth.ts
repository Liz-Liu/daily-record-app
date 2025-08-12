import { randomString, sha256 } from "@/utils/pkce"

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
const CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET as string // 新增
const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI as string
const SCOPE = (import.meta.env.VITE_GOOGLE_SCOPES as string) || 'openid email profile'
const OAUTH_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token'

export async function startLoginRedirect() {
  if (!CLIENT_ID || !REDIRECT_URI) {
    throw new Error('OAuth 設定缺失，請檢查環境變數')
  }
  
  const state = crypto.randomUUID()
  
  // 儲存狀態
  sessionStorage.setItem('oauth_state', state)
  
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE,
    state,
    access_type: 'offline',
    include_granted_scopes: 'true',
    prompt: 'select_account',
  })

  // 如果有 client_secret，不使用 PKCE
  if (!CLIENT_SECRET) {
    // 使用 PKCE 流程
    const codeVerifier = randomString(128)
    const codeChallenge = await sha256(codeVerifier)
    
    sessionStorage.setItem('pkce_verifier', codeVerifier)
    
    params.append('code_challenge', codeChallenge)
    params.append('code_challenge_method', 'S256')
  }

  const authUrl = `${OAUTH_AUTH_URL}?${params.toString()}`
  console.log('跳轉到:', authUrl)
  window.location.href = authUrl
}

export async function handleOAuthCallback(query: URLSearchParams) {
  console.log('開始處理 OAuth 回呼...')
  
  const code = query.get('code')
  const state = query.get('state')
  const error = query.get('error')
  
  if (error) {
    throw new Error(`OAuth 錯誤: ${error}`)
  }
  
  if (!code || !state) {
    throw new Error('缺少必要的回呼參數')
  }

  const savedState = sessionStorage.getItem('oauth_state')
  if (state !== savedState) {
    throw new Error('狀態參數不相符')
  }

  // 準備 Token 交換請求
  const tokenData: Record<string, string> = {
    code,
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
  }

  // 根據是否有 client_secret 選擇認證方式
  if (CLIENT_SECRET) {
    // 使用 client_secret 認證
    tokenData.client_secret = CLIENT_SECRET
    console.log('使用 client_secret 認證')
  } else {
    // 使用 PKCE 認證
    const codeVerifier = sessionStorage.getItem('pkce_verifier')
    if (!codeVerifier) {
      throw new Error('PKCE 驗證碼遺失')
    }
    tokenData.code_verifier = codeVerifier
    console.log('使用 PKCE 認證')
  }

  try {
    const response = await fetch(OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams(tokenData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Token 交換失敗:', errorText)
      
      try {
        const errorData = JSON.parse(errorText)
        throw new Error(`認證失敗: ${errorData.error_description || errorData.error}`)
      } catch {
        throw new Error(`認證失敗 (${response.status})`)
      }
    }

    const tokens = await response.json()
    console.log('Token 交換成功')

    // 清理儲存
    sessionStorage.removeItem('oauth_state')
    sessionStorage.removeItem('pkce_verifier')

    return tokens
  } catch (fetchError) {
    console.error('網路請求錯誤:', fetchError)
    throw new Error(`網路請求失敗: ${fetchError instanceof Error ? fetchError.message : '未知錯誤'}`)
  }
}

export function getAccessToken(): string | null {
  const raw = localStorage.getItem('oauth_tokens')
  if (!raw) return null
  
  const t = JSON.parse(raw)
  if (Date.now() >= t.expAt) return null
  
  return t.access_token as string
}

export function logout() {
  localStorage.removeItem('oauth_tokens')
  sessionStorage.removeItem('oauth_state')
  sessionStorage.removeItem('pkce_verifier')
}