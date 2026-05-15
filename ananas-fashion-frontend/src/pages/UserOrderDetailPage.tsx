import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { orderApi } from '@/api/order.api'
import { OrderItemsTable } from '@/components/order/OrderItemsTable'
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge'
import { OrderTimeline } from '@/components/order/OrderTimeline'
import { PaymentStatusBadge } from '@/components/order/PaymentStatusBadge'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PriceText } from '@/components/ui/PriceText'
import { getApiErrorInfo } from '@/lib/api-helpers'
import { buildOrderTimeline } from '@/lib/order-timeline'
import type { OrderSummary } from '@/types/order'

function canCancelOrder(status: OrderSummary['status']) {
  return status === 'pending' || status === 'confirmed'
}

export function UserOrderDetailPage() {
  const { orderCode } = useParams<{ orderCode: string }>()

  const [order, setOrder] = useState<OrderSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderCode) {
        setErrorMessage('Order code is missing.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setErrorMessage(null)

      try {
        const response = await orderApi.detail(orderCode)
        setOrder(response)
      } catch (error) {
        const apiError = getApiErrorInfo(error)
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
    setActionMessage(null)

    try {
      await orderApi.cancel(order.code)
      const refreshedOrder = await orderApi.detail(order.code)
      setOrder(refreshedOrder)
      setActionMessage('Order cancelled successfully.')
    } catch (error) {
      const apiError = getApiErrorInfo(error)
      setActionMessage(apiError.message)
    } finally {
      setIsCancelling(false)
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading order detail..." />
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} />
  }

  if (!order) {
    return <ErrorState message="Order not found." />
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <Link to="/orders" className="text-sm text-slate-600 hover:text-slate-900">
            ← Back to orders
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900">Order {order.code}</h1>
        </div>

        {canCancelOrder(order.status) ? (
          <Button
            type="button"
            variant="danger"
            isLoading={isCancelling}
            onClick={() => void handleCancel()}
          >
            Cancel order
          </Button>
        ) : null}
      </header>

      {actionMessage ? (
        <p className="rounded border border-slate-200 bg-white p-3 text-sm text-slate-700">{actionMessage}</p>
      ) : null}

      <section className="grid gap-2 rounded-lg border border-slate-200 bg-white p-4 text-sm sm:grid-cols-2">
        <p>
          <span className="text-slate-600">Order status:</span> <OrderStatusBadge status={order.status} />
        </p>
        <p>
          <span className="text-slate-600">Payment status:</span>{' '}
          <PaymentStatusBadge status={order.payment_status} />
        </p>
        <p>
          <span className="text-slate-600">Payment method:</span> {order.payment_method}
        </p>
        <p>
          <span className="text-slate-600">Date:</span>{' '}
          {new Date(order.created_at).toLocaleString('vi-VN')}
        </p>
        <p>
          <span className="text-slate-600">Subtotal:</span> <PriceText value={order.subtotal} />
        </p>
        <p>
          <span className="text-slate-600">Discount:</span> <PriceText value={order.discount_amount} />
        </p>
        <p>
          <span className="text-slate-600">Shipping fee:</span> <PriceText value={order.shipping_fee} />
        </p>
        <p>
          <span className="text-slate-600">Total:</span> <PriceText value={order.total} />
        </p>
        <p>
          <span className="text-slate-600">Shipping name:</span> {order.shipping.name}
        </p>
        <p>
          <span className="text-slate-600">Shipping phone:</span> {order.shipping.phone}
        </p>
        <p className="sm:col-span-2">
          <span className="text-slate-600">Shipping address:</span> {order.shipping.address}
        </p>
      </section>

      <OrderTimeline items={timeline} />
      <OrderItemsTable items={order.items ?? []} />
    </section>
  )
}
