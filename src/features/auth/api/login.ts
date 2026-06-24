import { saveAccessToken } from '@/features/auth/auth-storage'
import { apiRequest } from '@/shared/api/client'

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  access_token?: string
  token_type?: string
}

export async function login(payload: LoginPayload) {
  const endpoint = import.meta.env.VITE_LOGIN_ENDPOINT || '/auth/login'
  const response = await apiRequest<LoginResponse>(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  // JSON 토큰 응답은 세션 동안만 보관합니다. HttpOnly 쿠키 방식도 credentials로 지원합니다.
  if (response.access_token) saveAccessToken(response.access_token)

  return response
}
