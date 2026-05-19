import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/AuthContext'
import { useToast } from '@/app/ToastContext'
import { cartApi } from '@/api/cart.api'
import { orderApi } from '@/api/order.api'
import { CheckoutOrderSummary } from '@/components/checkout/CheckoutOrderSummary'
import { CheckoutSteps } from '@/components/checkout/CheckoutSteps'
import { VoucherBox } from '@/components/checkout/VoucherBox'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { LoadingState } from '@/components/ui/LoadingState'
import { formatFieldError, parseApiError } from '@/lib/api-helpers'
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
  const { isAuthenticated, user } = useAuth()
  const toast = useToast()

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
      const apiError = parseApiError(error)
      setCartError(apiError.message)
    } finally {
      setIsLoadingCart(false)
    }
  }, [])

  useEffect(() => {
    void loadCart()
  }, [loadCart])

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
  const cartErrorMessage = fieldErrors?.cart?.[0] ?? null
  const cartItemsErrorMessage = fieldErrors?.cart_items?.[0] ?? null
  const voucherErrorMessage = fieldErrors?.voucher_code?.[0] ?? null

  const handleCheckoutSuccess = async (order: CheckoutResult) => {
    toast.success('Đặt hàng thành công.')
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
      const apiError = parseApiError(error)
      toast.error(apiError.message)
      setSubmitMessage(apiError.message)
      setFieldErrors(apiError.errors)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingCart) {
    return <LoadingState message="Đang tải thông tin thanh toán..." />
  }

  if (cartError) {
    return <ErrorState message={cartError} />
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="space-y-3">
        <EmptyState title="Giỏ hàng đang trống" description="Vui lòng thêm ít nhất một sản phẩm trước khi thanh toán." />
        <Link
          to="/products"
          className="inline-flex h-11 items-center justify-center rounded bg-slate-900 px-4 text-sm font-medium text-white"
        >
          Đi tới danh sách sản phẩm
        </Link>
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <CheckoutSteps current="checkout" />

      <header className="space-y-1 border-b border-neutral-200 pb-4">
        <h1 className="text-3xl font-extrabold uppercase tracking-[0.08em] text-neutral-900">Thanh toán</h1>
        <p className="text-sm text-neutral-600">Hoàn tất thông tin đặt hàng để tiếp tục.</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] xl:items-start">
        <div className="order-2 space-y-4 xl:order-1">
          {submitMessage &&
          submitMessage !== cartErrorMessage &&
          submitMessage !== cartItemsErrorMessage &&
          submitMessage !== voucherErrorMessage ? (
            <ErrorState message={submitMessage} />
          ) : null}

          {cartErrorMessage ? <ErrorState message={cartErrorMessage} /> : null}
          {cartItemsErrorMessage ? <ErrorState message={cartItemsErrorMessage} /> : null}
          {voucherErrorMessage ? <ErrorState message={voucherErrorMessage} /> : null}

          <section className="space-y-4 border border-neutral-200 bg-white p-5">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-neutral-900">Thông tin nhận hàng</h2>
              {isAuthenticated ? (
                <p className="text-sm text-neutral-600">
                  Bạn đang thanh toán bằng tài khoản{' '}
                  <span className="font-semibold text-neutral-900">{user?.email ?? 'đã đăng nhập'}</span>.
                </p>
              ) : (
                <p className="text-sm text-neutral-600">Vui lòng nhập đầy đủ thông tin để hệ thống giao hàng chính xác.</p>
              )}
            </div>

            {!isAuthenticated ? (
              <div className="space-y-3">
                <Input
                  label="Họ và tên"
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
                  label="Số điện thoại"
                  value={guestForm.phone}
                  onChange={(event) =>
                    setGuestForm((previous) => ({ ...previous, phone: event.target.value }))
                  }
                  error={formatFieldError(fieldErrors, 'phone')}
                  required
                />
                <Input
                  label="Địa chỉ giao hàng"
                  value={guestForm.shipping_address}
                  onChange={(event) =>
                    setGuestForm((previous) => ({
                      ...previous,
                      shipping_address: event.target.value,
                    }))
                  }
                  error={formatFieldError(fieldErrors, 'shipping_address')}
                  required
                />
                <Input
                  label="Ghi chú (tùy chọn)"
                  value={guestForm.note}
                  onChange={(event) => setGuestForm((previous) => ({ ...previous, note: event.target.value }))}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  label="Họ và tên người nhận"
                  value={userForm.shipping_name}
                  onChange={(event) =>
                    setUserForm((previous) => ({ ...previous, shipping_name: event.target.value }))
                  }
                  error={formatFieldError(fieldErrors, 'shipping_name')}
                  required
                />
                <Input
                  label="Số điện thoại"
                  value={userForm.shipping_phone}
                  onChange={(event) =>
                    setUserForm((previous) => ({ ...previous, shipping_phone: event.target.value }))
                  }
                  error={formatFieldError(fieldErrors, 'shipping_phone')}
                  required
                />
                <Input label="Email tài khoản" value={user?.email ?? ''} disabled />
                <Input
                  label="Địa chỉ giao hàng"
                  value={userForm.shipping_address}
                  onChange={(event) =>
                    setUserForm((previous) => ({
                      ...previous,
                      shipping_address: event.target.value,
                    }))
                  }
                  error={formatFieldError(fieldErrors, 'shipping_address')}
                  required
                />
                <Input
                  label="Ghi chú (tùy chọn)"
                  value={userForm.note}
                  onChange={(event) => setUserForm((previous) => ({ ...previous, note: event.target.value }))}
                />
              </div>
            )}
          </section>

          <section className="space-y-3 border border-neutral-200 bg-white p-5">
            <h2 className="text-lg font-bold text-neutral-900">Phương thức thanh toán</h2>
            <div className="rounded border border-neutral-300 bg-neutral-50 p-4">
              <p className="text-sm font-semibold text-neutral-900">Thanh toán khi nhận hàng (COD)</p>
              <p className="mt-1 text-sm text-neutral-600">Bạn thanh toán khi đơn hàng được giao thành công.</p>
            </div>
          </section>

          <VoucherBox
            voucherCode={voucherCode}
            onVoucherCodeChange={setVoucherCode}
            onVoucherChecked={setVoucherResult}
            disabled={isSubmitting}
          />
        </div>

        <div className="order-1 xl:order-2">
          <CheckoutOrderSummary
            cart={cart}
            subtotal={subtotal}
            discountAmount={discountAmount}
            shippingFee={estimatedShippingFee}
            estimatedTotal={estimatedTotal}
            isSubmitting={isSubmitting}
            onSubmit={submitCheckout}
          />
        </div>
      </div>
    </section>
  )
}
