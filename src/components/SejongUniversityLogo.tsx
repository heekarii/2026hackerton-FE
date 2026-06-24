import { cn } from '@/lib/utils'

type SejongUniversityLogoProps = {
  className?: string
  tone?: 'light' | 'dark'
}

export function SejongUniversityLogo({ className, tone = 'dark' }: SejongUniversityLogoProps) {
  return (
    <img
      className={cn('block h-10 w-auto object-contain', className)}
      src={tone === 'light' ? '/sejong-university-logo.png' : '/sejong-university-logo-active.png'}
      alt="세종대학교 SEJONG UNIVERSITY"
    />
  )
}
