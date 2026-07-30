import { apiClient } from "@/lib/apiClient"
import { unwrapData } from "@/lib/apiResponse"
import { USE_MOCKS } from "@/lib/runtime"
import type { ApiResponse } from "@/types/api"
import type {
  CreateOfferRequest,
  Offer,
  OfferSnapshot,
  OfferStatus,
} from "@/types/order"

export async function createOfferSnapshot(productId: number) {
  if (USE_MOCKS) {
    return {
      snapshotId: Date.now(),
      productId,
      modelNumberSnapshot: `DEAR-${productId}`,
      priceSnapshot: 145000,
    }
  }

  const { data } = await apiClient.post<ApiResponse<OfferSnapshot>>(
    "/api/offers/snapshot",
    { productId }
  )
  return unwrapData(data)
}

export async function createOffer(request: CreateOfferRequest) {
  if (USE_MOCKS) {
    return {
      id: Date.now(),
      number: `OF-MOCK-${Date.now()}`,
      status: "PENDING" as const,
      paymentStatus: "PAID",
      productId: 1,
      snapshotId: request.snapshotId,
      amount: 145000,
      title: request.title,
      story: request.story,
      delivery: request.delivery,
    }
  }

  const { data } = await apiClient.post<ApiResponse<Offer>>(
    "/api/offers",
    request
  )
  return unwrapData(data)
}

export async function getOffersByProduct(
  productId: number,
  statuses?: OfferStatus[]
) {
  const { data } = await apiClient.get<ApiResponse<Offer[]>>(
    `/api/offers/products/${productId}`,
    { params: { statuses } }
  )
  return unwrapData(data)
}

export async function getOffer(offerId: number) {
  const { data } = await apiClient.get<ApiResponse<Offer>>(
    `/api/offers/${offerId}`
  )
  return unwrapData(data)
}

export async function acceptOffer(offerId: number) {
  await apiClient.patch<ApiResponse<void>>(`/api/offers/${offerId}/accept`)
}

export async function rejectOffer(offerId: number) {
  await apiClient.patch<ApiResponse<void>>(`/api/offers/${offerId}/reject`)
}
