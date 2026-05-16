import { useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/AuthContext'
import { EmptyState } from '@/components/ui/EmptyState'
import { PriceText } from '@/components/ui/PriceText'
import { getCheckoutSuccessOrder, setCheckoutSuccessOrder } from '@/lib/checkout-success'
import { getOrderStatusLabel, getPaymentMethodLabel, getPaymentStatusLabel } from '@/lib/display-labels'
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
    <section className="mx-auto max-w-2xl space-y-4 rounded-lg border border-slate-200 bg-white p-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Đặt hàng thành công</h1>
        <p className="text-sm text-slate-600">Đơn hàng của bạn đã được tạo trên hệ thống.</p>
      </header>

      <div className="grid grid-cols-1 gap-2 rounded border border-slate-200 bg-slate-50 p-4 text-sm sm:grid-cols-2">
        <p>
          <span className="text-slate-600">Mã đơn hàng:</span> <strong>{order.code}</strong>
        </p>
        <p>
          <span className="text-slate-600">Trạng thái đơn hàng:</span> <strong>{getOrderStatusLabel(order.status as OrderStatus)}</strong>
        </p>
        <p>
          <span className="text-slate-600">Phương thức thanh toán:</span> <strong>{getPaymentMethodLabel(order.payment_method)}</strong>
        </p>
        <p>
          <span className="text-slate-600">Trạng thái thanh toán:</span> <strong>{getPaymentStatusLabel(order.payment_status as PaymentStatus)}</strong>
        </p>
        <p className="sm:col-span-2">
          <span className="text-slate-600">Tổng tiền:</span>{' '}
          <strong>
            <PriceText value={order.total} />
          </strong>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          to={`/orders/lookup?order_code=${order.code}`}
          className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Tra cứu đơn hàng
        </Link>
        {isAuthenticated ? (
          <Link
            to={`/orders/${order.code}`}
            className="rounded bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900"
          >
            Xem đơn hàng của tôi
          </Link>
        ) : null}
        <Link to="/products" className="rounded bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900">
          Tiếp tục mua hàng
        </Link>
      </div>
    </section>
  )
}
