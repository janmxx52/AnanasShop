import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { AdminRoute, ProtectedRoute } from '@/components/routing/RouteGuards'

const mockAuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  isAdmin: false,
  login: async () => ({ id: 1, name: '', email: '', role: 'customer' as const }),
  register: async () => ({ id: 1, name: '', email: '', role: 'customer' as const }),
  logout: async () => undefined,
}

vi.mock('@/app/AuthContext', () => ({
  useAuth: () => mockAuthState,
}))

describe('RouteGuards', () => {
  it('guest vào protected route thì redirect về login', () => {
    mockAuthState.isLoading = false
    mockAuthState.isAuthenticated = false
    mockAuthState.isAdmin = false

    render(
      <MemoryRouter initialEntries={['/orders']}>
        <Routes>
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <div>Trang bảo vệ</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Trang đăng nhập</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Trang đăng nhập')).toBeInTheDocument()
  })

  it('customer vào admin route bị chặn', () => {
    mockAuthState.isLoading = false
    mockAuthState.isAuthenticated = true
    mockAuthState.isAdmin = false

    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <Routes>
          <Route path="/" element={<div>Trang chủ</div>} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <div>Trang admin</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Trang chủ')).toBeInTheDocument()
  })
})
