import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminApi } from '@/api/admin.api'
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge'
import { PaymentStatusBadge } from '@/components/order/PaymentStatusBadge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PriceText } from '@/components/ui/PriceText'
import { parseApiError } from '@/lib/api-helpers'
import { getPaymentMethodLabel } from '@/lib/display-labels'
import type { AdminOrder } from '@/types/admin'
import type { OrderStatus, PaymentStatus } from '@/types/order-status'
import type { PaginationMeta } from '@/types/pagination'

type OrderFilterState = {
  q: string
  status: 'all' | OrderStatus
  payment_status: 'all' | PaymentStatus
}

const EMPTY_META: PaginationMeta = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

const DEFAULT_FILTERS: OrderFilterState = {
  q: '',
  status: 'all',
  payment_status: 'all',
}

function getCustomerName(order: AdminOrder): string {
  if (order.shipping?.name?.trim()) {
    return order.shipping.name
  }

  if (order.customer?.guest_name?.trim()) {
    return order.customer.guest_name
  }

  if (order.customer?.user_id) {
    return `Thành viên #${order.customer.user_id}`
  }

  return 'Không xác định'
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [filters, setFilters] = useState<OrderFilterState>(DEFAULT_FILTERS)

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const response = await adminApi.listOrders({ page, per_page: 15 })
        setOrders(response.data)
        setMeta(response.meta)
      } catch (error) {
        const apiError = parseApiError(error)
        setErrorMessage(apiError.message)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchOrders()
  }, [page])

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesCode = filters.q.trim()
        ? order.code.toLowerCase().includes(filters.q.trim().toLowerCase())
        : true
      const matchesStatus = filters.status === 'all' ? true : order.status === filters.status
      const matchesPaymentStatus =
        filters.payment_status === 'all' ? true : order.payment_status === filters.payment_status

      return matchesCode && matchesStatus && matchesPaymentStatus
    })
  }, [filters, orders])

  if (isLoading) {
    return <LoadingState message="Đang tải danh sách đơn hàng..." />
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} />
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Quản lý đơn hàng</h1>
        <p className="text-sm text-slate-600">Theo dõi đơn hàng và chuyển trạng thái theo luồng xử lý.</p>
      </header>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-slate-900">Bộ lọc đơn hàng (trang hiện tại)</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <Input
            label="Tìm mã đơn hàng"
            placeholder="Ví dụ: ANS-15052026-ABC123"
            value={filters.q}
            onChange={(event) => setFilters((prev) => ({ ...prev, q: event.target.value }))}
          />

          <label className="block space-y-1">
            <span className="block text-sm font-medium text-slate-700">Trạng thái đơn</span>
            <select
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              value={filters.status}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, status: event.target.value as OrderFilterState['status'] }))
              }
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="processing">Đang xử lý</option>
              <option value="shipping">Đang giao hàng</option>
              <option value="delivered">Đã giao hàng</option>
              <option value="returned">Đã trả hàng</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </label>

          <label className="block space-y-1">
            <span className="block text-sm font-medium text-slate-700">Trạng thái thanh toán</span>
            <select
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              value={filters.payment_status}
              onChange={(event) =>
                setFilters((prev) => ({
                  ...prev,
                  payment_status: event.target.value as OrderFilterState['payment_status'],
                }))
              }
            >
              <option value="all">Tất cả</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="failed">Thanh toán thất bại</option>
              <option value="cancelled">Đã hủy</option>
              <option value="refunded">Đã hoàn tiền</option>
            </select>
          </label>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-slate-900">Danh sách đơn hàng</h2>

        {filteredOrders.length === 0 ? (
          <EmptyState
            title={orders.length === 0 ? 'Chưa có đơn hàng' : 'Không có đơn hàng phù hợp'}
            description={
              orders.length === 0 ? 'Hệ thống chưa có đơn hàng nào.' : 'Hãy thử thay đổi điều kiện lọc ở trên.'
            }
          />
        ) : (
          <div className="overflow-x-auto rounded border border-slate-200">
            <table className="min-w-[1180px] bg-white text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-3 py-2">Mã đơn</th>
                  <th className="px-3 py-2">Khách hàng</th>
                  <th className="px-3 py-2">Tổng tiền</th>
                  <th className="px-3 py-2">Trạng thái đơn</th>
                  <th className="px-3 py-2">Thanh toán</th>
                  <th className="px-3 py-2">Phương thức</th>
                  <th className="px-3 py-2">Ngày tạo</th>
                  <th className="px-3 py-2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-900">{order.code}</td>
                    <td className="px-3 py-2 text-slate-700">{getCustomerName(order)}</td>
                    <td className="px-3 py-2 text-slate-900">
                      <PriceText value={order.total} />
                    </td>
                    <td className="px-3 py-2">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-3 py-2">
                      <PaymentStatusBadge status={order.payment_status} />
                    </td>
                    <td className="px-3 py-2 text-slate-700">{getPaymentMethodLabel(order.payment_method)}</td>
                    <td className="px-3 py-2 text-slate-700">{new Date(order.created_at).toLocaleString('vi-VN')}</td>
                    <td className="px-3 py-2">
                      <Link
                        to={`/admin/orders/${order.code}`}
                        className="inline-flex rounded bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                      >
                        Xem chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.last_page > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
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
