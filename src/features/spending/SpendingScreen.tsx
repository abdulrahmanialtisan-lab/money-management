import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowDownLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import {
  useActivePeriod,
  useAllPeriods,
  useSettingsState,
  useSpendingItems,
  useTransactionsForPeriod,
  useTransactionsInRange,
} from '../../state/settingsQueries'
import { computeRolledOverBudgets } from '../../domain/weeklyBudget'
import type { PayPeriod, Transaction } from '../../domain/types'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { DailySpendingChart } from './DailySpendingChart'
import { DEFAULT_ICON, ICONS } from '../../icons/categoryIcons'
import { formatAmount } from '../../utils/currency'
import { addDays, compareDateKeys, dateLocale, fromDateKey, today } from '../../utils/date'

interface FlatWeek {
  periodId: string
  weekIndex: number
  startDate: string
  endDate: string
  budget: number
}

function flattenWeeks(periods: PayPeriod[]): FlatWeek[] {
  const sorted = [...periods].sort((a, b) => compareDateKeys(a.startDate, b.startDate))
  const list: FlatWeek[] = []
  for (const period of sorted) {
    for (const w of period.weeks) {
      list.push({ periodId: period.id, weekIndex: w.index, startDate: w.startDate, endDate: w.endDate, budget: w.budget })
    }
  }
  return list
}

