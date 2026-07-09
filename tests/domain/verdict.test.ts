import { describe, expect, it } from 'vitest'
import { computeVerdict, comparePeriods } from '../../src/domain/verdict'

describe('computeVerdict', () => {
  it('is green when important spending meets the target ratio', () => {
    const result = computeVerdict(
      [
        { importanceSnapshot: 'important', amount: 80 },
        { importanceSnapshot: 'not_important', amount: 20 },
      ],
      50,
    )
    expect(result.importantPct).toBe(80)
    expect(result.color).toBe('green')
  })

  it('is red when unimportant spending dominates', () => {
    const result = computeVerdict(
      [
        { importanceSnapshot: 'important', amount: 20 },
        { importanceSnapshot: 'not_important', amount: 80 },
      ],
      50,
    )
    expect(result.importantPct).toBe(20)
    expect(result.color).toBe('red')
  })

  it('excludes unclassified from the ratio but includes it in totalSpent', () => {
    const result = computeVerdict(
      [
        { importanceSnapshot: 'important', amount: 50 },
        { importanceSnapshot: 'not_important', amount: 50 },
        { importanceSnapshot: 'unclassified', amount: 100 },
      ],
      50,
    )
    expect(result.importantPct).toBe(50)
    expect(result.totalSpent).toBe(200)
    expect(result.unclassifiedSpent).toBe(100)
  })

  it('is neutral with null pct when nothing is classified', () => {
    const result = computeVerdict([{ importanceSnapshot: 'unclassified', amount: 30 }], 50)
    expect(result.importantPct).toBeNull()
    expect(result.color).toBe('neutral')
  })
})

describe('comparePeriods', () => {
  it('returns null when either period has no verdict', () => {
    expect(comparePeriods(null, 40)).toBeNull()
    expect(comparePeriods(60, null)).toBeNull()
  })

  it('reports the absolute delta and direction', () => {
    expect(comparePeriods(70, 55)).toEqual({ deltaPct: 15, direction: 'up' })
    expect(comparePeriods(40, 55)).toEqual({ deltaPct: 15, direction: 'down' })
    expect(comparePeriods(55, 55)).toEqual({ deltaPct: 0, direction: 'flat' })
  })
})
