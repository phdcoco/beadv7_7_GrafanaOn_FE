import { apiClient, getApiUrl } from "@/lib/apiClient"
import { clearAccessToken, setAccessToken } from "@/lib/authStorage"
import { unwrapData } from "@/lib/apiResponse"
import { USE_MOCKS } from "@/lib/runtime"
import type { ApiResponse } from "@/types/api"
import type {
  LoginRequest,
  SignUpRequest,
  SignUpResponse,
  TokenResponse,
} from "@/types/auth"

const GOOGLE_OAUTH_PENDING_KEY = "dear-google-oauth-pending"
const GOOGLE_OAUTH_REDIRECT_KEY = "dear-google-oauth-redirect"

export async function login(request: LoginRequest) {
  if (USE_MOCKS) {
    const token = `mock-access-token-${request.email}`
    setAccessToken(token)

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

  const token = unwrapData(data)
  setAccessToken(token.accessToken)

  return token
}

export async function signUp(request: SignUpRequest) {
  if (USE_MOCKS) {
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

  return unwrapData(data)
}

export async function logout() {
  if (USE_MOCKS) {
    clearAccessToken()
    return
  }

  try {
    await apiClient.post<ApiResponse<void>>("/api/auth/logout")
  } finally {
    clearAccessToken()
  }
}

export async function reissueToken() {
  if (USE_MOCKS) {
    const token = "mock-reissued-access-token"
    setAccessToken(token)

    return {
      accessToken: token,
      tokenType: "Bearer" as const,
      expiresIn: 1800,
    }
  }

  const { data } = await apiClient.post<ApiResponse<TokenResponse>>(
    "/api/auth/reissue"
  )

  const token = unwrapData(data)
  setAccessToken(token.accessToken)

  return token
}

export async function withdraw() {
  if (USE_MOCKS) {
    clearAccessToken()
    return
  }

  await apiClient.delete<ApiResponse<void>>("/api/auth/withdraw")
  clearAccessToken()
}

export function startGoogleLogin(redirect = "/") {
  sessionStorage.setItem(GOOGLE_OAUTH_PENDING_KEY, "true")
  sessionStorage.setItem(
    GOOGLE_OAUTH_REDIRECT_KEY,
    redirect.startsWith("/") ? redirect : "/"
  )
  window.location.assign(
    getApiUrl("/api/auth/oauth2/authorization/google")
  )
}

export function isGoogleLoginPending() {
  return sessionStorage.getItem(GOOGLE_OAUTH_PENDING_KEY) === "true"
}

export function consumeGoogleLoginRedirect() {
  const redirect = sessionStorage.getItem(GOOGLE_OAUTH_REDIRECT_KEY) ?? "/"
  sessionStorage.removeItem(GOOGLE_OAUTH_PENDING_KEY)
  sessionStorage.removeItem(GOOGLE_OAUTH_REDIRECT_KEY)
  return redirect.startsWith("/") ? redirect : "/"
}
