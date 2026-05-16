import type { OrderStatus } from '@/types/order-status'
import { getOrderStatusLabel } from '@/lib/display-labels'

type OrderStatusBadgeProps = {
  status: OrderStatus
}

const statusClassMap: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipping: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  returned: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-rose-100 text-rose-800',
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${statusClassMap[status]}`}>
      {getOrderStatusLabel(status)}
    </span>
  )
}
