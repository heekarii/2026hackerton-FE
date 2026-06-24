import { Building2, ChevronLeft, MailCheck, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

import { Card, CardContent } from '@/components/ui/card'
import { SignupForm } from '@/features/auth/components/SignupForm'

export function SignupPage() {
  const navigate = useNavigate()

  return (
    <main className="relative grid min-h-svh overflow-hidden bg-slate-50 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative hidden overflow-hidden bg-teal-950 px-12 py-10 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(45,212,191,0.24),transparent_30%),radial-gradient(circle_at_14%_78%,rgba(20,184,166,0.18),transparent_28%)]" />
        <div className="absolute -bottom-36 -left-20 size-[30rem] rounded-full border border-teal-300/15" />
        <div className="relative flex items-center gap-3 text-sm font-bold tracking-tight">
          <span className="grid size-10 place-items-center rounded-xl bg-white text-teal-800 shadow-lg shadow-teal-950/30">
            <Building2 className="size-5" aria-hidden="true" />
          </span>
          캠퍼스 민원 플랫폼
        </div>

        <div className="relative my-auto max-w-md pb-16">
          <div className="grid size-14 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10">
            <MailCheck className="size-7 text-teal-200" aria-hidden="true" />
          </div>
          <p className="mt-8 text-sm font-bold tracking-[0.2em] text-teal-200">SCHOOL EMAIL VERIFY</p>
          <h1 className="mt-4 text-5xl leading-[1.12] font-bold tracking-[-0.055em] text-balance">
            학교 이메일로,
            <br />
            더 안전하게 시작하세요
          </h1>
          <p className="mt-7 text-lg leading-8 text-teal-100/80">
            학교 구성원 인증을 통해 신뢰할 수 있는 민원 소통 공간을 함께 만듭니다.
          </p>
          <div className="mt-10 flex items-center gap-3 text-sm text-teal-100/85">
            <ShieldCheck className="size-5 text-teal-200" aria-hidden="true" />
            인증 정보는 안전하게 처리됩니다.
          </div>
        </div>
      </section>

      <section className="relative flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="absolute top-0 right-0 left-0 h-1 bg-teal-700 lg:hidden" />
        <div className="w-full max-w-lg">
          <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
            <span className="flex items-center gap-3 text-sm font-bold tracking-tight text-slate-800">
              <span className="grid size-10 place-items-center rounded-xl bg-teal-700 text-white">
                <Building2 className="size-5" aria-hidden="true" />
              </span>
              캠퍼스 민원 플랫폼
            </span>
          </div>

          <Link className="mb-5 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-teal-700" to="/login">
            <ChevronLeft className="size-4" aria-hidden="true" />
            로그인으로 돌아가기
          </Link>

          <Card>
            <CardContent>
              <div className="flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <MailCheck className="size-5" aria-hidden="true" />
              </div>
              <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">학교 이메일로 회원가입</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                이메일 인증을 완료한 뒤 필요한 정보만 입력해 가입할 수 있어요.
              </p>

              <SignupForm onSuccess={() => navigate('/login?registered=1', { replace: true })} />
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
