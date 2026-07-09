import { ICON_KEYS, ICONS } from '../../icons/categoryIcons'
import { cn } from '../../utils/cn'

interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
  color?: string
}

export function IconPicker({ value, onChange, color }: IconPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {ICON_KEYS.map((key) => {
        const Icon = ICONS[key]
        const selected = key === value
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-2xl border transition-colors',
              selected ? 'border-transparent' : 'border-border bg-surface-2 text-muted',
            )}
            style={selected ? { backgroundColor: color ?? 'var(--color-accent)', color: 'var(--color-ink)' } : undefined}
          >
            <Icon size={18} />
          </button>
        )
      })}
    </div>
  )
}
