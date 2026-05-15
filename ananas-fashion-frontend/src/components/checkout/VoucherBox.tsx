import { useState } from 'react'
import { voucherApi } from '@/api/voucher.api'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PriceText } from '@/components/ui/PriceText'
import { getApiErrorInfo } from '@/lib/api-helpers'
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
  const [result, setResult] = useState<VoucherCheckResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const handleCheckVoucher = async () => {
    const code = voucherCode.trim()

    if (!code) {
      setErrorMessage('Please enter voucher code.')
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
    } catch (error) {
      const apiError = getApiErrorInfo(error)
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
      <h2 className="text-base font-semibold text-slate-900">Voucher</h2>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <Input
          label="Voucher code"
          placeholder="e.g. SALE10"
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
            Check
          </Button>
          <Button type="button" variant="secondary" onClick={clearVoucher} disabled={disabled}>
            Clear
          </Button>
        </div>
      </div>

      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}

      {result ? (
        <div className="grid grid-cols-1 gap-2 rounded border border-slate-200 bg-slate-50 p-3 text-sm sm:grid-cols-3">
          <p>
            <span className="text-slate-600">Subtotal:</span> <PriceText value={result.subtotal} />
          </p>
          <p>
            <span className="text-slate-600">Discount:</span> <PriceText value={result.discount} />
          </p>
          <p>
            <span className="text-slate-600">After voucher:</span> <PriceText value={result.total_after} />
          </p>
        </div>
      ) : null}
    </section>
  )
}
