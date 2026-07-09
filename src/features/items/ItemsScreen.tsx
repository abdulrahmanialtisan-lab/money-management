import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Search } from 'lucide-react'
import { useSpendingItems } from '../../state/settingsQueries'
import { DEFAULT_ICON, ICONS } from '../../icons/categoryIcons'
import { Pill } from '../../components/ui/Pill'
import { ItemFormSheet } from './ItemFormSheet'
import { cn } from '../../utils/cn'
import type { SpendingItem } from '../../domain/types'

type Filter = 'all' | 'important' | 'not_important'

export function ItemsScreen() {
  const { t } = useTranslation()
  const items = useSpendingItems()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SpendingItem | undefined>()

  const filtered = useMemo(() => {
    return (items ?? []).filter((item) => {
      if (filter !== 'all' && item.importance !== filter) return false
      if (query.trim() && !item.name.toLowerCase().includes(query.trim().toLowerCase())) return false
      return true
    })
  }, [items, filter, query])

  function openNew() {
    setEditingItem(undefined)
    setFormOpen(true)
  }

  function openEdit(item: SpendingItem) {
    setEditingItem(item)
    setFormOpen(true)
  }

  return (
    <div className="space-y-4 px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">{t('items.title')}</h1>
          <p className="mt-1 text-sm text-muted">{t('items.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          aria-label={t('items.addItem')}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-bg"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface-2 px-4 py-3">
        <Search size={16} className="shrink-0 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('common.search')}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>

      <div className="flex gap-2">
        <Pill size="sm" variant={filter === 'all' ? 'dark' : 'outline'} onClick={() => setFilter('all')}>
          {t('common.all')}
        </Pill>
        <Pill size="sm" variant={filter === 'important' ? 'accent' : 'outline'} onClick={() => setFilter('important')}>
          {t('common.important')}
        </Pill>
        <Pill size="sm" variant={filter === 'not_important' ? 'dark' : 'outline'} onClick={() => setFilter('not_important')}>
          {t('common.notImportant')}
        </Pill>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl bg-surface-2 px-4 py-8 text-center text-sm text-muted">{t('items.empty')}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((item) => {
            const Icon = ICONS[item.icon] ?? ICONS[DEFAULT_ICON]
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => openEdit(item)}
                className="flex flex-col items-start gap-2 rounded-2xl bg-surface p-4 text-start"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${item.color}22` }}>
                  <Icon size={18} color={item.color} />
                </span>
                <span className="text-sm font-medium">{item.name}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[11px] font-medium',
                    item.importance === 'important' ? 'bg-accent-soft text-accent-strong' : 'bg-danger-soft text-danger-strong',
                  )}
                >
                  {item.importance === 'important' ? t('common.important') : t('common.notImportant')}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <ItemFormSheet open={formOpen} onClose={() => setFormOpen(false)} editingItem={editingItem} />
    </div>
  )
}
