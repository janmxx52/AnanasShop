import type { OrderStatus, PaymentStatus } from '@/types/order-status'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipping: 'Đang giao hàng',
  delivered: 'Đã giao hàng',
  cancelled: 'Đã hủy',
  returned: 'Đã trả hàng',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thanh toán thất bại',
  cancelled: 'Đã hủy',
  refunded: 'Đã hoàn tiền',
}

export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_LABELS[status] ?? status
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  return PAYMENT_STATUS_LABELS[status] ?? status
}

export function getPaymentMethodLabel(method: string | null | undefined): string {
  if (!method) {
    return 'Không xác định'
  }

  if (method.toLowerCase() === 'cod') {
    return 'Thanh toán khi nhận hàng'
  }

  return method
}
