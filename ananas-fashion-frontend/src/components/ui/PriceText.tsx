type PriceTextProps = {
  value: number | null | undefined
  className?: string
}

export function PriceText({ value, className = '' }: PriceTextProps) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return <span className={className}>-</span>
  }

  return (
    <span className={className}>
      {new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
      }).format(value)}
    </span>
  )
}
