import { apiClient } from "@/lib/apiClient"
import { unwrapData } from "@/lib/apiResponse"
import { USE_MOCKS } from "@/lib/runtime"
import type { ApiResponse } from "@/types/api"
import type { CreatePurchaseRequest, Purchase } from "@/types/order"

export async function createPurchase(request: CreatePurchaseRequest) {
  if (USE_MOCKS) {
    return {
      id: Date.now(),
      number: `PU-MOCK-${Date.now()}`,
      status: "PENDING_PAYMENT" as const,
      productId: request.productId,
      amount: 145000,
      purchasedAt: new Date().toISOString(),
      paymentDueAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      delivery: request.delivery,
    }
  }

  const { data } = await apiClient.post<ApiResponse<Purchase>>(
    "/api/purchases",
    request
  )
  return unwrapData(data)
}

export async function getMyPurchases() {
  if (USE_MOCKS) {
    return []
  }

  const { data } = await apiClient.get<ApiResponse<Purchase[]>>(
    "/api/purchases/me"
  )
  return unwrapData(data)
}

export async function getPurchase(purchaseId: number) {
  const { data } = await apiClient.get<ApiResponse<Purchase>>(
    `/api/purchases/${purchaseId}`
  )
  return unwrapData(data)
}

export async function cancelPurchase(purchaseId: number) {
  if (!USE_MOCKS) {
    await apiClient.delete<ApiResponse<void>>(
      `/api/purchases/${purchaseId}/cancel`
    )
  }
}
