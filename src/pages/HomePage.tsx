import { LogOut, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { clearAccessToken } from '@/features/auth/auth-storage'

export function HomePage() {
  const navigate = useNavigate()

  function handleLogout() {
    clearAccessToken()
    navigate('/login', { replace: true })
  }

  return (
    <main className="grid min-h-svh place-items-center bg-slate-50 p-6">
      <Card className="w-full max-w-lg">
        <CardContent className="text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-teal-50 text-teal-700">
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">로그인되었습니다</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            대시보드 페이지는 다음 기능 구현에서 연결할 수 있습니다.
          </p>
          <Button className="mt-7" variant="outline" onClick={handleLogout}>
            <LogOut aria-hidden="true" />
            로그아웃
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
