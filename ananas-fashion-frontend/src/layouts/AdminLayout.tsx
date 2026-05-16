import { NavLink, Outlet } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded px-3 py-2 text-sm font-medium ${isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'}`

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-lg font-semibold text-slate-900">Khu vực quản trị</h1>
          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/admin/dashboard" className={navLinkClass}>
              Tổng quan
            </NavLink>
            <NavLink to="/admin/categories" className={navLinkClass}>
              Danh mục
            </NavLink>
            <NavLink to="/admin/brands" className={navLinkClass}>
              Thương hiệu
            </NavLink>
            <NavLink to="/admin/products" className={navLinkClass}>
              Sản phẩm
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
