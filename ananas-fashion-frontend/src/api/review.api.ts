import { http } from '@/lib/http'
import type { ApiPaginatedEnvelope, ApiSuccessEnvelope } from '@/types/api'

export type CreateReviewPayload = {
  order_item_id: number
  rating: number
  comment?: string
  images?: File[]
}

export const reviewApi = {
  listByProduct(slug: string, params?: { page?: number; per_page?: number }) {
    return http.get<ApiPaginatedEnvelope<unknown>>(`/products/${slug}/reviews`, { params })
  },

  createForProduct(slug: string, payload: FormData | CreateReviewPayload) {
    return http.post<ApiSuccessEnvelope<unknown>>(`/products/${slug}/reviews`, payload)
  },

  remove(reviewId: number) {
    return http.delete<ApiSuccessEnvelope<unknown>>(`/reviews/${reviewId}`)
  },
}
