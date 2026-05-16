type RatingStarsProps = {
  rating: number
  max?: number
  className?: string
}

export function RatingStars({ rating, max = 5, className = '' }: RatingStarsProps) {
  const normalizedRating = Math.max(0, Math.min(max, Math.round(rating)))

  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`Đánh giá ${normalizedRating}/${max}`}>
      {Array.from({ length: max }).map((_, index) => (
        <span key={index} className={index < normalizedRating ? 'text-amber-500' : 'text-slate-300'}>
          ★
        </span>
      ))}
    </span>
  )
}
