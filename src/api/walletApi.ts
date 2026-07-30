import { apiClient } from "@/lib/apiClient"
import { unwrapData } from "@/lib/apiResponse"
import { USE_MOCKS } from "@/lib/runtime"
import type { ApiResponse } from "@/types/api"
import type {
  ChargePreparation,
  ConfirmChargeRequest,
  Wallet,
} from "@/types/financial"

let mockAvailableBalance = 280000
const confirmedMockOrders = new Set<string>()
const chargeConfirmationPromises = new Map<string, Promise<void>>()

export async function getMyWallet() {
  if (USE_MOCKS) {
    return { availableBalance: mockAvailableBalance, heldBalance: 92000 }
  }

  const { data } = await apiClient.get<ApiResponse<Wallet>>("/api/deposits/me")
  return unwrapData(data)
}

export async function prepareCharge(amount: number) {
  if (USE_MOCKS) {
    const paymentId = Date.now()

    return {
      paymentId,
      orderId: `TOPUP_MOCK_${paymentId}`,
      amount,
      orderName: "D:EAR 예치금 충전",
    } satisfies ChargePreparation
  }

  const { data } = await apiClient.post<ApiResponse<ChargePreparation>>(
    "/api/payments/charge",
    { amount }
  )

  return unwrapData(data)
}

export function confirmCharge(request: ConfirmChargeRequest) {
  const existingConfirmation = chargeConfirmationPromises.get(request.orderId)

  if (existingConfirmation) {
    return existingConfirmation
  }

  const confirmation = executeChargeConfirmation(request)
  chargeConfirmationPromises.set(request.orderId, confirmation)
  void confirmation.catch(() => {
    chargeConfirmationPromises.delete(request.orderId)
  })

  return confirmation
}

async function executeChargeConfirmation(request: ConfirmChargeRequest) {
  if (USE_MOCKS) {
    if (!confirmedMockOrders.has(request.orderId)) {
      confirmedMockOrders.add(request.orderId)
      mockAvailableBalance += request.amount
    }
    return
  }

  await apiClient.post<ApiResponse<void>>("/api/payments/confirm", request)
}
