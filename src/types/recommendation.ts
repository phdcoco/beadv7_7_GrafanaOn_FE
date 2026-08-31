export type BehaviorType =
  | "IMPRESSION"
  | "CLICK"
  | "VIEW"
  | "SCRAP"
  | "CART_ADD"
  | "PURCHASE"

export type TrackBehaviorRequest = {
  eventId: string
  recommendationId: string | null
  memberId: number
  productId: number
  eventType: BehaviorType
  occurredAt: string
}

export type TrackBehaviorInput = Omit<
  TrackBehaviorRequest,
  "eventId" | "occurredAt"
> & {
  eventId?: string
  occurredAt?: Date
}

export type RecommendationItem = {
  productId: number
  score: number
  rank: number
}

export type RecommendationResult = {
  recommendationId: string | null
  items: RecommendationItem[]
}

export type SimilarRecommendationItem = {
  productId: number
  rank: number
}
