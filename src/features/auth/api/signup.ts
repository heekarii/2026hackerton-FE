import { ApiError, apiRequest } from '@/shared/api/client'

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

function getEndpoint(value: string | undefined, label: string) {
  if (!value) {
    throw new ApiError(
      `${label} API가 Swagger에 아직 등록되지 않았습니다. .env.local에 해당 경로를 설정해 주세요.`,
      0,
    )
  }

  return value
}

export async function sendVerificationCode(email: string) {
  return apiRequest<SendVerificationCodeResponse>(
    getEndpoint(import.meta.env.VITE_SIGNUP_SEND_CODE_ENDPOINT, '이메일 인증번호 발송'),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    },
  )
}

export async function verifyEmailCode(email: string, code: string) {
  return apiRequest<VerifyEmailCodeResponse>(
    getEndpoint(import.meta.env.VITE_SIGNUP_VERIFY_CODE_ENDPOINT, '이메일 인증번호 확인'),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    },
  )
}

export async function signup(payload: SignupPayload) {
  return apiRequest(
    getEndpoint(import.meta.env.VITE_SIGNUP_ENDPOINT, '회원가입'),
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  )
}
