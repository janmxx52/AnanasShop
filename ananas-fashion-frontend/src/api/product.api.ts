import { http } from '@/lib/http'
import type { PaginationMeta, PaginatedResult } from '@/types/pagination'
import type { ProductLite } from '@/types/product'

export type ProductQuery = {
  q?: string
  search?: string
  category?: string
  brand?: string
  min_price?: number
  max_price?: number
  size?: string
  color?: string
  sort?: string
  page?: number
  per_page?: number
}

const DEFAULT_META: PaginationMeta = {
  current_page: 1,
  per_page: 12,
  total: 0,
  last_page: 1,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function extractProductFromPayload(payload: unknown): ProductLite {
  if (isRecord(payload) && 'data' in payload && isRecord(payload.data)) {
    return payload.data as ProductLite
  }

  return payload as ProductLite
}

export const productApi = {
  async list(params?: ProductQuery): Promise<PaginatedResult<ProductLite>> {
    const requestParams = {
      ...params,
      q: params?.q ?? params?.search ?? undefined,
    }

    const response = await http.get('/products', {
      params: requestParams,
    })

    const payload = response.data as Record<string, unknown>

    return {
      data: (Array.isArray(payload?.data) ? payload.data : []) as ProductLite[],
      meta: (isRecord(payload?.meta) ? payload.meta : DEFAULT_META) as PaginationMeta,
    }
  },

  async detail(slug: string): Promise<ProductLite> {
    const response = await http.get(`/products/${slug}`)
    return extractProductFromPayload(response.data)
  },

  reviews(slug: string, params?: { page?: number; per_page?: number }) {
    return http.get(`/products/${slug}/reviews`, { params })
  },
}
