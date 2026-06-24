import {
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  LogOut,
  MessageSquareText,
  Star,
  UserRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { clearAccessToken } from '@/features/auth/auth-storage'
import { cn } from '@/lib/utils'

type ComplaintStatus = 'received' | 'processing' | 'completed'

type Complaint = {
  id: number
  title: string
  category: string
  submittedAt: string
  location: string
  status: ComplaintStatus
  assignedTo: string
  answer?: string
  satisfaction?: number
}

const statusSteps: Array<{ key: ComplaintStatus; label: string }> = [
  { key: 'received', label: '접수' },
  { key: 'processing', label: '처리중' },
  { key: 'completed', label: '완료' },
]

const statusMeta: Record<
  ComplaintStatus,
  { label: string; description: string; icon: typeof Clock3; className: string }
> = {
  received: {
    label: '접수 완료',
    description: '담당 부서 배정을 기다리고 있어요.',
    icon: Clock3,
    className: 'bg-slate-100 text-slate-700',
  },
  processing: {
    label: '처리 중',
    description: '담당 부서에서 조치하고 있어요.',
    icon: MessageSquareText,
    className: 'bg-amber-50 text-amber-700',
  },
  completed: {
    label: '처리 완료',
    description: '답변 확인 후 만족도를 남길 수 있어요.',
    icon: CheckCircle2,
    className: 'bg-emerald-50 text-emerald-700',
  },
}

const initialComplaints: Complaint[] = [
  {
    id: 1038,
    title: '도서관 3층 열람실 콘센트 고장',
    category: '도서관',
    submittedAt: '2026.06.22',
    location: '중앙도서관 3층 B구역',
    status: 'processing',
    assignedTo: '시설관리팀',
  },
  {
    id: 1024,
    title: '학생식당 배식 대기 줄 안내 필요',
    category: '식당',
    submittedAt: '2026.06.18',
    location: '학생회관 1층',
    status: 'completed',
    assignedTo: '복지지원팀',
    answer: '혼잡 시간대 바닥 안내선과 대기 표지판 설치를 완료했습니다.',
    satisfaction: 4,
  },
  {
    id: 1019,
    title: '강의실 냉방 온도 점검 요청',
    category: '수업 환경',
    submittedAt: '2026.06.15',
    location: '공학관 204호',
    status: 'processing',
    assignedTo: '학사지원팀',
  },
]

const user = {
  name: '김민서',
  email: 'minseo@university.ac.kr',
  department: '컴퓨터공학과',
  studentId: '20261234',
}

function getStatusIndex(status: ComplaintStatus) {
  return statusSteps.findIndex((step) => step.key === status)
}

export function ComplainantPage() {
  const navigate = useNavigate()
  const [complaints, setComplaints] = useState(initialComplaints)

  const completedCount = useMemo(
    () => complaints.filter((complaint) => complaint.status === 'completed').length,
    [complaints],
  )
  const activeCount = complaints.length - completedCount

  function handleLogout() {
    clearAccessToken()
    navigate('/login', { replace: true })
  }

  function updateSatisfaction(id: number, rating: number) {
    setComplaints((current) =>
      current.map((complaint) =>
        complaint.id === id ? { ...complaint, satisfaction: rating } : complaint,
      ),
    )
  }

  return (
    <main className="min-h-svh bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-700 text-white shadow-lg shadow-teal-700/20">
              <Building2 className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-teal-700">캠퍼스 민원 플랫폼</p>
              <h1 className="text-xl font-bold tracking-tight text-slate-950">민원인 마이페이지</h1>
            </div>
          </div>
          <Button className="w-full sm:w-auto" variant="outline" onClick={handleLogout}>
            <LogOut aria-hidden="true" />
            로그아웃
          </Button>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 py-7 sm:px-8 lg:grid-cols-[19rem_1fr]">
        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-lg bg-teal-50 text-teal-700">
                <UserRound className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-bold text-slate-950">{user.name}</h2>
                <p className="text-sm text-slate-500">{user.department}</p>
              </div>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">학번</dt>
                <dd className="font-medium text-slate-800">{user.studentId}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-slate-500">이메일</dt>
                <dd className="min-w-0 truncate text-right font-medium text-slate-800">{user.email}</dd>
              </div>
            </dl>
          </section>

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">작성한 민원</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{complaints.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">진행 중</p>
              <p className="mt-2 text-3xl font-bold text-teal-700">{activeCount}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm max-lg:col-span-2">
              <p className="text-sm text-slate-500">완료된 민원</p>
              <p className="mt-2 text-3xl font-bold text-emerald-700">{completedCount}</p>
            </div>
          </section>
        </aside>

        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-950">내가 작성한 민원</h2>
              <p className="mt-1 text-sm text-slate-500">접수부터 완료까지 단계별 진행상황을 확인하세요.</p>
            </div>
            <Button size="sm" onClick={() => navigate('/complaint')}>
              <FileText aria-hidden="true" />
              새 민원 작성
            </Button>
          </div>

          <div className="space-y-4">
            {complaints.map((complaint) => {
              const currentStep = getStatusIndex(complaint.status)
              const meta = statusMeta[complaint.status]
              const StatusIcon = meta.icon

              return (
                <article key={complaint.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          접수번호 {complaint.id}
                        </span>
                        <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                          {complaint.category}
                        </span>
                      </div>
                      <h3 className="mt-3 text-base font-bold text-slate-950">{complaint.title}</h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {complaint.submittedAt} 접수 · {complaint.location}
                      </p>
                    </div>

                    <div className={cn('inline-flex w-fit items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold', meta.className)}>
                      <StatusIcon className="size-4" aria-hidden="true" />
                      {meta.label}
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="grid grid-cols-3 gap-2">
                      {statusSteps.map((step, index) => {
                        const isDone = index <= currentStep

                        return (
                          <div key={step.key} className="min-w-0">
                            <div
                              className={cn(
                                'h-2 rounded-full',
                                isDone ? 'bg-teal-700' : 'bg-slate-200',
                              )}
                            />
                            <p
                              className={cn(
                                'mt-2 truncate text-xs font-semibold',
                                isDone ? 'text-teal-700' : 'text-slate-400',
                              )}
                            >
                              {step.label}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="mt-5 rounded-lg bg-slate-50 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold text-slate-800">{meta.description}</p>
                      <p className="text-sm text-slate-500">담당: {complaint.assignedTo}</p>
                    </div>
                    {complaint.answer ? (
                      <p className="mt-3 text-sm leading-6 text-slate-600">답변: {complaint.answer}</p>
                    ) : null}
                  </div>

                  {complaint.status === 'completed' ? (
                    <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-900">처리 만족도</p>
                        <p className="mt-1 text-xs text-slate-500">완료된 민원은 만족도를 선택할 수 있습니다.</p>
                      </div>
                      <div className="flex items-center gap-1" role="radiogroup" aria-label={`${complaint.title} 만족도`}>
                        {[1, 2, 3, 4, 5].map((rating) => {
                          const isSelected = rating <= (complaint.satisfaction ?? 0)

                          return (
                            <button
                              key={rating}
                              type="button"
                              className="grid size-9 place-items-center rounded-lg text-amber-400 transition hover:bg-amber-50 focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:outline-none"
                              role="radio"
                              aria-checked={complaint.satisfaction === rating}
                              aria-label={`${rating}점`}
                              onClick={() => updateSatisfaction(complaint.id, rating)}
                            >
                              <Star
                                className={cn('size-5', isSelected ? 'fill-amber-400' : 'fill-transparent text-slate-300')}
                                aria-hidden="true"
                              />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        </section>
      </div>
    </main>
  )
}
