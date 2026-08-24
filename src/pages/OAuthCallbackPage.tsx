import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { LoaderCircle } from "lucide-react"
import {
  consumeGoogleLoginRedirect,
  reissueToken,
} from "@/api/authApi"
import { getApiErrorMessage } from "@/lib/apiClient"

export function OAuthCallbackPage() {
  const navigate = useNavigate()
  const attempted = useRef(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    if (attempted.current) {
      return
    }

    attempted.current = true
    reissueToken()
      .then(() => navigate(consumeGoogleLoginRedirect(), { replace: true }))
      .catch((error) => {
        consumeGoogleLoginRedirect()
        setErrorMessage(getApiErrorMessage(error))
      })
  }, [navigate])

  if (errorMessage) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
        <p className="text-base font-black">Google 로그인을 완료하지 못했습니다.</p>
        <p className="mt-2 text-sm text-neutral-500">{errorMessage}</p>
        <Link to="/login" className="mt-6 text-sm font-bold underline">
          로그인 화면으로 돌아가기
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <LoaderCircle className="size-7 animate-spin text-brand" />
      <p className="mt-4 text-sm font-bold">Google 로그인을 마무리하고 있어요.</p>
    </div>
  )
}
