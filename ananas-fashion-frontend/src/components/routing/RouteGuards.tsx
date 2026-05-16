import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/AuthContext'
import { LoadingState } from '@/components/ui/LoadingState'

type GuardProps = {
  children?: ReactNode
}

export function ProtectedRoute({ children }: GuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingState message="Đang kiểm tra phiên đăng nhập..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export function AdminRoute({ children }: GuardProps) {
  const { isAdmin, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingState message="Đang kiểm tra quyền truy cập..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return children ? <>{children}</> : <Outlet />
}

export function GuestRoute({ children }: GuardProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingState message="Đang kiểm tra phiên đăng nhập..." />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
