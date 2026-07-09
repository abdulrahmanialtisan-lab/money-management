import { COLOR_SWATCHES } from '../../icons/categoryIcons'
import { cn } from '../../utils/cn'

interface ColorSwatchPickerProps {
  value: string
  onChange: (color: string) => void
}

export function ColorSwatchPicker({ value, onChange }: ColorSwatchPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_SWATCHES.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          aria-label={color}
          className={cn(
            'h-9 w-9 rounded-full ring-offset-2 ring-offset-surface transition-transform',
            value === color && 'ring-2 ring-ink scale-110',
          )}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  )
}
