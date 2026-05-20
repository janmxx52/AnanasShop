import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { cartApi } from '@/api/cart.api'
import { productApi } from '@/api/product.api'
import { reviewApi } from '@/api/review.api'
import { useAuth } from '@/app/AuthContext'
import { useToast } from '@/app/ToastContext'
import { ReviewForm } from '@/components/review/ReviewForm'
import { ReviewList } from '@/components/review/ReviewList'
import { Breadcrumb, type BreadcrumbItem } from '@/components/ui/Breadcrumb'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PriceText } from '@/components/ui/PriceText'
import { WishlistButton } from '@/components/wishlist/WishlistButton'
import { parseApiError } from '@/lib/api-helpers'
import { resolveProductDetailImages } from '@/lib/product-images'
import { getVariantDisplayPrice } from '@/lib/pricing'
import type { PaginationMeta } from '@/types/pagination'
import type { ProductLite, ProductVariant } from '@/types/product'
import type { CreateReviewPayload, ReviewItem } from '@/types/review'

const DEFAULT_REVIEW_META: PaginationMeta = {
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { isAuthenticated, user } = useAuth()
  const toast = useToast()

  const [product, setProduct] = useState<ProductLite | null>(null)
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)
  const [productErrorMessage, setProductErrorMessage] = useState<string | null>(null)

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [showCartActions, setShowCartActions] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [reviewMeta, setReviewMeta] = useState<PaginationMeta>(DEFAULT_REVIEW_META)
  const [reviewPage, setReviewPage] = useState(1)
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  const [reviewErrorMessage, setReviewErrorMessage] = useState<string | null>(null)
  const [isCreatingReview, setIsCreatingReview] = useState(false)
  const [isDeletingReviewId, setIsDeletingReviewId] = useState<number | null>(null)
  const [reviewSubmitMessage, setReviewSubmitMessage] = useState<string | null>(null)
  const [reviewFieldErrors, setReviewFieldErrors] = useState<Record<string, string[]> | null>(null)

  const fetchProduct = useCallback(async () => {
    if (!slug) {
      setProductErrorMessage('Thiếu slug sản phẩm.')
      setIsLoadingProduct(false)
      return
    }

    setIsLoadingProduct(true)
    setProductErrorMessage(null)

    try {
      const response = await productApi.detail(slug)
      setProduct(response)
      const firstInStockVariant = response.variants?.find((variant) => variant.stock > 0) ?? response.variants?.[0]
      setSelectedVariantId(firstInStockVariant?.id ?? null)
      setSelectedImageIndex(0)
    } catch (error) {
      const apiError = parseApiError(error)
      setProductErrorMessage(apiError.message)
    } finally {
      setIsLoadingProduct(false)
    }
  }, [slug])

  const fetchReviews = useCallback(async () => {
    if (!slug) {
      return
    }

    setIsLoadingReviews(true)
    setReviewErrorMessage(null)

    try {
      const response = await reviewApi.listByProduct(slug, { page: reviewPage, per_page: 10 })
      setReviews(response.data)
      setReviewMeta(response.meta)
    } catch (error) {
      const apiError = parseApiError(error)
      setReviewErrorMessage(apiError.message)
    } finally {
      setIsLoadingReviews(false)
    }
  }, [reviewPage, slug])

  useEffect(() => {
    void fetchProduct()
  }, [fetchProduct])

  useEffect(() => {
    void fetchReviews()
  }, [fetchReviews])

  useEffect(() => {
    setReviewPage(1)
    setReviewSubmitMessage(null)
    setReviewFieldErrors(null)
  }, [slug])

  const selectedVariant: ProductVariant | null = useMemo(() => {
    if (!product?.variants || selectedVariantId === null) {
      return null
    }

    return product.variants.find((variant) => variant.id === selectedVariantId) ?? null
  }, [product, selectedVariantId])

  useEffect(() => {
    if (!selectedVariant) {
      return
    }

    setQuantity((previous) => Math.min(Math.max(previous, 1), Math.max(selectedVariant.stock, 1)))
  }, [selectedVariant])

  const resolvedImages = useMemo(() => {
    if (!product) {
      return null
    }

    return resolveProductDetailImages(product)
  }, [product])

  const activeImage = useMemo(() => {
    if (!resolvedImages) {
      return null
    }

    return resolvedImages.images[selectedImageIndex] ?? resolvedImages.mainImage
  }, [resolvedImages, selectedImageIndex])

  const galleryImages = resolvedImages?.images ?? []
  const hasGalleryThumbnails = galleryImages.length > 1

  const breadcrumbItems = useMemo(() => {
    if (!product) {
      return []
    }

    const items: BreadcrumbItem[] = [
      { label: 'Trang chủ', to: '/' },
      { label: 'Sản phẩm', to: '/products' },
    ]

    if (product.category?.name && product.category?.slug) {
      items.push({ label: product.category.name, to: `/products?category=${product.category.slug}` })
    }

    items.push({ label: product.name })

    return items
  }, [product])

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.info('Vui lòng chọn phân loại.')
      return
    }

    setIsAdding(true)

    try {
      await cartApi.addItem({
        product_variant_id: selectedVariant.id,
        quantity,
      })
      setShowCartActions(true)
      toast.success('Đã thêm vào giỏ hàng.')
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
    } finally {
      setIsAdding(false)
    }
  }

  const handleCreateReview = async (payload: CreateReviewPayload): Promise<boolean> => {
    if (!slug) {
      return false
    }

    setIsCreatingReview(true)
    setReviewSubmitMessage(null)
    setReviewFieldErrors(null)

    const formData = new FormData()
    formData.append('order_item_id', String(payload.order_item_id))
    formData.append('rating', String(payload.rating))
    if (payload.comment) {
      formData.append('comment', payload.comment)
    }
    payload.images?.forEach((file) => {
      formData.append('images[]', file)
    })

    try {
      await reviewApi.createForProduct(slug, formData)
      toast.success('Gửi đánh giá thành công.')

      if (reviewPage !== 1) {
        setReviewPage(1)
      } else {
        await fetchReviews()
      }

      return true
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
      setReviewSubmitMessage(apiError.message)
      setReviewFieldErrors(apiError.errors)
      return false
    } finally {
      setIsCreatingReview(false)
    }
  }

  const handleDeleteReview = async (reviewId: number) => {
    setIsDeletingReviewId(reviewId)

    try {
      const result = await reviewApi.remove(reviewId)
      toast.success(result.message)
      await fetchReviews()
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
    } finally {
      setIsDeletingReviewId(null)
    }
  }

  if (isLoadingProduct) {
    return <LoadingState message="Đang tải sản phẩm..." />
  }

  if (productErrorMessage) {
    return <ErrorState message={productErrorMessage} />
  }

  if (!product) {
    return <EmptyState title="Không tìm thấy sản phẩm" />
  }

  return (
    <section className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      <div className="grid items-start gap-6 border border-neutral-200 bg-white p-4 sm:p-6 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
        <div className="space-y-3">
          <div className={`grid gap-3 ${hasGalleryThumbnails ? 'md:grid-cols-[88px_1fr]' : 'grid-cols-1'}`}>
            {hasGalleryThumbnails ? (
              <div className="order-2 grid grid-cols-4 gap-2 md:order-1 md:grid-cols-1 md:auto-rows-[80px]">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={`overflow-hidden border transition ${
                      selectedImageIndex === index
                        ? 'border-[#f15a24] ring-1 ring-[#f15a24]'
                        : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}

            <div className={`aspect-square overflow-hidden bg-neutral-100 ${hasGalleryThumbnails ? 'order-1 md:order-2' : ''}`}>
              {activeImage ? (
                <img src={activeImage} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-neutral-500">Không có ảnh sản phẩm</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-3 border-b border-neutral-200 pb-4">
            <p className="text-xs font-semibold tracking-[0.12em] text-neutral-500 uppercase">
              {product.brand?.name ?? 'Ananas'}
              {product.category?.name ? ` • ${product.category.name}` : ''}
            </p>
            <h1 className="text-2xl font-extrabold leading-tight text-neutral-900 md:text-[2rem]">{product.name}</h1>
            <p className="text-sm leading-6 text-neutral-600">
              {product.description ?? 'Chưa có mô tả cho sản phẩm này.'}
            </p>
          </div>

          <div className="rounded border border-neutral-200 bg-neutral-50 px-4 py-4">
            <PriceText value={getVariantDisplayPrice(product, selectedVariantId)} className="text-3xl font-bold text-[#f15a24]" />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-black tracking-[0.12em] text-neutral-700 uppercase">Phân loại</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {product.variants && product.variants.length > 0 ? (
                product.variants.map((variant) => {
                  const isSelected = selectedVariantId === variant.id
                  const outOfStock = variant.stock <= 0

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      className={`rounded border px-3 py-2 text-left transition ${
                        isSelected
                          ? 'border-[#f15a24] bg-[#fff7f4]'
                          : 'border-neutral-300 bg-white hover:border-neutral-500'
                      } ${outOfStock ? 'cursor-not-allowed opacity-50' : ''}`}
                      disabled={outOfStock}
                      onClick={() => setSelectedVariantId(variant.id)}
                    >
                      <p className="text-sm font-semibold text-neutral-900">
                        {variant.size} / {variant.color}
                      </p>
                      <p className="text-xs text-neutral-500">Tồn kho: {variant.stock}</p>
                    </button>
                  )
                })
              ) : (
                <p className="text-sm text-neutral-500">Chưa có phân loại.</p>
              )}
            </div>
            {selectedVariant ? (
              <p className="text-xs text-neutral-500">SKU: {selectedVariant.sku}</p>
            ) : null}
          </div>

          <div className="w-full sm:max-w-[180px]">
            <Input
              label="Số lượng"
              type="number"
              min={1}
              max={selectedVariant?.stock || undefined}
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              className="h-11 w-full bg-[#f15a24] px-4 text-sm font-semibold uppercase tracking-[0.08em] hover:bg-[#d94f1e] sm:flex-1"
              onClick={() => void handleAddToCart()}
              isLoading={isAdding}
              disabled={!selectedVariant || selectedVariant.stock < 1}
            >
              Thêm vào giỏ hàng
            </Button>
            <WishlistButton productId={product.id} compact className="h-11 w-full sm:w-11" />
          </div>

          {showCartActions ? (
            <div className="rounded border border-orange-200 bg-orange-50 p-3 text-sm text-neutral-700">
              <p className="mb-2">Sản phẩm đã được thêm vào giỏ hàng.</p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" variant="secondary" onClick={() => setShowCartActions(false)}>
                  Tiếp tục mua hàng
                </Button>
                <Link
                  to="/cart"
                  className="inline-flex items-center justify-center border border-neutral-900 px-4 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
                >
                  Đi tới giỏ hàng
                </Link>
              </div>
            </div>
          ) : null}

          <p className="text-xs text-neutral-500">
            Nguồn ảnh: {resolvedImages?.source === 'api' ? 'API' : resolvedImages?.source === 'mapping' ? 'Ananas Assets' : 'Fallback'}
          </p>
        </div>
      </div>

      <section className="space-y-4 border border-neutral-200 bg-white p-4 sm:p-6">
        <header className="space-y-1 border-b border-neutral-200 pb-4">
          <h2 className="text-xl font-bold text-neutral-900">Đánh giá sản phẩm</h2>
          <p className="text-sm text-neutral-600">
            Điểm trung bình: {product.rating_avg ?? 0} / 5 ({product.review_count ?? 0} đánh giá)
          </p>
        </header>

        {isAuthenticated ? (
          <ReviewForm
            isSubmitting={isCreatingReview}
            submitMessage={reviewSubmitMessage}
            fieldErrors={reviewFieldErrors}
            onSubmit={handleCreateReview}
          />
        ) : (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            Vui lòng{' '}
            <Link to="/login" className="font-semibold underline underline-offset-2">
              đăng nhập
            </Link>{' '}
            để viết đánh giá.
          </div>
        )}

        {!isAuthenticated && reviewSubmitMessage ? <p className="text-sm text-neutral-700">{reviewSubmitMessage}</p> : null}

        <ReviewList
          reviews={reviews}
          isLoading={isLoadingReviews}
          errorMessage={reviewErrorMessage}
          currentUserId={user?.id}
          deletingReviewId={isDeletingReviewId}
          onDelete={handleDeleteReview}
        />

        {reviewMeta.last_page > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white p-4">
            <p className="text-sm text-neutral-600">
              Trang {reviewMeta.current_page} / {reviewMeta.last_page}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={reviewMeta.current_page <= 1}
                onClick={() => setReviewPage((previous) => Math.max(previous - 1, 1))}
              >
                Trước
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={reviewMeta.current_page >= reviewMeta.last_page}
                onClick={() => setReviewPage((previous) => Math.min(previous + 1, reviewMeta.last_page))}
              >
                Sau
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </section>
  )
}
