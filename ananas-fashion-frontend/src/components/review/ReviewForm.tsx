import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatFieldError } from '@/lib/api-helpers'
import type { CreateReviewPayload } from '@/types/review'

type ReviewFormProps = {
  isSubmitting: boolean
  submitMessage: string | null
  fieldErrors: Record<string, string[]> | null
  onSubmit: (payload: CreateReviewPayload) => Promise<boolean>
}

function firstImageError(errors: Record<string, string[]> | null) {
  if (!errors) {
    return null
  }

  return errors.images?.[0] ?? errors['images.0']?.[0] ?? errors['images.1']?.[0] ?? errors['images.2']?.[0] ?? null
}

export function ReviewForm({ isSubmitting, submitMessage, fieldErrors, onSubmit }: ReviewFormProps) {
  const [orderItemId, setOrderItemId] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [images, setImages] = useState<File[]>([])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parsedOrderItemId = Number(orderItemId)
    if (!parsedOrderItemId || parsedOrderItemId < 1) {
      return
    }

    const success = await onSubmit({
      order_item_id: parsedOrderItemId,
      rating,
      comment: comment.trim() || undefined,
      images: images.length > 0 ? images : undefined,
    })

    if (success) {
      setOrderItemId('')
      setRating(5)
      setComment('')
      setImages([])
    }
  }

  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-base font-semibold text-slate-900">Viết đánh giá</h2>
      <p className="text-xs text-slate-600">Bạn chỉ có thể đánh giá các sản phẩm đã giao thuộc đơn hàng của mình.</p>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <Input
          label="ID sản phẩm trong đơn"
          type="number"
          min={1}
          value={orderItemId}
          onChange={(event) => setOrderItemId(event.target.value)}
          error={formatFieldError(fieldErrors, 'order_item_id')}
          required
        />

        <label className="block space-y-1">
          <span className="block text-sm font-medium text-slate-700">Số sao</span>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
          >
            <option value={5}>5 - Tuyệt vời</option>
            <option value={4}>4 - Tốt</option>
            <option value={3}>3 - Trung bình</option>
            <option value={2}>2 - Kém</option>
            <option value={1}>1 - Rất tệ</option>
          </select>
          {formatFieldError(fieldErrors, 'rating') ? (
            <span className="text-xs text-red-600">{formatFieldError(fieldErrors, 'rating')}</span>
          ) : null}
        </label>

        <label className="block space-y-1">
          <span className="block text-sm font-medium text-slate-700">Nhận xét (tùy chọn)</span>
          <textarea
            className="min-h-24 w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn..."
          />
          {formatFieldError(fieldErrors, 'comment') ? (
            <span className="text-xs text-red-600">{formatFieldError(fieldErrors, 'comment')}</span>
          ) : null}
        </label>

        <label className="block space-y-1">
          <span className="block text-sm font-medium text-slate-700">Hình ảnh (tối đa 3)</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []).slice(0, 3)
              setImages(files)
            }}
            className="block w-full text-sm text-slate-700 file:mr-3 file:rounded file:border-0 file:bg-slate-200 file:px-3 file:py-2 file:text-sm file:font-medium"
          />
          {firstImageError(fieldErrors) ? <span className="text-xs text-red-600">{firstImageError(fieldErrors)}</span> : null}
          {images.length > 0 ? (
            <div className="text-xs text-slate-600">{images.map((file) => file.name).join(', ')}</div>
          ) : null}
        </label>

        <Button type="submit" isLoading={isSubmitting}>
          Gửi đánh giá
        </Button>

        {submitMessage ? <p className="text-sm text-slate-700">{submitMessage}</p> : null}
      </form>
    </section>
  )
}
