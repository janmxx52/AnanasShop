import type { UserRole } from '@/types/auth'

const ACCESS_TOKEN_KEY = 'ananas_access_token'
const CUSTOMER_TOKEN_KEY = 'ananas_customer_token'
const ADMIN_TOKEN_KEY = 'ananas_admin_token'
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

function getRoleTokenKey(role: UserRole) {
  return role === 'admin' ? ADMIN_TOKEN_KEY : CUSTOMER_TOKEN_KEY
}

export function getRoleToken(role: UserRole) {
  return localStorage.getItem(getRoleTokenKey(role))
}

export function setRoleToken(role: UserRole, token: string) {
  localStorage.setItem(getRoleTokenKey(role), token)
}

export function clearRoleToken(role: UserRole) {
  localStorage.removeItem(getRoleTokenKey(role))
}

export function setAuthTokenByRole(role: UserRole, token: string) {
  setRoleToken(role, token)
  setAccessToken(token)
}

export function clearAllAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(CUSTOMER_TOKEN_KEY)
  localStorage.removeItem(ADMIN_TOKEN_KEY)
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
