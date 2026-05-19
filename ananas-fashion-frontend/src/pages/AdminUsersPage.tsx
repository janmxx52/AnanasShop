import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import { adminApi } from '@/api/admin.api'
import { useAuth } from '@/app/AuthContext'
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
import { formatFieldError, parseApiError } from '@/lib/api-helpers'
import type { AdminUser, AdminUserListParams, AdminUserPayload, AdminUserRole } from '@/types/admin'
import type { PaginationMeta } from '@/types/pagination'

type UserFilterState = {
  q: string
  role: 'all' | AdminUserRole
  status: 'all' | 'active' | 'banned'
}

type UserFormState = {
  name: string
  email: string
  password: string
  phone: string
  role: AdminUserRole
  is_banned: boolean
}

const EMPTY_META: PaginationMeta = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

const DEFAULT_FILTERS: UserFilterState = {
  q: '',
  role: 'all',
  status: 'all',
}

const DEFAULT_FORM: UserFormState = {
  name: '',
  email: '',
  password: '',
  phone: '',
  role: 'customer',
  is_banned: false,
}

function getRoleLabel(role: AdminUserRole) {
  return role === 'admin' ? 'Quản trị viên' : 'Khách hàng'
}

function toOptionalString(value: string): string | null {
  const normalized = value.trim()
  return normalized ? normalized : null
}

function mapUserToForm(user: AdminUser): UserFormState {
  return {
    name: user.name ?? '',
    email: user.email ?? '',
    password: '',
    phone: user.phone ?? '',
    role: user.role ?? 'customer',
    is_banned: Boolean(user.is_banned),
  }
}

function buildListParams(filters: UserFilterState, page: number): AdminUserListParams {
  return {
    page,
    per_page: 15,
    q: filters.q.trim() || undefined,
    role: filters.role === 'all' ? undefined : filters.role,
    is_banned:
      filters.status === 'all'
        ? undefined
        : filters.status === 'banned',
  }
}

function getDeleteErrorMessage(message: string) {
  if (message.toLowerCase().includes('existing orders')) {
    return 'Không thể xóa người dùng đã có đơn hàng. Bạn có thể khóa tài khoản này.'
  }

  return message
}

