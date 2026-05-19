import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { adminApi } from '@/api/admin.api'
import { useToast } from '@/app/ToastContext'
import { AdminCard } from '@/components/admin/AdminCard'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { AdminStatusPill } from '@/components/admin/AdminStatusPill'
import { AdminTable } from '@/components/admin/AdminTable'
import { ConfirmActionButton } from '@/components/admin/ConfirmActionButton'
import { FormSection } from '@/components/admin/FormSection'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PriceText } from '@/components/ui/PriceText'
import { formatFieldError, parseApiError } from '@/lib/api-helpers'
import type {
  AdminProduct,
  AdminProductImage,
  AdminProductVariant,
  AdminProductVariantPayload,
} from '@/types/admin'
import type { PaginationMeta } from '@/types/pagination'

type VariantFormState = {
  size: string
  color: string
  color_hex: string
  sku: string
  stock: string
  price_adjustment: string
}

type ManageTab = 'variants' | 'images'

const DEFAULT_VARIANT_FORM: VariantFormState = {
  size: '',
  color: '',
  color_hex: '',
  sku: '',
  stock: '0',
  price_adjustment: '0',
}

const EMPTY_META: PaginationMeta = {
  current_page: 1,
  per_page: 20,
  total: 0,
  last_page: 1,
}

function mapVariantToForm(variant: AdminProductVariant): VariantFormState {
  return {
    size: variant.size ?? '',
    color: variant.color ?? '',
    color_hex: variant.color_hex ?? '',
    sku: variant.sku ?? '',
    stock: String(variant.stock ?? 0),
    price_adjustment: String(variant.price_adjustment ?? 0),
  }
}

function formatPriceAdjustment(value: number | null): string {
  const numeric = value ?? 0
  const sign = numeric > 0 ? '+' : numeric < 0 ? '-' : ''
  const absolute = Math.abs(numeric)
  const formatted = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(absolute)

  return `${sign}${formatted}`
}

