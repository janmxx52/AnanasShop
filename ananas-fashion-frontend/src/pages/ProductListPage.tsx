import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { productApi, type ProductQuery } from '@/api/product.api'
import { ProductCard } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { parseApiError } from '@/lib/api-helpers'
import type { PaginationMeta } from '@/types/pagination'
import type { ProductLite } from '@/types/product'

type ProductFilterState = {
  search: string
  category: string
  brand: string
  min_price: string
  max_price: string
  sort: string
}

const DEFAULT_FILTERS: ProductFilterState = {
  search: '',
  category: '',
  brand: '',
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

function buildQuery(filters: ProductFilterState, page: number): ProductQuery {
  return {
    q: filters.search || undefined,
    category: filters.category || undefined,
    brand: filters.brand || undefined,
    min_price: filters.min_price ? Number(filters.min_price) : undefined,
    max_price: filters.max_price ? Number(filters.max_price) : undefined,
    sort: filters.sort || undefined,
    page,
    per_page: 12,
  }
}

export function ProductListPage() {
  const [products, setProducts] = useState<ProductLite[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META)
  const [filters, setFilters] = useState<ProductFilterState>(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<ProductFilterState>(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const query = useMemo(() => buildQuery(appliedFilters, page), [appliedFilters, page])

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
    setPage(1)
    setAppliedFilters(filters)
  }

  const hasPagination = meta.last_page > 1

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Danh sách sản phẩm</h1>
        <p className="text-sm text-slate-600">Tìm kiếm và duyệt các sản phẩm đang hoạt động từ API backend.</p>
      </header>

      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-3" onSubmit={handleFilterSubmit}>
        <Input
          label="Tìm kiếm"
          placeholder="Tên sản phẩm..."
          value={filters.search}
          onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
        />
        <Input
          label="Danh mục (slug)"
          placeholder="Ví dụ: sneaker"
          value={filters.category}
          onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
        />
        <Input
          label="Thương hiệu (slug)"
          placeholder="Ví dụ: ananas"
          value={filters.brand}
          onChange={(event) => setFilters((prev) => ({ ...prev, brand: event.target.value }))}
        />
        <Input
          label="Giá thấp nhất"
          type="number"
          min={0}
          value={filters.min_price}
          onChange={(event) => setFilters((prev) => ({ ...prev, min_price: event.target.value }))}
        />
        <Input
          label="Giá cao nhất"
          type="number"
          min={0}
          value={filters.max_price}
          onChange={(event) => setFilters((prev) => ({ ...prev, max_price: event.target.value }))}
        />
        <label className="space-y-1">
          <span className="block text-sm font-medium text-slate-700">Sắp xếp</span>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            value={filters.sort}
            onChange={(event) => setFilters((prev) => ({ ...prev, sort: event.target.value }))}
          >
            <option value="featured">Nổi bật</option>
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá: thấp đến cao</option>
            <option value="price_desc">Giá: cao đến thấp</option>
          </select>
        </label>

        <div className="flex items-end gap-2 md:col-span-3">
          <Button type="submit">Áp dụng bộ lọc</Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setFilters(DEFAULT_FILTERS)
              setAppliedFilters(DEFAULT_FILTERS)
              setPage(1)
            }}
          >
            Đặt lại
          </Button>
        </div>
      </form>

      {isLoading ? <LoadingState message="Đang tải sản phẩm..." /> : null}
      {!isLoading && errorMessage ? <ErrorState message={errorMessage} /> : null}
      {!isLoading && !errorMessage && products.length === 0 ? (
        <EmptyState title="Không tìm thấy sản phẩm" description="Hãy thử thay đổi từ khóa hoặc bộ lọc." />
      ) : null}

      {!isLoading && !errorMessage && products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {hasPagination ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-4">
              <p className="text-sm text-slate-600">
                Trang {meta.current_page} / {meta.last_page} • Tổng {meta.total}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={meta.current_page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                >
                  Trước
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={meta.current_page >= meta.last_page}
                  onClick={() => setPage((prev) => Math.min(meta.last_page, prev + 1))}
                >
                  Sau
                </Button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
