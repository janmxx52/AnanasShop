const ACCESS_TOKEN_KEY = 'ananas_access_token'
const GUEST_TOKEN_KEY = 'ananas_guest_token'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export function getGuestToken() {
  return localStorage.getItem(GUEST_TOKEN_KEY)
}

export function setGuestToken(token: string) {
  localStorage.setItem(GUEST_TOKEN_KEY, token)
}

export function ensureGuestToken() {
  const existingGuestToken = getGuestToken()

  if (existingGuestToken) {
    return existingGuestToken
  }

  const generatedGuestToken =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `guest_${Date.now()}_${Math.random().toString(16).slice(2)}`

  setGuestToken(generatedGuestToken)

  return generatedGuestToken
}
