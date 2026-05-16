import { http } from '@/lib/http'
import type { WishlistListResult, WishlistToggleResult } from '@/types/wishlist'

export type WishlistTogglePayload = {
  product_id: number
}

export const wishlistApi = {
  async list(params?: { per_page?: number; page?: number }): Promise<WishlistListResult> {
    const response = await http.get('/wishlist', { params })
    const payload = response.data as {
      data?: WishlistListResult['data']
      meta?: WishlistListResult['meta']
    }

    return {
      data: payload.data ?? [],
      meta: payload.meta ?? {
        current_page: 1,
        per_page: params?.per_page ?? 12,
        total: 0,
        last_page: 1,
      },
    }
  },

  async toggle(payload: WishlistTogglePayload): Promise<WishlistToggleResult> {
    const response = await http.post('/wishlist/toggle', payload)
    const data = response.data as {
      action?: WishlistToggleResult['action']
      message?: string
      data?: WishlistToggleResult['data']
    }

    return {
      action: data.action ?? 'added',
      message: data.message ?? 'Đã cập nhật danh sách yêu thích',
      data: data.data ?? { product_id: payload.product_id },
    }
  },

  async remove(productId: number): Promise<{ message: string }> {
    const response = await http.delete(`/wishlist/${productId}`)
    const data = response.data as { message?: string }

    return {
      message: data.message ?? 'Đã xóa sản phẩm khỏi danh sách yêu thích',
    }
  },
}
