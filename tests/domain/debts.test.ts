import { describe, expect, it } from 'vitest'
import { computeDebtTotals, upcomingDebts } from '../../src/domain/debts'

describe('computeDebtTotals', () => {
  it('sums remaining amounts by direction, ignoring settled debts', () => {
    const totals = computeDebtTotals([
      { type: 'owed_to_me', remainingAmount: 300, status: 'active' },
      { type: 'owed_to_me', remainingAmount: 200, status: 'active' },
      { type: 'owed_by_me', remainingAmount: 150, status: 'active' },
      { type: 'owed_by_me', remainingAmount: 999, status: 'settled' },
    ])
    expect(totals.totalOwedToMe).toBe(500)
    expect(totals.totalOwedByMe).toBe(150)
    expect(totals.netPosition).toBe(350)
  })

  it('returns zeros when there are no active debts', () => {
    expect(computeDebtTotals([])).toEqual({ totalOwedToMe: 0, totalOwedByMe: 0, netPosition: 0 })
  })
})

describe('upcomingDebts', () => {
  const debts = [
    { id: 'a', status: 'active' as const, dueDate: '2026-01-10' },
    { id: 'b', status: 'active' as const, dueDate: '2026-01-05' },
    { id: 'c', status: 'active' as const, dueDate: '2026-02-01' },
    { id: 'd', status: 'settled' as const, dueDate: '2026-01-06' },
    { id: 'e', status: 'active' as const, dueDate: undefined },
  ]

  it('keeps only active debts due within the horizon, soonest first', () => {
    const result = upcomingDebts(debts, '2026-01-01', '2026-01-12')
    expect(result.map((d) => d.id)).toEqual(['b', 'a'])
  })

  it('excludes debts without a due date', () => {
    const result = upcomingDebts(debts, '2026-01-01', '2026-12-31')
    expect(result.some((d) => d.id === 'e')).toBe(false)
  })
})
