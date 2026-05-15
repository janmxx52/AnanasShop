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
  product: {
    id: number
    name: string
    slug: string
  } | null
  variant: {
    id: number
    size: string
    color: string
    sku: string
  } | null
}

export type Cart = {
  id: number
  owner: CartOwner
  items: CartItem[]
  total: number
}
