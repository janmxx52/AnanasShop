import { http } from '@/lib/http'
import type { ApiSuccessEnvelope } from '@/types/api'

export type VoucherCheckPayload = {
  voucher_code: string
}

export const voucherApi = {
  check(payload: VoucherCheckPayload) {
    return http.post<ApiSuccessEnvelope<unknown>>('/vouchers/check', payload)
  },
}
