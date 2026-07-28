import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { Filter } from "lucide-react"
import { getProducts } from "@/api/productApi"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { formatPrice } from "@/lib/format"
import type { ProductSaleType, ProductStatus } from "@/types/product"

export function ProductListPage() {
  const [saleType, setSaleType] = useState<ProductSaleType | "">("")
  const [status, setStatus] = useState<ProductStatus | "">("")

  const productsQuery = useQuery({
    queryKey: ["products", saleType, status],
    queryFn: () =>
      getProducts({
        saleType: saleType || undefined,
        status: status || undefined,
      }),
  })

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-500">Marketplace</p>
          <h1 className="text-3xl font-semibold tracking-[0]">판매 상품</h1>
        </div>
        <div className="flex gap-2">
          <Select
            value={saleType}
            onChange={(event) => setSaleType(event.target.value as ProductSaleType | "")}
            aria-label="판매 방식"
          >
            <option value="">전체 판매방식</option>
            <option value="IMMEDIATE">즉시구매</option>
            <option value="OFFER">오퍼</option>
          </Select>
          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value as ProductStatus | "")}
            aria-label="상품 상태"
          >
            <option value="">전체 상태</option>
            <option value="PREPARING">공개 예정</option>
            <option value="ON_SALE">판매 중</option>
            <option value="SOLD_OUT">판매 완료</option>
          </Select>
          <Button variant="secondary" size="icon" aria-label="필터 적용">
            <Filter className="size-4" />
          </Button>
        </div>
      </div>

      {productsQuery.isLoading && (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
          상품을 불러오는 중입니다.
        </div>
      )}

      {productsQuery.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-sm text-red-700">
          상품 목록을 불러오지 못했습니다.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {productsQuery.data?.map((product) => (
          <Link
            key={product.id}
            to={`/products/${product.id}`}
            className="overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:border-neutral-400"
          >
            <div className="aspect-square bg-neutral-100">
              <img
                src={product.url}
                alt={product.name}
                className="size-full object-cover"
              />
            </div>
            <div className="space-y-2 p-4">
              <div className="flex items-center justify-between gap-2 text-xs text-neutral-500">
                <span>{product.brand}</span>
                <span>{product.saleType}</span>
              </div>
              <h2 className="line-clamp-2 min-h-10 text-sm font-semibold">
                {product.name}
              </h2>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">
                  {formatPrice(product.price)}원
                </span>
                <span className="text-neutral-500">조회 {product.viewCount}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {productsQuery.data?.length === 0 && (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500">
          조건에 맞는 상품이 없습니다.
        </div>
      )}
    </section>
  )
}
