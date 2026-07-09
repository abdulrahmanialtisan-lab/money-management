import { addDays, compareDateKeys, diffInDays, fromDateKey } from '../utils/date'
import type { PayPeriodWeek } from './types'

/**
 * Chunk a period into weekStartDay-aligned 7-day windows. The first and/or
 * last chunk may be shorter than 7 days when the period doesn't start/end
 * exactly on the configured week-start weekday (e.g. payday on the 25th).
 */
export function buildWeeks(
  periodStart: string,
  periodEnd: string,
  weekStartDay: number,
): Array<Omit<PayPeriodWeek, 'budget'>> {
  const weeks: Array<Omit<PayPeriodWeek, 'budget'>> = []
  let cursor = periodStart
  let index = 0

  while (compareDateKeys(cursor, periodEnd) <= 0) {
    const cursorDow = fromDateKey(cursor).getDay()
    let chunkEnd: string
    if (cursorDow === weekStartDay) {
      chunkEnd = addDays(cursor, 6)
    } else {
      const daysUntilBoundary = (weekStartDay - cursorDow + 7) % 7
      chunkEnd = addDays(cursor, daysUntilBoundary - 1)
    }
    if (compareDateKeys(chunkEnd, periodEnd) > 0) chunkEnd = periodEnd

    const daysInWeek = diffInDays(cursor, chunkEnd) + 1
    weeks.push({ index, startDate: cursor, endDate: chunkEnd, daysInWeek })
    cursor = addDays(chunkEnd, 1)
    index++
  }

  return weeks
}

/**
 * Split `leftover` proportionally across weeks by `daysInWeek`, using the
 * largest-remainder method so the allocations always sum exactly to
 * `leftover` (no rounding drift from naive division).
 */
export function allocateWeeklyBudgets(weeks: Array<{ daysInWeek: number }>, leftover: number): number[] {
  const totalDays = weeks.reduce((sum, w) => sum + w.daysInWeek, 0)
  if (totalDays === 0 || leftover <= 0) return weeks.map(() => 0)

  const totalCents = Math.round(leftover * 100)
  const rawShares = weeks.map((w) => (totalCents * w.daysInWeek) / totalDays)
  const floors = rawShares.map(Math.floor)
  const allocatedCents = floors.reduce((a, b) => a + b, 0)
  let remainder = totalCents - allocatedCents

  const byFractionDesc = rawShares
    .map((share, i) => ({ i, frac: share - floors[i] }))
    .sort((a, b) => b.frac - a.frac)

  const resultCents = [...floors]
  for (let k = 0; k < remainder && byFractionDesc.length > 0; k++) {
    resultCents[byFractionDesc[k % byFractionDesc.length].i] += 1
  }

  return resultCents.map((cents) => cents / 100)
}

export function computeWeeks(
  periodStart: string,
  periodEnd: string,
  weekStartDay: number,
  leftover: number,
): PayPeriodWeek[] {
  const shell = buildWeeks(periodStart, periodEnd, weekStartDay)
  const budgets = allocateWeeklyBudgets(shell, leftover)
  return shell.map((w, i) => ({ ...w, budget: budgets[i] }))
}

/**
 * Carries each week's unused (or overspent) amount into the next week, so an
 * under-spent week grows the following week's available budget, and an
 * overspent week tightens it. The running total across the period is
 * unchanged — this only redistributes when the money becomes available.
 */
export function computeRolledOverBudgets(weeks: Array<{ budget: number }>, actuals: number[]): number[] {
  const effective: number[] = []
  let carry = 0
  for (let i = 0; i < weeks.length; i++) {
    const available = Math.round((weeks[i].budget + carry) * 100) / 100
    effective.push(available)
    carry = available - (actuals[i] ?? 0)
  }
  return effective
}
