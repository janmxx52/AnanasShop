export type CartOwner =
  | {
      type: 'guest'
      guest_token: string
    }
  | {
      type: 'user'
      user_id: number
    }

export type CartItem = {
  id: number
  product_id: number | null
  variant_id: number | null
  quantity: number
  unit_price: number | null
  subtotal: number | null
  image_url?: string | null
  product: {
    id: number
    name: string
    slug: string
    image_url?: string | null
    primary_image?: string | null
    images?: Array<{
      url: string
      is_primary?: boolean
    }>
  } | null
  variant: {
    id: number
    size: string
    color: string
    sku: string
    image_url?: string | null
  } | null
}

export type Cart = {
  id: number
  owner: CartOwner
  items: CartItem[]
  total: number
}
