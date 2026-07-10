import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { Pill } from '../../components/ui/Pill'
import type { Transaction } from '../../domain/types'
import { DEFAULT_ICON, ICONS } from '../../icons/categoryIcons'
import { formatAmount } from '../../utils/currency'
import { useUiStore } from '../../state/uiStore'

interface HistoryListProps {
  transactions: Transaction[]
  itemsById: Map<string, { icon: string; color: string }>
  currency: string
  language: 'en' | 'ar'
}

type Filter = 'all' | 'important' | 'not_important'

export function HistoryList({ transactions, itemsById, currency, language }: HistoryListProps) {
  const { t } = useTranslation()
  const openTransactionDetail = useUiStore((s) => s.openTransactionDetail)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (filter !== 'all' && tx.importanceSnapshot !== filter) return false
      if (query.trim() && !tx.itemNameSnapshot.toLowerCase().includes(query.trim().toLowerCase())) return false
      return true
    })
  }, [transactions, filter, query])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface-2 px-4 py-3">
        <Search size={16} className="shrink-0 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('reports.searchHistory')}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>
      <div className="flex gap-2">
        <Pill size="sm" variant={filter === 'all' ? 'dark' : 'outline'} onClick={() => setFilter('all')}>
          {t('reports.filterAll')}
        </Pill>
        <Pill size="sm" variant={filter === 'important' ? 'accent' : 'outline'} onClick={() => setFilter('important')}>
          {t('reports.filterImportant')}
        </Pill>
        <Pill size="sm" variant={filter === 'not_important' ? 'dark' : 'outline'} onClick={() => setFilter('not_important')}>
          {t('reports.filterNotImportant')}
        </Pill>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl bg-surface-2 px-4 py-6 text-center text-sm text-muted">{t('reports.noData')}</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((tx) => {
            const meta = tx.spendingItemId ? itemsById.get(tx.spendingItemId) : undefined
            const Icon = ICONS[meta?.icon ?? DEFAULT_ICON]
            const color = meta?.color ?? '#8a8a86'
            return (
              <button
                type="button"
                key={tx.id}
                onClick={() => openTransactionDetail(tx.id)}
                className="flex w-full items-center gap-3 rounded-2xl bg-surface px-3 py-3 text-start"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}22` }}>
                  <Icon size={16} color={color} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{tx.itemNameSnapshot}</p>
                  <p className="text-xs text-muted">{tx.date}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums">{formatAmount(tx.amount, currency, language)}</p>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
