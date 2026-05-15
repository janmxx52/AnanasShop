export type UserRole = 'customer' | 'admin'

export type AuthUser = {
  id: number
  name: string
  email: string
  phone: string | null
  avatar: string | null
  role: UserRole
  is_banned?: boolean
}

export type AuthSession = {
  token: string
  expires_at: string | null
  user: AuthUser
}

export type LoginPayload = {
  email: string
  password: string
  device_name?: string
}

export type RegisterPayload = {
  name: string
  email: string
  phone?: string
  password: string
  password_confirmation: string
  device_name?: string
}
