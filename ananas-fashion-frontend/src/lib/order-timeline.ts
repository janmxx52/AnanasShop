import type { OrderTimelineItem } from '@/types/order'
import type { OrderStatus } from '@/types/order-status'

export function buildOrderTimeline(currentStatus: OrderStatus): OrderTimelineItem[] {
  const timelineStatuses =
    currentStatus === 'cancelled'
      ? ['pending', 'confirmed', 'processing', 'shipping', 'cancelled']
      : currentStatus === 'returned'
        ? ['pending', 'confirmed', 'processing', 'shipping', 'returned']
        : ['pending', 'confirmed', 'processing', 'shipping', 'delivered']

  let currentIndex = timelineStatuses.indexOf(currentStatus)
  if (currentIndex < 0) {
    timelineStatuses.push(currentStatus)
    currentIndex = timelineStatuses.length - 1
  }

  return timelineStatuses.map((status, index) => ({
    status: status as OrderStatus,
    state: index < currentIndex ? 'reached' : index === currentIndex ? 'current' : 'pending',
  }))
}
