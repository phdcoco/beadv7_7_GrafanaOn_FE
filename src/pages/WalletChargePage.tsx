import { useState, type FormEvent } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import {
  ArrowLeft,
  CreditCard,
  LoaderCircle,
  ShieldCheck,
  WalletCards,
} from "lucide-react"
import { getMyWallet, prepareCharge } from "@/api/walletApi"
import { getApiErrorMessage } from "@/lib/apiClient"
import { isAuthenticated } from "@/lib/authStorage"
import { formatPrice } from "@/lib/format"
import { USE_MOCKS } from "@/lib/runtime"
import { requestTossCharge } from "@/lib/tossPayments"

const chargeAmounts = [10000, 30000, 50000, 100000]

export function WalletChargePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const loggedIn = isAuthenticated()
  const returnTo = getSafeReturnTo(searchParams.get("returnTo"))
  const [amount, setAmount] = useState("50000")
  const numericAmount = Number(amount)
  const validAmount =
    Number.isInteger(numericAmount) &&
    numericAmount >= 100 &&
    numericAmount % 100 === 0

  const walletQuery = useQuery({
    queryKey: ["wallet", "me"],
    queryFn: getMyWallet,
    enabled: loggedIn,
  })

  const chargeMutation = useMutation({
    mutationFn: async (requestedAmount: number) => {
      if (!USE_MOCKS && !import.meta.env.VITE_TOSS_CLIENT_KEY) {
        throw new Error("토스페이먼츠 클라이언트 키가 설정되지 않았습니다.")
      }

      const charge = await prepareCharge(requestedAmount)

      if (USE_MOCKS) {
        return charge
      }

      await requestTossCharge(charge, {
        successUrl: createRedirectUrl("/wallet/charge/success", returnTo),
        failUrl: createRedirectUrl("/wallet/charge/fail", returnTo),
      })

      return null
    },
    onSuccess: (charge) => {
      if (!charge) {
        return
      }

      const resultSearch = new URLSearchParams({
        paymentKey: `mock_${charge.paymentId}`,
        orderId: charge.orderId,
        amount: String(charge.amount),
      })

      if (returnTo) {
        resultSearch.set("returnTo", returnTo)
      }

      navigate(`/wallet/charge/success?${resultSearch.toString()}`)
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (validAmount && !chargeMutation.isPending) {
      chargeMutation.mutate(numericAmount)
    }
  }

  if (!loggedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <WalletCards className="size-11 text-brand" />
        <p className="mt-5 text-base font-black">
          로그인 후 예치금을 충전할 수 있어요.
        </p>
        <Link
          to="/login?redirect=/wallet/charge"
          className="mt-6 rounded-md bg-brand px-5 py-3 text-sm font-bold"
        >
          로그인하기
        </Link>
      </div>
    )
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
          예치금 충전
        </h1>
      </header>

      <form
        className="mx-auto max-w-[640px] pb-28 md:py-8"
        onSubmit={handleSubmit}
      >
        <section className="border-y border-neutral-200 bg-white px-5 py-6 md:border md:px-7">
          <div className="flex items-center gap-2">
            <WalletCards className="size-5 text-brand" />
            <h2 className="text-base font-black">사용 가능 예치금</h2>
          </div>
          <p className="mt-5 text-3xl font-black">
            {walletQuery.isLoading
              ? "-"
              : `${formatPrice(walletQuery.data?.availableBalance ?? 0)}원`}
          </p>
          {walletQuery.isError && (
            <p className="mt-3 text-xs text-red-600">
              {getApiErrorMessage(walletQuery.error)}
            </p>
          )}
        </section>

        <section className="mt-2 border-y border-neutral-200 bg-white px-5 py-6 md:mt-4 md:border md:px-7">
          <p className="text-xs font-bold text-neutral-400">CHARGE AMOUNT</p>
          <h2 className="mt-1 text-base font-black">충전할 금액을 선택해 주세요</h2>

          <div className="mt-5 grid grid-cols-2 gap-2">
            {chargeAmounts.map((chargeAmount) => {
              const active = numericAmount === chargeAmount

              return (
                <button
                  key={chargeAmount}
                  type="button"
                  className={`h-12 rounded-md border text-sm font-black transition-colors ${
                    active
                      ? "border-brand bg-[#fff1e8] text-neutral-950"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
                  }`}
                  aria-pressed={active}
                  onClick={() => setAmount(String(chargeAmount))}
                >
                  +{formatPrice(chargeAmount)}원
                </button>
              )
            })}
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-xs font-bold">직접 입력</span>
            <span className="relative block">
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="h-12 w-full rounded-md border border-neutral-300 px-3 pr-9 text-sm outline-none focus:border-brand"
                type="number"
                inputMode="numeric"
                min="100"
                step="100"
                placeholder="충전 금액"
                required
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                원
              </span>
            </span>
            {!validAmount && amount && (
              <span className="mt-2 block text-xs text-red-600">
                100원 이상, 100원 단위로 입력해 주세요.
              </span>
            )}
          </label>
        </section>

        <section className="mt-2 border-y border-neutral-200 bg-white px-5 py-5 md:mt-4 md:border md:px-7">
          <dl className="space-y-3 text-sm">
            <AmountRow
              label="현재 예치금"
              value={walletQuery.data?.availableBalance ?? 0}
            />
            <AmountRow label="충전 금액" value={validAmount ? numericAmount : 0} />
            <div className="border-t border-neutral-100 pt-3">
              <AmountRow
                label="충전 후 예치금"
                value={
                  (walletQuery.data?.availableBalance ?? 0) +
                  (validAmount ? numericAmount : 0)
                }
                strong
              />
            </div>
          </dl>
        </section>

        <section className="mt-2 border-y border-neutral-200 bg-white px-5 py-5 md:mt-4 md:border md:px-7">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand" />
            <div>
              <p className="text-sm font-bold">안전한 결제창에서 충전됩니다.</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                카드 또는 간편결제를 완료하면 예치금에 바로 반영됩니다.
              </p>
            </div>
          </div>
        </section>

        {chargeMutation.isError && (
          <p className="mx-5 mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 md:mx-0">
            {getApiErrorMessage(chargeMutation.error)}
          </p>
        )}

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/97 p-3 backdrop-blur md:sticky md:mt-4 md:border">
          <button
            type="submit"
            className="mx-auto flex h-12 w-full max-w-[616px] items-center justify-center gap-2 rounded-md bg-brand text-sm font-black text-white disabled:bg-neutral-200 disabled:text-neutral-400"
            disabled={!validAmount || chargeMutation.isPending}
          >
            {chargeMutation.isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <CreditCard className="size-4" />
            )}
            {chargeMutation.isPending
              ? "결제창을 준비하고 있어요"
              : `${formatPrice(validAmount ? numericAmount : 0)}원 충전하기`}
          </button>
        </div>
      </form>
    </div>
  )
}

function AmountRow({
  label,
  value,
  strong = false,
}: {
  label: string
  value: number
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className={strong ? "font-black" : "text-neutral-500"}>{label}</dt>
      <dd className={strong ? "text-base font-black" : "font-bold"}>
        {formatPrice(value)}원
      </dd>
    </div>
  )
}

function getSafeReturnTo(value: string | null) {
  if (!value?.startsWith("/") || value.startsWith("//")) {
    return null
  }

  return value
}

function createRedirectUrl(path: string, returnTo: string | null) {
  const url = new URL(path, window.location.origin)

  if (returnTo) {
    url.searchParams.set("returnTo", returnTo)
  }

  return url.toString()
}
