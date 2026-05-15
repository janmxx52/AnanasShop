import type { PaginatedResult } from '@/types/pagination'

export type WishlistProduct = {
  id: number
  name: string
  slug: string
  base_price: number
  sale_price: number | null
  is_active: boolean
  primary_image: string | null
}

export type WishlistItem = {
  id: number
  product_id: number
  created_at: string
  product: WishlistProduct | null
}

export type WishlistToggleResult = {
  action: 'added' | 'removed'
  message: string
  data: WishlistItem | { product_id: number }
}

export type WishlistListResult = PaginatedResult<WishlistItem>
