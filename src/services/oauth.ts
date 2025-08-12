import { randomString, sha256 } from "@/utils/pkce"

// 使用正确的变量名
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI as string
const SCOPE = (import.meta.env.VITE_GOOGLE_SCOPES as string) || 'openid email profile'

const OAUTH_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token'

export async function startLoginRedirect() {
  if (!CLIENT_ID || !REDIRECT_URI) {
    throw new Error('OAuth 配置缺失，請檢查環境變數')
  }

  const state = crypto.randomUUID()
  const codeVerifier = randomString(128) 
  const codeChallenge = await sha256(codeVerifier)

  // 保存到 sessionStorage
  sessionStorage.setItem('oauth_state', state)
  sessionStorage.setItem('pkce_verifier', codeVerifier)

  console.log('PKCE Info:', {
    codeVerifier: codeVerifier.substring(0, 10) + '...',
    codeChallenge: codeChallenge.substring(0, 10) + '...',
    state: state
  })

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'offline',
    include_granted_scopes: 'true',
    prompt: 'select_account', // 改为 select_account
  })

  const authUrl = `${OAUTH_AUTH_URL}?${params.toString()}`
  console.log('跳轉到:', authUrl)
  window.location.href = authUrl
}

export async function handleOAuthCallback(query: URLSearchParams) {
  console.log('開始處理 OAuth callback...')
  
  const code = query.get('code')
  const state = query.get('state')
  const error = query.get('error')
  
  console.log('callback 參數:', { 
    hasCode: !!code, 
    hasState: !!state, 
    error 
  })
  
  if (error) {
    throw new Error(`OAuth 錯誤: ${error}`)
  }
  
  if (!code) {
    throw new Error('未收到授權碼')
  }
  
  if (!state) {
    throw new Error('未收到狀態參數')
  }

  const savedState = sessionStorage.getItem('oauth_state')
  const codeVerifier = sessionStorage.getItem('pkce_verifier')
  
  console.log('狀態驗證:', { 
    receivedState: state, 
    savedState, 
    hasCodeVerifier: !!codeVerifier 
  })

  if (state !== savedState) {
    throw new Error('狀態參數不匹配，可能有安全風險')
  }
  
  if (!codeVerifier) {
    throw new Error('PKCE 驗證碼遺失')
  }

  // 准备 Token 交换请求
  const tokenData = {
    code,
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier,
  }
  
  console.log('Token 交換請求數據:', {
    ...tokenData,
    code_verifier: codeVerifier.substring(0, 10) + '...'
  })

  try {
    const response = await fetch(OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams(tokenData),
    })

    console.log('Token 交换回應狀態:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Token 交換失敗:', errorText)
      
      // 尝试解析错误信息
      try {
        const errorData = JSON.parse(errorText)
        throw new Error(`Token 交換失敗: ${errorData.error_description || errorData.error}`)
      } catch {
        throw new Error(`Token 交換失敗 (${response.status}): ${errorText}`)
      }
    }

    const tokens = await response.json()
    console.log('Token 交换成功:', {
      hasAccessToken: !!tokens.access_token,
      hasIdToken: !!tokens.id_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expires_in
    })

    // 清理 session storage
    sessionStorage.removeItem('oauth_state')
    sessionStorage.removeItem('pkce_verifier')

    return tokens as {
      access_token: string
      expires_in: number
      refresh_token?: string
      id_token?: string
      token_type: 'Bearer'
    }

  } catch (fetchError) {
    console.error('網路請求錯誤:', fetchError)
    throw new Error(`網路請求失敗: ${fetchError instanceof Error ? fetchError.message : '未知错误'}`)
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