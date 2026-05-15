import type { OrderStatus, PaymentStatus } from '@/types/order-status'

export type OrderItem = {
  id: number
  product_id: number | null
  product_variant_id: number | null
  product_name: string
  variant_name: string
  sku: string
  image_url: string | null
  unit_price: number
  quantity: number
  line_total: number
  variant_info: Record<string, unknown> | null
}

export type OrderSummary = {
  id: number
  code: string
  status: OrderStatus
  subtotal: number
  discount_amount: number
  shipping_fee: number
  total: number
  payment_method: 'cod' | string
  payment_status: PaymentStatus
  voucher_code: string | null
  customer: {
    user_id: number | null
    guest_name: string | null
    guest_email: string | null
  }
  shipping: {
    name: string
    phone: string
    address: string
  }
  note: string | null
  items?: OrderItem[]
  created_at: string
}

export type CheckoutResult = OrderSummary

export type GuestCheckoutPayload = {
  full_name: string
  email: string
  phone: string
  shipping_address: string
  voucher_code?: string
  payment_method: 'cod'
  note?: string
}

export type UserCheckoutPayload = {
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  voucher_code?: string
  payment_method: 'cod'
  note?: string
}
