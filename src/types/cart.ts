export type CartItemStatus = "BEFORE_PAYMENT"

export type CartItem = {
  cartItemId: number
  productId: number
  productName: string
  thumbnailUrl: string
  productPrice: number
  status: CartItemStatus | string
}

export type Cart = {
  cartId: number | null
  items: CartItem[]
}
