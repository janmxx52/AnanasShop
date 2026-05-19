import { useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/AuthContext'
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps'
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge'
import { PaymentStatusBadge } from '@/components/order/PaymentStatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { PriceText } from '@/components/ui/PriceText'
import { getCheckoutSuccessOrder, setCheckoutSuccessOrder } from '@/lib/checkout-success'
import { getPaymentMethodLabel } from '@/lib/display-labels'
import type { CheckoutResult } from '@/types/order'
import type { OrderStatus, PaymentStatus } from '@/types/order-status'

type LocationState = {
  order?: CheckoutResult
}

export function OrderSuccessPage() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const locationState = location.state as LocationState | null
  const orderFromState = locationState?.order

  const order = useMemo(() => {
    return orderFromState ?? getCheckoutSuccessOrder()
  }, [orderFromState])

  useEffect(() => {
    if (!orderFromState) {
      return
    }

    setCheckoutSuccessOrder(orderFromState)
  }, [orderFromState])

  if (!order) {
    return (
      <EmptyState title="Không tìm thấy kết quả thanh toán" description="Vui lòng thực hiện thanh toán trước." />
    )
  }

  return (
    <section className="mx-auto max-w-3xl space-y-5">
      <CheckoutSteps current="success" />

      <div className="space-y-5 border border-neutral-200 bg-white p-6">
        <div className="flex flex-col items-center gap-3 border-b border-neutral-200 pb-5 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold uppercase tracking-[0.08em] text-neutral-900">Đặt hàng thành công</h1>
            <p className="text-sm text-neutral-600">Đơn hàng của bạn đã được ghi nhận trên hệ thống.</p>
          </div>
        </div>

        <div className="grid gap-3 rounded border border-neutral-200 bg-neutral-50 p-4 text-sm md:grid-cols-2">
          <p>
            <span className="text-neutral-600">Mã đơn hàng:</span> <strong>{order.code}</strong>
          </p>
          <p className="flex items-center gap-2">
            <span className="text-neutral-600">Trạng thái đơn:</span>{' '}
            <OrderStatusBadge status={order.status as OrderStatus} />
          </p>
          <p>
            <span className="text-neutral-600">Phương thức thanh toán:</span>{' '}
            <strong>{getPaymentMethodLabel(order.payment_method)}</strong>
          </p>
          <p className="flex items-center gap-2">
            <span className="text-neutral-600">Trạng thái thanh toán:</span>{' '}
            <PaymentStatusBadge status={order.payment_status as PaymentStatus} />
          </p>
          <p className="md:col-span-2">
            <span className="text-neutral-600">Tổng thanh toán:</span>{' '}
            <strong className="text-base text-neutral-900">
              <PriceText value={order.total} />
            </strong>
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Link
            to={`/orders/lookup?order_code=${order.code}`}
            className="inline-flex h-11 items-center justify-center bg-neutral-900 px-4 text-sm font-semibold text-white transition hover:bg-black"
          >
            Tra cứu đơn hàng
          </Link>
          {isAuthenticated ? (
            <Link
              to={`/orders/${order.code}`}
              className="inline-flex h-11 items-center justify-center border border-neutral-900 px-4 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
            >
              Xem đơn hàng của tôi
            </Link>
          ) : null}
          <Link
            to="/products"
            className="inline-flex h-11 items-center justify-center border border-neutral-300 px-4 text-sm font-semibold text-neutral-700 transition hover:border-neutral-400 hover:text-neutral-900 sm:col-span-2"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </section>
  )
}
