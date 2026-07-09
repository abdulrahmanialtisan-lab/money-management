import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { Transaction } from '../../domain/types'
import { DEFAULT_ICON, ICONS } from '../../icons/categoryIcons'
import { formatAmount } from '../../utils/currency'

interface CategoryBreakdownProps {
  transactions: Transaction[]
  itemsById: Map<string, { icon: string; color: string; importance: string }>
  currency: string
  language: 'en' | 'ar'
}

export function CategoryBreakdown({ transactions, itemsById, currency, language }: CategoryBreakdownProps) {
  const { t } = useTranslation()

  const rows = useMemo(() => {
    const map = new Map<string, { name: string; amount: number; icon: string; color: string }>()
    for (const tx of transactions) {
      const key = tx.spendingItemId ?? tx.itemNameSnapshot
      const meta = tx.spendingItemId ? itemsById.get(tx.spendingItemId) : undefined
      const existing = map.get(key)
      if (existing) {
        existing.amount += tx.amount
      } else {
        map.set(key, { name: tx.itemNameSnapshot, amount: tx.amount, icon: meta?.icon ?? DEFAULT_ICON, color: meta?.color ?? '#8a8a86' })
      }
    }
    return [...map.values()].sort((a, b) => b.amount - a.amount)
  }, [transactions, itemsById])

  const maxAmount = Math.max(1, ...rows.map((r) => r.amount))

  if (rows.length === 0) {
    return <p className="rounded-2xl bg-surface-2 px-4 py-6 text-center text-sm text-muted">{t('reports.noData')}</p>
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const Icon = ICONS[row.icon] ?? ICONS[DEFAULT_ICON]
        return (
          <div key={row.name} className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${row.color}22` }}>
              <Icon size={16} color={row.color} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate font-medium">{row.name}</span>
                <span className="shrink-0 tabular-nums">{formatAmount(row.amount, currency, language)}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full" style={{ width: `${(row.amount / maxAmount) * 100}%`, backgroundColor: row.color }} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
