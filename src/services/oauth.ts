// services/oauth.ts
import { randomString, sha256 } from "@/utils/pkce"

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI as string
const SCOPE =
  (import.meta.env.VITE_GOOGLE_SCOPES as string) || "openid email profile"
const OAUTH_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
const OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token"

// Token 介面定義
interface OAuthTokens {
  access_token: string
  id_token?: string
  refresh_token?: string
  expires_in: number
  token_type: string
  scope: string
  expAt: number
}

export async function startLoginRedirect() {
  if (!CLIENT_ID || !REDIRECT_URI) {
    throw new Error("OAuth 設定缺失，請檢查環境變數")
  }

  const state = crypto.randomUUID()

  // 使用 PKCE 流程（安全的前端做法）
  const codeVerifier = randomString(43)
  const codeChallenge = await sha256(codeVerifier)

  // 儲存狀態和驗證碼
  sessionStorage.setItem("oauth_state", state)
  sessionStorage.setItem("pkce_verifier", codeVerifier)

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    scope: SCOPE,
    state,
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "select_account",
    // PKCE 參數
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  })

  const authUrl = `${OAUTH_AUTH_URL}?${params.toString()}`
  console.log("跳轉到:", authUrl)
  window.location.href = authUrl

  console.log("Generated auth URL:", authUrl)
  console.log("Code verifier length:", codeVerifier.length)
  console.log("Code challenge length:", codeChallenge.length)
}

export async function handleOAuthCallback(
  query: URLSearchParams
): Promise<OAuthTokens> {
  console.log("開始處理 OAuth 回呼...")

  const code = query.get("code")
  const state = query.get("state")
  const error = query.get("error")

  if (error) {
    throw new Error(`OAuth 錯誤: ${error}`)
  }

  if (!code || !state) {
    throw new Error("缺少必要的回呼參數")
  }

  const savedState = sessionStorage.getItem("oauth_state")
  if (state !== savedState) {
    throw new Error("狀態參數不相符")
  }

  // 使用 PKCE 驗證碼
  const codeVerifier = sessionStorage.getItem("pkce_verifier")
  if (!codeVerifier) {
    throw new Error("PKCE 驗證碼遺失")
  }

  const tokenRequestData = new URLSearchParams({
    code,
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
    code_verifier: codeVerifier, // 使用 PKCE 而不是 client_secret
  })

  try {
    const response = await fetch(OAUTH_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: tokenRequestData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Token 交換失敗:", errorText)

      try {
        const errorData = JSON.parse(errorText)
        throw new Error(
          `認證失敗: ${errorData.error_description || errorData.error}`
        )
      } catch {
        throw new Error(`認證失敗 (${response.status})`)
      }
    }

    const tokens = await response.json()
    console.log("Token 交換成功")

    // 計算過期時間並儲存 tokens
    const expiresAt = Date.now() + tokens.expires_in * 1000
    const storedTokenData: OAuthTokens = {
      ...tokens,
      expAt: expiresAt,
    }

    setTokensWithMixedStorage(storedTokenData)

    // 清理暫存儲存
    sessionStorage.removeItem("oauth_state")
    sessionStorage.removeItem("pkce_verifier")

    return storedTokenData
  } catch (fetchError) {
    console.error("網路請求錯誤:", fetchError)
    throw new Error(
      `網路請求失敗: ${
        fetchError instanceof Error ? fetchError.message : "未知錯誤"
      }`
    )
  }
}

export function getAccessToken(): string | null {
  const raw = sessionStorage.getItem("oauth_tokens") 
  if (!raw) return null

  try {
    const tokens: OAuthTokens = JSON.parse(raw)

    // 檢查是否過期
    if (Date.now() >= tokens.expAt) {
      console.log("Access token 已過期")
      sessionStorage.removeItem("oauth_tokens")
      return null
    }

    return tokens.access_token
  } catch (error) {
    console.error("解析 tokens 錯誤:", error)
    sessionStorage.removeItem("oauth_tokens") 
    return null
  }
}

export function getIdToken(): string | null {
  const raw = sessionStorage.getItem("oauth_tokens")
  if (!raw) return null

  try {
    const tokens: OAuthTokens = JSON.parse(raw)

    // 檢查是否過期
    if (Date.now() >= tokens.expAt) {
      console.log("ID token 已過期")
      sessionStorage.removeItem("oauth_tokens")
      return null
    }

    return tokens.id_token || null
  } catch (error) {
    console.error("解析 tokens 錯誤:", error)
    sessionStorage.removeItem("oauth_tokens")
    return null
  }
}

