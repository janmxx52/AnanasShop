import { http } from '@/lib/http'
import type { ApiPaginatedEnvelope, ApiSuccessEnvelope } from '@/types/api'

export type ProductQuery = {
  search?: string
  category?: string
  brand?: string
  sort?: string
  page?: number
  per_page?: number
}

export const productApi = {
  list(params?: ProductQuery) {
    return http.get<ApiPaginatedEnvelope<unknown>>('/products', { params })
  },

  detail(slug: string) {
    return http.get<ApiSuccessEnvelope<unknown>>(`/products/${slug}`)
  },

  reviews(slug: string, params?: { page?: number; per_page?: number }) {
    return http.get<ApiPaginatedEnvelope<unknown>>(`/products/${slug}/reviews`, { params })
  },
}
