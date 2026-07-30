import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Flame, Sparkles } from "lucide-react"
import { getProducts } from "@/api/productApi"
import { ProductCard } from "@/components/product/ProductCard"
import { StoryCard } from "@/components/product/StoryCard"
import { offerStories } from "@/data/mockProducts"
import { USE_MOCKS } from "@/lib/runtime"

const filters = [
  { label: "새로운 이야기", icon: Sparkles },
  { label: "많이 보는 이야기", icon: Flame },
]

export function OfferPurchasePage() {
  const [selectedFilter, setSelectedFilter] = useState(filters[0].label)
  const productsQuery = useQuery({
    queryKey: ["products", "OFFER", "feed"],
    queryFn: () => getProducts({ saleType: "OFFER", status: "ON_SALE" }),
  })

  const products = useMemo(() => {
    const items = [...(productsQuery.data ?? [])]

    if (selectedFilter === "많이 보는 이야기") {
      return items.sort((a, b) => b.viewCount - a.viewCount)
    }

    return items
  }, [productsQuery.data, selectedFilter])

  return (
    <div className="pb-6">
      <div className="sticky top-16 z-20 border-b border-neutral-100 bg-white px-5 py-4 md:top-[72px] md:px-8">
        <h1 className="text-xl font-extrabold">오퍼구매</h1>
        <p className="mt-1 text-xs text-neutral-500">
          가격보다 먼저, 이 신발이 지나온 시간을 읽어보세요.
        </p>
        <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              className={`flex h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-xs font-semibold ${
                selectedFilter === filter.label
                  ? "border-brand bg-brand text-neutral-950"
                  : "border-neutral-200 bg-white text-neutral-600"
              }`}
              onClick={() => setSelectedFilter(filter.label)}
            >
              <filter.icon className="size-4" />
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {productsQuery.isLoading && (
        <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3 md:p-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="aspect-square rounded-lg bg-neutral-100" />
              <div className="mt-3 h-4 bg-neutral-100" />
            </div>
          ))}
        </div>
      )}

      {productsQuery.isError && (
        <p className="p-10 text-center text-sm text-neutral-500">
          오퍼 상품을 불러오지 못했습니다.
        </p>
      )}

      {USE_MOCKS ? (
        <div className="grid md:grid-cols-2 md:gap-4 md:p-8 lg:grid-cols-3">
          {offerStories.map((story) => (
            <StoryCard key={story.productId} {...story} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-7 px-4 py-5 sm:grid-cols-3 md:px-8 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </div>
      )}

      {!productsQuery.isLoading && products.length === 0 && !USE_MOCKS && (
        <p className="p-10 text-center text-sm text-neutral-500">
          현재 공개된 오퍼 상품이 없습니다.
        </p>
      )}
    </div>
  )
}
