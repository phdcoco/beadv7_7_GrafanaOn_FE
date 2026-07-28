import { FormEvent, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getMemberProfile } from "@/api/memberApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ProfilePage() {
  const [memberIdInput, setMemberIdInput] = useState("1")
  const [memberId, setMemberId] = useState(1)

  const profileQuery = useQuery({
    queryKey: ["member-profile", memberId],
    queryFn: () => getMemberProfile(memberId),
    enabled: Number.isFinite(memberId),
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMemberId(Number(memberIdInput))
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-sm font-medium text-neutral-500">Member</p>
        <h1 className="text-3xl font-semibold tracking-[0]">프로필 조회</h1>
      </div>

      <form
        className="flex gap-2 rounded-lg border border-neutral-200 bg-white p-4"
        onSubmit={handleSubmit}
      >
        <Input
          value={memberIdInput}
          onChange={(event) => setMemberIdInput(event.target.value)}
          type="number"
          min={1}
          placeholder="memberId"
        />
        <Button>조회</Button>
      </form>

      {profileQuery.isLoading && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm text-neutral-500">
          프로필을 불러오는 중입니다.
        </div>
      )}

      {profileQuery.isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          프로필을 불러오지 못했습니다.
        </div>
      )}

      {profileQuery.data && (
        <div className="grid gap-3 rounded-lg border border-neutral-200 bg-white p-5 text-sm">
          <Field label="멤버 ID" value={String(profileQuery.data.id)} />
          <Field label="이름" value={profileQuery.data.name} />
          <Field label="닉네임" value={profileQuery.data.nickname} />
          <Field label="전화번호" value={profileQuery.data.phoneNumber} />
          <Field
            label="기본배송지"
            value={profileQuery.data.defaultShippingAddress}
          />
        </div>
      )}
    </section>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_1fr] gap-3 border-b border-neutral-100 pb-3 last:border-b-0 last:pb-0">
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
