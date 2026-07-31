import { Link } from "react-router-dom"
import { BookOpenText, UsersRound } from "lucide-react"
import { ProductScrapButton } from "@/components/product/ProductScrapButton"

type StoryCardProps = {
  productId: number
  writer: string
  title: string
  excerpt: string
  offerCount?: number
  image: string
}

export function StoryCard({
  productId,
  writer,
  title,
  excerpt,
  offerCount,
  image,
}: StoryCardProps) {
  const productPath = `/products/${productId}?saleType=OFFER`

  return (
    <article className="overflow-hidden border-y border-neutral-200 bg-white sm:rounded-lg sm:border">
      <header className="flex h-14 items-center gap-3 px-4">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-neutral-950">
          {writer.slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{writer}</p>
          <p className="text-[11px] text-neutral-400">상품에 담긴 이야기</p>
        </div>
        <span className="text-[11px] font-bold text-brand">오퍼구매</span>
      </header>

      <div className="relative">
        <Link to={productPath} aria-label={`${title} 상세 보기`}>
          <img
            src={image}
            alt={title}
            className="aspect-[4/5] w-full bg-neutral-100 object-cover"
          />
        </Link>
        <ProductScrapButton
          productId={productId}
          className="absolute bottom-2 right-2"
        />
      </div>
      <Link
        to={productPath}
        className="block px-4 pb-5 pt-4"
      >
        <h3 className="line-clamp-2 text-[15px] font-black leading-6">{title}</h3>
        <p className="mt-1.5 line-clamp-4 text-sm leading-6 text-neutral-600">
          <span className="mr-1.5 font-bold text-neutral-950">{writer}</span>
          {excerpt}
        </p>
        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-neutral-500">
            {offerCount ? (
              <>
                <UsersRound className="size-3.5" />
                오퍼 {offerCount.toLocaleString()}건
              </>
            ) : (
              <>
                <BookOpenText className="size-3.5" />
                상품 이야기
              </>
            )}
          </span>
          <span className="font-bold text-brand">
            이야기 더 보기
          </span>
        </div>
      </Link>
    </article>
  )
}
