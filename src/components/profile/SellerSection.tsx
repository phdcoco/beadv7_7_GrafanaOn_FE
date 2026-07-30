import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  Eye,
  Plus,
  ReceiptText,
  Store,
} from "lucide-react"
import { getSellerAccount } from "@/api/memberApi"
import { getMySellerProducts } from "@/api/productApi"
import { getApiErrorMessage } from "@/lib/apiClient"
import { formatPrice } from "@/lib/format"
import type { ProductStatus } from "@/types/product"

const statusLabels: Record<ProductStatus, string> = {
  PREPARING: "공개 예정",
  ON_SALE: "판매 중",
  SOLD_OUT: "판매 완료",
}

export function SellerSection() {
  const sellerQuery = useQuery({
    queryKey: ["seller-account", "me"],
    queryFn: getSellerAccount,
  })
  const sellerAccount = sellerQuery.data
  const productsQuery = useQuery({
    queryKey: ["seller-products", "me"],
    queryFn: getMySellerProducts,
    enabled: Boolean(sellerAccount),
  })

  if (sellerQuery.isLoading) {
    return <div className="h-36 animate-pulse border-b border-neutral-100 bg-neutral-50" />
  }

  if (sellerQuery.isError) {
    return (
      <section className="border-b border-neutral-100 px-5 py-6 md:px-8">
        <p className="text-sm font-bold">판매자 정보를 불러오지 못했습니다.</p>
        <p className="mt-2 text-xs text-neutral-500">
          {getApiErrorMessage(sellerQuery.error)}
        </p>
      </section>
    )
  }

  if (!sellerAccount) {
    return (
      <section className="border-b border-neutral-100 px-5 py-6 md:px-8">
        <div className="flex items-start gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
            <Store className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-black">판매자로 활동해 보세요</p>
            <p className="mt-1 text-sm leading-6 text-neutral-500">
              정산 계좌를 등록하면 즉시구매와 오퍼 상품을 판매할 수 있어요.
            </p>
          </div>
        </div>
        <Link
          to="/seller/register"
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-brand text-sm font-black text-neutral-950"
        >
          판매자 등록
          <ArrowRight className="size-4" />
        </Link>
      </section>
    )
  }

  const products = productsQuery.data ?? []

  return (
    <section className="border-b border-neutral-100 py-6">
      <div className="flex items-start justify-between gap-4 px-5 md:px-8">
        <div>
          <div className="flex items-center gap-2">
            <Store className="size-5" />
            <h2 className="text-base font-black">판매자 센터</h2>
            <span className="rounded bg-brand/15 px-2 py-1 text-[10px] font-black text-neutral-900">
              SELLER
            </span>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            {sellerAccount.bank} · {sellerAccount.account}
          </p>
        </div>
        <Link
          to="/sell/products/new"
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-md bg-neutral-950 px-3 text-xs font-bold text-white"
        >
          <Plus className="size-3.5" />
          상품 등록
        </Link>
      </div>

      <div className="mt-5 flex items-center justify-between px-5 md:px-8">
        <div className="flex items-center gap-2">
          <ReceiptText className="size-4 text-neutral-500" />
          <p className="text-sm font-bold">내 판매 상품</p>
        </div>
        <span className="text-xs text-neutral-400">{products.length}개</span>
      </div>

      {productsQuery.isLoading && (
        <div className="mx-5 mt-4 h-24 animate-pulse rounded-md bg-neutral-100 md:mx-8" />
      )}

      {productsQuery.isError && (
        <p className="mx-5 mt-4 text-sm text-red-600 md:mx-8">
          {getApiErrorMessage(productsQuery.error)}
        </p>
      )}

      {!productsQuery.isLoading &&
        !productsQuery.isError &&
        products.length === 0 && (
          <div className="mx-5 mt-4 border border-dashed border-neutral-300 px-4 py-6 text-center md:mx-8">
            <p className="text-sm font-bold">아직 등록한 상품이 없습니다.</p>
            <p className="mt-1 text-xs text-neutral-500">
              첫 상품은 다음 오후 8시에 공개돼요.
            </p>
          </div>
        )}

      {products.length > 0 && (
        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto px-5 md:px-8">
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.id}${
                product.saleType ? `?saleType=${product.saleType}` : ""
              }`}
              className="group w-40 shrink-0"
            >
              <div className="relative overflow-hidden rounded-md bg-neutral-100">
                <img
                  src={product.url}
                  alt={product.name}
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <span className="absolute left-2 top-2 rounded bg-neutral-950/80 px-2 py-1 text-[10px] font-bold text-white">
                  {statusLabels[product.status]}
                </span>
              </div>
              <p className="mt-2 truncate text-xs text-neutral-500">
                {product.brand}
              </p>
              <p className="mt-1 line-clamp-2 text-sm font-bold leading-5">
                {product.name}
              </p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="text-sm font-black">
                  {formatPrice(product.price)}원
                </p>
                <span className="flex items-center gap-1 text-[10px] text-neutral-400">
                  <Eye className="size-3" />
                  {product.viewCount}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
