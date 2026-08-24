import { type FormEvent, useEffect, useRef, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { ArrowRight, LockKeyhole, Mail } from "lucide-react"
import {
  consumeGoogleLoginRedirect,
  isGoogleLoginPending,
  login,
  reissueToken,
  startGoogleLogin,
} from "@/api/authApi"
import { BrandWordmark } from "@/components/brand/Brand"
import { getApiErrorMessage } from "@/lib/apiClient"

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [oauthCompleting, setOauthCompleting] = useState(false)
  const [oauthError, setOauthError] = useState("")
  const oauthAttempted = useRef(false)

  useEffect(() => {
    if (!isGoogleLoginPending() || oauthAttempted.current) {
      return
    }

    oauthAttempted.current = true
    setOauthCompleting(true)
    reissueToken()
      .then(() => navigate(consumeGoogleLoginRedirect(), { replace: true }))
      .catch((error) => {
        consumeGoogleLoginRedirect()
        setOauthError(getApiErrorMessage(error))
        setOauthCompleting(false)
      })
  }, [navigate])

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      const redirect = searchParams.get("redirect")
      navigate(redirect?.startsWith("/") ? redirect : "/")
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    loginMutation.mutate({ email, password })
  }

  return (
    <div className="grid min-h-[calc(100vh-64px)] md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-neutral-950 p-10 text-white md:flex">
        <BrandWordmark className="text-white" />
        <div>
          <p className="text-3xl font-black leading-tight">
            신발에 담긴 이야기를
            <br />
            다시 이어가세요.
          </p>
          <p className="mt-4 text-sm leading-6 text-neutral-400">
            즉시구매와 오퍼, 나의 모든 거래를 한곳에서 관리할 수 있어요.
          </p>
        </div>
        <p className="text-xs text-neutral-600">D:EAR · 2026</p>
      </div>

      <div className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <p className="text-xs font-bold text-neutral-400">WELCOME BACK</p>
          <h1 className="mt-2 text-2xl font-black">로그인</h1>
          <p className="mt-2 text-sm text-neutral-500">
            이메일과 비밀번호를 입력해 주세요.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-xs font-bold">이메일</span>
              <span className="relative block">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  className="h-12 w-full rounded-md border border-neutral-300 pl-10 pr-3 text-sm outline-none focus:border-brand"
                  placeholder="email@example.com"
                  required
                />
              </span>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold">비밀번호</span>
              <span className="relative block">
                <LockKeyhole className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  className="h-12 w-full rounded-md border border-neutral-300 pl-10 pr-3 text-sm outline-none focus:border-brand"
                  placeholder="비밀번호"
                  required
                />
              </span>
            </label>

            {loginMutation.isError && (
              <p className="text-sm text-red-600">
                {getApiErrorMessage(loginMutation.error)}
              </p>
            )}

            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-brand text-sm font-bold text-neutral-950 hover:brightness-95"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "로그인 중..." : "로그인"}
              {!loginMutation.isPending && <ArrowRight className="size-4" />}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[11px] font-bold text-neutral-400">
            <span className="h-px flex-1 bg-neutral-200" />
            또는
            <span className="h-px flex-1 bg-neutral-200" />
          </div>

          {oauthError && (
            <p className="mb-3 text-sm text-red-600">{oauthError}</p>
          )}

          <button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-3 rounded-md border border-neutral-300 bg-white text-sm font-bold hover:bg-neutral-50 disabled:text-neutral-400"
            disabled={oauthCompleting}
            onClick={() => {
              const redirect = searchParams.get("redirect")
              startGoogleLogin(redirect?.startsWith("/") ? redirect : "/")
            }}
          >
            <span className="flex size-5 items-center justify-center rounded-full border border-neutral-300 text-xs font-black">
              G
            </span>
            {oauthCompleting ? "Google 로그인 확인 중..." : "Google로 계속하기"}
          </button>

          <p className="mt-6 text-center text-sm text-neutral-500">
            아직 회원이 아닌가요?{" "}
            <Link
              to="/signup"
              className="font-bold text-neutral-950 underline decoration-brand decoration-2 underline-offset-4"
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
