import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/AuthContext'
import { useToast } from '@/app/ToastContext'
import { cartApi } from '@/api/cart.api'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import { PriceText } from '@/components/ui/PriceText'
import { parseApiError } from '@/lib/api-helpers'
import { resolveCartItemImage } from '@/lib/cart-images'
import type { Cart, CartItem } from '@/types/cart'

const FREE_SHIPPING_THRESHOLD = 500000
const SHIPPING_FEE = 30000

type RemoveItemOptions = {
  skipConfirm?: boolean
  silent?: boolean
}

export function CartPage() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const toast = useToast()

  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [pendingItemId, setPendingItemId] = useState<number | null>(null)
  const [isClearing, setIsClearing] = useState(false)
  const [quantityMap, setQuantityMap] = useState<Record<number, number>>({})
  const [itemErrorMap, setItemErrorMap] = useState<Record<number, string>>({})

  const loadCart = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await cartApi.getCart()
      setCart(response)
      setQuantityMap(
        response.items.reduce<Record<number, number>>((accumulator, item) => {
          accumulator[item.id] = item.quantity
          return accumulator
        }, {}),
      )
      setItemErrorMap({})
    } catch (error) {
      const apiError = parseApiError(error)
      setErrorMessage(apiError.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCart()
  }, [loadCart, token])

  const clearItemError = (itemId: number) => {
    setItemErrorMap((previous) => {
      if (!previous[itemId]) {
        return previous
      }

      const next = { ...previous }
      delete next[itemId]
      return next
    })
  }

  const setItemError = (itemId: number, message: string) => {
    setItemErrorMap((previous) => ({
      ...previous,
      [itemId]: message,
    }))
  }

  const removeItem = async (itemId: number, options: RemoveItemOptions = {}) => {
    const { skipConfirm = false, silent = false } = options

    if (!skipConfirm) {
      const confirmed = window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?')
      if (!confirmed) {
        return
      }
    }

    setPendingItemId(itemId)

    try {
      await cartApi.removeItem(itemId)
      await loadCart()
      clearItemError(itemId)

      if (!silent) {
        toast.success('Đã xóa sản phẩm khỏi giỏ hàng.')
      }
    } catch (error) {
      const apiError = parseApiError(error)
      setItemError(itemId, apiError.message)
      toast.error(apiError.message)
    } finally {
      setPendingItemId(null)
    }
  }

  const updateItemQuantity = async (item: CartItem, explicitQuantity?: number) => {
    const nextQuantity = explicitQuantity ?? quantityMap[item.id] ?? item.quantity

    if (nextQuantity <= 0) {
      await removeItem(item.id, { skipConfirm: true, silent: true })
      return
    }

    if (nextQuantity === item.quantity) {
      setQuantityMap((previous) => ({ ...previous, [item.id]: item.quantity }))
      clearItemError(item.id)
      return
    }

    setPendingItemId(item.id)

    try {
      await cartApi.updateItem(item.id, { quantity: nextQuantity })
      await loadCart()
      clearItemError(item.id)
      toast.success('Cập nhật số lượng thành công.')
    } catch (error) {
      const apiError = parseApiError(error)
      setItemError(item.id, apiError.message)
      toast.error(apiError.message)
    } finally {
      setPendingItemId(null)
    }
  }

  const adjustQuantity = async (item: CartItem, delta: number) => {
    if (pendingItemId !== null || isClearing) {
      return
    }

    const current = quantityMap[item.id] ?? item.quantity
    const next = Math.max(0, current + delta)

    setQuantityMap((previous) => ({ ...previous, [item.id]: next }))
    await updateItemQuantity(item, next)
  }

  const clearCart = async () => {
    const confirmed = window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')
    if (!confirmed) {
      return
    }

    setIsClearing(true)

    try {
      await cartApi.clearCart()
      await loadCart()
      toast.success('Đã xóa toàn bộ giỏ hàng.')
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
    } finally {
      setIsClearing(false)
    }
  }

  const totalItems = useMemo(() => {
    if (!cart) {
      return 0
    }

    return cart.items.reduce((total, item) => total + item.quantity, 0)
  }, [cart])

  const subtotal = cart?.total ?? 0
  const estimatedShippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const estimatedTotal = subtotal + estimatedShippingFee

  const hasItems = Boolean(cart && cart.items.length > 0)

  if (isLoading) {
    return <LoadingState message="Đang tải giỏ hàng..." />
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} />
  }

  if (!hasItems) {
    return (
      <section className="space-y-4">
        <EmptyState title="Giỏ hàng của bạn đang trống" description="Hãy thêm sản phẩm để tiếp tục mua sắm." />
        <Link
          to="/products"
          className="inline-flex h-11 items-center justify-center border border-neutral-900 px-5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
        >
          Tiếp tục mua sắm
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2 border-b border-neutral-200 pb-4">
        <h1 className="text-3xl font-bold text-neutral-900">Giỏ hàng của bạn</h1>
        <p className="text-sm text-neutral-600">Có {totalItems} sản phẩm trong giỏ hàng.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => void loadCart()}>
              Tải lại giỏ hàng
            </Button>
            <Button type="button" variant="danger" isLoading={isClearing} onClick={() => void clearCart()}>
              Xóa toàn bộ
            </Button>
          </div>

          {cart?.items.map((item) => {
            const itemImage = resolveCartItemImage(item)
            const isPending = pendingItemId === item.id || isClearing
            const quantity = quantityMap[item.id] ?? item.quantity

            return (
              <article
                key={item.id}
                className="grid gap-4 border border-neutral-200 bg-white p-4 md:grid-cols-[112px_minmax(0,1fr)]"
              >
                <div className="aspect-square overflow-hidden border border-neutral-100 bg-neutral-100">
                  <img src={itemImage} alt={item.product?.name ?? 'Sản phẩm'} className="h-full w-full object-cover" />
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    {item.product?.slug ? (
                      <Link
                        to={`/products/${item.product.slug}`}
                        className="line-clamp-2 text-base font-semibold text-neutral-900 transition hover:text-[#f15a24]"
                      >
                        {item.product.name}
                      </Link>
                    ) : (
                      <p className="text-base font-semibold text-neutral-900">Sản phẩm không xác định</p>
                    )}

                    <p className="text-xs text-neutral-500">
                      Size: {item.variant?.size ?? '-'} • Màu: {item.variant?.color ?? '-'}
                      {item.variant?.sku ? ` • SKU: ${item.variant.sku}` : ''}
                    </p>
                  </div>

                  <div className="grid gap-3 text-sm text-neutral-700 sm:grid-cols-3">
                    <p>
                      Đơn giá: <PriceText value={item.unit_price} className="font-semibold text-neutral-900" />
                    </p>
                    <p>
                      Số lượng: <span className="font-semibold text-neutral-900">{item.quantity}</span>
                    </p>
                    <p>
                      Thành tiền: <PriceText value={item.subtotal} className="font-semibold text-neutral-900" />
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex h-10 items-stretch border border-neutral-300 bg-white">
                      <button
                        type="button"
                        className="inline-flex w-10 items-center justify-center text-lg text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isPending}
                        onClick={() => void adjustQuantity(item, -1)}
                        aria-label="Giảm số lượng"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={0}
                        className="w-16 border-x border-neutral-300 text-center text-sm font-medium text-neutral-900 outline-none"
                        value={quantity}
                        disabled={isPending}
                        onChange={(event) => {
                          const parsed = Number(event.target.value)
                          setQuantityMap((previous) => ({
                            ...previous,
                            [item.id]: Number.isNaN(parsed) ? 0 : Math.max(0, Math.floor(parsed)),
                          }))
                          clearItemError(item.id)
                        }}
                        onBlur={() => void updateItemQuantity(item)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            event.preventDefault()
                            void updateItemQuantity(item)
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="inline-flex w-10 items-center justify-center text-lg text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={isPending}
                        onClick={() => void adjustQuantity(item, 1)}
                        aria-label="Tăng số lượng"
                      >
                        +
                      </button>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      isLoading={pendingItemId === item.id}
                      disabled={isPending}
                      onClick={() => void updateItemQuantity(item)}
                    >
                      Cập nhật
                    </Button>

                    <Button
                      type="button"
                      variant="danger"
                      disabled={isPending}
                      onClick={() => void removeItem(item.id)}
                    >
                      Xóa
                    </Button>
                  </div>

                  {itemErrorMap[item.id] ? (
                    <p className="text-sm font-medium text-red-600">{itemErrorMap[item.id]}</p>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>

        <aside className="space-y-4 border border-neutral-200 bg-white p-4 lg:sticky lg:top-20">
          <h2 className="text-lg font-bold text-neutral-900">Tóm tắt đơn hàng</h2>

          <div className="space-y-2 text-sm text-neutral-700">
            <div className="flex items-center justify-between">
              <span>Tạm tính</span>
              <PriceText value={subtotal} className="font-semibold text-neutral-900" />
            </div>
            <div className="flex items-center justify-between">
              <span>Phí vận chuyển dự kiến</span>
              {estimatedShippingFee > 0 ? (
                <PriceText value={estimatedShippingFee} className="font-semibold text-neutral-900" />
              ) : (
                <span className="font-semibold text-green-700">Miễn phí</span>
              )}
            </div>
          </div>

          <hr className="border-neutral-200" />

          <div className="flex items-center justify-between text-base font-bold text-neutral-900">
            <span>Tổng dự kiến</span>
            <PriceText value={estimatedTotal} className="text-xl font-bold text-neutral-900" />
          </div>

          <p className="text-xs text-neutral-500">
            Mã giảm giá sẽ được áp dụng ở bước thanh toán.
          </p>

          <div className="space-y-2 pt-2">
            <Button
              type="button"
              className="h-11 w-full bg-[#f15a24] text-sm font-semibold uppercase tracking-[0.08em] hover:bg-[#d94f1e]"
              disabled={!hasItems}
              onClick={() => navigate('/checkout')}
            >
              Thanh toán
            </Button>

            <Link
              to="/products"
              className="inline-flex h-11 w-full items-center justify-center border border-neutral-900 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white"
            >
              Tiếp tục mua hàng
            </Link>
          </div>
        </aside>
      </div>
    </section>
  )
}
