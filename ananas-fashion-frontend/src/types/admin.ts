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
