import { describe, expect, it } from 'vitest'
import { computeCategoryTrend, computeSpendingForecast } from '../../src/domain/insights'

describe('computeSpendingForecast', () => {
  it('returns null before the period has started', () => {
    expect(computeSpendingForecast('2026-02-01', '2026-02-28', '2026-01-31', 0, 1000)).toBeNull()
  })

  it('projects the period-end total from the pace so far', () => {
    // 10 days elapsed of a 20-day period, 500 spent so far -> pace 50/day -> projected 1000
    const forecast = computeSpendingForecast('2026-01-01', '2026-01-20', '2026-01-10', 500, 900)
    expect(forecast).not.toBeNull()
    expect(forecast!.daysElapsed).toBe(10)
    expect(forecast!.daysTotal).toBe(20)
    expect(forecast!.projectedTotal).toBe(1000)
    expect(forecast!.projectedOverBy).toBe(100)
    expect(forecast!.onTrack).toBe(false)
  })

  it('flags on-track when the projection stays under budget', () => {
    const forecast = computeSpendingForecast('2026-01-01', '2026-01-20', '2026-01-10', 200, 900)
    expect(forecast!.onTrack).toBe(true)
    expect(forecast!.projectedOverBy).toBeLessThanOrEqual(0)
  })

  it('clamps elapsed days at the period length once the period has ended', () => {
    const forecast = computeSpendingForecast('2026-01-01', '2026-01-10', '2026-02-01', 500, 900)
    expect(forecast!.daysElapsed).toBe(forecast!.daysTotal)
  })
})

describe('computeCategoryTrend', () => {
  it('sorts by the biggest absolute increase first', () => {
    const rows = computeCategoryTrend({ food: 300, transport: 100, shopping: 50 }, { food: 200, transport: 150, shopping: 0 })
    expect(rows.map((r) => r.key)).toEqual(['food', 'shopping', 'transport'])
  })

  it('reports a null deltaPct when there was no prior spend', () => {
    const rows = computeCategoryTrend({ food: 100 }, {})
    expect(rows[0].deltaPct).toBeNull()
    expect(rows[0].deltaAmount).toBe(100)
  })

  it('drops categories with no current-period spend', () => {
    const rows = computeCategoryTrend({ food: 0 }, { food: 200 })
    expect(rows).toHaveLength(0)
  })
})
