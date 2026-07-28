import { apiClient } from "@/lib/apiClient"
import type { ApiResponse } from "@/types/api"
import type { LoginRequest, SignUpRequest, TokenResponse } from "@/types/auth"

export async function login(request: LoginRequest) {
  const { data } = await apiClient.post<ApiResponse<TokenResponse>>(
    "/api/auth/login",
    request
  )

  localStorage.setItem("accessToken", data.data.accessToken)

  return data.data
}

export async function signUp(request: SignUpRequest) {
  const { data } = await apiClient.post<ApiResponse<TokenResponse>>(
    "/api/auth/signup",
    request
  )

  localStorage.setItem("accessToken", data.data.accessToken)

  return data.data
}

export async function logout() {
  await apiClient.post<ApiResponse<void>>("/api/auth/logout")
  localStorage.removeItem("accessToken")
}
