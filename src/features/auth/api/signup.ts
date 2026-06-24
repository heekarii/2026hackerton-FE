import { apiRequest } from '@/shared/api/client'

export type SignupPayload = {
  email: string
  password: string
  name: string
  student_id: string
  department: string
}

export async function signup(payload: SignupPayload) {
  return apiRequest('/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
