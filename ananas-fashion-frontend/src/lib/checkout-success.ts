import type { CheckoutResult } from '@/types/order'

const CHECKOUT_SUCCESS_STORAGE_KEY = 'ananas_checkout_success_order'

export function setCheckoutSuccessOrder(order: CheckoutResult) {
  sessionStorage.setItem(CHECKOUT_SUCCESS_STORAGE_KEY, JSON.stringify(order))
}

export function getCheckoutSuccessOrder(): CheckoutResult | null {
  const rawValue = sessionStorage.getItem(CHECKOUT_SUCCESS_STORAGE_KEY)

  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as CheckoutResult
  } catch {
    return null
  }
}

export function clearCheckoutSuccessOrder() {
  sessionStorage.removeItem(CHECKOUT_SUCCESS_STORAGE_KEY)
}
