import { diffInDays } from '../utils/date'

export interface SpendingForecast {
  daysElapsed: number
  daysTotal: number
  projectedTotal: number
  /** Positive when the projected total is expected to exceed the budget. */
  projectedOverBy: number
  onTrack: boolean
}

/**
 * Projects the period-end total by extrapolating today's daily spend pace
 * across the rest of the period. Returns null before the period has started
 * (nothing to extrapolate from yet).
 */
export function computeSpendingForecast(
  periodStart: string,
  periodEnd: string,
  todayKey: string,
  spentSoFar: number,
  budget: number,
): SpendingForecast | null {
  const daysTotal = diffInDays(periodStart, periodEnd) + 1
  const rawElapsed = diffInDays(periodStart, todayKey) + 1
  if (rawElapsed <= 0 || daysTotal <= 0) return null
  const daysElapsed = Math.min(rawElapsed, daysTotal)

  const pace = spentSoFar / daysElapsed
  const projectedTotal = pace * daysTotal
  const projectedOverBy = projectedTotal - budget

  return { daysElapsed, daysTotal, projectedTotal, projectedOverBy, onTrack: projectedOverBy <= 0 }
}

export interface CategoryTrendRow {
  key: string
  current: number
  previous: number
  deltaAmount: number
  /** null when there's no prior spend to compare against (can't compute a meaningful %). */
  deltaPct: number | null
}

/**
 * Compares per-category totals against the previous period, sorted by the
 * biggest increase first. Categories with no current-period spend are
 * dropped — this highlights where money is going now, not history.
 */
export function computeCategoryTrend(current: Record<string, number>, previous: Record<string, number>): CategoryTrendRow[] {
  const rows: CategoryTrendRow[] = []
  for (const [key, currentAmount] of Object.entries(current)) {
    if (currentAmount <= 0) continue
    const previousAmount = previous[key] ?? 0
    const deltaAmount = currentAmount - previousAmount
    const deltaPct = previousAmount > 0 ? Math.round((deltaAmount / previousAmount) * 100) : null
    rows.push({ key, current: currentAmount, previous: previousAmount, deltaAmount, deltaPct })
  }
  return rows.sort((a, b) => b.deltaAmount - a.deltaAmount)
}
