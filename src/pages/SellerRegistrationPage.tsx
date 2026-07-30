import { useState, type FormEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
  Store,
} from "lucide-react"
import { getSellerAccount, registerSeller } from "@/api/memberApi"
import { getApiErrorMessage } from "@/lib/apiClient"
import { isAuthenticated } from "@/lib/authStorage"

const banks = [
  "국민은행",
  "신한은행",
  "우리은행",
  "하나은행",
  "농협은행",
  "기업은행",
  "카카오뱅크",
  "토스뱅크",
  "케이뱅크",
]

export function SellerRegistrationPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const loggedIn = isAuthenticated()
  const [bank, setBank] = useState(banks[0])
  const [account, setAccount] = useState("")

  const sellerQuery = useQuery({
    queryKey: ["seller-account", "me"],
    queryFn: getSellerAccount,
    enabled: loggedIn,
  })

  const registerMutation = useMutation({
    mutationFn: registerSeller,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["seller-account", "me"] })
      navigate("/sell/products/new", { replace: true })
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    registerMutation.mutate({ bank, account: account.trim() })
  }

  if (!loggedIn) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <Store className="size-10 text-brand" />
        <p className="mt-5 text-base font-black">로그인 후 판매자로 등록할 수 있어요.</p>
        <Link
          to="/login?redirect=/seller/register"
          className="mt-6 rounded-md bg-brand px-5 py-3 text-sm font-bold"
        >
          로그인하기
        </Link>
      </div>
    )
  }

  if (sellerQuery.isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <LoaderCircle className="size-7 animate-spin text-brand" />
      </div>
    )
  }

  if (sellerQuery.isError) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <p className="text-base font-black">판매자 정보를 확인하지 못했습니다.</p>
        <p className="mt-2 text-sm text-neutral-500">
          {getApiErrorMessage(sellerQuery.error)}
        </p>
        <Link to="/profile" className="mt-6 text-sm font-bold underline">
          마이페이지로 돌아가기
        </Link>
      </div>
    )
  }

  if (sellerQuery.data) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <CheckCircle2 className="size-12 text-brand" />
        <p className="mt-5 text-lg font-black">이미 판매자로 등록되어 있어요.</p>
        <Link
          to="/sell/products/new"
          className="mt-6 flex h-11 items-center gap-2 rounded-md bg-neutral-950 px-5 text-sm font-bold text-white"
        >
          상품 등록하기
          <ArrowRight className="size-4" />
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-[calc(100vh-64px)] max-w-[680px] pb-12">
      <header className="flex items-center gap-2 border-b border-neutral-100 px-3 py-3 md:px-6">
        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full hover:bg-neutral-100"
          aria-label="뒤로가기"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <p className="text-xs font-bold text-neutral-400">SELLER</p>
          <h1 className="text-lg font-black">판매자 등록</h1>
        </div>
      </header>

      <div className="px-5 py-7 md:px-8">
        <div className="flex items-start gap-4 border-b border-neutral-100 pb-6">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
            <Store className="size-6" />
          </span>
          <div>
            <h2 className="text-base font-black">정산받을 계좌를 등록해 주세요</h2>
            <p className="mt-1 text-sm leading-6 text-neutral-500">
              판매가 완료되면 정산 금액이 등록한 계좌로 지급됩니다.
            </p>
          </div>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-xs font-bold">은행</span>
            <span className="relative block">
              <Building2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <select
                value={bank}
                onChange={(event) => setBank(event.target.value)}
                className="h-12 w-full appearance-none rounded-md border border-neutral-300 bg-white pl-10 pr-3 text-sm outline-none focus:border-brand"
              >
                {banks.map((bankName) => (
                  <option key={bankName} value={bankName}>
                    {bankName}
                  </option>
                ))}
              </select>
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold">계좌번호</span>
            <span className="relative block">
              <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
              <input
                value={account}
                onChange={(event) =>
                  setAccount(event.target.value.replace(/[^\d-]/g, ""))
                }
                className="h-12 w-full rounded-md border border-neutral-300 pl-10 pr-3 text-sm outline-none focus:border-brand"
                placeholder="'-' 없이 입력해도 됩니다"
                inputMode="numeric"
                maxLength={30}
                required
              />
            </span>
          </label>

          <div className="flex items-start gap-3 rounded-md bg-neutral-50 px-4 py-3">
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-neutral-500" />
            <p className="text-xs leading-5 text-neutral-500">
              계좌번호는 암호화되어 저장되며 정산 목적으로만 사용됩니다.
            </p>
          </div>

          {registerMutation.isError && (
            <p className="text-sm text-red-600">
              {getApiErrorMessage(registerMutation.error)}
            </p>
          )}

          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand text-sm font-black text-neutral-950 disabled:bg-neutral-200"
            disabled={registerMutation.isPending || account.trim().length < 6}
          >
            {registerMutation.isPending && (
              <LoaderCircle className="size-4 animate-spin" />
            )}
            {registerMutation.isPending ? "등록 중..." : "판매자 등록하고 상품 올리기"}
          </button>
        </form>
      </div>
    </div>
  )
}
