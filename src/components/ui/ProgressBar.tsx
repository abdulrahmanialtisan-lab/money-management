import { cn } from '../../utils/cn'

interface ProgressBarProps {
  value: number // 0-100
  tone?: 'accent' | 'danger' | 'dark'
  trackClassName?: string
  className?: string
}

export function ProgressBar({ value, tone = 'accent', trackClassName, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('h-3 w-full overflow-hidden rounded-full bg-surface-2', trackClassName, className)}>
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500 ease-out',
          tone === 'accent' && 'bg-accent-strong',
          tone === 'danger' && 'bg-danger-strong',
          tone === 'dark' && 'bg-ink',
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
