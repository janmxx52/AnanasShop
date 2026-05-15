import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { orderApi } from '@/api/order.api'
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge'
import { PaymentStatusBadge } from '@/components/order/PaymentStatusBadge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PriceText } from '@/components/ui/PriceText'
import { getApiErrorInfo } from '@/lib/api-helpers'
import type { OrderSummary } from '@/types/order'
import type { PaginationMeta } from '@/types/pagination'

const EMPTY_META: PaginationMeta = {
  current_page: 1,
  per_page: 15,
  total: 0,
  last_page: 1,
}

export function UserOrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(EMPTY_META)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const response = await orderApi.list({ page, per_page: 10 })
        setOrders(response.data)
        setMeta(response.meta)
      } catch (error) {
        const apiError = getApiErrorInfo(error)
        setErrorMessage(apiError.message)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchOrders()
  }, [page])

  if (isLoading) {
    return <LoadingState message="Loading your orders..." />
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} />
  }

  if (orders.length === 0) {
    return <EmptyState title="No orders yet" description="You have not placed any order." />
  }

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">My Orders</h1>
        <p className="text-sm text-slate-600">View and track your order history.</p>
      </header>

      <div className="space-y-3">
        {orders.map((order) => (
          <article key={order.id} className="space-y-2 rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="space-y-1">
                <p className="text-sm text-slate-600">Order code</p>
                <p className="text-base font-semibold text-slate-900">{order.code}</p>
              </div>
              <div className="flex items-center gap-2">
                <OrderStatusBadge status={order.status} />
                <PaymentStatusBadge status={order.payment_status} />
              </div>
            </div>

            <div className="grid gap-1 text-sm text-slate-700 sm:grid-cols-3">
              <p>Total: <PriceText value={order.total} /></p>
              <p>Payment: {order.payment_method}</p>
              <p>Date: {new Date(order.created_at).toLocaleString('vi-VN')}</p>
            </div>

            <Link to={`/orders/${order.code}`} className="inline-block text-sm font-medium text-slate-900 underline">
              View detail
            </Link>
          </article>
        ))}
      </div>

      {meta.last_page > 1 ? (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">
            Page {meta.current_page} / {meta.last_page}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={meta.current_page <= 1}
              onClick={() => setPage((previous) => Math.max(previous - 1, 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => setPage((previous) => Math.min(previous + 1, meta.last_page))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
