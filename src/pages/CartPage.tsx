import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowRight,
  Check,
  LoaderCircle,
  ShoppingCart,
  Trash2,
} from "lucide-react"
import {
  deleteAllCartItems,
  deleteCartItems,
  getCart,
} from "@/api/cartApi"
import { getApiErrorMessage } from "@/lib/apiClient"
import { isAuthenticated } from "@/lib/authStorage"
import { formatPrice } from "@/lib/format"

export function CartPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const loggedIn = isAuthenticated()
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(
    new Set()
  )

  const cartQuery = useQuery({
    queryKey: ["cart", "me"],
    queryFn: getCart,
    enabled: loggedIn,
  })

  const deleteItemsMutation = useMutation({
    mutationFn: deleteCartItems,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cart", "me"] })
    },
  })

  const deleteAllMutation = useMutation({
    mutationFn: deleteAllCartItems,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cart", "me"] })
    },
  })

  const items = cartQuery.data?.items ?? []
  const allSelected =
    items.length > 0 && selectedProductIds.size === items.length
  const selectedTotal = items
    .filter((item) => selectedProductIds.has(item.productId))
    .reduce((total, item) => total + item.productPrice, 0)
  const selectedItem = items.find((item) =>
    selectedProductIds.has(item.productId)
  )
  const canCheckout = selectedProductIds.size === 1 && Boolean(selectedItem)
  const mutationPending =
    deleteItemsMutation.isPending || deleteAllMutation.isPending
  const mutationError = deleteItemsMutation.error ?? deleteAllMutation.error

  useEffect(() => {
    setSelectedProductIds(
      new Set(cartQuery.data?.items.map((item) => item.productId) ?? [])
    )
  }, [cartQuery.data])

  if (!loggedIn) {
    return <GuestCart />
  }

  function toggleItem(productId: number) {
    setSelectedProductIds((current) => {
      const next = new Set(current)

      if (next.has(productId)) {
        next.delete(productId)
      } else {
        next.add(productId)
      }

      return next
    })
  }

  function toggleAll() {
    setSelectedProductIds(
      allSelected ? new Set() : new Set(items.map((item) => item.productId))
    )
  }

  return (
    <div className="mx-auto min-h-[calc(100vh-64px)] max-w-[840px] pb-32">
      <header className="border-b border-neutral-100 px-5 py-6 md:px-8">
        <p className="text-xs font-bold text-neutral-400">MY CART</p>
        <div className="mt-1 flex items-end justify-between gap-4">
          <h1 className="text-xl font-black">장바구니</h1>
          <p className="text-xs font-semibold text-neutral-500">
            {items.length}개 상품
          </p>
        </div>
      </header>

      {cartQuery.isLoading && (
        <div className="flex min-h-72 items-center justify-center">
          <LoaderCircle className="size-6 animate-spin text-brand" />
        </div>
      )}

      {cartQuery.isError && (
        <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
          <p className="text-sm font-bold">장바구니를 불러오지 못했습니다.</p>
          <p className="mt-2 text-xs text-neutral-500">
            {getApiErrorMessage(cartQuery.error)}
          </p>
          <button
            type="button"
            className="mt-5 h-10 rounded-md border border-neutral-300 px-4 text-sm font-bold"
            onClick={() => void cartQuery.refetch()}
          >
            다시 불러오기
          </button>
        </div>
      )}

      {cartQuery.isSuccess && items.length === 0 && <EmptyCart />}

      {items.length > 0 && (
        <>
          <div className="flex h-12 items-center justify-between border-b border-neutral-100 px-5 md:px-8">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-bold">
              <CartCheckbox checked={allSelected} onChange={toggleAll} />
              전체 선택
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="text-xs font-bold text-neutral-500 hover:text-neutral-950 disabled:text-neutral-300"
                disabled={selectedProductIds.size === 0 || mutationPending}
                onClick={() =>
                  deleteItemsMutation.mutate(Array.from(selectedProductIds))
                }
              >
                선택 삭제
              </button>
              <button
                type="button"
                className="text-xs font-bold text-neutral-500 hover:text-neutral-950"
                disabled={mutationPending}
                onClick={() => deleteAllMutation.mutate()}
              >
                전체 비우기
              </button>
            </div>
          </div>

          <section className="divide-y divide-neutral-100">
            {items.map((item) => (
              <article
                key={item.cartItemId}
                className="grid grid-cols-[24px_88px_minmax(0,1fr)] gap-3 px-5 py-5 md:grid-cols-[24px_112px_minmax(0,1fr)] md:px-8"
              >
                <div className="pt-1">
                  <CartCheckbox
                    checked={selectedProductIds.has(item.productId)}
                    onChange={() => toggleItem(item.productId)}
                    label={`${item.productName} 선택`}
                  />
                </div>

                <Link
                  to={`/products/${item.productId}?saleType=IMMEDIATE`}
                  className="overflow-hidden rounded-md bg-neutral-100"
                >
                  <img
                    src={item.thumbnailUrl}
                    alt={item.productName}
                    className="aspect-square size-full object-cover"
                  />
                </Link>

                <div className="flex min-w-0 flex-col">
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <Link
                      to={`/products/${item.productId}?saleType=IMMEDIATE`}
                      className="min-w-0"
                    >
                      <p className="line-clamp-2 text-sm font-extrabold leading-5">
                        {item.productName}
                      </p>
                    </Link>
                    <button
                      type="button"
                      className="flex size-8 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-950"
                      aria-label={`${item.productName} 삭제`}
                      disabled={mutationPending}
                      onClick={() => deleteItemsMutation.mutate([item.productId])}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <p className="mt-1 text-base font-black">
                    {formatPrice(item.productPrice)}원
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-neutral-400">
                    결제 전 · 수량 1
                  </p>

                  <Link
                    to={`/checkout/${item.productId}?from=cart`}
                    className="mt-auto flex h-9 items-center justify-center gap-1 rounded-md border border-neutral-300 text-xs font-bold hover:border-neutral-950"
                  >
                    바로 결제
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </section>
        </>
      )}

      {mutationError && (
        <p className="mx-5 mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 md:mx-8">
          {getApiErrorMessage(mutationError)}
        </p>
      )}

      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-[72px] z-30 border-t border-neutral-200 bg-white/97 px-5 py-3 backdrop-blur md:sticky md:bottom-0 md:px-8">
          <div className="mx-auto flex max-w-[776px] items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-neutral-500">
                선택 {selectedProductIds.size}개
              </p>
              <p className="mt-0.5 text-lg font-black">
                {formatPrice(selectedTotal)}원
              </p>
              {selectedProductIds.size > 1 && (
                <p className="mt-0.5 text-[10px] text-neutral-400">
                  결제할 상품 1개만 선택해 주세요.
                </p>
              )}
            </div>
            <button
              type="button"
              className="h-11 min-w-28 rounded-md bg-brand px-4 text-sm font-black text-neutral-950 disabled:bg-neutral-200 disabled:text-neutral-400"
              disabled={!canCheckout || mutationPending}
              onClick={() =>
                selectedItem &&
                navigate(`/checkout/${selectedItem.productId}?from=cart`)
              }
            >
              {selectedProductIds.size > 1 ? "1개만 선택" : "결제하기"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CartCheckbox({
  checked,
  onChange,
  label = "전체 선택",
}: {
  checked: boolean
  onChange: () => void
  label?: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      className={`flex size-5 shrink-0 items-center justify-center rounded border ${
        checked
          ? "border-brand bg-brand text-white"
          : "border-neutral-300 bg-white"
      }`}
      onClick={onChange}
    >
      {checked && <Check className="size-3.5 stroke-[3]" />}
    </button>
  )
}

function EmptyCart() {
  return (
    <div className="flex min-h-[55vh] flex-col items-center justify-center px-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-brand/10 text-brand">
        <ShoppingCart className="size-7" />
      </span>
      <p className="mt-5 text-base font-black">장바구니가 비어 있어요</p>
      <p className="mt-2 text-sm leading-6 text-neutral-500">
        바로 구매하고 싶은 상품을 담아 두세요.
      </p>
      <Link
        to="/immediate"
        className="mt-6 flex h-11 items-center gap-2 rounded-md bg-neutral-950 px-5 text-sm font-bold text-white"
      >
        즉시구매 상품 보기
        <ArrowRight className="size-4" />
      </Link>
    </div>
  )
}

function GuestCart() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-brand/10 text-brand">
        <ShoppingCart className="size-7" />
      </span>
      <p className="mt-5 text-base font-black">로그인 후 장바구니를 이용해 주세요</p>
      <p className="mt-2 text-sm text-neutral-500">
        담아 둔 상품을 한곳에서 확인할 수 있어요.
      </p>
      <Link
        to="/login?redirect=/cart"
        className="mt-6 flex h-11 items-center gap-2 rounded-md bg-brand px-5 text-sm font-bold text-neutral-950"
      >
        로그인하기
        <ArrowRight className="size-4" />
      </Link>
    </div>
  )
}
