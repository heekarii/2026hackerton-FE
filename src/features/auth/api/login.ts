import { type AuthUser, saveAccessToken, saveAuthUser } from '@/features/auth/auth-storage'
import { apiRequest } from '@/shared/api/client'

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  access_token?: string
  token_type?: string
  role?: string
  user_role?: string
  member_role?: string
  user?: AuthUser
}

export function getLoginRedirectPath(response: LoginResponse) {
  const role = response.role ?? response.user_role ?? response.member_role ?? response.user?.role

  return role?.toUpperCase().includes('ADMIN') ? '/' : '/mypage'
}

export async function login(payload: LoginPayload) {
  const response = await apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  // JSON 토큰 응답은 세션 동안만 보관합니다. HttpOnly 쿠키 방식도 credentials로 지원합니다.
  if (response.access_token) saveAccessToken(response.access_token)
  if (response.user) saveAuthUser(response.user)

  return response
}
