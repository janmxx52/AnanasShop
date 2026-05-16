import type { OrderTimelineItem } from '@/types/order'
import { getOrderStatusLabel } from '@/lib/display-labels'

type OrderTimelineProps = {
  items: OrderTimelineItem[]
}

function getStateClassName(state: OrderTimelineItem['state']) {
  if (state === 'current') {
    return 'bg-slate-900 text-white border-slate-900'
  }

  if (state === 'reached') {
    return 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }

  return 'bg-slate-100 text-slate-500 border-slate-200'
}

export function OrderTimeline({ items }: OrderTimelineProps) {
  if (!items || items.length === 0) {
    return null
  }

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-900">Lịch sử trạng thái</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={`${item.status}-${item.state}`}
            className={`inline-flex rounded border px-2 py-1 text-xs font-medium ${getStateClassName(item.state)}`}
          >
            {getOrderStatusLabel(item.status)}
          </span>
        ))}
      </div>
    </section>
  )
}
