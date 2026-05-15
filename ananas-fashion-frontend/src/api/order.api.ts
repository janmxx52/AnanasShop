import { http } from '@/lib/http'
import type { ApiPaginatedEnvelope, ApiSuccessEnvelope } from '@/types/api'

export type GuestCheckoutPayload = {
  full_name: string
  email: string
  phone: string
  shipping_address: string
  voucher_code?: string
  payment_method: 'cod'
}

export type UserCheckoutPayload = {
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  voucher_code?: string
  payment_method: 'cod'
}

export type OrderLookupPayload = {
  order_code: string
  email?: string
  phone?: string
}

export const orderApi = {
  guestCheckout(payload: GuestCheckoutPayload) {
    return http.post<ApiSuccessEnvelope<unknown>>('/checkout/guest', payload)
  },

  userCheckout(payload: UserCheckoutPayload) {
    return http.post<ApiSuccessEnvelope<unknown>>('/orders', payload)
  },

  list() {
    return http.get<ApiPaginatedEnvelope<unknown>>('/orders')
  },

  detail(orderCode: string) {
    return http.get<ApiSuccessEnvelope<unknown>>(`/orders/${orderCode}`)
  },

  cancel(orderCode: string) {
    return http.post<ApiSuccessEnvelope<unknown>>(`/orders/${orderCode}/cancel`)
  },

  lookup(payload: OrderLookupPayload) {
    return http.post<ApiSuccessEnvelope<unknown>>('/orders/lookup', payload)
  },
}
