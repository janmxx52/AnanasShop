export type ProductImage = {
  id: number
  url: string
  is_primary: boolean
  sort_order?: number
}

export type ProductVariant = {
  id: number
  size: string
  color: string
  color_hex: string | null
  sku: string
  stock: number
  price: number
}

export type ProductLite = {
  id: number
  name: string
  slug: string
  description: string | null
  base_price: number
  sale_price: number | null
  is_active: boolean
  rating_avg: number | null
  review_count: number
  variants?: ProductVariant[]
  images?: ProductImage[]
}
