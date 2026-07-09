import { useLiveQuery } from 'dexie-react-hooks'
import type { Commitment, PayPeriod, Settings, SpendingItem, Transaction } from '../domain/types'
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

export function useRecentTransactions(limit = 8): Transaction[] | undefined {
  return useLiveQuery(async () => {
    const rows = await db.transactions.orderBy('date').reverse().limit(limit * 3).toArray()
    return rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, limit)
  }, [limit])
}
