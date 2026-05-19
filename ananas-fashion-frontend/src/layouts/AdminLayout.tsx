import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/AuthContext'

const navItems = [
  { to: '/admin/dashboard', label: 'Tổng quan' },
  { to: '/admin/categories', label: 'Danh mục' },
  { to: '/admin/brands', label: 'Thương hiệu' },
  { to: '/admin/products', label: 'Sản phẩm' },
  { to: '/admin/vouchers', label: 'Mã giảm giá' },
  { to: '/admin/orders', label: 'Đơn hàng' },
  { to: '/admin/users', label: 'Người dùng' },
]

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/admin/categories')) return 'Quản lý danh mục'
  if (pathname.startsWith('/admin/brands')) return 'Quản lý thương hiệu'
  if (pathname.startsWith('/admin/products')) return 'Quản lý sản phẩm'
  if (pathname.startsWith('/admin/vouchers')) return 'Quản lý mã giảm giá'
  if (pathname.startsWith('/admin/orders')) return 'Quản lý đơn hàng'
  if (pathname.startsWith('/admin/users')) return 'Quản lý người dùng'
  return 'Bảng điều khiển quản trị'
}

function getPageDescription(pathname: string): string {
  if (pathname.startsWith('/admin/dashboard')) return 'Theo dõi chỉ số vận hành và hiệu suất kinh doanh.'
  if (pathname.startsWith('/admin/products')) return 'Quản lý sản phẩm, biến thể, hình ảnh và trạng thái hiển thị.'
  if (pathname.startsWith('/admin/orders')) return 'Cập nhật trạng thái đơn hàng và kiểm soát quy trình xử lý.'
  if (pathname.startsWith('/admin/users')) return 'Quản lý tài khoản người dùng, phân quyền và trạng thái khóa.'
  return 'Khu vực dành cho quản trị viên hệ thống.'
}

const desktopNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex w-full items-center rounded px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
  }`

const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `shrink-0 rounded px-3 py-2 text-xs font-semibold uppercase tracking-[0.06em] whitespace-nowrap transition ${
    isActive ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
  }`

export function AdminLayout() {
  const location = useLocation()
  const { user } = useAuth()
  const pageTitle = getPageTitle(location.pathname)
  const pageDescription = getPageDescription(location.pathname)

  return (
    <div className="min-h-screen bg-neutral-100">
      <div className="mx-auto flex w-full max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-neutral-200 bg-white lg:flex lg:flex-col">
          <div className="space-y-1 border-b border-neutral-200 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Ananas Fashion</p>
            <h1 className="text-lg font-bold text-neutral-900">Trang quản trị</h1>
          </div>

          <nav className="space-y-1 p-3">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={desktopNavLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="border-b border-neutral-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-neutral-900 md:text-xl">{pageTitle}</h2>
                <p className="text-sm text-neutral-600">{pageDescription}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="/"
                  className="inline-flex h-9 items-center justify-center border border-neutral-300 px-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900"
                >
                  Về website
                </a>
                <span className="inline-flex h-9 items-center rounded bg-neutral-900 px-3 text-sm font-medium text-white">
                  {user?.name ?? 'Quản trị viên'}
                </span>
              </div>
            </div>

            <nav className="flex items-center gap-2 overflow-x-auto border-t border-neutral-100 px-4 py-2 lg:hidden">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} className={mobileNavLinkClass}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </header>

          <main className="px-4 py-4 md:px-6 md:py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
