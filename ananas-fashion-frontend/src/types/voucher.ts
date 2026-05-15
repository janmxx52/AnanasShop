export type VoucherCheckResult = {
  code: string
  type: 'percent' | 'fixed'
  value: number
  subtotal: number
  discount: number
  total_after: number
}
