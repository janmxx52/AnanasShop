import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productApi, type ProductQuery } from '@/api/product.api'
import { ProductCard } from '@/components/product/ProductCard'
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { parseApiError } from '@/lib/api-helpers'
import type { PaginationMeta } from '@/types/pagination'
import type { ProductLite } from '@/types/product'

type ProductFilterState = {
  q: string
  category: string
  brand: string
  size: string
  color: string
  min_price: string
  max_price: string
  sort: string
}

type FilterChipKey = 'category' | 'brand' | 'size' | 'color' | 'price'

type FilterChip = {
  key: FilterChipKey
  label: string
}

type ProductFilterPanelProps = {
  filters: ProductFilterState
  onChange: (next: Partial<ProductFilterState>) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onReset: () => void
  onClose?: () => void
}

const CATEGORY_OPTIONS = [
  { value: '', label: 'Tất cả danh mục' },
  { value: 'giay', label: 'Giày' },
  { value: 'ao', label: 'Áo' },
  { value: 'phu-kien', label: 'Phụ kiện' },
  { value: 'vo', label: 'Vớ' },
]

const SIZE_OPTIONS = ['', 'XS', 'S', 'M', 'L', 'XL', 'XXL']

const COLOR_OPTIONS = [
  { value: '', label: 'Tất cả màu', hex: null },
  { value: 'black', label: 'Đen', hex: '#111111' },
  { value: 'white', label: 'Trắng', hex: '#ffffff' },
  { value: 'red', label: 'Đỏ', hex: '#d11f2d' },
  { value: 'blue', label: 'Xanh dương', hex: '#1d4ed8' },
  { value: 'green', label: 'Xanh lá', hex: '#3f8f4e' },
  { value: 'yellow', label: 'Vàng', hex: '#f5ca2f' },
  { value: 'gray', label: 'Xám', hex: '#7a7a7a' },
]

const SORT_OPTIONS = [
  { value: 'featured', label: 'Nổi bật' },
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá: thấp đến cao' },
  { value: 'price_desc', label: 'Giá: cao đến thấp' },
]

const DEFAULT_FILTERS: ProductFilterState = {
  q: '',
  category: '',
  brand: '',
  size: '',
  color: '',
  min_price: '',
  max_price: '',
  sort: 'featured',
}

const EMPTY_META: PaginationMeta = {
  current_page: 1,
  per_page: 12,
  total: 0,
  last_page: 1,
}

function getCategoryLabel(value: string) {
  return CATEGORY_OPTIONS.find((option) => option.value === value)?.label ?? value
}

function getColorLabel(value: string) {
  return COLOR_OPTIONS.find((option) => option.value === value)?.label ?? value
}

function createPaginationItems(currentPage: number, lastPage: number): Array<number | string> {
  if (lastPage <= 5) {
    return Array.from({ length: lastPage }, (_, index) => index + 1)
  }

  const items: Array<number | string> = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(lastPage - 1, currentPage + 1)

  if (start > 2) {
    items.push('left-ellipsis')
  }

  for (let page = start; page <= end; page += 1) {
    items.push(page)
  }

  if (end < lastPage - 1) {
    items.push('right-ellipsis')
  }

  items.push(lastPage)
  return items
}

function readFiltersFromSearchParams(searchParams: URLSearchParams): ProductFilterState {
  return {
    q: searchParams.get('q') ?? '',
    category: searchParams.get('category') ?? '',
    brand: searchParams.get('brand') ?? '',
    size: searchParams.get('size') ?? '',
    color: searchParams.get('color') ?? '',
    min_price: searchParams.get('min_price') ?? '',
    max_price: searchParams.get('max_price') ?? '',
    sort: searchParams.get('sort') ?? 'featured',
  }
}

function readPageFromSearchParams(searchParams: URLSearchParams): number {
  const rawPage = Number(searchParams.get('page') ?? '1')
  return Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1
}