export function AdminProductManagePage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const toast = useToast()

  const resolvedProductId = Number(productId)
  const isInvalidProductId = !Number.isInteger(resolvedProductId) || resolvedProductId <= 0

  const [activeTab, setActiveTab] = useState<ManageTab>('variants')

  const [product, setProduct] = useState<AdminProduct | null>(null)
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)
  const [productError, setProductError] = useState<string | null>(null)

  const [variants, setVariants] = useState<AdminProductVariant[]>([])
  const [variantsMeta, setVariantsMeta] = useState<PaginationMeta>(EMPTY_META)
  const [variantPage, setVariantPage] = useState(1)
  const [isLoadingVariants, setIsLoadingVariants] = useState(true)
  const [variantError, setVariantError] = useState<string | null>(null)

  const [variantForm, setVariantForm] = useState<VariantFormState>(DEFAULT_VARIANT_FORM)
  const [editingVariantId, setEditingVariantId] = useState<number | null>(null)
  const [variantFieldErrors, setVariantFieldErrors] = useState<Record<string, string[]> | null>(null)
  const [isSubmittingVariant, setIsSubmittingVariant] = useState(false)
  const [deletingVariantId, setDeletingVariantId] = useState<number | null>(null)

  const [images, setImages] = useState<AdminProductImage[]>([])
  const [isLoadingImages, setIsLoadingImages] = useState(true)
  const [imagesError, setImagesError] = useState<string | null>(null)

  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadSortOrder, setUploadSortOrder] = useState('0')
  const [uploadIsPrimary, setUploadIsPrimary] = useState(false)
  const [imageFieldErrors, setImageFieldErrors] = useState<Record<string, string[]> | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null)
  const [settingPrimaryImageId, setSettingPrimaryImageId] = useState<number | null>(null)

  const productStatusLabel = useMemo(() => {
    if (!product) return '-'
    if (product.deleted_at) return 'Đã xóa mềm'
    return product.is_active ? 'Đang bật' : 'Đang tắt'
  }, [product])

  const loadProduct = useCallback(async () => {
    if (isInvalidProductId) {
      setProductError('ID sản phẩm không hợp lệ.')
      setIsLoadingProduct(false)
      return
    }

    setIsLoadingProduct(true)
    setProductError(null)

    try {
      const response = await adminApi.getProduct(resolvedProductId)
      setProduct(response)
    } catch (error) {
      const apiError = parseApiError(error)
      setProductError(apiError.message)
    } finally {
      setIsLoadingProduct(false)
    }
  }, [isInvalidProductId, resolvedProductId])

  const loadVariants = useCallback(async () => {
    if (isInvalidProductId) return

    setIsLoadingVariants(true)
    setVariantError(null)

    try {
      const response = await adminApi.listProductVariants(resolvedProductId, { page: variantPage, per_page: 20 })
      setVariants(response.data)
      setVariantsMeta(response.meta)
    } catch (error) {
      const apiError = parseApiError(error)
      setVariantError(apiError.message)
    } finally {
      setIsLoadingVariants(false)
    }
  }, [isInvalidProductId, resolvedProductId, variantPage])

  const loadImages = useCallback(async () => {
    if (isInvalidProductId) return

    setIsLoadingImages(true)
    setImagesError(null)

    try {
      const response = await adminApi.listProductImages(resolvedProductId)
      setImages(response)
    } catch (error) {
      const apiError = parseApiError(error)
      setImagesError(apiError.message)
    } finally {
      setIsLoadingImages(false)
    }
  }, [isInvalidProductId, resolvedProductId])

  useEffect(() => {
    void loadProduct()
    void loadImages()
  }, [loadProduct, loadImages])

  useEffect(() => {
    void loadVariants()
  }, [loadVariants])

  const resetVariantForm = () => {
    setVariantForm(DEFAULT_VARIANT_FORM)
    setEditingVariantId(null)
    setVariantFieldErrors(null)
  }

  const handleVariantSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmittingVariant(true)
    setVariantFieldErrors(null)

    const payload: AdminProductVariantPayload = {
      size: variantForm.size.trim(),
      color: variantForm.color.trim(),
      stock: Number(variantForm.stock),
      color_hex: variantForm.color_hex.trim() ? variantForm.color_hex.trim() : null,
      sku: variantForm.sku.trim() ? variantForm.sku.trim() : null,
      price_adjustment: variantForm.price_adjustment.trim() ? Number(variantForm.price_adjustment) : null,
    }

    try {
      if (editingVariantId) {
        await adminApi.updateProductVariant(resolvedProductId, editingVariantId, payload)
        toast.success('Cập nhật biến thể thành công.')
      } else {
        await adminApi.createProductVariant(resolvedProductId, payload)
        toast.success('Tạo biến thể thành công.')
      }

      resetVariantForm()
      await loadVariants()
    } catch (error) {
      const apiError = parseApiError(error)
      setVariantFieldErrors(apiError.errors)
      toast.error(apiError.message)
    } finally {
      setIsSubmittingVariant(false)
    }
  }

  const handleDeleteVariant = async (variantId: number) => {
    setDeletingVariantId(variantId)

    try {
      await adminApi.deleteProductVariant(resolvedProductId, variantId)
      toast.success('Xóa biến thể thành công.')

      if (variants.length === 1 && variantPage > 1) {
        setVariantPage((prev) => Math.max(1, prev - 1))
      } else {
        await loadVariants()
      }
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
    } finally {
      setDeletingVariantId(null)
    }
  }

  const handleUploadFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setUploadFile(file)
  }

  const resetImageForm = () => {
    setUploadFile(null)
    setUploadSortOrder('0')
    setUploadIsPrimary(false)
    setImageFieldErrors(null)
  }

  const handleUploadImage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!uploadFile) {
      toast.error('Vui lòng chọn ảnh để tải lên.')
      return
    }

    setIsUploadingImage(true)
    setImageFieldErrors(null)

    try {
      await adminApi.uploadProductImage(resolvedProductId, {
        file: uploadFile,
        is_primary: uploadIsPrimary,
        sort_order: uploadSortOrder.trim() ? Number(uploadSortOrder) : 0,
      })
      toast.success('Tải ảnh lên thành công.')
      resetImageForm()
      await loadImages()
    } catch (error) {
      const apiError = parseApiError(error)
      setImageFieldErrors(apiError.errors)
      toast.error(apiError.message)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    setDeletingImageId(imageId)

    try {
      await adminApi.deleteProductImage(resolvedProductId, imageId)
      toast.success('Xóa ảnh thành công.')
      await loadImages()
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
    } finally {
      setDeletingImageId(null)
    }
  }

  const handleSetPrimaryImage = async (imageId: number) => {
    setSettingPrimaryImageId(imageId)

    try {
      await adminApi.setPrimaryProductImage(resolvedProductId, imageId)
      toast.success('Đã cập nhật ảnh đại diện.')
      await loadImages()
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
    } finally {
      setSettingPrimaryImageId(null)
    }
  }

  if (isLoadingProduct) {
    return <LoadingState message="Đang tải thông tin sản phẩm..." />
  }

  if (productError) {
    return <ErrorState message={productError} />
  }

  if (!product) {
    return <EmptyState title="Không tìm thấy sản phẩm" />
  }

  return (
    <section className="space-y-5">
      <AdminPageHeader
        title="Quản lý biến thể và hình ảnh"
        description={`Quản trị biến thể tồn kho và thư viện ảnh cho sản phẩm #${product.id}.`}
        actions={
          <Button type="button" variant="secondary" onClick={() => navigate('/admin/products')}>
            Quay lại danh sách sản phẩm
          </Button>
        }
      />

      <AdminCard title="Thông tin sản phẩm">
        <div className="grid gap-3 text-sm text-neutral-700 sm:grid-cols-2 lg:grid-cols-3">
          <p>
            <span className="font-medium text-neutral-900">Tên:</span> {product.name}
          </p>
          <p>
            <span className="font-medium text-neutral-900">Slug:</span> {product.slug}
          </p>
          <p>
            <span className="font-medium text-neutral-900">Trạng thái:</span>{' '}
            <AdminStatusPill
              label={productStatusLabel}
              tone={product.deleted_at ? 'warning' : product.is_active ? 'success' : 'neutral'}
            />
          </p>
          <p>
            <span className="font-medium text-neutral-900">Danh mục:</span> {product.category?.name || '-'}
          </p>
          <p>
            <span className="font-medium text-neutral-900">Thương hiệu:</span> {product.brand?.name || '-'}
          </p>
          <p>
            <span className="font-medium text-neutral-900">Giá hiển thị:</span>{' '}
            <PriceText value={product.sale_price ?? product.base_price} />
          </p>
        </div>
      </AdminCard>

      <AdminCard title="Cấu hình sản phẩm">
        <div className="flex flex-wrap gap-2 border-b border-neutral-200 pb-3">
          <Button
            type="button"
            variant={activeTab === 'variants' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('variants')}
          >
            Quản lý biến thể
          </Button>
          <Button
            type="button"
            variant={activeTab === 'images' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('images')}
          >
            Quản lý ảnh
          </Button>
        </div>

        {activeTab === 'variants' ? (
          <div className="space-y-4 pt-3">
            <form className="grid gap-3" onSubmit={handleVariantSubmit}>
              <FormSection title="Thông tin biến thể" description="Size, màu, SKU, tồn kho và điều chỉnh giá">
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <Input
                    label="Kích thước"
                    value={variantForm.size}
                    onChange={(event) => setVariantForm((prev) => ({ ...prev, size: event.target.value }))}
                    error={formatFieldError(variantFieldErrors, 'size')}
                    required
                  />
                  <Input
                    label="Màu sắc"
                    value={variantForm.color}
                    onChange={(event) => setVariantForm((prev) => ({ ...prev, color: event.target.value }))}
                    error={formatFieldError(variantFieldErrors, 'color')}
                    required
                  />
                  <Input
                    label="Mã màu HEX (tùy chọn)"
                    placeholder="#000000"
                    value={variantForm.color_hex}
                    onChange={(event) => setVariantForm((prev) => ({ ...prev, color_hex: event.target.value }))}
                    error={formatFieldError(variantFieldErrors, 'color_hex')}
                  />
                  <Input
                    label="SKU (tùy chọn)"
                    value={variantForm.sku}
                    onChange={(event) => setVariantForm((prev) => ({ ...prev, sku: event.target.value }))}
                    error={formatFieldError(variantFieldErrors, 'sku')}
                  />
                  <Input
                    label="Tồn kho"
                    type="number"
                    min={0}
                    value={variantForm.stock}
                    onChange={(event) => setVariantForm((prev) => ({ ...prev, stock: event.target.value }))}
                    error={formatFieldError(variantFieldErrors, 'stock')}
                    required
                  />
                  <Input
                    label="Điều chỉnh giá"
                    type="number"
                    value={variantForm.price_adjustment}
                    onChange={(event) => setVariantForm((prev) => ({ ...prev, price_adjustment: event.target.value }))}
                    error={formatFieldError(variantFieldErrors, 'price_adjustment')}
                  />
                </div>
              </FormSection>

              <div className="flex flex-wrap gap-2">
                <Button type="submit" isLoading={isSubmittingVariant}>
                  {editingVariantId ? 'Lưu biến thể' : 'Tạo biến thể'}
                </Button>
                {editingVariantId ? (
                  <Button type="button" variant="secondary" disabled={isSubmittingVariant} onClick={resetVariantForm}>
                    Hủy chỉnh sửa
                  </Button>
                ) : null}
              </div>
            </form>

            {isLoadingVariants ? (
              <LoadingState message="Đang tải danh sách biến thể..." />
            ) : variantError ? (
              <ErrorState message={variantError} />
            ) : variants.length === 0 ? (
              <EmptyState title="Chưa có biến thể" description="Hãy tạo biến thể đầu tiên cho sản phẩm này." />
            ) : (
              <>
                <AdminTable minWidthClassName="min-w-[1020px]">
                  <thead className="bg-neutral-50 text-left text-neutral-600">
                    <tr>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Kích thước</th>
                      <th className="px-3 py-2">Màu sắc</th>
                      <th className="px-3 py-2">HEX</th>
                      <th className="px-3 py-2">SKU</th>
                      <th className="px-3 py-2">Tồn kho</th>
                      <th className="px-3 py-2">Điều chỉnh giá</th>
                      <th className="px-3 py-2">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((variant) => (
                      <tr key={variant.id} className="border-t border-neutral-100">
                        <td className="px-3 py-2 text-neutral-700">{variant.id}</td>
                        <td className="px-3 py-2 font-medium text-neutral-900">{variant.size}</td>
                        <td className="px-3 py-2 text-neutral-700">{variant.color}</td>
                        <td className="px-3 py-2 text-neutral-700">{variant.color_hex || '-'}</td>
                        <td className="px-3 py-2 text-neutral-700">{variant.sku || '-'}</td>
                        <td className="px-3 py-2 text-neutral-700">{variant.stock}</td>
                        <td className="px-3 py-2 text-neutral-700">{formatPriceAdjustment(variant.price_adjustment)}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              disabled={isSubmittingVariant || deletingVariantId === variant.id}
                              onClick={() => {
                                setEditingVariantId(variant.id)
                                setVariantForm(mapVariantToForm(variant))
                                setVariantFieldErrors(null)
                              }}
                            >
                              Sửa
                            </Button>
                            <ConfirmActionButton
                              type="button"
                              variant="danger"
                              confirmMessage="Bạn có chắc chắn muốn xóa biến thể này?"
                              isLoading={deletingVariantId === variant.id}
                              disabled={isSubmittingVariant}
                              onConfirm={() => handleDeleteVariant(variant.id)}
                            >
                              Xóa
                            </ConfirmActionButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </AdminTable>

                {variantsMeta.last_page > 1 ? (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-neutral-600">
                      Trang {variantsMeta.current_page} / {variantsMeta.last_page} • Tổng {variantsMeta.total}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={variantsMeta.current_page <= 1}
                        onClick={() => setVariantPage((prev) => Math.max(1, prev - 1))}
                      >
                        Trước
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={variantsMeta.current_page >= variantsMeta.last_page}
                        onClick={() => setVariantPage((prev) => Math.min(variantsMeta.last_page, prev + 1))}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4 pt-3">
            <form className="grid gap-3" onSubmit={handleUploadImage}>
              <FormSection title="Tải ảnh mới" description="Hỗ trợ JPG, PNG, WEBP. Có thể đặt ảnh đại diện ngay khi upload.">
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block space-y-1 md:col-span-2">
                    <span className="block text-sm font-medium text-neutral-700">Ảnh sản phẩm</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="w-full border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition file:mr-3 file:rounded file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:text-slate-700 hover:file:bg-slate-200"
                      onChange={handleUploadFileChange}
                    />
                    {formatFieldError(imageFieldErrors, 'file') ? (
                      <span className="text-xs text-red-600">{formatFieldError(imageFieldErrors, 'file')}</span>
                    ) : null}
                  </label>

                  <Input
                    label="Thứ tự sắp xếp"
                    type="number"
                    value={uploadSortOrder}
                    onChange={(event) => setUploadSortOrder(event.target.value)}
                    error={formatFieldError(imageFieldErrors, 'sort_order')}
                  />

                  <label className="flex items-center gap-2 pt-7 text-sm text-neutral-700">
                    <input
                      type="checkbox"
                      checked={uploadIsPrimary}
                      onChange={(event) => setUploadIsPrimary(event.target.checked)}
                    />
                    Đặt làm ảnh đại diện
                  </label>
                </div>
              </FormSection>

              <div className="flex flex-wrap gap-2">
                <Button type="submit" isLoading={isUploadingImage}>
                  Tải ảnh lên
                </Button>
                <Button type="button" variant="secondary" disabled={isUploadingImage} onClick={resetImageForm}>
                  Đặt lại
                </Button>
              </div>
            </form>

            {isLoadingImages ? (
              <LoadingState message="Đang tải danh sách ảnh..." />
            ) : imagesError ? (
              <ErrorState message={imagesError} />
            ) : images.length === 0 ? (
              <EmptyState title="Chưa có ảnh sản phẩm" description="Hãy tải ảnh đầu tiên cho sản phẩm này." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {images.map((image) => (
                  <article key={image.id} className="overflow-hidden border border-neutral-200 bg-white">
                    <div className="aspect-square bg-neutral-100">
                      <img src={image.image_url} alt={`Ảnh sản phẩm #${image.id}`} className="h-full w-full object-cover" />
                    </div>
                    <div className="space-y-3 p-3">
                      <div className="space-y-1 text-xs text-neutral-600">
                        <p>
                          <span className="font-medium text-neutral-900">ID:</span> {image.id}
                        </p>
                        <p>
                          <span className="font-medium text-neutral-900">Thứ tự:</span> {image.sort_order}
                        </p>
                        <p>
                          <span className="font-medium text-neutral-900">Trạng thái:</span>{' '}
                          {image.is_primary ? 'Ảnh đại diện' : 'Ảnh thường'}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {image.is_primary ? (
                          <AdminStatusPill label="Ảnh đại diện" tone="success" />
                        ) : (
                          <Button
                            type="button"
                            variant="secondary"
                            isLoading={settingPrimaryImageId === image.id}
                            onClick={() => void handleSetPrimaryImage(image.id)}
                          >
                            Đặt làm đại diện
                          </Button>
                        )}

                        <ConfirmActionButton
                          type="button"
                          variant="danger"
                          confirmMessage="Bạn có chắc chắn muốn xóa ảnh này?"
                          isLoading={deletingImageId === image.id}
                          disabled={settingPrimaryImageId === image.id}
                          onConfirm={() => handleDeleteImage(image.id)}
                        >
                          Xóa
                        </ConfirmActionButton>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </AdminCard>
    </section>
  )
}
