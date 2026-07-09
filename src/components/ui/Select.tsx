import { ChevronDown } from 'lucide-react'
import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string
  options: SelectOption[]
  onChange: (value: string) => void
}

export function Select({ label, options, value, onChange, className, ...rest }: SelectProps) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-ink-soft">{label}</span>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full appearance-none rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none',
            'focus:border-accent-strong',
            className,
          )}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-muted" />
      </div>
    </label>
  )
}
