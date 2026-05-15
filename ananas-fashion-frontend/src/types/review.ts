import type { PaginatedResult } from '@/types/pagination'

export type ReviewImage = {
  id: number
  image_url: string
  sort_order: number | null
}

export type ReviewUser = {
  id: number
  name: string
  avatar: string | null
}

export type ReviewItem = {
  id: number
  product_id: number
  order_item_id: number
  rating: number
  comment: string | null
  is_approved: boolean
  images: ReviewImage[]
  user?: ReviewUser
  created_at: string
  updated_at: string
}

export type ReviewListResult = PaginatedResult<ReviewItem>

export type CreateReviewPayload = {
  order_item_id: number
  rating: number
  comment?: string
  images?: File[]
}
