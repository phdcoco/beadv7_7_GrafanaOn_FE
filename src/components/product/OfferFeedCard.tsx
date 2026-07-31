import { StoryCard } from "@/components/product/StoryCard"
import type { ProductSummary } from "@/types/product"

type OfferFeedCardProps = {
  product: ProductSummary
}

export function OfferFeedCard({ product }: OfferFeedCardProps) {
  return (
    <StoryCard
      productId={product.id}
      writer="판매자"
      title={product.name}
      excerpt="이 상품이 지나온 이야기를 사진과 함께 확인해 보세요."
      image={product.url}
    />
  )
}
