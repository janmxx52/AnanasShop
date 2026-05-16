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
      toast.success('Đã áp dụng mã giảm giá để xem trước.')
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
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-base font-semibold text-slate-900">Mã giảm giá</h2>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <Input
          label="Mã giảm giá"
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

      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

      {result ? (
        <div className="grid grid-cols-1 gap-2 rounded border border-slate-200 bg-slate-50 p-3 text-sm sm:grid-cols-3">
          <p>
            <span className="text-slate-600">Tạm tính:</span> <PriceText value={result.subtotal} />
          </p>
          <p>
            <span className="text-slate-600">Giảm giá:</span> <PriceText value={result.discount} />
          </p>
          <p>
            <span className="text-slate-600">Sau giảm giá:</span> <PriceText value={result.total_after} />
          </p>
        </div>
      ) : null}
    </section>
  )
}
