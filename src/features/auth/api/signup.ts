import { apiRequest } from '@/shared/api/client'

export type SendVerificationCodeResponse = {
  message?: string
}

export type VerifyEmailCodeResponse = {
  verification_token?: string
  verified?: boolean
}

export type SignupPayload = {
  email: string
  nickname: string
  password: string
  verification_token?: string
}

export async function sendVerificationCode(email: string) {
  return apiRequest<SendVerificationCodeResponse>('/auth/email-verification/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  })
}

export async function verifyEmailCode(email: string, code: string) {
  return apiRequest<VerifyEmailCodeResponse>('/auth/email-verification/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  })
}

export async function signup(payload: SignupPayload) {
  return apiRequest('/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
