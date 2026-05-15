import type { PaymentStatus } from '@/types/order-status'

type PaymentStatusBadgeProps = {
  status: PaymentStatus
}

const statusClassMap: Record<PaymentStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  paid: 'bg-emerald-100 text-emerald-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-rose-100 text-rose-800',
  refunded: 'bg-purple-100 text-purple-800',
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <span className={`inline-flex rounded px-2 py-1 text-xs font-medium ${statusClassMap[status]}`}>
      {status}
    </span>
  )
}
