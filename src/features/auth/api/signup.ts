import { apiRequest } from '@/shared/api/client'

export type SignupPayload = {
  email: string
  nickname: string
  password: string
}

export async function signup(payload: SignupPayload) {
  return apiRequest('/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
