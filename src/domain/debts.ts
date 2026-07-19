import type { Debt } from './types'

export interface DebtTotals {
  totalOwedToMe: number
  totalOwedByMe: number
  netPosition: number
}

export function computeDebtTotals(debts: Pick<Debt, 'type' | 'remainingAmount' | 'status'>[]): DebtTotals {
  let totalOwedToMe = 0
  let totalOwedByMe = 0
  for (const d of debts) {
    if (d.status !== 'active') continue
    if (d.type === 'owed_to_me') totalOwedToMe += d.remainingAmount
    else totalOwedByMe += d.remainingAmount
  }
  return { totalOwedToMe, totalOwedByMe, netPosition: totalOwedToMe - totalOwedByMe }
}

/** Active debts whose due date falls within [todayKey, horizonKey], soonest first. */
export function upcomingDebts<T extends Pick<Debt, 'status' | 'dueDate'>>(debts: T[], todayKey: string, horizonKey: string): T[] {
  return debts
    .filter((d) => d.status === 'active' && d.dueDate && d.dueDate >= todayKey && d.dueDate <= horizonKey)
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : a.dueDate! > b.dueDate! ? 1 : 0))
}
