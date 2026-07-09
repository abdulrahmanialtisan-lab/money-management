import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useUiStore } from '../../state/uiStore'
import type { SpendingItem } from '../../domain/types'
import { DEFAULT_ICON, ICONS } from '../../icons/categoryIcons'

export function QuickAddGrid({ items }: { items: SpendingItem[] }) {
  const { t } = useTranslation()
  const openAddExpense = useUiStore((s) => s.openAddExpense)
  const topItems = items.slice(0, 3)

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-ink-soft">{t('home.quickAdd')}</p>
      <div className="grid grid-cols-4 gap-2">
        {topItems.map((item) => {
          const Icon = ICONS[item.icon] ?? ICONS[DEFAULT_ICON]
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => openAddExpense(item.id)}
              className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl text-xs font-medium"
              style={{ backgroundColor: `${item.color}22`, color: item.color }}
            >
              <Icon size={20} />
              <span className="truncate px-1 text-ink">{item.name}</span>
            </button>
          )
        })}
        <Link
          to="/items"
          className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl bg-surface-2 text-xs font-medium text-muted"
        >
          <span className="text-lg leading-none">···</span>
          {t('common.all')}
        </Link>
      </div>
    </div>
  )
}
