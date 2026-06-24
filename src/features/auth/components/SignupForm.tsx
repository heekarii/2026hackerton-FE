import { BadgeCheck, CheckCircle2, LoaderCircle, Mail, TriangleAlert } from 'lucide-react'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/shared/api/client'

import { sendVerificationCode, signup } from '../api/signup'

type SignupFormProps = {
  onSuccess: () => void
}

type VerificationStatus = 'idle' | 'verified'

function getErrorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [email, setEmail] = useState('')
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('idle')
  const [verificationToken, setVerificationToken] = useState<string | undefined>()
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function resetVerification() {
    setVerificationStatus('idle')
    setVerificationToken(undefined)
    setNotice('')
  }

  async function handleSendCode() {
    setFormError('')
    setNotice('')

    if (!isValidEmail(email.trim())) {
      setFormError('학교 이메일 형식을 확인해 주세요.')
      return
    }

    setIsSendingCode(true)

    try {
      const response = await sendVerificationCode(email.trim())
      if (!response.verification_token) {
        throw new Error('이메일 확인 토큰을 받지 못했습니다.')
      }
      setVerificationToken(response.verification_token)
      setVerificationStatus('verified')
      setNotice(response.message ?? '학교 이메일 확인이 완료되었습니다.')
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSendingCode(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    setNotice('')

    if (verificationStatus !== 'verified') {
      setFormError('학교 이메일 인증을 먼저 완료해 주세요.')
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
        verification_token: verificationToken,
      })
      onSuccess()
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEmailLocked = verificationStatus !== 'idle'
  const isVerified = verificationStatus === 'verified'

  return (
    <form className="mt-7 space-y-6" noValidate onSubmit={handleSubmit}>
      {formError && (
        <div className="flex gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700" role="alert">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>{formError}</p>
        </div>
      )}

      {notice && (
        <div className="flex gap-3 rounded-xl border border-teal-200 bg-teal-50 px-3.5 py-3 text-sm text-teal-800" role="status">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <p>{notice}</p>
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="signup-email">학교 이메일</Label>
          {isVerified ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700">
              <BadgeCheck className="size-3.5" aria-hidden="true" /> 인증 완료
            </span>
          ) : null}
        </div>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="name@university.ac.kr"
              value={email}
              disabled={isEmailLocked}
              className="pl-10"
              onChange={(event) => {
                setEmail(event.target.value)
                resetVerification()
              }}
            />
          </div>
          {isEmailLocked ? (
            <Button type="button" variant="outline" onClick={resetVerification}>
              변경
            </Button>
          ) : (
            <Button type="button" variant="outline" disabled={isSendingCode} onClick={handleSendCode}>
              {isSendingCode ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
              이메일 확인
            </Button>
          )}
        </div>
        <p className="text-xs leading-5 text-slate-400">소속 학교의 이메일로만 가입할 수 있습니다.</p>
      </section>

      <fieldset disabled={!isVerified} className="space-y-5 disabled:opacity-45">
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
