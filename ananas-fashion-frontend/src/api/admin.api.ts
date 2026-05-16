import { http } from '@/lib/http'
import { extractResponseData } from '@/lib/api-helpers'
import type { ApiPaginatedEnvelope, ApiSuccessEnvelope } from '@/types/api'
import type { DashboardStats } from '@/types/admin'

export const adminApi = {
  async dashboardStats(): Promise<DashboardStats> {
    const response = await http.get<ApiSuccessEnvelope<DashboardStats>>('/admin/dashboard/stats')
    return extractResponseData<DashboardStats>(response.data)
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
