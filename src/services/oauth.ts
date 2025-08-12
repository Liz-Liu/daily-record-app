import { randomString, sha256 } from "@/utils/pkce"

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
const REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI as string
const SCOPE = (import.meta.env.VITE_GOOGLE_SCOPE as string) || 'openid'

const OAUTH_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token'

export async function startLoginRedirect() {
  const state = crypto.randomUUID()
  const codeVerifier = randomString(64)
  const codeChallenge = await sha256(codeVerifier)

  sessionStorage.setItem('oauth_state', state)
  sessionStorage.setItem('pkce_verifier', codeVerifier)

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'offline',            // 需要 refresh_token 時
    include_granted_scopes: 'true',
    prompt: 'consent',                 // 首次同意或想要 refresh_token 請保留
  })

  window.location.href = `${OAUTH_AUTH_URL}?${params.toString()}`
}

export async function handleOAuthCallback(query: URLSearchParams) {
  const code = query.get('code')
  const state = query.get('state')
  const saved = sessionStorage.getItem('oauth_state')

  if (!code || !state || state !== saved) throw new Error('Invalid state or code')

  const codeVerifier = sessionStorage.getItem('pkce_verifier')!
  const body = new URLSearchParams({
    code,
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier,
  })

  const res = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error('Token exchange failed')
  const tokens = await res.json() as {
    access_token: string
    expires_in: number
    refresh_token?: string
    id_token?: string
    token_type: 'Bearer'
  }

  const expAt = Date.now() + tokens.expires_in * 1000 - 30_000 // 30s 緩衝
  localStorage.setItem('oauth_tokens', JSON.stringify({ ...tokens, expAt }))

  sessionStorage.removeItem('oauth_state')
  sessionStorage.removeItem('pkce_verifier')

  return tokens
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
}
