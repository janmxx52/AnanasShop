import axios, { AxiosHeaders } from 'axios'
import { ensureGuestToken, getAccessToken, setGuestToken } from '@/lib/storage'

const apiBaseUrl = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://127.0.0.1:8000/api'
    : 'https://ananasshop.onrender.com/api')

const guestTokenPaths = ['/cart', '/checkout/guest', '/vouchers/check']

const shouldAttachGuestToken = (url: string) => {
  return guestTokenPaths.some((path) => url.startsWith(path))
}

export const http = axios.create({
  baseURL: apiBaseUrl,
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
