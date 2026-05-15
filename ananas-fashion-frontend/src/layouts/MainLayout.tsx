import { NavLink, Outlet } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-2 text-sm font-medium ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`

export function MainLayout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <NavLink to="/" className="text-lg font-semibold text-slate-900">
            Ananas Fashion
          </NavLink>
          <nav className="flex items-center gap-2">
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
            <NavLink to="/auth/login" className={navLinkClass}>
              Login
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
