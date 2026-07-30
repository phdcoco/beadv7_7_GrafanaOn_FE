import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { clearAccessToken, getAccessToken, setAccessToken } from "@/lib/authStorage"
import type { ApiResponse } from "@/types/api"
import type { TokenResponse } from "@/types/auth"

const baseURL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.PROD ? "/" : "http://localhost:8080")

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
})

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
})

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

export class ApiClientError extends Error {
  status?: number
  code?: string

  constructor(message: string, status?: number, code?: string) {
    super(message)
    this.name = "ApiClientError"
    this.status = status
    this.code = code
  }
}

let refreshPromise: Promise<string> | null = null

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const request = error.config as RetryableRequestConfig | undefined
    const isAuthEntryPoint = [
      "/api/auth/login",
      "/api/auth/signup",
      "/api/auth/reissue",
    ].some((path) => request?.url?.includes(path))

    if (
      error.response?.status === 401 &&
      request &&
      !request._retry &&
      !isAuthEntryPoint &&
      getAccessToken()
    ) {
      request._retry = true

      try {
        refreshPromise ??= refreshAccessToken()
        const accessToken = await refreshPromise
        request.headers.Authorization = `Bearer ${accessToken}`
        return apiClient.request(request)
      } catch {
        clearAccessToken()
      } finally {
        refreshPromise = null
      }
    }

    throw toApiClientError(error)
  }
)

async function refreshAccessToken() {
  const { data } = await refreshClient.post<ApiResponse<TokenResponse>>(
    "/api/auth/reissue"
  )
  const accessToken = data.data?.accessToken

  if (!accessToken) {
    throw new ApiClientError("토큰을 재발급하지 못했습니다.", 401)
  }

  setAccessToken(accessToken)
  return accessToken
}

function toApiClientError(error: AxiosError<ApiResponse<unknown>>) {
  const response = error.response
  const message =
    response?.data?.message ||
    (response?.status === 401
      ? "로그인이 필요합니다."
      : "요청을 처리하지 못했습니다.")

  return new ApiClientError(message, response?.status, response?.data?.code)
}

export function getApiErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "요청을 처리하지 못했습니다."
}
