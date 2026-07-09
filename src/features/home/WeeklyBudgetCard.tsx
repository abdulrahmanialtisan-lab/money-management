import { useTranslation } from 'react-i18next'
import { Card } from '../../components/ui/Card'
import { DonutRing } from '../../components/ui/DonutRing'
import { formatAmount } from '../../utils/currency'

interface WeeklyBudgetCardProps {
  weekSpent: number
  weekBudget: number
  daysLeft: number
  currency: string
  language: 'en' | 'ar'
}

export function WeeklyBudgetCard({ weekSpent, weekBudget, daysLeft, currency, language }: WeeklyBudgetCardProps) {
  const { t } = useTranslation()
  const pct = weekBudget > 0 ? (weekSpent / weekBudget) * 100 : 0
  const over = weekSpent > weekBudget

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
      </div>
    </Card>
  )
}
