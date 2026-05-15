import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/AuthContext'
import { cartApi } from '@/api/cart.api'
import { orderApi } from '@/api/order.api'
import { VoucherBox } from '@/components/checkout/VoucherBox'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { PriceText } from '@/components/ui/PriceText'
import { formatFieldError, getApiErrorInfo } from '@/lib/api-helpers'
import { setCheckoutSuccessOrder } from '@/lib/checkout-success'
import type { Cart } from '@/types/cart'
import type { CheckoutResult } from '@/types/order'
import type { VoucherCheckResult } from '@/types/voucher'

type GuestCheckoutForm = {
  full_name: string
  email: string
  phone: string
  shipping_address: string
  note: string
}

type UserCheckoutForm = {
  shipping_name: string
  shipping_phone: string
  shipping_address: string
  note: string
}

const EMPTY_GUEST_FORM: GuestCheckoutForm = {
  full_name: '',
  email: '',
  phone: '',
  shipping_address: '',
  note: '',
}

const EMPTY_USER_FORM: UserCheckoutForm = {
  shipping_name: '',
  shipping_phone: '',
  shipping_address: '',
  note: '',
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const { isAuthenticated, token, user } = useAuth()

  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoadingCart, setIsLoadingCart] = useState(true)
  const [cartError, setCartError] = useState<string | null>(null)

  const [guestForm, setGuestForm] = useState<GuestCheckoutForm>(EMPTY_GUEST_FORM)
  const [userForm, setUserForm] = useState<UserCheckoutForm>(EMPTY_USER_FORM)
  const [voucherCode, setVoucherCode] = useState('')
  const [voucherResult, setVoucherResult] = useState<VoucherCheckResult | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null)

  const loadCart = useCallback(async () => {
    setIsLoadingCart(true)
    setCartError(null)

    try {
      const response = await cartApi.getCart()
      setCart(response)
    } catch (error) {
      const apiError = getApiErrorInfo(error)
      setCartError(apiError.message)
    } finally {
      setIsLoadingCart(false)
    }
  }, [])

  useEffect(() => {
    void loadCart()
  }, [loadCart, token])

  useEffect(() => {
    if (!user) {
      return
    }

    setUserForm((previous) => ({
      ...previous,
      shipping_name: previous.shipping_name || user.name || '',
      shipping_phone: previous.shipping_phone || user.phone || '',
    }))

    setGuestForm((previous) => ({
      ...previous,
      full_name: previous.full_name || user.name || '',
      email: previous.email || user.email || '',
      phone: previous.phone || user.phone || '',
    }))
  }, [user])

  const subtotal = useMemo(() => {
    if (voucherResult) {
      return voucherResult.subtotal
    }

    return cart?.total ?? 0
  }, [voucherResult, cart])

  const discountAmount = voucherResult?.discount ?? 0
  const estimatedShippingFee = subtotal >= 500000 ? 0 : 30000
  const estimatedTotal = Math.max(0, subtotal - discountAmount + estimatedShippingFee)

  const handleCheckoutSuccess = async (order: CheckoutResult) => {
    setCheckoutSuccessOrder(order)
    await loadCart()
    navigate('/checkout/success', {
      replace: true,
      state: { order },
    })
  }

  const submitCheckout = async () => {
    setIsSubmitting(true)
    setSubmitMessage(null)
    setFieldErrors(null)

    try {
      if (isAuthenticated) {
        const order = await orderApi.userCheckout({
          shipping_name: userForm.shipping_name,
          shipping_phone: userForm.shipping_phone,
          shipping_address: userForm.shipping_address,
          voucher_code: voucherCode.trim() || undefined,
          payment_method: 'cod',
          note: userForm.note.trim() || undefined,
        })

        await handleCheckoutSuccess(order)
        return
      }

      const order = await orderApi.guestCheckout({
        full_name: guestForm.full_name,
        email: guestForm.email,
        phone: guestForm.phone,
        shipping_address: guestForm.shipping_address,
        voucher_code: voucherCode.trim() || undefined,
        payment_method: 'cod',
        note: guestForm.note.trim() || undefined,
      })

      await handleCheckoutSuccess(order)
    } catch (error) {
      const apiError = getApiErrorInfo(error)
      setSubmitMessage(apiError.message)
      setFieldErrors(apiError.errors)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingCart) {
    return <LoadingState message="Loading checkout data..." />
  }

  if (cartError) {
    return <ErrorState message={cartError} />
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="space-y-3">
        <EmptyState title="Cart is empty" description="Add at least one product before checkout." />
        <Link to="/products" className="inline-block rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white">
          Go to products
        </Link>
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Checkout</h1>
        <p className="text-sm text-slate-600">COD only in current phase.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {submitMessage ? <ErrorState message={submitMessage} /> : null}

          {fieldErrors?.cart?.[0] ? <ErrorState message={fieldErrors.cart[0]} /> : null}
          {fieldErrors?.cart_items?.[0] ? <ErrorState message={fieldErrors.cart_items[0]} /> : null}
          {fieldErrors?.voucher_code?.[0] ? <ErrorState message={fieldErrors.voucher_code[0]} /> : null}

          {!isAuthenticated ? (
            <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-base font-semibold text-slate-900">Guest information</h2>
              <Input
                label="Full name"
                value={guestForm.full_name}
                onChange={(event) =>
                  setGuestForm((previous) => ({ ...previous, full_name: event.target.value }))
                }
                error={formatFieldError(fieldErrors, 'full_name')}
                required
              />
              <Input
                label="Email"
                type="email"
                value={guestForm.email}
                onChange={(event) =>
                  setGuestForm((previous) => ({ ...previous, email: event.target.value }))
                }
                error={formatFieldError(fieldErrors, 'email')}
                required
              />
              <Input
                label="Phone"
                value={guestForm.phone}
                onChange={(event) =>
                  setGuestForm((previous) => ({ ...previous, phone: event.target.value }))
                }
                error={formatFieldError(fieldErrors, 'phone')}
                required
              />
            </section>
          ) : (
            <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-base font-semibold text-slate-900">Shipping information</h2>
              <Input
                label="Shipping name"
                value={userForm.shipping_name}
                onChange={(event) =>
                  setUserForm((previous) => ({ ...previous, shipping_name: event.target.value }))
                }
                error={formatFieldError(fieldErrors, 'shipping_name')}
                required
              />
              <Input
                label="Shipping phone"
                value={userForm.shipping_phone}
                onChange={(event) =>
                  setUserForm((previous) => ({ ...previous, shipping_phone: event.target.value }))
                }
                error={formatFieldError(fieldErrors, 'shipping_phone')}
                required
              />
              <Input label="Account email" value={user?.email ?? ''} disabled />
            </section>
          )}

          <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
            <Input
              label="Shipping address"
              value={isAuthenticated ? userForm.shipping_address : guestForm.shipping_address}
              onChange={(event) => {
                if (isAuthenticated) {
                  setUserForm((previous) => ({
                    ...previous,
                    shipping_address: event.target.value,
                  }))
                  return
                }

                setGuestForm((previous) => ({
                  ...previous,
                  shipping_address: event.target.value,
                }))
              }}
              error={formatFieldError(fieldErrors, 'shipping_address')}
              required
            />

            <Input
              label="Note (optional)"
              value={isAuthenticated ? userForm.note : guestForm.note}
              onChange={(event) => {
                if (isAuthenticated) {
                  setUserForm((previous) => ({ ...previous, note: event.target.value }))
                  return
                }

                setGuestForm((previous) => ({ ...previous, note: event.target.value }))
              }}
            />

            <Input label="Payment method" value="cod" disabled />
          </section>

          <VoucherBox
            voucherCode={voucherCode}
            onVoucherCodeChange={setVoucherCode}
            onVoucherChecked={setVoucherResult}
            disabled={isSubmitting}
          />

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void submitCheckout()} isLoading={isSubmitting}>
              Place order
            </Button>
            <Link className="rounded bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900" to="/cart">
              Back to cart
            </Link>
          </div>
        </div>

        <aside className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-base font-semibold text-slate-900">Order summary</h2>
          <p className="text-sm text-slate-700">
            Items: <strong>{cart.items.length}</strong>
          </p>
          <p className="text-sm text-slate-700">
            Subtotal: <PriceText value={subtotal} />
          </p>
          <p className="text-sm text-slate-700">
            Discount: <PriceText value={discountAmount} />
          </p>
          <p className="text-sm text-slate-700">
            Shipping fee: <PriceText value={estimatedShippingFee} />
          </p>
          <hr className="border-slate-200" />
          <p className="text-lg font-semibold text-slate-900">
            Estimated total: <PriceText value={estimatedTotal} />
          </p>
          <p className="text-xs text-slate-500">
            Shipping fee rule: subtotal {'<'} 500,000 VND = 30,000 VND, otherwise free.
          </p>
        </aside>
      </div>
    </section>
  )
}
