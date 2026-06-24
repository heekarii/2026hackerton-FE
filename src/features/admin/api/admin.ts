import { apiRequest } from '@/shared/api/client'

export type WorkflowStepRequest = {
  owner: string
  task: string
  due: string
}

export type CreateWorkflowPayload = {
  complaint_id?: number
  title: string
  department: string
  urgency: string
  steps: WorkflowStepRequest[]
}

export type WorkflowResponse = CreateWorkflowPayload & {
  id: number
  status: 'draft' | 'active' | 'completed'
  created_at: string
}

export type AdminAnalyticsResponse = {
  generated_at: string
  total_complaints: number
  categories: Array<{
    category: string
    count: number
    urgent_count: number
    average_expected_days: number | null
    week_over_week_percent: number
  }>
  time_slots: Array<{ hour: number; count: number }>
  locations: Array<{ location: string; category: string; count: number }>
}

// These admin endpoints are the expected backend contract. See docs/admin-api-requirements.md.
export function getAdminAnalytics() {
  return apiRequest<AdminAnalyticsResponse>('/admin/analytics/complaints')
}

export function createWorkflow(payload: CreateWorkflowPayload) {
  return apiRequest<WorkflowResponse>('/admin/workflows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function updateWorkflowStatus(workflowId: number, status: WorkflowResponse['status']) {
  return apiRequest<WorkflowResponse>(`/admin/workflows/${workflowId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}

export function applyRepeatLimit(userId: number, durationHours: number) {
  return apiRequest(`/admin/repeat-limits/${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ duration_hours: durationHours }),
  })
}
