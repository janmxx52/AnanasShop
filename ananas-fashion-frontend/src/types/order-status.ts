export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipping'
  | 'delivered'
  | 'returned'
  | 'cancelled'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded'
