import client from './client'

export interface SendOTPResponse {
  message: string
  phone: string
  expires_in_seconds: number
}

export interface VerifyOTPResponse {
  access_token: string
  refresh_token: string
  token_type: string
  is_new_user: boolean
}

export async function sendOTP(phone: string): Promise<SendOTPResponse> {
  const response = await client.post<SendOTPResponse>('/auth/send-otp', { phone })
  return response.data
}

export async function verifyOTP(phone: string, code: string): Promise<VerifyOTPResponse> {
  const response = await client.post<VerifyOTPResponse>('/auth/verify-otp', { phone, code })
  return response.data
}

export async function refreshToken(refreshToken: string): Promise<VerifyOTPResponse> {
  const response = await client.post<VerifyOTPResponse>('/auth/refresh', {
    refresh_token: refreshToken,
  })
  return response.data
}
