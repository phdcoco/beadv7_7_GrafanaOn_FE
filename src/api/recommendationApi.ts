import { apiClient } from "@/lib/apiClient"
import { unwrapData } from "@/lib/apiResponse"
import { isAuthenticated } from "@/lib/authStorage"
import { USE_MOCKS } from "@/lib/runtime"
import type { ApiResponse } from "@/types/api"
import type {
  RecommendationResult,
  SimilarRecommendationItem,
  TrackBehaviorInput,
  TrackBehaviorRequest,
} from "@/types/recommendation"

export async function getRecommendations(limit = 10) {
  if (!isAuthenticated()) {
    return {
      recommendationId: null,
      items: [],
    } satisfies RecommendationResult
  }

  if (USE_MOCKS) {
    return {
      recommendationId: "mock-recommendation",
      items: [],
    } satisfies RecommendationResult
  }

  const { data } = await apiClient.get<ApiResponse<RecommendationResult>>(
    "/api/recommendations",
    { params: { limit } }
  )

  return unwrapData(data)
}

export async function getSimilarRecommendations(productId: number, size = 10) {
  if (!isAuthenticated()) {
    return [] satisfies SimilarRecommendationItem[]
  }

  if (USE_MOCKS) {
    return [] satisfies SimilarRecommendationItem[]
  }

  const { data } = await apiClient.get<
    ApiResponse<SimilarRecommendationItem[]>
  >("/api/recommendations/similar", {
    params: { productId, size },
  })

  return unwrapData(data)
}

export async function trackBehavior(input: TrackBehaviorInput) {
  if (USE_MOCKS || !isAuthenticated()) {
    return
  }

  const request: TrackBehaviorRequest = {
    eventId: input.eventId ?? createEventId(),
    recommendationId: input.recommendationId,
    memberId: input.memberId,
    productId: input.productId,
    eventType: input.eventType,
    occurredAt: toLocalDateTime(input.occurredAt ?? new Date()),
  }

  await apiClient.post<ApiResponse<void>>("/api/behaviors", request)
}

export function trackBehaviorSilently(input: TrackBehaviorInput) {
  void trackBehavior(input).catch(() => undefined)
}

function createEventId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }

  const randomValues = crypto.getRandomValues(new Uint32Array(2))
  return `${Date.now()}-${randomValues[0]}-${randomValues[1]}`
}

function toLocalDateTime(date: Date) {
  const pad = (value: number, length = 2) =>
    String(value).padStart(length, "0")

  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(
      date.getMilliseconds(),
      3
    )}`,
  ].join("T")
}
