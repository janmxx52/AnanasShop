import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LoginPage } from '@/pages/LoginPage'
import { renderWithProviders } from '../helpers/renderWithProviders'

const loginMock = vi.fn()

vi.mock('@/app/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    isAdmin: false,
    login: loginMock,
    register: vi.fn(),
    logout: vi.fn(),
  }),
}))

describe('LoginPage', () => {
  it('render form email/password', () => {
    renderWithProviders(<LoginPage />, { route: '/login' })

    expect(screen.getByRole('heading', { name: 'Đăng nhập' })).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Mật khẩu')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Đăng nhập' })).toBeInTheDocument()
  })
})
