import type { PayPeriod } from './types'

/**
 * Counts consecutive completed weeks (most recent first) where actual spend
 * stayed within budget, across the active period and closed history. Stops
 * at the first over-budget week. In-progress weeks (endDate in the future)
 * are skipped, not counted as a break.
 */
export function computeWeeklyBudgetStreak(
  periods: PayPeriod[],
  activePeriodId: string | undefined,
  activeWeeklyActuals: number[],
  todayKey: string,
): number {
  let streak = 0

  const active = periods.find((p) => p.id === activePeriodId)
  if (active) {
    for (let i = active.weeks.length - 1; i >= 0; i--) {
      const week = active.weeks[i]
      if (week.endDate >= todayKey) continue
      const actual = activeWeeklyActuals[i] ?? 0
      if (actual <= week.budget) streak++
      else return streak
    }
  }

  const closedPeriods = periods.filter((p) => p.status === 'closed').sort((a, b) => (a.startDate < b.startDate ? 1 : -1))
  for (const period of closedPeriods) {
    const actuals = period.closedSummary?.weeklyActuals ?? []
    for (let i = period.weeks.length - 1; i >= 0; i--) {
      const actual = actuals[i] ?? 0
      const budget = period.weeks[i].budget
      if (actual <= budget) streak++
      else return streak
    }
  }

  return streak
}
