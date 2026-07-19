import { describe, expect, it } from 'vitest'
import { computeGoalProgress, computeSuggestedWeeklyContribution } from '../../src/domain/goals'

describe('computeGoalProgress', () => {
  it('computes percent complete and remaining', () => {
    const progress = computeGoalProgress({ targetAmount: 1000, currentAmount: 250 })
    expect(progress.pct).toBe(25)
    expect(progress.remaining).toBe(750)
    expect(progress.isAchieved).toBe(false)
  })

  it('clamps percent at 100 when overfunded', () => {
    const progress = computeGoalProgress({ targetAmount: 500, currentAmount: 900 })
    expect(progress.pct).toBe(100)
    expect(progress.remaining).toBe(0)
    expect(progress.isAchieved).toBe(true)
  })

  it('handles a zero target without dividing by zero', () => {
    const progress = computeGoalProgress({ targetAmount: 0, currentAmount: 0 })
    expect(progress.pct).toBe(0)
  })
})

describe('computeSuggestedWeeklyContribution', () => {
  it('returns null when there is no target date', () => {
    expect(computeSuggestedWeeklyContribution({ targetAmount: 1000, currentAmount: 0 }, '2026-01-01')).toBeNull()
  })

  it('returns null once the goal is already funded', () => {
    expect(
      computeSuggestedWeeklyContribution({ targetAmount: 500, currentAmount: 500, targetDate: '2026-06-01' }, '2026-01-01'),
    ).toBeNull()
  })

  it('returns null when the target date has already passed', () => {
    expect(
      computeSuggestedWeeklyContribution({ targetAmount: 500, currentAmount: 0, targetDate: '2025-01-01' }, '2026-01-01'),
    ).toBeNull()
  })

  it('divides the remaining amount evenly across the weeks left', () => {
    // 70 days left = 10 weeks
    const suggestion = computeSuggestedWeeklyContribution({ targetAmount: 1000, currentAmount: 0, targetDate: '2026-03-12' }, '2026-01-01')
    expect(suggestion).toBeCloseTo(100, 5)
  })
})
