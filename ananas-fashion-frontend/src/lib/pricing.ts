import type { ProductLite } from '@/types/product'

export function getProductDisplayPrice(product: ProductLite) {
  return product.sale_price ?? product.base_price
}

export function getVariantDisplayPrice(product: ProductLite, variantId: number | null) {
  if (!product.variants || product.variants.length === 0 || variantId === null) {
    return getProductDisplayPrice(product)
  }

  const variant = product.variants.find((item) => item.id === variantId)
  return variant ? variant.price : getProductDisplayPrice(product)
}

export function getProductListCardPrice(product: ProductLite) {
  if (product.variants && product.variants.length > 0) {
    return Math.min(...product.variants.map((variant) => variant.price))
  }

  return getProductDisplayPrice(product)
}
