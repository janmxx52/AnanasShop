import { ReviewCard } from '@/components/review/ReviewCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { LoadingState } from '@/components/ui/LoadingState'
import type { ReviewItem } from '@/types/review'

type ReviewListProps = {
  reviews: ReviewItem[]
  isLoading: boolean
  errorMessage: string | null
  currentUserId?: number | null
  deletingReviewId?: number | null
  onDelete?: (reviewId: number) => void
}

export function ReviewList({
  reviews,
  isLoading,
  errorMessage,
  currentUserId,
  deletingReviewId = null,
  onDelete,
}: ReviewListProps) {
  if (isLoading) {
    return <LoadingState message="Đang tải đánh giá..." />
  }

  if (errorMessage) {
    return <ErrorState message={errorMessage} />
  }

  if (reviews.length === 0) {
    return <EmptyState title="Chưa có đánh giá" description="Hãy là người đầu tiên chia sẻ trải nghiệm về sản phẩm này." />
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          currentUserId={currentUserId}
          isDeleting={deletingReviewId === review.id}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
