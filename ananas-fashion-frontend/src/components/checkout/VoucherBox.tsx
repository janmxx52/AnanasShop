import { useState } from 'react'
import { voucherApi } from '@/api/voucher.api'
import { useToast } from '@/app/ToastContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PriceText } from '@/components/ui/PriceText'
import { parseApiError } from '@/lib/api-helpers'
import type { VoucherCheckResult } from '@/types/voucher'

type VoucherBoxProps = {
  voucherCode: string
  onVoucherCodeChange: (value: string) => void
  onVoucherChecked: (value: VoucherCheckResult | null) => void
  disabled?: boolean
}

export function VoucherBox({
  voucherCode,
  onVoucherCodeChange,
  onVoucherChecked,
  disabled = false,
}: VoucherBoxProps) {
  const toast = useToast()
  const [result, setResult] = useState<VoucherCheckResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const handleCheckVoucher = async () => {
    const code = voucherCode.trim()

    if (!code) {
      const message = 'Vui lòng nhập mã giảm giá.'
      setErrorMessage(message)
      toast.info(message)
      setResult(null)
      onVoucherChecked(null)
      return
    }

    setIsChecking(true)
    setErrorMessage(null)

    try {
      const response = await voucherApi.checkVoucher({ code })
      setResult(response)
      onVoucherChecked(response)
      toast.success('Mã giảm giá hợp lệ. Giá trị giảm đã được cập nhật.')
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
      setErrorMessage(apiError.message)
      setResult(null)
      onVoucherChecked(null)
    } finally {
      setIsChecking(false)
    }
  }

  const clearVoucher = () => {
    onVoucherCodeChange('')
    setResult(null)
    setErrorMessage(null)
    onVoucherChecked(null)
  }

  return (
    <section className="space-y-4 border border-neutral-200 bg-white p-5">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-neutral-900">Mã giảm giá</h2>
        <p className="text-sm text-neutral-600">Mã chỉ được kiểm tra trước, sẽ áp dụng khi bạn đặt hàng.</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <Input
          label="Nhập mã giảm giá"
          placeholder="Ví dụ: SALE10"
          value={voucherCode}
          onChange={(event) => {
            onVoucherCodeChange(event.target.value)
            setResult(null)
            setErrorMessage(null)
            onVoucherChecked(null)
          }}
          disabled={disabled}
        />
        <div className="flex gap-2">
          <Button type="button" onClick={() => void handleCheckVoucher()} isLoading={isChecking} disabled={disabled}>
            Kiểm tra
          </Button>
          <Button type="button" variant="secondary" onClick={clearVoucher} disabled={disabled}>
            Xóa
          </Button>
        </div>
      </div>

      {errorMessage ? <p className="text-sm font-medium text-red-600">{errorMessage}</p> : null}

      {result ? (
        <div className="grid grid-cols-1 gap-2 border border-emerald-200 bg-emerald-50/60 p-3 text-sm sm:grid-cols-3">
          <p>
            <span className="text-neutral-600">Tạm tính:</span> <PriceText value={result.subtotal} />
          </p>
          <p>
            <span className="text-neutral-600">Giảm giá:</span> <PriceText value={result.discount} />
          </p>
          <p>
            <span className="text-neutral-600">Sau giảm giá:</span> <PriceText value={result.total_after} />
          </p>
        </div>
      ) : null}
    </section>
  )
}
