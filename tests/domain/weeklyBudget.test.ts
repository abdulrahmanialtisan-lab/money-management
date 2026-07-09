import { describe, expect, it } from 'vitest'
import { allocateWeeklyBudgets, buildWeeks, computeRolledOverBudgets, computeWeeks } from '../../src/domain/weeklyBudget'

describe('buildWeeks', () => {
  it('produces a single partial first week and partial last week when period does not align to week start', () => {
    // 2026-01-25 is a Sunday; week starts on Saturday (6)
    const weeks = buildWeeks('2026-01-25', '2026-02-24', 6)
    expect(weeks[0].startDate).toBe('2026-01-25')
    expect(weeks[0].daysInWeek).toBeLessThan(7)
    const totalDays = weeks.reduce((s, w) => s + w.daysInWeek, 0)
    expect(totalDays).toBe(31) // Jan 25 -> Feb 24 inclusive = 31 days
    expect(weeks[weeks.length - 1].endDate).toBe('2026-02-24')
  })

  it('produces all full 7-day weeks when the period is an exact multiple aligned to week start', () => {
    // 2026-03-07 is a Saturday
    const weeks = buildWeeks('2026-03-07', '2026-03-27', 6) // 21 days = 3 weeks
    expect(weeks).toHaveLength(3)
    for (const w of weeks) expect(w.daysInWeek).toBe(7)
  })
})

describe('allocateWeeklyBudgets', () => {
  it('sums exactly to leftover with no rounding drift', () => {
    const weeks = [{ daysInWeek: 6 }, { daysInWeek: 7 }, { daysInWeek: 7 }, { daysInWeek: 7 }, { daysInWeek: 4 }]
    const leftover = 1000
    const budgets = allocateWeeklyBudgets(weeks, leftover)
    const sum = budgets.reduce((a, b) => a + b, 0)
    expect(Math.round(sum * 100) / 100).toBe(leftover)
  })

  it('returns zeros when leftover is zero or negative', () => {
    const weeks = [{ daysInWeek: 7 }, { daysInWeek: 7 }]
    expect(allocateWeeklyBudgets(weeks, 0)).toEqual([0, 0])
  })

  it('handles a leftover that does not divide evenly across days', () => {
    const weeks = [{ daysInWeek: 3 }, { daysInWeek: 3 }, { daysInWeek: 3 }]
    const budgets = allocateWeeklyBudgets(weeks, 100)
    const sum = budgets.reduce((a, b) => a + b, 0)
    expect(Math.round(sum * 100) / 100).toBe(100)
  })
})

describe('computeRolledOverBudgets', () => {
  it('carries an unspent surplus into the next week', () => {
    const weeks = [{ budget: 500 }, { budget: 500 }]
    const actuals = [300, 0]
    const effective = computeRolledOverBudgets(weeks, actuals)
    expect(effective[0]).toBe(500)
    expect(effective[1]).toBe(700) // 500 + (500-300) leftover from week 1
  })

  it('tightens the next week after overspending', () => {
    const weeks = [{ budget: 500 }, { budget: 500 }]
    const actuals = [650, 0]
    const effective = computeRolledOverBudgets(weeks, actuals)
    expect(effective[1]).toBe(350) // 500 - 150 overspend from week 1
  })

  it('cascades a surplus across multiple untouched future weeks', () => {
    const weeks = [{ budget: 200 }, { budget: 200 }, { budget: 200 }]
    const actuals = [0, 0, 0]
    const effective = computeRolledOverBudgets(weeks, actuals)
    expect(effective).toEqual([200, 400, 600])
  })

  it('is a no-op when every week is spent exactly to budget', () => {
    const weeks = [{ budget: 300 }, { budget: 300 }, { budget: 300 }]
    const actuals = [300, 300, 300]
    expect(computeRolledOverBudgets(weeks, actuals)).toEqual([300, 300, 300])
  })
})

describe('computeWeeks', () => {
  it('combines shell + allocation and preserves day-proportionality', () => {
    const weeks = computeWeeks('2026-01-25', '2026-02-24', 6, 930)
    const sum = weeks.reduce((a, w) => a + w.budget, 0)
    expect(Math.round(sum * 100) / 100).toBe(930)
    // longer weeks should never get a smaller budget than shorter weeks
    const sorted = [...weeks].sort((a, b) => a.daysInWeek - b.daysInWeek)
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].budget).toBeGreaterThanOrEqual(sorted[i - 1].budget)
    }
  })
})
