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

export type AdminVoucherType = 'percent' | 'fixed'

export type AdminVoucher = {
  id: number
  code: string
  type: AdminVoucherType
  value: number
  min_order_amount: number | null
  max_discount: number | null
  usage_limit: number | null
  usage_per_user: number | null
  used_count: number
  starts_at: string | null
  expires_at: string | null
  is_active: boolean
  created_at: string | null
  updated_at: string | null
}

export type AdminVoucherPayload = {
  code: string
  type: AdminVoucherType
  value: number
  min_order_amount?: number | null
  max_discount?: number | null
  usage_limit?: number | null
  usage_per_user?: number | null
  starts_at?: string | null
  expires_at?: string | null
  is_active?: boolean
}

export type AdminVoucherListParams = {
  page?: number
  per_page?: number
}

export type AdminVoucherPaginatedResult = PaginatedResult<AdminVoucher>

export type AdminOrderItem = {
  id: number
  product_id: number | null
  product_variant_id: number | null
  product_name: string
  variant_name: string
  sku: string
  image_url: string | null
  unit_price: number
  quantity: number
  line_total: number
  variant_info: Record<string, unknown> | null
}

export type AdminOrder = {
  id: number
  code: string
  status: OrderStatus
  subtotal: number
  discount_amount: number
  shipping_fee: number
  total: number
  payment_method: string
  payment_status: PaymentStatus
  voucher_code: string | null
  customer: {
    user_id: number | null
    guest_name: string | null
    guest_email: string | null
  }
  shipping: {
    name: string
    phone: string
    address: string
  }
  note: string | null
  items?: AdminOrderItem[]
  created_at: string
}

export type AdminOrderListParams = {
  page?: number
  per_page?: number
  q?: string
  status?: OrderStatus
  payment_status?: PaymentStatus
}

export type AdminOrderStatusUpdatePayload = {
  status: OrderStatus
}

export type AdminOrderPaginatedResult = PaginatedResult<AdminOrder>

export type AdminUserRole = 'customer' | 'admin'

export type AdminUser = {
  id: number
  name: string
  email: string
  phone: string | null
  role: AdminUserRole
  is_banned: boolean
  created_at: string | null
  updated_at: string | null
  deleted_at: string | null
}

export type AdminUserPayload = {
  name: string
  email: string
  phone?: string | null
  role: AdminUserRole
  is_banned?: boolean
  password?: string
}

export type AdminUserListParams = {
  page?: number
  per_page?: number
  q?: string
  role?: AdminUserRole
  is_banned?: boolean
  with_trashed?: boolean
}

export type AdminUserPaginatedResult = PaginatedResult<AdminUser>

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
  image_url?: string | null
}

export type AdminDashboardStats = {
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

export type DashboardAnalyticsMetrics = {
  today_revenue: number
  this_month_revenue: number
  last_month_revenue: number
  revenue_growth_percent: number
  order_growth_percent: number
  customer_growth_percent: number
}

export type DashboardRevenueChart = {
  range: '12m'
  labels: string[]
  series: number[]
}

export type DashboardOrderChart = {
  range: '12m'
  labels: string[]
  series: number[]
}

export type DashboardOrderStatus = {
  pending: number
  confirmed: number
  processing: number
  shipping: number
  delivered: number
  cancelled: number
  returned: number
}

export type DashboardInventory = {
  in_stock: number
  low_stock: number
  out_of_stock: number
}

export type AdminDashboardAnalytics = {
  metrics: DashboardAnalyticsMetrics
  revenue_chart: DashboardRevenueChart
  order_chart: DashboardOrderChart
  order_status: DashboardOrderStatus
  inventory: DashboardInventory
  recent_orders: DashboardRecentOrder[]
  top_selling_products: DashboardTopSellingProduct[]
}

export type DashboardStats = AdminDashboardStats
