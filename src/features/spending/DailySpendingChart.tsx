import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { formatAmount } from '../../utils/currency'
import { dateLocale, fromDateKey } from '../../utils/date'

interface DailySpendingChartProps {
  dateKeys: string[]
  amounts: number[]
  selectedDateKey: string
  onSelectDay: (dateKey: string) => void
  currency: string
  language: 'en' | 'ar'
}

export function DailySpendingChart({ dateKeys, amounts, selectedDateKey, onSelectDay, currency, language }: DailySpendingChartProps) {
  const data = dateKeys.map((dateKey, i) => ({
    dateKey,
    name: fromDateKey(dateKey).toLocaleDateString(dateLocale(language), { weekday: 'short' }),
    amount: amounts[i] ?? 0,
  }))

  return (
    <div>
      <div className="h-40 w-full rounded-2xl border border-border bg-surface p-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={2}>
            <XAxis dataKey="name" tick={false} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value) => formatAmount(Number(value), currency, language)}
              contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)', fontSize: 12 }}
            />
            <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.dateKey} fill={d.dateKey === selectedDateKey ? 'var(--color-accent-strong)' : 'var(--color-border)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${dateKeys.length}, minmax(0, 1fr))` }}>
        {data.map((d) => (
          <button
            key={d.dateKey}
            type="button"
            onClick={() => onSelectDay(d.dateKey)}
            className={`rounded-lg py-1.5 text-xs font-medium ${
              d.dateKey === selectedDateKey ? 'bg-ink text-bg' : 'text-muted'
            }`}
          >
            {d.name}
          </button>
        ))}
      </div>
    </div>
  )
}