function buildQuery(filters: ProductFilterState, page: number): ProductQuery {
  return {
    q: filters.q || undefined,
    category: filters.category || undefined,
    brand: filters.brand || undefined,
    size: filters.size || undefined,
    color: filters.color || undefined,
    min_price: filters.min_price ? Number(filters.min_price) : undefined,
    max_price: filters.max_price ? Number(filters.max_price) : undefined,
    sort: filters.sort || undefined,
    page,
    per_page: 12,
  }
}

function buildSearchParams(filters: ProductFilterState, page = 1): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.q) params.set('q', filters.q)
  if (filters.category) params.set('category', filters.category)
  if (filters.brand) params.set('brand', filters.brand)
  if (filters.size) params.set('size', filters.size)
  if (filters.color) params.set('color', filters.color)
  if (filters.min_price) params.set('min_price', filters.min_price)
  if (filters.max_price) params.set('max_price', filters.max_price)
  if (filters.sort && filters.sort !== 'featured') params.set('sort', filters.sort)
  if (page > 1) params.set('page', String(page))

  return params
}

function ProductFilterPanel({ filters, onChange, onSubmit, onReset, onClose }: ProductFilterPanelProps) {
  const selectedColor = COLOR_OPTIONS.find((option) => option.value === filters.color)

  return (
    <form className="ananas-filter-panel" onSubmit={onSubmit}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-black tracking-[0.14em] text-neutral-900 uppercase">Bộ lọc</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold tracking-[0.08em] text-neutral-500 uppercase transition hover:text-[#f15a24]"
          >
            Xóa lọc
          </button>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center border border-neutral-300 text-lg text-neutral-700"
              aria-label="Đóng bộ lọc"
            >
              ×
            </button>
          ) : null}
        </div>
      </div>

      <Input
        label="Tìm kiếm"
        placeholder="Tên sản phẩm..."
        value={filters.q}
        onChange={(event) => onChange({ q: event.target.value })}
      />

      <section className="ananas-filter-section">
        <h3 className="ananas-filter-section-title">Danh mục</h3>
        <div className="grid gap-1.5">
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={option.value || 'all-category'}
              type="button"
              className={`ananas-filter-option ${filters.category === option.value ? 'is-active' : ''}`}
              onClick={() => onChange({ category: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="ananas-filter-section">
        <h3 className="ananas-filter-section-title">Thương hiệu</h3>
        <Input
          placeholder="Ví dụ: ananas"
          value={filters.brand}
          onChange={(event) => onChange({ brand: event.target.value })}
        />
      </section>

      <section className="ananas-filter-section">
        <h3 className="ananas-filter-section-title">Kích cỡ</h3>
        <div className="grid grid-cols-4 gap-2">
          {SIZE_OPTIONS.map((size) => {
            const isActive = filters.size === size

            return (
              <button
                key={size || 'all-size'}
                type="button"
                className={`ananas-filter-option justify-center ${isActive ? 'is-active' : ''}`}
                onClick={() => onChange({ size: filters.size === size ? '' : size })}
              >
                {size || 'Tất cả'}
              </button>
            )
          })}
        </div>
      </section>

      <section className="ananas-filter-section">
        <h3 className="ananas-filter-section-title">Màu sắc</h3>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.filter((option) => option.value).map((color) => {
            const isActive = filters.color === color.value
            const colorLabel = color.label.toLowerCase()

            return (
              <button
                key={color.value}
                type="button"
                className={`ananas-color-swatch ${isActive ? 'is-active' : ''}`}
                onClick={() => onChange({ color: filters.color === color.value ? '' : color.value })}
                aria-label={`Chọn màu ${colorLabel}`}
                title={color.label}
              >
                <span className="ananas-color-swatch-dot" style={{ backgroundColor: color.hex ?? '#ffffff' }} />
              </button>
            )
          })}
        </div>
        <p className="text-xs text-neutral-500">
          {selectedColor && selectedColor.value ? `Đang chọn: ${selectedColor.label}` : 'Chưa chọn màu'}
        </p>
      </section>

      <section className="ananas-filter-section">
        <h3 className="ananas-filter-section-title">Khoảng giá</h3>
        <div className="grid grid-cols-2 gap-2">
          <Input
            label="Từ"
            type="number"
            min={0}
            value={filters.min_price}
            onChange={(event) => onChange({ min_price: event.target.value })}
          />
          <Input
            label="Đến"
            type="number"
            min={0}
            value={filters.max_price}
            onChange={(event) => onChange({ max_price: event.target.value })}
          />
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 pt-2">
        <Button type="submit" className="bg-[#f15a24] hover:bg-[#d94f1e]">
          Áp dụng
        </Button>
        <Button type="button" variant="secondary" onClick={onReset}>
          Đặt lại
        </Button>
      </div>
    </form>
  )
}

