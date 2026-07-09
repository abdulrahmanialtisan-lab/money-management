import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'dark' | 'accent'
  children: ReactNode
}

export function Card({ variant = 'surface', className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[1.75rem] p-5',
        variant === 'surface' && 'bg-surface text-ink',
        // "dark" and "accent" are fixed brand colors that stay constant across
        // the light/dark theme toggle, so their text must be fixed too, not
        // theme-relative tokens (which would invert and break contrast).
        variant === 'dark' && 'bg-[#0b0f0d] text-[#f5f5f1] ring-1 ring-white/10',
        variant === 'accent' && 'bg-accent text-[#0b0f0d]',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
