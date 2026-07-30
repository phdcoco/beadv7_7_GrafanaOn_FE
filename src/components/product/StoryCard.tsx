import { Link } from "react-router-dom"
import { BookOpenText } from "lucide-react"

type StoryCardProps = {
  productId: number
  writer: string
  title: string
  excerpt: string
  offerCount: number
  image: string
  horizontal?: boolean
}

export function StoryCard({
  productId,
  writer,
  title,
  excerpt,
  image,
  horizontal = false,
}: StoryCardProps) {
  return (
    <Link
      to={`/products/${productId}?saleType=OFFER`}
      className={
        horizontal
          ? "grid w-[18rem] shrink-0 grid-cols-[104px_1fr] overflow-hidden rounded-lg border border-neutral-200 bg-white"
          : "block overflow-hidden border-b border-neutral-200 bg-white sm:rounded-lg sm:border"
      }
    >
      <img
        src={image}
        alt=""
        className={
          horizontal
            ? "h-full min-h-48 w-full object-cover"
            : "aspect-[16/10] w-full object-cover"
        }
      />
      <div className={horizontal ? "flex min-w-0 flex-col p-3" : "p-4"}>
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-neutral-950">
            {writer.slice(0, 1)}
          </span>
          <span className="text-xs font-semibold">{writer}님의 이야기</span>
        </div>
        <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-5">{title}</h3>
        <p className="mt-2 line-clamp-3 text-xs leading-5 text-neutral-500">
          {excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between pt-4 text-xs">
          <span className="flex items-center gap-1 text-neutral-500">
            <BookOpenText className="size-3.5" />
            상품 이야기
          </span>
          <span className="font-semibold text-brand-700">이야기 읽기</span>
        </div>
      </div>
    </Link>
  )
}