export function getStoredTokens(): OAuthTokens | null {
  const raw = sessionStorage.getItem("oauth_tokens")
  if (!raw) return null

  try {
    const tokens: OAuthTokens = JSON.parse(raw)

    // 檢查是否過期
    if (Date.now() >= tokens.expAt) {
      sessionStorage.removeItem("oauth_tokens")
      return null
    }

    return tokens
  } catch (error) {
    console.error("解析 tokens 錯誤:", error)
    sessionStorage.removeItem("oauth_tokens")
    return null
  }
}

export function isLoggedIn(): boolean {
  return getAccessToken() !== null
}

export function logout() {
 // 清理 sessionStorage
  sessionStorage.removeItem("oauth_tokens")
  sessionStorage.removeItem("oauth_state")
  sessionStorage.removeItem("pkce_verifier")
  
  // 清理 localStorage
  localStorage.removeItem("oauth_persistent")
  localStorage.removeItem("user_profile")
  console.log("已登出")
}

// 刷新 token 功能
export async function refreshAccessToken(): Promise<OAuthTokens | null> {
  // 先嘗試從當前 session 獲取
  let tokens = getStoredTokens()
  
  
  // 如果 session 中沒有，嘗試從 localStorage 的 refresh_token 自動登入
  if (!tokens?.refresh_token) {
    const refreshToken = getRefreshTokenFromPersistent()
    if (!refreshToken) {
      console.log("沒有 refresh token 可用")
      return null
    }
    
    // 使用持久化的 refresh_token
    tokens = { refresh_token: refreshToken } as OAuthTokens
  }

  

  try {
    const response = await fetch(OAUTH_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: "refresh_token",
        refresh_token: tokens.refresh_token!,
      }),
    })

    if (!response.ok) {
      console.error("Refresh token 失敗")
      logout() // 清除無效的 tokens
      return null
    }

    const newTokens = await response.json()
    const expiresAt = Date.now() + newTokens.expires_in * 1000

    const updatedTokens: OAuthTokens = {
      ...newTokens,
      refresh_token: newTokens.refresh_token || tokens.refresh_token, // 保留舊的如果沒有新的
      expAt: expiresAt,
    }

    setTokensWithMixedStorage(updatedTokens)
    console.log("Access token 已刷新")

    return updatedTokens
  } catch (error) {
    console.error("刷新 token 錯誤:", error)
    logout()
    return null
  }
}

// 新增：自動恢復登入狀態功能
export async function tryAutoLogin(): Promise<boolean> {
  console.log('嘗試自動登入...')
  
  // 檢查是否已經有有效的 session token
  const currentTokens = getStoredTokens()
  if (currentTokens?.access_token) {
    console.log('已有有效的 session token')
    return true
  }
  
  // 嘗試使用 refresh_token 自動登入
  const refreshedTokens = await refreshAccessToken()
  if (refreshedTokens) {
    console.log('自動登入成功')
    return true
  }
  
  console.log('無法自動登入，需要重新認證')
  return false
}

// 混合存儲策略函數
export function setTokensWithMixedStorage(tokens: OAuthTokens) {
  // 敏感的 access_token 和 id_token 放 sessionStorage
  const sensitiveTokens = {
    access_token: tokens.access_token,
    id_token: tokens.id_token,
    token_type: tokens.token_type,
    expAt: tokens.expAt,
    expires_in: tokens.expires_in
  }
  sessionStorage.setItem('oauth_tokens', JSON.stringify(sensitiveTokens))
  
  // 非敏感的 refresh_token 和 scope 放 localStorage（用於記住登入狀態）
  if (tokens.refresh_token) {
    const persistentData = {
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      client_id: CLIENT_ID
    }
    localStorage.setItem('oauth_persistent', JSON.stringify(persistentData))
  }
}

export function getRefreshTokenFromPersistent(): string | null {
  const raw = localStorage.getItem('oauth_persistent')
  if (!raw) return null
  
  try {
    const data = JSON.parse(raw)
    return data.refresh_token || null
  } catch {
    localStorage.removeItem('oauth_persistent')
    return null
  }
}