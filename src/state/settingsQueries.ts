import { useLiveQuery } from 'dexie-react-hooks'
import type { Category, Commitment, Debt, DebtPayment, Goal, GoalContribution, PayPeriod, Settings, SpendingItem, Transaction } from '../domain/types'
import { db } from '../db/db'

export type SettingsState = Settings | 'not-found' | 'loading'

export function useSettingsState(): SettingsState {
  return useLiveQuery(async () => (await db.settings.get('singleton')) ?? 'not-found', [], 'loading' as const)
}

export function useActivePeriod(): PayPeriod | undefined {
  return useLiveQuery(() => db.payPeriods.where('status').equals('active').first(), [])
}

export function useAllPeriods(): PayPeriod[] | undefined {
  return useLiveQuery(() => db.payPeriods.orderBy('startDate').reverse().toArray(), [])
}

export function useSpendingItems(includeArchived = false): SpendingItem[] | undefined {
  return useLiveQuery(async () => {
    const all = await db.spendingItems.toArray()
    const filtered = includeArchived ? all : all.filter((i) => !i.archived)
    return filtered.sort((a, b) => b.usageCount - a.usageCount || a.name.localeCompare(b.name))
  }, [includeArchived])
}

export function useCommitments(): Commitment[] | undefined {
  return useLiveQuery(async () => {
    const all = await db.commitments.toArray()
    return all.sort((a, b) => a.name.localeCompare(b.name))
  }, [])
}

export function useTransactionsForPeriod(periodId: string | undefined): Transaction[] | undefined {
  return useLiveQuery(async () => {
    if (!periodId) return []
    const rows = await db.transactions.where('periodId').equals(periodId).toArray()
    return rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt.localeCompare(a.createdAt)))
  }, [periodId])
}

export function useTransactionsInRange(startDate: string, endDate: string): Transaction[] | undefined {
  return useLiveQuery(
    () => db.transactions.where('date').between(startDate, endDate, true, true).toArray(),
    [startDate, endDate],
  )
}

export function useTransactionsForDate(dateKey: string): Transaction[] | undefined {
  return useLiveQuery(() => db.transactions.where('date').equals(dateKey).toArray(), [dateKey])
}

export function useTransaction(id: string | null): Transaction | undefined | null {
  return useLiveQuery(async () => {
    if (!id) return null
    return (await db.transactions.get(id)) ?? null
  }, [id])
}

export function useSpendingItem(id: string | undefined): SpendingItem | undefined | null {
  return useLiveQuery(async () => {
    if (!id) return null
    return (await db.spendingItems.get(id)) ?? null
  }, [id])
}

export function useRecentTransactions(limit = 8): Transaction[] | undefined {
  return useLiveQuery(async () => {
    const rows = await db.transactions.orderBy('date').reverse().limit(limit * 3).toArray()
    return rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, limit)
  }, [limit])
}

export function useCategories(includeArchived = false): Category[] | undefined {
  return useLiveQuery(async () => {
    const all = await db.categories.toArray()
    const filtered = includeArchived ? all : all.filter((c) => !c.archived)
    return filtered.sort((a, b) => a.name.localeCompare(b.name))
  }, [includeArchived])
}

export function useGoals(): Goal[] | undefined {
  return useLiveQuery(async () => {
    const all = await db.goals.toArray()
    return all.sort((a, b) => (a.status === b.status ? 0 : a.status === 'active' ? -1 : 1) || b.createdAt.localeCompare(a.createdAt))
  }, [])
}

export function useGoalContributions(goalId: string | undefined): GoalContribution[] | undefined {
  return useLiveQuery(async () => {
    if (!goalId) return []
    const rows = await db.goalContributions.where('goalId').equals(goalId).toArray()
    return rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt.localeCompare(a.createdAt)))
  }, [goalId])
}

export function useDebts(): Debt[] | undefined {
  return useLiveQuery(async () => {
    const all = await db.debts.toArray()
    return all.sort((a, b) => (a.status === b.status ? 0 : a.status === 'active' ? -1 : 1) || b.createdAt.localeCompare(a.createdAt))
  }, [])
}

export function useDebtPayments(debtId: string | undefined): DebtPayment[] | undefined {
  return useLiveQuery(async () => {
    if (!debtId) return []
    const rows = await db.debtPayments.where('debtId').equals(debtId).toArray()
    return rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt.localeCompare(a.createdAt)))
  }, [debtId])
}
