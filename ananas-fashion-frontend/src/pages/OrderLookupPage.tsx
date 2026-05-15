import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { orderApi } from '@/api/order.api'
import { OrderItemsTable } from '@/components/order/OrderItemsTable'
import { OrderStatusBadge } from '@/components/order/OrderStatusBadge'
import { OrderTimeline } from '@/components/order/OrderTimeline'
import { PaymentStatusBadge } from '@/components/order/PaymentStatusBadge'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import { Input } from '@/components/ui/Input'
import { PriceText } from '@/components/ui/PriceText'
import { getApiErrorInfo } from '@/lib/api-helpers'
import type { OrderLookupResult } from '@/types/order'

const GENERIC_NOT_FOUND_MESSAGE = 'Không tìm thấy đơn hàng'

export function OrderLookupPage() {
  const [searchParams] = useSearchParams()
  const [orderCode, setOrderCode] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [result, setResult] = useState<OrderLookupResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const orderCodeParam = searchParams.get('order_code')
    const emailParam = searchParams.get('email')
    const phoneParam = searchParams.get('phone')

    if (orderCodeParam) {
      setOrderCode(orderCodeParam)
    }
    if (emailParam) {
      setEmail(emailParam)
    }
    if (phoneParam) {
      setPhone(phoneParam)
    }
  }, [searchParams])

  const handleLookup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setResult(null)

    const normalizedOrderCode = orderCode.trim()
    const normalizedEmail = email.trim()
    const normalizedPhone = phone.trim()

    if (!normalizedOrderCode) {
      setErrorMessage('Order code is required.')
      return
    }

    if (!normalizedEmail && !normalizedPhone) {
      setErrorMessage('Please provide email or phone to lookup order.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await orderApi.lookupOrder({
        order_code: normalizedOrderCode,
        email: normalizedEmail || undefined,
        phone: normalizedPhone || undefined,
      })

      setResult(response)
    } catch (error) {
      const apiError = getApiErrorInfo(error)
      if (apiError.status === 404) {
        setErrorMessage(GENERIC_NOT_FOUND_MESSAGE)
      } else {
        setErrorMessage(apiError.message || GENERIC_NOT_FOUND_MESSAGE)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">Order lookup</h1>
        <p className="text-sm text-slate-600">
          Lookup with order code + email or phone.
        </p>
      </header>

      <form onSubmit={handleLookup} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2">
        <Input
          label="Order code"
          value={orderCode}
          onChange={(event) => setOrderCode(event.target.value)}
          required
        />
        <Input
          label="Email (optional)"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          label="Phone (optional)"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />

        <div className="flex items-end gap-2">
          <Button type="submit" isLoading={isSubmitting}>
            Lookup
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setOrderCode('')
              setEmail('')
              setPhone('')
              setResult(null)
              setErrorMessage(null)
            }}
          >
            Reset
          </Button>
        </div>
      </form>

      {errorMessage ? <ErrorState message={errorMessage} /> : null}

      {result ? (
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <p>
              <span className="text-slate-600">Order code:</span> <strong>{result.order_code}</strong>
            </p>
            <p>
              <span className="text-slate-600">Order status:</span>{' '}
              <OrderStatusBadge status={result.order_status} />
            </p>
            <p>
              <span className="text-slate-600">Order date:</span>{' '}
              {new Date(result.order_date).toLocaleString('vi-VN')}
            </p>
            <p>
              <span className="text-slate-600">Payment method:</span> <strong>{result.payment_method}</strong>
            </p>
            <p>
              <span className="text-slate-600">Payment status:</span>{' '}
              <PaymentStatusBadge status={result.payment_status} />
            </p>
            <p>
              <span className="text-slate-600">Total:</span>{' '}
              <strong>
                <PriceText value={result.total} />
              </strong>
            </p>
            <p>
              <span className="text-slate-600">Quantity:</span> <strong>{result.quantity}</strong>
            </p>
            <p className="sm:col-span-2">
              <span className="text-slate-600">Shipping address:</span> {result.shipping_address}
            </p>
          </div>

          <OrderTimeline items={result.status_timeline} />
          <OrderItemsTable items={result.order_items} />
        </section>
      ) : null}
    </section>
  )
}
