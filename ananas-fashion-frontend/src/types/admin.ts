import type { OrderStatus, PaymentStatus } from '@/types/order-status'

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
