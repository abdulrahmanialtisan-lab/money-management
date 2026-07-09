import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSettingsState, useSpendingItems, useTransactionsInRange } from '../../state/settingsQueries'
import { DEFAULT_ICON, ICONS } from '../../icons/categoryIcons'
import { formatAmount } from '../../utils/currency'
import { toDateKey, today } from '../../utils/date'
import { cn } from '../../utils/cn'
import { computeVerdict } from '../../domain/verdict'
import type { Transaction } from '../../domain/types'

export function CalendarScreen() {
  const { t } = useTranslation()
  const settingsState = useSettingsState()
  const items = useSpendingItems()
  const [viewedMonth, setViewedMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState(today())

  const monthStart = toDateKey(viewedMonth)
  const monthEndDate = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() + 1, 0)
  const monthEnd = toDateKey(monthEndDate)
  const transactions = useTransactionsInRange(monthStart, monthEnd)

  const weekStartDay = settingsState !== 'loading' && settingsState !== 'not-found' ? settingsState.weekStartDay : 6
  const language = settingsState !== 'loading' && settingsState !== 'not-found' ? (settingsState.language as 'en' | 'ar') : 'en'
  const currency = settingsState !== 'loading' && settingsState !== 'not-found' ? settingsState.currency : ''

  const txByDay = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    for (const tx of transactions ?? []) {
      const list = map.get(tx.date) ?? []
      list.push(tx)
      map.set(tx.date, list)
    }
    return map
  }, [transactions])

  const itemsById = useMemo(() => new Map((items ?? []).map((i) => [i.id, i])), [items])

  const cells = useMemo(() => {
    const firstDow = viewedMonth.getDay()
    const leadingBlank = (firstDow - weekStartDay + 7) % 7
    const totalDays = monthEndDate.getDate()
    const list: Array<{ dateKey: string; day: number } | null> = []
    for (let i = 0; i < leadingBlank; i++) list.push(null)
    for (let d = 1; d <= totalDays; d++) {
      list.push({ dateKey: toDateKey(new Date(viewedMonth.getFullYear(), viewedMonth.getMonth(), d)), day: d })
    }
    while (list.length % 7 !== 0) list.push(null)
    return list
  }, [viewedMonth, weekStartDay, monthEndDate])

  const weekdayLabels = useMemo(() => {
    const base = new Date(2026, 0, 4) // a Sunday
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base)
      d.setDate(base.getDate() + ((weekStartDay + i) % 7))
      return d.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'narrow' })
    })
  }, [weekStartDay, language])

  function dayColor(dayTx: Transaction[] | undefined): string | null {
    if (!dayTx || dayTx.length === 0) return null
    const verdict = computeVerdict(
      dayTx.map((tx) => ({ importanceSnapshot: tx.importanceSnapshot, amount: tx.amount })),
      50,
    )
    if (verdict.color === 'green') return 'var(--color-accent-strong)'
    if (verdict.color === 'red') return 'var(--color-danger-strong)'
    return 'var(--color-muted)'
  }

  function changeMonth(delta: number) {
    setViewedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  const selectedTx = txByDay.get(selectedDate) ?? []
  const selectedTotal = selectedTx.reduce((sum, tx) => sum + tx.amount, 0)
  const selectedDateObj = new Date(selectedDate + 'T00:00:00')

  return (
    <div className="space-y-4 px-4 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('calendar.title')}</h1>
        <div className="flex items-center gap-1 rounded-full bg-surface-2 px-2 py-1">
          <button type="button" onClick={() => changeMonth(-1)} className="flex h-8 w-8 items-center justify-center rounded-full">
            <ChevronRight size={16} className="rtl:hidden" />
            <ChevronLeft size={16} className="hidden rtl:block" />
          </button>
          <span className="min-w-24 text-center text-sm font-medium">
            {viewedMonth.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button type="button" onClick={() => changeMonth(1)} className="flex h-8 w-8 items-center justify-center rounded-full">
            <ChevronLeft size={16} className="rtl:hidden" />
            <ChevronRight size={16} className="hidden rtl:block" />
          </button>
        </div>
      </div>

      <div className="rounded-[1.75rem] bg-surface p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
          {weekdayLabels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell) return <div key={i} />
            const dayTx = txByDay.get(cell.dateKey)
            const color = dayColor(dayTx)
            const isSelected = cell.dateKey === selectedDate
            const isToday = cell.dateKey === today()
            return (
              <button
                key={cell.dateKey}
                type="button"
                onClick={() => setSelectedDate(cell.dateKey)}
                className={cn(
                  'flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl text-sm',
                  isSelected && 'bg-ink text-bg',
                  !isSelected && isToday && 'font-bold',
                )}
              >
                <span>{cell.day}</span>
                {color && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-ink-soft">
          {selectedDateObj.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'long' })}
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
                  <span className="text-sm font-semibold tabular-nums">{formatAmount(tx.amount, currency, language)}</span>
                </div>
              )
            })}
            <div className="flex items-center justify-between rounded-2xl bg-ink px-4 py-3 text-bg">
              <span className="text-sm">{t('calendar.dayTotal')}</span>
              <span className="text-sm font-semibold tabular-nums">{formatAmount(selectedTotal, currency, language)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
