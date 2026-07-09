import { useTranslation } from 'react-i18next'
import { Card } from '../../components/ui/Card'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { formatAmount } from '../../utils/currency'

interface HeroBalanceCardProps {
  leftBalance: number
  spent: number
  total: number
  currency: string
  language: 'en' | 'ar'
  deltaPct: number | null
  periodLabel: string
}

export function HeroBalanceCard({ leftBalance, spent, total, currency, language, deltaPct, periodLabel }: HeroBalanceCardProps) {
  const { t } = useTranslation()
  const pctSpent = total > 0 ? (spent / total) * 100 : 0
  const overBudget = leftBalance < 0

  return (
    <Card variant="dark" className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium">{periodLabel}</span>
        {deltaPct !== null && (
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${deltaPct > 0 ? 'bg-danger-soft text-danger-strong' : 'bg-accent-soft text-accent-strong'}`}>
            {deltaPct > 0 ? '+' : ''}
            {Math.round(deltaPct)}% {t('home.vsLastPeriod')}
          </span>
        )}
      </div>

      <div className="mt-5">
        <p className="text-4xl font-bold tabular-nums">{formatAmount(leftBalance, currency, language)}</p>
        <p className="mt-1 text-sm text-white/60">{t('home.leftBalance')}</p>
      </div>

      <div className="mt-5">
        <ProgressBar value={pctSpent} tone={overBudget ? 'danger' : 'accent'} trackClassName="bg-white/10" />
        <p className="mt-2 text-xs text-white/60">
          {formatAmount(spent, currency, language)} {t('common.of')} {formatAmount(total, currency, language)} {t('common.spent')}
        </p>
      </div>
    </Card>
  )
}
