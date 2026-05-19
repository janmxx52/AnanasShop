import { http } from '@/lib/http'
import { getGuestToken } from '@/lib/storage'
import { extractResponseData } from '@/lib/api-helpers'
import type { Cart, CartItem } from '@/types/cart'

export type CartItemPayload = {
  product_variant_id: number
  quantity: number
}

export const cartApi = {
  async getCart(): Promise<Cart> {
    const response = await http.get('/cart')
    return extractResponseData<Cart>(response.data)
  },

  async addItem(payload: CartItemPayload): Promise<CartItem> {
    const response = await http.post('/cart/items', payload)
    return extractResponseData<CartItem>(response.data)
  },

  async updateItem(itemId: number, payload: { quantity: number }): Promise<CartItem | null> {
    const response = await http.put(`/cart/items/${itemId}`, payload)
    const data = response.data as Record<string, unknown>

    if (typeof data?.message === 'string' && data.message.includes('xóa sản phẩm khỏi giỏ hàng')) {
      return null
    }

    return extractResponseData<CartItem>(data)
  },

  async removeItem(itemId: number) {
    await http.delete(`/cart/items/${itemId}`)
  },

  async clearCart() {
    await http.delete('/cart')
  },

  async mergeGuestCart() {
    const response = await http.post(
      '/cart/merge',
      {},
      {
        headers: {
          'X-Guest-Token': getGuestToken() ?? '',
        },
      },
    )

    return response.data as {
      warnings?: string[]
      data?: Cart | null
    }
  },
}
