import {
  Activity,
  AlarmClock,
  ArrowUpRight,
  BadgeAlert,
  BarChart3,
  BellRing,
  Building2,
  CalendarDays,
  CircleDollarSign,
  FileBarChart,
  Filter,
  Handshake,
  LayoutDashboard,
  LogOut,
  MapPin,
  Megaphone,
  MessageSquareWarning,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { clearAccessToken } from '@/features/auth/auth-storage'

type CategoryName = '시설' | '수업' | '학식' | '도서관' | '행정' | '안전/보건'

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
    department: '교무처',
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
    department: '학생복지팀',
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
    department: '행정지원처',
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

const locationHotspots = [
  { name: '공학관', building: '6번', count: 68, x: '33%', y: '48%', category: '시설' },
  { name: '학생회관', building: '14번', count: 54, x: '70%', y: '45%', category: '학식' },
  { name: '다산관', building: '23번', count: 37, x: '82%', y: '31%', category: '수업' },
  { name: '집현관', building: '1번', count: 31, x: '32%', y: '72%', category: '행정' },
  { name: '군자관', building: '5번', count: 29, x: '37%', y: '57%', category: '시설' },
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
    solvedBy: '학생복지팀 + 식당운영사',
    result: '피크타임 배식 동선 분리 및 메뉴 사전 공지',
    days: 3,
  },
  {
    title: '강의실 배정 오류 반복',
    category: '수업',
    matchRate: 86,
    solvedBy: '교무처 + 학과 사무실',
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

const departmentLinks = [
  { department: '시설관리팀', role: '현장 확인 및 보수 일정 산정', status: '즉시 연결 가능' },
  { department: '학생복지팀', role: '학생 영향도 검토 및 공지 협의', status: '검토 대기 2건' },
  { department: '예산팀', role: '긴급 예산 전용 가능성 확인', status: '승인 SLA 1일' },
]

const sensitiveAlerts = [
  {
    title: '실험실 안전 장비 미작동 제보',
    category: '안전/보건',
    level: '긴급',
    score: 96,
    owner: '안전관리센터',
  },
  {
    title: '개인정보 포함 행정 민원',
    category: '행정',
    level: '주의',
    score: 84,
    owner: '행정지원처',
  },
  {
    title: '특정 학생 대상 반복 비방 신고',
    category: '수업',
    level: '민감',
    score: 79,
    owner: '학생상담센터',
  },
]

const repeatedUsers = [
  { id: '2026***41', count: 11, category: '시설', action: '24시간 등록 제한 권고' },
  { id: '2025***08', count: 8, category: '학식', action: '유사 민원 병합 안내' },
  { id: '2024***73', count: 6, category: '행정', action: '관리자 검토 후 공개' },
]

function getHeatColor(value: number) {
  if (value > 85) return 'bg-rose-500'
  if (value > 70) return 'bg-amber-500'
  if (value > 45) return 'bg-teal-600'
  return 'bg-slate-300'
}

function HomePage() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState<CategoryName>('시설')

  const selected = useMemo(
    () => categories.find((category) => category.name === selectedCategory) ?? categories[0],
    [selectedCategory],
  )
  const selectedSimilarCases = similarCases
    .filter((caseItem) => caseItem.category === selectedCategory)
    .concat(similarCases.filter((caseItem) => caseItem.category !== selectedCategory))
    .slice(0, 3)
  const totalComplaints = categories.reduce((sum, category) => sum + category.count, 0)
  const urgentTotal = categories.reduce((sum, category) => sum + category.urgent, 0)

  function handleLogout() {
    clearAccessToken()
    navigate('/login', { replace: true })
  }

  return (
    <main className="min-h-svh bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-teal-700 text-white">
              <Building2 className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-slate-500 uppercase">
                Campus Voice Admin
              </p>
              <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                학교 민원 통합 관제
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              <CalendarDays aria-hidden="true" />
              2026-1학기
            </Button>
            <Button variant="outline" size="sm">
              <Filter aria-hidden="true" />
              전체 캠퍼스
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut aria-hidden="true" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid min-w-0 w-full max-w-[1440px] gap-5 px-5 py-5 lg:grid-cols-[240px_minmax(0,1fr)] lg:px-8">
        <aside className="min-w-0 rounded-lg border border-slate-200 bg-white p-3 lg:sticky lg:top-5 lg:h-[calc(100svh-40px)]">
          <nav className="grid gap-1" aria-label="관리자 메뉴">
            {[
              { icon: LayoutDashboard, label: '민원 집계' },
              { icon: MapPin, label: '시간/위치 분석' },
              { icon: Handshake, label: '부서 연결' },
              { icon: Sparkles, label: 'AI 예측' },
              { icon: FileBarChart, label: '통계 리포트' },
            ].map(({ icon: Icon, label }, index) => (
              <button
                key={label}
                className={cn(
                  'flex h-10 items-center gap-3 rounded-md px-3 text-left text-sm font-semibold transition',
                  index === 0
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                )}
                type="button"
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-5 rounded-lg border border-rose-200 bg-rose-50 p-4">
            <div className="flex items-center gap-2 text-rose-700">
              <BellRing className="size-4" aria-hidden="true" />
              <p className="text-sm font-bold">긴급 알림</p>
            </div>
            <p className="mt-2 text-2xl font-black text-rose-700">{urgentTotal}</p>
            <p className="text-xs leading-5 text-rose-700/80">
              AI가 긴급도 높음으로 분류한 민원입니다.
            </p>
          </div>
        </aside>

        <section className="grid min-w-0 gap-5">
          <div className="grid min-w-0 gap-4 xl:grid-cols-[1fr_340px]">
            <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-teal-700">전체 접수 현황</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
                    카테고리별 민원 집계
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    총 {totalComplaints.toLocaleString()}건을 범주화하고 우선 처리 영역을 계산했습니다.
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    className="h-10 w-full rounded-md border border-slate-200 bg-white pr-3 pl-9 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
                    placeholder="민원, 장소, 부서 검색"
                    type="search"
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {categories.map((category) => {
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
                        <span
                          className={cn(
                            'inline-flex h-7 items-center rounded-md px-2.5 text-xs font-bold',
                            category.softColor,
                          )}
                        >
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
                          <p className="mt-1 text-xs font-medium text-slate-500">
                            전체의 {category.share}%
                          </p>
                        </div>
                        <div className="text-right text-xs text-slate-500">
                          <p className="font-bold text-rose-600">긴급 {category.urgent}건</p>
                          <p>평균 {category.averageDays}일</p>
                        </div>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn('h-full rounded-full', category.color)}
                          style={{ width: `${category.share * 2.6}%` }}
                        />
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

              <Button className="mt-5 w-full bg-white text-slate-950 hover:bg-slate-100" size="sm">
                <ArrowUpRight aria-hidden="true" />
                담당 부서 워크플로우 생성
              </Button>
            </section>
          </div>

          <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="grid min-w-0 content-start gap-5">
              <div className="grid min-w-0 items-start gap-5 lg:grid-cols-2">
                <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">반복 패턴</p>
                      <h2 className="mt-1 text-lg font-black">시간대별 민원 밀도</h2>
                    </div>
                    <AlarmClock className="size-5 text-slate-400" aria-hidden="true" />
                  </div>

                  <div className="mt-5 grid grid-cols-7 gap-2" aria-label="시간대별 민원 밀도">
                    {timeSlots.map((slot) => (
                      <div key={slot.label} className="grid gap-2">
                        <div
                          className={cn(
                            'grid aspect-square place-items-center rounded-md text-xs font-black text-white',
                            getHeatColor(slot.value),
                          )}
                        >
                          {slot.value}
                        </div>
                        <p className="text-center text-xs font-semibold text-slate-500">{slot.label}</p>
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-800">
                    16시와 점심 시간대에 반복 접수가 집중됩니다. 현장 점검 인력을 해당 구간에 우선 배치하세요.
                  </p>
                </section>

                <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">위치 시각화</p>
                      <h2 className="mt-1 text-lg font-black">캠퍼스 핫스팟</h2>
                    </div>
                    <MapPin className="size-5 text-slate-400" aria-hidden="true" />
                  </div>

                  <div className="relative mt-5 aspect-[527/458] overflow-hidden rounded-lg border border-slate-200 bg-[#edf3ea]">
                    <img
                      src="/campus-map.png"
                      alt="캠퍼스 건물 배치도"
                      className="absolute inset-0 size-full object-contain"
                    />
                    {locationHotspots.map((spot) => (
                      <div
                        key={spot.name}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ left: spot.x, top: spot.y }}
                        role="img"
                        aria-label={`${spot.name} ${spot.building}, ${spot.category} 민원 ${spot.count}건`}
                      >
                        <span className="absolute inset-0 size-8 animate-ping rounded-full bg-rose-500/25 sm:size-9" />
                        <span className="relative grid size-8 place-items-center rounded-full border-2 border-white bg-rose-600 text-[11px] font-black text-white shadow-lg shadow-rose-700/25 sm:size-9 sm:text-xs">
                          {spot.count}
                        </span>
                      </div>
                    ))}
                  </div>

                  <ul className="mt-4 grid gap-2">
                    {locationHotspots.slice(0, 3).map((spot) => (
                      <li key={spot.name} className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-semibold text-slate-700">
                          {spot.name} <span className="text-slate-400">{spot.building}</span>
                        </span>
                        <span className="text-slate-500">
                          {spot.category} · {spot.count}건
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">과거 데이터 탐색</p>
                    <h2 className="mt-1 text-lg font-black">유사 민원 해결 사례 및 예측</h2>
                  </div>
                  <Button variant="outline" size="sm">
                    <Search aria-hidden="true" />
                    사례 검색
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
                          <td className="px-4 py-3">
                            <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-bold text-teal-700">
                              {caseItem.matchRate}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{caseItem.solvedBy}</td>
                          <td className="px-4 py-3 text-slate-600">{caseItem.result}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{caseItem.days}일</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">학기별/연말 리포트</p>
                    <h2 className="mt-1 text-lg font-black">통계 리포트 자동 생성</h2>
                  </div>
                  <FileBarChart className="size-5 text-slate-400" aria-hidden="true" />
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {[
                    { title: '2026-1학기 운영 리포트', metric: '민원 628건', status: '초안 준비' },
                    { title: '부서별 SLA 리포트', metric: '평균 4.1일', status: '자동 갱신' },
                    { title: '연말 예산 반영 리포트', metric: '영향 8,420명', status: '예측 계산' },
                  ].map((report) => (
                    <div key={report.title} className="rounded-lg border border-slate-200 p-4">
                      <p className="text-sm font-bold text-slate-900">{report.title}</p>
                      <p className="mt-3 text-2xl font-black text-slate-950">{report.metric}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{report.status}</p>
                    </div>
                  ))}
                </div>
              </section>
            </section>

            <aside className="grid min-w-0 content-start gap-5">
              <section className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">실시간 급증</p>
                    <h2 className="mt-1 text-lg font-black">많이 들어오는 민원</h2>
                  </div>
                  <Megaphone className="size-5 text-slate-400" aria-hidden="true" />
                </div>

                <ul className="mt-4 grid gap-3">
                  {trendingComplaints.map((item, index) => (
                    <li key={item.title} className="flex items-start gap-3">
                      <span className="grid size-7 shrink-0 place-items-center rounded-md bg-slate-100 text-xs font-black text-slate-600">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.category} · {item.count}건 · {item.pace}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">유관 부서 연결</p>
                    <h2 className="mt-1 text-lg font-black">협업 추천</h2>
                  </div>
                  <Handshake className="size-5 text-slate-400" aria-hidden="true" />
                </div>

                <ul className="mt-4 grid gap-3">
                  {departmentLinks.map((link) => (
                    <li key={link.department} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-slate-900">{link.department}</p>
                        <ArrowUpRight className="size-4 text-slate-400" aria-hidden="true" />
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{link.role}</p>
                      <p className="mt-2 text-xs font-bold text-teal-700">{link.status}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">AI 기반 예측</p>
                    <h2 className="mt-1 text-lg font-black">ROI·예산·영향 인원</h2>
                  </div>
                  <CircleDollarSign className="size-5 text-slate-400" aria-hidden="true" />
                </div>

                <dl className="mt-4 grid gap-3">
                  {[
                    { label: '예상 예산', value: '1,860만원', icon: BarChart3 },
                    { label: '예상 영향 인원', value: '2,420명', icon: Users },
                    { label: '불만 재접수 감소 ROI', value: '3.2x', icon: Activity },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 p-3">
                      <dt className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                        <Icon className="size-4 text-slate-400" aria-hidden="true" />
                        {label}
                      </dt>
                      <dd className="text-sm font-black text-slate-950">{value}</dd>
                    </div>
                  ))}
                </dl>
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
                    <li key={user.id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-slate-900">{user.id}</p>
                        <span className="rounded-md bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700">
                          {user.count}회
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {user.category} · {user.action}
                      </p>
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
                  {sensitiveAlerts.map((alert) => (
                    <li key={alert.title} className="rounded-lg bg-rose-50 p-3">
                      <div className="flex items-start gap-3">
                        <MessageSquareWarning className="mt-0.5 size-4 shrink-0 text-rose-600" aria-hidden="true" />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-rose-950">{alert.title}</p>
                          <p className="mt-1 text-xs leading-5 text-rose-700">
                            {alert.category} · 긴급도 {alert.score} · {alert.owner}
                          </p>
                        </div>
                        <span className="ml-auto rounded-md bg-white px-2 py-1 text-xs font-black text-rose-700">
                          {alert.level}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  )
}

export { HomePage }
