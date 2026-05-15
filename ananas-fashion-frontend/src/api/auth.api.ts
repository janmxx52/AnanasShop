import { http } from '@/lib/http'
import type { ApiSuccessEnvelope } from '@/types/api'

export type RegisterPayload = {
  name: string
  email: string
  password: string
  password_confirmation: string
  phone?: string
  device_name?: string
}

export type LoginPayload = {
  email: string
  password: string
  device_name?: string
}

export type ChangePasswordPayload = {
  current_password: string
  password: string
  password_confirmation: string
}

export const authApi = {
  register(payload: RegisterPayload) {
    return http.post<ApiSuccessEnvelope<unknown>>('/auth/register', payload)
  },

  login(payload: LoginPayload) {
    return http.post<ApiSuccessEnvelope<{ token: string }>>('/auth/login', payload)
  },

  logout() {
    return http.post<ApiSuccessEnvelope<null>>('/auth/logout')
  },

  logoutAll() {
    return http.post<ApiSuccessEnvelope<null>>('/auth/logout-all')
  },

  me() {
    return http.get<ApiSuccessEnvelope<unknown>>('/auth/me')
  },

  updateProfile(payload: FormData | Record<string, unknown>) {
    return http.put<ApiSuccessEnvelope<unknown>>('/auth/me', payload)
  },

  changePassword(payload: ChangePasswordPayload) {
    return http.put<ApiSuccessEnvelope<null>>('/auth/me/password', payload)
  },
}
