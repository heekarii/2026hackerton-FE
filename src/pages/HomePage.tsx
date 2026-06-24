import {
  Activity,
  AlarmClock,
  BadgeAlert,
  BarChart3,
  BellRing,
  Bot,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Download,
  FileBarChart,
  Filter,
  Handshake,
  LayoutDashboard,
  LineChart,
  LoaderCircle,
  LogOut,
  MapPin,
  Megaphone,
  MessageSquareWarning,
  Phone,
  Plus,
  RefreshCw,
  Route,
  Send,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  Users,
  Workflow,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { clearAccessToken } from '@/features/auth/auth-storage'
import { analyzeComplaint, type ComplaintAnalysis } from '@/features/complaints/api/analyze'
import {
  listComplaints,
  saveComplaintAnalysis,
  type ComplaintRecord,
} from '@/features/complaints/api/complaints'
import { cn } from '@/lib/utils'

type CategoryName = '시설' | '수업' | '학식' | '도서관' | '행정' | '안전/보건' | '기타'
type AdminView = 'overview' | 'analysis' | 'departments' | 'ai' | 'reports'
type WorkflowStatus = '대기' | '진행 중' | '완료'
type SemesterFilter = '전체 기간' | '2026-1학기' | '2026-2학기'

type ComplaintCategory = {
  name: CategoryName
  count: number
  share: number
  delta: number
  averageDays: number
  urgent: number
  department: string
  color: string
  softColor: string
  ringColor: string
}

type SimilarCase = {
  title: string
  category: CategoryName
  matchRate: number
  solvedBy: string
  result: string
  days: number
}

type Department = {
  name: string
  phone: string
  duties: string
  queue: string
}

type WorkflowItem = {
  id: number
  owner: string
  task: string
  due: string
  status: WorkflowStatus
}

type WorkflowDraft = {
  title: string
  department: Department
  items: WorkflowItem[]
}

type SensitiveAlert = {
  id: string
  title: string
  category: string
  level: string
  score: number
  owner: string
}

const categories: ComplaintCategory[] = [
  {
    name: '시설',
    count: 184,
    share: 29,
    delta: 18,
    averageDays: 4.2,
    urgent: 12,
    department: '시설관리팀',
    color: 'bg-teal-700',
    softColor: 'bg-teal-50 text-teal-700',
    ringColor: 'ring-teal-200',
  },
  {
    name: '수업',
    count: 132,
    share: 21,
    delta: 7,
    averageDays: 5.8,
    urgent: 4,
    department: '교무과',
    color: 'bg-indigo-600',
    softColor: 'bg-indigo-50 text-indigo-700',
    ringColor: 'ring-indigo-200',
  },
  {
    name: '학식',
    count: 105,
    share: 17,
    delta: 22,
    averageDays: 3.1,
    urgent: 7,
    department: '학생지원과',
    color: 'bg-amber-500',
    softColor: 'bg-amber-50 text-amber-700',
    ringColor: 'ring-amber-200',
  },
  {
    name: '도서관',
    count: 76,
    share: 12,
    delta: -4,
    averageDays: 2.7,
    urgent: 2,
    department: '학술정보원',
    color: 'bg-cyan-600',
    softColor: 'bg-cyan-50 text-cyan-700',
    ringColor: 'ring-cyan-200',
  },
  {
    name: '행정',
    count: 69,
    share: 11,
    delta: 9,
    averageDays: 6.4,
    urgent: 3,
    department: '학사지원과',
    color: 'bg-violet-600',
    softColor: 'bg-violet-50 text-violet-700',
    ringColor: 'ring-violet-200',
  },
  {
    name: '안전/보건',
    count: 62,
    share: 10,
    delta: 31,
    averageDays: 1.6,
    urgent: 18,
    department: '안전관리센터',
    color: 'bg-rose-600',
    softColor: 'bg-rose-50 text-rose-700',
    ringColor: 'ring-rose-200',
  },
  {
    name: '기타',
    count: 0,
    share: 0,
    delta: 0,
    averageDays: 0,
    urgent: 0,
    department: '학사지원과',
    color: 'bg-slate-600',
    softColor: 'bg-slate-100 text-slate-700',
    ringColor: 'ring-slate-200',
  },
]

const departments: Department[] = [
  {
    name: '교무과',
    phone: '02-3408-4191',
    duties: '전임교원 인사, 교원 관련 규정 및 제도 개선',
    queue: '수업·교원 민원 6건',
  },
  {
    name: '학사지원과',
    phone: '02-3408-3037',
    duties: '수강신청, 휴·복학, 성적, 졸업, 전공배정, 학점교류',
    queue: '행정 민원 12건',
  },
  {
    name: '입학과',
    phone: '02-3408-3029',
    duties: '신입학 및 편입학 전형, 입시 홍보',
    queue: '입시 문의 3건',
  },
  {
    name: '학생지원과',
    phone: '02-3408-3052~3056',
    duties: '교내외 장학금, 총학생회·동아리 지원, 학생증',
    queue: '학생복지 민원 9건',
  },
  {
    name: '장애학생지원센터',
    phone: '02-3408-4355',
    duties: '장애 학생을 위한 학습 지원 및 복지',
    queue: '지원 요청 2건',
  },
  {
    name: '진로취업지원센터',
    phone: '02-3408-4152',
    duties: '추천채용, 취업 프로그램 운영, 대학일자리플러스센터',
    queue: '진로·취업 문의 4건',
  },
  {
    name: '전산개발과/운영과',
    phone: '02-3408-3488',
    duties: '포털 시스템 및 학사·행정 정보시스템 장애 처리',
    queue: '시스템 민원 5건',
  },
]

const timeSlots = [
  { label: '08시', value: 31 },
  { label: '10시', value: 64 },
  { label: '12시', value: 88 },
  { label: '14시', value: 72 },
  { label: '16시', value: 95 },
  { label: '18시', value: 43 },
  { label: '20시', value: 27 },
]

const dayLabels = ['월', '화', '수', '목', '금']
const weeklyDensity = [
  [38, 61, 85, 70, 91, 46, 22],
  [29, 57, 79, 76, 88, 42, 24],
  [32, 66, 90, 74, 95, 49, 31],
  [25, 54, 82, 68, 90, 44, 27],
  [34, 72, 94, 80, 87, 56, 29],
]

type CampusBuilding = {
  name: string
  building: string
  x: string
  y: string
  category: CategoryName
}

const campusBuildings: CampusBuilding[] = [
  { name: '집현관', building: '1번', x: '32%', y: '72%', category: '행정' },
  { name: '대학원', building: '2번', x: '35%', y: '83%', category: '수업' },
  { name: '평생교육원', building: '3번', x: '23%', y: '89%', category: '행정' },
  { name: '제3연구실', building: '4번', x: '22%', y: '64%', category: '수업' },
  { name: '군자관', building: '5번', x: '37%', y: '61%', category: '시설' },
  { name: '광개토관', building: '6번', x: '38%', y: '54%', category: '시설' },
  { name: '이당관', building: '7번', x: '32%', y: '55%', category: '수업' },
  { name: '진관홀', building: '8번', x: '42%', y: '46%', category: '시설' },
  { name: '영덕관', building: '9번', x: '46%', y: '49%', category: '시설' },
  { name: '학생생활관', building: '10번', x: '43%', y: '41%', category: '행정' },
  { name: '주차타워', building: '11번', x: '48%', y: '45%', category: '시설' },
  { name: '애지헌', building: '12번', x: '47%', y: '53%', category: '수업' },
  { name: '세종관', building: '13번', x: '50%', y: '71%', category: '수업' },
  { name: '학생회관', building: '14번', x: '71%', y: '50%', category: '학식' },
  { name: '홍우관', building: '15번', x: '78%', y: '37%', category: '수업' },
  { name: '박물관', building: '16번', x: '89%', y: '52%', category: '시설' },
  { name: '새날관', building: '17번', x: '87%', y: '65%', category: '시설' },
  { name: '영실관', building: '18번', x: '61%', y: '34%', category: '수업' },
  { name: '세종초등학교', building: '19번', x: '67%', y: '26%', category: '수업' },
  { name: '광개토초등학교', building: '21번', x: '79%', y: '34%', category: '수업' },
  { name: '주차빌딩', building: '22번', x: '83%', y: '39%', category: '시설' },
  { name: '다산관', building: '23번', x: '82%', y: '45%', category: '수업' },
  { name: '음악관', building: '24번', x: '67%', y: '42%', category: '수업' },
  { name: '우정당', building: '25번', x: '74%', y: '50%', category: '시설' },
  { name: '무방관', building: '26번', x: '66%', y: '16%', category: '시설' },
]

const similarCases: SimilarCase[] = [
  {
    title: '공학관 냉난방 반복 고장',
    category: '시설',
    matchRate: 94,
    solvedBy: '시설관리팀 + 구매팀',
    result: '노후 부품 일괄 교체 후 민원 78% 감소',
    days: 5,
  },
  {
    title: '점심 시간 식당 대기열 과밀',
    category: '학식',
    matchRate: 89,
    solvedBy: '학생지원과 + 식당운영사',
    result: '피크타임 배식 동선 분리 및 메뉴 사전 공지',
    days: 3,
  },
  {
    title: '강의실 배정 오류 반복',
    category: '수업',
    matchRate: 86,
    solvedBy: '교무과 + 학과 사무실',
    result: '수강 정정 기간 전 강의실 검증 체크리스트 적용',
    days: 6,
  },
  {
    title: '도서관 열람실 소음 신고',
    category: '도서관',
    matchRate: 81,
    solvedBy: '학술정보원',
    result: '좌석 구역 재분류와 상시 순찰 시간표 도입',
    days: 2,
  },
  {
    title: '야간 귀가 동선 조명 부족',
    category: '안전/보건',
    matchRate: 91,
    solvedBy: '안전관리센터 + 시설관리팀',
    result: '임시 조명 설치 후 정규 예산으로 보강',
    days: 1,
  },
]

const trendingComplaints = [
  { title: '학생회관 1층 누수', category: '시설', count: 42, pace: '+38%' },
  { title: '중식 메뉴 품절', category: '학식', count: 35, pace: '+24%' },
  { title: '16시 강의실 냉방 부족', category: '수업', count: 31, pace: '+17%' },
  { title: '본관 증명서 발급 지연', category: '행정', count: 18, pace: '+9%' },
]

const initialSensitiveAlerts: SensitiveAlert[] = [
  {
    id: 'safety-lab',
    title: '실험실 안전 장비 미작동 제보',
    category: '안전/보건',
    level: '긴급',
    score: 96,
    owner: '안전관리센터',
  },
  {
    id: 'personal-data',
    title: '개인정보 포함 행정 민원',
    category: '행정',
    level: '주의',
    score: 84,
    owner: '학사지원과',
  },
]

const initialRepeatedUsers = [
  { id: '2026***41', count: 11, category: '시설', action: '24시간 등록 제한 권고', limited: false },
  { id: '2025***08', count: 8, category: '학식', action: '유사 민원 병합 안내', limited: false },
  { id: '2024***73', count: 6, category: '행정', action: '관리자 검토 후 공개', limited: false },
]

const estimateByCategory: Record<string, { budget: string; people: string; roi: string }> = {
  시설: { budget: '1,860만원', people: '2,420명', roi: '3.2x' },
  수업: { budget: '680만원', people: '1,380명', roi: '2.6x' },
  학식: { budget: '540만원', people: '2,100명', roi: '2.9x' },
  도서관: { budget: '320만원', people: '980명', roi: '2.2x' },
  행정: { budget: '410만원', people: '1,240명', roi: '2.4x' },
  '안전/보건': { budget: '2,240만원', people: '3,100명', roi: '4.1x' },
  기타: { budget: '260만원', people: '520명', roi: '1.8x' },
}

const categoryDepartments: Record<CategoryName, string> = {
  시설: '시설관리팀',
  수업: '교무과',
  학식: '학생지원과',
  도서관: '학술정보원',
  행정: '학사지원과',
  '안전/보건': '안전관리센터',
  기타: '학사지원과',
}

const navItems: Array<{ id: AdminView; icon: typeof LayoutDashboard; label: string }> = [
  { id: 'overview', icon: LayoutDashboard, label: '민원 집계' },
  { id: 'analysis', icon: MapPin, label: '시간/위치 분석' },
  { id: 'departments', icon: Handshake, label: '부서 연결' },
  { id: 'ai', icon: Sparkles, label: 'AI 예측' },
  { id: 'reports', icon: FileBarChart, label: '통계 리포트' },
]

function getHeatColor(value: number) {
  if (value > 85) return 'bg-rose-500 text-white'
  if (value > 70) return 'bg-amber-500 text-white'
  if (value > 45) return 'bg-teal-600 text-white'
  return 'bg-slate-200 text-slate-600'
}

function getUrgencyClass(urgency: string) {
  if (urgency === 'CRITICAL') return 'bg-rose-600 text-white'
  if (urgency === 'HIGH') return 'bg-rose-100 text-rose-700'
  if (urgency === 'MEDIUM') return 'bg-amber-100 text-amber-800'
  return 'bg-slate-100 text-slate-600'
}

function getUrgencyLabel(urgency: string) {
  const labels: Record<string, string> = {
    LOW: '낮음',
    MEDIUM: '보통',
    HIGH: '높음',
    CRITICAL: '긴급',
  }

  return labels[urgency] ?? urgency
}

function getComplaintStatusLabel(status: ComplaintRecord['status']) {
  const labels: Record<string, string> = {
    received: '접수',
    in_progress: '처리 중',
    resolved: '처리 완료',
    rejected: '반려',
  }

  return labels[status] ?? status
}

function getComplaintDateLabel(complaint: ComplaintRecord) {
  const date = getComplaintDate(complaint)

  if (Number.isNaN(date.getTime())) return '접수 시각 미등록'

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function findDepartment(name: string) {
  return (
    departments.find((department) => department.name === name) ?? {
      name,
      phone: '연락처 미등록',
      duties: 'AI 추천 담당 부서입니다. 내부 연락처를 확인한 뒤 담당자를 배정하세요.',
      queue: '관리자 확인 필요',
    }
  )
}

function normalizeCategory(category: string | null | undefined): CategoryName {
  const value = category?.trim().toLowerCase() ?? ''

  if (value.includes('시설') || value.includes('청소') || value.includes('환경')) return '시설'
  if (value.includes('수업') || value.includes('강의') || value.includes('교무')) return '수업'
  if (value.includes('학식') || value.includes('식당') || value.includes('복지')) return '학식'
  if (value.includes('도서') || value.includes('열람')) return '도서관'
  if (value.includes('안전') || value.includes('보안') || value.includes('폭력')) return '안전/보건'
  if (value.includes('행정') || value.includes('학사') || value.includes('증명') || value.includes('입학')) return '행정'

  return '기타'
}

function getComplaintDate(complaint: ComplaintRecord) {
  const date = new Date(complaint.occurred_at || complaint.created_at)
  return Number.isNaN(date.getTime()) ? new Date(complaint.created_at) : date
}

function isInSemester(complaint: ComplaintRecord, semester: SemesterFilter) {
  if (semester === '전체 기간') return true

  const date = getComplaintDate(complaint)
  if (Number.isNaN(date.getTime())) return false

  const year = date.getFullYear()
  const month = date.getMonth()

  return semester === '2026-1학기'
    ? year === 2026 && month >= 2 && month <= 7
    : (year === 2026 && month >= 8) || (year === 2027 && month <= 1)
}

function parseExpectedDays(value: string | null) {
  if (!value) return null
  if (value.includes('즉시')) return 0.5

  const numeric = Number.parseFloat(value.replace(/[^0-9.]/g, ''))
  if (Number.isNaN(numeric)) return null
  return value.includes('주') ? numeric * 7 : numeric
}

function buildCategoryMetrics(records: ComplaintRecord[]) {
  const now = Date.now()
  const currentStart = now - 7 * 24 * 60 * 60 * 1000
  const previousStart = now - 14 * 24 * 60 * 60 * 1000
  const total = records.length

  return categories.map((base) => {
    const categoryRecords = records.filter((record) => normalizeCategory(record.ai_category) === base.name)
    const currentCount = categoryRecords.filter((record) => getComplaintDate(record).getTime() >= currentStart).length
    const previousCount = categoryRecords.filter((record) => {
      const timestamp = getComplaintDate(record).getTime()
      return timestamp >= previousStart && timestamp < currentStart
    }).length
    const expectedDays = categoryRecords
      .map((record) => parseExpectedDays(record.ai_expected_days))
      .filter((value): value is number => value !== null)
    const urgent = categoryRecords.filter((record) => ['HIGH', 'CRITICAL'].includes(record.ai_urgency ?? '')).length

    return {
      ...base,
      count: categoryRecords.length,
      share: total ? Math.round((categoryRecords.length / total) * 100) : 0,
      delta: previousCount ? Math.round(((currentCount - previousCount) / previousCount) * 100) : currentCount ? 100 : 0,
      averageDays: expectedDays.length
        ? Math.round((expectedDays.reduce((sum, days) => sum + days, 0) / expectedDays.length) * 10) / 10
        : 0,
      urgent,
    }
  })
}

function buildTimeMetrics(records: ComplaintRecord[]) {
  return timeSlots.map((slot) => {
    const hour = Number.parseInt(slot.label, 10)
    return {
      label: slot.label,
      value: records.filter((record) => getComplaintDate(record).getHours() === hour).length,
    }
  })
}

function buildWeeklyDensity(records: ComplaintRecord[]) {
  return dayLabels.map((_, rowIndex) =>
    timeSlots.map((slot) => {
      const hour = Number.parseInt(slot.label, 10)
      return records.filter((record) => {
        const date = getComplaintDate(record)
        const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1
        return dayIndex === rowIndex && date.getHours() === hour
      }).length
    }),
  )
}

function buildHotspotMetrics(records: ComplaintRecord[]) {
  return campusBuildings.map((spot) => {
    const matching = records.filter((record) => record.location.includes(spot.name))
    const categoryCounts = new Map<CategoryName, number>()
    matching.forEach((record) => {
      const category = normalizeCategory(record.ai_category)
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1)
    })
    const dominantCategory = [...categoryCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0]

    return { ...spot, count: matching.length, category: dominantCategory ?? spot.category }
  }).filter((spot) => spot.count > 0)
}

function buildTrendingComplaints(records: ComplaintRecord[]) {
  const grouped = new Map<string, { title: string; category: CategoryName; count: number }>()

  records.forEach((record) => {
    const title = record.ai_summary?.trim() || record.title
    const key = title.toLowerCase()
    const current = grouped.get(key)
    grouped.set(key, {
      title,
      category: normalizeCategory(record.ai_category),
      count: (current?.count ?? 0) + 1,
    })
  })

  return [...grouped.values()]
    .sort((left, right) => right.count - left.count)
    .slice(0, 4)
    .map((item) => ({ ...item, pace: 'AI 분류' }))
}

function HomePage() {
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState<AdminView>('overview')
  const [semesterFilter, setSemesterFilter] = useState<SemesterFilter>('2026-1학기')
  const [campusFilter, setCampusFilter] = useState('전체 캠퍼스')
  const [selectedCategory, setSelectedCategory] = useState<CategoryName>('시설')
  const [analysisCategory, setAnalysisCategory] = useState<'전체' | CategoryName>('전체')
  const [selectedHotspot, setSelectedHotspot] = useState(campusBuildings[0])
  const [selectedDepartmentName, setSelectedDepartmentName] = useState('학사지원과')
  const [workflowSubject, setWorkflowSubject] = useState('본관 증명서 발급 지연 개선')
  const [workflow, setWorkflow] = useState<WorkflowDraft | null>(null)
  const [analysisText, setAnalysisText] = useState(
    '학생회관 1층 천장에서 물이 새고 바닥이 미끄럽습니다. 점심 시간 학생 통행이 많아 안전 조치가 필요합니다.',
  )
  const [analysisResult, setAnalysisResult] = useState<ComplaintAnalysis | null>(null)
  const [analysisError, setAnalysisError] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [complaints, setComplaints] = useState<ComplaintRecord[]>([])
  const [categoryMetrics, setCategoryMetrics] = useState(categories)
  const [timeMetrics, setTimeMetrics] = useState(timeSlots)
  const [densityMetrics, setDensityMetrics] = useState(weeklyDensity)
  const [hotspotMetrics, setHotspotMetrics] = useState<Array<CampusBuilding & { count: number }>>([])
  const [trendingMetrics, setTrendingMetrics] = useState(trendingComplaints)
  const [analyticsStatus, setAnalyticsStatus] = useState<'loading' | 'live' | 'fallback'>('loading')
  const [analyticsError, setAnalyticsError] = useState('')
  const [isReclassifying, setIsReclassifying] = useState(false)
  const [reclassificationMessage, setReclassificationMessage] = useState('')
  const [sensitiveAlerts, setSensitiveAlerts] = useState(initialSensitiveAlerts)
  const [repeatedUsers, setRepeatedUsers] = useState(initialRepeatedUsers)
  const [reportPeriod, setReportPeriod] = useState<'2026-1학기' | '연말'>('2026-1학기')
  const [reportGenerated, setReportGenerated] = useState(false)

  const campusOptions = useMemo(
    () => ['전체 캠퍼스', ...new Set(complaints.map((complaint) => complaint.location?.trim()).filter(Boolean))],
    [complaints],
  )
  const filteredComplaints = useMemo(
    () =>
      complaints.filter(
        (complaint) =>
          isInSemester(complaint, semesterFilter) &&
          (campusFilter === '전체 캠퍼스' || complaint.location?.trim() === campusFilter),
      ),
    [campusFilter, complaints, semesterFilter],
  )
  const filteredCategoryMetrics = useMemo(
    () => (analyticsStatus === 'live' ? buildCategoryMetrics(filteredComplaints) : categoryMetrics),
    [analyticsStatus, categoryMetrics, filteredComplaints],
  )
  const filteredTimeMetrics = useMemo(
    () => (analyticsStatus === 'live' ? buildTimeMetrics(filteredComplaints) : timeMetrics),
    [analyticsStatus, filteredComplaints, timeMetrics],
  )
  const filteredDensityMetrics = useMemo(
    () => (analyticsStatus === 'live' ? buildWeeklyDensity(filteredComplaints) : densityMetrics),
    [analyticsStatus, densityMetrics, filteredComplaints],
  )
  const filteredHotspotMetrics = useMemo(
    () => (analyticsStatus === 'live' ? buildHotspotMetrics(filteredComplaints) : hotspotMetrics),
    [analyticsStatus, filteredComplaints, hotspotMetrics],
  )
  const filteredTrendingMetrics = useMemo(() => {
    if (analyticsStatus !== 'live') return trendingMetrics
    const nextTrending = buildTrendingComplaints(filteredComplaints)
    return nextTrending.length ? nextTrending : []
  }, [analyticsStatus, filteredComplaints, trendingMetrics])

  const selected = useMemo(
    () => filteredCategoryMetrics.find((category) => category.name === selectedCategory) ?? filteredCategoryMetrics[0],
    [filteredCategoryMetrics, selectedCategory],
  )
  const totalComplaints = filteredCategoryMetrics.reduce((sum, category) => sum + category.count, 0)
  const urgentTotal = filteredCategoryMetrics.reduce((sum, category) => sum + category.urgent, 0)
  const selectedComplaints = useMemo(
    () =>
      filteredComplaints
        .filter((complaint) => normalizeCategory(complaint.ai_category) === selectedCategory)
        .sort((left, right) => getComplaintDate(right).getTime() - getComplaintDate(left).getTime()),
    [filteredComplaints, selectedCategory],
  )
  const selectedSimilarCases = useMemo(
    () =>
      similarCases
        .filter((caseItem) => caseItem.category === selectedCategory)
        .concat(similarCases.filter((caseItem) => caseItem.category !== selectedCategory))
        .slice(0, 3),
    [selectedCategory],
  )
  const visibleHotspots = useMemo(
    () =>
      analysisCategory === '전체'
        ? filteredHotspotMetrics
        : filteredHotspotMetrics.filter((spot) => spot.category === analysisCategory),
    [analysisCategory, filteredHotspotMetrics],
  )
  const activeHotspot = useMemo(
    () => visibleHotspots.find((spot) => spot.name === selectedHotspot.name) ?? visibleHotspots[0] ?? null,
    [selectedHotspot.name, visibleHotspots],
  )
  const selectedDepartment = findDepartment(selectedDepartmentName)
  const aiCategory = analysisResult?.category ?? selectedCategory
  const aiEstimate = estimateByCategory[aiCategory] ?? estimateByCategory.행정
  const analysisNeedsNotification =
    analysisResult?.sensitive || analysisResult?.urgency === 'HIGH' || analysisResult?.urgency === 'CRITICAL'
  const unclassifiedComplaints = filteredComplaints.filter((complaint) => !complaint.ai_category)

  function applyComplaintMetrics(records: ComplaintRecord[]) {
    const nextCategoryMetrics = buildCategoryMetrics(records)
    const nextHotspots = buildHotspotMetrics(records)
    const nextTrending = buildTrendingComplaints(records)

    setComplaints(records)
    setCategoryMetrics(nextCategoryMetrics)
    setTimeMetrics(buildTimeMetrics(records))
    setDensityMetrics(buildWeeklyDensity(records))
    setHotspotMetrics(nextHotspots)
    setTrendingMetrics(nextTrending.length ? nextTrending : trendingComplaints)
    setSelectedHotspot((current) => nextHotspots.find((spot) => spot.name === current.name) ?? nextHotspots[0])
  }

  async function loadAnalytics() {
    setAnalyticsStatus('loading')
    setAnalyticsError('')

    try {
      const records = await listComplaints()
      applyComplaintMetrics(records)
      setAnalyticsStatus('live')
    } catch {
      setAnalyticsStatus('fallback')
      setAnalyticsError('실제 민원 데이터를 불러오지 못해 마지막 데모 집계를 표시하고 있습니다.')
    }
  }

  useEffect(() => {
    void loadAnalytics()
  }, [])

  function handleLogout() {
    clearAccessToken()
    navigate('/login', { replace: true })
  }

  function createWorkflow(departmentName = selectedDepartmentName, title = workflowSubject) {
    const department = findDepartment(departmentName)
    const urgent = analysisResult?.urgency === 'CRITICAL' || analysisResult?.urgency === 'HIGH'

    setWorkflow({
      title: title.trim() || '신규 민원 처리',
      department,
      items: [
        { id: 1, owner: '관리자', task: 'AI 분류와 민감도 검토', due: '즉시', status: '완료' },
        { id: 2, owner: department.name, task: '민원 접수 및 담당자 배정', due: urgent ? '30분 이내' : '당일', status: '진행 중' },
        { id: 3, owner: '유관 부서', task: '현장·사실 확인 및 영향도 산정', due: urgent ? '2시간 이내' : '1영업일', status: '대기' },
        { id: 4, owner: department.name, task: '조치안 확정 및 예산 협의', due: '2영업일', status: '대기' },
        { id: 5, owner: '관리자', task: '처리 결과 확인 및 민원인 안내', due: '완료 후', status: '대기' },
      ],
    })
    if (departments.some((item) => item.name === department.name)) {
      setSelectedDepartmentName(department.name)
    }
    setActiveView('departments')
  }

  function advanceWorkflowItem(itemId: number) {
    setWorkflow((current) => {
      if (!current) return current

      return {
        ...current,
        items: current.items.map((item) => {
          if (item.id !== itemId) return item
          const nextStatus: Record<WorkflowStatus, WorkflowStatus> = {
            대기: '진행 중',
            '진행 중': '완료',
            완료: '대기',
          }
          return { ...item, status: nextStatus[item.status] }
        }),
      }
    })
  }

  async function handleAnalyze() {
    if (analysisText.trim().length < 5) {
      setAnalysisError('민원 내용을 5자 이상 입력해 주세요.')
      return
    }

    setAnalysisError('')
    setIsAnalyzing(true)

    try {
      const result = await analyzeComplaint(analysisText.trim())
      setAnalysisResult(result)
      setWorkflowSubject(result.summary)
      if (departments.some((department) => department.name === result.department)) {
        setSelectedDepartmentName(result.department)
      }

      if (result.sensitive || result.urgency === 'HIGH' || result.urgency === 'CRITICAL') {
        setSensitiveAlerts((current) => [
          {
            id: `ai-${Date.now()}`,
            title: result.summary,
            category: result.category,
            level: getUrgencyLabel(result.urgency),
            score: result.urgency === 'CRITICAL' ? 96 : result.urgency === 'HIGH' ? 88 : 78,
            owner: result.department,
          },
          ...current.filter((alert) => alert.title !== result.summary),
        ])
      }
    } catch {
      setAnalysisError('AI 분석 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  async function reclassifyUnclassifiedComplaints() {
    const targets = unclassifiedComplaints.slice(0, 20)

    if (!targets.length) {
      setReclassificationMessage('AI 분류가 필요한 민원이 없습니다.')
      return
    }

    setIsReclassifying(true)
    setReclassificationMessage('미분류 민원을 AI로 분류하고 있습니다.')
    let updatedRecords = [...complaints]
    let updatedCount = 0

    for (const complaint of targets) {
      try {
        const result = await analyzeComplaint(complaint.content)
        const savedAnalysis = {
          category: result.category,
          subcategory: result.subcategory,
          sentiment: result.sentiment,
          urgency: result.urgency,
          sensitive: result.sensitive,
          risk_type: result.risk_type,
          department: result.department,
          summary: result.summary,
          keywords: result.keywords,
          expected_days: result.expected_days,
          recommended_action: result.recommended_action,
        }

        try {
          await saveComplaintAnalysis(complaint.id, savedAnalysis)
        } catch {
          // The required admin save API may not be deployed yet; retain the result in this session.
        }

        updatedRecords = updatedRecords.map((record) =>
          record.id === complaint.id
            ? {
                ...record,
                ai_category: result.category,
                ai_subcategory: result.subcategory,
                ai_sentiment: result.sentiment,
                ai_urgency: result.urgency,
                ai_sensitive: result.sensitive,
                ai_risk_type: result.risk_type,
                ai_department: result.department,
                ai_summary: result.summary,
                ai_keywords: result.keywords,
                ai_expected_days: result.expected_days,
                ai_recommended_action: result.recommended_action,
              }
            : record,
        )
        updatedCount += 1
      } catch {
        continue
      }
    }

    applyComplaintMetrics(updatedRecords)
    setIsReclassifying(false)
    setReclassificationMessage(
      updatedCount
        ? `${updatedCount}건의 AI 분류 결과를 통계에 반영했습니다.`
        : 'AI 분류에 실패했습니다. API 상태를 확인해 주세요.',
    )
  }

  function applyRepeatLimit(userId: string) {
    setRepeatedUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? { ...user, limited: true, action: '24시간 등록 제한 적용됨' }
          : user,
      ),
    )
  }

  function downloadReport() {
    const rows = [
      ['리포트', `${reportPeriod} 민원 운영 리포트`],
      ['총 민원', String(totalComplaints)],
      ['긴급 민원', String(urgentTotal)],
      [],
      ['카테고리', '접수 건수', '비중', '평균 처리일', '긴급 건수'],
      ...filteredCategoryMetrics.map((category) => [
        category.name,
        String(category.count),
        `${category.share}%`,
        `${category.averageDays}일`,
        String(category.urgent),
      ]),
    ]
    const csv = `\uFEFF${rows.map((row) => row.join(',')).join('\n')}`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `campus-complaints-${reportPeriod}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const overviewView = (
    <div className="grid min-w-0 gap-5">
      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-teal-700">전체 접수 현황</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight">카테고리별 민원 집계</h2>
              <p className="mt-1 text-sm text-slate-500">
                총 {totalComplaints.toLocaleString()}건을 범주화하고 우선 처리 영역을 계산했습니다.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveView('analysis')}>
              <SlidersHorizontal aria-hidden="true" />
              분석 보기
            </Button>
          </div>

          <div className={cn('mt-4 flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between', analyticsStatus === 'live' ? 'border-teal-200 bg-teal-50' : analyticsStatus === 'loading' ? 'border-slate-200 bg-slate-50' : 'border-amber-200 bg-amber-50')}>
            <div>
              <p className={cn('text-sm font-bold', analyticsStatus === 'live' ? 'text-teal-800' : 'text-slate-700')}>
                {analyticsStatus === 'live' ? `선택 조건의 실제 민원 ${filteredComplaints.length}건을 AI 분류 기준으로 집계 중` : analyticsStatus === 'loading' ? '실제 민원 데이터를 불러오는 중' : '데모 집계 표시 중'}
              </p>
              <p className="mt-1 text-xs text-slate-600">{analyticsError || `미분류 민원 ${unclassifiedComplaints.length}건은 AI 분류 후 통계에 반영할 수 있습니다.`}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" disabled={analyticsStatus === 'loading'} onClick={() => void loadAnalytics()}><RefreshCw className={cn(analyticsStatus === 'loading' && 'animate-spin')} aria-hidden="true" />새로고침</Button>
              <Button size="sm" disabled={isReclassifying || !unclassifiedComplaints.length} onClick={() => void reclassifyUnclassifiedComplaints()}><Sparkles className={cn(isReclassifying && 'animate-spin')} aria-hidden="true" />{isReclassifying ? 'AI 분류 중...' : `미분류 ${unclassifiedComplaints.length}건 분류`}</Button>
            </div>
          </div>
          {reclassificationMessage ? <p className="mt-3 text-sm font-semibold text-teal-700">{reclassificationMessage}</p> : null}

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredCategoryMetrics.map((category) => {
              const isSelected = category.name === selectedCategory

              return (
                <button
                  key={category.name}
                  className={cn(
                    'rounded-lg border p-4 text-left transition',
                    isSelected
                      ? `border-slate-900 bg-slate-50 ring-2 ${category.ringColor}`
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
                  )}
                  type="button"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={cn('inline-flex h-7 items-center rounded-md px-2.5 text-xs font-bold', category.softColor)}>
                      {category.name}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {category.delta > 0 ? '+' : ''}
                      {category.delta}% 전주 대비
                    </span>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-3xl font-black tracking-tight">{category.count}</p>
                      <p className="mt-1 text-xs font-medium text-slate-500">전체의 {category.share}%</p>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p className="font-bold text-rose-600">긴급 {category.urgent}건</p>
                      <p>평균 {category.averageDays}일</p>
                    </div>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={cn('h-full rounded-full', category.color)} style={{ width: `${category.share * 2.6}%` }} />
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="min-w-0 rounded-lg border border-slate-200 bg-slate-950 p-5 text-white">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-teal-200">선택 카테고리</p>
              <h2 className="mt-1 text-2xl font-black">{selected.name}</h2>
            </div>
            <span className="grid size-11 place-items-center rounded-lg bg-white/10">
              <Activity className="size-5 text-teal-200" aria-hidden="true" />
            </span>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-white/8 p-3">
              <dt className="text-xs text-slate-300">예상 처리 기간</dt>
              <dd className="mt-1 text-2xl font-black">{selected.averageDays}일</dd>
            </div>
            <div className="rounded-lg bg-white/8 p-3">
              <dt className="text-xs text-slate-300">예측 신뢰도</dt>
              <dd className="mt-1 text-2xl font-black">87%</dd>
            </div>
            <div className="rounded-lg bg-white/8 p-3">
              <dt className="text-xs text-slate-300">권장 담당</dt>
              <dd className="mt-1 text-sm font-bold">{selected.department}</dd>
            </div>
            <div className="rounded-lg bg-white/8 p-3">
              <dt className="text-xs text-slate-300">민감 민원</dt>
              <dd className="mt-1 text-sm font-bold text-rose-200">{selected.urgent}건</dd>
            </div>
          </dl>
          <Button
            className="mt-5 w-full bg-white text-slate-950 hover:bg-slate-100"
            size="sm"
            onClick={() => createWorkflow(categoryDepartments[selected.name], `${selected.name} 민원 우선 처리`)}
          >
            <Workflow aria-hidden="true" />
            담당 부서 워크플로우 생성
          </Button>

          <div className="mt-5 border-t border-white/10 pt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-white">실제 접수 민원</p>
                <p className="mt-1 text-xs text-slate-300">
                  {analyticsStatus === 'live'
                    ? `${selectedComplaints.length}건의 원문 내용`
                    : '민원 API 연결 후 원문이 표시됩니다.'}
                </p>
              </div>
              <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-black text-teal-100">
                {selectedComplaints.length}건
              </span>
            </div>

            {analyticsStatus === 'live' && selectedComplaints.length ? (
              <ul className="mt-3 grid max-h-[420px] gap-2 overflow-y-auto pr-1">
                {selectedComplaints.map((complaint) => (
                  <li key={complaint.id} className="rounded-lg bg-white/8 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 text-sm font-black text-white">{complaint.title}</p>
                      <span className={cn('shrink-0 rounded-md px-2 py-1 text-[11px] font-bold', getUrgencyClass(complaint.ai_urgency ?? 'LOW'))}>
                        {getUrgencyLabel(complaint.ai_urgency ?? 'LOW')}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-slate-200">{complaint.content}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-300">
                      <span>{getComplaintStatusLabel(complaint.status)}</span>
                      {complaint.location ? <span>{complaint.location}</span> : null}
                      <span>{getComplaintDateLabel(complaint)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-3 rounded-lg border border-dashed border-white/20 bg-white/5 px-3 py-5 text-center">
                <p className="text-sm font-bold text-slate-200">
                  {analyticsStatus === 'live' ? `${selected.name} 카테고리의 민원이 없습니다.` : '실제 민원 내용을 불러오는 중입니다.'}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {analyticsStatus === 'live'
                    ? '다른 카테고리를 선택하거나 AI 분류를 실행해 보세요.'
                    : '새로고침 후에도 표시되지 않으면 민원 조회 API를 확인해 주세요.'}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-500">과거 데이터 탐색</p>
              <h2 className="mt-1 text-lg font-black">유사 민원 해결 사례 및 예측</h2>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveView('ai')}>
              <Bot aria-hidden="true" />
              AI 분석
            </Button>
          </div>
          <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">유사 사례</th>
                  <th className="px-4 py-3">매칭</th>
                  <th className="px-4 py-3">처리 부서</th>
                  <th className="px-4 py-3">해결 결과</th>
                  <th className="px-4 py-3">기간</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedSimilarCases.map((caseItem) => (
                  <tr key={caseItem.title}>
                    <td className="px-4 py-3 font-semibold text-slate-900">{caseItem.title}</td>
                    <td className="px-4 py-3"><span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-bold text-teal-700">{caseItem.matchRate}%</span></td>
                    <td className="px-4 py-3 text-slate-600">{caseItem.solvedBy}</td>
                    <td className="px-4 py-3 text-slate-600">{caseItem.result}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{caseItem.days}일</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="grid content-start gap-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">실시간 급증</p>
                <h2 className="mt-1 text-lg font-black">많이 들어오는 민원</h2>
              </div>
              <Megaphone className="size-5 text-slate-400" aria-hidden="true" />
            </div>
            <ul className="mt-4 grid gap-3">
              {filteredTrendingMetrics.map((item, index) => (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-md bg-slate-100 text-xs font-black text-slate-600">{index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.category} · {item.count}건 · <span className="font-bold text-rose-600">{item.pace}</span></p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-rose-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-rose-600">민감 민원 분류</p>
                <h2 className="mt-1 text-lg font-black">관리자 직접 통보</h2>
              </div>
              <ShieldAlert className="size-5 text-rose-500" aria-hidden="true" />
            </div>
            <ul className="mt-4 grid gap-3">
              {sensitiveAlerts.slice(0, 3).map((alert) => (
                <li key={alert.id} className="rounded-lg bg-rose-50 p-3">
                  <div className="flex items-start gap-3">
                    <MessageSquareWarning className="mt-0.5 size-4 shrink-0 text-rose-600" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-rose-950">{alert.title}</p>
                      <p className="mt-1 text-xs leading-5 text-rose-700">{alert.category} · 긴급도 {alert.score} · {alert.owner}</p>
                    </div>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-black text-rose-700">{alert.level}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">반복 등록 제한</p>
                <h2 className="mt-1 text-lg font-black">도배 방지 큐</h2>
              </div>
              <BadgeAlert className="size-5 text-slate-400" aria-hidden="true" />
            </div>
            <ul className="mt-4 grid gap-3">
              {repeatedUsers.map((user) => (
                <li key={user.id} className="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-900">{user.id}</p>
                      <p className="mt-1 text-xs text-slate-500">{user.category} · {user.count}회 반복</p>
                    </div>
                    <button
                      className={cn(
                        'rounded-md px-2.5 py-1.5 text-xs font-bold',
                        user.limited
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100',
                      )}
                      type="button"
                      disabled={user.limited}
                      onClick={() => applyRepeatLimit(user.id)}
                    >
                      {user.limited ? '제한 적용됨' : '24시간 제한'}
                    </button>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-600">{user.action}</p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  )

  const analysisView = (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-teal-700">반복 민원 감지</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">시간·위치 분석</h2>
            <p className="mt-1 text-sm text-slate-500">반복 발생 구간과 건물별 접수 밀도를 함께 확인합니다.</p>
          </div>
          <label className="grid gap-1 text-xs font-bold text-slate-500">
            카테고리 필터
            <select
              className="h-10 min-w-40 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:border-teal-600"
              value={analysisCategory}
              onChange={(event) => setAnalysisCategory(event.target.value as '전체' | CategoryName)}
            >
              <option value="전체">전체 카테고리</option>
              {filteredCategoryMetrics.map((category) => <option key={category.name} value={category.name}>{category.name}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-6 grid gap-5">
          <section className="min-w-0 rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">요일·시간대 밀도</p>
                <p className="mt-1 text-xs text-slate-500">진한 셀일수록 같은 시간대의 반복 접수가 많습니다.</p>
              </div>
              <AlarmClock className="size-5 text-slate-400" aria-hidden="true" />
            </div>
            <div className="mt-5 overflow-x-auto">
              <div className="grid min-w-[620px] grid-cols-[48px_repeat(7,minmax(0,1fr))] gap-2">
                <span />
                {filteredTimeMetrics.map((slot) => <p key={slot.label} className="text-center text-xs font-bold text-slate-500">{slot.label}</p>)}
                {filteredDensityMetrics.map((row, rowIndex) => (
                  <div key={dayLabels[rowIndex]} className="contents">
                    <p className="grid place-items-center text-xs font-bold text-slate-500">{dayLabels[rowIndex]}</p>
                    {row.map((value, valueIndex) => (
                      <div key={`${dayLabels[rowIndex]}-${filteredTimeMetrics[valueIndex].label}`} className={cn('grid aspect-square place-items-center rounded-md text-xs font-black', getHeatColor(value))}>{value}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-rose-50 p-3"><p className="text-xs font-bold text-rose-700">최다 시간대</p><p className="mt-1 text-lg font-black text-rose-950">수요일 16시</p></div>
              <div className="rounded-md bg-amber-50 p-3"><p className="text-xs font-bold text-amber-800">반복 패턴</p><p className="mt-1 text-lg font-black text-amber-950">점심 전후</p></div>
              <div className="rounded-md bg-teal-50 p-3"><p className="text-xs font-bold text-teal-700">권장 조치</p><p className="mt-1 text-lg font-black text-teal-950">순찰 인력 증원</p></div>
            </div>
          </section>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-slate-500">캠퍼스 맵</p><h2 className="mt-1 text-lg font-black">건물별 민원 핫스팟</h2></div><MapPin className="size-5 text-slate-400" aria-hidden="true" /></div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
          <section className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white">
            <p className="text-sm font-semibold text-teal-200">선택 핫스팟</p>
            {activeHotspot ? (
              <>
                <h3 className="mt-1 text-2xl font-black">{activeHotspot.name} <span className="text-slate-400">{activeHotspot.building}</span></h3>
                <dl className="mt-6 grid gap-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3"><dt className="text-sm text-slate-300">최근 7일 접수</dt><dd className="text-xl font-black">{activeHotspot.count}건</dd></div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-3"><dt className="text-sm text-slate-300">주요 분류</dt><dd className="font-bold">{activeHotspot.category}</dd></div>
                  <div className="flex items-center justify-between"><dt className="text-sm text-slate-300">피크 시간</dt><dd className="font-bold">16:00 - 17:00</dd></div>
                </dl>
                <Button className="mt-6 w-full bg-white text-slate-950 hover:bg-slate-100" size="sm" onClick={() => createWorkflow(categoryDepartments[activeHotspot.category], `${activeHotspot.name} 반복 민원 조치`)}>
                  <Route aria-hidden="true" />
                  현장 조치 워크플로우
                </Button>
              </>
            ) : (
              <p className="mt-4 text-sm leading-6 text-slate-300">현재 필터에서 민원이 1건 이상 접수된 건물이 없습니다.</p>
            )}
          </section>

          <div className="min-w-0">
            <div className="relative aspect-[527/458] overflow-hidden rounded-lg border border-slate-200 bg-[#edf3ea]">
              <img src="/campus-map.png" alt="캠퍼스 건물 배치도와 민원 핫스팟" className="absolute inset-0 size-full object-contain" />
              {visibleHotspots.map((spot) => {
                const isActive = activeHotspot?.name === spot.name
                return (
                  <button
                    key={spot.name}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: spot.x, top: spot.y }}
                    type="button"
                    aria-label={`${spot.name} ${spot.building}, 민원 ${spot.count}건 선택`}
                    aria-pressed={isActive}
                    onClick={() => setSelectedHotspot(spot)}
                  >
                    {isActive ? <span className="absolute inset-0 size-10 animate-ping rounded-full bg-rose-500/30" /> : null}
                    <span className={cn('relative grid size-9 place-items-center rounded-full border-2 border-white text-xs font-black text-white shadow-lg', isActive ? 'bg-rose-600 shadow-rose-700/30' : 'bg-slate-900/85')}>
                      {spot.count}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {visibleHotspots.map((spot) => <button key={spot.name} type="button" onClick={() => setSelectedHotspot(spot)} className={cn('rounded-md border px-3 py-2 text-xs font-bold', activeHotspot?.name === spot.name ? 'border-teal-700 bg-teal-50 text-teal-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}>{spot.name} {spot.count}건</button>)}
            </div>
          </div>
        </div>
      </section>
    </div>
  )

  const departmentsView = (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div><p className="text-sm font-semibold text-teal-700">담당 부서 연결</p><h2 className="mt-1 text-2xl font-black tracking-tight">부서 디렉터리와 처리 워크플로우</h2><p className="mt-1 text-sm text-slate-500">민원 분류 결과를 바탕으로 담당 부서 연결과 후속 작업을 생성합니다.</p></div>
          <Button variant="outline" size="sm" onClick={() => setActiveView('ai')}><Bot aria-hidden="true" />AI로 부서 추천</Button>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((department) => {
            const isSelected = selectedDepartmentName === department.name
            return (
              <button key={department.name} type="button" onClick={() => setSelectedDepartmentName(department.name)} className={cn('rounded-lg border p-4 text-left transition', isSelected ? 'border-teal-700 bg-teal-50 ring-2 ring-teal-100' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50')}>
                <div className="flex items-start justify-between gap-3"><div><p className="text-base font-black text-slate-950">{department.name}</p><p className="mt-1 text-xs font-bold text-teal-700">{department.queue}</p></div><Phone className="size-4 text-slate-400" aria-hidden="true" /></div>
                <p className="mt-3 text-sm font-semibold text-slate-700">{department.phone}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{department.duties}</p>
              </button>
            )
          })}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2"><Workflow className="size-5 text-teal-700" aria-hidden="true" /><div><p className="text-sm font-semibold text-slate-500">워크플로우 생성</p><h2 className="mt-1 text-lg font-black">담당 부서 작업 요청</h2></div></div>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-bold text-slate-700">담당 부서<select className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-teal-600" value={selectedDepartmentName} onChange={(event) => setSelectedDepartmentName(event.target.value)}>{departments.map((department) => <option key={department.name} value={department.name}>{department.name}</option>)}</select></label>
            <div className="rounded-md bg-slate-50 p-3"><p className="text-xs font-bold text-slate-500">연락처</p><a className="mt-1 inline-flex items-center gap-2 text-sm font-black text-teal-700 hover:underline" href={`tel:${selectedDepartment.phone.replace(/[^0-9]/g, '')}`}><Phone className="size-4" aria-hidden="true" />{selectedDepartment.phone}</a><p className="mt-2 text-xs leading-5 text-slate-500">{selectedDepartment.duties}</p></div>
            <label className="grid gap-2 text-sm font-bold text-slate-700">민원 제목<input className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium outline-none focus:border-teal-600" value={workflowSubject} onChange={(event) => setWorkflowSubject(event.target.value)} /></label>
            <Button onClick={() => createWorkflow()}><Plus aria-hidden="true" />워크플로우 생성</Button>
          </div>
        </section>

        <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-slate-500">처리 현황</p><h2 className="mt-1 text-lg font-black">{workflow ? workflow.title : '생성된 워크플로우가 없습니다'}</h2></div>{workflow ? <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">{workflow.department.name}</span> : null}</div>
          {workflow ? (
            <ol className="mt-6 grid gap-3">
              {workflow.items.map((item, index) => (
                <li key={item.id} className="grid gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-[32px_minmax(0,1fr)_auto] sm:items-center">
                  <span className={cn('grid size-8 place-items-center rounded-full text-xs font-black', item.status === '완료' ? 'bg-teal-700 text-white' : item.status === '진행 중' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500')}>{item.status === '완료' ? <CheckCircle2 className="size-4" aria-hidden="true" /> : index + 1}</span>
                  <div><p className="text-sm font-black text-slate-900">{item.task}</p><p className="mt-1 text-xs text-slate-500">{item.owner} · {item.due}</p></div>
                  <button type="button" className={cn('rounded-md px-2.5 py-1.5 text-xs font-bold', item.status === '완료' ? 'bg-slate-100 text-slate-600' : 'bg-teal-50 text-teal-700 hover:bg-teal-100')} onClick={() => advanceWorkflowItem(item.id)}>{item.status === '완료' ? '다시 열기' : item.status === '진행 중' ? '완료 처리' : '시작'}</button>
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-6 grid min-h-56 place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center"><div><Workflow className="mx-auto size-7 text-slate-400" aria-hidden="true" /><p className="mt-3 text-sm font-bold text-slate-700">부서를 선택해 첫 작업을 생성하세요.</p><p className="mt-1 text-xs text-slate-500">AI 결과를 가져오면 추천 부서와 긴급도가 자동 반영됩니다.</p></div></div>
          )}
        </section>
      </div>
    </div>
  )

  const aiView = (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-semibold text-teal-700">Swagger 연결: POST /openai/analyze</p><h2 className="mt-1 text-2xl font-black tracking-tight">AI 민원 분석과 처리 예측</h2><p className="mt-1 text-sm text-slate-500">분류, 민감도, 긴급도, 담당 부서, 예상 처리 기간을 실제 분석 API에서 받습니다.</p></div><Bot className="size-8 text-teal-700" aria-hidden="true" /></div>
        <label className="mt-6 grid gap-2 text-sm font-bold text-slate-700">분석할 민원 내용<textarea className="min-h-40 resize-y rounded-lg border border-slate-200 p-3 text-sm leading-6 font-medium outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15" value={analysisText} onChange={(event) => setAnalysisText(event.target.value)} /></label>
        {analysisError ? <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{analysisError}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2"><Button disabled={isAnalyzing} onClick={handleAnalyze}>{isAnalyzing ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Sparkles aria-hidden="true" />}{isAnalyzing ? 'AI 분석 중...' : 'AI 분석 실행'}</Button><Button variant="outline" size="sm" onClick={() => setAnalysisText('강의실 프로젝터가 반복해서 꺼져 수업 진행이 어렵습니다. 다음 수업 전 점검과 교체가 필요합니다.')}><RefreshCw aria-hidden="true" />예시 입력</Button></div>

        {analysisResult ? (
          <section className="mt-6 rounded-lg border border-teal-200 bg-teal-50/60 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-teal-700">AI 분석 결과</p><h3 className="mt-1 text-xl font-black text-slate-950">{analysisResult.summary}</h3></div><span className={cn('rounded-md px-2.5 py-1 text-xs font-black', getUrgencyClass(analysisResult.urgency))}>{getUrgencyLabel(analysisResult.urgency)}</span></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[['카테고리', analysisResult.category], ['세부 유형', analysisResult.subcategory], ['감정', analysisResult.sentiment], ['추천 부서', analysisResult.department], ['예상 처리', analysisResult.expected_days], ['위험 유형', analysisResult.risk_type]].map(([label, value]) => <div key={label} className="rounded-md bg-white p-3"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-1 text-sm font-black text-slate-900">{value}</p></div>)}
            </div>
            <div className="mt-4 rounded-md border border-teal-100 bg-white p-3"><p className="text-xs font-bold text-slate-500">권장 조치</p><p className="mt-1 text-sm leading-6 text-slate-700">{analysisResult.recommended_action}</p><div className="mt-3 flex flex-wrap gap-2">{analysisResult.keywords.map((keyword) => <span key={keyword} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">#{keyword}</span>)}</div></div>
            {analysisNeedsNotification ? <div className="mt-4 flex items-start gap-3 rounded-md bg-rose-50 p-3 text-rose-800"><BellRing className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><p className="text-sm font-bold">민감 또는 고긴급 민원으로 분류되어 관리자 직접 통보 큐에 추가되었습니다.</p></div> : null}
          </section>
        ) : null}
      </section>

      <aside className="grid content-start gap-5">
        <section className="rounded-lg border border-slate-200 bg-white p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-slate-500">분석 반영 추정</p><h2 className="mt-1 text-lg font-black">ROI·예산·영향 인원</h2></div><CircleDollarSign className="size-5 text-slate-400" aria-hidden="true" /></div><p className="mt-3 text-xs leading-5 text-slate-500">AI 분류 카테고리와 과거 해결 사례를 바탕으로 산출한 운영 추정치입니다.</p><dl className="mt-4 grid gap-3"><div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3"><dt className="flex items-center gap-2 text-sm font-semibold text-slate-600"><BarChart3 className="size-4 text-slate-400" aria-hidden="true" />예상 예산</dt><dd className="text-sm font-black text-slate-950">{aiEstimate.budget}</dd></div><div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3"><dt className="flex items-center gap-2 text-sm font-semibold text-slate-600"><Users className="size-4 text-slate-400" aria-hidden="true" />예상 영향 인원</dt><dd className="text-sm font-black text-slate-950">{aiEstimate.people}</dd></div><div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3"><dt className="flex items-center gap-2 text-sm font-semibold text-slate-600"><Activity className="size-4 text-slate-400" aria-hidden="true" />재접수 감소 ROI</dt><dd className="text-sm font-black text-slate-950">{aiEstimate.roi}</dd></div></dl></section>
        <section className="rounded-lg border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><ClipboardCheck className="size-5 text-teal-700" aria-hidden="true" /><div><p className="text-sm font-semibold text-slate-500">다음 작업</p><h2 className="mt-1 text-lg font-black">담당 부서 전달</h2></div></div><p className="mt-4 text-sm leading-6 text-slate-600">{analysisResult ? `${analysisResult.department}에 ${analysisResult.expected_days} 처리 목표로 워크플로우를 생성합니다.` : 'AI 분석을 완료하면 추천 부서와 긴급도 기준 작업을 바로 만들 수 있습니다.'}</p><Button className="mt-5 w-full" disabled={!analysisResult} onClick={() => analysisResult && createWorkflow(analysisResult.department, analysisResult.summary)}><Send aria-hidden="true" />워크플로우로 전달</Button></section>
      </aside>
    </div>
  )

  const reportsView = (
    <div className="grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-sm font-semibold text-teal-700">학기별·연말 통계</p><h2 className="mt-1 text-2xl font-black tracking-tight">민원 통계 리포트</h2><p className="mt-1 text-sm text-slate-500">카테고리, 긴급도, 처리 SLA, 영향도를 한 번에 정리합니다.</p></div><div className="flex items-center gap-2"><div className="inline-flex rounded-lg bg-slate-100 p-1">{(['2026-1학기', '연말'] as const).map((period) => <button key={period} type="button" className={cn('h-8 rounded-md px-3 text-xs font-bold transition', reportPeriod === period ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500')} onClick={() => setReportPeriod(period)}>{period}</button>)}</div><Button variant="outline" size="sm" onClick={downloadReport}><Download aria-hidden="true" />CSV</Button></div></div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">{[["접수 민원", `${totalComplaints}건`, '전학기 대비 +14%'], ['긴급 처리 SLA', '4.1일', '목표 5일 이내'], ['예상 영향 인원', '8,420명', '상위 3개 이슈 기준']].map(([label, value, note]) => <div key={label} className="rounded-lg border border-slate-200 p-4"><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-3 text-3xl font-black text-slate-950">{value}</p><p className="mt-1 text-xs font-bold text-teal-700">{note}</p></div>)}</div>
      </section>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]"><section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-slate-500">카테고리별 SLA</p><h2 className="mt-1 text-lg font-black">처리 기간과 긴급도 비교</h2></div><LineChart className="size-5 text-slate-400" aria-hidden="true" /></div><div className="mt-5 overflow-x-auto rounded-lg border border-slate-200"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-slate-50 text-xs font-bold tracking-wide text-slate-500 uppercase"><tr><th className="px-4 py-3">카테고리</th><th className="px-4 py-3">접수</th><th className="px-4 py-3">평균 처리</th><th className="px-4 py-3">긴급</th><th className="px-4 py-3">변화</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredCategoryMetrics.map((category) => <tr key={category.name}><td className="px-4 py-3 font-bold text-slate-900">{category.name}</td><td className="px-4 py-3">{category.count}건</td><td className="px-4 py-3">{category.averageDays}일</td><td className="px-4 py-3"><span className="rounded-md bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">{category.urgent}건</span></td><td className={cn('px-4 py-3 font-bold', category.delta > 0 ? 'text-rose-600' : 'text-teal-700')}>{category.delta > 0 ? '+' : ''}{category.delta}%</td></tr>)}</tbody></table></div></section>
        <aside className="rounded-lg border border-slate-200 bg-white p-5"><div className="flex items-center gap-2"><FileBarChart className="size-5 text-teal-700" aria-hidden="true" /><div><p className="text-sm font-semibold text-slate-500">리포트 생성</p><h2 className="mt-1 text-lg font-black">관리자 검토본</h2></div></div><p className="mt-4 text-sm leading-6 text-slate-600">선택한 기간의 집계와 AI 분석 추정치를 기반으로 리포트 초안을 생성합니다.</p><Button className="mt-5 w-full" onClick={() => setReportGenerated(true)}><FileBarChart aria-hidden="true" />{reportGenerated ? '리포트 초안 갱신' : '리포트 초안 생성'}</Button>{reportGenerated ? <div className="mt-4 rounded-md bg-teal-50 p-3 text-sm font-bold text-teal-800"><CheckCircle2 className="mr-2 inline size-4" aria-hidden="true" />{reportPeriod} 운영 리포트 초안이 준비되었습니다.</div> : null}</aside></div>
    </div>
  )

  const activeContent =
    activeView === 'overview'
      ? overviewView
      : activeView === 'analysis'
        ? analysisView
        : activeView === 'departments'
          ? departmentsView
          : activeView === 'ai'
            ? aiView
            : reportsView

  return (
    <main className="min-h-svh bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-teal-700 text-white"><Building2 className="size-5" aria-hidden="true" /></span><div><p className="text-xs font-bold tracking-[0.16em] text-slate-500 uppercase">Campus Voice Admin</p><h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">학교 민원 통합 관제</h1></div></div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative inline-flex h-9 items-center rounded-md border border-slate-200 bg-white pl-3 text-slate-700 shadow-sm transition hover:border-slate-300 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100">
              <CalendarDays className="pointer-events-none size-4 shrink-0" aria-hidden="true" />
              <span className="sr-only">집계 학기</span>
              <select
                className="h-full cursor-pointer appearance-none bg-transparent py-0 pr-8 pl-2 text-sm font-bold outline-none"
                value={semesterFilter}
                onChange={(event) => setSemesterFilter(event.target.value as SemesterFilter)}
              >
                <option value="2026-1학기">2026-1학기</option>
                <option value="2026-2학기">2026-2학기</option>
                <option value="전체 기간">전체 기간</option>
              </select>
            </label>
            <label className="relative inline-flex h-9 items-center rounded-md border border-slate-200 bg-white pl-3 text-slate-700 shadow-sm transition hover:border-slate-300 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-100">
              <Filter className="pointer-events-none size-4 shrink-0" aria-hidden="true" />
              <span className="sr-only">집계 캠퍼스 또는 위치</span>
              <select
                className="h-full max-w-44 cursor-pointer appearance-none bg-transparent py-0 pr-8 pl-2 text-sm font-bold outline-none"
                value={campusFilter}
                onChange={(event) => setCampusFilter(event.target.value)}
              >
                {campusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut aria-hidden="true" />로그아웃</Button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid min-w-0 w-full max-w-[1440px] gap-5 px-5 py-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <aside className="min-w-0 rounded-lg border border-slate-200 bg-white p-3 lg:sticky lg:top-5 lg:h-[calc(100svh-40px)]">
          <nav className="grid gap-1" aria-label="관리자 메뉴">{navItems.map(({ id, icon: Icon, label }) => <button key={id} className={cn('flex h-10 items-center gap-3 rounded-md px-3 text-left text-sm font-semibold transition', activeView === id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950')} type="button" onClick={() => setActiveView(id)}><Icon className="size-4" aria-hidden="true" />{label}<ChevronRight className={cn('ml-auto size-4', activeView === id ? 'text-white' : 'text-slate-300')} aria-hidden="true" /></button>)}</nav>
          <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4"><div className="flex items-center gap-2 text-rose-700"><BellRing className="size-4" aria-hidden="true" /><p className="text-sm font-bold">긴급 알림</p></div><p className="mt-2 text-2xl font-black text-rose-700">{urgentTotal}</p><p className="text-xs leading-5 text-rose-700/80">AI가 고긴급 또는 민감 민원으로 분류한 관리자 확인 대상입니다.</p></div>
          <div className="mt-4 rounded-lg bg-slate-50 p-4"><p className="text-xs font-bold text-slate-500">반복 등록 제한 큐</p><p className="mt-1 text-lg font-black text-slate-900">{repeatedUsers.filter((user) => !user.limited).length}건 대기</p><button className="mt-2 text-xs font-bold text-teal-700 hover:underline" type="button" onClick={() => setActiveView('overview')}>상세 보기</button></div>
        </aside>
        <section className="min-w-0">{activeContent}</section>
      </div>
    </main>
  )
}

export { HomePage }
