import { apiClient } from "@/lib/apiClient"
import { unwrapData } from "@/lib/apiResponse"
import { USE_MOCKS } from "@/lib/runtime"
import { mockProducts } from "@/data/mockProducts"
import type { ApiResponse } from "@/types/api"
import type { CreatePurchaseRequest, Purchase } from "@/types/order"

const MOCK_PURCHASES_KEY = "dear-mock-purchases"

export async function createPurchase(request: CreatePurchaseRequest) {
  if (USE_MOCKS) {
    const now = Date.now()
    const product = mockProducts.find((item) => item.id === request.productId)
    const purchase: Purchase = {
      id: Date.now(),
      number: `PU-MOCK-${Date.now()}`,
      status: "PENDING_PAYMENT" as const,
      productId: request.productId,
      amount: product?.price ?? 0,
      purchasedAt: new Date(now).toISOString(),
      paymentDueAt: new Date(now + 5 * 60 * 1000).toISOString(),
      delivery: request.delivery,
    }

    writeMockPurchases([purchase, ...readMockPurchases()])
    return purchase
  }

  const { data } = await apiClient.post<ApiResponse<Purchase>>(
    "/api/purchases",
    request
  )
  return unwrapData(data)
}

export async function getMyPurchases() {
  if (USE_MOCKS) {
    return settleMockPurchases()
  }

  const { data } = await apiClient.get<ApiResponse<Purchase[]>>(
    "/api/purchases/me"
  )
  return unwrapData(data)
}

export async function getPurchase(purchaseId: number) {
  if (USE_MOCKS) {
    const purchase = settleMockPurchases().find(
      (item) => item.id === purchaseId
    )

    if (!purchase) {
      throw new Error("구매 내역을 찾을 수 없습니다.")
    }

    return purchase
  }

  const { data } = await apiClient.get<ApiResponse<Purchase>>(
    `/api/purchases/${purchaseId}`
  )
  return unwrapData(data)
}

export async function cancelPurchase(purchaseId: number) {
  if (USE_MOCKS) {
    writeMockPurchases(
      readMockPurchases().map((purchase) =>
        purchase.id === purchaseId
          ? { ...purchase, status: "CANCELLED" }
          : purchase
      )
    )
    return
  }

  await apiClient.delete<ApiResponse<void>>(
    `/api/purchases/${purchaseId}/cancel`
  )
}

function settleMockPurchases() {
  const purchases = readMockPurchases().map((purchase) => {
    const elapsed = Date.now() - new Date(purchase.purchasedAt).getTime()

    if (purchase.status === "PENDING_PAYMENT" && elapsed >= 900) {
      return { ...purchase, status: "PAID" as const }
    }

    return purchase
  })

  writeMockPurchases(purchases)
  return purchases
}

function readMockPurchases(): Purchase[] {
  try {
    const purchases = JSON.parse(
      localStorage.getItem(MOCK_PURCHASES_KEY) ?? "[]"
    )

    return Array.isArray(purchases) ? purchases : []
  } catch {
    return []
  }
}

function writeMockPurchases(purchases: Purchase[]) {
  localStorage.setItem(MOCK_PURCHASES_KEY, JSON.stringify(purchases))
}
