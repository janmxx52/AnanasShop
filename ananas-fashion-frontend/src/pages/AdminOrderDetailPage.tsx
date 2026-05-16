import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adminApi } from '@/api/admin.api'
import { useToast } from '@/app/ToastContext'
import { OrderItemsTable } from '@/components/order/OrderItemsTable'
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge'
import { OrderTimeline } from '@/components/order/OrderTimeline'
import { PaymentStatusBadge } from '@/components/order/PaymentStatusBadge'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PriceText } from '@/components/ui/PriceText'
import { parseApiError } from '@/lib/api-helpers'
import { getOrderStatusLabel, getPaymentMethodLabel } from '@/lib/display-labels'
import { buildOrderTimeline } from '@/lib/order-timeline'
import type { AdminOrder } from '@/types/admin'
import type { OrderStatus } from '@/types/order-status'

const ADMIN_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipping', 'cancelled'],
  shipping: ['delivered', 'returned', 'cancelled'],
  delivered: [],
  cancelled: [],
  returned: [],
}

function getCustomerLabel(order: AdminOrder): string {
  if (order.shipping?.name?.trim()) {
    return order.shipping.name
  }

  if (order.customer?.guest_name?.trim()) {
    return order.customer.guest_name
  }

  if (order.customer?.user_id) {
    return `User #${order.customer.user_id}`
  }

  return 'Không xác định'
}

export function AdminOrderDetailPage() {
  const { orderCode } = useParams<{ orderCode: string }>()
  const toast = useToast()

  const [order, setOrder] = useState<AdminOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const loadOrder = async () => {
    if (!orderCode) {
      setErrorMessage('Thiếu mã đơn hàng.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await adminApi.getOrder(orderCode)
      setOrder(response)
      setSelectedStatus('')
    } catch (error) {
      const apiError = parseApiError(error)
      setErrorMessage(apiError.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadOrder()
  }, [orderCode])

  const allowedTransitions = useMemo(() => {
    if (!order) {
      return []
    }

    return ADMIN_STATUS_TRANSITIONS[order.status] ?? []
  }, [order])

  const statusTransitions = useMemo(() => {
    return allowedTransitions.filter((status) => status !== 'cancelled')
  }, [allowedTransitions])

  const canCancel = useMemo(() => {
    return allowedTransitions.includes('cancelled')
  }, [allowedTransitions])

  const timelineItems = useMemo(() => {
    if (!order) {
      return []
    }

    return buildOrderTimeline(order.status)
  }, [order])

  const handleUpdateStatus = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!order || !selectedStatus) {
      return
    }

    setIsUpdatingStatus(true)

    try {
      await adminApi.updateOrderStatus(order.code, { status: selectedStatus })
      await loadOrder()
      toast.success('Cập nhật trạng thái đơn hàng thành công.')
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!order || !canCancel) {
      return
    }

    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return
    }

    setIsCancelling(true)

    try {
      await adminApi.cancelOrder(order.code)
      await loadOrder()
      toast.success('Hủy đơn hàng thành công.')
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
    } finally {
      setIsCancelling(false)
    }
  }

  if (isLoading) {
    return <LoadingState message="Đang tải chi tiết đơn hàng..." />
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} />
  }

  if (!order) {
    return <ErrorState message="Không tìm thấy đơn hàng." />
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <Link to="/admin/orders" className="text-sm text-slate-600 hover:text-slate-900">
            Quay lại danh sách đơn hàng
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900">Đơn hàng {order.code}</h1>
        </div>
        {canCancel ? (
          <Button type="button" variant="danger" isLoading={isCancelling} onClick={() => void handleCancelOrder()}>
            Hủy đơn hàng
          </Button>
        ) : null}
      </header>

      <section className="grid gap-2 rounded-lg border border-slate-200 bg-white p-4 text-sm sm:grid-cols-2">
        <p>
          <span className="text-slate-600">Trạng thái đơn hàng:</span> <OrderStatusBadge status={order.status} />
        </p>
        <p>
          <span className="text-slate-600">Trạng thái thanh toán:</span>{' '}
          <PaymentStatusBadge status={order.payment_status} />
        </p>
        <p>
          <span className="text-slate-600">Phương thức thanh toán:</span> {getPaymentMethodLabel(order.payment_method)}
        </p>
        <p>
          <span className="text-slate-600">Ngày đặt:</span> {new Date(order.created_at).toLocaleString('vi-VN')}
        </p>
        <p>
          <span className="text-slate-600">Khách hàng:</span> {getCustomerLabel(order)}
        </p>
        <p>
          <span className="text-slate-600">Loại đơn:</span> {order.customer.user_id ? 'Thành viên' : 'Khách'}
        </p>
        <p>
          <span className="text-slate-600">Tạm tính:</span> <PriceText value={order.subtotal} />
        </p>
        <p>
          <span className="text-slate-600">Giảm giá:</span> <PriceText value={order.discount_amount} />
        </p>
        <p>
          <span className="text-slate-600">Phí vận chuyển:</span> <PriceText value={order.shipping_fee} />
        </p>
        <p>
          <span className="text-slate-600">Tổng tiền:</span> <PriceText value={order.total} />
        </p>
        <p>
          <span className="text-slate-600">Voucher:</span> {order.voucher_code || '-'}
        </p>
        <p>
          <span className="text-slate-600">SĐT nhận hàng:</span> {order.shipping.phone || '-'}
        </p>
        <p className="sm:col-span-2">
          <span className="text-slate-600">Địa chỉ giao hàng:</span> {order.shipping.address || '-'}
        </p>
        {order.note ? (
          <p className="sm:col-span-2">
            <span className="text-slate-600">Ghi chú:</span> {order.note}
          </p>
        ) : null}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-base font-semibold text-slate-900">Cập nhật trạng thái</h2>
        {statusTransitions.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">Đơn hàng này không còn trạng thái tiếp theo hợp lệ.</p>
        ) : (
          <form className="mt-3 flex flex-wrap items-end gap-3" onSubmit={handleUpdateStatus}>
            <label className="block space-y-1">
              <span className="block text-sm font-medium text-slate-700">Trạng thái mới</span>
              <select
                className="w-full min-w-52 rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value as OrderStatus)}
                required
              >
                <option value="">Chọn trạng thái</option>
                {statusTransitions.map((status) => (
                  <option key={status} value={status}>
                    {getOrderStatusLabel(status)}
                  </option>
                ))}
              </select>
            </label>
            <Button type="submit" isLoading={isUpdatingStatus} disabled={!selectedStatus}>
              Cập nhật trạng thái
            </Button>
          </form>
        )}
      </section>

      <OrderTimeline items={timelineItems} />
      <OrderItemsTable items={order.items ?? []} />
    </section>
  )
}
