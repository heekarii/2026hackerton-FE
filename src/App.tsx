import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'

import { HomePage } from '@/pages/HomePage'
import { AdminLoginPage } from '@/pages/AdminLoginPage'
import { AdminSignupPage } from '@/pages/AdminSignupPage'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'
import { ComplaintPage } from '@/pages/ComplaintPage'
import { ComplainantPage } from '@/pages/ComplainantPage'
import { getAccessToken, getAuthUser } from '@/features/auth/auth-storage'

export const categories = [
  '시설',
  '수업 환경',
  '식당',
  '도서관',
  '행정 서비스',
  '기타',
] as const

export type Category = (typeof categories)[number]

export type FormState = {
  title: string
  category: Category
  occurrenceAt: string
  complaint: string
  improvement: string
  isAnonymous: boolean
}

export type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error'

export type ImagePreview = {
  id: string
  name: string
  size: string
  url: string
}

export const initialForm: FormState = {
  title: '',
  category: '시설',
  occurrenceAt: '',
  complaint: '',
  improvement: '',
  isAnonymous: true,
}

export function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.ceil(size / 1024)}KB`
  }

  return `${(size / 1024 / 1024).toFixed(1)}MB`
}

function ProtectedRoute({
  children,
  loginPath = '/login',
  requireAdmin = false,
}: {
  children: ReactNode
  loginPath?: string
  requireAdmin?: boolean
}) {
  const user = getAuthUser()
  const hasSession = Boolean(getAccessToken() || user)
  const isAdmin = user?.role?.toUpperCase().includes('ADMIN') ?? false

  if (!hasSession) return <Navigate replace to={loginPath} />
  if (requireAdmin && !isAdmin) return <Navigate replace to="/mypage" />

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute loginPath="/admin/login" requireAdmin>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/signup" element={<AdminSignupPage />} />
        <Route path="/complaint" element={<ComplaintPage />} />
        <Route
          path="/mypage"
          element={
            <ProtectedRoute>
              <ComplainantPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate replace to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
