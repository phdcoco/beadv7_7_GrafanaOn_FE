import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getProducts } from "@/api/productApi"
import { ProductCard } from "@/components/product/ProductCard"
import {
  productCategoryOptions,
  type ProductCategoryFilter,
} from "@/constants/productCategories"
import type { ProductListSort } from "@/types/product"

export function ImmediatePurchasePage() {
  const [category, setCategory] = useState<ProductCategoryFilter>("ALL")
  const [sort, setSort] = useState<ProductListSort>("DEFAULT")

  const productsQuery = useQuery({
    queryKey: ["products", "IMMEDIATE", "grid", category, sort],
    queryFn: () =>
      getProducts({
        saleType: "IMMEDIATE",
        status: "ON_SALE",
        category: category === "ALL" ? undefined : category,
        sort,
      }),
  })

  const products = productsQuery.data ?? []

  return (
    <div>
      <div className="sticky top-16 z-20 border-b border-neutral-200 bg-white md:top-[72px]">
        <div className="no-scrollbar flex gap-5 overflow-x-auto bg-neutral-50 px-4 py-3 md:px-8">
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

        <div className="flex h-11 items-center justify-between px-4 text-xs text-neutral-500 md:px-8">
          <span>{products.length}개 상품</span>
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

      {!productsQuery.isLoading && products.length === 0 && (
        <p className="p-10 text-center text-sm text-neutral-500">
          선택한 카테고리의 즉시구매 상품이 없습니다.
        </p>
      )}
    </div>
  )
}
