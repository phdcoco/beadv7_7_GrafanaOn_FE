import { useEffect, useState, type FormEvent } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import {
  ArrowRight,
  Bookmark,
  LogOut,
  Pencil,
  Plus,
  ReceiptText,
  WalletCards,
} from "lucide-react"
import { logout, withdraw } from "@/api/authApi"
import { SellerSection } from "@/components/profile/SellerSection"
import { getMemberProfile, updateMemberProfile } from "@/api/memberApi"
import { getMyPurchases } from "@/api/purchaseApi"
import { getScraps } from "@/api/scrapApi"
import { getMyWallet } from "@/api/walletApi"
import { getApiErrorMessage } from "@/lib/apiClient"
import { isAuthenticated } from "@/lib/authStorage"
import { formatDate, formatPrice } from "@/lib/format"
import type { UpdateMemberProfileRequest } from "@/types/member"

const emptyProfileForm: UpdateMemberProfileRequest = {
  defaultShippingAddress: "",
  phoneNumber: "",
  nickname: "",
}

export function ProfilePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const loggedIn = isAuthenticated()
  const [editing, setEditing] = useState(false)
  const [profileForm, setProfileForm] = useState(emptyProfileForm)

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

  const purchaseQuery = useQuery({
    queryKey: ["purchases", "me"],
    queryFn: getMyPurchases,
    enabled: loggedIn,
  })

  const scrapQuery = useQuery({
    queryKey: ["scraps", "me", 1],
    queryFn: () => getScraps(1, 6),
    enabled: loggedIn,
  })

  useEffect(() => {
    if (!profileQuery.data) {
      return
    }

    setProfileForm({
      defaultShippingAddress: profileQuery.data.defaultShippingAddress,
      phoneNumber: profileQuery.data.phoneNumber,
      nickname: profileQuery.data.nickname,
    })
  }, [profileQuery.data])

  const updateMutation = useMutation({
    mutationFn: updateMemberProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(["member-profile", "me"], profile)
      setEditing(false)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.clear()
      navigate("/login")
    },
  })

  const withdrawMutation = useMutation({
    mutationFn: withdraw,
    onSuccess: () => {
      queryClient.clear()
      navigate("/")
    },
  })

  function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateMutation.mutate(profileForm)
  }

  function handleWithdraw() {
    const confirmed = window.confirm(
      "회원 탈퇴 후에는 같은 이메일로 다시 가입할 수 없습니다. 탈퇴하시겠습니까?"
    )

    if (confirmed) {
      withdrawMutation.mutate()
    }
  }

  if (!loggedIn) {
    return <GuestProfile />
  }

  if (profileQuery.isError) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-bold">프로필을 불러오지 못했습니다.</p>
        <p className="mt-2 text-xs text-neutral-500">
          {getApiErrorMessage(profileQuery.error)}
        </p>
        <Link to="/login" className="mt-5 text-sm font-bold underline">
          다시 로그인하기
        </Link>
      </div>
    )
  }

  const profile = profileQuery.data
  const purchases = purchaseQuery.data ?? []
  const scraps = scrapQuery.data?.content ?? []

  return (
    <div className="pb-10">
      <div className="border-b border-neutral-100 px-5 py-6 md:px-8">
        <p className="text-xs font-bold text-neutral-400">MY D:EAR</p>
        <h1 className="mt-1 text-xl font-black">마이페이지</h1>
      </div>

      {profileQuery.isLoading && (
        <div className="h-36 animate-pulse bg-neutral-100" />
      )}

      {profile && (
        <section className="border-b border-neutral-100 px-5 py-6 md:px-8">
          <div className="flex items-center gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand text-xl font-black text-neutral-950">
              {profile.nickname.slice(0, 1)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-black">{profile.nickname}</p>
              <p className="mt-1 text-sm text-neutral-500">{profile.name}</p>
              <p className="mt-1 truncate text-xs text-neutral-400">
                {profile.defaultShippingAddress}
              </p>
            </div>
            <button
              type="button"
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-neutral-200 px-3 text-xs font-bold"
              onClick={() => setEditing((current) => !current)}
            >
              <Pencil className="size-3.5" />
              수정
            </button>
          </div>

          {editing && (
            <form className="mt-6 space-y-4 border-t border-neutral-100 pt-5" onSubmit={handleUpdate}>
              <ProfileField
                label="닉네임"
                value={profileForm.nickname}
                maxLength={30}
                onChange={(nickname) =>
                  setProfileForm((current) => ({ ...current, nickname }))
                }
              />
              <ProfileField
                label="전화번호"
                value={profileForm.phoneNumber}
                placeholder="010-0000-0000"
                onChange={(phoneNumber) =>
                  setProfileForm((current) => ({ ...current, phoneNumber }))
                }
              />
              <ProfileField
                label="기본 배송지"
                value={profileForm.defaultShippingAddress}
                maxLength={255}
                onChange={(defaultShippingAddress) =>
                  setProfileForm((current) => ({
                    ...current,
                    defaultShippingAddress,
                  }))
                }
              />

              {updateMutation.isError && (
                <p className="text-sm text-red-600">
                  {getApiErrorMessage(updateMutation.error)}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="h-11 rounded-md border border-neutral-300 text-sm font-bold"
                  onClick={() => setEditing(false)}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="h-11 rounded-md bg-brand text-sm font-bold text-neutral-950 hover:brightness-95"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "저장 중..." : "저장"}
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      <section className="grid grid-cols-3 border-b border-neutral-100 py-5">
        <Status label="구매" value={purchaseQuery.isLoading ? "-" : String(purchases.length)} />
        <Status
          label="결제 대기"
          value={
            purchaseQuery.isLoading
              ? "-"
              : String(
                  purchases.filter((purchase) => purchase.status === "PENDING_PAYMENT")
                    .length
                )
          }
        />
        <Status
          label="관심 상품"
          value={
            scrapQuery.isLoading
              ? "-"
              : String(scrapQuery.data?.pagination.totalItems ?? 0)
          }
        />
      </section>

      <section className="border-b border-neutral-100 px-5 py-6 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <WalletCards className="size-5" />
            <h2 className="text-base font-black">나의 예치금</h2>
          </div>
          <Link
            to="/wallet/charge"
            className="flex h-9 items-center gap-1 rounded-md bg-brand px-3 text-xs font-black text-white"
          >
            <Plus className="size-3.5" />
            충전
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-neutral-200 bg-neutral-200">
          <Balance
            label="사용 가능"
            value={walletQuery.data?.availableBalance}
            loading={walletQuery.isLoading}
          />
          <Balance
            label="거래 중"
            value={walletQuery.data?.heldBalance}
            loading={walletQuery.isLoading}
          />
        </div>
      </section>

      <SellerSection />

      <section className="border-b border-neutral-100 py-6">
        <div className="mb-4 flex items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-2">
            <Bookmark className="size-5" />
            <h2 className="text-base font-black">관심 상품</h2>
          </div>
          <span className="text-xs text-neutral-400">
            {scrapQuery.data?.pagination.totalItems ?? 0}개
          </span>
        </div>

        {scraps.length > 0 ? (
          <div className="no-scrollbar flex gap-3 overflow-x-auto px-5 md:px-8">
            {scraps.map((scrap) => (
              <Link
                key={scrap.id}
                to={`/products/${scrap.id}`}
                className="w-36 shrink-0"
              >
                <img
                  src={scrap.imageUrl}
                  alt={scrap.name}
                  className="aspect-square w-full rounded-md bg-neutral-100 object-cover"
                />
                <p className="mt-2 truncate text-xs text-neutral-500">{scrap.brand}</p>
                <p className="mt-1 line-clamp-2 text-sm font-bold">{scrap.name}</p>
                <p className="mt-1 text-sm font-black">{formatPrice(scrap.price)}원</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="px-5 text-sm text-neutral-400 md:px-8">저장한 상품이 없습니다.</p>
        )}
      </section>

      <section className="border-b border-neutral-100 px-5 py-6 md:px-8">
        <div className="mb-4 flex items-center gap-2">
          <ReceiptText className="size-5" />
          <h2 className="text-base font-black">최근 구매</h2>
        </div>

        {purchases.length > 0 ? (
          <div className="divide-y divide-neutral-100">
            {purchases.slice(0, 4).map((purchase) => (
              <div key={purchase.id} className="flex items-center gap-4 py-4 first:pt-0">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-neutral-400">{purchase.number}</p>
                  <p className="mt-1 text-sm font-bold">상품 #{purchase.productId}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {formatDate(purchase.purchasedAt)} · {purchase.status}
                  </p>
                </div>
                <strong className="text-sm">{formatPrice(purchase.amount)}원</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-400">아직 구매 내역이 없습니다.</p>
        )}
      </section>

      <section className="px-5 py-6 md:px-8">
        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-md border border-neutral-300 text-sm font-bold"
          disabled={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="size-4" />
          로그아웃
        </button>
        <button
          type="button"
          className="mt-5 text-xs text-neutral-400 underline"
          disabled={withdrawMutation.isPending}
          onClick={handleWithdraw}
        >
          {withdrawMutation.isPending ? "탈퇴 처리 중..." : "회원 탈퇴"}
        </button>
        {(logoutMutation.isError || withdrawMutation.isError) && (
          <p className="mt-3 text-sm text-red-600">
            {getApiErrorMessage(logoutMutation.error ?? withdrawMutation.error)}
          </p>
        )}
      </section>
    </div>
  )
}

function GuestProfile() {
  return (
    <div className="flex min-h-[calc(100vh-136px)] flex-col items-center justify-center px-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-brand text-xl font-black text-neutral-950">
        D
      </span>
      <h1 className="mt-5 text-xl font-black">로그인하고 나의 D:EAR를 만나보세요</h1>
      <p className="mt-2 max-w-xs text-sm leading-6 text-neutral-500">
        구매 내역과 관심 상품, 예치금을 한곳에서 확인할 수 있어요.
      </p>
      <Link
        to="/login?redirect=/profile"
        className="mt-7 flex h-12 w-full max-w-xs items-center justify-center gap-2 rounded-md bg-brand text-sm font-bold text-neutral-950 hover:brightness-95"
      >
        로그인
        <ArrowRight className="size-4" />
      </Link>
    </div>
  )
}

function ProfileField({
  label,
  value,
  placeholder,
  maxLength,
  onChange,
}: {
  label: string
  value: string
  placeholder?: string
  maxLength?: number
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-brand"
        placeholder={placeholder}
        maxLength={maxLength}
        required
      />
    </label>
  )
}

function Status({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-black">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{label}</p>
    </div>
  )
}

function Balance({
  label,
  value,
  loading,
}: {
  label: string
  value?: number
  loading: boolean
}) {
  return (
    <div className="bg-white p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-2 text-lg font-black">
        {loading ? "-" : `${formatPrice(value ?? 0)}원`}
      </p>
    </div>
  )
}
