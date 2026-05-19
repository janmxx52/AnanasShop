import axios, { AxiosHeaders } from 'axios'
import { ensureGuestToken, getAccessToken, setGuestToken } from '@/lib/storage'

const guestTokenPaths = ['/cart', '/checkout/guest', '/vouchers/check']

const shouldAttachGuestToken = (url: string) => {
  return guestTokenPaths.some((path) => url.startsWith(path))
}

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api',
  headers: {
    Accept: 'application/json',
  },
})

http.interceptors.request.use((config) => {
  const headers =
    config.headers instanceof AxiosHeaders ? config.headers : new AxiosHeaders(config.headers ?? {})
  const accessToken = getAccessToken()

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  if (shouldAttachGuestToken(config.url ?? '')) {
    headers.set('X-Guest-Token', ensureGuestToken())
  }

  config.headers = headers

  return config
})

http.interceptors.response.use((response) => {
  const guestToken = response.headers['x-guest-token']

  if (typeof guestToken === 'string' && guestToken.trim().length > 0) {
    setGuestToken(guestToken)
  }

  return response
})
