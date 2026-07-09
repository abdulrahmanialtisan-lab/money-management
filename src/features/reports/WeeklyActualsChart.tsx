import { useTranslation } from 'react-i18next'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import type { PayPeriodWeek } from '../../domain/types'
import { formatAmount } from '../../utils/currency'

interface WeeklyActualsChartProps {
  weeks: PayPeriodWeek[]
  actuals: number[]
  currency: string
  language: 'en' | 'ar'
}

export function WeeklyActualsChart({ weeks, actuals, currency, language }: WeeklyActualsChartProps) {
  const { t } = useTranslation()

  const data = weeks.map((w, i) => ({
    name: `${t('common.week')} ${i + 1}`,
    budget: w.budget,
    spent: actuals[i] ?? 0,
  }))

  return (
    <div className="h-48 w-full rounded-2xl border border-border bg-surface p-3">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={2}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-muted)' }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => formatAmount(Number(value), currency, language)}
            contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)', fontSize: 12 }}
          />
          <Bar dataKey="budget" fill="var(--color-border)" radius={[6, 6, 0, 0]} />
          <Bar dataKey="spent" fill="var(--color-accent-strong)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
