import { useTranslation } from 'react-i18next'
import { Card } from '../../components/ui/Card'
import { DonutRing } from '../../components/ui/DonutRing'
import { formatAmount } from '../../utils/currency'

interface WeeklyBudgetCardProps {
  weekSpent: number
  weekBudget: number
  plannedBudget: number
  daysLeft: number
  currency: string
  language: 'en' | 'ar'
}

export function WeeklyBudgetCard({ weekSpent, weekBudget, plannedBudget, daysLeft, currency, language }: WeeklyBudgetCardProps) {
  const { t } = useTranslation()
  const pct = weekBudget > 0 ? (weekSpent / weekBudget) * 100 : 0
  const over = weekSpent > weekBudget
  const rollover = Math.round((weekBudget - plannedBudget) * 100) / 100

  return (
    <Card variant="surface" className="flex items-center gap-4">
      <DonutRing value={Math.min(pct, 100)} size={96} strokeWidth={10} tone={over ? 'danger' : 'accent'}>
        <span className="text-sm font-bold tabular-nums">{Math.round(pct)}%</span>
      </DonutRing>
      <div className="flex-1">
        <p className="text-sm font-medium text-ink-soft">{t('home.weeklyBudget')}</p>
        <p className="mt-1 text-xl font-bold tabular-nums">{formatAmount(weekBudget - weekSpent, currency, language)}</p>
        <p className="text-xs text-muted">
          {formatAmount(weekSpent, currency, language)} {t('common.of')} {formatAmount(weekBudget, currency, language)}
        </p>
        <p className={`mt-1 text-xs font-medium ${over ? 'text-danger-strong' : 'text-muted'}`}>
          {over ? t('home.overspentWeek') : t('home.daysLeftInWeek', { count: daysLeft })}
        </p>
        {rollover !== 0 && (
          <p className={`mt-0.5 text-xs font-medium ${rollover > 0 ? 'text-accent-strong' : 'text-danger-strong'}`}>
            {rollover > 0
              ? t('home.rolloverSurplus', { amount: formatAmount(rollover, currency, language) })
              : t('home.rolloverDeficit', { amount: formatAmount(Math.abs(rollover), currency, language) })}
          </p>
        )}
      </div>
    </Card>
  )
}
