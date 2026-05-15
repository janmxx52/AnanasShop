import { http } from '@/lib/http'
import { extractResponseData } from '@/lib/api-helpers'
import type { AuthSession, AuthUser, LoginPayload, RegisterPayload } from '@/types/auth'

export type ChangePasswordPayload = {
  current_password: string
  password: string
  password_confirmation: string
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthSession> {
    const response = await http.post('/auth/register', payload)
    return extractResponseData<AuthSession>(response.data)
  },

  async login(payload: LoginPayload): Promise<AuthSession> {
    const response = await http.post('/auth/login', payload)
    return extractResponseData<AuthSession>(response.data)
  },

  async logout() {
    await http.post('/auth/logout')
  },

  async logoutAll() {
    await http.post('/auth/logout-all')
  },

  async me(): Promise<AuthUser> {
    const response = await http.get('/auth/me')
    return extractResponseData<AuthUser>(response.data)
  },

  async updateProfile(payload: FormData | Record<string, unknown>): Promise<AuthUser> {
    const response = await http.put('/auth/me', payload)
    return extractResponseData<AuthUser>(response.data)
  },

  async changePassword(payload: ChangePasswordPayload) {
    await http.put('/auth/me/password', payload)
  },
}
