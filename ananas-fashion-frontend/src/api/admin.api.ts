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
  AdminOrder,
  AdminOrderListParams,
  AdminOrderPaginatedResult,
  AdminOrderStatusUpdatePayload,
  AdminProduct,
  AdminProductImage,
  AdminProductImageUploadPayload,
  AdminProductListParams,
  AdminProductPaginatedResult,
  AdminProductPayload,
  AdminProductVariant,
  AdminProductVariantPayload,
  AdminVoucher,
  AdminVoucherListParams,
  AdminVoucherPaginatedResult,
  AdminVoucherPayload,
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

  async listProductVariants(
    productId: number,
    params?: { page?: number; per_page?: number },
  ): Promise<{ data: AdminProductVariant[]; meta: PaginationMeta }> {
    const response = await http.get<ApiPaginatedEnvelope<AdminProductVariant>>(
      `/admin/products/${productId}/variants`,
      { params },
    )
    return extractPaginatedData<AdminProductVariant>(response.data)
  },

  async createProductVariant(productId: number, payload: AdminProductVariantPayload): Promise<AdminProductVariant> {
    const response = await http.post<ApiSuccessEnvelope<AdminProductVariant>>(
      `/admin/products/${productId}/variants`,
      payload,
    )
    return extractResponseData<AdminProductVariant>(response.data)
  },

  async updateProductVariant(
    productId: number,
    variantId: number,
    payload: Partial<AdminProductVariantPayload>,
  ): Promise<AdminProductVariant> {
    const response = await http.put<ApiSuccessEnvelope<AdminProductVariant>>(
      `/admin/products/${productId}/variants/${variantId}`,
      payload,
    )
    return extractResponseData<AdminProductVariant>(response.data)
  },

  async deleteProductVariant(productId: number, variantId: number): Promise<void> {
    await http.delete<ApiSuccessEnvelope<null>>(`/admin/products/${productId}/variants/${variantId}`)
  },

  async listProductImages(productId: number): Promise<AdminProductImage[]> {
    const response = await http.get<ApiSuccessEnvelope<AdminProductImage[]>>(`/admin/products/${productId}/images`)
    return extractResponseData<AdminProductImage[]>(response.data)
  },

  async uploadProductImage(productId: number, payload: AdminProductImageUploadPayload): Promise<AdminProductImage> {
    const formData = new FormData()
    formData.append('file', payload.file)

    if (typeof payload.sort_order === 'number') {
      formData.append('sort_order', String(payload.sort_order))
    }

    if (typeof payload.is_primary === 'boolean') {
      formData.append('is_primary', payload.is_primary ? '1' : '0')
    }

    const response = await http.post<ApiSuccessEnvelope<AdminProductImage>>(
      `/admin/products/${productId}/images`,
      formData,
    )

    return extractResponseData<AdminProductImage>(response.data)
  },

  async deleteProductImage(productId: number, imageId: number): Promise<void> {
    await http.delete<ApiSuccessEnvelope<null>>(`/admin/products/${productId}/images/${imageId}`)
  },

  async setPrimaryProductImage(productId: number, imageId: number): Promise<AdminProductImage> {
    const response = await http.patch<ApiSuccessEnvelope<AdminProductImage>>(
      `/admin/products/${productId}/images/${imageId}/primary`,
    )
    return extractResponseData<AdminProductImage>(response.data)
  },

  async listVouchers(params?: AdminVoucherListParams): Promise<AdminVoucherPaginatedResult> {
    const response = await http.get<ApiPaginatedEnvelope<AdminVoucher>>('/admin/vouchers', { params })
    return extractPaginatedData<AdminVoucher>(response.data)
  },

  async getVoucher(id: number): Promise<AdminVoucher> {
    const response = await http.get<ApiSuccessEnvelope<AdminVoucher>>(`/admin/vouchers/${id}`)
    return extractResponseData<AdminVoucher>(response.data)
  },

  async createVoucher(payload: AdminVoucherPayload): Promise<AdminVoucher> {
    const response = await http.post<ApiSuccessEnvelope<AdminVoucher>>('/admin/vouchers', payload)
    return extractResponseData<AdminVoucher>(response.data)
  },

  async updateVoucher(id: number, payload: Partial<AdminVoucherPayload>): Promise<AdminVoucher> {
    const response = await http.put<ApiSuccessEnvelope<AdminVoucher>>(`/admin/vouchers/${id}`, payload)
    return extractResponseData<AdminVoucher>(response.data)
  },

  async deleteVoucher(id: number): Promise<void> {
    await http.delete<ApiSuccessEnvelope<null>>(`/admin/vouchers/${id}`)
  },

  async listOrders(params?: AdminOrderListParams): Promise<AdminOrderPaginatedResult> {
    const response = await http.get<ApiPaginatedEnvelope<AdminOrder>>('/admin/orders', {
      params: {
        page: params?.page,
        per_page: params?.per_page,
      },
    })
    return extractPaginatedData<AdminOrder>(response.data)
  },

  async getOrder(orderCode: string): Promise<AdminOrder> {
    const response = await http.get<ApiSuccessEnvelope<AdminOrder>>(`/admin/orders/${orderCode}`)
    return extractResponseData<AdminOrder>(response.data)
  },

  async updateOrderStatus(orderCode: string, payload: AdminOrderStatusUpdatePayload): Promise<AdminOrder> {
    const response = await http.patch<ApiSuccessEnvelope<AdminOrder>>(`/admin/orders/${orderCode}/status`, payload)
    return extractResponseData<AdminOrder>(response.data)
  },

  async cancelOrder(orderCode: string): Promise<AdminOrder> {
    const response = await http.patch<ApiSuccessEnvelope<AdminOrder>>(`/admin/orders/${orderCode}/status`, {
      status: 'cancelled',
    })
    return extractResponseData<AdminOrder>(response.data)
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

  vouchers(params?: { page?: number; per_page?: number }) {
    return http.get<ApiPaginatedEnvelope<unknown>>('/admin/vouchers', { params })
  },
}
