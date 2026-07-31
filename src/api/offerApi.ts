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

const mockOffersByProduct = new Map<number, Offer[]>()

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
  if (USE_MOCKS) {
    const offers = getMockOffers(productId)
    return statuses?.length
      ? offers.filter((offer) => statuses.includes(offer.status))
      : offers
  }

  const { data } = await apiClient.get<ApiResponse<Offer[]>>(
    `/api/offers/products/${productId}`,
    { params: { statuses: statuses?.join(",") } }
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
  if (USE_MOCKS) {
    updateMockOfferStatus(offerId, "ACCEPTED")
    return
  }

  await apiClient.patch<ApiResponse<void>>(`/api/offers/${offerId}/accept`)
}

export async function rejectOffer(offerId: number) {
  if (USE_MOCKS) {
    updateMockOfferStatus(offerId, "REJECTED")
    return
  }

  await apiClient.patch<ApiResponse<void>>(`/api/offers/${offerId}/reject`)
}

function getMockOffers(productId: number) {
  const storedOffers = mockOffersByProduct.get(productId)

  if (storedOffers) {
    return storedOffers
  }

  const offers: Offer[] = [
    {
      id: productId * 100 + 1,
      number: `OF-MOCK-${productId}-01`,
      status: "PENDING",
      paymentStatus: "PAID",
      productId,
      snapshotId: productId * 10 + 1,
      amount: 128000,
      title: "오래 찾던 신발이라 꼭 만나고 싶어요",
      story:
        "사진과 이야기를 모두 읽어봤어요. 저에게도 오래 기억에 남는 신발이 될 것 같아 오퍼를 보냅니다.",
      delivery: "서울특별시 마포구",
    },
    {
      id: productId * 100 + 2,
      number: `OF-MOCK-${productId}-02`,
      status: "PENDING",
      paymentStatus: "PAID",
      productId,
      snapshotId: productId * 10 + 2,
      amount: 128000,
      title: "다음 이야기를 이어가고 싶습니다",
      story:
        "소중하게 신다가 좋은 상태로 다시 이야기를 이어갈 수 있도록 관리하겠습니다.",
      delivery: "경기도 성남시",
    },
  ]

  mockOffersByProduct.set(productId, offers)
  return offers
}

function updateMockOfferStatus(offerId: number, status: OfferStatus) {
  for (const offers of mockOffersByProduct.values()) {
    const offer = offers.find((item) => item.id === offerId)

    if (offer) {
      if (offer.status !== "PENDING") {
        throw new Error("이미 처리된 오퍼입니다.")
      }

      offer.status = status
      return
    }
  }

  throw new Error("해당 오퍼를 찾을 수 없습니다.")
}
