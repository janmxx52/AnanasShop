import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '@/api/auth.api'
import { cartApi } from '@/api/cart.api'
import {
  clearAccessToken,
  clearRoleToken,
  getGuestToken,
  getAccessToken,
  setAuthTokenByRole,
} from '@/lib/storage'
import type { AuthSession, AuthUser, LoginPayload, RegisterPayload } from '@/types/auth'

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  login: (payload: LoginPayload) => Promise<AuthUser>
  register: (payload: RegisterPayload) => Promise<AuthUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function applySession(session: AuthSession) {
  setAuthTokenByRole(session.user.role, session.token)
}

function clearCurrentSession(user: AuthUser | null) {
  clearAccessToken()
  if (user) {
    clearRoleToken(user.role)
  }
}

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(getAccessToken())
  const [isLoading, setIsLoading] = useState(true)

  const mergeGuestCartAfterAuth = useCallback(async () => {
    if (!getGuestToken()) {
      return
    }

    try {
      await cartApi.mergeGuestCart()
    } catch {
      // ignore merge failure and keep login/register success flow
    }
  }, [])

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = getAccessToken()

      if (!storedToken) {
        setToken(null)
        setUser(null)
        setIsLoading(false)
        return
      }

      try {
        const profile = await authApi.me()
        await mergeGuestCartAfterAuth()
        setUser(profile)
        setToken(storedToken)
      } catch {
        clearCurrentSession(null)
        setUser(null)
        setToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    void bootstrap()
  }, [mergeGuestCartAfterAuth])

  const login = useCallback(async (payload: LoginPayload) => {
    const session = await authApi.login(payload)
    applySession(session)
    await mergeGuestCartAfterAuth()
    setUser(session.user)
    setToken(session.token)
    return session.user
  }, [mergeGuestCartAfterAuth])

  const register = useCallback(async (payload: RegisterPayload) => {
    const session = await authApi.register(payload)
    applySession(session)
    await mergeGuestCartAfterAuth()
    setUser(session.user)
    setToken(session.token)
    return session.user
  }, [mergeGuestCartAfterAuth])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // ignore API logout failure and clear local session anyway
    } finally {
      clearCurrentSession(user)
      setUser(null)
      setToken(null)
    }
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider')
  }

  return context
}
