import { ApiError } from './api-error'

type JsonBody = Record<string, unknown>

const mockUser = {
  id: 1,
  name: '김민서',
  nickname: '민서',
  email: 'minseo@university.ac.kr',
  department: '컴퓨터공학과',
  student_id: '20261234',
  role: 'complainant',
}

const mockComplaints = [
  {
    id: 1038,
    title: '도서관 3층 열람실 콘센트 고장',
    category: '도서관',
    submitted_at: '2026-06-22T09:20:00.000Z',
    location: '중앙도서관 3층 B구역',
    status: 'processing',
    assigned_to: '시설관리팀',
    answer: null,
    satisfaction: null,
  },
  {
    id: 1024,
    title: '학생식당 배식 대기 줄 안내 필요',
    category: '식당',
    submitted_at: '2026-06-18T03:10:00.000Z',
    location: '학생회관 1층',
    status: 'completed',
    assigned_to: '복지지원팀',
    answer: '혼잡 시간대 바닥 안내선과 대기 표지판 설치를 완료했습니다.',
    satisfaction: 4,
  },
  {
    id: 1019,
    title: '강의실 냉방 온도 점검 요청',
    category: '수업 환경',
    submitted_at: '2026-06-15T05:45:00.000Z',
    location: '공학관 204호',
    status: 'processing',
    assigned_to: '학사지원팀',
    answer: null,
    satisfaction: null,
  },
]

const mockDashboard = {
  semester: '2026-1학기',
  campus: '전체 캠퍼스',
  total_complaints: 628,
  urgent_total: 46,
  categories: [
    { name: '시설', count: 184, share: 29, delta: 18, average_days: 4.2, urgent: 12, department: '시설관리팀' },
    { name: '수업', count: 132, share: 21, delta: 7, average_days: 5.8, urgent: 4, department: '교무처' },
    { name: '학식', count: 105, share: 17, delta: 22, average_days: 3.1, urgent: 7, department: '학생복지팀' },
    { name: '도서관', count: 76, share: 12, delta: -4, average_days: 2.7, urgent: 2, department: '학술정보원' },
    { name: '행정', count: 69, share: 11, delta: 9, average_days: 6.4, urgent: 3, department: '행정지원처' },
    { name: '안전/보건', count: 62, share: 10, delta: 31, average_days: 1.6, urgent: 18, department: '안전관리센터' },
  ],
  time_slots: [
    { label: '08시', value: 31 },
    { label: '10시', value: 64 },
    { label: '12시', value: 88 },
    { label: '14시', value: 72 },
    { label: '16시', value: 95 },
    { label: '18시', value: 43 },
    { label: '20시', value: 27 },
  ],
  location_hotspots: [
    { name: '공학관', building: '6번', count: 68, x: '33%', y: '48%', category: '시설' },
    { name: '학생회관', building: '14번', count: 54, x: '70%', y: '45%', category: '학식' },
    { name: '다산관', building: '23번', count: 37, x: '82%', y: '31%', category: '수업' },
    { name: '집현관', building: '1번', count: 31, x: '32%', y: '72%', category: '행정' },
    { name: '군자관', building: '5번', count: 29, x: '37%', y: '57%', category: '시설' },
  ],
}

function parseJsonBody(options: RequestInit): JsonBody {
  if (typeof options.body !== 'string') return {}

  try {
    return JSON.parse(options.body) as JsonBody
  } catch {
    return {}
  }
}

function getMethod(options: RequestInit) {
  return (options.method ?? 'GET').toUpperCase()
}

export function shouldUseMockApi() {
  return import.meta.env.VITE_USE_MOCK_API === 'true'
}

export async function mockApiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = getMethod(options)
  const body = parseJsonBody(options)

  await new Promise((resolve) => window.setTimeout(resolve, 250))

  if (method === 'POST' && path === '/auth/login') {
    return {
      access_token: 'mock-access-token',
      token_type: 'bearer',
      user: mockUser,
    } as T
  }

  if (method === 'POST' && path === '/auth/email-verification/send') {
    return {
      message: `${body.email ?? '입력한 이메일'}로 인증번호 123456을 보냈습니다.`,
      expires_in_seconds: 300,
    } as T
  }

  if (method === 'POST' && path === '/auth/email-verification/verify') {
    if (body.code && body.code !== '123456') {
      throw new ApiError('인증번호가 일치하지 않습니다. mock 인증번호는 123456입니다.', 400)
    }

    return {
      verified: true,
      verification_token: 'mock-email-verification-token',
    } as T
  }

  if (method === 'POST' && path === '/auth/signup') {
    return {
      id: 2,
      email: body.email,
      nickname: body.nickname,
      message: '회원가입이 완료되었습니다.',
    } as T
  }

  if (method === 'GET' && path === '/me') {
    return { user: mockUser } as T
  }

  if (method === 'GET' && path === '/me/complaints') {
    return { complaints: mockComplaints } as T
  }

  if (method === 'GET' && path === '/dashboard/summary') {
    return mockDashboard as T
  }

  if (method === 'POST' && path === '/complaints') {
    const createdId = 1042

    return {
      id: createdId,
      status: 'received',
      message: '민원이 등록됐어요. AI가 분류, 요약, 유사 민원을 분석합니다.',
      complaint: {
        id: createdId,
        title: body.title,
        category: body.category,
        occurred_at: body.occurred_at,
        complaint_content: body.complaint_content,
        desired_improvement: body.desired_improvement,
        is_anonymous: body.is_anonymous,
        image_names: body.image_names,
        assigned_to: '시설관리팀',
      },
      ai_analysis: {
        summary: '냉방 또는 시설 이용 불편으로 분류된 민원입니다.',
        urgency: 'normal',
        similar_complaints: [
          { id: 1038, title: '도서관 3층 열람실 콘센트 고장', match_rate: 82 },
          { id: 1019, title: '강의실 냉방 온도 점검 요청', match_rate: 76 },
        ],
      },
    } as T
  }

  const satisfactionMatch = path.match(/^\/complaints\/(\d+)\/satisfaction$/)
  if (method === 'PATCH' && satisfactionMatch) {
    return {
      id: Number(satisfactionMatch[1]),
      satisfaction: body.satisfaction,
      message: '만족도가 저장되었습니다.',
    } as T
  }

  throw new ApiError(`Mock API가 정의되지 않은 요청입니다: ${method} ${path}`, 404)
}
