export type LoginRequest = {
  email: string
  password: string
}

export type SignUpRequest = {
  email: string
  password: string
  name: string
  defaultShippingAddress: string
  phoneNumber: string
}

export type TokenResponse = {
  accessToken: string
}