export function AdminUsersPage() {
  const { user: currentUser } = useAuth()
  const toast = useToast()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<UserFilterState>(DEFAULT_FILTERS)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [formState, setFormState] = useState<UserFormState>(DEFAULT_FORM)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [processingId, setProcessingId] = useState<number | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null)

  const isEditingSelf = editingId !== null && editingId === currentUser?.id

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await adminApi.listUsers(buildListParams(filters, page))
      setUsers(response.data)
      setMeta(response.meta)
    } catch (error) {
      const apiError = parseApiError(error)
      setErrorMessage(apiError.message)
    } finally {
      setIsLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  const roleCount = useMemo(() => {
    const admins = users.filter((item) => item.role === 'admin').length
    return {
      admins,
      customers: Math.max(users.length - admins, 0),
    }
  }, [users])

  const resetForm = () => {
    setFormState(DEFAULT_FORM)
    setEditingId(null)
    setFieldErrors(null)
  }

  const startEdit = async (id: number) => {
    setFieldErrors(null)

    try {
      const detail = await adminApi.getUser(id)
      setEditingId(detail.id)
      setFormState(mapUserToForm(detail))
      toast.info(`Đang chỉnh sửa người dùng #${detail.id}`)
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
    }
  }

  const buildCreatePayload = (): AdminUserPayload => {
    return {
      name: formState.name.trim(),
      email: formState.email.trim(),
      password: formState.password,
      phone: toOptionalString(formState.phone),
      role: formState.role,
      is_banned: formState.is_banned,
    }
  }

  const buildUpdatePayload = (): Partial<AdminUserPayload> => {
    return {
      name: formState.name.trim(),
      email: formState.email.trim(),
      phone: toOptionalString(formState.phone),
      role: formState.role,
      is_banned: formState.is_banned,
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFieldErrors(null)

    if (!formState.name.trim()) {
      toast.error('Vui lòng nhập họ và tên.')
      return
    }
    if (!formState.email.trim()) {
      toast.error('Vui lòng nhập email.')
      return
    }
    if (!editingId && !formState.password.trim()) {
      toast.error('Vui lòng nhập mật khẩu khi tạo tài khoản.')
      return
    }
    if (isEditingSelf && formState.role !== 'admin') {
      toast.error('Bạn không thể tự hạ quyền tài khoản admin.')
      return
    }
    if (isEditingSelf && formState.is_banned) {
      toast.error('Bạn không thể tự khóa chính mình.')
      return
    }

    setIsSubmitting(true)

    try {
      if (editingId) {
        await adminApi.updateUser(editingId, buildUpdatePayload())
        toast.success('Cập nhật người dùng thành công.')
      } else {
        await adminApi.createUser(buildCreatePayload())
        toast.success('Tạo người dùng thành công.')
      }

      resetForm()
      await loadUsers()
    } catch (error) {
      const apiError = parseApiError(error)
      setFieldErrors(apiError.errors)
      toast.error(apiError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBan = async (target: AdminUser) => {
    if (currentUser?.id === target.id) {
      toast.error('Bạn không thể tự khóa chính mình.')
      return
    }

    setProcessingId(target.id)
    try {
      if (target.is_banned) {
        await adminApi.unbanUser(target.id)
        toast.success('Đã mở khóa tài khoản.')
      } else {
        await adminApi.banUser(target.id)
        toast.success('Đã khóa tài khoản và thu hồi phiên đăng nhập.')
      }

      await loadUsers()
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
    } finally {
      setProcessingId(null)
    }
  }

  const handleDelete = async (target: AdminUser) => {
    if (currentUser?.id === target.id) {
      toast.error('Bạn không thể tự xóa chính mình.')
      return
    }

    setDeletingId(target.id)
    try {
      await adminApi.deleteUser(target.id)
      toast.success('Đã xóa mềm người dùng.')

      if (users.length === 1 && page > 1) {
        setPage((prev) => Math.max(1, prev - 1))
      } else {
        await loadUsers()
      }
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(getDeleteErrorMessage(apiError.message))
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return <LoadingState message="Đang tải danh sách người dùng..." />
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} />
  }

  return (
    <section className="space-y-5">
      <AdminPageHeader
        title="Quản lý người dùng"
        description="Tạo, cập nhật, khóa/mở khóa và xóa mềm tài khoản người dùng."
      />

      <AdminCard
        title={editingId ? `Cập nhật người dùng #${editingId}` : 'Tạo người dùng mới'}
        description="Không hỗ trợ đổi mật khẩu trong chế độ chỉnh sửa."
      >
        <form className="grid gap-3" onSubmit={handleSubmit}>
          <FormSection title="Thông tin tài khoản">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <Input
                label="Họ và tên"
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                error={formatFieldError(fieldErrors, 'name')}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formState.email}
                onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                error={formatFieldError(fieldErrors, 'email')}
                required
              />
              {!editingId ? (
                <Input
                  label="Mật khẩu"
                  type="password"
                  value={formState.password}
                  onChange={(event) => setFormState((prev) => ({ ...prev, password: event.target.value }))}
                  error={formatFieldError(fieldErrors, 'password')}
                  required
                />
              ) : (
                <div className="rounded border border-dashed border-neutral-300 bg-white p-3 text-xs text-neutral-600">
                  Mật khẩu chỉ thay đổi qua luồng riêng. Form này không cập nhật mật khẩu.
                </div>
              )}
              <Input
                label="Số điện thoại"
                value={formState.phone}
                onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
                error={formatFieldError(fieldErrors, 'phone')}
              />

              <label className="block space-y-1">
                <span className="block text-sm font-medium text-neutral-700">Vai trò</span>
                <select
                  className="w-full border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#f15a24] focus:ring-2 focus:ring-orange-100"
                  value={formState.role}
                  onChange={(event) => setFormState((prev) => ({ ...prev, role: event.target.value as AdminUserRole }))}
                >
                  <option value="customer" disabled={Boolean(isEditingSelf && currentUser?.role === 'admin')}>
                    Khách hàng
                  </option>
                  <option value="admin">
                    Quản trị viên
                  </option>
                </select>
                {formatFieldError(fieldErrors, 'role') ? (
                  <span className="text-xs text-red-600">{formatFieldError(fieldErrors, 'role')}</span>
                ) : null}
              </label>

              <label className="flex items-center gap-2 pt-7 text-sm text-neutral-700">
                <input
                  type="checkbox"
                  checked={formState.is_banned}
                  disabled={isEditingSelf}
                  onChange={(event) => setFormState((prev) => ({ ...prev, is_banned: event.target.checked }))}
                />
                Khóa tài khoản
              </label>
            </div>
          </FormSection>

          {isEditingSelf ? (
            <p className="text-xs text-amber-700">
              Tài khoản của bạn chỉ có thể giữ vai trò quản trị viên và không thể tự khóa.
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button type="submit" isLoading={isSubmitting}>
              {editingId ? 'Lưu thay đổi' : 'Tạo người dùng'}
            </Button>
            {editingId ? (
              <Button type="button" variant="secondary" disabled={isSubmitting} onClick={resetForm}>
                Hủy chỉnh sửa
              </Button>
            ) : null}
          </div>
        </form>
      </AdminCard>

      <AdminCard title="Bộ lọc người dùng">
        <AdminToolbar className="grid w-full gap-3 md:grid-cols-3">
          <Input
            label="Tìm theo tên hoặc email"
            placeholder="Nhập tên hoặc email..."
            value={filters.q}
            onChange={(event) => {
              setPage(1)
              setFilters((prev) => ({ ...prev, q: event.target.value }))
            }}
          />

          <label className="block space-y-1">
            <span className="block text-sm font-medium text-neutral-700">Vai trò</span>
            <select
              className="w-full border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#f15a24] focus:ring-2 focus:ring-orange-100"
              value={filters.role}
              onChange={(event) => {
                setPage(1)
                setFilters((prev) => ({ ...prev, role: event.target.value as UserFilterState['role'] }))
              }}
            >
              <option value="all">Tất cả</option>
              <option value="admin">Quản trị viên</option>
              <option value="customer">Khách hàng</option>
            </select>
          </label>

          <label className="block space-y-1">
            <span className="block text-sm font-medium text-neutral-700">Trạng thái</span>
            <select
              className="w-full border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#f15a24] focus:ring-2 focus:ring-orange-100"
              value={filters.status}
              onChange={(event) => {
                setPage(1)
                setFilters((prev) => ({ ...prev, status: event.target.value as UserFilterState['status'] }))
              }}
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="banned">Đã bị khóa</option>
            </select>
          </label>
        </AdminToolbar>

        <div className="mt-3 grid gap-2 text-sm text-neutral-600 sm:grid-cols-2">
          <p>Tổng user trên trang: {users.length}</p>
          <p>
            Admin: {roleCount.admins} • Khách hàng: {roleCount.customers}
          </p>
        </div>
      </AdminCard>

      <AdminCard title="Danh sách người dùng">
        {users.length === 0 ? (
          <EmptyState title="Chưa có người dùng" description="Không có dữ liệu phù hợp với bộ lọc hiện tại." />
        ) : (
          <AdminTable minWidthClassName="min-w-[1120px]">
            <thead className="bg-neutral-50 text-left text-neutral-600">
              <tr>
                <th className="px-3 py-2">ID</th>
                <th className="px-3 py-2">Họ tên</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Điện thoại</th>
                <th className="px-3 py-2">Vai trò</th>
                <th className="px-3 py-2">Trạng thái</th>
                <th className="px-3 py-2">Ngày tạo</th>
                <th className="px-3 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((target) => {
                const isSelf = currentUser?.id === target.id
                const isBusy = isSubmitting || processingId === target.id || deletingId === target.id

                return (
                  <tr key={target.id} className="border-t border-neutral-100">
                    <td className="px-3 py-2 text-neutral-700">{target.id}</td>
                    <td className="px-3 py-2 font-medium text-neutral-900">
                      {target.name}
                      {isSelf ? <span className="ml-2 text-xs text-neutral-500">(Bạn)</span> : null}
                    </td>
                    <td className="px-3 py-2 text-neutral-700">{target.email}</td>
                    <td className="px-3 py-2 text-neutral-700">{target.phone || '-'}</td>
                    <td className="px-3 py-2">
                      <AdminStatusPill label={getRoleLabel(target.role)} tone={target.role === 'admin' ? 'info' : 'neutral'} />
                    </td>
                    <td className="px-3 py-2">
                      <AdminStatusPill
                        label={target.is_banned ? 'Đã khóa' : 'Hoạt động'}
                        tone={target.is_banned ? 'danger' : 'success'}
                      />
                    </td>
                    <td className="px-3 py-2 text-neutral-700">
                      {target.created_at ? new Date(target.created_at).toLocaleString('vi-VN') : '-'}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={isBusy}
                          onClick={() => void startEdit(target.id)}
                        >
                          Sửa
                        </Button>
                        <ConfirmActionButton
                          type="button"
                          variant={target.is_banned ? 'secondary' : 'danger'}
                          confirmMessage={
                            target.is_banned
                              ? 'Bạn có chắc chắn muốn mở khóa tài khoản này?'
                              : 'Bạn có chắc chắn muốn khóa tài khoản này?'
                          }
                          disabled={Boolean(isBusy || isSelf)}
                          isLoading={processingId === target.id}
                          onConfirm={() => handleBan(target)}
                        >
                          {target.is_banned ? 'Mở khóa' : 'Khóa'}
                        </ConfirmActionButton>
                        <ConfirmActionButton
                          type="button"
                          variant="danger"
                          confirmMessage="Bạn có chắc chắn muốn xóa mềm người dùng này?"
                          disabled={Boolean(isBusy || isSelf)}
                          isLoading={deletingId === target.id}
                          onConfirm={() => handleDelete(target)}
                        >
                          Xóa
                        </ConfirmActionButton>
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
