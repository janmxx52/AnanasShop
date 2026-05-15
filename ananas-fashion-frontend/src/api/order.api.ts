import { http } from '@/lib/http'
import { extractResponseData } from '@/lib/api-helpers'
import type {
  CheckoutResult,
  GuestCheckoutPayload,
  OrderSummary,
  UserCheckoutPayload,
} from '@/types/order'
import type { PaginatedResult } from '@/types/pagination'

export type OrderLookupPayload = {
  order_code: string
  email?: string
  phone?: string
}

export const orderApi = {
  async guestCheckout(payload: GuestCheckoutPayload): Promise<CheckoutResult> {
    const response = await http.post('/checkout/guest', payload)
    return extractResponseData<CheckoutResult>(response.data)
  },

  async userCheckout(payload: UserCheckoutPayload): Promise<CheckoutResult> {
    const response = await http.post('/orders', payload)
    return extractResponseData<CheckoutResult>(response.data)
  },

  async list(params?: { page?: number; per_page?: number }): Promise<PaginatedResult<OrderSummary>> {
    const response = await http.get('/orders', { params })
    const payload = response.data as {
      data?: OrderSummary[]
      meta?: PaginatedResult<OrderSummary>['meta']
    }

    return {
      data: payload.data ?? [],
      meta: payload.meta ?? {
        current_page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
      },
    }
  },

  async detail(orderCode: string): Promise<OrderSummary> {
    const response = await http.get(`/orders/${orderCode}`)
    return extractResponseData<OrderSummary>(response.data)
  },

  async cancel(orderCode: string): Promise<OrderSummary> {
    const response = await http.post(`/orders/${orderCode}/cancel`)
    return extractResponseData<OrderSummary>(response.data)
  },

  lookup(payload: OrderLookupPayload) {
    return http.post('/orders/lookup', payload)
  },
}
