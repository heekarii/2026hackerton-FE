import { apiRequest } from '@/shared/api/client'

export type SignupPayload = {
  email: string
  password: string
  name: string
  student_id: string
  department: string
  // 현재 백엔드의 nickname 필수값과 호환을 유지합니다.
  nickname: string
}

export async function signup(payload: SignupPayload) {
  return apiRequest('/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
