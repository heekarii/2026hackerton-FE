import { getAccessToken } from '@/features/auth/auth-storage'
import { apiRequest } from '@/shared/api/client'

export type ComplaintAnalysis = {
  category: string
  subcategory: string
  sentiment: '긍정' | '중립' | '부정' | string
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string
  sensitive: boolean
  risk_type: string
  department: string
  summary: string
  keywords: string[]
  expected_days: string
  recommended_action: string
}

export async function analyzeComplaint(text: string) {
  const accessToken = getAccessToken()

  return apiRequest<ComplaintAnalysis>('/openai/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ text }),
  })
}
