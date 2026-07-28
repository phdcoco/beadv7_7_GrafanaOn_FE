import { apiClient } from "@/lib/apiClient"
import type { ApiResponse } from "@/types/api"
import type {
  LoginRequest,
  SignUpRequest,
  SignUpResponse,
  TokenResponse,
} from "@/types/auth"

const useMocks = import.meta.env.VITE_USE_MOCKS !== "false"

export async function login(request: LoginRequest) {
  if (useMocks) {
    const token = `mock-access-token-${request.email}`
    localStorage.setItem("accessToken", token)

    return {
      accessToken: token,
      tokenType: "Bearer" as const,
      expiresIn: 1800,
    }
  }

  const { data } = await apiClient.post<ApiResponse<TokenResponse>>(
    "/api/auth/login",
    request
  )

  localStorage.setItem("accessToken", data.data.accessToken)

  return data.data
}

export async function signUp(request: SignUpRequest) {
  if (useMocks) {
    return {
      memberId: 1,
      email: request.email,
      nickname: "dear_000001",
    }
  }

  const { data } = await apiClient.post<ApiResponse<SignUpResponse>>(
    "/api/auth/signup",
    request
  )

  return data.data
}

export async function logout() {
  if (useMocks) {
    localStorage.removeItem("accessToken")
    return
  }

  await apiClient.post<ApiResponse<void>>("/api/auth/logout")
  localStorage.removeItem("accessToken")
}

export async function reissueToken() {
  if (useMocks) {
    const token = "mock-reissued-access-token"
    localStorage.setItem("accessToken", token)

    return {
      accessToken: token,
      tokenType: "Bearer" as const,
      expiresIn: 1800,
    }
  }

  const { data } = await apiClient.post<ApiResponse<TokenResponse>>(
    "/api/auth/reissue"
  )

  localStorage.setItem("accessToken", data.data.accessToken)

  return data.data
}
