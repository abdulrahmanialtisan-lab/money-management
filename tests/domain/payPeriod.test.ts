import { describe, expect, it } from 'vitest'
import {
  computeExpectedPeriodStart,
  generatePeriodStartsBetween,
  nextPeriodStart,
  periodEndFor,
} from '../../src/domain/payPeriod'

describe('computeExpectedPeriodStart', () => {
  it('returns this month payday when today is on/after it', () => {
    expect(computeExpectedPeriodStart('2026-07-09', 5)).toBe('2026-07-05')
    expect(computeExpectedPeriodStart('2026-07-05', 5)).toBe('2026-07-05')
  })

  it('rolls back to previous month payday when today is before this month payday', () => {
    expect(computeExpectedPeriodStart('2026-07-03', 25)).toBe('2026-06-25')
  })

  it('clamps payday=31 to the last day of short months', () => {
    // April has 30 days
    expect(computeExpectedPeriodStart('2026-04-30', 31)).toBe('2026-04-30')
    expect(computeExpectedPeriodStart('2026-04-15', 31)).toBe('2026-03-31')
  })

  it('handles February clamping in a non-leap year', () => {
    expect(computeExpectedPeriodStart('2026-02-20', 31)).toBe('2026-01-31')
    expect(computeExpectedPeriodStart('2026-03-01', 31)).toBe('2026-02-28')
  })
})

describe('nextPeriodStart / periodEndFor', () => {
  it('advances exactly one month, clamped', () => {
    expect(nextPeriodStart('2026-01-31', 31)).toBe('2026-02-28')
    expect(nextPeriodStart('2026-07-05', 5)).toBe('2026-08-05')
  })

  it('period end is the day before the next payday', () => {
    expect(periodEndFor('2026-07-05', 5)).toBe('2026-08-04')
    expect(periodEndFor('2026-01-31', 31)).toBe('2026-02-27')
  })
})

describe('generatePeriodStartsBetween', () => {
  it('returns a single start when there is no prior period', () => {
    expect(generatePeriodStartsBetween(null, '2026-07-05', 5)).toEqual(['2026-07-05'])
  })

  it('returns empty when already up to date', () => {
    expect(generatePeriodStartsBetween('2026-07-05', '2026-07-05', 5)).toEqual([])
  })

  it('catches up multiple missed paydays in one pass', () => {
    expect(generatePeriodStartsBetween('2026-05-05', '2026-08-05', 5)).toEqual([
      '2026-06-05',
      '2026-07-05',
      '2026-08-05',
    ])
  })
})
