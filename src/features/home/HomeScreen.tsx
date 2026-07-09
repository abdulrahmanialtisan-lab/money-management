import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Pill } from '../../components/ui/Pill'
import {
  useActivePeriod,
  useAllPeriods,
  useRecentTransactions,
  useSettingsState,
  useSpendingItems,
  useTransactionsForPeriod,
} from '../../state/settingsQueries'
import { computeRolledOverBudgets } from '../../domain/weeklyBudget'
import { BankBalanceCard } from './BankBalanceCard'
import { HeroBalanceCard } from './HeroBalanceCard'
import { WeeklyBudgetCard } from './WeeklyBudgetCard'
import { QuickAddGrid } from './QuickAddGrid'
import { RecentTransactionsList } from './RecentTransactionsList'
import { formatAmount } from '../../utils/currency'
import { dateLocale, diffInDays, fromDateKey, today } from '../../utils/date'

export function HomeScreen() {
  const { t } = useTranslation()
  const settingsState = useSettingsState()
  const activePeriod = useActivePeriod()
  const allPeriods = useAllPeriods()
  const periodTransactions = useTransactionsForPeriod(activePeriod?.id)
  const recentTransactions = useRecentTransactions(6)
  const items = useSpendingItems()

  if (settingsState === 'loading' || settingsState === 'not-found' || !activePeriod) {
    return <div className="p-5 text-sm text-muted">{t('common.loading')}</div>
  }

  const language = settingsState.language as 'en' | 'ar'
  const currency = settingsState.currency
  const spent = (periodTransactions ?? []).reduce((sum, tx) => sum + tx.amount, 0)
  const leftBalance = activePeriod.leftoverAfterCommitments - spent

  const previousClosed = (allPeriods ?? []).find((p) => p.status === 'closed')
  const deltaPct =
    previousClosed?.closedSummary && previousClosed.closedSummary.totalSpent > 0
      ? ((spent - previousClosed.closedSummary.totalSpent) / previousClosed.closedSummary.totalSpent) * 100
      : null

  const todayKey = today()
  const foundWeekIndex = activePeriod.weeks.findIndex((w) => w.startDate <= todayKey && todayKey <= w.endDate)
  const currentWeekIndex = foundWeekIndex >= 0 ? foundWeekIndex : activePeriod.weeks.length - 1
  const currentWeek = activePeriod.weeks[currentWeekIndex]
  const weeklyActuals = activePeriod.weeks.map((w) =>
    (periodTransactions ?? []).filter((tx) => tx.date >= w.startDate && tx.date <= w.endDate).reduce((sum, tx) => sum + tx.amount, 0),
  )
  const effectiveWeeklyBudgets = computeRolledOverBudgets(activePeriod.weeks, weeklyActuals)
  const weekSpent = weeklyActuals[currentWeekIndex]
  const weekBudget = effectiveWeeklyBudgets[currentWeekIndex]
  const daysLeft = Math.max(0, diffInDays(todayKey, currentWeek.endDate) + 1)

  const periodLabel = fromDateKey(activePeriod.startDate).toLocaleDateString(dateLocale(language), {
    month: 'long',
  })

  const itemsById = new Map((items ?? []).map((i) => [i.id, { icon: i.icon, color: i.color }]))

  return (
    <div className="space-y-4 px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <HeroBalanceCard
        leftBalance={leftBalance}
        spent={spent}
        total={activePeriod.leftoverAfterCommitments}
        currency={currency}
        language={language}
        deltaPct={deltaPct}
        periodLabel={periodLabel}
      />

      <BankBalanceCard bankBalance={settingsState.bankBalance ?? 0} currency={currency} />

      <WeeklyBudgetCard
        weekSpent={weekSpent}
        weekBudget={weekBudget}
        plannedBudget={currentWeek.budget}
        daysLeft={daysLeft}
        currency={currency}
        language={language}
      />

      <Link to="/commitments">
        <Pill variant="dark" className="w-full justify-between bg-[#0b0f0d] px-5 text-[#f5f5f1] ring-1 ring-white/10">
          <span>{t('home.commitmentsQuick')}</span>
          <span className="flex items-center gap-2">
            <span className="text-xs text-white/60">{formatAmount(activePeriod.totalCommitments, currency, language)}</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-[#0b0f0d]">
              <ChevronRight size={14} className="rtl:rotate-180" />
            </span>
          </span>
        </Pill>
      </Link>

      {(items ?? []).length > 0 && <QuickAddGrid items={items ?? []} />}

      <Card variant="surface">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-ink-soft">{t('home.recentActivity')}</p>
          <Link to="/reports" className="text-xs font-medium text-accent-strong">
            {t('common.all')}
          </Link>
        </div>
        <RecentTransactionsList transactions={recentTransactions ?? []} itemsById={itemsById} currency={currency} language={language} />
      </Card>
    </div>
  )
}
