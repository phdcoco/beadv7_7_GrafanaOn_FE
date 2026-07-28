import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { RefreshCw } from "lucide-react"
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

  const totalCount = productsQuery.data?.length ?? 0

  return (
    <div className="grid min-h-[calc(100vh-104px)] grid-rows-[auto_1fr] overflow-hidden rounded-lg border border-neutral-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-neutral-200 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-base font-semibold">상품 관리</h1>
            <p className="text-xs text-neutral-500">총 {totalCount}개</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={saleType}
            onChange={(event) => setSaleType(event.target.value as ProductSaleType | "")}
            aria-label="판매 방식"
          >
            <option value="">판매방식 전체</option>
            <option value="IMMEDIATE">즉시구매</option>
            <option value="OFFER">오퍼</option>
          </Select>
          <Select
            value={status}
            onChange={(event) => setStatus(event.target.value as ProductStatus | "")}
            aria-label="상품 상태"
          >
            <option value="">상태 전체</option>
            <option value="PREPARING">공개 예정</option>
            <option value="ON_SALE">판매 중</option>
            <option value="SOLD_OUT">판매 완료</option>
          </Select>
          <Button
            variant="secondary"
            size="icon"
            aria-label="새로고침"
            onClick={() => productsQuery.refetch()}
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead className="sticky top-0 bg-neutral-50 text-xs text-neutral-500">
            <tr>
              <th className="w-[88px] px-4 py-3 font-medium">이미지</th>
              <th className="px-4 py-3 font-medium">상품</th>
              <th className="px-4 py-3 font-medium">판매방식</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">가격</th>
              <th className="px-4 py-3 font-medium">조회수</th>
            </tr>
          </thead>
          <tbody>
            {productsQuery.isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-neutral-500">
                  상품을 불러오는 중입니다.
                </td>
              </tr>
            )}

            {productsQuery.isError && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-red-600">
                  상품 목록을 불러오지 못했습니다.
                </td>
              </tr>
            )}

            {productsQuery.data?.map((product) => (
              <tr key={product.id} className="border-t border-neutral-100">
                <td className="px-4 py-3">
                  <img
                    src={product.url}
                    alt={product.name}
                    className="size-14 rounded-md object-cover"
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/products/${product.id}`}
                    className="font-medium hover:underline"
                  >
                    {product.name}
                  </Link>
                  <p className="mt-1 text-xs text-neutral-500">{product.brand}</p>
                </td>
                <td className="px-4 py-3 text-neutral-700">{product.saleType}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-neutral-100 px-2 py-1 text-xs font-medium">
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">
                  {formatPrice(product.price)}원
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {product.viewCount.toLocaleString()}
                </td>
              </tr>
            ))}

            {productsQuery.data?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-neutral-500">
                  조건에 맞는 상품이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
