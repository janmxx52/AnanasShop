import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/app/AuthContext'
import { Button } from '@/components/ui/Button'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-2 text-sm font-medium ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`

export function MainLayout() {
  const { isAdmin, isAuthenticated, logout, user } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <NavLink to="/" className="text-lg font-semibold text-slate-900">
            Ananas Fashion
          </NavLink>
          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/products" className={navLinkClass}>
              Products
            </NavLink>
            <NavLink to="/cart" className={navLinkClass}>
              Cart
            </NavLink>
            <NavLink to="/checkout" className={navLinkClass}>
              Checkout
            </NavLink>
            <NavLink to="/orders/lookup" className={navLinkClass}>
              Order Lookup
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/orders" className={navLinkClass}>
                  My Orders
                </NavLink>
                <NavLink to="/wishlist" className={navLinkClass}>
                  Wishlist
                </NavLink>
              </>
            ) : null}
            {isAdmin ? (
              <NavLink to="/admin/dashboard" className={navLinkClass}>
                Admin
              </NavLink>
            ) : null}
            {!isAuthenticated ? (
              <>
                <NavLink to="/login" className={navLinkClass}>
                  Login
                </NavLink>
                <NavLink to="/register" className={navLinkClass}>
                  Register
                </NavLink>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">{user?.name}</span>
                <Button onClick={() => void logout()} variant="secondary">
                  Logout
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
