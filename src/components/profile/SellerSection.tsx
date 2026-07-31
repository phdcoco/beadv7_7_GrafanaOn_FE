import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  CalendarDays,
  Eye,
  Inbox,
  LoaderCircle,
  Plus,
  ReceiptText,
  Store,
  Trash2,
  UserRoundX,
} from "lucide-react"
import { getSellerAccount, unregisterSeller } from "@/api/memberApi"
import { deleteProduct, getMySellerProducts } from "@/api/productApi"
import { getSettlementPreview } from "@/api/settlementApi"
import { getApiErrorMessage } from "@/lib/apiClient"
import { formatPrice } from "@/lib/format"
import type { ProductStatus, SellerProduct } from "@/types/product"

const statusLabels: Record<ProductStatus, string> = {
  PREPARING: "공개 예정",
  ON_SALE: "판매 중",
  SOLD_OUT: "판매 완료",
}

export function SellerSection() {
  const queryClient = useQueryClient()
  const settlementMonth = getNextSettlementMonth()
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
  const settlementQuery = useQuery({
    queryKey: ["settlement-preview", settlementMonth.value],
    queryFn: () => getSettlementPreview(settlementMonth.value),
    enabled: Boolean(sellerAccount),
  })

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: (_, productId) => {
      queryClient.setQueryData<SellerProduct[]>(
        ["seller-products", "me"],
        (products) => products?.filter((product) => product.id !== productId)
      )
      queryClient.removeQueries({
        queryKey: ["product-detail", productId],
      })
      void queryClient.invalidateQueries({ queryKey: ["products"] })
      void queryClient.invalidateQueries({ queryKey: ["search-products"] })
      void queryClient.invalidateQueries({ queryKey: ["scraps", "me"] })
    },
  })

  const unregisterMutation = useMutation({
    mutationFn: unregisterSeller,
    onSuccess: () => {
      queryClient.setQueryData(["seller-account", "me"], null)
      queryClient.removeQueries({ queryKey: ["seller-products", "me"] })
    },
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
  const hasActiveProducts = products.some(
    (product) =>
      product.status === "PREPARING" || product.status === "ON_SALE"
  )

  function handleDeleteProduct(product: SellerProduct) {
    const confirmed = window.confirm(
      `"${product.name}" 상품을 삭제할까요?\n삭제한 상품은 복구할 수 없습니다.`
    )

    if (confirmed) {
      deleteProductMutation.mutate(product.id)
    }
  }

  function handleUnregisterSeller() {
    const confirmed = window.confirm(
      "판매자 등록을 해지할까요?\n해지 후에는 상품을 등록할 수 없습니다."
    )

    if (confirmed) {
      unregisterMutation.mutate()
    }
  }

  return (
    <section className="border-b border-neutral-100 py-6">
      <div className="flex flex-col gap-4 px-5 sm:flex-row sm:items-start sm:justify-between md:px-8">
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
        <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
          <button
            type="button"
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md border border-neutral-300 px-3 text-xs font-bold text-neutral-600 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-300 sm:flex-none"
            title={
              hasActiveProducts
                ? "공개 예정 또는 판매 중인 상품을 먼저 삭제해 주세요."
                : "판매자 등록 해지"
            }
            disabled={
              productsQuery.isLoading ||
              productsQuery.isError ||
              hasActiveProducts ||
              unregisterMutation.isPending
            }
            onClick={handleUnregisterSeller}
          >
            {unregisterMutation.isPending ? (
              <LoaderCircle className="size-3.5 animate-spin" />
            ) : (
              <UserRoundX className="size-3.5" />
            )}
            등록 해지
          </button>
          <Link
            to="/sell/products/new"
            className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-neutral-950 px-3 text-xs font-bold text-white sm:flex-none"
          >
            <Plus className="size-3.5" />
            상품 등록
          </Link>
        </div>
      </div>

      <div className="mx-5 mt-5 grid grid-cols-[1fr_auto] items-center gap-4 border-y border-neutral-100 py-4 md:mx-8">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-brand" />
            <p className="text-xs font-bold text-neutral-500">
              {settlementMonth.label} 정산 예정
            </p>
          </div>
          <p className="mt-1 text-[11px] text-neutral-400">
            매월 1일 오전 5시 · 수수료 제외
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black">
            {settlementQuery.isLoading
              ? "-"
              : settlementQuery.isError
                ? "조회 실패"
                : `${formatPrice(settlementQuery.data?.netAmount ?? 0)}원`}
          </p>
          {settlementQuery.isError && (
            <button
              type="button"
              className="mt-1 text-[11px] font-bold text-red-600 underline"
              onClick={() => void settlementQuery.refetch()}
            >
              다시 불러오기
            </button>
          )}
        </div>
      </div>

      {settlementQuery.isError && (
        <p className="mx-5 mt-2 text-right text-[11px] text-red-600 md:mx-8">
          {getApiErrorMessage(settlementQuery.error)}
        </p>
      )}

      {hasActiveProducts && (
        <p className="mt-3 px-5 text-xs text-neutral-500 md:px-8">
          공개 예정 또는 판매 중인 상품을 모두 삭제하면 판매자 등록을
          해지할 수 있어요.
        </p>
      )}

      {unregisterMutation.isError && (
        <p className="mt-3 px-5 text-xs text-red-600 md:px-8">
          {getApiErrorMessage(unregisterMutation.error)}
        </p>
      )}

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

      {deleteProductMutation.isError && (
        <p className="mx-5 mt-4 text-sm text-red-600 md:mx-8">
          {getApiErrorMessage(deleteProductMutation.error)}
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
          {products.map((product) => {
            const productPath = `/products/${product.id}${
              product.saleType ? `?saleType=${product.saleType}` : ""
            }`
            const deleting =
              deleteProductMutation.isPending &&
              deleteProductMutation.variables === product.id

            return (
              <article key={product.id} className="group w-40 shrink-0">
                <div className="relative overflow-hidden rounded-md bg-neutral-100">
                  <Link
                    to={productPath}
                    aria-label={`${product.name} 상세 보기`}
                  >
                    <img
                      src={product.url}
                      alt={product.name}
                      className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </Link>
                  <span className="absolute left-2 top-2 rounded bg-neutral-950/80 px-2 py-1 text-[10px] font-bold text-white">
                    {statusLabels[product.status]}
                  </span>
                  {product.status !== "SOLD_OUT" && (
                    <button
                      type="button"
                      className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-sm transition hover:bg-white disabled:text-neutral-300"
                      aria-label={`${product.name} 삭제`}
                      disabled={deleteProductMutation.isPending}
                      onClick={() => handleDeleteProduct(product)}
                    >
                      {deleting ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </button>
                  )}
                </div>
                <Link to={productPath} className="block">
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
                {product.saleType === "OFFER" && (
                  <Link
                    to={`/seller/products/${product.id}/offers`}
                    className="mt-3 flex h-9 items-center justify-center gap-1.5 rounded-md border border-brand text-xs font-black text-brand"
                  >
                    <Inbox className="size-3.5" />
                    받은 오퍼
                  </Link>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function getNextSettlementMonth() {
  const now = new Date()
  const beforeCurrentMonthPayout =
    now.getDate() === 1 && now.getHours() < 5
  const payoutDate = new Date(
    now.getFullYear(),
    now.getMonth() + (beforeCurrentMonthPayout ? 0 : 1),
    1
  )
  const year = payoutDate.getFullYear()
  const month = payoutDate.getMonth() + 1

  return {
    value: `${year}-${String(month).padStart(2, "0")}`,
    label: `${month}월 1일`,
  }
}
