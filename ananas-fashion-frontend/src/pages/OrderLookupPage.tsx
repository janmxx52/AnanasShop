import { useEffect, useState, type FormEvent } from 'react'
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
import { parseApiError } from '@/lib/api-helpers'
import { getPaymentMethodLabel } from '@/lib/display-labels'
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

  const handleLookup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)
    setResult(null)

    const normalizedOrderCode = orderCode.trim()
    const normalizedEmail = email.trim()
    const normalizedPhone = phone.trim()

    if (!normalizedOrderCode) {
      setErrorMessage('Vui lòng nhập mã đơn hàng.')
      return
    }

    if (!normalizedEmail && !normalizedPhone) {
      setErrorMessage('Vui lòng nhập email hoặc số điện thoại để tra cứu.')
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
      const apiError = parseApiError(error)
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
        <h1 className="text-2xl font-semibold text-slate-900">Tra cứu đơn hàng</h1>
        <p className="text-sm text-slate-600">
          Nhập mã đơn hàng kèm email hoặc số điện thoại để tra cứu.
        </p>
      </header>

      <form onSubmit={handleLookup} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2">
        <Input
          label="Mã đơn hàng"
          value={orderCode}
          onChange={(event) => setOrderCode(event.target.value)}
          required
        />
        <Input
          label="Email (tùy chọn)"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          label="Số điện thoại (tùy chọn)"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />

        <div className="flex items-end gap-2">
          <Button type="submit" isLoading={isSubmitting}>
            Tra cứu
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
            Đặt lại
          </Button>
        </div>
      </form>

      {errorMessage ? <ErrorState message={errorMessage} /> : null}

      {result ? (
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <p>
              <span className="text-slate-600">Mã đơn hàng:</span> <strong>{result.order_code}</strong>
            </p>
            <p>
              <span className="text-slate-600">Trạng thái đơn hàng:</span>{' '}
              <OrderStatusBadge status={result.order_status} />
            </p>
            <p>
              <span className="text-slate-600">Ngày đặt:</span>{' '}
              {new Date(result.order_date).toLocaleString('vi-VN')}
            </p>
            <p>
              <span className="text-slate-600">Phương thức thanh toán:</span> <strong>{getPaymentMethodLabel(result.payment_method)}</strong>
            </p>
            <p>
              <span className="text-slate-600">Trạng thái thanh toán:</span>{' '}
              <PaymentStatusBadge status={result.payment_status} />
            </p>
            <p>
              <span className="text-slate-600">Tổng tiền:</span>{' '}
              <strong>
                <PriceText value={result.total} />
              </strong>
            </p>
            <p>
              <span className="text-slate-600">Số lượng:</span> <strong>{result.quantity}</strong>
            </p>
            <p className="sm:col-span-2">
              <span className="text-slate-600">Địa chỉ giao hàng:</span> {result.shipping_address}
            </p>
          </div>

          <OrderTimeline items={result.status_timeline} />
          <OrderItemsTable items={result.order_items} />
        </section>
      ) : null}
    </section>
  )
}
