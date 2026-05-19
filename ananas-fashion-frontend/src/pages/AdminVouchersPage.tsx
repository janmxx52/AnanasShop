import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
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
import type { AdminVoucher, AdminVoucherPayload, AdminVoucherType } from '@/types/admin'
import type { PaginationMeta } from '@/types/pagination'

type VoucherFilterState = {
  q: string
  type: 'all' | AdminVoucherType
  active: 'all' | 'active' | 'inactive'
}

type VoucherFormState = {
  code: string
  type: AdminVoucherType
  value: string
  max_discount: string
  min_order_amount: string
  usage_limit: string
  usage_per_user: string
  starts_at: string
  expires_at: string
  is_active: boolean
}

const EMPTY_META: PaginationMeta = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

const DEFAULT_FILTERS: VoucherFilterState = {
  q: '',
  type: 'all',
  active: 'all',
}

const DEFAULT_FORM: VoucherFormState = {
  code: '',
  type: 'percent',
  value: '',
  max_discount: '',
  min_order_amount: '',
  usage_limit: '',
  usage_per_user: '',
  starts_at: '',
  expires_at: '',
  is_active: true,
}

function toInputDatetime(value: string | null): string {
  if (!value) return ''
  return value.replace(' ', 'T').slice(0, 16)
}

function toApiDatetime(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed.includes('T')) return `${trimmed.replace('T', ' ')}:00`
  return trimmed
}

function toNullableNumber(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  return Number(trimmed)
}

function mapVoucherToForm(voucher: AdminVoucher): VoucherFormState {
  return {
    code: voucher.code ?? '',
    type: voucher.type ?? 'percent',
    value: String(voucher.value ?? ''),
    max_discount: voucher.max_discount === null ? '' : String(voucher.max_discount),
    min_order_amount: voucher.min_order_amount === null ? '' : String(voucher.min_order_amount),
    usage_limit: voucher.usage_limit === null ? '' : String(voucher.usage_limit),
    usage_per_user: voucher.usage_per_user === null ? '' : String(voucher.usage_per_user),
    starts_at: toInputDatetime(voucher.starts_at),
    expires_at: toInputDatetime(voucher.expires_at),
    is_active: Boolean(voucher.is_active),
  }
}

