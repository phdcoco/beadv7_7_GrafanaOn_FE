import { type FormEvent, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { signUp } from "@/api/authApi"
import { getApiErrorMessage } from "@/lib/apiClient"

export function SignUpPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    defaultShippingAddress: "",
    phoneNumber: "",
  })

  const signUpMutation = useMutation({
    mutationFn: signUp,
    onSuccess: () => navigate("/login"),
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    signUpMutation.mutate(form)
  }

  function updateField(name: keyof typeof form, value: string) {
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-7 md:px-8 md:py-10">
      <Link
        to="/login"
        className="flex size-10 items-center justify-center rounded-full hover:bg-neutral-100"
        aria-label="로그인으로 돌아가기"
      >
        <ArrowLeft className="size-5" />
      </Link>

      <div className="mt-5">
        <p className="text-xs font-bold text-neutral-400">JOIN D:EAR</p>
        <h1 className="mt-2 text-2xl font-black">회원가입</h1>
        <p className="mt-2 text-sm text-neutral-500">
          거래와 배송에 필요한 기본 정보를 입력해 주세요.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <FormField
          label="이메일"
          value={form.email}
          type="email"
          placeholder="email@example.com"
          onChange={(value) => updateField("email", value)}
        />
        <FormField
          label="비밀번호"
          value={form.password}
          type="password"
          placeholder="8자 이상의 비밀번호"
          onChange={(value) => updateField("password", value)}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            label="이름"
            value={form.name}
            placeholder="실명"
            onChange={(value) => updateField("name", value)}
          />
          <FormField
            label="전화번호"
            value={form.phoneNumber}
            placeholder="010-0000-0000"
            onChange={(value) => updateField("phoneNumber", value)}
          />
        </div>
        <FormField
          label="기본 배송지"
          value={form.defaultShippingAddress}
          placeholder="주소를 입력해 주세요"
          onChange={(value) => updateField("defaultShippingAddress", value)}
        />

        {signUpMutation.isError && (
          <p className="text-sm text-red-600">
            {getApiErrorMessage(signUpMutation.error)}
          </p>
        )}

        <button
          type="submit"
          className="h-12 w-full rounded-md bg-brand-500 text-sm font-bold text-neutral-950 hover:bg-brand-600"
          disabled={signUpMutation.isPending}
        >
          {signUpMutation.isPending ? "가입 중..." : "D:EAR 시작하기"}
        </button>
      </form>
    </div>
  )
}

function FormField({
  label,
  value,
  type = "text",
  placeholder,
  onChange,
}: {
  label: string
  value: string
  type?: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
          type={type}
        className="h-12 w-full rounded-md border border-neutral-300 px-3 text-sm outline-none focus:border-brand-500"
          placeholder={placeholder}
          minLength={type === "password" ? 8 : undefined}
          maxLength={type === "password" ? 64 : undefined}
          required
      />
    </label>
  )
}
