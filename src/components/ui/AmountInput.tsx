import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface AmountInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string
  onChange: (value: string) => void
  currency?: string
}

export function AmountInput({ value, onChange, currency, className, ...rest }: AmountInputProps) {
  return (
    <div className={cn('flex items-center gap-2 rounded-2xl border border-border bg-surface-2 px-4 py-4', className)}>
      <input
        inputMode="decimal"
        value={value}
        onChange={(e) => {
          const next = e.target.value.replace(/[^0-9.]/g, '')
          if ((next.match(/\./g) || []).length > 1) return
          onChange(next)
        }}
        placeholder="0.00"
        className="w-full min-w-0 bg-transparent text-3xl font-semibold outline-none placeholder:text-muted"
        {...rest}
      />
      {currency && <span className="shrink-0 text-sm font-medium text-muted">{currency}</span>}
    </div>
  )
}
