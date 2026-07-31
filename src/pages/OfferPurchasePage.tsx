import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getProducts } from "@/api/productApi"
import { ProductCard } from "@/components/product/ProductCard"
import { StoryCard } from "@/components/product/StoryCard"
import {
  productCategoryOptions,
  type ProductCategoryFilter,
} from "@/constants/productCategories"
import { offerStories } from "@/data/mockProducts"
import { USE_MOCKS } from "@/lib/runtime"
import type { ProductListSort } from "@/types/product"

export function OfferPurchasePage() {
  const [category, setCategory] = useState<ProductCategoryFilter>("ALL")
  const [sort, setSort] = useState<ProductListSort>("DEFAULT")
  const productsQuery = useQuery({
    queryKey: ["products", "OFFER", "feed", category, sort],
    queryFn: () =>
      getProducts({
        saleType: "OFFER",
        status: "ON_SALE",
        category: category === "ALL" ? undefined : category,
        sort,
      }),
  })

  const products = useMemo(
    () => productsQuery.data ?? [],
    [productsQuery.data]
  )
  const visibleStories = useMemo(() => {
    const productIds = new Set(products.map((product) => product.id))
    return offerStories.filter((story) => productIds.has(story.productId))
  }, [products])
  const visibleProductCount = USE_MOCKS
    ? visibleStories.length
    : products.length

  return (
    <div className="pb-6">
      <div className="sticky top-16 z-20 border-b border-neutral-100 bg-white px-5 py-4 md:top-[72px] md:px-8">
        <h1 className="text-xl font-extrabold">오퍼구매</h1>
        <p className="mt-1 text-xs text-neutral-500">
          가격보다 먼저, 이 신발이 지나온 시간을 읽어보세요.
        </p>
        <div className="-mx-5 mt-4 no-scrollbar flex gap-5 overflow-x-auto bg-neutral-50 px-5 py-3 md:-mx-8 md:px-8">
          {productCategoryOptions.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`shrink-0 text-xs ${
                category === item.value
                  ? "font-extrabold text-neutral-950 underline decoration-brand decoration-2 underline-offset-4"
                  : "font-medium text-neutral-500"
              }`}
              onClick={() => setCategory(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex h-11 items-center justify-between">
          <span className="text-xs text-neutral-500">
            {visibleProductCount}개 상품
          </span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as ProductListSort)}
            className="bg-white text-xs font-bold text-neutral-700 outline-none"
            aria-label="상품 정렬"
          >
            <option value="DEFAULT">기본순</option>
            <option value="VIEW_COUNT">조회수 높은 순</option>
            <option value="PRICE_ASC">가격 낮은 순</option>
            <option value="PRICE_DESC">가격 높은 순</option>
          </select>
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
          {visibleStories.map((story) => (
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

      {!productsQuery.isLoading && visibleProductCount === 0 && (
        <p className="p-10 text-center text-sm text-neutral-500">
          선택한 카테고리의 오퍼 상품이 없습니다.
        </p>
      )}
    </div>
  )
}
