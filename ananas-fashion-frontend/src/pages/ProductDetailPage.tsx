import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { cartApi } from '@/api/cart.api'
import { productApi } from '@/api/product.api'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PriceText } from '@/components/ui/PriceText'
import { getApiErrorInfo } from '@/lib/api-helpers'
import { getVariantDisplayPrice } from '@/lib/pricing'
import type { ProductLite, ProductVariant } from '@/types/product'

function getPrimaryImage(product: ProductLite) {
  if (!product.images || product.images.length === 0) {
    return null
  }

  return product.images.find((image) => image.is_primary) ?? product.images[0]
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [product, setProduct] = useState<ProductLite | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) {
        setErrorMessage('Product slug is missing.')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setErrorMessage(null)

      try {
        const response = await productApi.detail(slug)
        setProduct(response)

        const firstInStockVariant = response.variants?.find((variant) => variant.stock > 0) ?? response.variants?.[0]
        setSelectedVariantId(firstInStockVariant?.id ?? null)
      } catch (error) {
        const apiError = getApiErrorInfo(error)
        setErrorMessage(apiError.message)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchProduct()
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

    setQuantity((prev) => Math.min(Math.max(prev, 1), Math.max(selectedVariant.stock, 1)))
  }, [selectedVariant])

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      setActionMessage('Please select a variant.')
      return
    }

    setIsAdding(true)
    setActionMessage(null)

    try {
      await cartApi.addItem({
        product_variant_id: selectedVariant.id,
        quantity,
      })

      setActionMessage('Added to cart successfully.')
    } catch (error) {
      const apiError = getApiErrorInfo(error)
      setActionMessage(apiError.message)
    } finally {
      setIsAdding(false)
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading product..." />
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} />
  }

  if (!product) {
    return <EmptyState title="Product not found" />
  }

  const primaryImage = getPrimaryImage(product)

  return (
    <section className="space-y-6">
      <Link to="/products" className="text-sm text-slate-600 hover:text-slate-900">
        ← Back to products
      </Link>

      <div className="grid gap-6 rounded-lg border border-slate-200 bg-white p-6 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded bg-slate-100">
            {primaryImage ? (
              <img src={primaryImage.url} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">No image</div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-semibold text-slate-900">{product.name}</h1>
          <p className="text-sm text-slate-600">{product.description ?? 'No description.'}</p>

          <div className="rounded border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm text-slate-600">Price</p>
            <PriceText
              value={getVariantDisplayPrice(product, selectedVariantId)}
              className="text-lg font-semibold text-slate-900"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Variants</p>
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
                    {variant.size} / {variant.color} • stock {variant.stock}
                  </button>
                ))
              ) : (
                <p className="text-sm text-slate-500">No variants.</p>
              )}
            </div>
          </div>

          <Input
            label="Quantity"
            type="number"
            min={1}
            max={selectedVariant?.stock || undefined}
            value={quantity}
            onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
          />

          <div className="flex items-center gap-2">
            <Button
              onClick={() => void handleAddToCart()}
              isLoading={isAdding}
              disabled={!selectedVariant || selectedVariant.stock < 1}
            >
              Add to cart
            </Button>
            <Link to="/cart" className="text-sm font-medium text-slate-900 underline">
              Go to cart
            </Link>
          </div>

          {actionMessage ? (
            <p className="text-sm text-slate-700">{actionMessage}</p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
