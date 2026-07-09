import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface PillProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'dark' | 'accent' | 'outline' | 'ghost'
  size?: 'sm' | 'md'
  children: ReactNode
}

export function Pill({ variant = 'dark', size = 'md', className, children, ...rest }: PillProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-opacity active:opacity-70 disabled:opacity-40',
        size === 'md' && 'h-12 px-5 text-sm',
        size === 'sm' && 'h-9 px-4 text-xs',
        variant === 'dark' && 'bg-ink text-bg',
        // accent bg is a fixed brand color (same hex in both themes), so its
        // text must be fixed too, not the theme-relative `ink` token.
        variant === 'accent' && 'bg-accent text-[#0b0f0d]',
        variant === 'outline' && 'border border-border bg-transparent text-ink',
        variant === 'ghost' && 'bg-surface-2 text-ink',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