export function SpendingScreen() {
  const { t } = useTranslation()
  const settingsState = useSettingsState()
  const allPeriods = useAllPeriods()
  const activePeriod = useActivePeriod()
  const activePeriodTransactions = useTransactionsForPeriod(activePeriod?.id)
  const items = useSpendingItems(true)

  const [manualIndex, setManualIndex] = useState<number | null>(null)
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)

  const flatWeeks = useMemo(() => flattenWeeks(allPeriods ?? []), [allPeriods])

  const todayKey = today()
  const defaultIndex = useMemo(() => {
    if (flatWeeks.length === 0) return 0
    const idx = flatWeeks.findIndex((w) => w.startDate <= todayKey && todayKey <= w.endDate)
    return idx >= 0 ? idx : flatWeeks.length - 1
  }, [flatWeeks, todayKey])

  const currentIndex = Math.min(Math.max(manualIndex ?? defaultIndex, 0), Math.max(flatWeeks.length - 1, 0))
  const currentWeek = flatWeeks[currentIndex] as FlatWeek | undefined
  const previousWeek = currentIndex > 0 ? flatWeeks[currentIndex - 1] : undefined

  const rangeStart = previousWeek?.startDate ?? currentWeek?.startDate
  const rangeTransactions = useTransactionsInRange(rangeStart ?? todayKey, currentWeek?.endDate ?? todayKey)

  const itemsById = useMemo(() => new Map((items ?? []).map((i) => [i.id, i])), [items])

  if (settingsState === 'loading' || settingsState === 'not-found' || !currentWeek) {
    return <div className="p-5 text-sm text-muted">{t('common.loading')}</div>
  }

  const { currency, language } = settingsState
  const locale = language as 'en' | 'ar'

  const owningPeriod = (allPeriods ?? []).find((p) => p.id === currentWeek.periodId)
  let effectiveBudget = currentWeek.budget
  if (owningPeriod) {
    const weeklyActuals =
      owningPeriod.status === 'active'
        ? owningPeriod.weeks.map((w) =>
            (activePeriodTransactions ?? []).filter((tx) => tx.date >= w.startDate && tx.date <= w.endDate).reduce((s, tx) => s + tx.amount, 0),
          )
        : (owningPeriod.closedSummary?.weeklyActuals ?? owningPeriod.weeks.map(() => 0))
    const effective = computeRolledOverBudgets(owningPeriod.weeks, weeklyActuals)
    effectiveBudget = effective[currentWeek.weekIndex] ?? currentWeek.budget
  }

  const dateKeys: string[] = []
  for (let d = currentWeek.startDate; compareDateKeys(d, currentWeek.endDate) <= 0; d = addDays(d, 1)) {
    dateKeys.push(d)
  }

  const txByDate = new Map<string, Transaction[]>()
  for (const tx of rangeTransactions ?? []) {
    const list = txByDate.get(tx.date) ?? []
    list.push(tx)
    txByDate.set(tx.date, list)
  }

  const amounts = dateKeys.map((d) => (txByDate.get(d) ?? []).reduce((s, tx) => s + tx.amount, 0))
  const weekSpent = amounts.reduce((s, a) => s + a, 0)

  const previousWeekSpent = previousWeek
    ? (rangeTransactions ?? [])
        .filter((tx) => tx.date >= previousWeek.startDate && tx.date <= previousWeek.endDate)
        .reduce((s, tx) => s + tx.amount, 0)
    : null

  const delta = previousWeekSpent !== null ? weekSpent - previousWeekSpent : null

  const activeSelectedDate = selectedDateKey && dateKeys.includes(selectedDateKey) ? selectedDateKey : dateKeys.includes(todayKey) ? todayKey : dateKeys[0]
  const selectedTx = (txByDate.get(activeSelectedDate) ?? []).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  const pctSpent = effectiveBudget > 0 ? (weekSpent / effectiveBudget) * 100 : 0

  function goPrev() {
    setManualIndex(Math.max(currentIndex - 1, 0))
    setSelectedDateKey(null)
  }
  function goNext() {
    setManualIndex(Math.min(currentIndex + 1, flatWeeks.length - 1))
    setSelectedDateKey(null)
  }

  return (
    <div className="space-y-4 px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <h1 className="text-xl font-bold">{t('spending.title')}</h1>

      <div className="rounded-[1.75rem] bg-[#0b0f0d] p-5 text-[#f5f5f1] ring-1 ring-white/10">
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/60">{t('spending.weeklySpend')}</p>
          <div className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1">
            <button type="button" onClick={goPrev} disabled={currentIndex === 0} className="flex h-7 w-7 items-center justify-center rounded-full disabled:opacity-30">
              <ChevronRight size={14} className="rtl:hidden" />
              <ChevronLeft size={14} className="hidden rtl:block" />
            </button>
            <span className="min-w-28 text-center text-xs font-medium">
              {fromDateKey(currentWeek.startDate).toLocaleDateString(dateLocale(locale), { day: 'numeric', month: 'short' })}
              {' — '}
              {fromDateKey(currentWeek.endDate).toLocaleDateString(dateLocale(locale), { day: 'numeric', month: 'short' })}
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={currentIndex === flatWeeks.length - 1}
              className="flex h-7 w-7 items-center justify-center rounded-full disabled:opacity-30"
            >
              <ChevronLeft size={14} className="rtl:hidden" />
              <ChevronRight size={14} className="hidden rtl:block" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-danger-soft text-danger-strong">
            <ArrowDownLeft size={16} />
          </span>
          <span className="text-3xl font-bold tabular-nums">{formatAmount(weekSpent, currency, locale)}</span>
        </div>

        <div className="mt-4">
          <ProgressBar value={Math.min(pctSpent, 100)} tone={weekSpent > effectiveBudget ? 'danger' : 'accent'} trackClassName="bg-white/10" />
          <p className="mt-2 text-xs text-white/60">
            {formatAmount(weekSpent, currency, locale)} {t('common.of')} {formatAmount(effectiveBudget, currency, locale)} {t('spending.budget')}
          </p>
        </div>
      </div>

      <DailySpendingChart
        dateKeys={dateKeys}
        amounts={amounts}
        selectedDateKey={activeSelectedDate}
        onSelectDay={setSelectedDateKey}
        currency={currency}
        language={locale}
      />

      {delta !== null && (
        <div className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium ${delta <= 0 ? 'bg-accent-soft text-accent-strong' : 'bg-danger-soft text-danger-strong'}`}>
          <span>✨</span>
          {delta <= 0
            ? t('spending.lessThanLastWeek', { amount: formatAmount(Math.abs(delta), currency, locale) })
            : t('spending.moreThanLastWeek', { amount: formatAmount(delta, currency, locale) })}
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-medium text-ink-soft">
          {fromDateKey(activeSelectedDate).toLocaleDateString(dateLocale(locale), { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        {selectedTx.length === 0 ? (
          <p className="rounded-2xl bg-surface-2 px-4 py-6 text-center text-sm text-muted">{t('calendar.noExpensesThisDay')}</p>
        ) : (
          <div className="space-y-2">
            {selectedTx.map((tx) => {
              const item = tx.spendingItemId ? itemsById.get(tx.spendingItemId) : undefined
              const Icon = ICONS[item?.icon ?? DEFAULT_ICON]
              return (
                <div key={tx.id} className="flex items-center gap-3 rounded-2xl bg-surface px-3 py-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: `${item?.color ?? '#8a8a86'}22` }}>
                    <Icon size={16} color={item?.color ?? '#8a8a86'} />
                  </span>
                  <span className="flex-1 truncate text-sm font-medium">{tx.itemNameSnapshot}</span>
                  <span className="text-sm font-semibold tabular-nums">{formatAmount(tx.amount, currency, locale)}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
