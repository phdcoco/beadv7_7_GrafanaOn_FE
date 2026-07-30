export type PurchaseStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PAYMENT_FAILED"
  | "CANCELLED"
  | "EXPIRED"
  | "PURCHASE_CONFIRMED"
  | "REFUNDED"

export type Purchase = {
  id: number
  number: string
  status: PurchaseStatus
  productId: number
  amount: number
  purchasedAt: string
  paymentDueAt: string
  delivery: string
}

export type CreatePurchaseRequest = {
  productId: number
  delivery: string
}

export type OfferStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "CANCELLED"
  | "PRODUCT_DELETED"

export type Offer = {
  id: number
  number: string
  status: OfferStatus
  paymentStatus: string
  buyerId?: number
  sellerId?: number
  productId: number
  snapshotId: number
  amount: number
  title: string
  story: string
  delivery: string
  insertedAt?: string
  updatedAt?: string
}

export type OfferSnapshot = {
  snapshotId: number
  productId: number
  modelNumberSnapshot: string
  priceSnapshot: number
}

export type CreateOfferRequest = {
  snapshotId: number
  title: string
  story: string
  delivery: string
}
