import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { adminApi } from '@/api/admin.api'
import { useToast } from '@/app/ToastContext'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { formatFieldError, parseApiError } from '@/lib/api-helpers'
import type { AdminBrand, AdminBrandPayload } from '@/types/admin'
import type { PaginationMeta } from '@/types/pagination'

type BrandFormState = {
  name: string
  slug: string
  logo: string
  description: string
  is_active: boolean
}

const DEFAULT_FORM: BrandFormState = {
  name: '',
  slug: '',
  logo: '',
  description: '',
  is_active: true,
}

const EMPTY_META: PaginationMeta = {
  current_page: 1,
  per_page: 20,
  total: 0,
  last_page: 1,
}

export function AdminBrandsPage() {
  const toast = useToast()
  const [items, setItems] = useState<AdminBrand[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formState, setFormState] = useState<BrandFormState>(DEFAULT_FORM)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null)

  const loadBrands = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await adminApi.listBrands({ page, per_page: 20 })
      setItems(response.data)
      setMeta(response.meta)
    } catch (error) {
      const apiError = parseApiError(error)
      setErrorMessage(apiError.message)
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    void loadBrands()
  }, [loadBrands])

  const resetForm = () => {
    setFormState(DEFAULT_FORM)
    setEditingId(null)
    setFieldErrors(null)
  }

  const startEdit = async (id: number) => {
    setFieldErrors(null)

    try {
      const brand = await adminApi.getBrand(id)
      setEditingId(brand.id)
      setFormState({
        name: brand.name ?? '',
        slug: brand.slug ?? '',
        logo: brand.logo ?? '',
        description: brand.description ?? '',
        is_active: Boolean(brand.is_active),
      })
      toast.info(`Đang chỉnh sửa thương hiệu #${brand.id}`)
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
    }
  }

  const buildPayload = (): AdminBrandPayload => {
    const payload: AdminBrandPayload = {
      name: formState.name.trim(),
      is_active: formState.is_active,
    }

    if (formState.slug.trim()) {
      payload.slug = formState.slug.trim()
    }
    if (formState.logo.trim()) {
      payload.logo = formState.logo.trim()
    }
    if (formState.description.trim()) {
      payload.description = formState.description.trim()
    }

    return payload
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFieldErrors(null)

    try {
      const payload = buildPayload()

      if (editingId) {
        await adminApi.updateBrand(editingId, payload)
        toast.success('Cập nhật thương hiệu thành công.')
      } else {
        await adminApi.createBrand(payload)
        toast.success('Tạo thương hiệu thành công.')
      }

      resetForm()
      await loadBrands()
    } catch (error) {
      const apiError = parseApiError(error)
      setFieldErrors(apiError.errors)
      toast.error(apiError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) {
      return
    }

    setDeletingId(id)

    try {
      await adminApi.deleteBrand(id)
      toast.success('Xóa thương hiệu thành công.')
      if (items.length === 1 && page > 1) {
        setPage((prev) => Math.max(1, prev - 1))
      } else {
        await loadBrands()
      }
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return <LoadingState message="Đang tải thương hiệu..." />
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} />
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Quản lý thương hiệu</h1>
        <p className="text-sm text-slate-600">Tạo, cập nhật và xóa thương hiệu sản phẩm.</p>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-slate-900">
          {editingId ? `Cập nhật thương hiệu #${editingId}` : 'Tạo thương hiệu mới'}
        </h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
          <Input
            label="Tên thương hiệu"
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
          <Input
            label="Logo (URL, tùy chọn)"
            value={formState.logo}
            onChange={(event) => setFormState((prev) => ({ ...prev, logo: event.target.value }))}
            error={formatFieldError(fieldErrors, 'logo')}
          />
          <label className="flex items-center gap-2 pt-7 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={formState.is_active}
              onChange={(event) => setFormState((prev) => ({ ...prev, is_active: event.target.checked }))}
            />
            Kích hoạt
          </label>
          <label className="block space-y-1 md:col-span-2">
            <span className="block text-sm font-medium text-slate-700">Mô tả (tùy chọn)</span>
            <textarea
              className="min-h-24 w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              value={formState.description}
              onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
            />
            {formatFieldError(fieldErrors, 'description') ? (
              <span className="text-xs text-red-600">{formatFieldError(fieldErrors, 'description')}</span>
            ) : null}
          </label>

          <div className="flex flex-wrap gap-2 md:col-span-2">
            <Button type="submit" isLoading={isSubmitting}>
              {editingId ? 'Lưu thay đổi' : 'Tạo thương hiệu'}
            </Button>
            {editingId ? (
              <Button type="button" variant="secondary" disabled={isSubmitting} onClick={resetForm}>
                Hủy chỉnh sửa
              </Button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-slate-900">Danh sách thương hiệu</h2>
        {items.length === 0 ? (
          <EmptyState title="Chưa có thương hiệu" description="Hãy tạo thương hiệu đầu tiên." />
        ) : (
          <div className="overflow-x-auto rounded border border-slate-200">
            <table className="min-w-[760px] bg-white text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Tên</th>
                  <th className="px-3 py-2">Slug</th>
                  <th className="px-3 py-2">Logo</th>
                  <th className="px-3 py-2">Trạng thái</th>
                  <th className="px-3 py-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {items.map((brand) => (
                  <tr key={brand.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-700">{brand.id}</td>
                    <td className="px-3 py-2 font-medium text-slate-900">{brand.name}</td>
                    <td className="px-3 py-2 text-slate-700">{brand.slug || '-'}</td>
                    <td className="px-3 py-2 text-slate-700">
                      {brand.logo ? (
                        <a href={brand.logo} target="_blank" rel="noreferrer" className="underline">
                          Xem logo
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-700">{brand.is_active ? 'Đang hoạt động' : 'Đang tắt'}</td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={isSubmitting || deletingId === brand.id}
                          onClick={() => void startEdit(brand.id)}
                        >
                          Sửa
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          isLoading={deletingId === brand.id}
                          disabled={isSubmitting}
                          onClick={() => void handleDelete(brand.id)}
                        >
                          Xóa
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.last_page > 1 ? (
          <div className="flex items-center justify-between">
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
      </section>
    </section>
  )
}
