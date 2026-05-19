import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '@/api/admin.api'
import { useToast } from '@/app/ToastContext'
import { AdminCard } from '@/components/admin/AdminCard'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { AdminToolbar } from '@/components/admin/AdminToolbar'
import { ConfirmActionButton } from '@/components/admin/ConfirmActionButton'
import { FormSection } from '@/components/admin/FormSection'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PriceText } from '@/components/ui/PriceText'
import { formatFieldError, parseApiError } from '@/lib/api-helpers'
import { resolveProductCardImages } from '@/lib/product-images'
import type {
  AdminBrand,
  AdminCategory,
  AdminProduct,
  AdminProductListParams,
  AdminProductPayload,
} from '@/types/admin'
import type { PaginationMeta } from '@/types/pagination'
import type { ProductLite } from '@/types/product'

type ProductFilterState = {
  q: string
  category: string
  brand: string
  status: 'all' | 'active' | 'inactive'
  with_trashed: boolean
}

type ProductFormState = {
  name: string
  slug: string
  category_id: string
  brand_id: string
  description: string
  base_price: string
  sale_price: string
  is_active: boolean
}

const DEFAULT_FILTERS: ProductFilterState = {
  q: '',
  category: 'all',
  brand: 'all',
  status: 'all',
  with_trashed: false,
}

const DEFAULT_FORM: ProductFormState = {
  name: '',
  slug: '',
  category_id: '',
  brand_id: '',
  description: '',
  base_price: '',
  sale_price: '',
  is_active: true,
}

const EMPTY_META: PaginationMeta = {
  current_page: 1,
  per_page: 20,
  total: 0,
  last_page: 1,
}

function mapProductToForm(product: AdminProduct): ProductFormState {
  return {
    name: product.name ?? '',
    slug: product.slug ?? '',
    category_id: product.category?.id ? String(product.category.id) : '',
    brand_id: product.brand?.id ? String(product.brand.id) : '',
    description: product.description ?? '',
    base_price: String(product.base_price ?? ''),
    sale_price: product.sale_price !== null && product.sale_price !== undefined ? String(product.sale_price) : '',
    is_active: Boolean(product.is_active),
  }
}

function resolveProductThumbnail(product: AdminProduct): string {
  const maybeImage = (product as { image_url?: string | null; primary_image?: string | null })
  const directImage = maybeImage.image_url || maybeImage.primary_image
  if (directImage) {
    return directImage
  }

  const liteProduct: ProductLite = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    base_price: product.base_price,
    sale_price: product.sale_price,
    is_active: product.is_active,
    rating_avg: null,
    review_count: 0,
    variants: [],
    category: product.category?.name
      ? {
          id: product.category.id ?? 0,
          name: product.category.name,
          slug: '',
        }
      : undefined,
    brand: product.brand?.name
      ? {
          id: product.brand.id ?? 0,
          name: product.brand.name,
          slug: '',
        }
      : undefined,
    images: [],
  }

  return resolveProductCardImages(liteProduct).mainImage
}

