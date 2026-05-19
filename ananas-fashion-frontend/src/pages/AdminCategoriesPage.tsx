import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { adminApi } from '@/api/admin.api'
import { useToast } from '@/app/ToastContext'
import { AdminCard } from '@/components/admin/AdminCard'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { ConfirmActionButton } from '@/components/admin/ConfirmActionButton'
import { FormSection } from '@/components/admin/FormSection'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { formatFieldError, parseApiError } from '@/lib/api-helpers'
import type { AdminCategory, AdminCategoryPayload } from '@/types/admin'
import type { PaginationMeta } from '@/types/pagination'

type CategoryFormState = {
  name: string
  slug: string
  parent_id: string
  image: string
  description: string
  sort_order: string
  is_active: boolean
}

const DEFAULT_FORM: CategoryFormState = {
  name: '',
  slug: '',
  parent_id: '',
  image: '',
  description: '',
  sort_order: '0',
  is_active: true,
}

const EMPTY_META: PaginationMeta = {
  current_page: 1,
  per_page: 20,
  total: 0,
  last_page: 1,
}

export function AdminCategoriesPage() {
  const toast = useToast()
  const [items, setItems] = useState<AdminCategory[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formState, setFormState] = useState<CategoryFormState>(DEFAULT_FORM)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null)

  const loadCategories = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await adminApi.listCategories({ page, per_page: 20 })
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
    void loadCategories()
  }, [loadCategories])

  const resetForm = () => {
    setFormState(DEFAULT_FORM)
    setEditingId(null)
    setFieldErrors(null)
  }

  const startEdit = async (id: number) => {
    setFieldErrors(null)

    try {
      const category = await adminApi.getCategory(id)
      setEditingId(category.id)
      setFormState({
        name: category.name ?? '',
        slug: category.slug ?? '',
        parent_id: category.parent_id ? String(category.parent_id) : '',
        image: category.image ?? '',
        description: category.description ?? '',
        sort_order: String(category.sort_order ?? 0),
        is_active: Boolean(category.is_active),
      })
      toast.info(`Đang chỉnh sửa danh mục #${category.id}`)
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
    }
  }

  const buildPayload = (): AdminCategoryPayload => {
    const payload: AdminCategoryPayload = {
      name: formState.name.trim(),
      is_active: formState.is_active,
    }

    if (formState.slug.trim()) payload.slug = formState.slug.trim()
    if (formState.parent_id.trim()) {
      payload.parent_id = Number(formState.parent_id)
    } else {
      payload.parent_id = null
    }
    if (formState.image.trim()) payload.image = formState.image.trim()
    if (formState.description.trim()) payload.description = formState.description.trim()
    if (formState.sort_order.trim()) payload.sort_order = Number(formState.sort_order)

    return payload
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFieldErrors(null)

    try {
      const payload = buildPayload()

      if (editingId) {
        await adminApi.updateCategory(editingId, payload)
        toast.success('Cập nhật danh mục thành công.')
      } else {
        await adminApi.createCategory(payload)
        toast.success('Tạo danh mục thành công.')
      }

      resetForm()
      await loadCategories()
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
      await adminApi.deleteCategory(id)
      toast.success('Xóa danh mục thành công.')
      if (items.length === 1 && page > 1) {
        setPage((prev) => Math.max(1, prev - 1))
      } else {
        await loadCategories()
      }
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return <LoadingState message="Đang tải danh mục..." />
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} />
  }

  return (
    <section className="space-y-5">
      <AdminPageHeader
        title="Quản lý danh mục"
        description="Tạo, cập nhật và xóa danh mục sản phẩm."
      />

      <AdminCard title={editingId ? `Cập nhật danh mục #${editingId}` : 'Tạo danh mục mới'}>
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <FormSection title="Thông tin cơ bản">
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                label="Tên danh mục"
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
                label="ID danh mục cha (tùy chọn)"
                type="number"
                min={1}
                value={formState.parent_id}
                onChange={(event) => setFormState((prev) => ({ ...prev, parent_id: event.target.value }))}
                error={formatFieldError(fieldErrors, 'parent_id')}
              />
              <Input
                label="Ảnh (URL, tùy chọn)"
                value={formState.image}
                onChange={(event) => setFormState((prev) => ({ ...prev, image: event.target.value }))}
                error={formatFieldError(fieldErrors, 'image')}
              />
              <Input
                label="Thứ tự sắp xếp"
                type="number"
                value={formState.sort_order}
                onChange={(event) => setFormState((prev) => ({ ...prev, sort_order: event.target.value }))}
                error={formatFieldError(fieldErrors, 'sort_order')}
              />
              <label className="flex items-center gap-2 pt-7 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={formState.is_active}
                  onChange={(event) => setFormState((prev) => ({ ...prev, is_active: event.target.checked }))}
                />
                Kích hoạt
              </label>
            </div>
          </FormSection>

          <FormSection title="Mô tả">
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
          </FormSection>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" isLoading={isSubmitting}>
              {editingId ? 'Lưu thay đổi' : 'Tạo danh mục'}
            </Button>
            {editingId ? (
              <Button type="button" variant="secondary" disabled={isSubmitting} onClick={resetForm}>
                Hủy chỉnh sửa
              </Button>
            ) : null}
          </div>
        </form>
      </AdminCard>

      <AdminCard title="Danh sách danh mục">
        {items.length === 0 ? (
          <EmptyState title="Chưa có danh mục" description="Hãy tạo danh mục đầu tiên." />
        ) : (
          <AdminTable minWidthClassName="min-w-[860px]">
            <thead className="bg-neutral-50 text-left text-neutral-600">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Tên</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Danh mục cha</th>
                <th className="px-3 py-2">Thứ tự</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {items.map((category) => (
                <tr key={category.id} className="border-t border-neutral-100">
                  <td className="px-3 py-2 text-neutral-700">{category.id}</td>
                  <td className="px-3 py-2 font-medium text-neutral-900">{category.name}</td>
                  <td className="px-3 py-2 text-neutral-700">{category.slug || '-'}</td>
                  <td className="px-3 py-2 text-neutral-700">{category.parent_id ?? '-'}</td>
                  <td className="px-3 py-2 text-neutral-700">{category.sort_order}</td>
                  <td className="px-3 py-2">
                    <AdminStatusPill
                      label={category.is_active ? 'Đang hoạt động' : 'Đang tắt'}
                      tone={category.is_active ? 'success' : 'neutral'}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={isSubmitting || deletingId === category.id}
                        onClick={() => void startEdit(category.id)}
                      >
                        Sửa
                      </Button>
                      <ConfirmActionButton
                        type="button"
                        variant="danger"
                        confirmMessage="Bạn có chắc chắn muốn xóa danh mục này?"
                        isLoading={deletingId === category.id}
                        disabled={isSubmitting}
                        onConfirm={() => handleDelete(category.id)}
                      >
                        Xóa
                      </ConfirmActionButton>
                    </div>
                  </td>
                </tr>
              ))}
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
