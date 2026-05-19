import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { cartApi } from '@/api/cart.api'
import {
  HeaderMegaMenu,
  type HeaderMegaMenuColumn,
  type HeaderMegaMenuImageItem,
} from '@/components/layout/HeaderMegaMenu'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/app/AuthContext'

const productMenuImages: HeaderMegaMenuImageItem[] = [
  {
    title: 'Cho nam',
    to: '/products?q=nam',
    image: '/ananas-assets/misc/Dropmenu_nam.jpg',
  },
  {
    title: 'Cho nữ',
    to: '/products?q=nu',
    image: '/ananas-assets/misc/Desktop_Dropdown_Women_1-2.jpg',
  },
  {
    title: 'Outlet sale',
    to: '/products?sort=price_asc',
    image: '/ananas-assets/misc/Dropmenu-Promotion.jpg',
  },
  {
    title: 'Thời trang & phụ kiện',
    to: '/products?category=ao',
    image: '/ananas-assets/misc/Dropmenu-ThoitrangPhukien.jpg',
  },
]

const menMenuColumns: HeaderMegaMenuColumn[] = [
  {
    title: 'Nổi bật',
    links: [
      { label: 'Best Seller', to: '/products?q=nam' },
      { label: 'Mới nhất', to: '/products?q=nam&sort=newest' },
      { label: 'Sale off', to: '/products?sort=price_asc' },
      { label: 'Bộ sưu tập', to: '/products?q=nam&sort=featured' },
    ],
  },
  {
    title: 'Giày',
    links: [
      { label: 'Basas', to: '/products?category=giay&q=basas' },
      { label: 'Vintas', to: '/products?category=giay&q=vintas' },
      { label: 'Urbas', to: '/products?category=giay&q=urbas' },
      { label: 'Tất cả giày nam', to: '/products?category=giay&q=nam' },
    ],
  },
  {
    title: 'Thời trang & phụ kiện',
    links: [
      { label: 'Nửa trên', to: '/products?category=ao&q=nam' },
      { label: 'Phụ kiện', to: '/products?category=phu-kien&q=nam' },
      { label: 'Vớ', to: '/products?category=vo&q=nam' },
      { label: 'Xem tất cả', to: '/products?q=nam' },
    ],
  },
]

const womenMenuColumns: HeaderMegaMenuColumn[] = [
  {
    title: 'Nổi bật',
    links: [
      { label: 'Best Seller', to: '/products?q=nu' },
      { label: 'Mới nhất', to: '/products?q=nu&sort=newest' },
      { label: 'Sale off', to: '/products?sort=price_asc' },
      { label: 'Bộ sưu tập', to: '/products?q=nu&sort=featured' },
    ],
  },
  {
    title: 'Giày',
    links: [
      { label: 'Basas', to: '/products?category=giay&q=nu' },
      { label: 'Vintas', to: '/products?category=giay&q=nu' },
      { label: 'Urbas', to: '/products?category=giay&q=nu' },
      { label: 'Tất cả giày nữ', to: '/products?category=giay&q=nu' },
    ],
  },
  {
    title: 'Thời trang & phụ kiện',
    links: [
      { label: 'Nửa trên', to: '/products?category=ao&q=nu' },
      { label: 'Phụ kiện', to: '/products?category=phu-kien&q=nu' },
      { label: 'Vớ', to: '/products?category=vo&q=nu' },
      { label: 'Xem tất cả', to: '/products?q=nu' },
    ],
  },
]

const utilityLinkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.04em] uppercase transition ${
    isActive ? 'text-[#f15a24]' : 'text-neutral-200 hover:text-white'
  }`

const simpleNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `ananas-main-nav-link ${isActive ? 'text-[#f15a24]' : 'text-neutral-900'}`

export function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAdmin, isAuthenticated, logout, user } = useAuth()
  const [searchKeyword, setSearchKeyword] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartItemCount, setCartItemCount] = useState(0)

  const cartLabel = useMemo(() => `Giỏ hàng (${cartItemCount})`, [cartItemCount])

  const refreshCartCount = useCallback(async () => {
    try {
      const cart = await cartApi.getCart()
      const nextCount = cart.items.reduce((total, item) => total + item.quantity, 0)
      setCartItemCount(nextCount)
    } catch {
      setCartItemCount(0)
    }
  }, [])

  useEffect(() => {
    void refreshCartCount()
  }, [refreshCartCount, location.pathname, isAuthenticated])

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const keyword = searchKeyword.trim()
    navigate(keyword ? `/products?q=${encodeURIComponent(keyword)}` : '/products')
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] text-neutral-900">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <div className="bg-[#222]">
          <div className="mx-auto flex h-10 w-full max-w-[1240px] items-center justify-end gap-4 px-4">
            <NavLink className={utilityLinkClass} to="/orders/lookup">
              <img src="/ananas-assets/misc/icon_tra_cuu_don_hang.svg" alt="" className="h-3.5 w-3.5" />
              Tra cứu đơn hàng
            </NavLink>
            <a
              className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.04em] text-neutral-200 uppercase transition hover:text-white"
              href="https://ananas.vn/stores"
              target="_blank"
              rel="noreferrer"
            >
              <img src="/ananas-assets/misc/icon_tim_cua_hang.svg" alt="" className="h-3.5 w-3.5" />
              Tìm cửa hàng
            </a>
            <NavLink className={utilityLinkClass} to={isAuthenticated ? '/wishlist' : '/login'}>
              <img src="/ananas-assets/misc/icon_heart_header.svg" alt="" className="h-3.5 w-3.5" />
              Yêu thích
            </NavLink>
            {isAuthenticated ? (
              <NavLink className={utilityLinkClass} to="/orders">
                <img src="/ananas-assets/misc/icon_dang_nhap.svg" alt="" className="h-3.5 w-3.5" />
                {user?.name || 'Tài khoản'}
              </NavLink>
            ) : (
              <NavLink className={utilityLinkClass} to="/login">
                <img src="/ananas-assets/misc/icon_dang_nhap.svg" alt="" className="h-3.5 w-3.5" />
                Đăng nhập
              </NavLink>
            )}
            <NavLink className={utilityLinkClass} to="/cart">
              <img src="/ananas-assets/misc/icon-cart-8.svg" alt="" className="h-3.5 w-3.5" />
              {cartLabel}
            </NavLink>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1240px] px-4">
          <div className="flex h-[76px] items-center justify-between gap-4">
            <Link to="/" className="flex shrink-0 items-center">
              <img src="/ananas-assets/misc/ananas_logo.svg" alt="Ananas Fashion" className="h-10 w-auto" />
            </Link>

            <nav className="hidden items-center gap-1 xl:flex">
              <HeaderMegaMenu label="Sản phẩm" to="/products" imageItems={productMenuImages} />
              <span className="h-5 w-px bg-neutral-200" />
              <HeaderMegaMenu label="Nam" to="/products?q=nam" columns={menMenuColumns} />
              <span className="h-5 w-px bg-neutral-200" />
              <HeaderMegaMenu label="Nữ" to="/products?q=nu" columns={womenMenuColumns} />
              <span className="h-5 w-px bg-neutral-200" />
              <NavLink to="/products?sort=price_asc" className={simpleNavLinkClass}>
                Sale off
              </NavLink>
              <span className="h-5 w-px bg-neutral-200" />
              <NavLink to="/" className={simpleNavLinkClass}>
                Khám phá
              </NavLink>
              {isAdmin ? (
                <>
                  <span className="h-5 w-px bg-neutral-200" />
                  <NavLink to="/admin/dashboard" className={simpleNavLinkClass}>
                    Quản trị
                  </NavLink>
                </>
              ) : null}
            </nav>

            <div className="hidden items-center gap-3 xl:flex">
              <form
                onSubmit={handleSearch}
                className="flex h-10 items-center border border-neutral-300 bg-white px-2 focus-within:border-neutral-700"
              >
                <img src="/ananas-assets/misc/icon_tim_kiem.svg" alt="" className="h-4 w-4 shrink-0" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  placeholder="Tìm kiếm"
                  className="w-48 border-0 px-2 text-sm outline-none"
                />
                <button type="submit" className="border-l border-neutral-300 px-3 text-xs font-semibold tracking-wide text-neutral-700 uppercase">
                  Tìm
                </button>
              </form>

              {isAuthenticated ? (
                <Button
                  variant="secondary"
                  className="h-10 border border-neutral-300 bg-white px-4 text-sm font-semibold text-neutral-900 hover:bg-neutral-100"
                  onClick={() => void logout()}
                >
                  Đăng xuất
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <NavLink to="/login" className="text-sm font-medium text-neutral-700 transition hover:text-[#f15a24]">
                    Đăng nhập
                  </NavLink>
                  <NavLink to="/register" className="text-sm font-medium text-neutral-700 transition hover:text-[#f15a24]">
                    Đăng ký
                  </NavLink>
                </div>
              )}
            </div>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded border border-neutral-300 text-neutral-900 xl:hidden"
              onClick={() => setMobileMenuOpen((previous) => !previous)}
              aria-label="Mở menu"
            >
              ☰
            </button>
          </div>

          {mobileMenuOpen ? (
            <div className="space-y-3 border-t border-neutral-200 py-3 xl:hidden">
              <nav className="flex snap-x gap-2 overflow-x-auto pb-1">
                <NavLink
                  to="/products"
                  className="snap-start rounded border border-neutral-300 px-3 py-2 text-xs font-semibold tracking-wide text-neutral-900 uppercase whitespace-nowrap"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sản phẩm
                </NavLink>
                <NavLink
                  to="/products?q=nam"
                  className="snap-start rounded border border-neutral-300 px-3 py-2 text-xs font-semibold tracking-wide text-neutral-900 uppercase whitespace-nowrap"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Nam
                </NavLink>
                <NavLink
                  to="/products?q=nu"
                  className="snap-start rounded border border-neutral-300 px-3 py-2 text-xs font-semibold tracking-wide text-neutral-900 uppercase whitespace-nowrap"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Nữ
                </NavLink>
                <NavLink
                  to="/products?sort=price_asc"
                  className="snap-start rounded border border-neutral-300 px-3 py-2 text-xs font-semibold tracking-wide text-neutral-900 uppercase whitespace-nowrap"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sale off
                </NavLink>
              </nav>

              <form onSubmit={handleSearch} className="flex items-center overflow-hidden border border-neutral-300 bg-white">
                <img src="/ananas-assets/misc/icon_tim_kiem.svg" alt="" className="ml-2 h-4 w-4 shrink-0" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  placeholder="Tìm kiếm sản phẩm"
                  className="w-full border-0 px-3 py-2 text-sm outline-none"
                />
                <button type="submit" className="border-l border-neutral-300 px-3 py-2 text-xs font-semibold tracking-wide text-neutral-700 uppercase">
                  Tìm
                </button>
              </form>

              <div className="flex flex-wrap gap-2">
                <NavLink to="/orders/lookup" className="rounded border border-neutral-300 px-3 py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>
                  Tra cứu đơn hàng
                </NavLink>
                <NavLink to="/cart" className="rounded border border-neutral-300 px-3 py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>
                  {cartLabel}
                </NavLink>
                {isAuthenticated ? (
                  <>
                    <NavLink to="/orders" className="rounded border border-neutral-300 px-3 py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>
                      Đơn hàng của tôi
                    </NavLink>
                    <NavLink to="/wishlist" className="rounded border border-neutral-300 px-3 py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>
                      Yêu thích
                    </NavLink>
                    <Button
                      variant="secondary"
                      className="border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        void logout()
                      }}
                    >
                      Đăng xuất
                    </Button>
                  </>
                ) : (
                  <>
                    <NavLink to="/login" className="rounded border border-neutral-300 px-3 py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>
                      Đăng nhập
                    </NavLink>
                    <NavLink to="/register" className="rounded border border-neutral-300 px-3 py-2 text-sm" onClick={() => setMobileMenuOpen(false)}>
                      Đăng ký
                    </NavLink>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div className="ananas-promo-strip">
          <div className="mx-auto flex w-full max-w-[1240px] flex-wrap items-center justify-between gap-2 px-4 py-2">
            <p className="text-xs font-semibold tracking-[0.1em] text-neutral-900 uppercase">
              Mọi người thường gọi chúng tôi là <span className="text-[#f15a24]">Dứa</span>!
            </p>
            <NavLink to="/products?sort=newest" className="text-xs font-semibold tracking-[0.1em] text-neutral-700 uppercase hover:text-[#f15a24]">
              Khám phá bộ sưu tập mới
            </NavLink>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1240px] px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
