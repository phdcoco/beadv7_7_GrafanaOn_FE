import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ChevronDown, SlidersHorizontal } from "lucide-react"
import { getProducts } from "@/api/productApi"
import { ProductCard } from "@/components/product/ProductCard"

const primaryFilters = ["NEW", "전체", "급상승", "오프라인", "부티크", "USED"]
const categories = [
  "전체",
  "스니커즈",
  "스포츠화",
  "구두",
  "부츠/워커",
  "샌들/슬리퍼",
  "패딩/퍼 신발",
]

export function ImmediatePurchasePage() {
  const [primaryFilter, setPrimaryFilter] = useState("NEW")
  const [category, setCategory] = useState("전체")

  const productsQuery = useQuery({
    queryKey: ["products", "IMMEDIATE", "grid"],
    queryFn: () =>
      getProducts({ saleType: "IMMEDIATE", status: "ON_SALE" }),
  })

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data])

  return (
    <div>
      <div className="sticky top-16 z-20 border-b border-neutral-200 bg-white md:top-[72px]">
        <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3 md:px-8">
          {primaryFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`h-10 shrink-0 rounded-md border px-3 text-sm font-semibold ${
                primaryFilter === filter
                  ? "border-brand bg-brand text-neutral-950"
                  : "border-neutral-200 bg-white text-neutral-600"
              }`}
              onClick={() => setPrimaryFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="no-scrollbar flex gap-5 overflow-x-auto bg-neutral-50 px-4 py-3 md:px-8">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={`shrink-0 text-xs ${
                category === item
                  ? "font-extrabold text-neutral-950 underline decoration-brand decoration-2 underline-offset-4"
                  : "font-medium text-neutral-500"
              }`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex h-12 items-center justify-between px-4 text-xs text-neutral-500 md:px-8">
          <span>{products.length}개 상품</span>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1" type="button">
              실시간
              <ChevronDown className="size-3.5" />
            </button>
            <button className="flex items-center gap-1" type="button">
              품절 포함
              <ChevronDown className="size-3.5" />
            </button>
            <button
              className="flex size-8 items-center justify-center rounded-md border border-neutral-200"
              type="button"
              aria-label="상세 필터"
            >
              <SlidersHorizontal className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-x-2 gap-y-7 px-3 py-4 sm:gap-x-4 sm:px-5 md:grid-cols-4 md:px-8 lg:grid-cols-5">
        {productsQuery.isLoading &&
          Array.from({ length: 9 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-square bg-neutral-100" />
              <div className="mt-2 h-3 w-1/2 bg-neutral-100" />
              <div className="mt-2 h-4 w-full bg-neutral-100" />
            </div>
          ))}
        {products.map((product) => (
          <ProductCard key={product.id} product={product} compact />
        ))}
      </div>
    </div>
  )
}
