import { LoaderCircle, Mail, TriangleAlert } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/shared/api/client'

import { signup } from '../api/signup'

type SignupFormProps = {
  onSuccess: () => void
}

function getErrorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')

    if (!isValidEmail(email.trim())) {
      setFormError('이메일 형식을 확인해 주세요.')
      return
    }

    if (!nickname.trim()) {
      setFormError('서비스에서 사용할 닉네임을 입력해 주세요.')
      return
    }

    if (password.length < 8) {
      setFormError('비밀번호는 8자 이상으로 설정해 주세요.')
      return
    }

    if (password !== passwordConfirmation) {
      setFormError('비밀번호가 서로 일치하지 않습니다.')
      return
    }

    if (!agreedToTerms) {
      setFormError('서비스 이용약관과 개인정보 처리방침에 동의해 주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      await signup({
        email: email.trim(),
        nickname: nickname.trim(),
        password,
      })
      onSuccess()
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="mt-7 space-y-6" noValidate onSubmit={handleSubmit}>
      {formError && (
        <div className="flex gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700" role="alert">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>{formError}</p>
        </div>
      )}

      <section className="space-y-3">
        <Label htmlFor="signup-email">이메일</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="이메일을 입력하세요"
            value={email}
            className="pl-10"
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
      </section>

      <fieldset className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="nickname">닉네임</Label>
          <Input
            id="nickname"
            autoComplete="nickname"
            placeholder="서비스에서 사용할 이름을 입력하세요"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-password">비밀번호</Label>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            placeholder="8자 이상 입력하세요"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password-confirmation">비밀번호 확인</Label>
          <Input
            id="password-confirmation"
            type="password"
            autoComplete="new-password"
            placeholder="비밀번호를 한 번 더 입력하세요"
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
          />
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-5 text-slate-600">
          <input
            type="checkbox"
            className="mt-0.5 size-4 rounded border-slate-300 accent-teal-700"
            checked={agreedToTerms}
            onChange={(event) => setAgreedToTerms(event.target.checked)}
          />
          <span>서비스 이용약관 및 개인정보 처리방침에 동의합니다.</span>
        </label>

        <Button className="w-full" size="lg" type="submit" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
          {isSubmitting ? '가입 중...' : '회원가입 완료'}
        </Button>
      </fieldset>
    </form>
  )
}
