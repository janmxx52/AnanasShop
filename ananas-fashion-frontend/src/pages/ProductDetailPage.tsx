import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { cartApi } from '@/api/cart.api'
import { productApi } from '@/api/product.api'
import { reviewApi } from '@/api/review.api'
import { useAuth } from '@/app/AuthContext'
import { useToast } from '@/app/ToastContext'
import { ReviewForm } from '@/components/review/ReviewForm'
import { ReviewList } from '@/components/review/ReviewList'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PriceText } from '@/components/ui/PriceText'
import { WishlistButton } from '@/components/wishlist/WishlistButton'
import { parseApiError } from '@/lib/api-helpers'
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

function getPrimaryImage(product: ProductLite) {
  if (!product.images || product.images.length === 0) {
    return null
  }

  return product.images.find((image) => image.is_primary) ?? product.images[0]
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
      setReviewSubmitMessage(null)
      setReviewFieldErrors(null)
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

  const primaryImage = getPrimaryImage(product)

  return (
    <section className="space-y-6">
      <Link to="/products" className="text-sm text-slate-600 hover:text-slate-900">
        Quay lại danh sách sản phẩm
      </Link>

      <div className="grid gap-6 rounded-lg border border-slate-200 bg-white p-4 sm:p-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded bg-slate-100">
            {primaryImage ? (
              <img src={primaryImage.url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">Không có ảnh</div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-slate-900">{product.name}</h1>
          <p className="text-sm text-slate-600">{product.description ?? 'Chưa có mô tả.'}</p>

          <div className="rounded border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm text-slate-600">Giá</p>
            <PriceText value={getVariantDisplayPrice(product, selectedVariantId)} className="text-lg font-semibold text-slate-900" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Phân loại</p>
            <div className="flex flex-wrap gap-2">
              {product.variants && product.variants.length > 0 ? (
                product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    className={`rounded border px-3 py-2 text-sm ${
                      selectedVariantId === variant.id
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-300 bg-white text-slate-900'
                    }`}
                    onClick={() => setSelectedVariantId(variant.id)}
                  >
                    {variant.size} / {variant.color} • tồn kho {variant.stock}
                  </button>
                ))
              ) : (
                <p className="text-sm text-slate-500">Chưa có phân loại.</p>
              )}
            </div>
          </div>

          <Input
            label="Số lượng"
            type="number"
            min={1}
            max={selectedVariant?.stock || undefined}
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
          />

          <div className="flex flex-wrap items-start gap-2">
            <Button onClick={() => void handleAddToCart()} isLoading={isAdding} disabled={!selectedVariant || selectedVariant.stock < 1}>
              Thêm vào giỏ hàng
            </Button>
            <WishlistButton productId={product.id} />
          </div>

          {showCartActions ? (
            <div className="flex flex-wrap items-center gap-2 rounded border border-slate-200 bg-slate-50 p-3 text-sm">
              <span className="text-slate-700">Sản phẩm đã được thêm vào giỏ hàng.</span>
              <Button type="button" variant="secondary" onClick={() => setShowCartActions(false)}>
                Tiếp tục mua hàng
              </Button>
              <Link to="/cart" className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                Đi tới giỏ hàng
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <section className="space-y-4">
        <header className="space-y-1">
          <h2 className="text-xl font-semibold text-slate-900">Đánh giá sản phẩm</h2>
          <p className="text-sm text-slate-600">
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
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
            Vui lòng <Link to="/login" className="font-medium underline">đăng nhập</Link> để viết đánh giá.
          </div>
        )}

        {!isAuthenticated && reviewSubmitMessage ? <p className="text-sm text-slate-700">{reviewSubmitMessage}</p> : null}

        <ReviewList
          reviews={reviews}
          isLoading={isLoadingReviews}
          errorMessage={reviewErrorMessage}
          currentUserId={user?.id}
          deletingReviewId={isDeletingReviewId}
          onDelete={handleDeleteReview}
        />

        {reviewMeta.last_page > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">
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
