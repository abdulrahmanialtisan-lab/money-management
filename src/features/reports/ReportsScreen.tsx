import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { computeVerdict, comparePeriods } from '../../domain/verdict'
import { computeRolledOverBudgets } from '../../domain/weeklyBudget'
import { useAllPeriods, useSettingsState, useSpendingItems, useTransactionsForPeriod } from '../../state/settingsQueries'
import { VerdictCard } from './VerdictCard'
import { CategoryBreakdown } from './CategoryBreakdown'
import { WeeklyActualsChart } from './WeeklyActualsChart'
import { HistoryList } from './HistoryList'
import { Select } from '../../components/ui/Select'
import { dateLocale, fromDateKey } from '../../utils/date'

export function ReportsScreen() {
  const { t } = useTranslation()
  const settingsState = useSettingsState()
  const allPeriods = useAllPeriods()
  const items = useSpendingItems(true)

  const [selectedPeriodId, setSelectedPeriodId] = useState<string | undefined>()
  const activePeriodFallback = (allPeriods ?? [])[0]
  const periodId = selectedPeriodId ?? activePeriodFallback?.id
  const period = (allPeriods ?? []).find((p) => p.id === periodId)
  const periodIndex = (allPeriods ?? []).findIndex((p) => p.id === periodId)
  const previousPeriod = periodIndex >= 0 ? (allPeriods ?? [])[periodIndex + 1] : undefined

  const transactions = useTransactionsForPeriod(period?.id)
  const previousTransactions = useTransactionsForPeriod(previousPeriod?.id)

  const itemsById = useMemo(() => new Map((items ?? []).map((i) => [i.id, i])), [items])

  if (settingsState === 'loading' || settingsState === 'not-found' || !period) {
    return <div className="p-5 text-sm text-muted">{t('common.loading')}</div>
  }

  const { currency, language, importantTargetRatio } = settingsState

  const verdict = computeVerdict(
    (transactions ?? []).map((tx) => ({ importanceSnapshot: tx.importanceSnapshot, amount: tx.amount })),
    importantTargetRatio,
  )
  const previousVerdict = previousTransactions
    ? computeVerdict(
        previousTransactions.map((tx) => ({ importanceSnapshot: tx.importanceSnapshot, amount: tx.amount })),
        importantTargetRatio,
      )
    : null
  const delta = comparePeriods(verdict.importantPct, previousVerdict?.importantPct ?? null)

  const weeklyActuals = period.weeks.map((w) =>
    (transactions ?? []).filter((tx) => tx.date >= w.startDate && tx.date <= w.endDate).reduce((sum, tx) => sum + tx.amount, 0),
  )
  const effectiveWeeklyBudgets = computeRolledOverBudgets(period.weeks, weeklyActuals)
  const weeksWithRollover = period.weeks.map((w, i) => ({ ...w, budget: effectiveWeeklyBudgets[i] }))

  const periodOptions = (allPeriods ?? []).map((p) => ({
    value: p.id,
    label: `${fromDateKey(p.startDate).toLocaleDateString(dateLocale(language), { month: 'short', day: 'numeric' })} — ${fromDateKey(p.endDate).toLocaleDateString(dateLocale(language), { month: 'short', day: 'numeric' })}${p.status === 'active' ? ` (${t('reports.currentPeriod')})` : ''}`,
  }))

  return (
    <div className="space-y-5 px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('reports.title')}</h1>
      </div>

      <Select value={period.id} onChange={setSelectedPeriodId} options={periodOptions} />

      <VerdictCard verdict={verdict} delta={delta} currency={currency} language={language as 'en' | 'ar'} />

      <div>
        <p className="mb-2 text-sm font-medium text-ink-soft">{t('reports.weeklyActuals')}</p>
        <WeeklyActualsChart weeks={weeksWithRollover} actuals={weeklyActuals} currency={currency} language={language as 'en' | 'ar'} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-ink-soft">{t('reports.categoryBreakdown')}</p>
        <CategoryBreakdown transactions={transactions ?? []} itemsById={itemsById} currency={currency} language={language as 'en' | 'ar'} />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-ink-soft">{t('reports.history')}</p>
        <HistoryList transactions={transactions ?? []} itemsById={itemsById} currency={currency} language={language as 'en' | 'ar'} />
      </div>
    </div>
  )
}
