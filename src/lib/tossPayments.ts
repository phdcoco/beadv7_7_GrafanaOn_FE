import { loadTossPayments } from "@tosspayments/tosspayments-sdk"
import type { ChargePreparation } from "@/types/financial"

type ChargeRedirects = {
  successUrl: string
  failUrl: string
}

export async function requestTossCharge(
  charge: ChargePreparation,
  redirects: ChargeRedirects
) {
  const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY

  if (!clientKey) {
    throw new Error("토스페이먼츠 클라이언트 키가 설정되지 않았습니다.")
  }

  const tossPayments = await loadTossPayments(clientKey)
  const payment = tossPayments.payment({
    customerKey: `customer_${crypto.randomUUID()}`,
  })

  await payment.requestPayment({
    method: "CARD",
    amount: {
      currency: "KRW",
      value: charge.amount,
    },
    orderId: charge.orderId,
    orderName: charge.orderName,
    successUrl: redirects.successUrl,
    failUrl: redirects.failUrl,
  })
}
