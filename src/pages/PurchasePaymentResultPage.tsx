import { useEffect, useRef } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useParams, useSearchParams } from "react-router-dom"
import {
  ArrowRight,
  CheckCircle2,
  CircleX,
  LoaderCircle,
  ReceiptText,
} from "lucide-react"
import { deleteCartItems } from "@/api/cartApi"
import { getProductDetail } from "@/api/productApi"
import { getPurchase } from "@/api/purchaseApi"
import { getApiErrorMessage } from "@/lib/apiClient"
import { isAuthenticated } from "@/lib/authStorage"
import { formatPrice } from "@/lib/format"

export function PurchasePaymentResultPage() {
  const queryClient = useQueryClient()
  const { purchaseId } = useParams()
  const [searchParams] = useSearchParams()
  const parsedPurchaseId = Number(purchaseId)
  const productId = Number(searchParams.get("productId"))
  const fromCart = searchParams.get("from") === "cart"
  const loggedIn = isAuthenticated()
  const cartCleanedRef = useRef(false)

  const purchaseQuery = useQuery({
    queryKey: ["purchase", parsedPurchaseId],
    queryFn: () => getPurchase(parsedPurchaseId),
    enabled: loggedIn && Number.isFinite(parsedPurchaseId),
    refetchInterval: (query) =>
      query.state.data?.status === "PENDING_PAYMENT" ? 700 : false,
  })

  const resolvedProductId = purchaseQuery.data?.productId ?? productId
  const productQuery = useQuery({
    queryKey: ["product-detail", resolvedProductId, "IMMEDIATE"],
    queryFn: () => getProductDetail(resolvedProductId, "IMMEDIATE"),
    enabled: loggedIn && Number.isFinite(resolvedProductId),
  })

  const purchase = purchaseQuery.data
  const paymentSucceeded =
    purchase?.status === "PAID" || purchase?.status === "PURCHASE_CONFIRMED"
  const paymentFailed =
    purchase?.status === "PAYMENT_FAILED" ||
    purchase?.status === "CANCELLED" ||
    purchase?.status === "EXPIRED"

  useEffect(() => {
    if (
      !fromCart ||
      !paymentSucceeded ||
      !Number.isFinite(resolvedProductId) ||
      cartCleanedRef.current
    ) {
      return
    }

    cartCleanedRef.current = true
    void deleteCartItems([resolvedProductId]).finally(() => {
      void queryClient.invalidateQueries({ queryKey: ["cart", "me"] })
    })
  }, [fromCart, paymentSucceeded, queryClient, resolvedProductId])

  if (!loggedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="text-base font-black">결제 결과를 보려면 로그인해 주세요.</p>
        <Link
          to="/login"
          className="mt-6 rounded-md bg-brand px-5 py-3 text-sm font-bold"
        >
          로그인하기
        </Link>
      </div>
    )
  }

  if (purchaseQuery.isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <CircleX className="size-12 text-red-600" />
        <p className="mt-5 text-base font-black">결제 결과를 확인하지 못했습니다.</p>
        <p className="mt-2 text-sm text-neutral-500">
          {getApiErrorMessage(purchaseQuery.error)}
        </p>
        <Link to="/profile" className="mt-6 text-sm font-bold underline">
          구매 내역에서 확인하기
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f4f1] px-5 py-10">
      <section className="w-full max-w-md border border-neutral-200 bg-white px-5 py-8 text-center md:px-8">
        {!purchase || purchase.status === "PENDING_PAYMENT" ? (
          <>
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand/10 text-brand">
              <LoaderCircle className="size-8 animate-spin" />
            </span>
            <h1 className="mt-5 text-xl font-black">결제를 처리하고 있어요</h1>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              예치금 차감 결과를 확인하고 있습니다.
              <br />
              잠시만 기다려 주세요.
            </p>
          </>
        ) : paymentSucceeded ? (
          <>
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-brand/10 text-brand">
              <CheckCircle2 className="size-9" />
            </span>
            <h1 className="mt-5 text-xl font-black">결제가 완료되었습니다</h1>
            <p className="mt-2 text-sm text-neutral-500">
              주문이 안전하게 접수되었어요.
            </p>
          </>
        ) : paymentFailed ? (
          <>
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-50 text-red-600">
              <CircleX className="size-9" />
            </span>
            <h1 className="mt-5 text-xl font-black">결제에 실패했습니다</h1>
            <p className="mt-2 text-sm text-neutral-500">
              예치금과 주문 상태를 확인한 후 다시 시도해 주세요.
            </p>
          </>
        ) : (
          <>
            <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-neutral-100">
              <ReceiptText className="size-8" />
            </span>
            <h1 className="mt-5 text-xl font-black">주문 상태가 변경되었습니다</h1>
            <p className="mt-2 text-sm text-neutral-500">
              구매 내역에서 현재 상태를 확인해 주세요.
            </p>
          </>
        )}

        {purchase && (
          <dl className="mt-7 divide-y divide-neutral-100 border-y border-neutral-100 text-left text-sm">
            <ResultRow label="주문번호" value={purchase.number} />
            <ResultRow
              label="상품"
              value={productQuery.data?.name ?? `상품 ${purchase.productId}`}
            />
            <ResultRow
              label="결제금액"
              value={`${formatPrice(purchase.amount)}원`}
              strong
            />
          </dl>
        )}

        <div className="mt-7 grid grid-cols-2 gap-2">
          <Link
            to="/"
            className="flex h-11 items-center justify-center rounded-md border border-neutral-300 text-sm font-bold"
          >
            홈으로
          </Link>
          <Link
            to="/profile"
            className="flex h-11 items-center justify-center gap-1 rounded-md bg-neutral-950 text-sm font-bold text-white"
          >
            구매 내역
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}

function ResultRow({
  label,
  value,
  strong = false,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="shrink-0 text-neutral-500">{label}</dt>
      <dd className={`text-right ${strong ? "font-black" : "font-semibold"}`}>
        {value}
      </dd>
    </div>
  )
}
