import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { wishlistApi } from '@/api/wishlist.api'
import { useAuth } from '@/app/AuthContext'
import { useToast } from '@/app/ToastContext'
import { Button } from '@/components/ui/Button'
import { parseApiError } from '@/lib/api-helpers'

type WishlistButtonProps = {
  productId: number
  initialInWishlist?: boolean
  onChanged?: (inWishlist: boolean) => void
  className?: string
  compact?: boolean
}

export function WishlistButton({
  productId,
  initialInWishlist = false,
  onChanged,
  className = '',
  compact = false,
}: WishlistButtonProps) {
  const { isAuthenticated } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [isInWishlist, setIsInWishlist] = useState(initialInWishlist)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    setIsInWishlist(initialInWishlist)
  }, [initialInWishlist])

  const handleToggle = async () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để dùng danh sách yêu thích.')
      navigate('/login', { state: { from: location } })
      return
    }

    setIsProcessing(true)

    try {
      const result = await wishlistApi.toggle({ product_id: productId })
      const nextState = result.action === 'added'
      setIsInWishlist(nextState)
      toast.success(result.message)
      onChanged?.(nextState)
    } catch (error) {
      const apiError = parseApiError(error)
      toast.error(apiError.message)
    } finally {
      setIsProcessing(false)
    }
  }

  if (compact) {
    return (
      <button
        type="button"
        aria-label={isInWishlist ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 bg-white text-lg text-neutral-900 transition hover:border-[#f15a24] hover:text-[#f15a24] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        disabled={isProcessing}
        onClick={() => void handleToggle()}
      >
        {isInWishlist ? '♥' : '♡'}
      </button>
    )
  }

  return (
    <div className={className}>
      <Button type="button" variant="secondary" isLoading={isProcessing} onClick={() => void handleToggle()}>
        {isInWishlist ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
      </Button>
    </div>
  )
}
