import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { SignupPage } from '@/pages/SignupPage'

export const API_BASE_URL = 'https://two026hackerton-be.onrender.com'

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate replace to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
