import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/app/AuthContext'
import { cartApi } from '@/api/cart.api'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PriceText } from '@/components/ui/PriceText'
import { getApiErrorInfo } from '@/lib/api-helpers'
import type { Cart } from '@/types/cart'

export function CartPage() {
  const { token } = useAuth()
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [pendingItemId, setPendingItemId] = useState<number | null>(null)
  const [quantityMap, setQuantityMap] = useState<Record<number, number>>({})

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
    } catch (error) {
      const apiError = getApiErrorInfo(error)
      setErrorMessage(apiError.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCart()
  }, [loadCart, token])

  const updateItemQuantity = async (itemId: number) => {
    const quantity = quantityMap[itemId] ?? 1
    setPendingItemId(itemId)
    setActionMessage(null)

    try {
      await cartApi.updateItem(itemId, { quantity })
      await loadCart()
      setActionMessage('Cart updated.')
    } catch (error) {
      const apiError = getApiErrorInfo(error)
      setActionMessage(apiError.message)
    } finally {
      setPendingItemId(null)
    }
  }

  const removeItem = async (itemId: number) => {
    setPendingItemId(itemId)
    setActionMessage(null)

    try {
      await cartApi.removeItem(itemId)
      await loadCart()
      setActionMessage('Item removed.')
    } catch (error) {
      const apiError = getApiErrorInfo(error)
      setActionMessage(apiError.message)
    } finally {
      setPendingItemId(null)
    }
  }

  const clearCart = async () => {
    setPendingItemId(-1)
    setActionMessage(null)

    try {
      await cartApi.clearCart()
      await loadCart()
      setActionMessage('Cart cleared.')
    } catch (error) {
      const apiError = getApiErrorInfo(error)
      setActionMessage(apiError.message)
    } finally {
      setPendingItemId(null)
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading cart..." />
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} />
  }

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        title="Cart is empty"
        description="Add products from product detail page to start shopping."
      />
    )
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">Cart</h1>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => void loadCart()}>
            Refresh
          </Button>
          <Button
            type="button"
            variant="danger"
            isLoading={pendingItemId === -1}
            onClick={() => void clearCart()}
          >
            Clear cart
          </Button>
        </div>
      </header>

      {actionMessage ? <p className="text-sm text-slate-700">{actionMessage}</p> : null}

      <div className="space-y-3">
        {cart.items.map((item) => (
          <article
            key={item.id}
            className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[1fr_auto_auto]"
          >
            <div className="space-y-1">
              {item.product?.slug ? (
                <Link to={`/products/${item.product.slug}`} className="font-medium text-slate-900 hover:underline">
                  {item.product.name}
                </Link>
              ) : (
                <p className="font-medium text-slate-900">Unknown product</p>
              )}
              <p className="text-xs text-slate-600">
                {item.variant?.size ?? '-'} / {item.variant?.color ?? '-'} • SKU {item.variant?.sku ?? '-'}
              </p>
              <p className="text-sm text-slate-700">
                Unit price: <PriceText value={item.unit_price} />
              </p>
              <p className="text-sm font-medium text-slate-900">
                Subtotal: <PriceText value={item.subtotal} />
              </p>
            </div>

            <div className="w-full md:w-32">
              <Input
                label="Qty"
                type="number"
                min={0}
                value={quantityMap[item.id] ?? item.quantity}
                onChange={(event) =>
                  setQuantityMap((prev) => ({
                    ...prev,
                    [item.id]: Math.max(0, Number(event.target.value) || 0),
                  }))
                }
              />
            </div>

            <div className="flex items-end gap-2">
              <Button
                type="button"
                variant="secondary"
                isLoading={pendingItemId === item.id}
                onClick={() => void updateItemQuantity(item.id)}
              >
                Update
              </Button>
              <Button
                type="button"
                variant="danger"
                isLoading={pendingItemId === item.id}
                onClick={() => void removeItem(item.id)}
              >
                Remove
              </Button>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-600">Total</p>
        <p className="text-xl font-semibold text-slate-900">
          <PriceText value={cart.total} />
        </p>
      </div>
    </section>
  )
}
