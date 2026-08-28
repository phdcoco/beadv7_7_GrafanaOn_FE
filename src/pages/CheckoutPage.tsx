import { useEffect, useState, type FormEvent } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  MapPin,
  ShieldCheck,
  WalletCards,
} from "lucide-react"
import { getMemberProfile } from "@/api/memberApi"
import { getProductDetail } from "@/api/productApi"
import { createPurchase } from "@/api/purchaseApi"
import { getMyWallet } from "@/api/walletApi"
import { getApiErrorMessage } from "@/lib/apiClient"
import { isAuthenticated } from "@/lib/authStorage"
import { formatPrice } from "@/lib/format"

export function CheckoutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { productId } = useParams()
  const [searchParams] = useSearchParams()
  const parsedProductId = Number(productId)
  const loggedIn = isAuthenticated()
  const fromCart = searchParams.get("from") === "cart"
  const [delivery, setDelivery] = useState("")

  const productQuery = useQuery({
    queryKey: ["product-detail", parsedProductId],
    queryFn: () => getProductDetail(parsedProductId),
    enabled: loggedIn && Number.isFinite(parsedProductId),
  })

  const profileQuery = useQuery({
    queryKey: ["member-profile", "me"],
    queryFn: () => getMemberProfile(),
    enabled: loggedIn,
  })

  const walletQuery = useQuery({
    queryKey: ["wallet", "me"],
    queryFn: getMyWallet,
    enabled: loggedIn,
  })

  useEffect(() => {
    if (!delivery && profileQuery.data?.defaultShippingAddress) {
      setDelivery(profileQuery.data.defaultShippingAddress)
    }
  }, [delivery, profileQuery.data])

  const purchaseMutation = useMutation({
    mutationFn: () =>
      createPurchase({
        productId: parsedProductId,
        delivery: delivery.trim(),
      }),
    onSuccess: (purchase) => {
      const resultSearch = new URLSearchParams({
        productId: String(parsedProductId),
      })

      if (fromCart) {
        resultSearch.set("from", "cart")
      }

      navigate(
        `/payments/purchases/${purchase.id}?${resultSearch.toString()}`,
        { replace: true }
      )
    },
  })

  if (!loggedIn) {
    const redirect = `/checkout/${parsedProductId}${
      fromCart ? "?from=cart" : ""
    }`

    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="text-base font-black">결제하려면 로그인이 필요합니다.</p>
        <Link
          to={`/login?redirect=${encodeURIComponent(redirect)}`}
          className="mt-6 flex h-11 items-center gap-2 rounded-md bg-brand px-5 text-sm font-bold"
        >
          로그인하기
          <ArrowRight className="size-4" />
        </Link>
      </div>
    )
  }

  const loading =
    productQuery.isLoading || profileQuery.isLoading || walletQuery.isLoading
  const queryError =
    productQuery.error ?? profileQuery.error ?? walletQuery.error

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="size-7 animate-spin text-brand" />
      </div>
    )
  }

  if (queryError || !productQuery.data || !walletQuery.data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="text-base font-black">결제 정보를 불러오지 못했습니다.</p>
        <p className="mt-2 text-sm text-neutral-500">
          {getApiErrorMessage(queryError)}
        </p>
        <button
          type="button"
          className="mt-6 text-sm font-bold underline"
          onClick={() => window.history.back()}
        >
          이전 화면으로
        </button>
      </div>
    )
  }

  const product = productQuery.data
  const wallet = walletQuery.data
  const hasEnoughBalance = wallet.availableBalance >= product.price
  const balanceAfterPayment = wallet.availableBalance - product.price
  const canSubmit =
    delivery.trim().length > 0 &&
    hasEnoughBalance &&
    !purchaseMutation.isPending

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (canSubmit) {
      purchaseMutation.mutate()
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f4f1]">
      <header className="sticky top-0 z-30 flex h-14 items-center border-b border-neutral-200 bg-white/96 px-3 backdrop-blur">
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full hover:bg-neutral-100"
          aria-label="뒤로가기"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-sm font-black">
          주문 및 결제
        </h1>
      </header>

      <form
        className="mx-auto max-w-[720px] pb-28 md:py-8"
        onSubmit={handleSubmit}
      >
        <section className="border-b border-neutral-200 bg-white px-5 py-6 md:border md:px-7">
          <p className="text-xs font-bold text-neutral-400">ORDER ITEM</p>
          <div className="mt-4 grid grid-cols-[88px_minmax(0,1fr)] gap-4">
            <img
              src={product.images[0]?.url}
              alt={product.name}
              className="aspect-square w-full rounded-md bg-neutral-100 object-cover"
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-neutral-500">
                {product.brand}
              </p>
              <h2 className="mt-1 line-clamp-2 text-sm font-black leading-5">
                {product.name}
              </h2>
              <p className="mt-2 text-lg font-black">
                {formatPrice(product.price)}원
              </p>
              <p className="mt-1 text-[11px] text-neutral-400">
                즉시구매 · 수량 1
              </p>
            </div>
          </div>
        </section>

        <section className="mt-2 border-y border-neutral-200 bg-white px-5 py-6 md:mt-4 md:border md:px-7">
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-brand" />
            <h2 className="text-base font-black">배송지</h2>
          </div>
          <label className="mt-4 block">
            <span className="mb-2 block text-xs font-bold">받을 주소</span>
            <input
              value={delivery}
              onChange={(event) => setDelivery(event.target.value)}
              className="h-12 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-brand"
              placeholder="상품을 받을 주소를 입력해 주세요"
              maxLength={255}
              required
            />
          </label>
        </section>

        <section className="mt-2 border-y border-neutral-200 bg-white px-5 py-6 md:mt-4 md:border md:px-7">
          <div className="flex items-center gap-2">
            <WalletCards className="size-5 text-brand" />
            <h2 className="text-base font-black">예치금 결제</h2>
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <PriceRow
              label="사용 가능 예치금"
              value={`${formatPrice(wallet.availableBalance)}원`}
            />
            <PriceRow
              label="상품 금액"
              value={`-${formatPrice(product.price)}원`}
            />
            <div className="border-t border-neutral-100 pt-4">
              <PriceRow
                label="결제 후 예치금"
                value={`${formatPrice(Math.max(0, balanceAfterPayment))}원`}
                strong
              />
            </div>
          </dl>

          {!hasEnoughBalance && (
            <div className="mt-5 rounded-md bg-red-50 px-4 py-3">
              <p className="text-sm font-bold text-red-700">
                예치금이 {formatPrice(Math.abs(balanceAfterPayment))}원 부족해요.
              </p>
              <p className="mt-1 text-xs leading-5 text-red-600">
                예치금을 충전한 후 다시 결제해 주세요.
              </p>
              <Link
                to={`/wallet/charge?${new URLSearchParams({
                  returnTo: `${location.pathname}${location.search}`,
                }).toString()}`}
                className="mt-3 inline-flex h-9 items-center rounded-md bg-red-600 px-3 text-xs font-black text-white"
              >
                부족한 예치금 충전
              </Link>
            </div>
          )}
        </section>

        <section className="mt-2 border-y border-neutral-200 bg-white px-5 py-5 md:mt-4 md:border md:px-7">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" />
            <div>
              <p className="text-sm font-bold">예치금으로 안전하게 결제됩니다.</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                결제 버튼을 누르면 주문이 생성되고 예치금 차감이 진행됩니다.
              </p>
            </div>
          </div>
        </section>

        {purchaseMutation.isError && (
          <p className="mx-5 mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 md:mx-0">
            {getApiErrorMessage(purchaseMutation.error)}
          </p>
        )}

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/97 p-3 backdrop-blur md:sticky md:mt-4 md:border">
          <div className="mx-auto max-w-[696px]">
            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand text-sm font-black text-neutral-950 disabled:bg-neutral-200 disabled:text-neutral-400"
              disabled={!canSubmit}
            >
              {purchaseMutation.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {purchaseMutation.isPending
                ? "결제 요청 중..."
                : hasEnoughBalance
                  ? `${formatPrice(product.price)}원 결제하기`
                  : "예치금이 부족합니다"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

function PriceRow({
  label,
  value,
  strong = false,
}: {
  label: string
  value: string
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className={strong ? "font-black" : "text-neutral-500"}>{label}</dt>
      <dd className={strong ? "text-lg font-black" : "font-bold"}>{value}</dd>
    </div>
  )
}
