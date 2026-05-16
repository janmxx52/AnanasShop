import { http } from '@/lib/http'
import { extractResponseData } from '@/lib/api-helpers'
import type { CreateReviewPayload, ReviewItem, ReviewListResult } from '@/types/review'

export const reviewApi = {
  async listByProduct(slug: string, params?: { page?: number; per_page?: number }): Promise<ReviewListResult> {
    const response = await http.get(`/products/${slug}/reviews`, { params })
    const payload = response.data as {
      data?: ReviewItem[]
      meta?: ReviewListResult['meta']
    }

    return {
      data: payload.data ?? [],
      meta: payload.meta ?? {
        current_page: 1,
        per_page: params?.per_page ?? 10,
        total: 0,
        last_page: 1,
      },
    }
  },

  async createForProduct(slug: string, payload: FormData | CreateReviewPayload): Promise<ReviewItem> {
    const response = await http.post(`/products/${slug}/reviews`, payload)
    return extractResponseData<ReviewItem>(response.data)
  },

  async remove(reviewId: number): Promise<{ message: string }> {
    const response = await http.delete(`/reviews/${reviewId}`)
    const data = response.data as { message?: string }

    return {
      message: data.message ?? 'Đã xóa đánh giá',
    }
  },
}
