import { Navigate, createBrowserRouter } from 'react-router-dom'
import { AdminRoute, GuestRoute } from '@/components/routing/RouteGuards'
import { AdminLayout } from '@/layouts/AdminLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { MainLayout } from '@/layouts/MainLayout'
import { AdminDashboardPage } from '@/pages/AdminDashboardPage'
import { CartPage } from '@/pages/CartPage'
import { CheckoutPage } from '@/pages/CheckoutPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { OrderSuccessPage } from '@/pages/OrderSuccessPage'
import { OrderLookupPage } from '@/pages/OrderLookupPage'
import { ProductDetailPage } from '@/pages/ProductDetailPage'
import { ProductListPage } from '@/pages/ProductListPage'
import { RegisterPage } from '@/pages/RegisterPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'products', element: <ProductListPage /> },
      { path: 'products/:slug', element: <ProductDetailPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'checkout/success', element: <OrderSuccessPage /> },
      { path: 'orders/lookup', element: <OrderLookupPage /> },
    ],
  },
  {
    path: '/login',
    element: (
      <GuestRoute>
        <AuthLayout />
      </GuestRoute>
    ),
    children: [
      { index: true, element: <LoginPage /> },
    ],
  },
  {
    path: '/register',
    element: (
      <GuestRoute>
        <AuthLayout />
      </GuestRoute>
    ),
    children: [
      { index: true, element: <RegisterPage /> },
    ],
  },
  {
    path: '/auth',
    children: [
      { path: 'login', element: <Navigate to="/login" replace /> },
      { path: 'register', element: <Navigate to="/register" replace /> },
    ],
  },
  {
    path: '/orders/success',
    element: <Navigate to="/checkout/success" replace />,
  },
  {
    path: '/admin',
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [{ path: 'dashboard', element: <AdminDashboardPage /> }],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
