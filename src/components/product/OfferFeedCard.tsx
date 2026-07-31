import { StoryCard } from "@/components/product/StoryCard"
import type { ProductSummary } from "@/types/product"

type OfferFeedCardProps = {
  product: ProductSummary
}

export function OfferFeedCard({ product }: OfferFeedCardProps) {
  const writer = product.writerNickname?.trim() || "판매자"
  const story =
    product.storyPreview?.trim() ||
    `${product.name}에 담긴 판매자의 이야기를 확인해 보세요.`

  return (
    <StoryCard
      productId={product.id}
      writer={writer}
      title={product.name}
      excerpt={story}
      image={product.url}
    />
  )
}