export function AdminVouchersPage() {
  const toast = useToast()

  const [vouchers, setVouchers] = useState<AdminVoucher[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [filters, setFilters] = useState<VoucherFilterState>(DEFAULT_FILTERS)
  const [formState, setFormState] = useState<VoucherFormState>(DEFAULT_FORM)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null)

  const loadVouchers = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await adminApi.listVouchers({ page, per_page: 15 })
      setVouchers(response.data)
      setMeta(response.meta)
    } catch (error) {
      const apiError = parseApiError(error)
      setErrorMessage(apiError.message)
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    void loadVouchers()
  }, [loadVouchers])

  const filteredVouchers = useMemo(() => {
    return vouchers.filter((voucher) => {
      const matchesQuery = filters.q.trim()
        ? voucher.code.toLowerCase().includes(filters.q.trim().toLowerCase())
        : true
      const matchesType = filters.type === 'all' ? true : voucher.type === filters.type
      const matchesActive =
        filters.active === 'all'
          ? true
          : filters.active === 'active'
            ? voucher.is_active
            : !voucher.is_active

      return matchesQuery && matchesType && matchesActive
    })
  }, [filters, vouchers])

  const resetForm = () => {
    setFormState(DEFAULT_FORM)
    setEditingId(null)
    setFieldErrors(null)
  }

  const startEdit = async (id: number) => {
    setFieldErrors(null)

    try {
      const voucher = await adminApi.getVoucher(id)
      setEditingId(voucher.id)
      setFormState(mapVoucherToForm(voucher))
      toast.info(`Đang chỉnh sửa voucher #${voucher.id}`)
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
    }
  }

  const validateForm = () => {
    const normalizedValue = Number(formState.value)
    if (!formState.code.trim()) return 'Vui lòng nhập mã voucher.'
    if (!Number.isFinite(normalizedValue) || normalizedValue <= 0) return 'Giá trị voucher phải lớn hơn 0.'
    if (formState.type === 'percent' && normalizedValue > 100) return 'Voucher phần trăm không được vượt quá 100%.'

    const minOrderAmount = toNullableNumber(formState.min_order_amount)
    if (minOrderAmount !== null && minOrderAmount < 0) return 'Đơn tối thiểu không được âm.'

    const maxDiscount = toNullableNumber(formState.max_discount)
    if (maxDiscount !== null && maxDiscount < 0) return 'Giảm tối đa không được âm.'

    const usageLimit = toNullableNumber(formState.usage_limit)
    if (usageLimit !== null && usageLimit < 1) return 'Giới hạn sử dụng phải lớn hơn hoặc bằng 1.'

    const usagePerUser = toNullableNumber(formState.usage_per_user)
    if (usagePerUser !== null && usagePerUser < 1) return 'Giới hạn mỗi người dùng phải lớn hơn hoặc bằng 1.'

    const startsAt = formState.starts_at.trim()
    const expiresAt = formState.expires_at.trim()
    if (startsAt && expiresAt && new Date(startsAt).getTime() > new Date(expiresAt).getTime()) {
      return 'Thời gian kết thúc phải sau hoặc bằng thời gian bắt đầu.'
    }

    return null
  }

  const buildPayload = (): AdminVoucherPayload => {
    return {
      code: formState.code.trim(),
      type: formState.type,
      value: Number(formState.value),
      max_discount: toNullableNumber(formState.max_discount),
      min_order_amount: toNullableNumber(formState.min_order_amount),
      usage_limit: toNullableNumber(formState.usage_limit),
      usage_per_user: toNullableNumber(formState.usage_per_user),
      starts_at: toApiDatetime(formState.starts_at),
      expires_at: toApiDatetime(formState.expires_at),
      is_active: formState.is_active,
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFieldErrors(null)

    const validationError = validateForm()
    if (validationError) {
      toast.error(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      const payload = buildPayload()

      if (editingId) {
        await adminApi.updateVoucher(editingId, payload)
        toast.success('Cập nhật mã giảm giá thành công.')
      } else {
        await adminApi.createVoucher(payload)
        toast.success('Tạo mã giảm giá thành công.')
      }

      resetForm()
      await loadVouchers()
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
      await adminApi.deleteVoucher(id)
      toast.success('Đã vô hiệu hóa mã giảm giá.')

      if (vouchers.length === 1 && page > 1) {
        setPage((prev) => Math.max(1, prev - 1))
      } else {
        await loadVouchers()
      }
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return <LoadingState message="Đang tải mã giảm giá..." />
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} />
  }

  return (
    <section className="space-y-5">
      <AdminPageHeader
        title="Quản lý mã giảm giá"
        description="Tạo, chỉnh sửa và vô hiệu hóa mã giảm giá."
      />

      <AdminCard title={editingId ? `Cập nhật mã giảm giá #${editingId}` : 'Tạo mã giảm giá mới'}>
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <FormSection title="Thông tin voucher">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <Input
                label="Mã voucher"
                value={formState.code}
                onChange={(event) => setFormState((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))}
                error={formatFieldError(fieldErrors, 'code')}
                required
              />

              <label className="block space-y-1">
                <span className="block text-sm font-medium text-neutral-700">Loại voucher</span>
                <select
                  className="w-full border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#f15a24] focus:ring-2 focus:ring-orange-100"
                  value={formState.type}
                  onChange={(event) => setFormState((prev) => ({ ...prev, type: event.target.value as AdminVoucherType }))}
                >
                  <option value="percent">Phần trăm</option>
                  <option value="fixed">Cố định</option>
                </select>
                {formatFieldError(fieldErrors, 'type') ? (
                  <span className="text-xs text-red-600">{formatFieldError(fieldErrors, 'type')}</span>
                ) : null}
              </label>

              <Input
                label="Giá trị"
                type="number"
                min={0.01}
                step="0.01"
                value={formState.value}
                onChange={(event) => setFormState((prev) => ({ ...prev, value: event.target.value }))}
                error={formatFieldError(fieldErrors, 'value')}
                required
              />
              <Input
                label="Giảm tối đa"
                type="number"
                min={0}
                step="0.01"
                value={formState.max_discount}
                onChange={(event) => setFormState((prev) => ({ ...prev, max_discount: event.target.value }))}
                error={formatFieldError(fieldErrors, 'max_discount')}
              />
              <Input
                label="Đơn tối thiểu"
                type="number"
                min={0}
                step="0.01"
                value={formState.min_order_amount}
                onChange={(event) => setFormState((prev) => ({ ...prev, min_order_amount: event.target.value }))}
                error={formatFieldError(fieldErrors, 'min_order_amount')}
              />
              <Input
                label="Giới hạn tổng lượt dùng"
                type="number"
                min={1}
                value={formState.usage_limit}
                onChange={(event) => setFormState((prev) => ({ ...prev, usage_limit: event.target.value }))}
                error={formatFieldError(fieldErrors, 'usage_limit')}
              />
              <Input
                label="Giới hạn mỗi người dùng"
                type="number"
                min={1}
                value={formState.usage_per_user}
                onChange={(event) => setFormState((prev) => ({ ...prev, usage_per_user: event.target.value }))}
                error={formatFieldError(fieldErrors, 'usage_per_user')}
              />
              <Input
                label="Bắt đầu"
                type="datetime-local"
                value={formState.starts_at}
                onChange={(event) => setFormState((prev) => ({ ...prev, starts_at: event.target.value }))}
                error={formatFieldError(fieldErrors, 'starts_at')}
              />
              <Input
                label="Kết thúc"
                type="datetime-local"
                value={formState.expires_at}
                onChange={(event) => setFormState((prev) => ({ ...prev, expires_at: event.target.value }))}
                error={formatFieldError(fieldErrors, 'expires_at')}
              />
              <label className="flex items-center gap-2 pt-7 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={formState.is_active}
                  onChange={(event) => setFormState((prev) => ({ ...prev, is_active: event.target.checked }))}
                />
                Kích hoạt voucher
              </label>
            </div>
          </FormSection>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" isLoading={isSubmitting}>
              {editingId ? 'Lưu thay đổi' : 'Tạo mã giảm giá'}
            </Button>
            {editingId ? (
              <Button type="button" variant="secondary" disabled={isSubmitting} onClick={resetForm}>
                Hủy chỉnh sửa
              </Button>
            ) : null}
          </div>
        </form>
      </AdminCard>

      <AdminCard title="Bộ lọc voucher">
        <AdminToolbar className="grid w-full gap-3 md:grid-cols-3">
          <Input
            label="Tìm theo mã"
            placeholder="Ví dụ: SALE10"
            value={filters.q}
            onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
          />

          <label className="block space-y-1">
            <span className="block text-sm font-medium text-neutral-700">Loại voucher</span>
            <select
              className="w-full border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#f15a24] focus:ring-2 focus:ring-orange-100"
              value={filters.type}
              onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value as VoucherFilterState['type'] }))}
            >
              <option value="all">Tất cả</option>
              <option value="percent">Phần trăm</option>
              <option value="fixed">Cố định</option>
            </select>
          </label>

          <label className="block space-y-1">
            <span className="block text-sm font-medium text-neutral-700">Trạng thái</span>
            <select
              className="w-full border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#f15a24] focus:ring-2 focus:ring-orange-100"
              value={filters.active}
              onChange={(event) => setFilters((prev) => ({ ...prev, active: event.target.value as VoucherFilterState['active'] }))}
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang bật</option>
              <option value="inactive">Đang tắt</option>
            </select>
          </label>
        </AdminToolbar>
      </AdminCard>

      <AdminCard title="Danh sách voucher">
        {filteredVouchers.length === 0 ? (
          <EmptyState
            title={vouchers.length === 0 ? 'Chưa có voucher' : 'Không có voucher phù hợp'}
            description={
              vouchers.length === 0 ? 'Hãy tạo mã giảm giá đầu tiên.' : 'Hãy thử thay đổi điều kiện lọc ở trên.'
            }
          />
        ) : (
          <AdminTable minWidthClassName="min-w-[1280px]">
            <thead className="bg-neutral-50 text-left text-neutral-600">
              <tr>
                <th className="px-3 py-2">Mã</th>
                <th className="px-3 py-2">Loại</th>
                <th className="px-3 py-2">Giá trị</th>
                <th className="px-3 py-2">Giảm tối đa</th>
                <th className="px-3 py-2">Đơn tối thiểu</th>
                <th className="px-3 py-2">Đã dùng</th>
                <th className="px-3 py-2">Giới hạn</th>
                <th className="px-3 py-2">Mỗi user</th>
                <th className="px-3 py-2">Hiệu lực</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.map((voucher) => (
                <tr key={voucher.id} className="border-t border-neutral-100">
                  <td className="px-3 py-2 font-medium text-neutral-900">{voucher.code}</td>
                  <td className="px-3 py-2 text-neutral-700">{voucher.type === 'percent' ? 'Phần trăm' : 'Cố định'}</td>
                  <td className="px-3 py-2 text-neutral-700">
                    {voucher.type === 'percent' ? `${voucher.value}%` : <PriceText value={voucher.value} />}
                  </td>
                  <td className="px-3 py-2 text-neutral-700">
                    <PriceText value={voucher.max_discount} />
                  </td>
                  <td className="px-3 py-2 text-neutral-700">
                    <PriceText value={voucher.min_order_amount} />
                  </td>
                  <td className="px-3 py-2 text-neutral-700">{voucher.used_count}</td>
                  <td className="px-3 py-2 text-neutral-700">{voucher.usage_limit ?? '-'}</td>
                  <td className="px-3 py-2 text-neutral-700">{voucher.usage_per_user ?? '-'}</td>
                  <td className="px-3 py-2 text-neutral-700">
                    <div className="space-y-1">
                      <p>Từ: {voucher.starts_at ? new Date(voucher.starts_at).toLocaleString('vi-VN') : '-'}</p>
                      <p>Đến: {voucher.expires_at ? new Date(voucher.expires_at).toLocaleString('vi-VN') : '-'}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <AdminStatusPill
                      label={voucher.is_active ? 'Đang bật' : 'Đang tắt'}
                      tone={voucher.is_active ? 'success' : 'neutral'}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={isSubmitting || deletingId === voucher.id}
                        onClick={() => void startEdit(voucher.id)}
                      >
                        Sửa
                      </Button>
                      <ConfirmActionButton
                        type="button"
                        variant="danger"
                        confirmMessage="Bạn có chắc chắn muốn vô hiệu hóa mã giảm giá này?"
                        isLoading={deletingId === voucher.id}
                        disabled={isSubmitting}
                        onConfirm={() => handleDelete(voucher.id)}
                      >
                        Vô hiệu hóa
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
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Trước
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={meta.current_page >= meta.last_page}
                onClick={() => setPage((prev) => Math.min(prev + 1, meta.last_page))}
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
