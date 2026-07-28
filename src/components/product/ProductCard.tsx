import { Link } from "react-router-dom"
import { Bookmark, Eye } from "lucide-react"
import { formatPrice } from "@/lib/format"
import type { ProductSummary } from "@/types/product"

type ProductCardProps = {
  product: ProductSummary
  compact?: boolean
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  return (
    <Link
      to={`/products/${product.id}?saleType=${product.saleType}`}
      className={compact ? "group block min-w-0" : "group block w-44 shrink-0"}
    >
      <div className="relative overflow-hidden rounded-lg bg-neutral-100">
        <img
          src={product.url}
          alt={product.name}
          className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
        <span className="absolute left-2 top-2 rounded bg-neutral-950/78 px-1.5 py-1 text-[10px] font-semibold text-white">
          {product.saleType === "IMMEDIATE" ? "즉시구매" : "이야기"}
        </span>
        <span
          className="absolute bottom-2 right-2 flex size-7 items-center justify-center rounded-full bg-white/92 text-neutral-700"
          aria-hidden="true"
        >
          <Bookmark className="size-4" />
        </span>
      </div>
      <div className="pt-2">
        <p className="text-[11px] text-neutral-500">{product.brand}</p>
        <p className="mt-0.5 line-clamp-2 min-h-9 text-[13px] font-medium leading-[18px] text-neutral-900">
          {product.name}
        </p>
        <p className="mt-1 text-sm font-bold">{formatPrice(product.price)}원</p>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-neutral-400">
          <Eye className="size-3" />
          {product.viewCount.toLocaleString()}명이 보는 중
        </p>
      </div>
    </Link>
  )
}
