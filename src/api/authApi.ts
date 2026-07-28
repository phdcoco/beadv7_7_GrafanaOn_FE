import { apiClient } from "@/lib/apiClient"
import type { ApiResponse } from "@/types/api"
import type {
  LoginRequest,
  SignUpRequest,
  SignUpResponse,
  TokenResponse,
} from "@/types/auth"

export async function login(request: LoginRequest) {
  const { data } = await apiClient.post<ApiResponse<TokenResponse>>(
    "/api/auth/login",
    request
  )

  localStorage.setItem("accessToken", data.data.accessToken)

  return data.data
}

export async function signUp(request: SignUpRequest) {
  const { data } = await apiClient.post<ApiResponse<SignUpResponse>>(
    "/api/auth/signup",
    request
  )

  return data.data
}

export async function logout() {
  await apiClient.post<ApiResponse<void>>("/api/auth/logout")
  localStorage.removeItem("accessToken")
}

export async function reissueToken() {
  const { data } = await apiClient.post<ApiResponse<TokenResponse>>(
    "/api/auth/reissue"
  )

  localStorage.setItem("accessToken", data.data.accessToken)

  return data.data
}
