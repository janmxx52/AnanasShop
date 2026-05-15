import { http } from '@/lib/http'
import { extractResponseData } from '@/lib/api-helpers'
import type { VoucherCheckResult } from '@/types/voucher'

export type VoucherCheckPayload = {
  code: string
}

export const voucherApi = {
  async checkVoucher(payload: VoucherCheckPayload): Promise<VoucherCheckResult> {
    const response = await http.post('/vouchers/check', payload)
    return extractResponseData<VoucherCheckResult>(response.data)
  },
}
