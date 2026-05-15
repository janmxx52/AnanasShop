import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { wishlistApi } from '@/api/wishlist.api'
import { useAuth } from '@/app/AuthContext'
import { Button } from '@/components/ui/Button'
import { getApiErrorInfo } from '@/lib/api-helpers'

type WishlistButtonProps = {
  productId: number
  initialInWishlist?: boolean
  onChanged?: (inWishlist: boolean) => void
  className?: string
}

export function WishlistButton({
  productId,
  initialInWishlist = false,
  onChanged,
  className = '',
}: WishlistButtonProps) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isInWishlist, setIsInWishlist] = useState(initialInWishlist)
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    setIsInWishlist(initialInWishlist)
  }, [initialInWishlist])

  const handleToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
      return
    }

    setIsProcessing(true)
    setMessage(null)

    try {
      const result = await wishlistApi.toggle({ product_id: productId })
      const nextState = result.action === 'added'
      setIsInWishlist(nextState)
      setMessage(result.message)
      onChanged?.(nextState)
    } catch (error) {
      const apiError = getApiErrorInfo(error)
      setMessage(apiError.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <Button type="button" variant="secondary" isLoading={isProcessing} onClick={() => void handleToggle()}>
        {isInWishlist ? 'Remove wishlist' : 'Add wishlist'}
      </Button>
      {message ? <p className="text-xs text-slate-600">{message}</p> : null}
    </div>
  )
}
