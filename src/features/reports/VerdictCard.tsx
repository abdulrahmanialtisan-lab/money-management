import { useTranslation } from 'react-i18next'
import { Card } from '../../components/ui/Card'
import type { VerdictResult } from '../../domain/verdict'
import { formatAmount } from '../../utils/currency'

interface VerdictCardProps {
  verdict: VerdictResult
  delta: { deltaPct: number; direction: 'up' | 'down' | 'flat' } | null
  currency: string
  language: 'en' | 'ar'
}

export function VerdictCard({ verdict, delta, currency, language }: VerdictCardProps) {
  const { t } = useTranslation()

  const titleKey =
    verdict.color === 'green'
      ? 'reports.verdictImportantTitle'
      : verdict.color === 'red'
        ? 'reports.verdictUnimportantTitle'
        : 'reports.verdictNeutralTitle'

  return (
    <Card variant={verdict.color === 'green' ? 'accent' : verdict.color === 'red' ? 'surface' : 'surface'} className={verdict.color === 'red' ? 'bg-danger-soft' : undefined}>
      <div className="flex items-start justify-between">
        {verdict.importantPct !== null && <span className="text-5xl font-bold tabular-nums">{verdict.importantPct}%</span>}
        {delta && (
          <span className="rounded-full bg-black/10 px-3 py-1 text-xs font-medium">
            {t('reports.vsLastPeriod', { direction: delta.direction === 'up' ? '+' : delta.direction === 'down' ? '−' : '±', pct: delta.deltaPct })}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm font-medium">{t(titleKey)}</p>
      <div className="mt-4 flex gap-4 text-xs">
        <span>
          {t('common.important')}: {formatAmount(verdict.importantSpent, currency, language)}
        </span>
        <span>
          {t('common.notImportant')}: {formatAmount(verdict.unimportantSpent, currency, language)}
        </span>
      </div>
    </Card>
  )
}
