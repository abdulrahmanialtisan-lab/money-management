import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../utils/cn'

export interface ComboboxItem {
  id: string
  label: string
  sublabel?: string
  icon?: React.ReactNode
  color?: string
}

interface SearchableComboboxProps {
  items: ComboboxItem[]
  selectedId?: string
  onSelect: (id: string) => void
  onCreateNew?: (query: string) => void
  placeholder?: string
}

export function SearchableCombobox({ items, selectedId, onSelect, onCreateNew, placeholder }: SearchableComboboxProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((item) => item.label.toLowerCase().includes(q))
  }, [items, query])

  const exactMatch = filtered.some((item) => item.label.toLowerCase() === query.trim().toLowerCase())

  return (
    <div>
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface-2 px-4 py-3">
        <Search size={16} className="text-muted shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder ?? t('expense.searchItems')}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>
      <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
        {filtered.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-start transition-colors',
              selectedId === item.id ? 'bg-accent-soft' : 'hover:bg-surface-2',
            )}
          >
            {item.icon && (
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: item.color ?? 'var(--color-surface-2)' }}
              >
                {item.icon}
              </span>
            )}
            <span className="flex-1">
              <span className="block text-sm font-medium">{item.label}</span>
              {item.sublabel && <span className="block text-xs text-muted">{item.sublabel}</span>}
            </span>
          </button>
        ))}

        {query.trim() && !exactMatch && onCreateNew && (
          <button
            type="button"
            onClick={() => onCreateNew(query.trim())}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-start text-accent-strong hover:bg-accent-soft"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-lg leading-none">+</span>
            <span className="text-sm font-medium">{t('expense.addNewItem', { name: query.trim() })}</span>
          </button>
        )}

        {filtered.length === 0 && !query.trim() && (
          <p className="px-3 py-4 text-center text-sm text-muted">{t('items.empty')}</p>
        )}
      </div>
    </div>
  )
}
