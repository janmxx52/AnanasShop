import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { orderApi } from '@/api/order.api'
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
import { getPaymentMethodLabel } from '@/lib/display-labels'
import { buildOrderTimeline } from '@/lib/order-timeline'
import type { OrderSummary } from '@/types/order'

function canCancelOrder(status: OrderSummary['status']) {
  return status === 'pending' || status === 'confirmed'
}

export function UserOrderDetailPage() {
  const { orderCode } = useParams<{ orderCode: string }>()
  const toast = useToast()

  const [order, setOrder] = useState<OrderSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderCode) {
        setErrorMessage('Thiếu mã đơn hàng.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setErrorMessage(null)

      try {
        const response = await orderApi.detail(orderCode)
        setOrder(response)
      } catch (error) {
        const apiError = parseApiError(error)
        setErrorMessage(apiError.message)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchOrder()
  }, [orderCode])

  const timeline = useMemo(() => {
    if (!order) {
      return []
    }

    return buildOrderTimeline(order.status)
  }, [order])

  const handleCancel = async () => {
    if (!order || !canCancelOrder(order.status)) {
      return
    }

    setIsCancelling(true)

    try {
      await orderApi.cancel(order.code)
      const refreshedOrder = await orderApi.detail(order.code)
      setOrder(refreshedOrder)
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
          <Link to="/orders" className="text-sm text-slate-600 hover:text-slate-900">
            Quay lại danh sách đơn hàng
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900">Đơn hàng {order.code}</h1>
        </div>

        {canCancelOrder(order.status) ? (
          <Button
            type="button"
            variant="danger"
            isLoading={isCancelling}
            onClick={() => void handleCancel()}
          >
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
          <span className="text-slate-600">Ngày đặt:</span>{' '}
          {new Date(order.created_at).toLocaleString('vi-VN')}
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
          <span className="text-slate-600">Người nhận:</span> {order.shipping.name}
        </p>
        <p>
          <span className="text-slate-600">Số điện thoại nhận hàng:</span> {order.shipping.phone}
        </p>
        <p className="sm:col-span-2">
          <span className="text-slate-600">Địa chỉ giao hàng:</span> {order.shipping.address}
        </p>
      </section>

      <OrderTimeline items={timeline} />
      <OrderItemsTable items={order.items ?? []} />
    </section>
  )
}
