import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { computeCategoryTrend, computeSpendingForecast } from '../../domain/insights'
import type { Category, PayPeriod, Transaction } from '../../domain/types'
import { formatAmount } from '../../utils/currency'
import { today } from '../../utils/date'

interface InsightsCardProps {
  period: PayPeriod
  transactions: Transaction[]
  previousTransactions: Transaction[]
  categories: Category[]
  itemsById: Map<string, { categoryId?: string }>
  currency: string
  language: 'en' | 'ar'
}

const UNCATEGORIZED_KEY = '__uncategorized__'

function categoryTotals(transactions: Transaction[], itemsById: Map<string, { categoryId?: string }>): Record<string, number> {
  const totals: Record<string, number> = {}
  for (const tx of transactions) {
    const categoryId = tx.categoryIdSnapshot ?? (tx.spendingItemId ? itemsById.get(tx.spendingItemId)?.categoryId : undefined) ?? UNCATEGORIZED_KEY
    totals[categoryId] = (totals[categoryId] ?? 0) + tx.amount
  }
  return totals
}

export function InsightsCard({ period, transactions, previousTransactions, categories, itemsById, currency, language }: InsightsCardProps) {
  const { t } = useTranslation()
  const categoriesById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories])

  const spent = transactions.reduce((sum, tx) => sum + tx.amount, 0)
  const forecast =
    period.status === 'active'
      ? computeSpendingForecast(period.startDate, period.endDate, today(), spent, period.leftoverAfterCommitments)
      : null

  const trend = useMemo(() => {
    const current = categoryTotals(transactions, itemsById)
    const previous = categoryTotals(previousTransactions, itemsById)
    return computeCategoryTrend(current, previous)
  }, [transactions, previousTransactions, itemsById])

  const spike = trend.find((row) => row.deltaAmount > 0 && (row.deltaPct === null || row.deltaPct >= 20) && row.current >= 1)

  const rows: { icon: 'up' | 'down' | 'sparkle'; text: string }[] = []

  if (forecast && !forecast.onTrack) {
    rows.push({
      icon: 'up',
      text: t('reports.insightForecastOver', {
        amount: formatAmount(forecast.projectedTotal, currency, language),
        over: formatAmount(forecast.projectedOverBy, currency, language),
      }),
    })
  } else if (forecast && forecast.daysElapsed >= 2) {
    rows.push({ icon: 'sparkle', text: t('reports.insightForecastOnTrack', { amount: formatAmount(forecast.projectedTotal, currency, language) }) })
  }

  if (spike) {
    const name = spike.key === UNCATEGORIZED_KEY ? t('categories.none') : (categoriesById.get(spike.key)?.name ?? t('categories.none'))
    rows.push({
      icon: 'up',
      text:
        spike.deltaPct === null
          ? t('reports.insightNewCategorySpend', { category: name, amount: formatAmount(spike.current, currency, language) })
          : t('reports.insightCategorySpike', { category: name, pct: spike.deltaPct }),
    })
  }

  const biggestDrop = trend.find((row) => row.deltaAmount < 0 && row.deltaPct !== null && row.deltaPct <= -20)
  if (biggestDrop) {
    const name = biggestDrop.key === UNCATEGORIZED_KEY ? t('categories.none') : (categoriesById.get(biggestDrop.key)?.name ?? t('categories.none'))
    rows.push({ icon: 'down', text: t('reports.insightCategoryDrop', { category: name, pct: Math.abs(biggestDrop.deltaPct!) }) })
  }

  if (rows.length === 0) return null

  return (
    <Card variant="surface" className="space-y-3">
      <p className="text-sm font-medium text-ink-soft">{t('reports.insights')}</p>
      <div className="space-y-2.5">
        {rows.map((row, i) => (
          <div key={i} className="flex items-start gap-2.5 text-sm">
            <span
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: row.icon === 'up' ? 'var(--color-danger-soft)' : row.icon === 'down' ? 'var(--color-accent-soft)' : 'var(--color-accent-soft)',
              }}
            >
              {row.icon === 'up' && <TrendingUp size={13} className="text-danger-strong" />}
              {row.icon === 'down' && <TrendingDown size={13} className="text-accent-strong" />}
              {row.icon === 'sparkle' && <Sparkles size={13} className="text-accent-strong" />}
            </span>
            <p className="leading-snug text-ink-soft">{row.text}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
