import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
  ChevronRight,
  Heart,
  MapPin,
  PackageCheck,
  ReceiptText,
  Settings,
  ShoppingBag,
  Store,
} from "lucide-react"
import { getMemberProfile } from "@/api/memberApi"

const menuItems = [
  { label: "구매 내역", icon: ReceiptText },
  { label: "내 오퍼", icon: PackageCheck },
  { label: "관심 상품", icon: Heart },
  { label: "배송지 관리", icon: MapPin },
  { label: "판매자 관리", icon: Store },
  { label: "설정", icon: Settings },
]

export function ProfilePage() {
  const profileQuery = useQuery({
    queryKey: ["member-profile", 1],
    queryFn: () => getMemberProfile(1),
  })

  return (
    <div className="pb-8">
      <div className="border-b border-neutral-100 px-5 py-6 md:px-8">
        <p className="text-xs font-bold text-neutral-400">MY D:EAR</p>
        <h1 className="mt-1 text-xl font-black">마이페이지</h1>
      </div>

      {profileQuery.isLoading && (
        <div className="h-36 animate-pulse bg-neutral-100" />
      )}

      {profileQuery.data && (
        <section className="flex items-center gap-4 border-b border-neutral-100 px-5 py-6 md:px-8">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#55c7bd] text-xl font-black text-white">
            {profileQuery.data.nickname.slice(0, 1)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-black">{profileQuery.data.nickname}</p>
            <p className="mt-1 text-sm text-neutral-500">{profileQuery.data.name}</p>
            <p className="mt-1 truncate text-xs text-neutral-400">
              {profileQuery.data.defaultShippingAddress}
            </p>
          </div>
          <button
            type="button"
            className="h-9 shrink-0 rounded-md border border-neutral-200 px-3 text-xs font-bold"
          >
            프로필 수정
          </button>
        </section>
      )}

      <section className="grid grid-cols-3 border-b border-neutral-100 py-5">
        <Status label="구매" value="3" />
        <Status label="진행 중 오퍼" value="2" />
        <Status label="관심 상품" value="12" />
      </section>

      <div className="grid md:grid-cols-2">
        {menuItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className="flex h-16 items-center gap-3 border-b border-neutral-100 px-5 text-left md:px-8"
          >
            <item.icon className="size-5 text-neutral-500" />
            <span className="flex-1 text-sm font-semibold">{item.label}</span>
            <ChevronRight className="size-4 text-neutral-300" />
          </button>
        ))}
      </div>

      <div className="mx-5 mt-8 bg-neutral-50 p-4 md:mx-8">
        <div className="flex items-center gap-3">
          <ShoppingBag className="size-5" />
          <div className="flex-1">
            <p className="text-sm font-bold">판매하고 싶은 상품이 있나요?</p>
            <p className="mt-1 text-xs text-neutral-500">
              상품의 사진과 이야기를 등록해 보세요.
            </p>
          </div>
          <Link
            to="/"
            className="rounded-md bg-neutral-950 px-3 py-2 text-xs font-bold text-white"
          >
            등록하기
          </Link>
        </div>
      </div>
    </div>
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
