import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function TextField({ label, error, className, id, ...rest }: TextFieldProps) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</span>}
      <input
        id={id}
        className={cn(
          'w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none',
          'focus:border-accent-strong',
          error && 'border-danger-strong',
          className,
        )}
        {...rest}
      />
      {error && <span className="mt-1 block text-xs text-danger-strong">{error}</span>}
    </label>
  )
}
