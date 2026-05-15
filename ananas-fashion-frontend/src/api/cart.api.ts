import { http } from '@/lib/http'
import { getGuestToken } from '@/lib/storage'
import type { ApiSuccessEnvelope } from '@/types/api'

export type CartItemPayload = {
  product_variant_id: number
  quantity: number
}

export const cartApi = {
  getCart() {
    return http.get<ApiSuccessEnvelope<unknown>>('/cart')
  },

  addItem(payload: CartItemPayload) {
    return http.post<ApiSuccessEnvelope<unknown>>('/cart/items', payload)
  },

  updateItem(itemId: number, payload: { quantity: number }) {
    return http.put<ApiSuccessEnvelope<unknown>>(`/cart/items/${itemId}`, payload)
  },

  removeItem(itemId: number) {
    return http.delete<ApiSuccessEnvelope<unknown>>(`/cart/items/${itemId}`)
  },

  clearCart() {
    return http.delete<ApiSuccessEnvelope<unknown>>('/cart')
  },

  mergeGuestCart() {
    return http.post<ApiSuccessEnvelope<unknown>>(
      '/cart/merge',
      {},
      {
        headers: {
          'X-Guest-Token': getGuestToken() ?? '',
        },
      },
    )
  },
}
