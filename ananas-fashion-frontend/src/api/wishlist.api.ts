import { http } from '@/lib/http'
import type { ApiPaginatedEnvelope, ApiSuccessEnvelope } from '@/types/api'

export type WishlistTogglePayload = {
  product_id: number
}

export const wishlistApi = {
  list(params?: { per_page?: number; page?: number }) {
    return http.get<ApiPaginatedEnvelope<unknown>>('/wishlist', { params })
  },

  toggle(payload: WishlistTogglePayload) {
    return http.post<ApiSuccessEnvelope<unknown>>('/wishlist/toggle', payload)
  },

  remove(productId: number) {
    return http.delete<ApiSuccessEnvelope<unknown>>(`/wishlist/${productId}`)
  },
}
