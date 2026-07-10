import { useTranslation } from 'react-i18next'
import { Card } from '../../components/ui/Card'
import { ArcGauge } from '../../components/ui/ArcGauge'
import { formatAmount } from '../../utils/currency'

interface WeeklyBudgetCardProps {
  weekSpent: number
  weekBudget: number
  plannedBudget: number
  daysLeft: number
  currency: string
  language: 'en' | 'ar'
}

function amountFontSizeClass(text: string): string {
  if (text.length <= 10) return 'text-3xl'
  if (text.length <= 13) return 'text-2xl'
  return 'text-xl'
}

export function WeeklyBudgetCard({ weekSpent, weekBudget, plannedBudget, daysLeft, currency, language }: WeeklyBudgetCardProps) {
  const { t } = useTranslation()
  const pct = weekBudget > 0 ? (weekSpent / weekBudget) * 100 : 0
  const over = weekSpent > weekBudget
  const rollover = Math.round((weekBudget - plannedBudget) * 100) / 100
  const spentText = formatAmount(weekSpent, currency, language)

  return (
    <Card variant="surface" className="flex flex-col items-center text-center">
      <p className="self-start text-sm font-medium text-ink-soft">{t('home.weeklyBudget')}</p>

      <ArcGauge value={Math.min(pct, 100)} size={220} strokeWidth={16} tone={over ? 'danger' : 'accent'}>
        <span className="text-xs text-muted">{t('home.totalExpensedThisWeek')}</span>
        <span className={`mt-1 whitespace-nowrap font-bold tabular-nums ${amountFontSizeClass(spentText)}`}>{spentText}</span>
        <span className="mt-1 text-xs text-muted">
          {t('common.of')} {formatAmount(weekBudget, currency, language)}
        </span>
      </ArcGauge>

      <p className={`-mt-2 text-xs font-medium ${over ? 'text-danger-strong' : 'text-muted'}`}>
        {over ? t('home.overspentWeek') : t('home.daysLeftInWeek', { count: daysLeft })}
      </p>
      {rollover !== 0 && (
        <p className={`mt-0.5 text-xs font-medium ${rollover > 0 ? 'text-accent-strong' : 'text-danger-strong'}`}>
          {rollover > 0
            ? t('home.rolloverSurplus', { amount: formatAmount(rollover, currency, language) })
            : t('home.rolloverDeficit', { amount: formatAmount(Math.abs(rollover), currency, language) })}
        </p>
      )}
    </Card>
  )
}
