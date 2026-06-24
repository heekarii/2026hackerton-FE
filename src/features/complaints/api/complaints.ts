import { apiRequest } from '@/shared/api/client'

export type ComplaintRecord = {
  id: number
  title: string
  content: string
  expectation: string | null
  is_anonymous: boolean
  status: 'received' | 'in_progress' | 'resolved' | 'rejected' | string
  location: string
  occurred_at: string
  created_at: string
  updated_at: string
  ai_category: string | null
  ai_subcategory: string | null
  ai_sentiment: string | null
  ai_urgency: string | null
  ai_sensitive: boolean | null
  ai_risk_type: string | null
  ai_department: string | null
  ai_summary: string | null
  ai_keywords: string[] | null
  ai_expected_days: string | null
  ai_recommended_action: string | null
}

export type CreateComplaintPayload = {
  title: string
  content: string
  desired_solution?: string
  location_name: string
  occurred_at?: string
  is_anonymous: boolean
  image_url?: string
}

export type SaveComplaintAnalysisPayload = {
  category: string
  subcategory: string
  sentiment: string
  urgency: string
  sensitive: boolean
  risk_type: string
  department: string
  summary: string
  keywords: string[]
  expected_days: string
  recommended_action: string
}

export function listComplaints() {
  return apiRequest<ComplaintRecord[]>('/complaints')
}

export function createComplaint(payload: CreateComplaintPayload) {
  return apiRequest<ComplaintRecord>('/complaints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

// Backend implementation pending: stores an AI result after an administrator-initiated reclassification.
export function saveComplaintAnalysis(complaintId: number, payload: SaveComplaintAnalysisPayload) {
  return apiRequest<ComplaintRecord>(`/admin/complaints/${complaintId}/analysis`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}
