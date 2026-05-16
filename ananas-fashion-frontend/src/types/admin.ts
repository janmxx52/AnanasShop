import type { OrderStatus, PaymentStatus } from '@/types/order-status'
import type { PaginatedResult } from '@/types/pagination'

export type AdminCategory = {
  id: number
  parent_id: number | null
  name: string
  slug: string | null
  image: string | null
  description: string | null
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export type AdminBrand = {
  id: number
  name: string
  slug: string | null
  logo: string | null
  description: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export type AdminCategoryPayload = {
  parent_id?: number | null
  name: string
  slug?: string | null
  image?: string | null
  description?: string | null
  sort_order?: number | null
  is_active?: boolean
}

export type AdminBrandPayload = {
  name: string
  slug?: string | null
  logo?: string | null
  description?: string | null
  is_active?: boolean
}

export type AdminCategoryListResult = PaginatedResult<AdminCategory>
export type AdminBrandListResult = PaginatedResult<AdminBrand>

export type AdminProductRelation = {
  id: number | null
  name: string | null
}

export type AdminProduct = {
  id: number
  name: string
  slug: string
  description: string | null
  base_price: number
  sale_price: number | null
  is_featured: boolean
  is_active: boolean
  category?: AdminProductRelation | null
  brand?: AdminProductRelation | null
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
}

export type AdminProductPayload = {
  name: string
  slug?: string | null
  category_id: number
  brand_id: number
  description?: string | null
  base_price: number
  sale_price?: number | null
  is_active?: boolean
  is_featured?: boolean
}

export type AdminProductListParams = {
  q?: string
  category?: number | string
  brand?: number | string
  is_active?: boolean
  with_trashed?: boolean
  page?: number
  per_page?: number
}

export type AdminProductPaginatedResult = PaginatedResult<AdminProduct>

export type AdminProductVariant = {
  id: number
  product_id: number
  size: string
  color: string
  color_hex: string | null
  sku: string | null
  stock: number
  price_adjustment: number | null
  created_at: string | null
  updated_at: string | null
}

export type AdminProductVariantPayload = {
  size: string
  color: string
  color_hex?: string | null
  sku?: string | null
  stock: number
  price_adjustment?: number | null
}

export type AdminProductImage = {
  id: number
  image_url: string
  public_id: string | null
  sort_order: number
  is_primary: boolean
  created_at: string | null
  updated_at: string | null
}

export type AdminProductImageUploadPayload = {
  file: File
  is_primary?: boolean
  sort_order?: number
}

export type DashboardRecentOrder = {
  order_code: string
  status: OrderStatus
  payment_status: PaymentStatus
  total: number
  created_at: string
  customer_name: string | null
}

export type DashboardTopSellingProduct = {
  product_id: number
  product_name: string
  total_sold: number
  revenue: number
}

export type DashboardStats = {
  total_users: number
  total_products: number
  total_orders: number
  total_revenue: number
  pending_orders: number
  cancelled_orders: number
  delivered_orders: number
  low_stock_variants: number
  out_of_stock_variants: number
  total_reviews: number
  average_rating: number
  recent_orders: DashboardRecentOrder[]
  top_selling_products: DashboardTopSellingProduct[]
}
