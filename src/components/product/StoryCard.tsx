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
    <article className="min-w-0 overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <header className="flex h-12 items-center gap-2 px-3 sm:h-14 sm:gap-3 sm:px-4">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-black text-neutral-950 sm:size-8 sm:text-xs">
          {writer.slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold sm:text-sm">{writer}</p>
          <p className="truncate text-[10px] text-neutral-400 sm:text-[11px]">
            상품에 담긴 이야기
          </p>
        </div>
        <span className="hidden text-[11px] font-bold text-brand sm:block">
          오퍼구매
        </span>
      </header>

      <div className="relative">
        <Link to={productPath} aria-label={`${title} 상세 보기`}>
          <img
            src={image}
            alt={title}
            className="aspect-[4/5] w-full bg-neutral-100 object-contain"
          />
        </Link>
        <ProductScrapButton
          productId={productId}
          className="absolute bottom-2 right-2"
        />
      </div>
      <Link
        to={productPath}
        className="block px-3 pb-4 pt-3 sm:px-4 sm:pb-5 sm:pt-4"
      >
        <h3 className="line-clamp-2 text-[13px] font-black leading-[18px] sm:text-[15px] sm:leading-6">
          {title}
        </h3>
        <p className="mt-1.5 line-clamp-3 text-xs leading-5 text-neutral-600 sm:text-sm sm:leading-6">
          <span className="mr-1.5 font-bold text-neutral-950">{writer}</span>
          {excerpt}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2 text-[10px] sm:mt-4 sm:text-xs">
          <span className="flex min-w-0 items-center gap-1 truncate text-neutral-500">
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
          <span className="shrink-0 font-bold text-brand">더 보기</span>
        </div>
      </Link>
    </article>
  )
}
