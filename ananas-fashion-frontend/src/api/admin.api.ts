import { http } from '@/lib/http'
import { extractResponseData } from '@/lib/api-helpers'
import type { ApiPaginatedEnvelope, ApiSuccessEnvelope } from '@/types/api'
import type { PaginationMeta } from '@/types/pagination'
import type {
  AdminBrand,
  AdminBrandListResult,
  AdminBrandPayload,
  AdminCategory,
  AdminCategoryListResult,
  AdminCategoryPayload,
  AdminProduct,
  AdminProductListParams,
  AdminProductPaginatedResult,
  AdminProductPayload,
  DashboardStats,
} from '@/types/admin'

function extractPaginatedData<T>(payload: ApiPaginatedEnvelope<T> | unknown): { data: T[]; meta: PaginationMeta } {
  const envelope = payload as {
    data?: T[]
    meta?: PaginationMeta
  }

  return {
    data: envelope.data ?? [],
    meta: envelope.meta ?? {
      current_page: 1,
      per_page: 20,
      total: 0,
      last_page: 1,
    },
  }
}

export const adminApi = {
  async dashboardStats(): Promise<DashboardStats> {
    const response = await http.get<ApiSuccessEnvelope<DashboardStats>>('/admin/dashboard/stats')
    return extractResponseData<DashboardStats>(response.data)
  },

  async listCategories(params?: { page?: number; per_page?: number }): Promise<AdminCategoryListResult> {
    const response = await http.get<ApiPaginatedEnvelope<AdminCategory>>('/admin/categories', { params })
    return extractPaginatedData<AdminCategory>(response.data)
  },

  async getCategory(id: number): Promise<AdminCategory> {
    const response = await http.get<ApiSuccessEnvelope<AdminCategory>>(`/admin/categories/${id}`)
    return extractResponseData<AdminCategory>(response.data)
  },

  async createCategory(payload: AdminCategoryPayload): Promise<AdminCategory> {
    const response = await http.post<ApiSuccessEnvelope<AdminCategory>>('/admin/categories', payload)
    return extractResponseData<AdminCategory>(response.data)
  },

  async updateCategory(id: number, payload: Partial<AdminCategoryPayload>): Promise<AdminCategory> {
    const response = await http.put<ApiSuccessEnvelope<AdminCategory>>(`/admin/categories/${id}`, payload)
    return extractResponseData<AdminCategory>(response.data)
  },

  async deleteCategory(id: number): Promise<void> {
    await http.delete<ApiSuccessEnvelope<null>>(`/admin/categories/${id}`)
  },

  async listBrands(params?: { page?: number; per_page?: number }): Promise<AdminBrandListResult> {
    const response = await http.get<ApiPaginatedEnvelope<AdminBrand>>('/admin/brands', { params })
    return extractPaginatedData<AdminBrand>(response.data)
  },

  async getBrand(id: number): Promise<AdminBrand> {
    const response = await http.get<ApiSuccessEnvelope<AdminBrand>>(`/admin/brands/${id}`)
    return extractResponseData<AdminBrand>(response.data)
  },

  async createBrand(payload: AdminBrandPayload): Promise<AdminBrand> {
    const response = await http.post<ApiSuccessEnvelope<AdminBrand>>('/admin/brands', payload)
    return extractResponseData<AdminBrand>(response.data)
  },

  async updateBrand(id: number, payload: Partial<AdminBrandPayload>): Promise<AdminBrand> {
    const response = await http.put<ApiSuccessEnvelope<AdminBrand>>(`/admin/brands/${id}`, payload)
    return extractResponseData<AdminBrand>(response.data)
  },

  async deleteBrand(id: number): Promise<void> {
    await http.delete<ApiSuccessEnvelope<null>>(`/admin/brands/${id}`)
  },

  async listProducts(params?: AdminProductListParams): Promise<AdminProductPaginatedResult> {
    const response = await http.get<ApiPaginatedEnvelope<AdminProduct>>('/admin/products', { params })
    return extractPaginatedData<AdminProduct>(response.data)
  },

  async getProduct(id: number): Promise<AdminProduct> {
    const response = await http.get<ApiSuccessEnvelope<AdminProduct>>(`/admin/products/${id}`)
    return extractResponseData<AdminProduct>(response.data)
  },

  async createProduct(payload: AdminProductPayload): Promise<AdminProduct> {
    const response = await http.post<ApiSuccessEnvelope<AdminProduct>>('/admin/products', payload)
    return extractResponseData<AdminProduct>(response.data)
  },

  async updateProduct(id: number, payload: Partial<AdminProductPayload>): Promise<AdminProduct> {
    const response = await http.put<ApiSuccessEnvelope<AdminProduct>>(`/admin/products/${id}`, payload)
    return extractResponseData<AdminProduct>(response.data)
  },

  async deleteProduct(id: number): Promise<void> {
    await http.delete<ApiSuccessEnvelope<null>>(`/admin/products/${id}`)
  },

  async restoreProduct(id: number): Promise<AdminProduct> {
    const response = await http.post<ApiSuccessEnvelope<AdminProduct>>(`/admin/products/${id}/restore`)
    return extractResponseData<AdminProduct>(response.data)
  },

  async updateProductStatus(id: number, isActive: boolean): Promise<AdminProduct> {
    const response = await http.patch<ApiSuccessEnvelope<AdminProduct>>(`/admin/products/${id}/status`, {
      is_active: isActive,
    })
    return extractResponseData<AdminProduct>(response.data)
  },

  categories(params?: { page?: number; per_page?: number }) {
    return http.get<ApiPaginatedEnvelope<unknown>>('/admin/categories', { params })
  },

  brands(params?: { page?: number; per_page?: number }) {
    return http.get<ApiPaginatedEnvelope<unknown>>('/admin/brands', { params })
  },

  products(params?: Record<string, unknown>) {
    return http.get<ApiPaginatedEnvelope<unknown>>('/admin/products', { params })
  },

  variants(productId: number) {
    return http.get<ApiSuccessEnvelope<unknown>>(`/admin/products/${productId}/variants`)
  },

  images(productId: number) {
    return http.get<ApiSuccessEnvelope<unknown>>(`/admin/products/${productId}/images`)
  },

  orders(params?: { page?: number; per_page?: number }) {
    return http.get<ApiPaginatedEnvelope<unknown>>('/admin/orders', { params })
  },

  orderDetail(orderCode: string) {
    return http.get<ApiSuccessEnvelope<unknown>>(`/admin/orders/${orderCode}`)
  },

  updateOrderStatus(orderCode: string, status: string) {
    return http.patch<ApiSuccessEnvelope<unknown>>(`/admin/orders/${orderCode}/status`, { status })
  },

  vouchers(params?: { page?: number; per_page?: number }) {
    return http.get<ApiPaginatedEnvelope<unknown>>('/admin/vouchers', { params })
  },
}
