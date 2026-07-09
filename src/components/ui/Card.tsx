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
        variant === 'dark' && 'bg-ink text-bg',
        variant === 'accent' && 'bg-accent text-ink',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
