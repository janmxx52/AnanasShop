import { Button } from '@/components/ui/Button'
import { RatingStars } from '@/components/review/RatingStars'
import type { ReviewItem } from '@/types/review'

type ReviewCardProps = {
  review: ReviewItem
  currentUserId?: number | null
  isDeleting?: boolean
  onDelete?: (reviewId: number) => void
}

export function ReviewCard({ review, currentUserId, isDeleting = false, onDelete }: ReviewCardProps) {
  const canDelete = Boolean(currentUserId && review.user?.id === currentUserId && onDelete)

  return (
    <article className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-900">{review.user?.name ?? 'Người dùng ẩn danh'}</p>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <RatingStars rating={review.rating} />
            <span>{new Date(review.created_at).toLocaleString('vi-VN')}</span>
          </div>
        </div>

        {canDelete ? (
          <Button type="button" variant="danger" isLoading={isDeleting} onClick={() => onDelete?.(review.id)}>
            Xóa
          </Button>
        ) : null}
      </div>

      {review.comment ? <p className="text-sm text-slate-700">{review.comment}</p> : null}

      {review.images.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {review.images.map((image) => (
            <div key={image.id} className="aspect-square overflow-hidden rounded bg-slate-100">
              <img src={image.image_url} alt={`Ảnh đánh giá ${review.id}-${image.id}`} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
      ) : null}
    </article>
  )
}
