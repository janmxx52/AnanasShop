import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { wishlistApi } from '@/api/wishlist.api'
import { useToast } from '@/app/ToastContext'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PriceText } from '@/components/ui/PriceText'
import { parseApiError } from '@/lib/api-helpers'
import type { WishlistItem } from '@/types/wishlist'
import type { PaginationMeta } from '@/types/pagination'

const DEFAULT_META: PaginationMeta = {
  current_page: 1,
  per_page: 12,
  total: 0,
  last_page: 1,
}

export function WishlistPage() {
  const toast = useToast()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [meta, setMeta] = useState<PaginationMeta>(DEFAULT_META)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isRemovingId, setIsRemovingId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchWishlist = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const result = await wishlistApi.list({ page, per_page: 12 })
      setItems(result.data)
      setMeta(result.meta)
    } catch (error) {
      const apiError = parseApiError(error)
      setErrorMessage(apiError.message)
    } finally {
      setIsLoading(false)
    }
  }, [page])

  useEffect(() => {
    void fetchWishlist()
  }, [fetchWishlist])

  const handleRemove = async (productId: number) => {
    setIsRemovingId(productId)

    try {
      const result = await wishlistApi.remove(productId)
      toast.success(result.message)
      await fetchWishlist()
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
    } finally {
      setIsRemovingId(null)
    }
  }

  if (isLoading) {
    return <LoadingState message="Đang tải danh sách yêu thích..." />
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} />
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Chưa có sản phẩm yêu thích"
        description="Hãy thêm sản phẩm vào danh sách yêu thích từ trang sản phẩm."
      />
    )
  }

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Sản phẩm yêu thích</h1>
        <p className="text-sm text-slate-600">Danh sách sản phẩm bạn lưu để mua sau.</p>
      </header>

      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[96px_1fr_auto]"
          >
            <div className="aspect-square overflow-hidden rounded bg-slate-100">
              {item.product?.primary_image ? (
                <img src={item.product.primary_image} alt={item.product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-500">Không có ảnh</div>
              )}
            </div>

            <div className="space-y-1">
              {item.product ? (
                <Link to={`/products/${item.product.slug}`} className="font-medium text-slate-900 hover:underline">
                  {item.product.name}
                </Link>
              ) : (
                <p className="font-medium text-slate-900">Sản phẩm không còn khả dụng</p>
              )}
              <p className="text-sm text-slate-700">
                Giá:{' '}
                <PriceText value={item.product?.sale_price ?? item.product?.base_price ?? null} />
              </p>
            </div>

            <div className="flex items-center">
              <Button
                type="button"
                variant="danger"
                isLoading={isRemovingId === item.product_id}
                onClick={() => void handleRemove(item.product_id)}
              >
                Xóa
              </Button>
            </div>
          </article>
        ))}
      </div>

      {meta.last_page > 1 ? (
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-600">
            Trang {meta.current_page} / {meta.last_page}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={meta.current_page <= 1}
              onClick={() => setPage((previous) => Math.max(previous - 1, 1))}
            >
              Trước
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => setPage((previous) => Math.min(previous + 1, meta.last_page))}
            >
              Sau
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
