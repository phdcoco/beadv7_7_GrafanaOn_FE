export type Wallet = {
  availableBalance: number
  heldBalance: number
}

export type ChargePreparation = {
  paymentId: number
  orderId: string
  amount: number
  orderName: string
}

export type ConfirmChargeRequest = {
  paymentKey: string
  orderId: string
  amount: number
}
