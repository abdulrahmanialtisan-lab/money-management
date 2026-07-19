import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { Category, Transaction } from '../../domain/types'
import { DEFAULT_ICON, ICONS } from '../../icons/categoryIcons'
import { formatAmount } from '../../utils/currency'

interface CategoryPieChartProps {
  transactions: Transaction[]
  categories: Category[]
  itemsById: Map<string, { categoryId?: string }>
  currency: string
  language: 'en' | 'ar'
}

const UNCATEGORIZED_KEY = '__uncategorized__'

export function CategoryPieChart({ transactions, categories, itemsById, currency, language }: CategoryPieChartProps) {
  const { t } = useTranslation()
  const categoriesById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const rows = useMemo(() => {
    const totals = new Map<string, number>()
    for (const tx of transactions) {
      const categoryId = tx.categoryIdSnapshot ?? (tx.spendingItemId ? itemsById.get(tx.spendingItemId)?.categoryId : undefined) ?? UNCATEGORIZED_KEY
      totals.set(categoryId, (totals.get(categoryId) ?? 0) + tx.amount)
    }
    return [...totals.entries()]
      .map(([key, amount]) => ({
        key,
        amount,
        name: key === UNCATEGORIZED_KEY ? t('categories.none') : (categoriesById.get(key)?.name ?? t('categories.none')),
        color: key === UNCATEGORIZED_KEY ? '#8a8a86' : (categoriesById.get(key)?.color ?? '#8a8a86'),
        icon: key === UNCATEGORIZED_KEY ? DEFAULT_ICON : (categoriesById.get(key)?.icon ?? DEFAULT_ICON),
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [transactions, itemsById, categoriesById, t])

  const total = rows.reduce((sum, r) => sum + r.amount, 0)

  if (rows.length === 0) {
    return <p className="rounded-2xl bg-surface-2 px-4 py-6 text-center text-sm text-muted">{t('reports.noData')}</p>
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-3">
      <div className="flex items-center gap-4">
        <div className="h-32 w-32 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={rows} dataKey="amount" nameKey="name" innerRadius={30} outerRadius={56} paddingAngle={2}>
                {rows.map((row) => (
                  <Cell key={row.key} fill={row.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatAmount(Number(value), currency, language)} contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          {rows.slice(0, 5).map((row) => {
            const Icon = ICONS[row.icon] ?? ICONS[DEFAULT_ICON]
            const pct = total > 0 ? Math.round((row.amount / total) * 100) : 0
            return (
              <div key={row.key} className="flex items-center gap-2 text-xs">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${row.color}22` }}>
                  <Icon size={12} color={row.color} />
                </span>
                <span className="min-w-0 flex-1 truncate">{row.name}</span>
                <span className="shrink-0 tabular-nums text-muted">{pct}%</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
