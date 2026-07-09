import { useTranslation } from 'react-i18next'
import type { Transaction } from '../../domain/types'
import { DEFAULT_ICON, ICONS } from '../../icons/categoryIcons'
import { formatAmount } from '../../utils/currency'
import { addDays, today } from '../../utils/date'

interface RecentTransactionsListProps {
  transactions: Transaction[]
  itemsById: Map<string, { icon: string; color: string }>
  currency: string
  language: 'en' | 'ar'
}

export function RecentTransactionsList({ transactions, itemsById, currency, language }: RecentTransactionsListProps) {
  const { t } = useTranslation()

  if (transactions.length === 0) {
    return <p className="rounded-2xl bg-surface-2 px-4 py-6 text-center text-sm text-muted">{t('home.noTransactionsYet')}</p>
  }

  const todayKey = today()
  const yesterdayKey = addDays(todayKey, -1)

  return (
    <div className="space-y-2">
      {transactions.map((tx) => {
        const meta = tx.spendingItemId ? itemsById.get(tx.spendingItemId) : undefined
        const Icon = ICONS[meta?.icon ?? DEFAULT_ICON]
        const color = meta?.color ?? '#8a8a86'
        const dateLabel = tx.date === todayKey ? t('common.today') : tx.date === yesterdayKey ? t('common.yesterday') : tx.date

        return (
          <div key={tx.id} className="flex items-center gap-3 rounded-2xl bg-surface px-3 py-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: `${color}22` }}>
              <Icon size={18} color={color} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{tx.itemNameSnapshot}</p>
              <p className="text-xs text-muted">{dateLabel}</p>
            </div>
            <p className="shrink-0 text-sm font-semibold tabular-nums">{formatAmount(tx.amount, currency, language)}</p>
          </div>
        )
      })}
    </div>
  )
}