export function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<ProductLite[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const appliedFilters = useMemo(() => readFiltersFromSearchParams(searchParams), [searchParams])
  const currentPage = useMemo(() => readPageFromSearchParams(searchParams), [searchParams])
  const [filters, setFilters] = useState<ProductFilterState>(appliedFilters)

  useEffect(() => {
    setFilters(appliedFilters)
  }, [appliedFilters])

  const query = useMemo(() => buildQuery(appliedFilters, currentPage), [appliedFilters, currentPage])

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const response = await productApi.list(query)
        setProducts(response.data)
        setMeta(response.meta)
      } catch (error) {
        const apiError = parseApiError(error)
        setErrorMessage(apiError.message)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchProducts()
  }, [query])

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSearchParams(buildSearchParams(filters, 1))
    setIsFilterOpen(false)
  }

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS)
    setSearchParams(new URLSearchParams())
    setIsFilterOpen(false)
  }

  const handleFilterChange = (next: Partial<ProductFilterState>) => {
    setFilters((previous) => ({ ...previous, ...next }))
  }

  const changePage = (page: number) => {
    const nextPage = Math.min(Math.max(page, 1), meta.last_page)
    setSearchParams(buildSearchParams(appliedFilters, nextPage))
  }

  const removeFilterChip = (chipKey: FilterChipKey) => {
    const nextFilters = { ...appliedFilters }

    switch (chipKey) {
      case 'category':
        nextFilters.category = ''
        break
      case 'brand':
        nextFilters.brand = ''
        break
      case 'size':
        nextFilters.size = ''
        break
      case 'color':
        nextFilters.color = ''
        break
      case 'price':
        nextFilters.min_price = ''
        nextFilters.max_price = ''
        break
      default:
        break
    }

    setSearchParams(buildSearchParams(nextFilters, 1))
  }

  const hasPagination = meta.last_page > 1
  const paginationItems = useMemo(
    () => createPaginationItems(meta.current_page, meta.last_page),
    [meta.current_page, meta.last_page],
  )

  const activeFilterChips = useMemo<FilterChip[]>(() => {
    const chips: FilterChip[] = []

    if (appliedFilters.category) {
      chips.push({ key: 'category', label: `Danh mục: ${getCategoryLabel(appliedFilters.category)}` })
    }

    if (appliedFilters.brand) {
      chips.push({ key: 'brand', label: `Thương hiệu: ${appliedFilters.brand}` })
    }

    if (appliedFilters.size) {
      chips.push({ key: 'size', label: `Size: ${appliedFilters.size}` })
    }

    if (appliedFilters.color) {
      chips.push({ key: 'color', label: `Màu: ${getColorLabel(appliedFilters.color)}` })
    }

    if (appliedFilters.min_price || appliedFilters.max_price) {
      const min = appliedFilters.min_price || '0'
      const max = appliedFilters.max_price || '∞'
      chips.push({ key: 'price', label: `Giá: ${min} - ${max}` })
    }

    return chips
  }, [appliedFilters])

  const breadcrumbItems = useMemo<BreadcrumbItem[]>(
    () => [
      { label: 'Trang chủ', to: '/' },
      { label: 'Sản phẩm' },
    ],
    [],
  )

  return (
    <section className="space-y-6">
      <div className="space-y-2 border-b border-neutral-200 pb-4">
        <Breadcrumb items={breadcrumbItems} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-neutral-900">Danh sách sản phẩm</h1>
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="inline-flex items-center border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-900 lg:hidden"
          >
            Bộ lọc
          </button>
        </div>
      </div>

      {isFilterOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            onClick={() => setIsFilterOpen(false)}
            aria-label="Đóng bộ lọc"
          />
          <aside className="absolute right-0 top-0 h-full w-[min(360px,92vw)] overflow-y-auto bg-white p-4 shadow-xl">
            <ProductFilterPanel
              filters={filters}
              onChange={handleFilterChange}
              onSubmit={handleFilterSubmit}
              onReset={handleReset}
              onClose={() => setIsFilterOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <ProductFilterPanel
            filters={filters}
            onChange={handleFilterChange}
            onSubmit={handleFilterSubmit}
            onReset={handleReset}
          />
        </aside>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 border border-neutral-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-neutral-600">
              Hiển thị <span className="font-semibold text-neutral-900">{products.length}</span> /{' '}
              <span className="font-semibold text-neutral-900">{meta.total}</span> sản phẩm
            </p>

            <label className="flex items-center gap-2 text-sm text-neutral-600">
              <span className="font-medium text-neutral-700">Sắp xếp</span>
              <select
                className="min-w-[180px] border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-900 outline-none transition focus:border-[#f15a24]"
                value={filters.sort}
                onChange={(event) => {
                  const sort = event.target.value

                  setFilters((previous) => ({ ...previous, sort }))
                  setSearchParams(buildSearchParams({ ...appliedFilters, sort }, 1))
                }}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {activeFilterChips.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 border border-neutral-200 bg-white px-4 py-3">
              {activeFilterChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  className="ananas-filter-chip"
                  onClick={() => removeFilterChip(chip.key)}
                >
                  {chip.label}
                  <span aria-hidden="true">×</span>
                </button>
              ))}

              <button
                type="button"
                className="text-xs font-semibold tracking-[0.06em] text-neutral-500 uppercase transition hover:text-[#f15a24]"
                onClick={handleReset}
              >
                Xóa tất cả
              </button>
            </div>
          ) : null}

          {isLoading ? <LoadingState message="Đang tải sản phẩm..." /> : null}
          {!isLoading && errorMessage ? <ErrorState message={errorMessage} /> : null}
          {!isLoading && !errorMessage && products.length === 0 ? (
            <EmptyState title="Không tìm thấy sản phẩm" description="Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm." />
          ) : null}

          {!isLoading && !errorMessage && products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {hasPagination ? (
                <div className="flex flex-wrap items-center justify-between gap-3 border border-neutral-200 bg-white p-4">
                  <p className="text-sm text-neutral-600">
                    Trang {meta.current_page} / {meta.last_page} • Tổng {meta.total}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      className="ananas-pagination-button"
                      disabled={meta.current_page <= 1}
                      onClick={() => changePage(meta.current_page - 1)}
                    >
                      Trước
                    </button>

                    {paginationItems.map((item) =>
                      typeof item === 'number' ? (
                        <button
                          key={item}
                          type="button"
                          className={`ananas-pagination-button ${item === meta.current_page ? 'is-active' : ''}`}
                          onClick={() => changePage(item)}
                        >
                          {item}
                        </button>
                      ) : (
                        <span key={item} className="px-1.5 text-sm text-neutral-500">
                          ...
                        </span>
                      ),
                    )}

                    <button
                      type="button"
                      className="ananas-pagination-button"
                      disabled={meta.current_page >= meta.last_page}
                      onClick={() => changePage(meta.current_page + 1)}
                    >
                      Sau
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </section>
  )
}
