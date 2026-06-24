import { ArrowUpRight, ChartNoAxesCombined, CheckCircle2, MapPinned, ShieldCheck } from 'lucide-react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { Card, CardContent } from '@/components/ui/card'
import { SejongUniversityLogo } from '@/components/SejongUniversityLogo'
import { LoginForm } from '@/features/auth/components/LoginForm'

const highlights = [
  { icon: MapPinned, label: '지도 기반 민원 접수' },
  { icon: ChartNoAxesCombined, label: '처리 현황 한눈에 보기' },
  { icon: ShieldCheck, label: '안전한 학교 계정 인증' },
]

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isRegistered = searchParams.get('registered') === '1'

  return (
    <main className="relative grid min-h-svh overflow-hidden bg-slate-50 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden bg-red-950 px-12 py-10 text-white lg:flex lg:flex-col">
        <div className="absolute inset-y-0 right-0 w-px bg-white/15" />
        <SejongUniversityLogo className="relative h-14 max-w-sm" tone="light" />

        <div className="relative my-auto max-w-xl pb-16">
          <p className="mb-5 text-sm font-bold tracking-[0.2em] text-red-200">SEJONG CAMPUS VOICE</p>
          <h1 className="text-5xl leading-[1.12] font-bold tracking-[-0.055em] text-balance">
            더 나은 캠퍼스를 만드는,
            <br />
            가장 빠른 목소리
          </h1>
          <p className="mt-7 max-w-md text-lg leading-8 text-red-100/80">
            캠퍼스의 불편을 등록하고 처리 과정을 투명하게 확인하세요. 작은 의견이 더
            안전하고 편리한 학교를 만듭니다.
          </p>

          <ul className="mt-10 grid gap-3" aria-label="서비스 주요 기능">
            {highlights.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-red-50/90">
                <span className="grid size-8 place-items-center rounded-lg bg-white/10 ring-1 ring-white/10">
                  <Icon className="size-4 text-red-200" aria-hidden="true" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-red-100/55">© 2026 Sejong University. All rights reserved.</p>
      </section>

      <section className="relative flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="absolute top-0 right-0 left-0 h-1 bg-red-700 lg:hidden" />
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <SejongUniversityLogo className="h-10 max-w-60" />
          </div>

          <Card>
            <CardContent>
              <div className="flex size-11 items-center justify-center rounded-xl bg-red-50 text-red-700">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </div>
              <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">다시 만나 반가워요</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                학교 계정으로 로그인하고 민원 처리 현황을 확인하세요.
              </p>

              {isRegistered ? (
                <div className="mt-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800" role="status">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  <p>회원가입이 완료되었습니다. 새 계정으로 로그인해 주세요.</p>
                </div>
              ) : null}

              <LoginForm onSuccess={() => navigate('/', { replace: true })} />

              <p className="mt-6 text-center text-sm text-slate-500">
                아직 계정이 없나요?{' '}
                <Link className="font-semibold text-red-700 hover:text-red-800 hover:underline" to="/signup">
                  학교 이메일로 회원가입
                </Link>
              </p>

              <div className="mt-6 border-t border-slate-100 pt-5 text-center text-xs leading-5 text-slate-400">
                로그인하면 서비스 이용약관 및 개인정보 처리방침에 동의하는 것으로 간주됩니다.
              </div>
            </CardContent>
          </Card>

          <a
            className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-red-700"
            href="mailto:admin@university.ac.kr"
          >
            계정에 문제가 있나요? 관리자에게 문의하기
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </section>
    </main>
  )
}