export function AdminProductsPage() {
  const toast = useToast()
  const navigate = useNavigate()

  const [products, setProducts] = useState<AdminProduct[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<ProductFilterState>(DEFAULT_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<ProductFilterState>(DEFAULT_FILTERS)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [productsError, setProductsError] = useState<string | null>(null)

  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [brands, setBrands] = useState<AdminBrand[]>([])
  const [isLoadingRefs, setIsLoadingRefs] = useState(true)
  const [refsError, setRefsError] = useState<string | null>(null)

  const [formState, setFormState] = useState<ProductFormState>(DEFAULT_FORM)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null)

  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [restoringId, setRestoringId] = useState<number | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const listParams = useMemo<AdminProductListParams>(() => {
    const params: AdminProductListParams = {
      page,
      per_page: 20,
    }

    const trimmedQuery = appliedFilters.q.trim()
    if (trimmedQuery) params.q = trimmedQuery
    if (appliedFilters.category !== 'all') params.category = Number(appliedFilters.category)
    if (appliedFilters.brand !== 'all') params.brand = Number(appliedFilters.brand)
    if (appliedFilters.status === 'active') {
      params.is_active = true
    } else if (appliedFilters.status === 'inactive') {
      params.is_active = false
    }
    if (appliedFilters.with_trashed) params.with_trashed = true

    return params
  }, [appliedFilters, page])

  const loadProducts = useCallback(async () => {
    setIsLoadingProducts(true)
    setProductsError(null)

    try {
      const response = await adminApi.listProducts(listParams)
      setProducts(response.data)
      setMeta(response.meta)
    } catch (error) {
      const apiError = parseApiError(error)
      setProductsError(apiError.message)
    } finally {
      setIsLoadingProducts(false)
    }
  }, [listParams])

  const loadReferences = useCallback(async () => {
    setIsLoadingRefs(true)
    setRefsError(null)

    try {
      const [categoryResult, brandResult] = await Promise.all([
        adminApi.listCategories({ page: 1, per_page: 200 }),
        adminApi.listBrands({ page: 1, per_page: 200 }),
      ])
      setCategories(categoryResult.data.filter((item) => item.is_active))
      setBrands(brandResult.data.filter((item) => item.is_active))
    } catch (error) {
      const apiError = parseApiError(error)
      setRefsError(apiError.message)
    } finally {
      setIsLoadingRefs(false)
    }
  }, [])

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  useEffect(() => {
    void loadReferences()
  }, [loadReferences])

  const resetForm = () => {
    setFormState(DEFAULT_FORM)
    setEditingId(null)
    setFieldErrors(null)
  }

  const startEdit = async (id: number) => {
    setFieldErrors(null)

    try {
      const product = await adminApi.getProduct(id)
      if (product.deleted_at) {
        toast.info('Sản phẩm đã bị xóa mềm. Vui lòng khôi phục trước khi chỉnh sửa.')
        return
      }

      setEditingId(product.id)
      setFormState(mapProductToForm(product))
      toast.info(`Đang chỉnh sửa sản phẩm #${product.id}`)
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
    }
  }

  const buildPayload = (): AdminProductPayload => {
    const payload: AdminProductPayload = {
      name: formState.name.trim(),
      category_id: Number(formState.category_id),
      brand_id: Number(formState.brand_id),
      base_price: Number(formState.base_price),
      is_active: formState.is_active,
      description: formState.description.trim() || null,
      sale_price: formState.sale_price.trim() ? Number(formState.sale_price) : null,
    }

    if (formState.slug.trim()) payload.slug = formState.slug.trim()
    return payload
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFieldErrors(null)

    try {
      const payload = buildPayload()

      if (editingId) {
        await adminApi.updateProduct(editingId, payload)
        toast.success('Cập nhật sản phẩm thành công.')
      } else {
        await adminApi.createProduct(payload)
        toast.success('Tạo sản phẩm thành công.')
      }

      resetForm()
      await loadProducts()
    } catch (error) {
      const apiError = parseApiError(error)
      setFieldErrors(apiError.errors)
      toast.error(apiError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)

    try {
      await adminApi.deleteProduct(id)
      toast.success('Xóa sản phẩm thành công.')
      if (products.length === 1 && page > 1) {
        setPage((prev) => Math.max(1, prev - 1))
      } else {
        await loadProducts()
      }
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleRestore = async (id: number) => {
    setRestoringId(id)

    try {
      await adminApi.restoreProduct(id)
      toast.success('Khôi phục sản phẩm thành công.')
      await loadProducts()
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
    } finally {
      setRestoringId(null)
    }
  }

  const handleToggleStatus = async (product: AdminProduct) => {
    const nextStatus = !product.is_active
    setTogglingId(product.id)

    try {
      await adminApi.updateProductStatus(product.id, nextStatus)
      toast.success(nextStatus ? 'Đã bật hiển thị sản phẩm.' : 'Đã ẩn sản phẩm.')
      await loadProducts()
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
    } finally {
      setTogglingId(null)
    }
  }

  const handleApplyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPage(1)
    setAppliedFilters(filters)
  }

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setAppliedFilters(DEFAULT_FILTERS)
    setPage(1)
  }

  if (isLoadingRefs || isLoadingProducts) {
    return <LoadingState message="Đang tải dữ liệu sản phẩm..." />
  }

  if (refsError) {
    return <ErrorState message={refsError} />
  }

  if (productsError) {
    return <ErrorState message={productsError} />
  }

  return (
    <section className="space-y-5">
      <AdminPageHeader
        title="Quản lý sản phẩm"
        description="Thêm, chỉnh sửa, xóa mềm, khôi phục và cập nhật trạng thái sản phẩm."
      />

      <AdminCard title={editingId ? `Cập nhật sản phẩm #${editingId}` : 'Tạo sản phẩm mới'}>
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <FormSection title="Thông tin cơ bản" description="Tên, slug, danh mục và thương hiệu">
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="Tên sản phẩm"
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                error={formatFieldError(fieldErrors, 'name')}
                required
              />
              <Input
                label="Slug (tùy chọn)"
                value={formState.slug}
                onChange={(event) => setFormState((prev) => ({ ...prev, slug: event.target.value }))}
                error={formatFieldError(fieldErrors, 'slug')}
              />

              <label className="block space-y-1">
                <span className="block text-sm font-medium text-neutral-700">Danh mục</span>
                <select
                  className="w-full border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#f15a24] focus:ring-2 focus:ring-orange-100"
                  value={formState.category_id}
                  onChange={(event) => setFormState((prev) => ({ ...prev, category_id: event.target.value }))}
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {formatFieldError(fieldErrors, 'category_id') ? (
                  <span className="text-xs text-red-600">{formatFieldError(fieldErrors, 'category_id')}</span>
                ) : null}
              </label>

              <label className="block space-y-1">
                <span className="block text-sm font-medium text-neutral-700">Thương hiệu</span>
                <select
                  className="w-full border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#f15a24] focus:ring-2 focus:ring-orange-100"
                  value={formState.brand_id}
                  onChange={(event) => setFormState((prev) => ({ ...prev, brand_id: event.target.value }))}
                  required
                >
                  <option value="">Chọn thương hiệu</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
                {formatFieldError(fieldErrors, 'brand_id') ? (
                  <span className="text-xs text-red-600">{formatFieldError(fieldErrors, 'brand_id')}</span>
                ) : null}
              </label>
            </div>
          </FormSection>

          <FormSection title="Giá bán" description="Thiết lập giá gốc và giá khuyến mãi">
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="Giá gốc"
                type="number"
                min={0}
                value={formState.base_price}
                onChange={(event) => setFormState((prev) => ({ ...prev, base_price: event.target.value }))}
                error={formatFieldError(fieldErrors, 'base_price')}
                required
              />

              <Input
                label="Giá khuyến mãi (tùy chọn)"
                type="number"
                min={0}
                value={formState.sale_price}
                onChange={(event) => setFormState((prev) => ({ ...prev, sale_price: event.target.value }))}
                error={formatFieldError(fieldErrors, 'sale_price')}
              />
            </div>
          </FormSection>

          <FormSection title="Mô tả và trạng thái">
            <label className="block space-y-1">
              <span className="block text-sm font-medium text-neutral-700">Mô tả (tùy chọn)</span>
              <textarea
                className="min-h-24 w-full border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#f15a24] focus:ring-2 focus:ring-orange-100"
                value={formState.description}
                onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
              />
              {formatFieldError(fieldErrors, 'description') ? (
                <span className="text-xs text-red-600">{formatFieldError(fieldErrors, 'description')}</span>
              ) : null}
            </label>

            <label className="mt-2 flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={formState.is_active}
                onChange={(event) => setFormState((prev) => ({ ...prev, is_active: event.target.checked }))}
              />
              Kích hoạt sản phẩm
            </label>
          </FormSection>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" isLoading={isSubmitting}>
              {editingId ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
            </Button>
            {editingId ? (
              <Button type="button" variant="secondary" disabled={isSubmitting} onClick={resetForm}>
                Hủy chỉnh sửa
              </Button>
            ) : null}
          </div>
        </form>
      </AdminCard>

      <AdminCard title="Bộ lọc sản phẩm" description="Tìm nhanh theo từ khóa, danh mục, thương hiệu và trạng thái">
        <form className="space-y-3" onSubmit={handleApplyFilters}>
          <AdminToolbar className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-5">
            <Input
              label="Tìm kiếm"
              placeholder="Tên hoặc mô tả..."
              value={filters.q}
              onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
            />

            <label className="block space-y-1">
              <span className="block text-sm font-medium text-neutral-700">Danh mục</span>
              <select
                className="w-full border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#f15a24] focus:ring-2 focus:ring-orange-100"
                value={filters.category}
                onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="block text-sm font-medium text-neutral-700">Thương hiệu</span>
              <select
                className="w-full border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#f15a24] focus:ring-2 focus:ring-orange-100"
                value={filters.brand}
                onChange={(event) => setFilters((prev) => ({ ...prev, brand: event.target.value }))}
              >
                <option value="all">Tất cả thương hiệu</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1">
              <span className="block text-sm font-medium text-neutral-700">Trạng thái kích hoạt</span>
              <select
                className="w-full border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#f15a24] focus:ring-2 focus:ring-orange-100"
                value={filters.status}
                onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value as ProductFilterState['status'] }))}
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang bật</option>
                <option value="inactive">Đang tắt</option>
              </select>
            </label>

            <div className="flex items-end gap-2">
              <Button type="submit" className="w-full">
                Áp dụng
              </Button>
              <Button type="button" variant="secondary" onClick={handleResetFilters}>
                Đặt lại
              </Button>
            </div>
          </AdminToolbar>

          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={filters.with_trashed}
              onChange={(event) => setFilters((prev) => ({ ...prev, with_trashed: event.target.checked }))}
            />
            Hiển thị cả sản phẩm đã xóa mềm
          </label>
        </form>
      </AdminCard>

      <AdminCard title="Danh sách sản phẩm">
        {products.length === 0 ? (
          <EmptyState title="Không có sản phẩm phù hợp" description="Hãy thử thay đổi bộ lọc hoặc tạo sản phẩm mới." />
        ) : (
          <AdminTable minWidthClassName="min-w-[1320px]">
            <thead className="bg-neutral-50 text-left text-neutral-600">
              <tr>
                <th className="px-3 py-2">Sản phẩm</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Danh mục</th>
                <th className="px-3 py-2">Thương hiệu</th>
                <th className="px-3 py-2">Giá gốc</th>
                <th className="px-3 py-2">Giá sale</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Xóa mềm</th>
                <th className="px-3 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const isDeleted = Boolean(product.deleted_at)
                const thumbnail = resolveProductThumbnail(product)

                return (
                  <tr key={product.id} className="border-t border-neutral-100">
                    <td className="px-3 py-2">
                      <div className="flex min-w-[260px] items-center gap-3">
                        <div className="h-14 w-14 overflow-hidden border border-neutral-200 bg-neutral-100">
                          <img src={thumbnail} alt={product.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium text-neutral-900">{product.name}</p>
                          <p className="text-xs text-neutral-500">ID #{product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-neutral-700">{product.slug}</td>
                    <td className="px-3 py-2 text-neutral-700">{product.category?.name || '-'}</td>
                    <td className="px-3 py-2 text-neutral-700">{product.brand?.name || '-'}</td>
                    <td className="px-3 py-2 text-neutral-900">
                      <PriceText value={product.base_price} />
                    </td>
                    <td className="px-3 py-2 text-neutral-900">
                      <PriceText value={product.sale_price} />
                    </td>
                    <td className="px-3 py-2">
                      <AdminStatusPill
                        label={product.is_active ? 'Đang bật' : 'Đang tắt'}
                        tone={product.is_active ? 'success' : 'neutral'}
                      />
                    </td>
                    <td className="px-3 py-2">
                      {isDeleted ? <AdminStatusPill label="Đã xóa mềm" tone="warning" /> : <span className="text-neutral-500">—</span>}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={isSubmitting || deletingId === product.id}
                          onClick={() => navigate(`/admin/products/${product.id}/manage`)}
                        >
                          Quản lý biến thể/ảnh
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={isSubmitting || deletingId === product.id || isDeleted}
                          onClick={() => void startEdit(product.id)}
                        >
                          Sửa
                        </Button>

                        {isDeleted ? (
                          <ConfirmActionButton
                            type="button"
                            variant="secondary"
                            confirmMessage="Bạn có chắc chắn muốn khôi phục sản phẩm này?"
                            isLoading={restoringId === product.id}
                            onConfirm={() => handleRestore(product.id)}
                          >
                            Khôi phục
                          </ConfirmActionButton>
                        ) : (
                          <Button
                            type="button"
                            variant="secondary"
                            isLoading={togglingId === product.id}
                            onClick={() => void handleToggleStatus(product)}
                          >
                            {product.is_active ? 'Tắt hiển thị' : 'Bật hiển thị'}
                          </Button>
                        )}

                        {!isDeleted ? (
                          <ConfirmActionButton
                            type="button"
                            variant="danger"
                            confirmMessage="Bạn có chắc chắn muốn xóa sản phẩm này?"
                            isLoading={deletingId === product.id}
                            disabled={isSubmitting}
                            onConfirm={() => handleDelete(product.id)}
                          >
                            Xóa
                          </ConfirmActionButton>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </AdminTable>
        )}

        {meta.last_page > 1 ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-neutral-600">
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
      </AdminCard>
    </section>
  )
}
