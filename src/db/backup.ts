import { z } from 'zod'
import type { Category, Commitment, Debt, DebtPayment, Goal, GoalContribution, PayPeriod, Settings, SpendingItem, Transaction } from '../domain/types'
import { db, SCHEMA_VERSION } from './db'

export interface BackupPayload {
  schemaVersion: number
  exportedAt: string
  settings: Settings | null
  commitments: Commitment[]
  spendingItems: SpendingItem[]
  transactions: Transaction[]
  payPeriods: PayPeriod[]
  categories: Category[]
  goals: Goal[]
  goalContributions: GoalContribution[]
  debts: Debt[]
  debtPayments: DebtPayment[]
}

const backupSchema = z.object({
  schemaVersion: z.number(),
  exportedAt: z.string(),
  settings: z.record(z.string(), z.unknown()).nullable(),
  commitments: z.array(z.record(z.string(), z.unknown())),
  spendingItems: z.array(z.record(z.string(), z.unknown())),
  transactions: z.array(z.record(z.string(), z.unknown())),
  payPeriods: z.array(z.record(z.string(), z.unknown())),
  categories: z.array(z.record(z.string(), z.unknown())).optional(),
  goals: z.array(z.record(z.string(), z.unknown())).optional(),
  goalContributions: z.array(z.record(z.string(), z.unknown())).optional(),
  debts: z.array(z.record(z.string(), z.unknown())).optional(),
  debtPayments: z.array(z.record(z.string(), z.unknown())).optional(),
})

export async function exportAllData(): Promise<string> {
  const [settingsRows, commitments, spendingItems, transactions, payPeriods, categories, goals, goalContributions, debts, debtPayments] =
    await Promise.all([
      db.settings.toArray(),
      db.commitments.toArray(),
      db.spendingItems.toArray(),
      db.transactions.toArray(),
      db.payPeriods.toArray(),
      db.categories.toArray(),
      db.goals.toArray(),
      db.goalContributions.toArray(),
      db.debts.toArray(),
      db.debtPayments.toArray(),
    ])

  const payload: BackupPayload = {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    settings: settingsRows[0] ?? null,
    commitments,
    spendingItems,
    transactions,
    payPeriods,
    categories,
    goals,
    goalContributions,
    debts,
    debtPayments,
  }
  return JSON.stringify(payload, null, 2)
}

const ALL_TABLES = [
  db.settings,
  db.commitments,
  db.spendingItems,
  db.transactions,
  db.payPeriods,
  db.categories,
  db.goals,
  db.goalContributions,
  db.debts,
  db.debtPayments,
]

export async function importAllData(json: string): Promise<void> {
  const parsed = backupSchema.parse(JSON.parse(json))

  await db.transaction('rw', ALL_TABLES, async () => {
    await Promise.all(ALL_TABLES.map((table) => table.clear()))
    if (parsed.settings) await db.settings.put(parsed.settings as unknown as Settings)
    if (parsed.commitments.length) await db.commitments.bulkAdd(parsed.commitments as unknown as Commitment[])
    if (parsed.spendingItems.length) await db.spendingItems.bulkAdd(parsed.spendingItems as unknown as SpendingItem[])
    if (parsed.transactions.length) await db.transactions.bulkAdd(parsed.transactions as unknown as Transaction[])
    if (parsed.payPeriods.length) await db.payPeriods.bulkAdd(parsed.payPeriods as unknown as PayPeriod[])
    if (parsed.categories?.length) await db.categories.bulkAdd(parsed.categories as unknown as Category[])
    if (parsed.goals?.length) await db.goals.bulkAdd(parsed.goals as unknown as Goal[])
    if (parsed.goalContributions?.length) await db.goalContributions.bulkAdd(parsed.goalContributions as unknown as GoalContribution[])
    if (parsed.debts?.length) await db.debts.bulkAdd(parsed.debts as unknown as Debt[])
    if (parsed.debtPayments?.length) await db.debtPayments.bulkAdd(parsed.debtPayments as unknown as DebtPayment[])
  })
}

export async function resetAllData(): Promise<void> {
  await db.transaction('rw', ALL_TABLES, async () => {
    await Promise.all(ALL_TABLES.map((table) => table.clear()))
  })
}

export function downloadBackupFile(json: string, filename?: string): void {
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename ?? `payday-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}
